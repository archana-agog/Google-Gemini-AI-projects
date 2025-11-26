

import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, TranscriptionMessage, VolumeLevel, GroundingMetadata } from '../types';
import { 
  MODEL_NAME, 
  SYSTEM_INSTRUCTION, 
  AUDIO_SAMPLE_RATE_INPUT, 
  AUDIO_SAMPLE_RATE_OUTPUT 
} from '../constants';
import { createPcmBlob, decodeBase64, pcmToAudioBuffer } from '../utils/audioUtils';

export const useLiveApi = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [transcripts, setTranscripts] = useState<TranscriptionMessage[]>([]);
  const [volume, setVolume] = useState<VolumeLevel>({ input: 0, output: 0 });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const currentInputTransRef = useRef<string>('');
  const currentOutputTransRef = useRef<string>('');
  const currentGroundingRef = useRef<GroundingMetadata | null>(null);
  const analyserInputRef = useRef<AnalyserNode | null>(null);
  const analyserOutputRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Analyze volume for animation
  const updateVolume = () => {
    let inputVol = 0;
    let outputVol = 0;

    if (analyserInputRef.current) {
      const dataArray = new Uint8Array(analyserInputRef.current.frequencyBinCount);
      analyserInputRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
      inputVol = avg / 255; // Normalize 0-1
    }

    if (analyserOutputRef.current) {
      const dataArray = new Uint8Array(analyserOutputRef.current.frequencyBinCount);
      analyserOutputRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
      outputVol = avg / 255; // Normalize 0-1
    }

    setVolume({ input: inputVol, output: outputVol });
    animationFrameRef.current = requestAnimationFrame(updateVolume);
  };

  const connect = useCallback(async () => {
    if (connectionState === ConnectionState.CONNECTED || connectionState === ConnectionState.CONNECTING) return;

    setConnectionState(ConnectionState.CONNECTING);
    setTranscripts([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: AUDIO_SAMPLE_RATE_INPUT,
      });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: AUDIO_SAMPLE_RATE_OUTPUT,
      });

      // Volume Analyzers
      analyserInputRef.current = audioContextRef.current.createAnalyser();
      analyserInputRef.current.fftSize = 256;
      analyserOutputRef.current = outputContextRef.current.createAnalyser();
      analyserOutputRef.current.fftSize = 256;

      // Start volume loop
      updateVolume();

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Connect to Gemini Live
      sessionPromiseRef.current = ai.live.connect({
        model: MODEL_NAME,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } 
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setConnectionState(ConnectionState.CONNECTED);
            
            // Setup Microphone Stream
            if (!audioContextRef.current || !streamRef.current || !analyserInputRef.current) return;
            
            const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
            inputSourceRef.current = source;
            
            // Connect source to analyser for visualization
            source.connect(analyserInputRef.current);

            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcriptions
            if (message.serverContent?.outputTranscription?.text) {
              const text = message.serverContent.outputTranscription.text;
              currentOutputTransRef.current += text;
            }
            if (message.serverContent?.inputTranscription?.text) {
              const text = message.serverContent.inputTranscription.text;
              currentInputTransRef.current += text;
            }
            
            // Capture Grounding Metadata (Sources)
            if (message.serverContent?.groundingMetadata) {
                currentGroundingRef.current = message.serverContent.groundingMetadata;
            }

            if (message.serverContent?.turnComplete) {
              const userText = currentInputTransRef.current;
              const modelText = currentOutputTransRef.current;
              const groundingInfo = currentGroundingRef.current;

              if (userText || modelText) {
                setTranscripts(prev => [
                  ...prev, 
                  { 
                    id: Date.now().toString(), 
                    sender: 'user', 
                    text: userText, 
                    isComplete: true, 
                    timestamp: new Date() 
                  },
                  { 
                    id: (Date.now() + 1).toString(), 
                    sender: 'model', 
                    text: modelText, 
                    isComplete: true, 
                    timestamp: new Date(),
                    groundingMetadata: groundingInfo 
                  }
                ]);
              }
              currentInputTransRef.current = '';
              currentOutputTransRef.current = '';
              currentGroundingRef.current = null;
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputContextRef.current && analyserOutputRef.current) {
              const ctx = outputContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              try {
                const audioBuffer = await pcmToAudioBuffer(
                  decodeBase64(base64Audio),
                  ctx,
                  AUDIO_SAMPLE_RATE_OUTPUT
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(analyserOutputRef.current); // Connect to analyser
                analyserOutputRef.current.connect(ctx.destination); // Connect analyser to speakers
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                
                source.onended = () => {
                  audioSourcesRef.current.delete(source);
                };
                audioSourcesRef.current.add(source);
              } catch (err) {
                console.error("Error decoding audio", err);
              }
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
               audioSourcesRef.current.forEach(src => {
                 try { src.stop(); } catch(e) {}
               });
               audioSourcesRef.current.clear();
               nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setConnectionState(ConnectionState.DISCONNECTED);
          },
          onerror: (err) => {
            console.error(err);
            setConnectionState(ConnectionState.ERROR);
          }
        }
      });

    } catch (e) {
      console.error(e);
      setConnectionState(ConnectionState.ERROR);
    }
  }, [connectionState]);

  const disconnect = useCallback(async () => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      // Close session if supported or leave context clean up
    }
    
    // Stop Microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Stop Audio Processing
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }

    // Stop Output
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop Animation Loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setConnectionState(ConnectionState.DISCONNECTED);
    setVolume({ input: 0, output: 0 });
  }, []);

  return {
    connect,
    disconnect,
    connectionState,
    volume,
    transcripts
  };
};
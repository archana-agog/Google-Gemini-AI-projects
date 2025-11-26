
import React, { useEffect, useRef, useState } from 'react';
import { useLiveApi } from './hooks/useLiveApi';
import { ConnectionState, TranscriptionMessage } from './types';
import { 
  MicrophoneIcon, 
  StopIcon, 
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  ShoppingBagIcon,
  PlayCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/solid';

const Avatar = ({ volume, state }: { volume: { input: number, output: number }, state: ConnectionState }) => {
  // Use output volume for mouth opening
  const mouthOpen = Math.min(1, Math.max(0, volume.output * 3)); 
  const isListening = volume.input > 0.05;
  const isSpeaking = volume.output > 0.05;
  
  // Eye animation logic
  const [blink, setBlink] = useState(false);
  
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000 + Math.random() * 2000); // Random blinking
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Container for Head */}
      <div className={`relative w-44 h-52 bg-[#e0bba1] rounded-[2.5rem] shadow-xl transition-transform duration-500 ease-in-out ${isListening ? 'scale-105' : 'scale-100'} z-10 overflow-hidden border-b-4 border-black/5`}>
        
        {/* Hair - Silver, Neat, Side Parted */}
        <div className="absolute top-0 left-0 w-full h-20 bg-gray-200 rounded-t-[2.5rem] z-20 overflow-hidden">
           {/* Hair strands/texture */}
           <div className="absolute bottom-0 right-8 w-10 h-8 bg-[#e0bba1] rounded-tr-xl"></div>
           <div className="absolute bottom-2 left-2 w-full h-1 bg-gray-300 opacity-20 rotate-3"></div>
        </div>

        {/* Forehead Lines (Wisdom/Age) */}
        <div className="absolute top-24 w-full flex flex-col items-center space-y-1 opacity-20">
          <div className="w-24 h-[1px] bg-amber-900"></div>
          <div className="w-16 h-[1px] bg-amber-900"></div>
        </div>

        {/* Eyebrows (Grey, dignified) */}
        <div className="absolute top-28 w-full flex justify-center space-x-6 z-20">
          <div className={`w-10 h-1.5 bg-gray-400 rounded-full transition-transform duration-300 ${isListening ? '-translate-y-1' : ''}`}></div>
          <div className={`w-10 h-1.5 bg-gray-400 rounded-full transition-transform duration-300 ${isListening ? '-translate-y-1' : ''}`}></div>
        </div>

        {/* Glasses (Rimless / Thin Metal) */}
        <div className="absolute top-[7.5rem] w-full flex justify-center space-x-2 z-30 pointer-events-none">
          <div className="w-14 h-9 border-2 border-gray-400 rounded-lg bg-white/10 backdrop-blur-[1px] shadow-sm"></div>
          <div className="w-4 h-1 border-t-2 border-gray-400 mt-4"></div>
          <div className="w-14 h-9 border-2 border-gray-400 rounded-lg bg-white/10 backdrop-blur-[1px] shadow-sm"></div>
        </div>

        {/* Eyes Container */}
        <div className="absolute top-32 w-full flex justify-center space-x-6 z-20">
          {/* Left Eye */}
          <div className={`relative w-9 h-4 bg-white rounded-full overflow-hidden shadow-inner transition-all duration-100 ${blink ? 'scale-y-10' : 'scale-y-100'}`}>
            <div className={`absolute top-0.5 left-2 w-4 h-4 bg-[#3d2b1f] rounded-full transition-transform duration-300 ${isListening ? 'translate-x-1' : ''}`}>
               <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
            </div>
          </div>
          {/* Right Eye */}
          <div className={`relative w-9 h-4 bg-white rounded-full overflow-hidden shadow-inner transition-all duration-100 ${blink ? 'scale-y-10' : 'scale-y-100'}`}>
            <div className={`absolute top-0.5 left-2 w-4 h-4 bg-[#3d2b1f] rounded-full transition-transform duration-300 ${isListening ? 'translate-x-1' : ''}`}>
               <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full opacity-70"></div>
            </div>
          </div>
        </div>

        {/* Nose (Subtle) */}
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-4 h-6 border-l-2 border-b-2 border-black/10 rounded-bl-lg opacity-60 z-10"></div>

        {/* Smile Lines (Nasolabial folds) */}
        <div className="absolute top-44 left-10 w-4 h-8 border-l border-black/10 rounded-[50%] opacity-40 -rotate-12"></div>
        <div className="absolute top-44 right-10 w-4 h-8 border-r border-black/10 rounded-[50%] opacity-40 rotate-12"></div>

        {/* Mouth */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
          {/* Speaking Mouth */}
          <div 
            className="bg-[#94584d] rounded-full transition-all duration-75 ease-linear overflow-hidden shadow-inner"
            style={{ 
              width: isSpeaking ? `${30 + mouthOpen * 10}px` : '34px', 
              height: isSpeaking ? `${4 + mouthOpen * 10}px` : '2px',
              borderRadius: isSpeaking ? '40%' : '2px' 
            }}
          >
             {isSpeaking && <div className="w-full h-1 bg-white/20 absolute top-0 left-0"></div>}
          </div>
        </div>
      </div>

      {/* Neck */}
      <div className="absolute bottom-6 w-18 h-12 bg-[#e0bba1] z-0 rounded-b-lg shadow-inner"></div>
      
      {/* Shoulders / Suit */}
      <div className="absolute -bottom-10 w-72 h-36 bg-slate-900 rounded-[4rem] z-0 flex justify-center overflow-hidden shadow-2xl">
         {/* Suit Lapels */}
         <div className="absolute top-0 w-full h-full">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[60px] border-t-white z-10"></div>
            {/* Tie */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-8 h-32 bg-sky-700 z-10 rounded-b-lg">
                <div className="w-full h-full opacity-20 bg-[radial-gradient(circle,_#ffffff_1px,_transparent_1px)] bg-[length:4px_4px]"></div>
            </div>
            {/* Jacket opening */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-slate-800 skew-x-12 origin-bottom-right shadow-lg"></div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800 -skew-x-12 origin-bottom-left shadow-lg"></div>
         </div>
      </div>

      {/* Status Badge */}
       {state === ConnectionState.CONNECTED && (
        <div className={`absolute -right-4 bottom-16 w-5 h-5 rounded-full border-2 border-white z-40 ${isSpeaking ? 'bg-emerald-500 animate-pulse' : (isListening ? 'bg-blue-500' : 'bg-slate-400')}`}></div>
       )}
    </div>
  );
};

const TranscriptMessage: React.FC<{ message: TranscriptionMessage }> = ({ message }) => {
  const hasSources = message.groundingMetadata?.groundingChunks && message.groundingMetadata.groundingChunks.length > 0;

  return (
    <div className={`flex flex-col w-full ${message.sender === 'user' ? 'items-end' : 'items-start'} mb-4 animate-fade-in`}>
      <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
        message.sender === 'user' 
          ? 'bg-slate-800 text-white rounded-tr-sm shadow-md' 
          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm font-medium'
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
      </div>

      {/* Render Sources if available */}
      {hasSources && (
        <div className="mt-2 max-w-[85%] flex flex-wrap gap-2 text-xs">
          <span className="text-slate-500 flex items-center gap-1 font-semibold">
            <GlobeAltIcon className="w-3 h-3" /> Sources:
          </span>
          {message.groundingMetadata?.groundingChunks.map((chunk, idx) => {
            if (chunk.web?.uri) {
               const isYoutube = chunk.web.uri.includes('youtube.com') || chunk.web.uri.includes('youtu.be');
               const title = chunk.web.title || new URL(chunk.web.uri).hostname;
               
               return (
                 <a 
                    key={idx} 
                    href={chunk.web.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded border transition-colors truncate max-w-[200px]
                      ${isYoutube 
                        ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100' 
                        : 'bg-slate-50 text-sky-700 border-slate-200 hover:bg-slate-100'}
                    `}
                 >
                   {isYoutube ? <PlayCircleIcon className="w-3 h-3 flex-shrink-0" /> : <DocumentTextIcon className="w-3 h-3 flex-shrink-0" />}
                   <span className="truncate">{title}</span>
                 </a>
               );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const { connect, disconnect, connectionState, volume, transcripts } = useLiveApi();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const toggleConnection = () => {
    if (connectionState === ConnectionState.CONNECTED || connectionState === ConnectionState.CONNECTING) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-6 px-4 relative overflow-hidden font-sans text-slate-900">
      
      {/* Background decoration - Elegant & Subtle */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <header className="z-10 text-center mb-6">
        <h1 className="text-3xl font-serif font-bold text-slate-800 flex items-center justify-center gap-2 tracking-wide">
          <span className="text-slate-900">Yash</span>
        </h1>
        <p className="text-slate-500 mt-1 text-xs font-semibold uppercase tracking-widest">
          The Visionary Mentor
        </p>
      </header>

      <main className="flex-1 w-full max-w-lg flex flex-col gap-6 z-10 h-full">
        
        {/* Avatar Section */}
        <div className="flex-none flex flex-col items-center justify-center min-h-[300px]">
          <Avatar volume={volume} state={connectionState} />
          
          <div className="mt-6 text-center h-6">
            {connectionState === ConnectionState.CONNECTING && (
              <span className="text-slate-600 text-sm font-medium animate-pulse">Connecting...</span>
            )}
            {connectionState === ConnectionState.DISCONNECTED && (
              <span className="text-slate-400 text-sm font-medium">Tap to start the conversation.</span>
            )}
            {connectionState === ConnectionState.CONNECTED && (
              <span className="text-emerald-700 text-sm font-bold flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {volume.output > 0.05 ? "Speaking..." : "Listening..."}
              </span>
            )}
          </div>
        </div>

        {/* Transcript Area */}
        <div className="flex-1 min-h-[250px] bg-white rounded-xl border border-slate-200 p-4 overflow-y-auto scrollbar-hide shadow-xl" ref={scrollRef}>
          {transcripts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm text-center px-8 space-y-4">
              <div className="bg-slate-50 p-4 rounded-full">
                 <ChatBubbleLeftRightIcon className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <p className="font-serif italic text-slate-600 text-lg">"Hello, Archana."</p>
                <p className="mt-2 text-xs text-slate-400">Ready to explore the world? I found some interesting topics for us.</p>
              </div>
              <div className="flex gap-3 justify-center pt-2 opacity-50">
                <GlobeAltIcon className="w-4 h-4" />
                <PlayCircleIcon className="w-4 h-4" />
                <ShoppingBagIcon className="w-4 h-4" />
              </div>
            </div>
          ) : (
            transcripts.map((msg) => <TranscriptMessage key={msg.id} message={msg} />)
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center pb-4 pt-2">
          <button
            onClick={toggleConnection}
            className={`
              relative group p-5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95
              ${connectionState === ConnectionState.CONNECTED 
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30' 
                : 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-600/30'}
            `}
          >
            {connectionState === ConnectionState.CONNECTED ? (
              <StopIcon className="w-8 h-8" />
            ) : (
              <MicrophoneIcon className="w-8 h-8" />
            )}
          </button>
        </div>

      </main>

      {/* Error Toast */}
      {connectionState === ConnectionState.ERROR && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          <div>
             <p className="font-bold text-sm">Connection Interrupted</p>
          </div>
        </div>
      )}
    </div>
  );
}

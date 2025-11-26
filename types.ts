
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
}

export interface TranscriptionMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  isComplete: boolean;
  timestamp: Date;
  groundingMetadata?: GroundingMetadata | null;
}

export interface VolumeLevel {
  input: number;
  output: number;
}

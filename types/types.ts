import { AI_TOOL } from "./enum";


export type ToolOutput =  string; // Add other possible output types here

export interface Message {
  id: string;
  content: string;
  address: string;
  username?: string;
  profileImage?: string;
  roomId: string;
  tool?: AI_TOOL;
  toolCallId?: string;
  toolOutput?: ToolOutput;
  timestamp: string;
  images?: string[];
  partial?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  placeholderStatus?: 'in_progress' | 'finished'
}

export interface RoomParticipant {
  userId: string;
  address: string;
  nickname?: string;
  roomId: string;
  createdAt: Date;
}

export interface Room {
  id: string;
  title: string;
  multiroom: boolean;
  createdByUserId: string;
  lastMessage: string;
  timestamp: string;
  hasImages?: boolean;
  participants: RoomParticipant[];
}

export interface ChatState {
  messages: Message[];
  rooms: Room[];
  loadingRooms: boolean;
  error: string | null;
  firstMessage: string | null;
  model: 'deepseek' | 'llama' ;
}


export interface WLState {
  isWL: boolean;
}

export interface RoomData {
  meetid: string;
  id: string;
  username: string;
  newmeet?: boolean;
}

export interface UserJoinedPayload {
  username: string;
  id: string;
  room: string;
  to?: string;
}

export interface SignalingPayload {
  room?: string;
  id?: string;
  to?: string;
  from?: string;
  offer?: RTCSessionDescriptionInit;
  ans?: RTCSessionDescriptionInit;
  data?: { offer: RTCSessionDescriptionInit };
}

export interface ProgressState {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

export interface DataChannelMessage {
  type: "mediaStatus" | "videoLink" | "videoCtrl" | "ready" | "seekTo" | "mediaReceiving";
  content?: string | number | null;
  progress?: number;
  progressSec?: string;
  duration?: string;
  enable?: boolean;
  video?: "file" | "yt";
}

export interface JoinRoomError {
  error: string;
  message: string;
}
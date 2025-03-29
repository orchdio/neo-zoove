export interface TrackConversionPayload {
  entity: string;
  platforms: Platforms;
  unqiue_id: string;
}

export interface Platforms {
  deezer?: Track;
  spotify?: Track;
  tidal?: Track;
  applemusic?: Track;
  youtubemusic?: Track;
}

export interface Track {
  url: string;
  artists: string[];
  released: string;
  duration: string;
  explicit: boolean;
  title: string;
  preview: string;
  album: string;
  id: string;
  cover: string;
}

export interface TrackMeta {
  link: string;
  title: string;
  artist: string;
  cover: string;
  length: string;
  preview?: string;
}

export interface PlaylistConversionHttpResponse {
  data: PlaylistConversionData;
  message: string;
  status: number;
}

export interface PlaylistConversionData {
  task_id: string;
  payload: any;
  status: string;
}

export interface WebhookEventBase {
  event_type: string;
  platform: string;
  task_id: string;
}

// API and webhook related types.
export interface TrackConversionPayload {
  entity: string;
  platforms: Platforms;
  unique_id: string;
}

export enum TaskStatus {
  COMPLETED = "completed",
  FAILED = "failed",
  PENDING = "pending",
  PROCESSING = "processing",
}

export enum Entity {
  TRACK = "track",
  PLAYLIST = "playlist",
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
  duration_milli: number;
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
  id: string;
}

export interface PlaylistMeta {
  link: string;
  title: string;
  owner: string;
  cover: string;
  length: string | number;
  nb_tracks: number;
  // todo: use enums here.
  platform: string;
  description: string;
  artist: string;
  id?: string;
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

export interface PlaylistMetaInfo {
  data: {
    event_type: string;
  };
  meta: {
    cover: string;
    entity: string;
    length: string;
    owner: string;
    title: string;
    url: string;
    nb_tracks: number;
    description: string;
  };
  platform: string;
  unique_id: string;
}

export interface PlaylistTrackConversionData {
  event_type: string;
  task_id: string;
  tracks: [{ platform: string; track: Track }];
}

export interface PlaylistResultItem {
  platform: "spotify" | "applemusic" | "deezer" | "tidal" | "ytmusic" | string;
  artist: string;
  link: string;
  title: string;
  preview?: string;
  explicit?: boolean;
}

export interface PlaylistMissingTrackEventPayload {
  event_type: string;
  meta: {
    item: Track;
    missing_platform: string;
    platform: string;
  };
}

export interface PlaylistConversionDonePayload {
  event_type: string;
  playlist_id: string;
  source_platform: string;
  target_platform: string;
  task_id: string;
  unique_id: string;
}

export interface TrackConversionResultPreview {
  task_id: string;
  payload: {
    entity: Entity;
    platforms: Platforms;
  };
  status: TaskStatus;
}

export interface PlaylistConversionResultPreview {
  task_id: string;
  payload: {
    // todo: properly type this.
    empty_tracks: any[];
    meta: PlaylistMeta;
    platforms: Platforms;
    // todo: remove this from the response? because status is already on the base
    status: TaskStatus;
    // always going to be "playlist".
    entity: Entity;
    platform: string;
    target_platform: string;
  };
  status: TaskStatus;
}

// open graph related types.
interface OpenGraphImage {
  url: string;
  alt: string;
}

interface OpenGraph {
  type: string;
  siteName: string;
  url: string;
  images: OpenGraphImage[];
}

interface SEO {
  titleTemplate: string;
  defaultTitle: string;
  description: string;
  openGraph: OpenGraph;
}

interface LayoutProps {
  seo: SEO;
}

interface ServerSideProps {
  layoutProps: LayoutProps;
}

// For use with GetServerSideProps
export type { ServerSideProps };

// Alternative: If you want to be more explicit about it being page props
export interface PageProps {
  layoutProps: LayoutProps;
}

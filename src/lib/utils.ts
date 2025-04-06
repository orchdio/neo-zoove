import type { Platforms, TrackMeta } from "@/lib/blueprint";
import axios from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// magic link domains used by platforms.
export const PLATFORM_SHORT_LINKS = [
  "deezer.page.link",
  "link.tospotify.com",
  "spotify.link",
  "dzr.page.link",
];

export const PLATFORM_KEYS = [
  "applemusic",
  "deezer",
  "tidal",
  "ytmusic",
  "spotify",
];

const PLATFORM_HOSTNAMES_KV = {
  "www.deezer.com": "deezer",
  "www.tidal.com": "tidal",
  "www.music.youtube.com": "ytmusic",
  "www.open.spotify.com": "spotify",
  "www.music.apple.com": "applemusic",
};

// magic links are the same as short links. they're links that the streaming platforms
// provide (esp on mobile) when sharing tracks or playlists.
export const isMagicURL = (url: string) => {
  return PLATFORM_SHORT_LINKS.some((link) => url.includes(link));
};

export const fetchOriginalUrl = async (url: string) => {
  try {
    const l = await axios.get(`/api/preview?url=${url}`);
    return l.data?.preview?.url;
  } catch (e) {
    return null;
  }
};

export const capitalizeFirstLetter = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const getPlatformPrettyNameByKey = (key: string) => {
  const options = {
    applemusic: "Apple Music",
    deezer: "Deezer",
    tidal: "TIDAL",
    ytmusic: "YouTube Music",
    spotify: "Spotify",
  };

  return options[key as keyof typeof options];
};

export const convertPlatformToResult = (platforms: Platforms) => {
  if (!platforms) {
    return undefined;
  }
  const results: Array<TrackMeta & { platform: string }> = [];

  // iterate through each platform in the platforms object
  (Object.keys(platforms) as Array<keyof Platforms>).forEach((platformName) => {
    const track = platforms[platformName];

    // only process if the platform exists and has a track
    if (track) {
      results.push({
        platform: platformName,
        title: track.title,
        link: track.url,
        artist: track.artists.join(","),
        length: track.duration,
        cover: track.cover,
        preview: track.preview,
        id: track.id,
      });
    }
  });

  return results;
};

export const completeMetadataFromPlatforms = (
  platforms: { [p: string]: any }[] | undefined,
  metadata: TrackMeta,
): TrackMeta => {
  const completedMetadata = { ...metadata };

  // keys to check for completion (empty values)
  const keysToComplete = Object.keys(metadata).filter(
    (key) => metadata[key as keyof typeof metadata] === "",
  );

  keysToComplete.forEach((key) => {
    for (const platformObj of platforms ?? []) {
      const platform = Object.keys(platformObj)[0];
      const track = platformObj[platform];

      let value: string | undefined;
      const keyMappings: Record<string, string[]> = {
        artist: ["artists"],
        cover: ["cover", "image"],
        link: ["url", "link"],
        title: ["title"],
        length: ["duration", "length"],
        preview: ["preview"],
      };

      const possibleProps = keyMappings[key] || [key];
      for (const prop of possibleProps) {
        if (prop === "artists") {
          value =
            track[prop] && track[prop].length > 0
              ? track[prop].join(", ")
              : undefined;
        } else {
          value = track[prop];
        }

        if (value && value !== "") break;
      }

      if (value && value !== "") {
        completedMetadata[key as keyof typeof completedMetadata] = value;
        break;
      }
    }
  });

  return completedMetadata;
};

// buildTrackResultMetadata returns a populated metadata information (for the card UI) for a typical
// track conversion. If any of the values used to populate the meta cannot be found on the original
// (source) platform (i.e. the result for the original track we wanted to convert), then we populate
// by extracting from the first occurence from the other platforms available. this ensures that we always
// populate the meta, either from the original track meta (most accurate) or first occurrence from other platforms
// (less accurate).
export function buildTrackResultMetadata(
  tracks: Platforms,
  platform: string,
): TrackMeta {
  const originalTrack = tracks[platform as keyof typeof tracks];
  const remainingPlatforms = removeElement(PLATFORM_KEYS, platform);

  const remainingTracks = Object.entries(tracks)
    .filter(([k, v]) => v)
    .filter(([platfrm, itm]) => remainingPlatforms?.includes(platfrm));

  const metadata: TrackMeta = {
    artist: originalTrack?.artists?.join(", ") ?? "",
    cover: originalTrack?.cover ?? "",
    link: originalTrack?.url ?? "",
    title: originalTrack?.title ?? "",
    length: originalTrack?.duration ?? "",
    preview: originalTrack?.preview ?? "",
    id: originalTrack?.id ?? "",
  };

  const remainingPlatformsObjects = convertPlatformsToObject(remainingTracks);
  return completeMetadataFromPlatforms(remainingPlatformsObjects, metadata);
}

// checks if a key-value is empty.
export const isKeyValueEmpty = (metadata: TrackMeta, key: string): boolean => {
  return (
    metadata[key as keyof typeof metadata] === undefined ||
    metadata[key as keyof typeof metadata] === null ||
    metadata[key as keyof typeof metadata] === ""
  );
};

// find keys that have empty values, in a (track meta) object
export const findEmptyKeys = (metadata: TrackMeta): string[] => {
  return Object.entries(metadata)
    .filter(
      ([_, value]) => value === undefined || value === null || value === "",
    )
    .map(([key]) => key);
};

// converts the platforms data from the structure from the api to one used to build conversion object for tracks, for ui components.
export const convertPlatformsToObject = (platforms: Array<[string, any]>) => {
  return platforms?.map(([platform, trackData]) => ({
    [platform]: trackData,
  }));
};

export const removeElement = <T>(arr: T[], elementToRemove: T): T[] => {
  return arr.filter((item) => item !== elementToRemove);
};

export const extractPlatform = (url: string) => {
  const parsedURL = new URL(url);
  const host = parsedURL.host;

  return (
    PLATFORM_HOSTNAMES_KV[host as keyof typeof PLATFORM_HOSTNAMES_KV] || null
  );
};

export function pick<T>(array: T[], maxLength: number): T[] {
  // ensure maxLength is a positive integer
  const limit = Math.max(0, Math.floor(maxLength));

  // return a new array with length limited to max length
  return array.slice(0, limit);
}

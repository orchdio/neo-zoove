import axios from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidURL(url: string) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

// magic link domains used by platforms.
export const PLATFORM_SHORT_LINKS = [
  "deezer.page.link",
  "link.tospotify.com",
  "spotify.link",
  "dzr.page.link",
];

// magic links are the same as shortlinks. they're links that the streaming platforms
// provide (esp on mobile) when sharing tracks or playlists.
export const isMagicURL = (url: string) => {
  return PLATFORM_SHORT_LINKS.some((link) => url.includes(link));
};

// todo: implement api endpoint for preview.
export const fetchOriginalUrl = async (url: string) => {
  try {
    const l = await axios.get(`/api/preview?url=${url}`);
    return l.data?.preview?.url;
  } catch (e) {
    console.log("Could not fetch original url", e);
    return null;
  }
};

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

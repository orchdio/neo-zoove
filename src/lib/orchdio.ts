import axios, { type AxiosInstance } from "axios";
import type {
  PlaylistConversionData,
  PlaylistConversionResultPreview,
  TrackConversionPayload,
  TrackConversionResultPreview,
} from "@/lib/blueprint";

class Orchdio {
  private axiosInstance: AxiosInstance;
  private readonly publicKey: string;
  constructor(public pubKey: string) {
    this.publicKey = pubKey;
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      headers: {
        "content-type": "application/json",
        "x-orchdio-public-key": this.publicKey,
      },
    });
  }

  async convertTrack(link: string): Promise<TrackConversionPayload> {
    const { data: trackConversionResponse } = await this.axiosInstance.post(
      "/v1/track/convert",
      {
        url: link,
        target_platform: "all",
      },
    );

    return trackConversionResponse?.data;
  }

  async addToWaitlist(email: string, platform: string) {
    const { data } = await this.axiosInstance.post(
      "/v1/waitlist/add",
      {
        email,
        platform,
      },
      {
        headers: {
          "x-orchdio-key": process.env.ORCHDIO_SECRET_KEY,
        },
      },
    );
    return data;
  }

  async convertPlaylist(
    link: string,
    targetPlatform: string,
  ): Promise<PlaylistConversionData> {
    const response = await this.axiosInstance.post("/v1/playlist/convert", {
      url: link,
      target_platform: targetPlatform,
    });

    return response?.data?.data;
  }

  async fetchConversionPreview(
    uniqueId: string | string[] | undefined,
  ): Promise<TrackConversionResultPreview | PlaylistConversionResultPreview> {
    const response = await this.axiosInstance.get(`/v1/task/${uniqueId}`);
    return response?.data?.data;
  }
}

const orchdio = (
  defaultToken: string = process.env.NEXT_PUBLIC_ORCHDIO_PUBLIC_API_KEY!,
) => {
  return new Orchdio(defaultToken!);
};

export default orchdio;

import type { TrackConversionPayload } from "@/lib/blueprint";
import axios, { type AxiosInstance } from "axios";

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
}

const orchdio = (
  defaultToken: string = process.env.NEXT_PUBLIC_ORCHDIO__PUBLIC_API_KEY!,
) => {
  return new Orchdio(defaultToken!);
};

export default orchdio;

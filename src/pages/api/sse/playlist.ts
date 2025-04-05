import Events from "@/lib/events";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-control": "no-cache, no-transform",
      Connection: "keep-alive",
      "content-encoding": "none",
    });

    res.write(
      `data: ${JSON.stringify({
        event_type: "connection",
      })}\n\n`,
    );

    // Events.removeAllListeners();

    // echo event
    Events.once("playlist_conversion_metadata", (event) => {
      res.write(
        `data: ${JSON.stringify({
          event_type: "playlist_conversion_metadata",
          message: event,
        })}\n\n`,
      );

      // Events.removeAllListeners("playlist_conversion_metadata");
    });

    Events.on("playlist_conversion_done", (event) => {
      console.log("Handling event done emission here");
      res.write(
        `data: ${JSON.stringify({
          event_type: "playlist_conversion_done",
          message: event,
        })}\n\n`,
      );

      // Events.removeAllListeners("playlist_conversion_done");
    });

    Events.on("playlist_conversion_track", (event) => {
      console.log("Playlist track event....");
      res.write(
        `data: ${JSON.stringify({
          event_type: "playlist_conversion_track",
          message: event,
        })}\n\n`,
      );
      // Events.removeAllListeners("playlist_conversion_track");
    });

    Events.on("playlist_conversion_missing_track", (event) => {
      console.log("Missing track event....");
      res.write(
        `data: ${JSON.stringify({
          event_type: "playlist_conversion_missing_track",
          message: event,
        })}\n\n`,
      );

      // Events.removeAllListeners("playlist_conversion_missing_track");
    });

    res.on("close", () => {
      console.log("close event handler");
      // Events.removeAllListeners();
      res.end();
    });

    res.socket?.on("close", () => {
      console.log("close event handler socket");
      // Events.removeAllListeners();

      res.end();
    });
  } catch (e) {
    console.log("SSE error", e);
    Events.removeAllListeners();
  }
}

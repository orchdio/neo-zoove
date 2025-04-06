import {
  PLAYLIST_CONVERSION_DONE_EVENT,
  PLAYLIST_CONVERSION_MISSING_TRACK_EVENT,
  PLAYLIST_CONVERSION_TRACK_EVENT,
  PLAYLIST_METADATA_EVENT,
} from "@/lib/constants";
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

    // putting this here to help mitigate the chances of events memory leaks due to client re-rendering side-effects
    // might not have much advantage, might remove as time goes on.
    //
    // the same goes for other places in this file and in the useeffect in the index page.
    // fixme(help): audit the side-effect on events and events memory leaks.
    Events.removeAllListeners();
    Events.on(PLAYLIST_METADATA_EVENT, (event) => {
      console.log("Emitting conversion metadata");
      res.write(
        `data: ${JSON.stringify({
          event_type: PLAYLIST_METADATA_EVENT,
          message: event,
        })}\n\n`,
      );
    });

    Events.on(PLAYLIST_CONVERSION_DONE_EVENT, (event) => {
      console.log("Emitting conversion done");
      res.write(
        `data: ${JSON.stringify({
          event_type: PLAYLIST_CONVERSION_DONE_EVENT,
          message: event,
        })}\n\n`,
      );
    });

    Events.on(PLAYLIST_CONVERSION_TRACK_EVENT, (event) => {
      console.log("Emitting conversion track");
      res.write(
        `data: ${JSON.stringify({
          event_type: PLAYLIST_CONVERSION_TRACK_EVENT,
          message: event,
        })}\n\n`,
      );
    });

    Events.on(PLAYLIST_CONVERSION_MISSING_TRACK_EVENT, (event) => {
      console.log("Emitting conversion missing");
      res.write(
        `data: ${JSON.stringify({
          event_type: PLAYLIST_CONVERSION_MISSING_TRACK_EVENT,
          message: event,
        })}\n\n`,
      );
    });

    res.on("close", () => {
      Events.removeAllListeners();
      res.end();
    });

    res.socket?.on("close", () => {
      Events.removeAllListeners();
      res.end();
    });
  } catch (e) {
    Events.removeAllListeners();
    res.end();
  }
}

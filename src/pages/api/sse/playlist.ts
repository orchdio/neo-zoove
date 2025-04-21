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

    const clientId = req.query.clientId as string;
    //
    if (!clientId) {
      return res.status(404).send("No Client ID found.");
    }

    res.write(
      `data: ${JSON.stringify({
        event_type: "connection",
      })}\n\n`,
    );

    // // putting this here to help mitigate the chances of events memory leaks due to client re-rendering side-effects
    // // might not have much advantage, might remove as time goes on.
    // //
    // // the same goes for other places in this file and in the useeffect in the index page.
    // // fixme(help): audit the side-effect on events and events memory leaks.

    // Events.removeAllListeners();
    const playlist_meta_event_pattern =
      /^[a-zA-Z0-9_]+:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/gim;
    const metadata_event_p = `${PLAYLIST_METADATA_EVENT}:${playlist_meta_event_pattern}`;

    Events.onPattern(playlist_meta_event_pattern, (eventName, event) => {
      console.log("Hit: Emitting conversion metadata");

      res.write(`event: client_${clientId}_${PLAYLIST_METADATA_EVENT}\n`);
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      // res.write(
      //   `data: ${JSON.stringify({
      //     event_type: PLAYLIST_METADATA_EVENT,
      //     message: event,
      //   })}\n\n`,
      // );

      Events.offPattern(metadata_event_p, () => {
        console.log("SETTING IT OFFF.....");
      });
    });

    Events.on(PLAYLIST_CONVERSION_DONE_EVENT, (event) => {
      console.log("Emitting conversion done");
      console.log("Event payload is", event);
      res.write(
        `event: client_${clientId}_${PLAYLIST_CONVERSION_DONE_EVENT}\n`,
      );
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      // res.write(
      //   `data: ${JSON.stringify({
      //     event_type: PLAYLIST_CONVERSION_DONE_EVENT,
      //     message: event,
      //   })}\n\n`,
      // );
      Events.off(PLAYLIST_CONVERSION_DONE_EVENT, (event) => {
        console.log("Removing conversion done event....");
      });
    });

    Events.on(PLAYLIST_CONVERSION_TRACK_EVENT, (event) => {
      console.log("Emitting conversion track");
      res.write(
        `data: ${JSON.stringify({
          event_type: PLAYLIST_CONVERSION_TRACK_EVENT,
          message: event,
        })}\n\n`,
      );

      Events.off(PLAYLIST_CONVERSION_TRACK_EVENT, (event) => {
        console.log("Removing conversion done event....");
      });
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

    Events.once("webhook_verification_error", (event) => {
      console.log("Webhook verification failed.");
      res.write(
        `data: ${JSON.stringify({
          event_type: "webhook_verification_error",
          message: {
            data: "Could not verify webhook",
          },
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

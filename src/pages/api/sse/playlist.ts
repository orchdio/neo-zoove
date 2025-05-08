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
    if (!clientId) {
      return res.status(404).send("No Client ID found.");
    }

    const taskUniqueID = req.query.taskId as string;
    if (!taskUniqueID) {
      return res.status(404).send("No Playlist UniqueId found.");
    }

    res.write(
      `data: ${JSON.stringify({
        event_type: "connection",
      })}\n\n`,
    );

    // callback to write the result for the event to the client.
    const handleTaskEvent = (taskId: string, data: any) => {
      res.write(`event: ${data?.event_type}_${clientId}_${taskId}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const eventTypes = [
      PLAYLIST_METADATA_EVENT,
      PLAYLIST_CONVERSION_TRACK_EVENT,
      PLAYLIST_CONVERSION_MISSING_TRACK_EVENT,
      PLAYLIST_CONVERSION_DONE_EVENT,
    ];

    eventTypes.forEach((eventType) => {
      Events.onClientTask(eventType, clientId, taskUniqueID, handleTaskEvent);
    });

    res.socket?.on("close", () => {
      Events.unsubscribeClient(clientId, taskUniqueID);
      Events.removeAllListeners();
      res.end();
    });
  } catch (e) {
    Events.removeAllListeners();
    res.end();
  }
}

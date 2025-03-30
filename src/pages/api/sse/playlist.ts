import Events from "@/lib/events";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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

  Events.on("hello", (data) => {
    console.log("echoed event", data);
    res.write(
      `data: ${JSON.stringify({
        event_type: "meta",
      })}\n\n`,
    );
  });

  // echo event
  Events.on("playlist_conversion_metadata", (event) => {
    console.log("Run playlist meta rendering....", event);
    res.write(
      `data: ${JSON.stringify({
        event_type: "playlist_conversion_metadata",
        message: event,
      })}\n\n`,
    );
  });

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(": keepAlive\n\n");
  }, 1000);

  res.on("close", () => {
    console.log("close event handler");
    clearInterval(keepAlive);
    res.end();
  });

  res.socket?.on("close", () => {
    console.log("close event handler socket");
    clearInterval(keepAlive);
    res.end();
  });
}

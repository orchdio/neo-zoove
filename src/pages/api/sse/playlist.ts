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

  // echo event
  Events.on("conversion_meta", (event) => {
    console.log("Run playlist meta rendering....");
    res.write(
      `data: ${JSON.stringify({
        event_type: "conversion_meta",
        message: "this should contain the meta.",
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

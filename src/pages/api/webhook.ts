import type { WebhookEventBase } from "@/lib/blueprint";
import Events from "@/lib/events";
import { SvixWebhook } from "@/lib/svix";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET":
      return res.json("ok");
    case "POST":
      try {
        console.log("POSTing webhook");
        const svix = new SvixWebhook(process.env.SVIX_API_KEY!);
        const verificationHeaders = {
          "svix-id": req.headers["svix-id"] as string,
          "svix-timestamp": req.headers["svix-timestamp"] as string,
          "svix-signature": req.headers["svix-signature"] as string,
        };

        const webhookSecret = await svix.endpoint.getSecret(
          // fixme(remove): svix_app_id is stored in the orchdio backend
          process.env.SVIX_APP_ID!,
          // endpoint id is in the format: `endpoint_${endpointUUID}
          process.env.SVIX_ENDPOINT_ID!,
        );

        const verified = svix.verifyWebhook(
          webhookSecret.key,
          Buffer.from(JSON.stringify(req.body)),
          verificationHeaders,
        );

        // ep_2rE9Eki9ROE9SOZIkv6XoyGzDBK
        const eventType = verified as {
          data: WebhookEventBase;
        };

        switch (eventType?.data?.event_type) {
          case "playlist_conversion_metadata":
            // console.log("Playlist conversion metadata event received xx");
            console.log(
              `emitting event "conversion_metadata:${eventType?.data?.task_id}"`,
            );
            Events.emit("playlist_conversion_metadata", eventType);

            // Events.off("playlist_conversion_metadata", (ev) => {
            //   console.log("Removing event listener here...");
            // });
            break;

          case "playlist_conversion_done":
            Events.emit("playlist_conversion_done", eventType);
            break;
          default:
            console.log("Unknown event type received.");
            console.log("Unknown event payload...");
            console.log(eventType);
            // conversionEvents.emit("unhandled", "naan");
            // todo: move this into a const.
            // conversionEvents.emit("unhandled");
            break;
        }

        return res.status(200).json({
          message: "ok",
        });
      } catch (e) {
        console.log("Error handling webhook event", e);
        return res.status(500).send("Unhandled error");
      }
  }
}

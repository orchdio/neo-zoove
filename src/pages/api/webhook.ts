import type { WebhookEventBase } from "@/lib/blueprint";
import {
  PLAYLIST_CONVERSION_DONE_EVENT,
  PLAYLIST_CONVERSION_MISSING_TRACK_EVENT,
  PLAYLIST_CONVERSION_TRACK_EVENT,
  PLAYLIST_METADATA_EVENT,
} from "@/lib/constants";
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
        const svix = new SvixWebhook(process.env.SVIX_API_KEY!);
        const verificationHeaders = {
          "svix-id": req.headers["svix-id"] as string,
          "svix-timestamp": req.headers["svix-timestamp"] as string,
          "svix-signature": req.headers["svix-signature"] as string,
        };

        const webhookSecret = await svix.endpoint.getSecret(
          // fixme(improve experience): svix_app_id is stored in the orchdio backend. for apps integrating Orchdio, they'll need to grab this from their Orchdio dashboard
          process.env.SVIX_APP_ID!,
          // endpoint id is in the format: `endpoint_${endpointUUID}
          process.env.SVIX_ENDPOINT_ID!,
        );

        // for added security, we're verifying our webhook event.
        const verified = svix.verifyWebhook(
          webhookSecret.key,
          Buffer.from(JSON.stringify(req.body)),
          verificationHeaders,
        );

        const webhookEventPayload = verified as {
          data: WebhookEventBase;
        };

        switch (webhookEventPayload?.data?.event_type) {
          case PLAYLIST_METADATA_EVENT:
            console.log(
              `emitting event "conversion_metadata:${webhookEventPayload?.data?.task_id}"`,
            );
            Events.emit(PLAYLIST_METADATA_EVENT, webhookEventPayload);
            break;

          case PLAYLIST_CONVERSION_TRACK_EVENT:
            console.log("emitting event track event");
            Events.emit(PLAYLIST_CONVERSION_TRACK_EVENT, webhookEventPayload);
            break;

          case PLAYLIST_CONVERSION_DONE_EVENT:
            console.log("emitting event done");
            Events.emit(PLAYLIST_CONVERSION_DONE_EVENT, webhookEventPayload);
            break;

          case PLAYLIST_CONVERSION_MISSING_TRACK_EVENT:
            Events.emit(
              PLAYLIST_CONVERSION_MISSING_TRACK_EVENT,
              webhookEventPayload,
            );
            break;
          default:
            console.log("Unknown event type received.");
            break;
        }

        return res.status(200).json({
          message: "ok",
        });
      } catch (e) {
        console.log("Error handling webhook event", e);
        Events.emit("webhook_verification_error", e);
        return res.status(500).send("Unhandled error");
      }
  }
}

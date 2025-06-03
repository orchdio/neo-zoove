import type { NextApiRequest, NextApiResponse } from "next";
import type { WebhookEventBase } from "@/lib/blueprint";
import Events from "@/lib/events";
import { SvixWebhook } from "@/lib/svix";

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
        // fixme(docs): update this info in docs and add necessary information for integrating
        const verified = svix.verifyWebhook(
          webhookSecret.key,
          Buffer.from(JSON.stringify(req.body)),
          verificationHeaders,
        );

        const webhookEventPayload = verified as {
          data: WebhookEventBase;
        };

        // process the WH event by subscribing the client to the corresponding taskId (or unique playlistId)
        // and then dispatch the handling result (and necessary payload emitting) to the client
        Events.processWebhook(
          webhookEventPayload?.data?.event_type,
          webhookEventPayload?.data,
        );

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

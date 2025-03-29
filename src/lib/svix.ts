import { Svix, Webhook } from "svix";

export class SvixWebhook extends Svix {
  private readonly url: string;
  // constructor(token: string, options?: SvixOptions) {
  //   super(token, options);
  // }

  verifyWebhook(
    webhookSecret: string,
    payload: Buffer | string,
    headers: Record<string, string>,
  ) {
    const wh = new Webhook(webhookSecret);
    return wh.verify(payload, headers);
  }
}

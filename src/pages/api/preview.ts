import * as dns from "node:dns";
import { getLinkPreview } from "link-preview-js";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const {
      method,
      query: { url },
    } = req;

    if (method === "GET") {
      const link = url as string;
      console.log("Link page", link);
      const preview = await getLinkPreview(link, {
        // @ts-ignore
        resolveDNSHost: async (url: string) => {
          const { hostname } = new URL(url);
          dns.lookup(hostname, (err, addr) => {
            if (err) {
              console.log("Could not perform DNS lookup");
              return null;
            } else {
              return addr;
            }
          });
        },
        followRedirects: "follow",
      });

      return res.status(200).json({
        url,
        preview,
      });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).send(null);
  }
}

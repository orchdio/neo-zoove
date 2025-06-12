import type { NextApiRequest, NextApiResponse } from "next";
import { Platform } from "@/lib/blueprint";
import orchdio from "@/lib/orchdio";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "POST": {
        const { user, title, tracks } = req.body;
        const { platform, action } = req.query;
        if (action === "add") {
          if (!user || !tracks)
            return res.status(400).json({
              status: "error",
              message: "Missing user or tracks",
            });

          const isValidPlatform = !!Object.values(Platform).find(
            (p) => platform === p,
          );

          console.log("Invalid platform", isValidPlatform);
          if (isValidPlatform) {
            const response = await orchdio().addPlaylistToLibrary(
              platform,
              user,
              title,
              tracks,
            );

            console.log("Api response is", response);

            return res.status(200).json(response);
          }

          return res.status(400).json({
            status: "error",
            error: "invalid_platform",
            message: "Invalid or unsupported platform passed.",
          });
        }

        return res.status(400).json({
          status: "error",
          error: "invalid_action",
          message: "Action not recognized.",
        });
      }
    }

    return res.status(405).json({
      status: "error",
      error: "invalid_method",
      message: "Method not allowed",
    });
  } catch (e) {
    console.log("Error performing request", e);
    return res.status(500).json({
      status: "error",
      message: "Invalid request",
    });
  }
};

import { AxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import orchdio from "@/lib/orchdio";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "POST": {
      try {
        const { email, platform } = req.body;
        if (!email || !platform) {
          return res.status(400).json({ error: "Missing email or platform" });
        }
        const data = await orchdio().addToWaitlist(email, platform);
        return res.status(200).json({
          status: "success",
          data,
        });
      } catch (error) {
        console.error(error);
        if (error instanceof AxiosError) {
          console.log(
            "Error is typeof axios.... should return the error code here instead of 500",
          );
          console.log(error);
          return res.status(error?.status ?? 500).json({
            error: error.message,
            message: error?.response?.data?.message ?? "Something went wrong",
          });
        }
      }
      break;
    }
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

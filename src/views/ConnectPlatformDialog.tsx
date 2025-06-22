import axios from "axios";
import Image from "next/image";
import Button from "@/components/button/button";
import Text from "@/components/text/text";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Waitlist from "@/components/waitlist";
import { getPlatformPrettyNameByKey } from "@/lib/utils";
import { UnknownErrorToast } from "@/views/actionToasts";

interface Props {
  platforms: Array<string>;
}

// todo: refactor this and move things into `connect.tsx` if and when necessary
// todo: update the redirect urls for the platforms.
// todo: update env with deezer state.

// here, we set the spotify scopes.
const spotifyScopes = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-email",
  "user-read-recently-played",
  "user-top-read",
  "user-library-modify",
];

const redirectURLs = {
  spotify: `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/spotify/connect?scopes=${encodeURI(spotifyScopes.join(","))}`,
  deezer: `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/deezer/connect?state=${process.env.NEXT_PUBLIC_DEEZER_STATE}`,
};

const handleConnect = async (platform: string) => {
  try {
    const redirectURL = redirectURLs[platform as keyof typeof redirectURLs];
    if (!redirectURL) {
      throw new Error("Invalid platform");
    }

    const response = await axios.get(redirectURL, {
      headers: {
        "Content-Type": "application/json",
        "x-orchdio-public-key": process.env.NEXT_PUBLIC_ORCHDIO_PUBLIC_API_KEY,
      },
    });

    window.location.href = response.data.data.url;
  } catch (e) {
    console.log("Error connecting to platform: ");
    console.log(e);
    UnknownErrorToast();
  }
};

export const ConnectPlatformDialog = (props: Props) => {
  return (
    <div className={"flex flex-col justify-center items-center mt-16"}>
      <div className={"flex flex-col gap-2 w-64"}>
        {props?.platforms?.map((platform) => {
          const platformName = getPlatformPrettyNameByKey(platform);
          return (
            <div key={platform} className={"flex flex-col gap-4 mt-4 w-64"}>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className={
                      "bg-zoove-blue-100 p-2 rounded-sm text-black flex items-center relative"
                    }
                  >
                    <div className="absolute left-5">
                      <Image
                        src={`/${platform}/icons/dark.svg`}
                        alt={"Apple music logo"}
                        height={20}
                        width={20}
                      />
                    </div>
                    <span className="w-full text-center">{platformName}</span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      <Text content={`Connect your ${platformName} account`} />
                    </DialogTitle>
                  </DialogHeader>

                  {platform === "spotify" && (
                    <div className={"flex flex-col gap-y-4 mt-4 text-center"}>
                      <span
                        onClick={() => handleConnect(platform)}
                        className={"underline cursor-pointer text-gray-400"}
                      >
                        Click here to connect your Spotify account
                      </span>
                      <span>
                        If you're having issues connecting your Spotify account,
                        please enter your email below and we'll get back to you.
                      </span>
                    </div>
                  )}

                  {platform === "applemusic" && (
                    <div
                      className={
                        "flex flex-col justify-center items-center text-center gap-y-4"
                      }
                    >
                      <span>
                        We're improving the Apple Music auth flow and it'll be
                        ready shortly.
                      </span>
                      <span>
                        Please enter your email below and we'll get back to you
                        when it's available.
                      </span>
                    </div>
                  )}

                  {platform === "deezer" && (
                    <div className={"flex flex-col gap-y-4 mt-4 text-center"}>
                      <span
                        onClick={() => handleConnect(platform)}
                        className={"underline cursor-pointer text-gray-400"}
                      >
                        Click here to connect your Deezer account.
                      </span>

                      <span className={"italic"}>
                        ⚠️ Deezer has restricted their API support (for now, at
                        least), so some features might not work correctly.
                      </span>

                      <span>
                        If you have problems connecting your Deezer account,
                        please enter your email below and we'll get back to you.
                      </span>
                    </div>
                  )}

                  <div className={"mt-4"}>
                    <Waitlist
                      placeholder={"Enter your email"}
                      show_label={false}
                    />
                  </div>

                  <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Close
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          );
        })}
      </div>
    </div>
  );
};

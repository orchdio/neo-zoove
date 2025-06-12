import { CableIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState } from "react";
import Button from "@/components/button/button";
import Text from "@/components/text/text";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAuthStatus } from "@/hooks/useAuth";
import { Platform } from "@/lib/blueprint";
import { getPlatformPrettyNameByKey } from "@/lib/utils";
import { WarnToast } from "@/views/actionToasts";

interface Props {
  activePlatforms: string[];
}

export const ConnectedPlatformsDialog = (props: Props) => {
  const { zooveUser, disconnectPlatform, isSignedIn } = useAuthStatus();
  const { resolvedTheme } = useTheme();

  console.log("Connection status is", isSignedIn);

  // we get the currently signed in platform
  // active platforms are the platforms that the user has currently connected. currently, users can connect just one platform
  // so for now, we create an array from just the single platform.
  // todo: return the already signed in/connected accounts in the jwt.
  // const activePlatforms = [zooveUser?.platform];
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>(
    props?.activePlatforms ?? [],
  );
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className={"bg-zoove-blue-100 p-2 rounded-sm text-black"}>
            {/**fixme: this always assumes taking the first item in the platforms.*/}
            <Image
              src={`${zooveUser?.platforms[0]}/icons/${resolvedTheme ?? "light"}.svg`}
              alt={"last connected platform icon"}
              height={21}
              width={21}
            />
            <MenuIcon />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage your platform connections</DialogTitle>
            <DialogDescription>
              <Text
                content={
                  "Connect or disconnect your Streaming platform accounts"
                }
              />
            </DialogDescription>
          </DialogHeader>

          <div className={"flex flex-col  space-y-8"}>
            {Object.keys(Platform).map((plat) => {
              const isConnected = props?.activePlatforms.includes(plat);
              const isActive = connectedPlatforms.includes(plat);
              return (
                <div className={"flex flex-row justify-between"} key={plat}>
                  <div className={"flex flex-row space-x-4"}>
                    <Image
                      src={`${plat}/icons/${resolvedTheme ?? "light"}.svg`}
                      alt={"last connected platform icon"}
                      height={21}
                      width={21}
                    />
                    <span>{getPlatformPrettyNameByKey(plat)}</span>
                    <Badge
                      variant={"secondary"}
                      className={`${isConnected ? "dark:bg-green-300 dark:text-black" : ""} ${isConnected && !isActive ? "dark:bg-red-300" : ""}`}
                    >
                      {isConnected && isActive && "connected"}
                      {isConnected && !isActive && "disconnected"}
                      {!isActive && !isConnected && "unconnected"}
                    </Badge>
                  </div>

                  <div className={"flex flex-row space-x-2"}>
                    {!isActive && !isConnected && (
                      <CableIcon
                        size={18}
                        onClick={() => {
                          WarnToast({
                            title: "⚠️ You cannot do that yet",
                            position: "top-right",
                            description:
                              "We are working on supporting connecting multiple platforms. For now, please disconnect the current platform and connect your prefered platform.",
                            duration: 10000,
                          });
                        }}
                      />
                    )}
                    <Switch
                      disabled={(!isActive && !isConnected) || !isSignedIn}
                      checked={connectedPlatforms.includes(plat)}
                      onCheckedChange={(e) => {
                        if (!e) {
                          setConnectedPlatforms(
                            connectedPlatforms.filter((item) => item !== plat),
                          );
                          disconnectPlatform(plat);
                          return;
                        }
                        setConnectedPlatforms([...connectedPlatforms, plat]);
                        return;
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!isSignedIn) {
                    window.location.href = "/connect";
                  }
                }}
              >
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

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
import { Platform, type UserPlatformInfo } from "@/lib/blueprint";
import { getPlatformPrettyNameByKey } from "@/lib/utils";
import { WarnToast } from "@/views/actionToasts";

interface Props {
  activePlatforms: UserPlatformInfo[];
}

export const ConnectedPlatformsDialog = (props: Props) => {
  const { zooveUser, disconnectPlatform, isSignedIn } = useAuthStatus();
  const { resolvedTheme } = useTheme();

  const [connectedPlatforms, setConnectedPlatforms] = useState<
    UserPlatformInfo[]
  >(props?.activePlatforms ?? []);
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className={"bg-zoove-blue-100 p-2 rounded-sm text-black"}>
            <Image
              src={`${zooveUser?.last_authed_platform}/icons/${resolvedTheme ?? "light"}.svg`}
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
              const isConnected = props?.activePlatforms
                .map((plat) => plat.platform.toString())
                .includes(plat);
              const isActive = connectedPlatforms
                .map((item) => item.platform.toString())
                .includes(plat);
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
                      checked={connectedPlatforms
                        .map((plat) => plat.platform.toString())
                        .includes(plat)}
                      onCheckedChange={(e) => {
                        if (!e) {
                          setConnectedPlatforms(
                            connectedPlatforms.filter(
                              (item) => item.platform !== plat,
                            ),
                          );
                          disconnectPlatform(plat);
                          return;
                        }
                        setConnectedPlatforms([
                          ...connectedPlatforms,
                          // fixme: pay attention to the effect of this. does this break something else somewhere?
                          {
                            platform: Platform[plat as keyof typeof Platform],
                            platform_id: "",
                            app_id: "",
                          },
                        ]);
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

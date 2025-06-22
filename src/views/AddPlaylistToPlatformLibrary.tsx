import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState } from "react";
import Button from "@/components/button/button";
import Text from "@/components/text/text";
import { toast } from "@/components/toast/toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStatus } from "@/hooks/useAuth";
import { getPlatformPrettyNameByKey } from "@/lib/utils";

interface AddPlaylistToPlatformLibraryProps {
  title: string;
  tracks: string[];
  setAdded: (value: boolean) => void;
  setPlaylistUrl: (value: string) => void;
}

export const AddPlaylistToPlatformLibrary = (
  props: AddPlaylistToPlatformLibraryProps,
) => {
  const { resolvedTheme } = useTheme();
  const { zooveUser } = useAuthStatus();

  const connectedPlatforms = zooveUser?.platforms?.map((p) =>
    p.platform.toString(),
  );

  const [addedPlatform, setAddedPlatform] = useState<string>();

  const addToPlaylistHandler = useMutation({
    mutationFn: async (platform: string) => {
      return await axios.post(`/api/${platform}/add`, {
        user: zooveUser?.uuid,
        title: props?.title,
        tracks: props?.tracks,
      });
    },
    onError: (_err, platform) => {
      toast({
        title: "💔 Something didn't work",
        position: "top-right",
        description: (
          <Text
            content={`We could not add this playlist to your ${getPlatformPrettyNameByKey(platform)} library. Please try again later.`}
            className={"text-black"}
          />
        ),
        variant: "success",
        duration: 4000,
      });
    },
    onSuccess: (_, platform) => {
      console.log("Playlist added successfully");
      toast({
        title: "🎉 It's done!",
        position: "top-right",
        description: (
          <Text
            content={`We have added this playlist to your ${getPlatformPrettyNameByKey(platform)} library & the link available to copy.`}
            className={"text-black"}
          />
        ),
        variant: "success",
        duration: 4000,
      });
      props?.setAdded(true);
    },
  });

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <PlusCircleIcon height={21} width={21} />
        </DialogTrigger>

        <DialogContent className={"sm:max-w-md"}>
          <DialogHeader>
            <DialogTitle>
              Add this playlist to your connect platform's library
            </DialogTitle>
          </DialogHeader>

          {/** main dialog content div*/}
          <div className={"flex flex-col space-y-4"}>
            {connectedPlatforms?.map((item) => {
              return (
                <div
                  className={"flex flex-row justify-between items-center"}
                  key={`platform_${item}`}
                >
                  <div className={"flex flex-row space-x-4"}>
                    <Image
                      src={`/${item}/icons/${resolvedTheme ?? "light"}.svg`}
                      alt={`${item} icon`}
                      height={21}
                      width={21}
                    />
                    <span>{getPlatformPrettyNameByKey(item)}</span>
                  </div>
                  <Button
                    variant={"outline"}
                    disabled={
                      addToPlaylistHandler.status === "success" &&
                      addedPlatform === item
                    }
                    onClick={async () => {
                      setAddedPlatform(item);
                      const resp = await addToPlaylistHandler.mutateAsync(item);
                      props?.setPlaylistUrl(resp?.data);
                    }}
                  >
                    {addToPlaylistHandler.status === "pending" &&
                      item === addedPlatform && (
                        <Loader2Icon className={"animate-spin"} />
                      )}

                    {addToPlaylistHandler.status === "success" &&
                    addedPlatform === item
                      ? "Added"
                      : "Add"}
                  </Button>
                </div>
              );
            })}
          </div>

          <DialogFooter className={"sm:justify-start"}>
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
};

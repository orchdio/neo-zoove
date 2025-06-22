import { Share } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import Button from "@/components/button/button";
import Text from "@/components/text/text";
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
import { getPlatformPrettyNameByKey } from "@/lib/utils";

interface Props {
  items: Array<{ url: string; title: string; platform: string }>;
  source_platform: string;
  target_platform: string;
}

export const MissingTracksDialog = (props: Props) => {
  const { resolvedTheme } = useTheme();
  const sourcePlatformName = getPlatformPrettyNameByKey(props?.source_platform);
  const targetPlatformName = getPlatformPrettyNameByKey(props?.target_platform);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className={"text-xs underline cursor-pointer"}>
          show missing tracks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Missing tracks</DialogTitle>
          <DialogDescription>
            <Text
              content={`Some tracks are missing in your conversion. These results could not be fetched on ${targetPlatformName}. The links below link to the tracks on ${sourcePlatformName}.`}
            />
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto pr-2">
          <div className="space-y-4">
            {props?.items?.map((item) => {
              return (
                <div
                  className={"flex flex-row justify-between"}
                  key={Math.random()}
                >
                  <div className={"flex flex-row space-x-2"}>
                    <Image
                      src={`/${props?.source_platform}/icons/${resolvedTheme}.svg`}
                      alt={"Target platform icon"}
                      height={18}
                      width={18}
                    />
                    <span>{item?.title}</span>
                  </div>
                  <Share
                    height={18}
                    width={18}
                    onClick={() => {
                      window.open(item?.url, "_blank");
                    }}
                  />
                </div>
              );
            })}
          </div>
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
  );
};

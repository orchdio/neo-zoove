import Text from "@/components/text/text";
import { toast } from "@/components/toast/toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPlatformPrettyNameByKey } from "@/lib/utils";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { EllipsisIcon, ExternalLinkIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

interface Props {
  platform: "spotify" | "applemusic" | "deezer" | "tidal" | "ytmusic" | string;
  artist: string;
  link: string;
  title: string;
}

const TrackPlatformItem = (props: Props) => {
  const { theme } = useTheme();

  const [copiedText, copyToClipboard] = useCopyToClipboard();

  return (
    <Card
      className=" w-full
            sm:w-full
            md:w-full
            lg:w-full
            xl:w-full bg-zoove-gray-100"
    >
      <CardContent>
        <div
          className={
            "p-4 border rounded-lg flex flex-row items-center justify-between border-zoove-blue-100 dark:border-accent cursor-pointer"
          }
        >
          <div
            className={"flex flex-row items-center space-x-4 truncate"}
            onClick={async () => {
              await copyToClipboard(props?.link);
              toast({
                title: "Link Copied",
                description: (
                  <div className={"flex flex-row items-center space-x-2"}>
                    {/**todo: link clipboard pasting*/}
                    <Image
                      src={`${props.platform}/icons/${theme ?? "light"}.svg`}
                      alt={`${getPlatformPrettyNameByKey(props.platform)} icon`}
                      width={21}
                      height={21}
                    />
                    <Text
                      content={`${getPlatformPrettyNameByKey(props.platform)} link copied to clipboard`}
                      className={"text-black truncate"}
                    />
                  </div>
                ),
                position: "top-right",
                duration: 3000,
                variant: "success",
              });
            }}
          >
            <Image
              src={`/${props?.platform}/icons/${theme ?? "dark"}.svg`}
              alt={"Apple music icon"}
              width={21}
              height={21}
            />
            <Text content={props?.title} className={"truncate"} />
          </div>
          <div className={"flex flex-row space-x-2"}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <EllipsisIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => {
                    window.open(props?.link, "_blank");
                  }}
                >
                  <ExternalLinkIcon />
                  <DropdownMenuLabel>
                    <Text
                      content={`Open on ${getPlatformPrettyNameByKey(props.platform)}`}
                    />
                  </DropdownMenuLabel>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackPlatformItem;

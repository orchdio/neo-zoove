import { useCopyToClipboard } from "@uidotdev/usehooks";
import { EllipsisIcon, ExternalLinkIcon } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
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
import type { PlaylistResultItem } from "@/lib/blueprint";
import { getPlatformPrettyNameByKey } from "@/lib/utils";

interface Props {
  data: Array<PlaylistResultItem>;
}

const TrackPlatformItem = (props: Props) => {
  const { resolvedTheme } = useTheme();
  const [_, copyToClipboard] = useCopyToClipboard();

  return (
    <Card
      className=" w-full
            sm:w-full
            md:w-full
            lg:w-full
            xl:w-full bg-gray-600 dark:bg-gray-600 relative"
    >
      <CardContent>
        <div className={"space-y-2"}>
          {props?.data.map((item, index) => {
            console.log("Each playlist item conversion is", item.link);
            return (
              <div
                key={item.link}
                className={
                  "p-4 border rounded-lg flex flex-col md:flex-row md:items-center border-green-950 dark:border-accent cursor-pointer gap-2 md:gap-4"
                }
              >
                <div className="flex flex-row items-center justify-between gap-2 w-full md:w-auto md:flex-1 md:min-w-0 md:justify-start">
                  <div
                    className="flex flex-row items-center space-x-2 min-w-0 flex-1 md:flex-initial"
                    onClick={async () => {
                      await copyToClipboard(item.link);
                      toast({
                        title: "Link Copied",
                        description: (
                          <div
                            className={"flex flex-row items-center space-x-2"}
                          >
                            <Image
                              src={`${item.platform}/icons/${resolvedTheme ?? "light"}.svg`}
                              alt={`${getPlatformPrettyNameByKey(item.platform)} icon`}
                              width={21}
                              height={21}
                            />
                            <Text
                              content={`${getPlatformPrettyNameByKey(item.platform)} link copied to clipboard`}
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
                      src={`/${item?.platform}/icons/${resolvedTheme ?? "dark"}.svg`}
                      alt={"Apple music icon"}
                      width={21}
                      height={21}
                      className="shrink-0"
                    />
                    <Text
                      content={item?.title}
                      className={"truncate text-white"}
                    />
                  </div>

                  <div className="md:hidden shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <EllipsisIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            window.open(item?.link, "_blank");
                          }}
                        >
                          <ExternalLinkIcon />
                          <DropdownMenuLabel>
                            <Text
                              content={`Open on ${getPlatformPrettyNameByKey(item.platform)}`}
                            />
                          </DropdownMenuLabel>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div
                  className="ml-[29px] md:ml-0 md:flex md:items-center md:flex-1 md:min-w-0"
                  onClick={async () => {
                    await copyToClipboard(item.link);
                    toast({
                      title: "Link Copied",
                      description: (
                        <div className={"flex flex-row items-center space-x-2"}>
                          <Image
                            src={`${item.platform}/icons/${resolvedTheme ?? "light"}.svg`}
                            alt={`${getPlatformPrettyNameByKey(item.platform)} icon`}
                            width={21}
                            height={21}
                          />
                          <Text
                            content={`${getPlatformPrettyNameByKey(item.platform)} link copied to clipboard`}
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
                  <Text
                    content={item?.artist}
                    className={"truncate text-white text-xs"}
                  />
                </div>

                <div className="hidden md:flex md:flex-row md:space-x-2 md:shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <EllipsisIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          window.open(item?.link, "_blank");
                        }}
                      >
                        <ExternalLinkIcon />
                        <DropdownMenuLabel>
                          <Text
                            content={`Open on ${getPlatformPrettyNameByKey(item.platform)}`}
                          />
                        </DropdownMenuLabel>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackPlatformItem;

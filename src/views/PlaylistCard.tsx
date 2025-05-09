import Text from "@/components/text/text";
import { toast } from "@/components/toast/toast";
import { Card, CardContent } from "@/components/ui/card";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { CopyIcon, PlusCircleIcon, ShareIcon } from "lucide-react";
import Image from "next/image";
import type React from "react";

interface Props {
  data: {
    title: string;
    description: string;
    owner?: string;
    length: string | number;
    cover: string;
    id?: string;
    link: string;
    platform?: string;
    nb_tracks: number;
  };
  children?: React.ReactNode;
}
const TrackCard = (props: Props) => {
  const [_, copyToClipboard] = useCopyToClipboard();

  return (
    <div className="w-full">
      <div className="w-full space-y-2">
        <Card
          className={`
            w-full 
            bg-zoove-red-100
            dark:bg-zoove-red-100
            sm:w-full 
            md:w-full 
            lg:w-full 
            xl:w-full
          `}
        >
          <CardContent>
            <div className="flex flex-row items-center space-x-4">
              <div className="flex-shrink-0 h-[150px] w-[150px] relative">
                <Image
                  src={props?.data?.cover}
                  alt="Track cover"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col space-y-1 min-w-0 flex-1">
                <h2 className="font-bold text-xl line-clamp-2 text-white">
                  {props?.data?.title}
                </h2>
                <span className={"font-semibold line-clamp-2 text-xs"}>
                  {props.data.description}
                </span>
                {props?.data?.owner && (
                  <span
                    className={"text-xs"}
                  >{`owned by ${props?.data?.owner}`}</span>
                )}

                {!props?.data?.owner && (
                  <span className={"italic text-xs text-zoove-gray-300"}>
                    {"unknown owner"}
                  </span>
                )}

                <Text
                  content={
                    <span>
                      <span>
                        {props?.data?.nb_tracks && props?.data?.nb_tracks === 1
                          ? `${props?.data?.nb_tracks} track`
                          : `${props?.data?.nb_tracks} tracks`}
                      </span>
                      <span>
                        {props?.data?.length ? `, ${props?.data?.length}` : ""}
                      </span>
                    </span>
                  }
                  className="text-xs dark:text-gray-200 text-gray-300"
                />
                <div className={"flex flex-row justify-between mt-2"}>
                  <div className={"flex flex-row items-center space-x-2"}>
                    <PlusCircleIcon
                      width={16}
                      height={16}
                      color={"white"}
                      opacity={0.5}
                    />
                    <CopyIcon
                      width={16}
                      height={16}
                      onClick={async () => {
                        await copyToClipboard(props?.data?.link);
                        toast({
                          title: "Playlist link copied",
                          description: (
                            <Text
                              className={"text-black"}
                              content={`📋 ${capitalizeFirstLetter(props?.data?.platform ?? "")} playlist link has been copied to clipboard`}
                            />
                          ),
                          position: "top-right",
                          variant: "success",
                        });
                      }}
                      color={"white"}
                    />
                  </div>
                  <ShareIcon
                    width={16}
                    height={16}
                    color={"white"}
                    onClick={() => window.open(props?.data?.link, "_blank")}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {props.children}
      </div>
    </div>
  );
};

export default TrackCard;

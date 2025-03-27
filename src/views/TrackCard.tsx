import Text from "@/components/text/text";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircleIcon } from "lucide-react";
import Image from "next/image";

interface Props {
  title: string;
  description: string;
  artist: string;
  length: string | number;
  preview: string;
  cover: string;
  id?: string;
  link: string;
  platform?: string;
  children?: React.ReactNode;
}
const TrackCard = (props: Props) => {
  return (
    <div className="w-full">
      <div className="w-full space-y-2">
        <Card
          className={`
            w-full 
            bg-zoove-gray-100 
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
                  src={props?.cover}
                  alt="Track cover"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col space-y-2 min-w-0 flex-1">
                <h2 className="font-bold text-xl line-clamp-2 text-white">
                  {props?.title}
                </h2>
                <p className="text-sm text-gray-100 line-clamp-2">
                  {props?.artist}
                </p>
                <div className="flex flex-row justify-between">
                  <Text
                    content={props?.length?.toString()}
                    className="text-sm dark:text-gray-400 text-gray-300"
                  />
                  <div
                    className={!props?.preview ? "opacity-40" : "opacity-100"}
                  >
                    <PlayCircleIcon color={"#8f95b2"} />
                  </div>
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

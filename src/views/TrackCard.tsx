import Text from "@/components/text/text";
import { Card, CardContent } from "@/components/ui/card";
import { usePlayback } from "@/hooks/usePlayback";
import { motion } from "framer-motion";
import { PauseCircle, PlayCircleIcon } from "lucide-react";
import Image from "next/image";
import type React from "react";

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
  const { isPlaying, handlePlay, playingTrack, handlePause, progress } =
    usePlayback();

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
                    className={`${!props?.preview ? "opacity-40" : "opacity-100"} cursor-pointer`}
                    onClick={() => {
                      isPlaying && playingTrack === props?.preview
                        ? handlePause()
                        : handlePlay(props?.preview);
                    }}
                  >
                    {isPlaying && playingTrack === props?.preview ? (
                      <motion.div
                        initial={{ scale: 1 }}
                        animate={{
                          scale: [1, 0.9, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                        className="relative"
                      >
                        <PauseCircle
                          className="relative z-10"
                          color={"#8f95b2"}
                        />
                        <div
                          className="absolute inset-0 rounded-full border-2 border-zoove-red-100"
                          style={{
                            clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
                            transition: "clip-path 0.3s linear",
                            zIndex: 1,
                          }}
                        />
                      </motion.div>
                    ) : (
                      <PlayCircleIcon color={"#8f95b2"} />
                    )}
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

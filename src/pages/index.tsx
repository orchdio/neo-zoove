import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Layout from "@/components/layout";
import { toast } from "@/components/toast/toast";
import ZooveIcon from "@/components/zooveicon";
import { useLinkResolver } from "@/hooks/useLinkResolver";
import type { TrackConversionPayload, TrackMeta } from "@/lib/blueprint";
import orchdio from "@/lib/orchdio";
import {
  buildTrackResultMetadata,
  convertPlatformToResult,
  extractPlatform,
} from "@/lib/utils";
import HeadIcons from "@/views/HeadIcons";
import TrackCard from "@/views/TrackCard";
import TrackPlatformItem from "@/views/TrackPlatformItem";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "lucide-react";
import Image from "next/image";
import { type ReactElement, useEffect, useState } from "react";
import DancingDuckGif from "../../public/dancing-duck.gif";

import Text from "@/components/text/text";

export default function Home() {
  // todo: capture posthog page view event on page load
  const [goButtonIsDisabled, setGoButtonIsDisabled] = useState(true);
  const [link, setLink] = useState<string>("");

  const [trackResults, setTrackResults] = useState<TrackConversionPayload>();
  const [trackMeta, setTrackMeta] = useState<TrackMeta>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sourcePlatform, setSourcePlatform] = useState<string>();

  const maintenanceMode =
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "maintenance";
  const disableGoButton = maintenanceMode || goButtonIsDisabled;

  const { resolveLink } = useLinkResolver({
    onLinkResolved: (resolvedLink) => {
      setLink(resolvedLink);

      if (!resolvedLink) {
        setGoButtonIsDisabled(true);
        return;
      }
      setGoButtonIsDisabled(false);
    },
  });

  useEffect(() => {
    if (trackResults) {
      const meta = buildTrackResultMetadata(
        trackResults?.platforms,
        sourcePlatform ?? "",
      );

      setTrackMeta(meta);
    }
  }, [trackResults, sourcePlatform]);

  const { mutateAsync } = useMutation({
    mutationFn: (link: string) => orchdio().convertTrack(link),
    mutationKey: ["/v1/track/convert"],
    onError: () => {
      // todo: more robust error handling (show different error messages for concerning errors)
      toast({
        title: "🙈 Uh-oh! That was embarrassing",
        position: "top-right",
        description: (
          <Text
            content={"Something went wrong, please try again."}
            className={"text-black"}
          />
        ),
        variant: "warning",
      });
    },

    onSuccess: (data) => {
      setTrackResults(data);
      setSourcePlatform(extractPlatform(link) ?? "");
    },

    onSettled: () => {
      setIsLoading(false);
      setGoButtonIsDisabled(false);
    },
  });

  const handleGoButtonClick = async () => {
    // todo:implement server sent events (playlist conversions)

    setIsLoading(true);
    setGoButtonIsDisabled(true);
    await mutateAsync(link);
  };

  return (
    <div className={"w-full flex justify-center px-4 md:px-8 lg:px-16"}>
      <div className={"flex flex-col items-center py-24 relative max-w-4xl"}>
        <ZooveIcon height={"auto"} className="w-40 h-auto" />
        <h1
          className="animated-heading font-bold text-5xl md:text-7xl"
          style={{
            fontSize: "clamp(3rem, 5vw, 4.5rem)",
            textAlign: "center",
            backgroundColor: "var(--color-header-background)",
            color: "transparent",
            backgroundImage: "var(--gradient-color)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            backgroundPosition: "-20% 100%",
            backgroundSize: "var(--bg-size)",
            backgroundRepeat: "no-repeat",
          }}
        >
          Share Music Without Boundaries
        </h1>
        <HeadIcons />
        <span
          className={
            "py-2 text-center mt-10 dark:text-zoove-gray-300 light: text-black"
          }
        >
          Share songs and playlists across different streaming platforms with
          just one link.
        </span>

        <div className="w-full mt-10 flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-x-3">
          <Input
            disabled={maintenanceMode}
            placeholder="Paste track or playlist link"
            value={link}
            onChange={async (e) => {
              setLink(e.target.value);
              await resolveLink(e.target.value);
            }}
            className={"w-full flex-auto h-14 rounded-sm px-2"}
          />
          <Button
            disabled={disableGoButton}
            onClick={handleGoButtonClick}
            className={`dark:text-black text-white dark:bg-zoove-blue-100 bg-zoove-blue-400 rounded-sm h-10 md:w-48 mb-2 disabled:cursor-not-allowed disabled:opacity-50 relative overflow-hidden
            `}
            variant={"secondary"}
          >
            <div className="flex items-center justify-center w-full relative">
              <motion.span
                animate={{
                  x: isLoading ? 20 : 0,
                  opacity: isLoading ? 0.5 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="z-10 relative"
              >
                Go
              </motion.span>

              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, x: -20, scale: 0.5 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.5 }}
                    transition={{
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="absolute left-1/2 -translate-x-1/2"
                  >
                    <Loader className="animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Button>
        </div>

        {!isLoading && trackResults && (
          <TrackCard
            id={"track-card"}
            artist={trackMeta?.artist ?? ""}
            title={trackMeta?.title ?? ""}
            link={trackMeta?.link ?? ""}
            cover={trackMeta?.cover ?? ""}
            description={"todo"}
            preview={trackMeta?.preview ?? ""}
            length={trackMeta?.length ?? ""}
          >
            {trackResults &&
              convertPlatformToResult(trackResults?.platforms)?.map(
                (item, index) => {
                  return (
                    <TrackPlatformItem
                      key={`${index * 2}.platform.result`}
                      platform={item?.platform}
                      artist={item.artist}
                      link={item.link}
                      title={item.title}
                    />
                  );
                },
              )}
          </TrackCard>
        )}
        <div>
          {isLoading && (
            <Image
              src={DancingDuckGif}
              alt={"Dancing duck gif"}
              width={100}
              height={100}
            />
          )}
        </div>
      </div>
    </div>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout seo={{}}>{page}</Layout>;
};

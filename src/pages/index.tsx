import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Layout from "@/components/layout";
import Text from "@/components/text/text";
import { toast } from "@/components/toast/toast";
import ZooveIcon from "@/components/zooveicon";
import { useLinkResolver } from "@/hooks/useHandleLinkPreview";
import type { TrackConversionPayload, TrackMeta } from "@/lib/blueprint";
import { convertPlatformToResult, extractPlatform } from "@/lib/utils";
import HeadIcons from "@/views/HeadIcons";
import TrackCard from "@/views/TrackCard";
import TrackPlatformItem from "@/views/TrackPlatformItem";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import posthog from "posthog-js";
import { type ReactElement, useEffect, useState } from "react";
import DancingDuckGif from "../../public/dancing-duck.gif";

export default function Home() {
  // todo: capture posthog page view event on page load
  const [goButtonIsDisabled, setGoButtonIsDisabled] = useState(true);
  const [link, setLink] = useState<string>("");

  const [trackResults, setTrackResults] = useState<TrackConversionPayload>();
  const [trackMeta, setTrackMeta] = useState<TrackMeta>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sourcePlatform, setSourcePlatform] = useState<string>();
  const { theme } = useTheme();

  const maintenanceMode =
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "maintenance";
  const disableGoButton = maintenanceMode || goButtonIsDisabled;

  const { resolveLink, isResolving, resolvedLink } = useLinkResolver({
    onLinkResolved: (resolvedLink) => {
      console.log("resolveLink", resolvedLink);
      setLink(resolvedLink);
      // setGoButtonIsDisabled(false);
    },
  });

  useEffect(() => {
    console.log("Resolved link changed...", link);
    setLink(link);
    if (!link) {
      setGoButtonIsDisabled(true);
      return;
    }

    setLink(link);
    setGoButtonIsDisabled(false);
  }, [link]);

  // useEffect(() => {
  //   if (link) {
  //     console.log("Resolved link is");
  //     console.log(link);
  //   }
  //
  //   if (resolveLink()) {
  //     console.log("Resolved link is");
  //     console.log(resolvedLink);
  //   }
  // }, [link, resolveLink]);

  // useEffect(() => {
  //   // handle track results metadata setting
  //   if (trackResults) {
  //     const meta = buildTrackResultMetadata(
  //       trackResults?.platforms,
  //       sourcePlatform ?? "",
  //     );
  //
  //     setTrackMeta(meta);
  //   }
  //
  //   const isValidLink = isValidURL(link);
  //   if (!isValidLink || !link) {
  //     setGoButtonIsDisabled(true);
  //     return;
  //   }
  //
  //   const isShortLink = isMagicURL(link);
  //   if (isShortLink) {
  //     fetchOriginalUrl(link).then((result) => {
  //       // show toast message for unsupported "entities", for now
  //       const unsupportedEntity = ["album"].find((entity) =>
  //         result.includes(entity),
  //       );
  //
  //       if (unsupportedEntity) {
  //         toast({
  //           title: `Your link is ${unsupportedEntity === "album link" ? "an" : "a"} ${unsupportedEntity}`,
  //           position: "top-right",
  //           description: (
  //             <span className={"text-black"}>
  //               {`💔 ${capitalizeFirstLetter(unsupportedEntity)} conversion is not supported yet`}
  //             </span>
  //           ),
  //           closeButton: true,
  //           variant: "warning",
  //           duration: 10000,
  //         });
  //         return;
  //       }
  //
  //       if (result?.preview?.url.includes("playlist")) {
  //         // todo: set playlist related state
  //       }
  //
  //       const strippedURL =
  //         result?.indexOf("?") !== -1
  //           ? (result?.substring(0, result?.indexOf("?")) as string)
  //           : (result as string);
  //       setLink(strippedURL);
  //       setGoButtonIsDisabled(false);
  //     });
  //
  //     return;
  //   }
  //
  //   setGoButtonIsDisabled(false);
  // }, [link, trackResults, sourcePlatform]);

  const handleGoButtonClick = async () => {
    // then do the conversion. we handle only synchronously handle track conversion here. for playlists & other long running
    // actions, we handle them using server sent events.
    // todo:implement server sent events (playlist conversions)

    setIsLoading(true);
    setGoButtonIsDisabled(true);

    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      const { data: trackConversionResponse } = await axios({
        method: "post",
        baseURL,
        url: "/v1/track/convert",
        data: {
          url: link,
          target_platform: "all",
        },
        headers: {
          "Content-Type": "application/json",
          "X-orchdio-public-key": process.env.NEXT_PUBLIC_ORCHDIO_API_KEY,
        },
      });

      const trackData: TrackConversionPayload = trackConversionResponse?.data;
      setTrackResults(trackData);
      setSourcePlatform(extractPlatform(link) ?? "");

      // capture posthog track conversion event
      posthog.capture("entity_conversion_track_conversion", {
        entity: "track",
        data: { trackData },
      });
    } catch (error) {
      console.log("Error fetching track conversion track conversion", error);
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
    } finally {
      setIsLoading(false);
      setGoButtonIsDisabled(false);
    }
  };

  return (
    <div className={"flex flex-col items-center px-4"}>
      <div
        className={
          "flex flex-col items-center py-24 relative md:mx-32 lg:mx-48"
        }
      >
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
              await resolveLink(e.target.value);
            }}
            className={"w-full flex-auto h-14 rounded-sm px-2"}
          />
          <Button
            disabled={disableGoButton}
            onClick={handleGoButtonClick}
            className={
              "dark:text-black text-white bg-zoove-blue-100 rounded-sm h-10 md:w-48 mb-2 disabled:cursor-not-allowed disabled:opacity-50 relative overflow-hidden"
            }
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

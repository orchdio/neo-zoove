import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Layout from "@/components/layout";
import ZooveIcon from "@/components/zooveicon";
import { useLinkResolver } from "@/hooks/useLinkResolver";
import type {
  PlaylistMeta,
  PlaylistMetaInfo,
  PlaylistMissingTrackEventPayload,
  PlaylistResultItem,
  PlaylistTrackConversionData,
  TrackConversionPayload,
  TrackMeta,
} from "@/lib/blueprint";
import Events from "@/lib/events";
import orchdio from "@/lib/orchdio";
import {
  buildTrackResultMetadata,
  convertPlatformToResult,
  extractPlatform,
} from "@/lib/utils";
import HeadIcons from "@/views/HeadIcons";
import { MissingTracksDialog } from "@/views/MissingTracksDialog";
import { PlatformSelectionSelect } from "@/views/PlatformSelectionSelect";
import PlaylistCard from "@/views/PlaylistCard";
import PlaylistCardItem from "@/views/PlaylistCardItem";
import ScrollableResults from "@/views/ScrollableResults";
import TrackCard from "@/views/TrackCard";
import TrackPlatformItem from "@/views/TrackPlatformItem";
import {
  PlaylistConversionStartedToast,
  UnknownErrorToast,
} from "@/views/actionToasts";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "lucide-react";
import Image from "next/image";
import posthog from "posthog-js";
import { type ReactElement, useEffect, useRef, useState } from "react";
import DancingDuckGif from "../../public/dancing-duck.gif";

export default function Home() {
  const [goButtonIsDisabled, setGoButtonIsDisabled] = useState(true);
  const [link, setLink] = useState<string>("");

  const [trackResults, setTrackResults] = useState<TrackConversionPayload>();
  const [trackMeta, setTrackMeta] = useState<TrackMeta>();
  const [playlistMeta, setPlaylistMeta] = useState<PlaylistMeta>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sourcePlatform, setSourcePlatform] = useState<string>();
  const [targetPlatform, setTargetPlatform] = useState<string>();

  const [playlistUniqueId, setPlaylistUniqueId] = useState<string>();
  const [isPlaylist, setIsPlaylist] = useState<boolean>(false);
  const [missingTracks, setMissingTracks] = useState<
    {
      title: string;
      platform: string;
      url: string;
    }[]
  >([
    {
      title: "",
      platform: "",
      url: "",
    },
  ]);

  const [playlistResultItems, setPlaylistResultItems] = useState<
    PlaylistResultItem[][]
  >([
    [
      {
        platform: "",
        artist: "",
        link: "",
        title: "",
      },
    ],
  ]);

  const [resultCount, setResultCount] = useState<number>(0);
  const [isConvertingPlaylist, setIsConvertingPlaylist] =
    useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const maintenanceMode =
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "maintenance";
  const disableGoButton = maintenanceMode || goButtonIsDisabled;

  const { resolveLink } = useLinkResolver({
    onLinkResolved: (resolvedLink) => {
      setLink(resolvedLink);

      if (!resolvedLink) {
        setGoButtonIsDisabled(true);
        setIsPlaylist(false);

        setIsConvertingPlaylist(false);
        return;
      }

      if (resolvedLink?.includes("playlist")) {
        setIsPlaylist(true);
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

  // track conversion mutation. A track conversion is a normal POST request to orchdio api.
  const { mutateAsync } = useMutation({
    mutationFn: (link: string) => orchdio().convertTrack(link),
    mutationKey: ["/v1/track/convert"],
    onError: () => {
      // todo: more robust error handling (show different error messages for concerning errors)
      UnknownErrorToast();
    },

    onSuccess: (data) => {
      setTrackResults(data);
      setSourcePlatform(extractPlatform(link) ?? "");
      posthog.capture("conversion.track.completed", {
        link,
        sourcePlatform,
      });
    },

    onSettled: () => {
      setIsLoading(false);
      setGoButtonIsDisabled(false);
      // reset playlist rendering condition states.
      setIsPlaylist(false);
      setPlaylistUniqueId("");
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isPlaylist && playlistUniqueId) {
      const eventSource = new EventSource("/api/sse/playlist");

      eventSource.onopen = (e) => {};
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload?.event_type === "playlist_conversion_metadata") {
            const playlistMetaInfo = payload?.message?.data as PlaylistMetaInfo;
            setPlaylistMeta({
              platform: playlistMetaInfo?.platform,
              artist: "",
              cover: playlistMetaInfo?.meta?.cover,
              description: playlistMetaInfo?.meta?.description,
              link: playlistMetaInfo?.meta?.url,
              length: playlistMetaInfo?.meta?.length,
              title: playlistMetaInfo?.meta?.title,
              owner: playlistMetaInfo?.meta?.owner,
              id: playlistMetaInfo?.unique_id,
              nb_tracks: playlistMetaInfo?.meta?.nb_tracks,
            });

            setIsConvertingPlaylist(true);
            setIsLoading(false);
            setGoButtonIsDisabled(false);
          }

          if (payload?.event_type === "playlist_conversion_track") {
            const itemData: PlaylistTrackConversionData =
              payload?.message?.data;
            const trackItems = itemData.tracks.map((trackInfo) => {
              const item: PlaylistResultItem = {
                link: trackInfo.track.url,
                explicit: trackInfo.track.explicit,
                artist: trackInfo.track.artists.join(", "),
                platform: trackInfo.platform,
                title: trackInfo.track.title,
                preview: trackInfo.track.preview,
              };

              return item;
            });

            setPlaylistResultItems((prevItems) => [...prevItems, trackItems]);
            setResultCount((prevState) => prevState + 1);
            return;
          }

          if (payload?.event_type === "playlist_conversion_missing_track") {
            console.log(JSON.stringify(payload?.message, null, 2));

            const metaPayload = payload?.message
              ?.data as PlaylistMissingTrackEventPayload;

            console.log("Missing track payload is", metaPayload);
            setMissingTracks((prevState) => [
              ...prevState,
              {
                title: metaPayload?.meta?.item?.title,
                platform: metaPayload?.meta?.platform,
                url: metaPayload?.meta?.url,
              },
            ]);
            return;
          }

          if (payload?.event_type === "playlist_conversion_done") {
            setIsConvertingPlaylist(false);
            return;
          }

          return Events.removeAllListeners();
        } catch (e) {
          console.error(e);
          setIsConvertingPlaylist(false);
        }
      };

      eventSource.onerror = (e) => {
        Events.removeAllListeners();
        return eventSource.close();
      };
      return () => {
        Events.removeAllListeners();
        eventSource.close();
      };
    }
  }, [isPlaylist, playlistUniqueId, playlistResultItems, missingTracks]);

  // playlist conversion mutation
  const { mutateAsync: playlistMutateAsync } = useMutation({
    mutationFn: (data: { link: string; platform: string }) =>
      orchdio().convertPlaylist(data.link, data.platform),
    mutationKey: ["/v1/playlist/convert"],
    onError: () => {
      // todo: more robust error handling (show different error messages for concerning errors)
      UnknownErrorToast();
    },

    onSuccess: (data) => {
      setPlaylistUniqueId(data?.task_id);

      // reset track result rendering condition states.
      setTrackResults(undefined);
      PlaylistConversionStartedToast();
      // empty previous playlist track results data
      setPlaylistResultItems([]);
      setResultCount(0);
    },
  });

  const handleGoButtonClick = async () => {
    if (link && isPlaylist) {
      setIsLoading(true);
      await playlistMutateAsync({ link, platform: targetPlatform ?? "all" });
      return;
    }

    setIsLoading(true);
    setGoButtonIsDisabled(true);
    await mutateAsync(link);
  };

  return (
    <div className={"w-full flex justify-center md:px-8 lg:px-16"}>
      <div
        className={
          "flex flex-col items-center py-24 relative max-w-4xl min-w-0"
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

        <div className="w-full mt-10 flex flex-col space-y-2 md:flex-row md:justify-between md:space-x-3">
          <div className={"w-full flex flex-col items-start"}>
            <Input
              disabled={maintenanceMode}
              placeholder="Paste track or playlist link"
              value={link}
              onChange={async (e) => {
                setLink(e.target.value);
                await resolveLink(e.target.value);
              }}
              className={"w-full flex-auto h-14 rounded-sm px-2"}
              ref={inputRef}
            />

            {/** target platforms dropdown. Shown only if the pasted link is a playlist*/}
            {isPlaylist && (
              <div className={"mt-2 w-full md:w-fit"}>
                <PlatformSelectionSelect
                  className={"w-full"}
                  onChange={(value) => {
                    console.log("Platform selection value", value);
                    setTargetPlatform(value);
                    setGoButtonIsDisabled(false);
                  }}
                />
              </div>
            )}
          </div>
          <Button
            disabled={disableGoButton}
            onClick={handleGoButtonClick}
            className={`dark:text-black text-white dark:bg-zoove-blue-100 bg-zoove-blue-400 rounded-sm h-10 md:w-48 mb-2 disabled:cursor-not-allowed disabled:opacity-50 relative overflow-hidden
            md:h-14`}
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

        {/**Playlist card here.*/}
        {!isLoading && playlistUniqueId && playlistMeta && (
          <PlaylistCard
            title={playlistMeta?.title ?? ""}
            description={playlistMeta?.description ?? ""}
            length={playlistMeta?.length ?? ""}
            cover={playlistMeta?.cover ?? ""}
            link={playlistMeta?.link ?? ""}
            owner={playlistMeta?.owner ?? ""}
            nb_tracks={playlistMeta?.nb_tracks ?? 0}
          >
            {!isLoading &&
              isPlaylist &&
              playlistUniqueId &&
              !isConvertingPlaylist && (
                <div className={"justify-between flex flex-row items-center"}>
                  <span
                    className={"text-xs ml-2"}
                  >{`Showing ${resultCount} of ${playlistMeta?.nb_tracks} ${playlistMeta?.nb_tracks > 1 ? "tracks" : "track"}`}</span>
                  {missingTracks.length >= 1 &&
                    missingTracks[0]?.title !== "" && <MissingTracksDialog />}
                </div>
              )}

            {!isLoading &&
              isPlaylist &&
              playlistUniqueId &&
              isConvertingPlaylist && (
                <div className={"flex flex-row justify-between"}>
                  <span className={"text-xs ml-2"}>
                    {`Track ${resultCount} of ${playlistMeta?.nb_tracks} converted`}
                  </span>
                  <AnimatePresence>
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
                  </AnimatePresence>
                </div>
              )}

            <ScrollableResults isConverting={isConvertingPlaylist}>
              {playlistResultItems
                ?.filter((item) => item?.length >= 1 && item[0].title !== "")
                ?.map((item) => {
                  return <PlaylistCardItem data={item} key={Math.random()} />;
                })}
            </ScrollableResults>
          </PlaylistCard>
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

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Loader } from "lucide-react";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import posthog from "posthog-js";
import { type ReactElement, useEffect, useState } from "react";
import { v7 as uuidv7 } from "uuid";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Layout from "@/components/layout";
import ZooveIcon from "@/components/zooveicon";
import { useLinkResolver } from "@/hooks/useLinkResolver";
import {
  Entity,
  type MissingTrack,
  type PlaylistConversionDonePayload,
  type PlaylistConversionResultPreview,
  type PlaylistMeta,
  type PlaylistMetaInfo,
  type PlaylistMissingTrackEventPayload,
  type PlaylistResultItem,
  type PlaylistTrackConversionData,
  type ServerSideProps,
  type TrackConversionPayload,
  type TrackMeta,
} from "@/lib/blueprint";
import {
  PLAYLIST_CONVERSION_DONE_EVENT,
  PLAYLIST_CONVERSION_MISSING_TRACK_EVENT,
  PLAYLIST_CONVERSION_TRACK_EVENT,
  PLAYLIST_METADATA_EVENT,
} from "@/lib/constants";
import Events from "@/lib/events";
import orchdio from "@/lib/orchdio";
import {
  buildTrackResultMetadata,
  convertPlatformToResult,
  extractPlatform,
  getPlatformPrettyNameByKey,
} from "@/lib/utils";
import {
  InvalidTargetPlatformSelectionErrorToast,
  PlaylistConversionStartedToast,
  UnknownErrorToast,
  UnsupportedPlatformErrorToast,
} from "@/views/actionToasts";
import HeadIcons from "@/views/HeadIcons";
import { MissingTracksDialog } from "@/views/MissingTracksDialog";
import { PlatformSelectionSelect } from "@/views/PlatformSelectionSelect";
import PlaylistCard from "@/views/PlaylistCard";
import PlaylistCardItem from "@/views/PlaylistCardItem";
import ScrollableResults from "@/views/ScrollableResults";
import TrackCard from "@/views/TrackCard";
import TrackPlatformItem from "@/views/TrackPlatformItem";
import DefaultSeoConfig from "../../next-seo.config";
import DancingDuckGif from "../../public/dancing-duck.gif";

export default function Home(props: ServerSideProps) {
  const [goButtonIsDisabled, setGoButtonIsDisabled] = useState(true);
  const [link, setLink] = useState<string>("");

  const [trackResults, setTrackResults] = useState<TrackConversionPayload>();
  const [trackMeta, setTrackMeta] = useState<TrackMeta>();
  const [playlistMeta, setPlaylistMeta] = useState<PlaylistMeta>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sourcePlatform, setSourcePlatform] = useState<string>();
  const [targetPlatform, setTargetPlatform] = useState<string>();
  const [playlistShortID, setPlaylistShortID] = useState<string>();

  const [playlistUniqueId, setPlaylistUniqueId] = useState<string>();
  const [isPlaylist, setIsPlaylist] = useState<boolean>(false);
  const [missingTracks, setMissingTracks] = useState<MissingTrack[]>([
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

      if (resolvedLink?.includes(Entity.PLAYLIST)) {
        setIsPlaylist(true);
        return;
      }

      // resolve resolvedLink into a URL (again). this is to allow us to verify if it's a valid URL.
      // if it's not, we don't want to allow clicking the go button. this is done this way because
      //  it's less cumbersome and "dirty" than using another option like regex. we simply rely on the robust
      // URL parsing and resolving in the browser engine.
      // This way, typing a bunch of text into the input box won't enable the user to trigger a conversion request
      try {
        new URL(resolvedLink);
        setGoButtonIsDisabled(false);
      } catch (_e) {}
    },
  });

  // handles the track preview from magic-links.
  useEffect(() => {
    if (
      props?.layoutProps?.payload?.payload &&
      Object.keys(props?.layoutProps?.payload?.payload).length > 0
    ) {
      const entity = props.layoutProps.payload?.payload?.entity;
      console.log("entity", entity);
      if (entity === Entity.TRACK) {
        const payload = props.layoutProps.payload
          ?.payload as unknown as TrackConversionPayload;
        const meta = buildTrackResultMetadata(
          payload?.platforms ?? [],
          payload?.source_platform ?? "",
        );

        setTrackMeta(meta);
        setTrackResults(payload);
      } else if (entity === Entity.PLAYLIST) {
        const payload = props.layoutProps.payload
          ?.payload as unknown as PlaylistConversionResultPreview["payload"];
        const playlistMetaInfo = payload;
        const playlistMeta = {
          platform: playlistMetaInfo?.platform,
          artist: "",
          cover: playlistMetaInfo?.meta?.cover,
          description: playlistMetaInfo?.meta?.description,
          link: playlistMetaInfo?.meta?.url,
          length: playlistMetaInfo?.meta?.length,
          title: playlistMetaInfo?.meta?.title,
          owner: playlistMetaInfo?.meta?.owner,
          id: payload?.meta?.id,
          nb_tracks: playlistMetaInfo?.meta?.nb_tracks,
        };

        // for now, just map all the track results. we rely on the other metadata information on the payload regarding
        // platform and target platform, used to format the data for the rendering of the playlist track items.

        const srcPlatformTracks = payload.platforms[payload?.platform];
        const targetPlatformTracks =
          payload.platforms[payload?.target_platform];
        const playlistItems = [];

        // target platform and source platforms have the same length
        for (let i = 0; i < targetPlatformTracks?.tracks?.length; i++) {
          const srcTrack = srcPlatformTracks?.tracks[i];
          const srcTrackItem: PlaylistResultItem = {
            link: srcTrack.url,
            artist: srcTrack.artists.join(", "),
            platform: payload?.platform,
            title: srcTrack.title,
            preview: srcTrack.preview,
            explicit: srcTrack.explicit,
          };

          const targetTrack = targetPlatformTracks?.tracks[i];
          const targetTrackItem: PlaylistResultItem = {
            link: targetTrack.url,
            artist: targetTrack.artists.join(", "),
            platform: payload?.target_platform,
            title: targetTrack.title,
            preview: targetTrack.preview,
            explicit: targetTrack.explicit,
          };

          const both = [srcTrackItem, targetTrackItem];
          playlistItems.push(both);
        }

        const missingTracks = payload.empty_tracks?.map((trackInfo) => {
          return {
            title: trackInfo?.title,
            platform: trackInfo?.platform,
            url: trackInfo?.url,
          };
        });

        setResultCount(srcPlatformTracks?.tracks?.length);
        setIsPlaylist(true);
        setMissingTracks(missingTracks ?? []);

        setSourcePlatform(payload?.platform);
        setTargetPlatform(payload?.target_platform);

        setPlaylistResultItems(playlistItems);
        setPlaylistMeta(playlistMeta);
        setPlaylistUniqueId(payload?.unique_id);
      }
      // delete query params from url
      // const url = new URL(window.location.href);
      // url.searchParams.delete("u");
      // window.history.replaceState({}, "", url.href);
    }
  }, [props.layoutProps?.payload]);

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

  // todo: audit UX & handle event (payload parsing) errors.
  // useEffect for playlist conversion/SSE actions & handlers.
  // Not extracted to a hook because I dont perceive much benefit over converting to hook than leaving here as it is.
  useEffect(() => {
    // short, unique ids (which are what are used to share a single link to a conversion, with users) are 9 to 10
    // in length. We're doing this because we only want to call the SSE endpoint when we're doing a conversion, in which
    // the playlistUniqueId would be a uuid
    if (playlistUniqueId && playlistUniqueId.length > 9) {
      const storedId = localStorage.getItem("clientId");
      const clientId = storedId ?? uuidv7();

      const sseURL = `/api/sse/playlist?clientId=${clientId}&taskId=${playlistUniqueId}`;
      const eventSource = new EventSource(sseURL);

      // not doing anything, a little bit helpful for dev/debugging...
      // console log intentionally commented out and left as it is.
      eventSource.onmessage = (_event) => {};

      // playlist metadata event...
      eventSource.addEventListener(
        `${PLAYLIST_METADATA_EVENT}_${clientId}_${playlistUniqueId}`,
        (eventPayload) => {
          try {
            const payload = JSON.parse(eventPayload.data);

            const playlistMetaInfo = payload as PlaylistMetaInfo;
            const playlistMeta = {
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
            };

            setPlaylistMeta(playlistMeta);

            setSourcePlatform(playlistMetaInfo?.platform);
            setIsConvertingPlaylist(true);
            setIsLoading(false);
            setGoButtonIsDisabled(false);
            return;
          } catch (e) {
            console.log("Error with eventsource message ", e);
          }
        },
      );

      // track conversion event
      eventSource.addEventListener(
        `${PLAYLIST_CONVERSION_TRACK_EVENT}_${clientId}_${playlistUniqueId}`,
        (eventPayload) => {
          try {
            const itemData: PlaylistTrackConversionData = JSON.parse(
              eventPayload.data,
            );
            const trackItems = itemData?.tracks?.map((trackInfo) => {
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
          } catch (e) {
            console.log(
              "Error with eventsource message in track conversion event",
              e,
            );
          }
        },
      );

      // missing tracks event
      eventSource.addEventListener(
        `${PLAYLIST_CONVERSION_MISSING_TRACK_EVENT}_${clientId}_${playlistUniqueId}`,
        (eventPayload) => {
          try {
            const metaPayload: PlaylistMissingTrackEventPayload = JSON.parse(
              eventPayload?.data,
            );
            const missingItemMeta = {
              title: metaPayload?.meta?.item?.title,
              platform: metaPayload?.meta?.platform,
              url: metaPayload?.meta?.item?.url,
            };
            setMissingTracks((prevState) => [...prevState, missingItemMeta]);
            return;
          } catch (e) {
            console.log(
              "Error with eventsource message in track conversion missing track event",
              e,
            );
          }
        },
      );

      // (playlist) conversion done event...
      eventSource.addEventListener(
        `${PLAYLIST_CONVERSION_DONE_EVENT}_${clientId}_${playlistUniqueId}`,
        (eventPayload) => {
          try {
            const payload: PlaylistConversionDonePayload = JSON.parse(
              eventPayload?.data,
            );
            setIsConvertingPlaylist(false);
            setPlaylistShortID(payload?.unique_id);
            Events.unsubscribeClient(clientId, playlistUniqueId);
            return;
          } catch (e) {
            console.log(
              "Error with eventsource message in playlist conversion done event",
              e,
            );
          }
        },
      );

      eventSource.addEventListener("error", (e) => {
        console.log("Error with eventsource", e);
      });

      return () => {
        console.log("Clearing event source connection");
        eventSource.close();
        console.log("Event source connection closed");
      };
    }
  }, [playlistUniqueId]);

  // playlist conversion initial request mutation — calls API to kickstart converting a playlist.
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
      // reset the track result rendering condition states.
      setTrackResults(undefined);
      PlaylistConversionStartedToast();
      // empty previous playlist track results data
      setPlaylistResultItems([]);
      setResultCount(0);
      setMissingTracks([]);
    },
  });

  const handleGoButtonClick = async () => {
    setIsLoading(true);
    if (link && isPlaylist) {
      await playlistMutateAsync({ link, platform: targetPlatform ?? "all" });
      return;
    }

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
            />

            {/** target platforms dropdown. Shown only if the pasted link is a playlist*/}
            {isPlaylist && (
              <div className={"mt-2 w-full"}>
                <PlatformSelectionSelect
                  className={"w-full"}
                  onChange={(value) => {
                    setGoButtonIsDisabled(true);
                    if (value === "applemusic") {
                      UnsupportedPlatformErrorToast();
                      return;
                    }
                    if (link.includes(value)) {
                      InvalidTargetPlatformSelectionErrorToast(
                        getPlatformPrettyNameByKey(value),
                      );
                      return;
                    }
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
            data={{
              id: trackMeta?.id!,
              preview: trackMeta?.preview ?? "",
              artist: trackMeta?.artist!,
              link: trackMeta?.link!,
              cover: trackMeta?.cover!,
              length: trackMeta?.length!,
              title: trackMeta?.title!,
              taskId: trackResults?.unique_id,
            }}
          >
            {trackResults &&
              convertPlatformToResult(
                props?.layoutProps?.payload?.payload?.platforms ??
                  trackResults?.platforms,
              )?.map((item) => {
                return (
                  <TrackPlatformItem
                    id={item.id}
                    key={`$${item.id}-playlist-result-item`}
                    platform={item?.platform}
                    artist={item.artist}
                    link={item.link}
                    title={item.title}
                  />
                );
              })}
          </TrackCard>
        )}

        {/**Playlist card here.*/}
        {!isLoading && playlistUniqueId && playlistMeta && (
          <PlaylistCard data={playlistMeta} unique_id={playlistShortID}>
            {!isLoading &&
              isPlaylist &&
              playlistUniqueId &&
              !isConvertingPlaylist && (
                <div className={"justify-between flex flex-row items-center"}>
                  <span
                    className={"text-xs ml-2"}
                  >{`Showing ${resultCount} of ${playlistMeta?.nb_tracks} ${playlistMeta?.nb_tracks > 1 ? "tracks" : "track"}`}</span>
                  {missingTracks.filter((item) => item.title !== "").length >=
                    1 &&
                    missingTracks[0]?.title !== "" && (
                      <MissingTracksDialog
                        items={missingTracks}
                        source_platform={sourcePlatform!}
                        target_platform={targetPlatform!}
                      />
                    )}
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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const props = {
    layoutProps: {
      seo: DefaultSeoConfig,
      payload: {},
    },
  };

  if (!query?.u) return { props };

  try {
    const resultPreview = await orchdio().fetchConversionPreview(query?.u);
    props.layoutProps.payload = resultPreview;

    // entity is track
    if (resultPreview?.payload?.entity === Entity.TRACK) {
      // todo: pass src and target platforms as part of the result preview api response, then use to populate building meta here.
      const trackMeta = buildTrackResultMetadata(
        resultPreview?.payload?.platforms,
        "spotify",
      );

      props.layoutProps.seo.title = `${trackMeta?.title} • Track Preview`;
      props.layoutProps.seo.description = `Get the links to this track by ${trackMeta?.artist} on your favourite digital streaming platform in just one click. Powered by Zoove`;
      // props.layoutProps.seo.url = `https://zoove.xyz?u=${trackMeta?.id}`;

      // @ts-ignore
      props.layoutProps.seo.openGraph.title = `${trackMeta.title} by ${trackMeta.artist}`;
      // @ts-ignore
      props.layoutProps.seo.openGraph.type = "music.song";

      // not sure what the deal with this part is yet
      let coverURL = trackMeta?.cover;
      // some shenanigans with deezer image asset links
      if (coverURL?.includes("mzstatic.com")) {
        coverURL = coverURL.replace(/{w}x{h}bb.jpg/g, "60x60bb.jpg");
      }

      if (coverURL?.includes("deezer.com")) {
        const rq = await axios.get(coverURL);
        coverURL = rq.request.res.responseUrl;
      }

      // @ts-ignore
      props.layoutProps.seo.openGraph.images.unshift({
        url: coverURL,
      });
    }

    // entity is playlist
    if (resultPreview?.payload?.entity === Entity.PLAYLIST) {
      const payload = resultPreview as PlaylistConversionResultPreview;
      const playlistMeta = payload?.payload?.meta;

      props.layoutProps.seo.description = `${playlistMeta?.title} • Add this playlist to your digital streaming platform library when you connect your account. Powered by Zoove`;
      if (playlistMeta?.owner) {
        props.layoutProps.seo.description = `Checkout playlist "${playlistMeta?.title}" by ${playlistMeta?.owner} on ${getPlatformPrettyNameByKey(payload?.payload?.platform)} • Add this playlist to your digital streaming platform library when you connect your account. Powered by Zoove`;
      }

      // @ts-ignore
      props.layoutProps.seo.openGraph.type = "music.playlist";
      let coverURL = playlistMeta?.cover ?? "";
      // some shenanigans with deezer image asset link
      // intentional duplication.
      if (coverURL?.includes("mzstatic.com")) {
        coverURL = coverURL.replace(/{w}x{h}bb.jpg/g, "60x60bb.jpg");
      }

      if (coverURL?.includes("deezer.com")) {
        const rq = await axios.get(coverURL);
        coverURL = rq.request.res.responseUrl;
      }
      // @ts-ignore
      props.layoutProps.seo.openGraph.images.unshift({
        url: coverURL,
      });
    }
  } catch (e) {
    console.log("Error in server side props", e);
  }
  return { props };
};

Home.getLayout = function getLayout(page: ReactElement<ServerSideProps>) {
  return (
    <Layout
      seo={{
        ...DefaultSeoConfig,
        ...page?.props?.layoutProps?.seo,
      }}
    >
      {page}
    </Layout>
  );
};

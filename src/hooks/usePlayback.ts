/**
 * Original author: @marvinkome. updated to support more return values.
 */

import { useEffect, useRef, useState } from "react";

export const usePlayback = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingTrack, setPlayingTrack] = useState<any>();
  const audioRef = useRef<HTMLAudioElement>(undefined);

  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout>;

    if (isPlaying) {
      setIsPlaying(true);

      // todo: dynamically get this from preview info.
      const duration = 30;

      intervalId = setInterval(
        () => {
          setProgress((prev) => {
            const newProg = prev + 1;

            if (newProg >= 100) {
              clearInterval(intervalId);
              setIsPlaying(false);
              return 0;
            }

            return newProg;
          });
        },
        (duration * 1000) / 100,
      );
    } else setIsPlaying(false);
    setProgress(0);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;

    const onEnd = () => {
      setIsPlaying(false);
      setPlayingTrack(undefined);
      audioRef.current = undefined;
    };

    audioRef.current.addEventListener("ended", onEnd);
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", onEnd);
      }
    };
  }, []);

  const handlePlay = async (url: string) => {
    // to resume playing
    if (audioRef.current && playingTrack === url) {
      setIsPlaying(true);
      return audioRef.current.play();
    }

    // to preview different url
    if (audioRef.current && playingTrack !== url) {
      // pause current track
      audioRef.current.pause();
    }

    // create new audio context
    audioRef.current = new Audio(url);
    await audioRef.current.play();

    setPlayingTrack(url);
    setIsPlaying(true);
  };

  const handlePause = () => {
    2;
    if (!audioRef.current) return;

    setIsPlaying(false);
    audioRef.current.pause();
  };

  return { handlePlay, handlePause, isPlaying, playingTrack, progress };
};

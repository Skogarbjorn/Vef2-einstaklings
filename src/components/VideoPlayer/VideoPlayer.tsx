"use client";

import Hls from "hls.js";
import downloadAudio, { downloadSubtitle } from "../../lib/download.ts";
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { ISource } from "@consumet/extensions";
import Loading from "../Loading/Loading.tsx";

export default function VideoPlayer({
  title,
  episode,
  episodeId,
  subtitlePath,
}: {
  title: string | null | undefined;
  episode: ISource | null | undefined;
  episodeId: string | null | undefined;
  subtitlePath: string | null | undefined;
}) {
  const [trackKey, setTrackKey] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    setTrackKey(Date.now());
  }, [subtitlePath]);

  useEffect(() => {
    if (title && episode && episodeId) {
      setLoading(false);
      //downloadAudio(episode.sources[0].url, episodeId)
      //  .then((url) => {
      //    console.log(url);
      //  })
      //  .catch((err) => {
      //    console.log(err);
      //  });
    } else {
      setLoading(true);
    }
  }, [title, episode, episodeId]);

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!episode?.sources?.[0]?.url || !videoRef.current) return;

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls();
      hlsRef.current = hls;

      console.log(episode.sources[0].url);
      hls.loadSource(episode.sources[0].url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (videoRef.current) {
          videoRef.current.play().catch((e) => {
            console.error("Autoplay failed:", e);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable HLS error");
              break;
          }
        }
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = episode.sources[0].url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [episode]);

  console.log(subtitlePath);

  return (
    <div className="rounded-[1rem] overflow-hidden">
      {loading ? (
        <Loading width="100%" height="30rem" />
      ) : (
        <video ref={videoRef} controls width="100%" height="auto">
          {subtitlePath && (
            <track
              key={trackKey}
              src={`/${subtitlePath}`}
              kind="subtitles"
              srcLang="en"
              label="English"
              default
            />
          )}
        </video>
      )}
    </div>
  );
}

"use client";

import Hls from "hls.js";
import downloadAudio, { downloadSubtitle } from "../../lib/download.ts";
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

export default function VideoPlayer({
  title,
  episode,
  episodeId,
  subtitlePath,
}) {
  //downloadAudio(episode.sources[0].url, episodeId).then((url) => {
  //console.log(url);
  // HERE WE SHOULD QUEUE WHISPER AND GET SUBTITLE FILE IN public/
  // PROBABLY BETTER TO MOVE THIS LOGIC OUTSIDE VideoPlayer...
  //});

  const [trackKey, setTrackKey] = useState(Date.now());

  const videoRef = useRef(null);

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();

      hls.loadSource(episode.sources[0].url);
      hls.attachMedia(videoRef.current);
    }
  }, [episode]);

  useEffect(() => {
    setTrackKey(Date.now());
  }, [subtitlePath]);

  console.log(subtitlePath);

  return (
    <div>
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
    </div>
  );
}

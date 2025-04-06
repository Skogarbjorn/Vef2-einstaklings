"use client";

import Info from "../../../components/Info/Info.tsx";
import SubtitleBrowser from "../../../components/Play/SubtitleBrowser/SubtitleBrowser.tsx";
import VideoPlayer from "../../../components/VideoPlayer/VideoPlayer.tsx";
import { fetchEpisode, fetchShowInfo } from "../../../lib/api.ts";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EpisodeBrowser from "../../../components/Play/EpisodeBrowser/EpisodeBrowser.tsx";
import { Episode } from "../../../types/episode.ts";

export default function ShowPage() {
  const params = useParams();
  const id = params.id;
  const [info, setInfo] = useState(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [episodeFromId, setEpisodeFromId] = useState(null);
  const [subtitlePath, setSubtitlePath] = useState("");

  const [nextSubtitleFlash, setNextSubtitleFlash] = useState(false);

  useEffect(() => {
    async function load() {
      const lastEpisode = JSON.parse(
        localStorage.getItem("lastEpisode") || "{}",
      );

      const res = await fetchShowInfo(String(id));

      const currentEpisodeId =
        Object.keys(lastEpisode).length === 0
          ? res.episodes[0].id
          : lastEpisode[res.id].episodeId;

      const epres = await fetchEpisode(currentEpisodeId);
      setInfo(res);
      setEpisode(res.episodes.find((e: Episode) => e.id === currentEpisodeId));
      setEpisodeFromId(epres);
    }
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (info && episode) {
        localStorage.setItem(
          "lastEpisode",
          JSON.stringify({ showId: info.id, episodeId: episode.id }),
        );
      }
    };
  }, []);

  console.log(info);
  console.log(episode);

  function onSubDownloaded(path: string) {
    setSubtitlePath(path);
  }

  async function handleNewEpisode(next: boolean, newEpisode?: Episode) {
    if (next) {
      setNextSubtitleFlash(false);

      const nextEpisode = info.episodes.find(
        (e: Episode) => e.number === episode.number + 1,
      );
      if (!nextEpisode) {
        return;
      }
      const res = await fetchEpisode(nextEpisode.id);

      setEpisode(nextEpisode);
      setEpisodeFromId(res);
      setNextSubtitleFlash(true);
    } else if (newEpisode) {
      const res = await fetchEpisode(newEpisode.id);

      setEpisode(newEpisode);
      setEpisodeFromId(res);
    }
  }

  return (
    <>
      {info && episode && (
        <div>
          <Info info={info} />
          <EpisodeBrowser
            currentEpisode={episode}
            episodeList={info.episodes}
            handleNewEpisode={handleNewEpisode}
          />
          <SubtitleBrowser
            title={info.title}
            onSubDownloaded={onSubDownloaded}
            nextSubtitle={nextSubtitleFlash}
          />
          <VideoPlayer
            title={info.title}
            episode={episodeFromId}
            episodeId={episode.id}
            subtitlePath={subtitlePath}
          />
        </div>
      )}
    </>
  );
}

"use client";

import Info from "../../components/Info/Info.tsx";
import Recommendations from "../../components/Recommendations/Recommendations.tsx";
import SubtitleBrowser from "../../components/Play/SubtitleBrowser/SubtitleBrowser.tsx";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer.tsx";
import { fetchEpisode, fetchShowInfo } from "../../lib/api.ts";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EpisodeBrowser from "../../components/Play/EpisodeBrowser/EpisodeBrowser.tsx";
import { Episode } from "../../types/episode.ts";
import { IAnimeInfo } from "@consumet/extensions";
import Content from "../Content/Content.tsx";

export default function Play() {
  const params = useParams();
  const id = params.id;
  const [info, setInfo] = useState<IAnimeInfo | null>(null);
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
      console.log(res);
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
    <div className="flex flex-col lg:flex-row gap-8 lg:items-start w-full p-4 justify-center">
      {/* Wrapper for both sidebars on lg, which will be split on xl */}
      <div className="flex flex-col gap-4 w-full lg:w-[30%] 2xl:w-[20%] lg:sticky lg:top-8 lg:h-screen flex-grow 2xl:hidden">
        <div className="order-1 lg:order-1 2xl:order-1 w-full 2xl:flex 2xl:flex-row-reverse w-full">
          <EpisodeBrowser
            currentEpisode={episode}
            episodeList={info?.episodes}
            handleNewEpisode={handleNewEpisode}
          />
        </div>
        <div className="order-2 lg:order-2 2xl:order-3 w-full lg:sticky lg:top-8 lg:h-screen">
          <SubtitleBrowser
            title={info?.title}
            onSubDownloaded={onSubDownloaded}
            nextSubtitle={nextSubtitleFlash}
          />
        </div>
      </div>

      <div className="hidden 2xl:flex sticky top-8 h-screen order-1 2xl:w-[20vw] flex-row-reverse">
        <EpisodeBrowser
          currentEpisode={episode}
          episodeList={info?.episodes}
          handleNewEpisode={handleNewEpisode}
        />
      </div>

      <div className="order-3 lg:order-3 2xl:order-2">
        <Content>
          <VideoPlayer
            title={info?.title}
            episode={episodeFromId}
            episodeId={episode?.id}
            subtitlePath={subtitlePath}
          />
          <Info info={info} />
          <Recommendations info={info} />
        </Content>
      </div>

      <div className="hidden 2xl:block sticky top-8 h-screen order-3 2xl:w-[20vw]">
        <SubtitleBrowser
          title={info?.title}
          onSubDownloaded={onSubDownloaded}
          nextSubtitle={nextSubtitleFlash}
        />
      </div>
    </div>
  );
}

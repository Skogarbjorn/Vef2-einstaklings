import { Episode } from "../../../types/episode.ts";
import React from "react";

export default function EpisodeBrowser({
  currentEpisode,
  episodeList,
  handleNewEpisode,
}: {
  currentEpisode: Episode;
  episodeList: Episode[];
  handleNewEpisode: (next: boolean, episode?: Episode) => void;
}) {
  return (
    <div>
      <ul>
        {episodeList.map((episode) => (
          <li
            key={episode.number}
            onClick={() =>
              handleNewEpisode(
                episode.number === currentEpisode.number + 1,
                episode,
              )
            }
          >
            <p>
              {episode.number}. {episode.title}{" "}
              {episode.id === currentEpisode.id ? "current" : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

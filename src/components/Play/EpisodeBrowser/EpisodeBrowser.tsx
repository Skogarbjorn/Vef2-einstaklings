"use client";

import { Episode } from "../../../types/episode.ts";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import Loading from "../../Loading/Loading.tsx";

export default function EpisodeBrowser({
  currentEpisode,
  episodeList,
  handleNewEpisode,
}: {
  currentEpisode: Episode | null | undefined;
  episodeList: Episode[] | null | undefined;
  handleNewEpisode: (next: boolean, episode?: Episode) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentEpisode && episodeList) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [currentEpisode, episodeList]);

  function handleCollapse() {
    setCollapsed(!collapsed);
  }

  const variants = {
    normal: { scale: 1 },
    hover: { scale: 1.2 },
    tap: { scale: 0.6 },
  };

  return (
    <motion.div
      className="rounded-[1rem] overflow-hidden bg-midtone 2xl:max-w-[30rem] 2xl:w-full flex flex-col"
      animate={{ maxHeight: collapsed ? "5rem" : "50rem" }}
      initial={{ maxHeight: "50rem" }}
      transition={{ type: "easeOut", duration: 0.4 }}
    >
      <div>
        <motion.div
          className="flex flex-row gap-3 bg-foreground p-6 pt-7 px-7 w-full relative shadow-2xl z-50"
          onClick={handleCollapse}
          initial="normal"
          whileHover="hover"
          whileTap="tap"
        >
          <span className="-translate-y-[-3px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="21"
              fill="none"
              viewBox="0 0 19 21"
            >
              <path
                fill="var(--accent)"
                stroke="var(--accent)"
                d="M1 18.483V2.58C1 1.015 2.716.057 4.049.877l13.137 8.089c1.28.788 1.266 2.653-.026 3.422L4.022 20.202C2.69 20.995 1 20.034 1 18.483Z"
              ></path>
            </svg>
          </span>
          <div className="flex items-center w-full overflow-hidden whitespace-nowrap gap-8">
            {loading ? (
              <Loading width="20rem" height="1rem" color="highlight" />
            ) : (
              <p className="text-transparent animate-marquee bg-clip-text bg-gradient-to-br from-accent to-highlight/70">
                {"Episode "}
                {currentEpisode?.number}
                {": "}
                {currentEpisode?.title}
              </p>
            )}
            <div className="absolute right-18 top-0 bottom-0 w-12 bg-gradient-to-l from-foreground to-transparent" />
          </div>
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="42"
            height="15"
            fill="none"
            viewBox="0 0 32 9"
            animate={{ rotate: collapsed ? 180 : 0 }}
            layout
            transition={{ type: "easeInOut", duration: 0.3 }}
            variants={variants}
            className="-translate-y-[-6px]"
          >
            <path
              fill="var(--accent)"
              d="M27 9H4.5a4.5 4.5 0 0 1 0-9H27a4.5 4.5 0 1 1 0 9"
            ></path>
          </motion.svg>
        </motion.div>
      </div>
      <ul
        className={`flex flex-col overflow-y-auto h-[90%] pt-[2px] ${
          loading ? "gap-3 p-4 mt-3" : ""
        }`}
      >
        {loading
          ? Array.from({ length: 10 }).map((e, index) => (
              <li key={index}>
                <Loading width="100%" height="4rem" />
              </li>
            ))
          : episodeList?.map((episode, index) => (
              <li
                key={index}
                className={`p-4 px-10 z-20 ${
                  episode.id === currentEpisode?.id
                    ? "bg-highlight"
                    : "bg-foreground/80"
                } border-y-1 border-background shadow-xl ${
                  episode.id === currentEpisode?.id
                    ? "text-background"
                    : "text-off-white"
                } hover:z-30 hover:[--tw-shadow-color:var(--color-background)] hover:shadow-lg hover:-translate-y-[2px] hover:-translate-x-[1px] hover:brightness-116 transition-all duration-100`}
                key={episode.number}
                onClick={() =>
                  handleNewEpisode(
                    episode.number === currentEpisode.number + 1,
                    episode,
                  )
                }
              >
                <p>
                  {episode.number}. {episode.title}
                </p>
              </li>
            ))}
      </ul>
    </motion.div>
  );
}

"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import { fetchShowSubtitleState, fetchState } from "../../../lib/api.ts";
import { SubtitleState, SubtitleStateResult } from "../../../types/subtitle.ts";
import { downloadSubtitle } from "../../../lib/download.ts";
import { deleteSubs } from "../../../lib/delete.ts";
import { motion } from "motion/react";
import Loading from "../../Loading/Loading.tsx";

const isSubtitle = /\.(ass|srt|vtt)$/i;
const isCompressed = /\.zip$/i;

function depthReducer(state, action) {
  switch (action.type) {
    case "back":
      return { depth: state.depth - 1 };
    case "forward":
      return { depth: state.depth + 1 };
    case "reset":
      return { depth: 0 };
    default:
      return state;
  }
}

export default function SubtitleBrowser({
  title,
  onSubDownloaded,
  nextSubtitle,
}: {
  title: string | null | undefined;
  onSubDownloaded: (path: string) => void;
  nextSubtitle: boolean;
}) {
  const [initialLoading, setInitialLoading] = useState(true);

  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const [collapsed, setCollapsed] = useState(false);
  const [depth, changeDepth] = useReducer(depthReducer, { depth: 1 });
  const [state, setState] = useState<SubtitleState>(null);
  const [focused, setFocused] = useState<SubtitleStateResult | null>(null);
  const [clicked, setClicked] = useState<SubtitleStateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (nextSubtitle && clicked && state) {
      console.log("next subtitle");
    }
  }, [nextSubtitle]);

  useEffect(() => {
    async function loadDefaultState() {
      if (!title) return;
      setInitialLoading(true);
      const res = await fetchShowSubtitleState(title);
      console.log(res);
      if (!res.success) {
        setError("Failed to find show automatically");
        changeDepth({ type: "reset" });
      }
      setState(res.state);
      setInitialLoading(false);
    }
    loadDefaultState();
  }, [title]);

  useEffect(() => {
    return () => {
      console.log("trying to delete subs");
      deleteSubs();
    };
  }, []);

  useEffect(() => {
    console.log(state);
  }, [state]);

  async function handleBack() {
    if (!state) return;
    setClicked({ url: "..", name: "Go Back" });
    setLoading(true);

    if (state.prevResult) {
      const res = await fetchState(state.prevResult);
      setFocused(state.currentResult);
      setState(res.state);
    } else {
      const trimmed = state.currentResult.url.endsWith("/")
        ? state.currentResult.url.slice(0, -1)
        : state.currentResult.url;
      const res = await fetchState({
        url: trimmed.slice(0, trimmed.lastIndexOf("/") + 1),
        name: state.currentResult.name,
      });
      setFocused(state.currentResult);
      setState(res.state);
    }

    changeDepth({ type: "back" });
    setLoading(false);
    setClicked(null);
  }

  async function handleForward(result: SubtitleStateResult) {
    if (!state) return;
    setClicked(result);
    setLoading(true);

    const res = await fetchState(result, state.currentResult);

    console.log(res);

    changeDepth({ type: "forward" });
    setLoading(false);
    setClicked(null);
    setState(res.state);
  }

  async function handleDownload(result: SubtitleStateResult) {
    setClicked(result);
    setLoading(true);

    const res = await downloadSubtitle(result.url);

    setLoading(false);

    if (res.fileType === "subtitle") {
      onSubDownloaded(res.path);
    } else {
      if (!state) return;
      console.log(res);
      setClicked(null);
      changeDepth({ type: "forward" });
      setState({
        prevResult: state.currentResult,
        currentResult: { url: res.path, name: "compressed" },
        results: res.contents,
      });
    }
  }

  function handleFileBrowser(result: SubtitleStateResult) {
    onSubDownloaded(result.url);
    setClicked(result);
  }

  function handleCollapse() {
    setCollapsed(!collapsed);
  }

  const variants = {
    normal: { scale: 1 },
    hover: { scale: 1.2 },
    tap: { scale: 0.6 },
  };

  useEffect(() => {
    if (!focused?.name) return;

    const el = itemRefs.current.get(focused.name);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [focused]);

  return (
    <motion.div
      className="rounded-[1rem] overflow-hidden bg-midtone flex flex-col 2xl:max-w-[30rem] 2xl:w-full"
      animate={{ maxHeight: collapsed ? "5rem" : "50rem" }}
      initial={{ maxHeight: "50rem" }}
      transition={{ type: "easeOut", duration: 0.4 }}
    >
      <div>
        <motion.div
          className="flex flex-row gap-3 bg-foreground p-6 pt-7 px-7 w-full min-h-[5rem] relative shadow-2xl z-50 hover:brightness-126 transition-all duration-300 shrink"
          onClick={() => (depth.depth > 0 ? handleBack() : null)}
        >
          {depth.depth > 0 ? (
            <>
              {loading && clicked.name === "Go Back" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-4 border-t-highlight border-foreground -translate-y-[-5px]" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="14"
                  fill="none"
                  viewBox="0 0 18 14"
                  style={{ scale: 1.25 }}
                  className="-translate-y-[-7px]"
                >
                  <path
                    fill="var(--accent)"
                    d="m1.451 4.553 4.506-3.195c1.987-1.409 4.735.012 4.735 2.447V4.5H15.5a2.5 2.5 0 0 1 0 5h-4.808v.695c0 2.435-2.748 3.856-4.735 2.447L1.451 9.447c-1.686-1.196-1.686-3.698 0-4.894"
                  ></path>
                </svg>
              )}
              <div className="flex flex-1 flex-grow items-center w-full overflow-hidden whitespace-nowrap gap-8">
                {initialLoading ? (
                  <Loading width="20rem" height="1rem" color="highlight" />
                ) : (
                  <p className="text-transparent animate-marquee bg-clip-text bg-gradient-to-br from-accent to-highlight/70">
                    {state?.currentResult.name}
                  </p>
                )}
              </div>
              <div className="absolute right-18 top-0 bottom-0 w-12 bg-gradient-to-l from-foreground to-transparent" />
            </>
          ) : (
            <div className="w-full whitespace-nowrap gap-8">
              {initialLoading ? (
                <Loading width="20rem" height="1rem" color="highlight" />
              ) : (
                <p className="text-highlight">Index/</p>
              )}
            </div>
          )}
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="9"
            fill="none"
            viewBox="0 0 32 9"
            animate={{ rotate: collapsed ? 180 : 0 }}
            initial="normal"
            whileHover="hover"
            whileTap="tap"
            onClick={(e) => {
              e.stopPropagation();
              handleCollapse();
            }}
            variants={variants}
            transition={{ type: "easeInOut", duration: 0.3 }}
            className="-translate-y-[-7px]"
          >
            <path
              fill="var(--accent)"
              d="M27 9H4.5a4.5 4.5 0 0 1 0-9H27a4.5 4.5 0 1 1 0 9"
            ></path>
          </motion.svg>
        </motion.div>
      </div>
      <ul
        className={`flex flex-col overflow-y-auto h-full pt-[2px] ${
          initialLoading ? "gap-3 p-4 mt-3" : ""
        }
				`}
      >
        {initialLoading
          ? Array.from({ length: 10 }).map((e, index) => (
						  <li key={index} >
								<Loading width="100%" height="4rem" />
							</li>
            ))
          : state?.results.map((result, index) => (
              <li
                ref={(el) => {
                  if (el) itemRefs.current.set(result.name, el);
                  else itemRefs.current.delete(result.name);
                }}
                className={`p-4 z-20 w-full min-h-[4rem] flex flex-row align-center items-center overflow-hidden whitespace-nowrap ${
                  result === clicked && !loading
                    ? "bg-highlight"
                    : "bg-foreground/80"
                } border-y-1 border-background shadow-xl ${
                  result === clicked && !loading
                    ? "text-background"
                    : "text-off-white"
                } hover:z-30 hover:[--tw-shadow-color:var(--color-background)] hover:shadow-lg hover:-translate-y-[2px] hover:-translate-x-[1px] hover:brightness-116 transition-all duration-100`}
                data-name={result.name}
                key={index}
                onClick={() =>
                  depth.depth === 0
                    ? handleForward(result)
                    : depth.depth > 1
                      ? handleFileBrowser(result)
                      : handleDownload(result)
                }
              >
                <p className="flex flex-row gap-4 items-center">
                  {result === clicked && !loading ? null : result === clicked &&
                    loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-4 border-t-highlight border-foreground -translate-y-[-5px]" />
                  ) : isCompressed.test(result.name) ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="24"
                      fill="none"
                      viewBox="0 0 25 24"
                    >
                      <path
                        stroke="var(--highlight)"
                        strokeWidth="2"
                        d="M3 8.934a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h19a2 2 0 0 1 2 2v4.434a1.5 1.5 0 0 1-1.5 1.5m-19.5 0V21a2 2 0 0 0 2 2h15.5a2 2 0 0 0 2-2V8.934m-19.5 0h19.5m-16 4.328H19"
                      ></path>
                    </svg>
                  ) : isSubtitle.test(result.name) ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="32"
                      fill="none"
                      viewBox="0 0 21 32"
                      style={{ scale: 0.8 }}
                    >
                      <path
                        fill="var(--highlight)"
                        d="m1.586 6.815 4.686-4.979c.62-.66 1.728-.22 1.728.686V7.5a1 1 0 0 1-1 1H2.314c-.876 0-1.328-1.047-.728-1.685"
                      ></path>
                      <path
                        fill="var(--highlight)"
                        d="M0 30.5v-18a1 1 0 0 1 1-1h8.5a1 1 0 0 0 1-1V1a1 1 0 0 1 1-1H20a1 1 0 0 1 1 1v29.5a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1"
                      ></path>
                    </svg>
                  ) : result.name.endsWith("/") ? null : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="30"
                      fill="none"
                      viewBox="0 0 18 30"
                      className="-translate-x-[-2px]"
                    >
                      <path
                        fill="var(--highlight)"
                        d="M0 9.227a2 2 0 1 0 4 0zM6.5 22a2 2 0 0 0 4 0zm4 5.5a2 2 0 1 0-4 0zm-4 .5a2 2 0 0 0 4 0zM4 9.227c0-1.062.304-2.45 1.027-3.509C5.684 4.755 6.712 4 8.5 4V0C5.288 0 3.066 1.495 1.723 3.464.446 5.336 0 7.562 0 9.227zM8.5 4c2.214 0 3.51.78 4.286 1.695C13.61 6.67 14 7.99 14 9.227h4c0-1.99-.61-4.284-2.16-6.116C14.24 1.221 11.785 0 8.5 0zM14 9.227c0 2.233-1.554 3.755-2.75 4.711l2.5 3.124C15.053 16.018 18 13.448 18 9.227zm-2.75 4.711C8.606 16.054 6.5 18.568 6.5 22h4c0-1.569.895-3.054 3.25-4.938zM6.5 27.5v.5h4v-.5z"
                      ></path>
                    </svg>
                  )}{" "}
                  {result.name}{" "}
                </p>
              </li>
            ))}
      </ul>
    </motion.div>
  );
}

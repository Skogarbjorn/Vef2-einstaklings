"use client";

import React, { useEffect, useReducer, useState } from "react";
import { fetchShowSubtitleState, fetchState } from "../../../lib/api.ts";
import { SubtitleState, SubtitleStateResult } from "../../../types/subtitle.ts";
import { downloadSubtitle } from "../../../lib/download.ts";
import { deleteSubs } from "../../../lib/delete.ts";
import next from "next";

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
  title: string;
  onSubDownloaded: (path: string) => void;
  nextSubtitle: boolean;
}) {
  const [initialLoading, setInitialLoading] = useState(true);

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
  }, []);

  // Cleanup to delete subs when unloading this component
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

  return (
    <div>
      <ul>
        {depth.depth > 0 && (
          <li>
            <button onClick={() => handleBack()}>Go Back</button>
          </li>
        )}
        {state?.results.map((result, index) => (
          <li
            key={index}
            onClick={() =>
              depth.depth === 0
                ? handleForward(result)
                : depth.depth > 1
                  ? handleFileBrowser(result)
                  : handleDownload(result)
            }
          >
            <p>
              {result.name}{" "}
              {result === clicked ? (loading ? "o" : "selected") : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

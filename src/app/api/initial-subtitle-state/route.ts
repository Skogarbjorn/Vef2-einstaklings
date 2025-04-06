import { NextResponse } from "next/server";
import { SubtitleState } from "../../../types/subtitle.ts";
import {
  fetchAlternativeTyping,
  fetchDefaultState,
  fetchState,
  searchList,
} from "../helpers.ts";

export async function POST(request: Request) {
  const req_json = await request.json();
  const searchTitle = req_json.title;
  const possibleTitles = await fetchAlternativeTyping(searchTitle);
  const defaultState = await fetchDefaultState();

  let finalSearchResult: SubtitleState = null;
  let searchEnd: string = "";

  for (const title of possibleTitles) {
    let searchResult: SubtitleState = null;
    const words = title.split(" ");
    let prevWords = words;

    while (
      (!searchResult || searchResult.results.length === 0) &&
      words.length >= 1
    ) {
      searchResult = searchList(words.join(" "), defaultState);
      prevWords = words;
      words.pop();
    }

    if (
      searchEnd.length === 0 ||
      searchEnd.split(" ").length < prevWords.length
    ) {
      searchEnd = prevWords.join(" ");
      finalSearchResult = searchResult;
    }
  }

  if (finalSearchResult && finalSearchResult.results.length > 0) {
    const result = await fetchState(finalSearchResult.results[0]);
    return NextResponse.json({
      success: true,
      state: result,
      searchEnd,
      finalSearchResult,
    });
  }
  return NextResponse.json({ success: false, state: defaultState });
}

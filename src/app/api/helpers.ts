import * as cheerio from "cheerio";
import Fuse from "fuse.js";
import { SubtitleState, SubtitleStateResult } from "../../types/subtitle.ts";

const japaneseSubsListUrl = "https://kitsunekko.net/subtitles/japanese/";

export async function fetchDefaultState(): Promise<SubtitleState> {
  return await fetchState({ url: japaneseSubsListUrl, name: "japanese" });
}

export async function fetchState(
  result: SubtitleStateResult,
  currentResult?: SubtitleStateResult,
): Promise<SubtitleState> {
  const res = await fetch(result.url);
  const html = await res.text();

  const $ = cheerio.load(html);
  const results: SubtitleStateResult[] = [];

  $("a").each((_, el) => {
    const name = $(el).text().trim();
    const url = $(el).attr("href");
    if (name && url && !name.includes("Parent Directory")) {
      results.push({ url: result.url + url, name });
    }
  });

  if (currentResult) {
    return {
      prevResult: currentResult,
      currentResult: result,
      results,
    };
  }
  return {
    currentResult: result,
    results,
  };
}

export function searchList(query: string, state: SubtitleState): SubtitleState {
  if (!state) return null;

  const fuse = new Fuse(state.results, {
    includeScore: true,
    threshold: 0.3,
    keys: ["name"],
  });

  const results = fuse.search(query);

  return {
    ...state,
    results: state.results
      .filter((result) => results.some((r) => r.item.name === result.name))
      .map((result) => {
        return { ...result, url: result.url };
      }),
  };
}

export async function fetchAlternativeTyping(title: string): Promise<string[]> {
  const query = `
	query ($title: String) {
		Media(search: $title, type: ANIME) {
			title {
				english
				romaji
				userPreferred
			}
		}
	}
	`;

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { title },
    }),
  });

  const { data } = await response.json();
  if (!data.Media) return [title];
  const alternativeTitlesJSON = data.Media.title;
  const alternativeTitles = [
    alternativeTitlesJSON.english,
    alternativeTitlesJSON.romaji,
    alternativeTitlesJSON.userPreferred,
  ];
  return alternativeTitles;
}

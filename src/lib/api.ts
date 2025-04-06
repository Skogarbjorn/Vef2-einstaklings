import { SubtitleStateResult } from "../types/subtitle.ts";

const service = "zoro";

export async function fetchShows(query: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CONSUMET_API_BASE_URL}/anime/${service}/${query}`,
    );
    if (!response.ok) {
      throw new Error(`Error ${response.status}: Failed to fetch shows`);
    }
    const data = await response.json();
    return data.results;
  } catch (err) {
    return err as Error;
  }
}

export async function fetchShowInfo(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CONSUMET_API_BASE_URL}/anime/${service}/info?id=${id}`,
    );
    if (!response.ok) {
      throw new Error(`Error ${response.status}: Failed to fetch show info`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    return err as Error;
  }
}

export async function fetchEpisode(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CONSUMET_API_BASE_URL}/anime/${service}/watch/${id}`,
    );
    if (!response.ok) {
      throw new Error(`Error ${response.status}: Failed to fetch show info`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    return err as Error;
  }
}

export async function fetchShowSubtitleState(title: string) {
  const data = await fetch("/api/initial-subtitle-state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  }).then((res) => res.json());

  return data;
}

export async function fetchState(
  result: SubtitleStateResult,
  currentResult?: SubtitleStateResult,
) {
  const data = await fetch("/api/subtitle-state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentResult, result }),
  }).then((res) => res.json());

  return data;
}

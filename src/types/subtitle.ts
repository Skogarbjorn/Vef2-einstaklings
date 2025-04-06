export type SubtitleState = {
  currentResult: SubtitleStateResult;
  prevResult?: SubtitleStateResult;
  results: SubtitleStateResult[];
} | null;

export type SubtitleStateResult = {
  url: string;
  name: string;
};

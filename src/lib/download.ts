export default async function downloadAudio(
  streamingLink: string,
  episodeName: string,
): Promise<string> {
  const data = await fetch("/api/extract-audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ streamingLink, episodeName }),
  }).then((res) => res.json());

  if (data.success) {
    return Promise.resolve(data.url);
  }

  return Promise.reject(data);
}

export async function downloadSubtitle(url: string) {
  const data = await fetch("/api/download-subtitle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).then((res) => res.json());

  return data;
}

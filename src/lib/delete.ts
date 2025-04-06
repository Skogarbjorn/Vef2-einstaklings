export async function deleteSubs() {
  const res = await fetch("/api/delete-subs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  return res;
}

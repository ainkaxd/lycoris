export async function predictOne(file: File) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${base}/predict`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    cleanliness_label: string;
    cleanliness_score: number;
    damage_label: string;
    damage_score: number;
  }>;
}

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILES = 4;
const ALLOWED = new Set(["image/jpeg", "image/png"]);
const MAX_SIZE = 8 * 1024 * 1024; // 8MB (доп. серверный стопер)

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    // ожидаем ровно 4 файла в поле "images"
    const files = form.getAll("images") as File[];
    if (files.length !== MAX_FILES || files.some(f => !(f instanceof File))) {
      return NextResponse.json(
        { error: 'Нужно ровно 4 файла в поле "images[]"' },
        { status: 400 }
      );
    }

    // (опционально) базовые серверные проверки
    for (const f of files) {
      if (!ALLOWED.has(f.type)) {
        return NextResponse.json({ error: "Допустимы только JPG/PNG" }, { status: 400 });
      }
      if (typeof f.size === "number" && f.size > MAX_SIZE) {
        return NextResponse.json({ error: "Файл слишком большой (>8MB)" }, { status: 400 });
      }
    }

    // соберём новое FormData для ML: ключ тоже "images"
    const fd = new FormData();
    files.forEach((f, i) => fd.append("images", f, f.name || `img_${i + 1}.jpg`));

    const url = process.env.ML_API_URL || process.env.ML_PREDICT_URL;

    // Мок на случай, если переменная окружения не задана (локальная разработка без ML)
    if (!url) {
      const rnd = Math.random();
      const damage = rnd < 0.15 ? "critical" : rnd < 0.55 ? "minor" : "ideal";
      return NextResponse.json({
        perImage: Array.from({ length: 4 }, (_, k) => ({
          needsRetake: false,
          reasons: [],
          quality_score: 25 + Math.random() * 10,
          damage: k === 0 ? damage : "no_damage",
          damage_confidence: 0.6 + Math.random() * 0.35
        })),
        summary: { damage_distribution: { no_damage: 3, [damage]: 1 }, retakes: 0 }
      });
    }

    // Проксируем на FastAPI /predict
    const upstream = await fetch(url, { method: "POST", body: fd });
    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json({ error: `ML ${upstream.status}: ${text}` }, { status: 502 });
    }
    const data = await upstream.json(); // ожидаем { perImage, summary }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

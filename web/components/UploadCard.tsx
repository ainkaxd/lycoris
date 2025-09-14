'use client';
import React, { useMemo, useState } from 'react';

const MAX_MB = 8;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

type Props = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onAssess: () => void;
  loading?: boolean;
};

export default function UploadCard({ files, onFilesChange, onAssess, loading }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState(false);

  const previews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files]);
  const ready = files.length === 4;

  function validateOne(f: File): string | null {
    if (!ALLOWED.includes(f.type)) return 'Поддерживаются JPG/PNG/WebP.';
    if (f.size > MAX_MB * 1024 * 1024) return `Файл больше ${MAX_MB} MB.`;
    return null;
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const next = [...files];
    for (const f of Array.from(list)) {
      if (next.length >= 4) break;
      const err = validateOne(f);
      if (err) { setError(err); return; }
      const dup = next.some(x => x.name === f.name && x.size === f.size);
      if (dup) { setError('Похоже, одно из фото уже добавлено'); return; }
      next.push(f);
    }
    onFilesChange(next);
  }

  function removeAt(i: number) {
    const next = files.slice();
    next.splice(i, 1);
    onFilesChange(next);
  }

  return (
    <div className="bg-[var(--color-card)] rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Загрузи 4 фото авто</h2>

      <div
        className={`mb-4 rounded-xl border border-zinc-700 p-6 ${hover ? 'bg-zinc-800/70' : 'bg-zinc-800/50'}`}
        onDragOver={(e) => { e.preventDefault(); setHover(true); }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => { e.preventDefault(); setHover(false); addFiles(e.dataTransfer.files); }}
      >
        <p className="opacity-80 mb-3">Перетащи сюда фото или добавляй по одной:</p>

        <div className="flex items-center gap-3">
          <label htmlFor="images" className="btn-accent button-like cursor-pointer px-4 py-2 rounded-lg bg-lime-500 text-black">
            Добавить фото
          </label>
          <input
            id="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            multiple
            onChange={(e) => addFiles(e.target.files)}
          />
          <span className={`text-sm ${ready ? 'text-lime-400' : 'opacity-70'}`}>
            {files.length ? `Загружено ${files.length}/4` : 'Файлы не выбраны'}
          </span>
        </div>
      </div>

      {error && <div className="mb-3 text-sm text-lime-400">{error}</div>}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} alt={`p${i}`} className="rounded-lg w-full h-auto" />
              <button
                onClick={() => removeAt(i)}
                className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md border border-zinc-600"
                style={{ background: 'rgba(0,0,0,.55)' }}
                title="Удалить"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onAssess}
          disabled={!files.length || loading}
          className="button-like flex-1 py-4 rounded-xl text-base font-medium bg-lime-500 text-black disabled:opacity-50"
        >
          {loading ? 'Анализируем…' : 'Оценить состояние'}
        </button>
        <button
          onClick={() => onFilesChange([])}
          className="button-like px-4 rounded-xl text-base"
          style={{ background: 'rgba(192,241,28,.10)', border: '1px solid #3a3f47' }}
        >
          Очистить
        </button>
      </div>

      <p className="text-xs opacity-60 mt-3">
        Необходимые ракурсы: спереди, сзади, слева, справа. Каждое фото не должно превышать 8мб.
      </p>
    </div>
  );
}

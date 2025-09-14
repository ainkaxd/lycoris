import React, { useState, useRef } from "react";

const MAX_FILES = 4;
const MAX_SIZE_MB = 8;
const MIN_W = 1024;
const MIN_H = 768;

export default function PhotoUploader({ onSubmit }) {
  const [items, setItems] = useState([]); 
  const inputRef = useRef(null);

  const handlePick = () => inputRef.current?.click();

  const handleFiles = async (files) => {
    const slice = Array.from(files).slice(0, MAX_FILES);
    const evaluated = await Promise.all(slice.map(evaluateImageFile));
    setItems(evaluated);
  };

  const removeAt = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const canSubmit = items.length === MAX_FILES && items.every(it => it.errors.length === 0);

  const submit = async () => {
    if (!canSubmit) return;
    await onSubmit(items.map(i => i.file));
  };

  return (
    <div>
      <button onClick={handlePick}>Добавить фото</button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div>
        {items.map((it, idx) => (
          <div key={idx} style={{ border: it.errors.length ? "2px solid red" : "2px solid green" }}>
            <img src={it.url} alt={`photo-${idx}`} width={200} />
            <button onClick={() => removeAt(idx)}>Удалить</button>
            {it.errors.length === 0 ? (
              <div>Ок ✓</div>
            ) : (
              <ul>
                {it.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>

      <button disabled={!canSubmit} onClick={submit}>Отправить на проверку</button>
    </div>
  );
}

async function evaluateImageFile(file) {
  const errors = [];
  if (!["image/jpeg", "image/png"].includes(file.type)) errors.push("Только JPG/PNG");
  if (file.size > MAX_SIZE_MB * 1024 * 1024) errors.push("Файл слишком большой");

  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  const { width, height } = img;

  if (width < MIN_W || height < MIN_H) errors.push("Разрешение слишком маленькое");
  return { file, url, errors, metrics: { width, height } };
}

function loadImage(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}
const fd = new FormData();
files.forEach((f, i) => fd.append("images", f, `photo_${i+1}.jpg`));
await fetch("/api/predict", { method: "POST", body: fd });

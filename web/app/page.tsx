'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UploadCard from '@/components/UploadCard';
import ResultChips from '@/components/ResultChips';
import { predictOne } from '@/lib/api'; // <-- наш вызов API

export default function Page() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function handleAssess() {
    if (!files.length) return alert('Добавь хотя бы 1 фото');
    setLoading(true);
    try {
      const r = await predictOne(files[0]);     // пока шлём первое фото
      setResult(r);
    } catch (e: any) {
      alert('Ошибка предсказания: ' + (e?.message || 'unknown'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl p-6 pt-16 min-h-[90vh]">
        <div className="text-center my-8">
          <h1 className="text-3xl font-bold mb-2">Проверка состояния авто по фото</h1>
          <p className="opacity-70">Загрузите 4 фото: спереди, сзади, слева и справа.</p>
        </div>

        {/* UploadCard должен уметь отдавать выбранные файлы и дергать onAssess */}
        <UploadCard
          files={files}
          onFilesChange={setFiles}
          onAssess={handleAssess}
          loading={loading}
        />

        <div className="max-w-2xl mx-auto">
          <ResultChips r={result} />
        </div>
      </main>
      <Footer />
    </>
  );
}

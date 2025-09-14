'use client';

type BackendResult = {
  cleanliness_label: 'clean' | 'dirty' | string;
  cleanliness_score: number;
  damage_label: 'undamaged' | 'damaged' | string;
  damage_score: number;
};

const RUS = {
  clean: 'Чистый',
  dirty: 'Грязный',
  undamaged: 'Целый',
  damaged: 'Повреждённый',
} as const;

export default function ResultChips({ r }: { r?: BackendResult }) {
  if (!r) return null;

  // показываем проценты в «позитивной» метрике
  const cleanlinessPct =
    r.cleanliness_label === 'clean' ? r.cleanliness_score : 1 - r.cleanliness_score;
  const integrityPct =
    r.damage_label === 'undamaged' ? r.damage_score : 1 - r.damage_score;

  const allowed = r.cleanliness_label === 'clean' && r.damage_label === 'undamaged';
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

  const Box = ({ title, children }: { title: string; children: any }) => (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(192,241,28,.08)', border: '1px solid #3a3f47' }}>
      <div className="text-sm opacity-70 mb-1">{title}</div>
      <div className="text-base">{children}</div>
    </div>
  );

  return (
    <div className="mt-5 grid gap-3">
      <Box title="Чистота">
        {RUS[r.cleanliness_label as 'clean' | 'dirty'] || r.cleanliness_label} ({pct(cleanlinessPct)})
      </Box>

      <Box title="Целостность">
        {RUS[r.damage_label as 'undamaged' | 'damaged'] || r.damage_label} ({pct(integrityPct)})
      </Box>

      <Box title="Можно ли выполнять поездки?">
        <b style={{ color: allowed ? '#C0F11C' : '#ff6b6b' }}>{allowed ? 'Да' : 'Нет'}</b>
      </Box>
    </div>
  );
}

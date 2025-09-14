export default function Header() {
  return (
    <header
      className="w-full border-b border-white/10 sticky top-0 z-20"
      style={{ backdropFilter: 'saturate(120%) blur(6px)', background: 'rgba(17,19,21,.6)' }}
    >
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-5 md:py-6">
        <div className="flex items-center gap-3">
          {/* PNG-лого с лаймовым фоном */}
          <img src="/logo-indrive.png" alt="inDrive" className="h-6 w-6 rounded-[6px]" />
          <span className="font-semibold tracking-wide">inDrive • lycoris</span>
        </div>

        {/* Открываем в новой вкладке */}
        <a
          href="/decentrathon"
          target="_blank" rel="noopener noreferrer"
          className="button-like text-sm px-3 py-2 rounded-xl"
          style={{ background: 'rgba(192,241,28,.15)', border: '1px solid #C0F11C', color: '#C0F11C' }}
        >
          Decentrathon →
        </a>
      </div>
    </header>
  );
}

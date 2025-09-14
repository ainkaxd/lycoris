export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10">
      <div className="mx-auto max-w-5xl grid md:grid-cols-4 gap-6 p-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {/* логотип из /public */}
            <img
              src="/logo-indrive.png"
              alt="inDrive"
              className="h-8 w-8 rounded-[6px] object-cover"
            />
            <span className="font-semibold">inDrive • lycoris team</span>
          </div>
          <p className="text-sm opacity-60">Демо для Decentrathon 4.0</p>
        </div>

        <div>
          <div className="font-semibold mb-2 opacity-80">Контакты команды</div>
          <ul className="space-y-2 text-sm opacity-80">
            <li>Telegram: <a className="underline" href="#">@ainxxda</a></li>
            <li>Email: <a className="underline" href="mailto:ain.kaaa111@gmail.com">ain.kaaa111@gmail.com</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

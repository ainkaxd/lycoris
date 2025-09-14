export default function Page(){
  return (
    <main className="min-h-[100vh] relative">
      {/* ФОН: анимированная GIF */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/decentrathon.gif"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* затемняющий слой для читаемости текста */}
      <div className="absolute inset-0"
           style={{background:'linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.65))'}} />

      {/* контент поверх */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          Данная страница для будущего развития программы.
        </h1>   
        <p className="opacity-80 text-sm">
        lycoris team 
        </p>
      </div>
    </main>
  );
}

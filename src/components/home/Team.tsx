import Image from "next/image";

export function Team() {
  return (
    <section
      id="quienes-somos"
      className="py-12 md:py-20 px-4 max-w-6xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        <div className="relative group order-2 md:order-1">
          <div className="relative glass-card rounded-3xl overflow-hidden shadow-2xl p-2">
            <Image
              src="/images/equipo-suertudos.webp"
              alt="Equipo Suertudos"
              width={800}
              height={533}
              className="w-full h-auto object-cover rounded-2xl"
            />
          </div>
        </div>

        <div className="order-1 md:order-2 space-y-6">
          <span className="reveal text-xs uppercase tracking-widest text-brand-greenBright font-bold block">
            Transparencia y Confianza
          </span>
          <h2 className="reveal reveal-delay-1 display-title text-4xl md:text-5xl font-black font-title text-white leading-tight">
            ¿Quiénes estamos detrás de{" "}
            <span className="text-brand-gold">Suertu2s</span>?
          </h2>
          <p className="reveal reveal-delay-2 text-brand-muted text-base leading-relaxed">
            Somos un equipo de tres emprendedores de Puerto Montt, Región de Los
            Lagos. Creemos que comprar ilustraciones digitales de calidad y
            participar de un sorteo transparente no debería ser complicado. Por
            eso creamos Suertu2s: una plataforma que une el arte del sur de
            Chile con sorteos 100% protocolizados ante notario.
          </p>
          <p className="reveal reveal-delay-2 text-brand-muted text-base leading-relaxed">
            Cada pack vendido está vinculado a un sorteo público, transmitido en
            vivo y con bases legales notariadas. Nuestro compromiso es simple:
            que todos los participantes jueguen bajo las mismas reglas y que el
            ganador reciba su premio tal como se publica.
          </p>
          <ul className="space-y-3 mt-4">
            {[
              "Sorteos 100% legales y ante notario",
              "Entrega garantizada del premio",
              "Transmisiones en vivo para todos",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-brand-greenBright flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-brand-cream">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

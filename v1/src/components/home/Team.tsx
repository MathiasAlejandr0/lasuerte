import Image from "next/image";

export function Team() {
  return (
    <section
      id="quienes-somos"
      className="py-12 md:py-20 px-4 max-w-6xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        <div className="relative group order-2 md:order-1">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-greenBright/20 to-brand-gold/10 rounded-3xl blur-xl group-hover:from-brand-greenBright/30 group-hover:to-brand-gold/20 transition-all duration-500 pointer-events-none" />
          <div className="relative bg-brand-bgLight border border-brand-gold/20 rounded-3xl overflow-hidden shadow-2xl p-2 transition-all duration-500 hover:border-brand-greenBright/50">
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
          <span className="text-xs uppercase tracking-widest text-brand-greenBright font-bold block">
            Transparencia y Confianza
          </span>
          <h2 className="text-3xl md:text-4xl font-black font-title text-white leading-tight">
            ¿Quiénes estamos detrás de{" "}
            <span className="text-brand-gold">Suertu2s</span>?
          </h2>
          <p className="text-brand-muted text-base leading-relaxed">
            Somos un equipo de tres apasionados por el sur de Chile que
            decidimos crear esta plataforma para compartir nuestra suerte. Nos
            encargamos personalmente de garantizar la mayor transparencia en
            cada uno de los sorteos, trabajando de la mano con notarios y bases
            legales estrictas.
          </p>
          <p className="text-brand-muted text-base leading-relaxed">
            Nuestro compromiso es que cada participante tenga las mismas
            oportunidades de llevarse increíbles premios, apoyando al mismo
            tiempo el arte fotográfico de nuestro hermoso sur de Chile.
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

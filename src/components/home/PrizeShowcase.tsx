function formatClp(amount: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Valor comercial de la moto 0 km según concesionarias (referencia). */
const MOTORCYCLE_VALUE_CLP = 2_190_000;
/** Premio total presentado al cliente: moto + documentación + traslado + kit. */
const TOTAL_PRIZE_CLP = 3_500_000;

const includes = [
  "Moto CORSA R150 0 km",
  "Documentación y transferencia",
  "Kit de seguridad y casco",
  "Traslado a tu región",
];

const stats = [
  { value: "0 km", label: "Cero kilómetros" },
  { value: "2026", label: "Año del modelo" },
  { value: "100%", label: "Transferida a tu nombre" },
  { value: "Ante notario", label: "Sorteo transmitido en vivo" },
];

export function PrizeShowcase() {
  return (
    <section id="premio" className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto text-center relative">
        <span className="reveal text-xs uppercase tracking-widest text-brand-greenBright font-bold block">
          El gran premio
        </span>
        <h2 className="reveal reveal-delay-1 display-title text-4xl sm:text-5xl md:text-7xl font-black font-title text-white mt-4">
          MOTORRAD
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-brand-greenBright to-brand-gold">
            CORSA R150
          </span>{" "}
          2026
        </h2>
        <p className="reveal reveal-delay-2 text-brand-muted max-w-2xl mx-auto mt-6 text-sm md:text-lg leading-relaxed">
          Por cada ilustración que adquieras recibes números de regalo. El
          ganador se lleva la motocicleta completamente pagada, con toda la
          documentación al día y transferida a su nombre.
        </p>
        <div className="reveal reveal-delay-2 mt-8">
          <span className="inline-block glass-card rounded-full px-8 py-3 text-brand-gold font-title font-extrabold text-lg md:text-3xl tracking-tight">
            Premio total: {formatClp(TOTAL_PRIZE_CLP)} CLP
          </span>
        </div>
        <p className="reveal reveal-delay-3 text-xs text-brand-muted mt-3">
          Valor comercial de la moto 0 km: {formatClp(MOTORCYCLE_VALUE_CLP)} CLP
          + documentación, kit de seguridad y traslado incluidos.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {includes.map((item) => (
            <span
              key={item}
              className="reveal reveal-delay-3 text-xs px-4 py-2 rounded-full border border-white/10 bg-white/5 text-brand-cream"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`reveal reveal-delay-${i + 1} glass-card rounded-3xl p-6 space-y-2`}
            >
              <p className="text-xl md:text-2xl font-black text-brand-greenBright m-0">
                {stat.value}
              </p>
              <p className="text-xs text-brand-muted m-0 leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


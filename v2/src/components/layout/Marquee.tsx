export function Marquee() {
  const text =
    "Adquiere tu ilustración digital y participa del gran sorteo — Pago seguro con Webpay y Mercado Pago";

  return (
    <div className="home-green-banner fixed left-0 right-0 z-[999] text-white font-semibold text-xs py-2 overflow-hidden whitespace-nowrap">
      <div className="w-full flex overflow-hidden">
        <div className="marquee-content">
          <span className="mx-8">{text}</span>
          <span className="mx-8">{text}</span>
          <span className="mx-8">{text}</span>
        </div>
        <div className="marquee-content" aria-hidden>
          <span className="mx-8">{text}</span>
          <span className="mx-8">{text}</span>
          <span className="mx-8">{text}</span>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-4 bg-brand-bg relative mt-auto">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-brand-muted">
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <Logo />
            <Link
              href="/check-tickets"
              className="bg-gradient-to-r from-brand-gold to-brand-goldDark text-black font-sans font-bold text-[12px] uppercase px-[16px] py-[8px] rounded-full no-underline transition-transform duration-200 hover:scale-105 inline-block whitespace-nowrap shadow-[0_2px_6px_rgba(247,198,75,0.2)]"
            >
              CONSULTAR CÓDIGOS
            </Link>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed opacity-80">
            La plataforma del sur de Chile para adquirir arte fotográfico y
            participar de forma 100% transparente en el sorteo de una
            motocicleta cero kilómetros.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-4">Ayuda y Soporte</h4>
          <ul className="space-y-2 text-xs list-none p-0 m-0">
            <li>
              <Link
                href="/#como-jugar"
                className="hover:text-brand-greenBright transition-colors no-underline text-brand-muted"
              >
                ¿Cómo comprar packs?
              </Link>
            </li>
            <li>
              <Link
                href="/#faq"
                className="hover:text-brand-greenBright transition-colors no-underline text-brand-muted"
              >
                Preguntas frecuentes
              </Link>
            </li>
            <li>
              <Link
                href="/bases-legales"
                className="hover:text-brand-greenBright transition-colors no-underline text-brand-muted"
              >
                Bases Legales ante Notario
              </Link>
            </li>
            <li>
              <Link
                href="/afiliados"
                className="hover:text-brand-greenBright transition-colors no-underline text-brand-muted"
              >
                Soy afiliado
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-4">Contacto</h4>
          <ul className="space-y-2 text-xs list-none p-0 m-0">
            <li className="text-brand-muted leading-relaxed">
              Puerto Montt, Región de Los Lagos, Chile.
            </li>
            <li>
              <a
                href="mailto:contacto@suertudospremios.cl"
                className="hover:text-brand-greenBright transition-colors no-underline text-brand-muted"
              >
                contacto@suertudospremios.cl
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

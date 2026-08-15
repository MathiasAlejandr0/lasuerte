/** Iconos de pago estáticos: SVG nítido, sin cajas. */

const ICON = "h-7 w-auto max-h-7 pointer-events-none select-none shrink-0";
const ICON_VISA =
  "h-[1.35rem] w-auto max-h-[1.35rem] pointer-events-none select-none shrink-0 sm:h-6 sm:max-h-6";

function VisaIcon() {
  return (
    <svg
      viewBox="0 8.2 24 7.8"
      className={ICON_VISA}
      aria-label="Visa"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#1A1F71"
        d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"
      />
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg
      viewBox="0 0 36 22"
      className={ICON}
      aria-label="Mastercard"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="13.5" cy="11" r="9" fill="#EB001B" />
      <circle cx="22.5" cy="11" r="9" fill="#F79E1B" />
      <path fill="#FF5F00" d="M18 3.7a9 9 0 0 0 0 14.6 9 9 0 0 0 0-14.6z" />
    </svg>
  );
}

function FlowIcon() {
  return (
    <svg
      viewBox="0 0 100 28"
      className={ICON}
      aria-label="Flow.cl"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="21"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="19"
        fontWeight="900"
        fill="#136AFB"
        letterSpacing="-0.5"
      >
        flow<tspan fill="#36F073">.cl</tspan>
      </text>
    </svg>
  );
}

export function PaymentBadges() {
  return (
    <div
      className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-8"
      aria-label="Medios de pago aceptados"
    >
      <VisaIcon />
      <MastercardIcon />
      <FlowIcon />
    </div>
  );
}

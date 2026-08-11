import Link from "next/link";

function Clover({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
    >
      <path
        d="M50 50 C50 65 55 80 60 95 C55 80 50 65 48 50"
        stroke="#36f073"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M50 50 C25 35 35 5 50 15 C65 5 75 35 50 50" fill="#36f073" />
      <path d="M50 50 C35 75 5 65 15 50 C5 35 35 25 50 50" fill="#36f073" />
      <path d="M50 50 C65 75 95 65 85 50 C95 35 65 25 50 50" fill="#36f073" />
    </svg>
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const text = size === "sm" ? "text-[19px] sm:text-[22px]" : "text-[22px]";
  const icon =
    size === "sm" ? "w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-1.5" : "w-5 h-5 ml-1.5";

  return (
    <Link
      href="/"
      className="no-underline flex items-center shrink-0 whitespace-nowrap"
    >
      <span
        className={`font-title ${text} font-extrabold text-white tracking-[-0.05em]`}
      >
        SUERTU
        <span className="text-brand-greenBright animate-pixar-jump">2</span>S
      </span>
      <Clover className={icon} />
    </Link>
  );
}

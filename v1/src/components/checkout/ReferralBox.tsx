"use client";

import { useState } from "react";

type Mode = "code" | "name";

type Props = {
  code: string;
  nameQuery: string;
  onCodeChange: (value: string) => void;
  onNameChange: (value: string) => void;
};

function MegaphoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 11v2a1 1 0 0 0 1 1h2l5 3V7L6 10H4a1 1 0 0 0-1 1Z"
        fill="#3B82F6"
      />
      <path
        d="M16 8.5c1.2.9 2 2.1 2 3.5s-.8 2.6-2 3.5"
        stroke="#3B82F6"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18.5 6.5C20.5 8 21.5 10 21.5 12s-1 4-3 5.5"
        stroke="#3B82F6"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="#3B82F6" strokeWidth="2" />
      <path
        d="M16 16l4.5 4.5"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ReferralBox({
  code,
  nameQuery,
  onCodeChange,
  onNameChange,
}: Props) {
  const [mode, setMode] = useState<Mode>("code");

  return (
    <div
      className="suertudos-referral-container rounded-2xl p-4 sm:p-5 space-y-3.5"
      style={{
        backgroundColor: "rgba(7, 22, 11, 0.6)",
        border: "1px solid rgba(54, 240, 115, 0.25)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-[15px] sm:text-[16px] font-semibold text-[#36f073] leading-snug">
          <span className="mr-1.5" aria-hidden>
            💛
          </span>
          ¿Te refirió un embajador o vendedor?
        </p>
        <span
          className="shrink-0 rounded px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.08em]"
          style={{
            color: "#f7c64b",
            backgroundColor: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(247, 198, 75, 0.35)",
          }}
        >
          Opcional
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => setMode("code")}
          className={`suertudos-ref-tab-btn inline-flex items-center gap-2 h-10 px-3.5 rounded-lg text-[13px] font-bold cursor-pointer transition-colors border ${
            mode === "code"
              ? "bg-[#f7c64b] text-black border-[#f7c64b]"
              : "bg-[rgba(0,0,0,0.35)] text-white border-white/15 hover:border-white/30"
          }`}
        >
          <MegaphoneIcon />
          Por Código
        </button>
        <button
          type="button"
          onClick={() => setMode("name")}
          className={`suertudos-ref-tab-btn inline-flex items-center gap-2 h-10 px-3.5 rounded-lg text-[13px] font-bold cursor-pointer transition-colors border ${
            mode === "name"
              ? "bg-[#f7c64b] text-black border-[#f7c64b]"
              : "bg-[rgba(0,0,0,0.35)] text-white border-white/15 hover:border-white/30"
          }`}
        >
          <SearchIcon />
          Buscar por Nombre
        </button>
      </div>

      {mode === "code" ? (
        <label className="block space-y-2">
          <span className="block text-[14px] text-white/90 font-normal">
            Ingresa el código del embajador (ej: STJP48)
          </span>
          <input
            id="suertudos_ref_code_input"
            type="text"
            value={code}
            onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
            placeholder="EJ: STJP48"
            className="w-full h-12 rounded-xl px-4 text-[15px] text-white outline-none"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              letterSpacing: "1.5px",
            }}
            autoComplete="off"
          />
        </label>
      ) : (
        <label className="block space-y-2">
          <span className="block text-[14px] text-white/90 font-normal">
            Busca el nombre del embajador o vendedor
          </span>
          <input
            type="text"
            value={nameQuery}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ej: Juan Pérez"
            className="w-full h-12 rounded-xl px-4 text-[15px] text-white outline-none"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
            autoComplete="off"
          />
        </label>
      )}
    </div>
  );
}

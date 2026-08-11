export default function BasesLegalesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="font-title text-3xl md:text-5xl font-black text-white">
        Bases legales
      </h1>
      <div className="prose prose-invert space-y-4 text-brand-muted text-sm leading-relaxed border border-brand-gold/20 rounded-2xl p-6 md:p-8 bg-brand-bgLight/40">
        <p>
          SUERTU2S comercializa productos digitales (ilustraciones fotográficas
          del sur de Chile / Patagonia). De forma promocional y completamente
          legal, se entregan boletos de participación para el sorteo asociado a
          cada campaña vigente.
        </p>
        <p>
          Las bases del sorteo de la{" "}
          <strong className="text-brand-cream">MOTORRAD CORSA R150 2026</strong>{" "}
          están protocolizadas ante notario en Puerto Montt, Región de Los
          Lagos, Chile.
        </p>
        <h2 className="text-white font-title text-xl font-bold pt-4">
          Condiciones generales
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            La participación está vinculada a la compra de un pack de
            ilustración digital.
          </li>
          <li>
            Los números de sorteo se asignan automáticamente tras la
            confirmación del pago.
          </li>
          <li>
            El sorteo se transmite en vivo mediante tómbola ante ministro de fe.
          </li>
          <li>
            El premio se entrega con documentación al día y transferencia a
            nombre del ganador, pagada por el equipo SUERTU2S.
          </li>
        </ul>
        <p className="pt-4">
          Para consultas:{" "}
          <a
            href="mailto:contacto@suertudospremios.cl"
            className="text-brand-greenBright"
          >
            contacto@suertudospremios.cl
          </a>
        </p>
        <p className="text-xs opacity-70">
          Nota: esta página es un borrador legal. Reemplaza este texto con el
          acta notarial definitiva cuando esté disponible.
        </p>
      </div>
    </main>
  );
}

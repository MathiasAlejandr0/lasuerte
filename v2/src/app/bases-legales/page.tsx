const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: "Bases legales — MOTORRAD CORSA R150 0km 2026",
  description:
    "Bases protocolizadas ante notario de la premiación promocional SUERTU2S vinculada a la compra de packs de ilustración digital.",
  areaServed: "Chile",
};

export default function BasesLegalesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="font-title text-3xl md:text-5xl font-black text-white">
        Bases legales
      </h1>
      <div className="prose prose-invert space-y-4 text-brand-muted text-sm leading-relaxed border border-brand-gold/20 rounded-2xl p-6 md:p-8 bg-brand-bgLight/40">
        <p>
          SUERTU2S comercializa productos digitales (ilustraciones fotográficas
          del sur de Chile / Patagonia). De forma promocional y completamente
          legal, se entregan tickets de participación asociados a cada campaña
          vigente.
        </p>
        <p>
          Las bases de la entrega de la{" "}
          <strong className="text-brand-cream">MOTORRAD CORSA R150 2026</strong>{" "}
          están protocolizadas ante notario.
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
            Los tickets de participación (código de campaña + 5 dígitos
            aleatorios) se asignan automáticamente tras la confirmación del
            pago.
          </li>
          <li>
            La premiación se transmite en vivo mediante tómbola ante ministro de
            fe.
          </li>
          <li>
            El premio se entrega con documentación al día y transferencia a
            nombre del ganador, cubierto por el equipo SUERTU2S.
          </li>
        </ul>
        <p className="pt-4">
          Para consultas:{" "}
          <a
            href="mailto:contacto@suertu2s.com"
            className="text-brand-greenBright"
          >
            contacto@suertu2s.com
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

import Link from "next/link";

const preparationSteps = [
  {
    title: "Definir dependencia",
    text: "Registrar nombre, jefe responsable, mision, procesos y criticidad.",
    href: "/dependencias"
  },
  {
    title: "Estimar personal requerido",
    text: "Definir cuantas personas se esperan para operar la dependencia.",
    href: "/personal"
  },
  {
    title: "Usar plantilla base",
    text: "Seleccionar tipo de dependencia y cargar campos sugeridos.",
    href: "/configuracion"
  },
  {
    title: "Revisar calidad inicial",
    text: "Detectar datos faltantes antes de continuar con el diagnostico.",
    href: "/calidad-datos"
  }
];

export function OrganizationRequiredView() {
  return (
    <main className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Planeacion</p>
          <h1>Organizacion requerida</h1>
          <p>
            Prepara una dependencia nueva antes de cargar el diagnostico completo.
            Este modulo evita empezar con datos incompletos o desordenados.
          </p>
        </div>
        <Link className="primary-action" href="/configuracion">
          Abrir configuracion
        </Link>
      </section>

      <section className="institutional-banner">
        <div>
          <span className="module-badge">Ruta inicial</span>
          <h2>De dependencia nueva a diagnostico listo</h2>
          <p>
            La organizacion requerida conecta la estructura esperada con el talento
            disponible, las funciones que deben existir y las alertas de calidad.
          </p>
        </div>
        <div className="banner-stats">
          <article>
            <strong>1-30</strong>
            <span>personas por dependencia</span>
          </article>
          <article>
            <strong>Variable</strong>
            <span>funciones por cargo</span>
          </article>
          <article>
            <strong>Guiado</strong>
            <span>control de datos criticos</span>
          </article>
        </div>
      </section>

      <section className="module-flow-grid">
        {preparationSteps.map((step, index) => (
          <Link className="module-flow-card" href={step.href} key={step.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.title}</strong>
            <p>{step.text}</p>
          </Link>
        ))}
      </section>

      <section className="panel-card">
        <div className="section-heading">
          <div>
            <h2>Resultado esperado</h2>
            <p>
              Al finalizar esta ruta, la dependencia queda lista para alimentar el
              modulo misional, el modulo funcional, talento disponible y reportes.
            </p>
          </div>
        </div>
        <div className="quick-start-grid">
          <article>
            <strong>Campos base completos</strong>
            <span>Dependencia, responsable, mision, procesos y criticidad.</span>
          </article>
          <article>
            <strong>Capacidad esperada</strong>
            <span>Cantidad de personal requerida para comparar brechas.</span>
          </article>
          <article>
            <strong>Ruta de correccion</strong>
            <span>Acciones directas para completar faltantes antes del reporte.</span>
          </article>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";

const mainMenuItems = [
  {
    title: "Dashboard ejecutivo",
    href: "/dashboard",
    description: "Estado general, riesgos, avance y prioridades directivas.",
    tag: "Direccion"
  },
  {
    title: "Modulo misional",
    href: "/dependencias",
    description: "Dependencias, mision, procesos y estructura evaluada.",
    tag: "Estructura"
  },
  {
    title: "Modulo funcional",
    href: "/funciones",
    description: "Funciones reales, asignadas, criticas, duplicadas o sin responsable.",
    tag: "Funciones"
  },
  {
    title: "Organizacion requerida",
    href: "/configuracion",
    description: "Nueva dependencia, personal esperado y configuracion inicial.",
    tag: "Planeacion"
  },
  {
    title: "Talento disponible",
    href: "/personal",
    description: "Personal, cargos, experiencia, competencias y carga laboral.",
    tag: "Talento"
  },
  {
    title: "Matriz persona-funcion",
    href: "/matriz-funcion-persona",
    description: "Responsables, respaldos, duplicidades y vacios funcionales.",
    tag: "Matriz"
  },
  {
    title: "Brechas",
    href: "/perfiles",
    description: "Comparacion entre perfil requerido, talento disponible y acciones.",
    tag: "Analisis"
  },
  {
    title: "Alertas",
    href: "/alertas",
    description: "Riesgos, trazabilidad, responsables y acciones de cierre.",
    tag: "Control"
  },
  {
    title: "Prospectiva",
    href: "/prospectiva",
    description: "Funciones futuras, competencias emergentes y riesgos proyectados.",
    tag: "Futuro"
  },
  {
    title: "Guia de uso",
    href: "/asistente-diagnostico",
    description: "Ruta guiada para cargar datos y completar el diagnostico.",
    tag: "Ayuda"
  },
  {
    title: "Configuracion",
    href: "/configuracion",
    description: "Supabase, respaldos, carga masiva, instalacion y datos piloto.",
    tag: "Sistema"
  }
];

const priorityActions = [
  { label: "Ver diagnostico", href: "/dashboard" },
  { label: "Cargar dependencia", href: "/configuracion" },
  { label: "Generar informe", href: "/reportes" },
  { label: "Modo sustentacion", href: "/sustentacion" }
];

export default function HomePage() {
  return (
    <main className="main-menu-shell">
      <section className="main-menu-hero">
        <div className="main-menu-copy">
          <p className="eyebrow">Menu principal ORGTAL</p>
          <h1>SIGTH_ORGTAL</h1>
          <p className="lead">
            Sistema institucional para diagnostico organizacional, talento humano,
            funciones, cargas laborales, alertas y reportes ejecutivos.
          </p>
          <div className="main-menu-actions">
            {priorityActions.map((action) => (
              <Link href={action.href} key={action.href}>
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <aside className="main-menu-author">
          <span>Derechos de autor, creacion e innovacion tecnologica</span>
          <strong>Edwyn Arvey Lopez Acosta</strong>
          <p>Herramienta orientada a directores, jefes de dependencia y equipos evaluadores.</p>
        </aside>
      </section>

      <section className="main-menu-intro">
        <div>
          <h2>Accesos principales</h2>
          <p>
            Selecciona el modulo requerido. El menu mantiene la navegacion limpia
            y evita saturar al usuario con informacion tecnica al inicio.
          </p>
        </div>
        <Link className="secondary-action" href="/roles">
          Ver modo usuario simple
        </Link>
      </section>

      <section className="main-menu-grid" aria-label="Accesos principales de SIGTH_ORGTAL">
        {mainMenuItems.map((item) => (
          <Link className="main-menu-card" href={item.href} key={`${item.title}-${item.href}`}>
            <span>{item.tag}</span>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </Link>
        ))}
      </section>

      <section className="main-menu-footer">
        <p>
          Version demostrativa con datos piloto y preparada para cargar
          dependencias nuevas cuando Supabase este conectado.
        </p>
        <Link href="/configuracion">Configuracion y preparacion externa</Link>
      </section>
    </main>
  );
}

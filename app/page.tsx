import Link from "next/link";
import { mainModules } from "@/lib/module-menu";

const priorityActions = [
  { label: "Ver diagnostico", href: "/dashboard" },
  { label: "Cargar dependencia", href: "/organizacion-requerida" },
  { label: "Generar informe", href: "/reportes" },
  { label: "Modo sustentacion", href: "/sustentacion" }
];

export default function HomePage() {
  return (
    <main className="main-menu-shell">
      <section className="main-menu-hero">
        <div className="main-menu-copy">
          <p className="eyebrow">Menu principal ORGTAL</p>
          <h1>ORGTAL</h1>
          <p className="lead">
            Modelo Organizacional Automatizado para la Gestion Estrategica del Talento Humano.
          </p>
        </div>

        <aside className="main-menu-author">
          <span>Derechos de autor, creacion e innovacion tecnologica</span>
          <strong>Edwyn Arvey Lopez Acosta</strong>
          <p>Herramienta orientada a directores, jefes de dependencia y equipos evaluadores.</p>
        </aside>
      </section>

      <section className="main-menu-intro main-menu-actions-panel">
        <div>
          <h2>11 modulos principales</h2>
          <p>
            ORGTAL queda organizada como una herramienta ejecutiva: cada cuadro
            agrupa sus funciones internas para que el usuario avance sin saturarse.
          </p>
        </div>
        <div className="main-menu-actions">
          {priorityActions.map((action) => (
            <Link href={action.href} key={action.href}>
              {action.label}
            </Link>
          ))}
          <Link href="/roles">Modo usuario</Link>
        </div>
      </section>

      <section className="main-menu-grid" aria-label="Accesos principales de ORGTAL">
        {mainModules.map((item) => (
          <Link className="main-menu-card" href={item.href} key={`${item.title}-${item.href}`}>
            <span>{item.tag}</span>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <small>{item.scope}</small>
          </Link>
        ))}
      </section>

      <section className="main-menu-footer">
        <p>
          Version demostrativa con datos piloto, Supabase activo y preparada para
          cargar dependencias nuevas sin perder la estructura metodologica.
        </p>
        <Link href="/configuracion">Configuracion y preparacion externa</Link>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { getAlerts, getDashboardMetrics } from "@/lib/calculations";

export function SustentationView() {
  const data = useOrgData();
  const metrics = getDashboardMetrics(data);
  const alerts = getAlerts(data);
  const criticalAlerts = alerts.filter((alert) => alert.nivel === "critico").length;
  const unassigned = data.funciones.filter((item) => !item.responsable).length;
  const duplicated = data.funciones.filter((item) => item.tipo === "Duplicada").length;
  const highWorkload = data.personal.filter((item) => item.cargaLaboral >= 71).length;
  const evidenceReady = data.evidencias.filter((item) => item.estado === "Validada" || item.estado === "Recibida").length;
  const presentationCards = [
    {
      label: "Dependencias",
      value: data.dependencias.length,
      detail: "Areas disponibles para explicar el alcance del diagnostico."
    },
    {
      label: "Personal",
      value: data.personal.length,
      detail: "Funcionarios o perfiles cargados para analisis."
    },
    {
      label: "Funciones",
      value: data.funciones.length,
      detail: "Actividades asignadas, reales, duplicadas o sin responsable."
    },
    {
      label: "Evidencias",
      value: evidenceReady,
      detail: "Soportes disponibles para sustentar hallazgos."
    }
  ];
  const proofPoints = [
    "Diagnostico organizacional con datos piloto y opcion de cargar dependencias nuevas.",
    "Matriz funcion-persona con responsables, respaldos, duplicidades y vacios.",
    "Encuestas externas para personal y expertos validadores.",
    "Alertas con trazabilidad, responsable, estado y accion tomada.",
    "Reportes formales con prevalidacion antes de imprimir.",
    "Preparacion PWA para instalar la app desde la web publica."
  ];
  const demoPath = [
    { title: "1. Dashboard", href: "/dashboard", detail: "Riesgo general, prioridades y avance." },
    { title: "2. Dependencia", href: "/dependencias", detail: "Ficha ejecutiva y datos base." },
    { title: "3. Matriz", href: "/matriz-funcion-persona", detail: "Asignacion funcional y vacios." },
    { title: "4. Encuestas", href: "/entrevistas", detail: "Links para personal y expertos." },
    { title: "5. Evidencias", href: "/evidencias", detail: "Soportes documentales." },
    { title: "6. Reporte", href: "/reportes", detail: "Informe listo o datos pendientes." }
  ];

  return (
    <AppShell>
      <main className="page-stack">
        <section className="sustentation-hero">
          <div>
            <span>SIGTH_ORGTAL</span>
            <h1>Modo sustentacion</h1>
            <p>
              Pantalla preparada para presentar el desarrollo tecnologico,
              explicar el valor institucional y recorrer la app con jueces o
              usuarios externos.
            </p>
          </div>
          <aside>
            <small>Derechos de autor, creacion e innovacion tecnologica</small>
            <strong>Edwyn Arvey Lopez Acosta</strong>
          </aside>
        </section>

        <section className="sustentation-metrics">
          {presentationCards.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.detail}</p>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="panel sustention-proof">
            <div className="panel-heading">
              <h2>Que demuestra la app</h2>
              <span>Valor institucional</span>
            </div>
            <ul>
              {proofPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>

          <article className="panel sustention-risk-card">
            <div className="panel-heading">
              <h2>Lectura rapida</h2>
              <span>Estado del piloto</span>
            </div>
            <div className="sustention-risk-score">
              <strong>{metrics.riesgoGeneral}</strong>
              <span>Riesgo general</span>
            </div>
            <dl>
              <div>
                <dt>Alertas criticas</dt>
                <dd>{criticalAlerts}</dd>
              </div>
              <div>
                <dt>Funciones sin responsable</dt>
                <dd>{unassigned}</dd>
              </div>
              <div>
                <dt>Funciones duplicadas</dt>
                <dd>{duplicated}</dd>
              </div>
              <div>
                <dt>Cargas altas</dt>
                <dd>{highWorkload}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section className="panel sustention-route">
          <div className="panel-heading">
            <h2>Ruta recomendada de demostracion</h2>
            <span>Recorrido guiado</span>
          </div>
          <div className="sustention-route-grid">
            {demoPath.map((step) => (
              <Link href={step.href} key={step.title}>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

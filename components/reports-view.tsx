"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { RiskBadge } from "@/components/risk-badge";
import { getAlerts, getDashboardMetrics } from "@/lib/calculations";
import { buildDataQualitySummary } from "@/lib/data-quality";
import { buildExecutiveFindings, buildImprovementPlan, buildReportDate } from "@/lib/report-builder";

function csvValue(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsView() {
  const data = useOrgData();
  const metrics = getDashboardMetrics(data);
  const alerts = getAlerts(data);
  const findings = buildExecutiveFindings(data);
  const plan = buildImprovementPlan(data);
  const quality = buildDataQualitySummary(data);
  const reportReady = quality.criticalIssues === 0;
  const criticalIssues = quality.issues.filter((issue) => issue.severidad === "critico");
  const reportDate = buildReportDate();
  const filenameDate = new Date().toISOString().slice(0, 10);

  function exportAlerts() {
    const rows = [
      ["Nivel", "Titulo", "Descripcion", "Origen", "Accion"],
      ...alerts.map((alert) => [
        alert.nivel,
        alert.titulo,
        alert.descripcion,
        alert.origen,
        alert.accion ?? "Analizar causa, asignar responsable y registrar cierre."
      ])
    ];
    const csv = rows.map((row) => row.map(csvValue).join(";")).join("\n");
    downloadFile(`sigth_orgtal-alertas-${filenameDate}.csv`, csv, "text/csv;charset=utf-8");
  }

  function exportPlan() {
    const rows = [
      ["Prioridad", "Hallazgo", "Accion sugerida", "Responsable", "Plazo"],
      ...plan.map((item) => [item.prioridad, item.hallazgo, item.accion, item.responsable, item.plazo])
    ];
    const csv = rows.map((row) => row.map(csvValue).join(";")).join("\n");
    downloadFile(`sigth_orgtal-plan-mejora-${filenameDate}.csv`, csv, "text/csv;charset=utf-8");
  }

  return (
    <AppShell>
      <main className="page-stack report-page">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Salida documental</p>
            <h1>Reportes automaticos</h1>
            <p>
              Informe ejecutivo generado con los datos actuales del diagnostico:
              dependencias, personal, funciones, cargas laborales y alertas.
            </p>
          </div>
          <div className="action-row no-print">
            <button className="secondary-action" type="button" onClick={exportAlerts}>
              Descargar alertas CSV
            </button>
            <button className="secondary-action" type="button" onClick={exportPlan}>
              Descargar plan CSV
            </button>
            <button className="primary-action" disabled={!reportReady} type="button" onClick={() => window.print()}>
              {reportReady ? "Imprimir o guardar PDF" : "Corregir antes de imprimir"}
            </button>
          </div>
        </section>

        <section className={`report-preflight ${reportReady ? "ready" : "watch"} no-print`}>
          <div>
            <span>Revision previa del informe</span>
            <h2>{reportReady ? "Informe listo" : `Faltan ${quality.criticalIssues} datos criticos`}</h2>
            <p>
              {reportReady
                ? "La informacion no tiene pendientes criticos y puede imprimirse o guardarse como PDF."
                : "Antes de imprimir, corrige los datos criticos para evitar un reporte incompleto o poco confiable."}
            </p>
          </div>
          <div className="report-preflight-actions">
            <strong>{quality.score}%</strong>
            <span>calidad de datos</span>
            {reportReady ? (
              <button className="primary-action" type="button" onClick={() => window.print()}>
                Generar PDF
              </button>
            ) : (
              <Link className="secondary-action" href="/calidad-datos">
                Ver que debo corregir
              </Link>
            )}
          </div>
          {!reportReady ? (
            <ul className="report-preflight-list">
              {criticalIssues.slice(0, 4).map((issue) => (
                <li key={issue.id}>
                  <strong>{issue.modulo}</strong>
                  <span>{issue.registro}: {issue.descripcion}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="report-document">
          <section className="report-cover">
            <div>
              <p className="eyebrow">SIGTH_ORGTAL 360</p>
              <h2>Informe formal de diagnostico organizacional</h2>
              <p>
                Sistema Organizacional de Gestion del Talento Humano, Funciones
                y Cargas Laborales.
              </p>
            </div>
            <dl>
              <div>
                <dt>Fecha</dt>
                <dd>{reportDate}</dd>
              </div>
              <div>
                <dt>Dependencias</dt>
                <dd>{data.dependencias.length}</dd>
              </div>
              <div>
                <dt>Riesgo general</dt>
                <dd>{metrics.riesgoGeneral}</dd>
              </div>
            </dl>
          </section>

          <header className="report-header">
            <div>
              <p className="eyebrow">SIGTH_ORGTAL</p>
              <h2>Informe ejecutivo de diagnostico organizacional</h2>
              <p>Fecha de generacion: {reportDate}</p>
            </div>
            <RiskBadge level={metrics.riesgoGeneral} />
          </header>

          <section className="metric-grid compact-metrics">
            {metrics.cards.map((card) => (
              <article className="metric-card" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.detail}</small>
              </article>
            ))}
          </section>

          <article className="report-section">
            <h2>Hallazgos principales</h2>
            <ul className="report-list">
              {findings.map((finding) => (
                <li key={finding}>{finding}</li>
              ))}
            </ul>
          </article>

          <article className="report-section">
            <h2>Alertas priorizadas</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>Alerta</th>
                    <th>Origen</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.length ? (
                    alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>
                          <RiskBadge level={alert.nivel} compact />
                        </td>
                        <td>
                          <strong>{alert.titulo}</strong>
                          <p>{alert.descripcion}</p>
                        </td>
                        <td>{alert.origen}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No se detectan alertas con los datos actuales.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="report-section">
            <h2>Plan de mejora automatico</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Prioridad</th>
                    <th>Hallazgo</th>
                    <th>Accion sugerida</th>
                    <th>Responsable</th>
                    <th>Plazo</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.length ? (
                    plan.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <RiskBadge level={item.prioridad} compact />
                        </td>
                        <td>{item.hallazgo}</td>
                        <td>{item.accion}</td>
                        <td>{item.responsable}</td>
                        <td>{item.plazo}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>No hay acciones automaticas pendientes.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="report-section">
            <h2>Recomendacion ejecutiva</h2>
            <p>
              Priorizar el cierre de alertas criticas, formalizar responsables
              de funciones sin asignacion, revisar duplicidades y ajustar cargas
              laborales superiores al umbral alto antes de consolidar el informe
              final para decision institucional.
            </p>
          </article>

          <article className="report-section">
            <h2>Anexos generados</h2>
            <ul className="report-list">
              <li>Matriz funcion-persona para responsables, respaldos y duplicidades.</li>
              <li>Fichas individuales por funcionario con funciones, competencias y alertas.</li>
              <li>Resultados de encuestas a personal y expertos cuando existan respuestas registradas.</li>
              <li>Plan de mejora exportable en CSV para seguimiento institucional.</li>
            </ul>
          </article>

          <section className="signature-grid">
            <div>
              <span>Elaboro</span>
              <strong>Analista de talento humano</strong>
            </div>
            <div>
              <span>Reviso</span>
              <strong>Jefe de dependencia</strong>
            </div>
            <div>
              <span>Valido</span>
              <strong>Experto evaluador</strong>
            </div>
          </section>
        </section>
      </main>
    </AppShell>
  );
}

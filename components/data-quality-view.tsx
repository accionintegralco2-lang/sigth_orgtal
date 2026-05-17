"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { buildDataQualitySummary, type DataQualitySeverity } from "@/lib/data-quality";

function severityLabel(severity: DataQualitySeverity) {
  if (severity === "critico") return "Critico";
  if (severity === "alto") return "Alto";
  if (severity === "moderado") return "Moderado";
  return "Bajo";
}

function csvValue(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function DataQualityView() {
  const data = useOrgData();
  const quality = buildDataQualitySummary(data);
  const topIssues = quality.issues.slice(0, 14);
  const readyForReport = quality.criticalIssues === 0 && quality.score >= 75;
  const quickActions = [
    {
      title: "Completar cargo",
      description: "Abrir fichas de personal para cerrar cargos, perfiles y competencias pendientes.",
      href: "/personal",
      count: quality.issues.filter((issue) => issue.href === "/personal").length
    },
    {
      title: "Asignar responsable",
      description: "Revisar la matriz funcion-persona y vincular responsables o respaldos.",
      href: "/matriz-funcion-persona",
      count: quality.issues.filter((issue) => issue.href === "/matriz-funcion-persona").length
    },
    {
      title: "Agregar evidencia",
      description: "Cargar manuales, actas, organigramas y soportes del diagnostico.",
      href: "/evidencias",
      count: quality.issues.filter((issue) => issue.href === "/evidencias").length
    },
    {
      title: "Cerrar alerta",
      description: "Registrar accion tomada, responsable, evidencia y estado de cierre.",
      href: "/alertas",
      count: quality.issues.filter((issue) => issue.href === "/alertas").length
    }
  ];
  const prioritizedActions = [...quickActions].sort((left, right) => right.count - left.count);

  function exportIssues() {
    const rows = [
      ["Modulo", "Registro", "Campo", "Severidad", "Descripcion", "Accion sugerida", "Accion directa"],
      ...quality.issues.map((issue) => [
        issue.modulo,
        issue.registro,
        issue.campo,
        severityLabel(issue.severidad),
        issue.descripcion,
        issue.accion,
        issue.actionLabel
      ])
    ];
    const csv = rows.map((row) => row.map(csvValue).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sigth_orgtal-calidad-datos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Control previo del diagnostico</p>
            <h1>Calidad de datos</h1>
            <p>
              Revisa campos incompletos, responsables no vinculados, evidencias
              pendientes y puntos que deben corregirse antes de generar el
              informe formal.
            </p>
          </div>
          <div className="action-row">
            <span className={readyForReport ? "status-pill quality-ready" : "status-pill quality-watch"}>
              {readyForReport ? "Listo para reporte" : "Requiere ajuste"}
            </span>
            <button className="secondary-action" type="button" onClick={exportIssues}>
              Exportar revision CSV
            </button>
          </div>
        </section>

        <section className="quality-hero">
          <div>
            <span>Indice de completitud</span>
            <strong>{quality.score}%</strong>
            <p>
              {readyForReport
                ? "La informacion tiene una base suficiente para consolidar reporte y seguimiento."
                : "Conviene cerrar los puntos criticos y altos antes de presentar resultados institucionales."}
            </p>
          </div>
          <div className="quality-ring" style={{ "--score": `${quality.score}%` } as CSSProperties}>
            <strong>{quality.score}</strong>
            <span>sobre 100</span>
          </div>
        </section>

        <section className="metric-grid">
          <article className="metric-card">
            <span>Observaciones</span>
            <strong>{quality.totalIssues}</strong>
            <small>Puntos detectados por el control de calidad</small>
          </article>
          <article className="metric-card">
            <span>Criticas</span>
            <strong>{quality.criticalIssues}</strong>
            <small>Bloquean un informe confiable</small>
          </article>
          <article className="metric-card">
            <span>Altas</span>
            <strong>{quality.highIssues}</strong>
            <small>Requieren responsable y correccion</small>
          </article>
          <article className="metric-card">
            <span>Modulos revisados</span>
            <strong>{quality.byModule.length}</strong>
            <small>Dependencias, personal, funciones y soportes</small>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel">
            <div className="panel-heading">
              <h2>Semaforo por modulo</h2>
              <span>{quality.byModule.filter((item) => item.total > 0).length} con pendientes</span>
            </div>
            <div className="quality-bars">
              {quality.byModule.map((item) => (
                <div className="quality-bar-row" key={item.modulo}>
                  <span>{item.modulo}</span>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${item.total > 4 ? "critico" : item.total > 1 ? "alto" : item.total === 1 ? "moderado" : "bajo"}`}
                      style={{ width: `${Math.min(100, Math.max(8, item.total * 16))}%` }}
                    />
                  </div>
                  <strong>{item.total}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h2>Ruta de correccion</h2>
              <span>Orden sugerido</span>
            </div>
            <ol className="quality-steps">
              <li>Completar funciones sin responsable y responsables que no coinciden con personal.</li>
              <li>Actualizar fichas de personal sin cargo, formacion o competencias.</li>
              <li>Registrar evidencias documentales que soporten el diagnostico.</li>
              <li>Cerrar trazabilidad de alertas criticas antes del informe final.</li>
            </ol>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Que debo corregir</h2>
            <span>Acciones directas</span>
          </div>
          <div className="quality-action-grid">
            {prioritizedActions.map((action) => (
              <Link
                className={`quality-action-card ${action.count === 0 ? "is-complete" : ""}`}
                href={action.href}
                key={action.title}
              >
                <strong>
                  {action.title}
                  <small>{action.count ? `${action.count} pendiente${action.count === 1 ? "" : "s"}` : "Sin pendientes"}</small>
                </strong>
                <p>{action.description}</p>
                <span>{action.count ? "Abrir modulo" : "Revisar modulo"}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Observaciones priorizadas</h2>
            <span>{topIssues.length} visibles</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Modulo</th>
                  <th>Registro</th>
                  <th>Campo</th>
                  <th>Severidad</th>
                  <th>Accion sugerida</th>
                  <th>Que debo corregir</th>
                </tr>
              </thead>
              <tbody>
                {topIssues.length ? (
                  topIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td>{issue.modulo}</td>
                      <td>
                        <strong>{issue.registro}</strong>
                        <p>{issue.descripcion}</p>
                      </td>
                      <td>{issue.campo}</td>
                      <td>
                        <span className={`quality-severity ${issue.severidad}`}>{severityLabel(issue.severidad)}</span>
                      </td>
                      <td>{issue.accion}</td>
                      <td>
                        <Link className="secondary-action compact-action" href={issue.href}>
                          {issue.actionLabel}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>No se detectan pendientes de calidad en los datos actuales.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

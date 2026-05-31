"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { RiskBadge } from "@/components/risk-badge";
import { getAlerts, getDashboardMetrics } from "@/lib/calculations";
import { buildDataQualitySummary } from "@/lib/data-quality";
import { buildExecutiveFindings, buildImprovementPlan, buildReportDate } from "@/lib/report-builder";
import { fetchReportRecords, saveReportRecord, type ReportHistoryItem } from "@/lib/report-repository";

const reportHistoryStorageKey = "orgtal-report-history-v1";

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
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [historyMessage, setHistoryMessage] = useState("");
  const metrics = getDashboardMetrics(data);
  const alerts = getAlerts(data);
  const findings = buildExecutiveFindings(data);
  const plan = buildImprovementPlan(data);
  const quality = buildDataQualitySummary(data);
  const reportReady = quality.criticalIssues === 0;
  const criticalIssues = quality.issues.filter((issue) => issue.severidad === "critico");
  const reportDate = buildReportDate(new Date("2026-05-17T12:00:00-05:00"));

  useEffect(() => {
    const stored = window.localStorage.getItem(reportHistoryStorageKey);
    if (stored) {
      setHistory(JSON.parse(stored) as ReportHistoryItem[]);
    }
    fetchReportRecords()
      .then((records) => {
        if (records.length) {
          setHistory(records);
        }
      })
      .catch((error) => {
        console.warn("No se pudo cargar historial de reportes desde Supabase", error);
      });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(reportHistoryStorageKey, JSON.stringify(history));
  }, [history]);

  function exportAlerts() {
    const filenameDate = new Date().toISOString().slice(0, 10);
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
    downloadFile(`orgtal-alertas-${filenameDate}.csv`, csv, "text/csv;charset=utf-8");
  }

  function exportPlan() {
    const filenameDate = new Date().toISOString().slice(0, 10);
    const rows = [
      ["Prioridad", "Hallazgo", "Accion sugerida", "Responsable", "Plazo"],
      ...plan.map((item) => [item.prioridad, item.hallazgo, item.accion, item.responsable, item.plazo])
    ];
    const csv = rows.map((row) => row.map(csvValue).join(";")).join("\n");
    downloadFile(`orgtal-plan-mejora-${filenameDate}.csv`, csv, "text/csv;charset=utf-8");
  }

  function saveReportHistory() {
    const item: ReportHistoryItem = {
      id: `rep-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      nombre: "Informe ejecutivo de diagnostico organizacional",
      tipo: "Ejecutivo",
      fecha: reportDate,
      estado: reportReady ? "Listo para imprimir" : "Pendiente por datos criticos",
      calidad: quality.score,
      riesgo: metrics.riesgoGeneral,
      dependencias: data.dependencias.length,
      personal: data.personal.length,
      funciones: data.funciones.length,
      alertas: alerts.length
    };
    setHistory((current) => [item, ...current].slice(0, 8));
    setHistoryMessage("Reporte guardado en el historial.");
    saveReportRecord(item).catch((error) => {
      console.warn("No se pudo guardar el reporte en Supabase", error);
      setHistoryMessage("Reporte guardado localmente. Supabase no confirmo el guardado.");
    });
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
            <button className="secondary-action" type="button" onClick={saveReportHistory}>
              Guardar historial
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

        <section className="panel no-print">
          <div className="panel-heading">
            <h2>Historial de reportes</h2>
            <span>{history.length} registros</span>
          </div>
          {historyMessage ? <p className="import-message">{historyMessage}</p> : null}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reporte</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Calidad</th>
                  <th>Riesgo</th>
                  <th>Datos</th>
                </tr>
              </thead>
              <tbody>
                {history.length ? (
                  history.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nombre}</td>
                      <td>{item.fecha}</td>
                      <td>{item.estado}</td>
                      <td>{item.calidad}%</td>
                      <td>
                        <RiskBadge level={item.riesgo as typeof metrics.riesgoGeneral} compact />
                      </td>
                      <td>
                        {item.dependencias} dep. / {item.personal} pers. / {item.funciones} fun. / {item.alertas} alertas
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>Aun no hay reportes guardados en el historial.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-document">
          <section className="report-cover">
            <div>
              <p className="eyebrow">ORGTAL 360</p>
              <h2>Informe formal de diagnostico organizacional</h2>
              <p>
                Sistema Organizacional de Gestion del Talento Humano, Funciones
                y Cargas Laborales.
              </p>
              <p className="report-author-credit">
                Derechos de autor, creacion e innovacion tecnologica:
                Edwyn Arvey Lopez Acosta.
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
              <p className="eyebrow">ORGTAL</p>
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
              <span>Autor del modelo</span>
              <strong>Edwyn Arvey Lopez Acosta</strong>
            </div>
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


"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { RiskBadge } from "@/components/risk-badge";
import { classifyWorkload, getAlerts } from "@/lib/calculations";
import { dependencyTemplates, templateToForm } from "@/lib/dependency-templates";
import type { Alert, Dependencia, Evidencia, Funcion, Persona, RiskLevel } from "@/types";

const initialForm = {
  nombre: "",
  jefe: "",
  mision: "",
  procesos: "",
  personas: 1,
  criticidad: "Media",
  estado: "Controlado"
};

function percent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampPeopleCount(value: number) {
  return Math.max(1, Math.min(30, Math.round(value || 1)));
}

function alertBelongsToDependency(alert: Alert, dependencia: Dependencia, peopleByDep: Persona[], functionsByDep: Funcion[]) {
  const text = [alert.titulo, alert.descripcion, alert.origen, alert.codigo, alert.condicion].join(" ").toLowerCase();
  if (text.includes(dependencia.nombre.toLowerCase())) return true;
  return (
    peopleByDep.some((person) => text.includes(person.nombre.toLowerCase()) || Boolean(person.codigo && text.includes(person.codigo.toLowerCase()))) ||
    functionsByDep.some((funcion) => text.includes(funcion.nombre.toLowerCase()) || Boolean(funcion.codigo && text.includes(funcion.codigo.toLowerCase())))
  );
}

function buildRecommendation(summary: {
  peopleCount: number;
  expectedPeople: number;
  functionCount: number;
  functionsWithResponsible: number;
  averageWorkload: number;
  alertCount: number;
  evidenceCount: number;
}) {
  if (summary.peopleCount < summary.expectedPeople) return "Completar el cargue de personal antes de cerrar el diagnostico de la dependencia.";
  if (summary.functionCount && summary.functionsWithResponsible < summary.functionCount) return "Asignar responsables y respaldos a las funciones pendientes para reducir vacios operativos.";
  if (summary.averageWorkload >= 86) return "Priorizar redistribucion funcional y documentar evidencias de sobrecarga critica.";
  if (summary.averageWorkload >= 71) return "Revisar cargas altas y validar si requiere apoyo, redistribucion o ajuste de funciones.";
  if (summary.alertCount > 0) return "Cerrar trazabilidad de alertas y anexar evidencia de la accion tomada.";
  if (summary.evidenceCount === 0) return "Agregar soportes documentales para respaldar el diagnostico de la dependencia.";
  return "Mantener seguimiento periodico y preparar la informacion para reporte ejecutivo.";
}

function buildDependencySummary(
  dependencia: Dependencia,
  personal: Persona[],
  funciones: Funcion[],
  evidencias: Evidencia[],
  alerts: Alert[]
) {
  const peopleByDep = personal.filter((person) => person.dependencia === dependencia.nombre);
  const peopleCodes = new Set(peopleByDep.map((person) => person.codigo || person.nombre));
  const functionsByDep = funciones.filter((funcion) => peopleCodes.has(funcion.responsable) || Boolean(funcion.respaldo && peopleCodes.has(funcion.respaldo)));
  const evidenceByDep = evidencias.filter((item) => item.dependencia === dependencia.nombre || item.asociadoA === dependencia.nombre);
  const averageWorkload = peopleByDep.length
    ? Math.round(peopleByDep.reduce((total, person) => total + person.cargaLaboral, 0) / peopleByDep.length)
    : 0;
  const functionsWithResponsible = functionsByDep.filter((funcion) => funcion.responsable).length;
  const alertsByDep = alerts.filter((alert) => alertBelongsToDependency(alert, dependencia, peopleByDep, functionsByDep));
  const expectedPeople = clampPeopleCount(Number(dependencia.personas) || 1);
  const peopleProgress = percent((peopleByDep.length / expectedPeople) * 100);
  const functionProgress = functionsByDep.length ? percent((functionsWithResponsible / functionsByDep.length) * 100) : 0;
  const evidenceProgress = evidenceByDep.length ? 100 : 0;
  const alertProgress = alertsByDep.length ? Math.max(0, 100 - alertsByDep.length * 20) : 100;
  const progress = percent((peopleProgress + functionProgress + evidenceProgress + alertProgress) / 4);
  const risk: RiskLevel = alertsByDep.some((alert) => alert.nivel === "critico") ? "critico" : classifyWorkload(averageWorkload);
  const recommendation = buildRecommendation({
    peopleCount: peopleByDep.length,
    expectedPeople,
    functionCount: functionsByDep.length,
    functionsWithResponsible,
    averageWorkload,
    alertCount: alertsByDep.length,
    evidenceCount: evidenceByDep.length
  });

  return {
    id: dependencia.id,
    nombre: dependencia.nombre,
    jefe: dependencia.jefe || "Pendiente",
    criticidad: `Criticidad ${dependencia.criticidad}`,
    peopleCount: peopleByDep.length,
    functionCount: functionsByDep.length,
    averageWorkload,
    alertCount: alertsByDep.length,
    evidenceCount: evidenceByDep.length,
    progress,
    progressLabel: progress >= 85 ? "Listo para reporte" : progress >= 55 ? "En avance" : "Requiere cargue",
    recommendation,
    risk,
    expectedPeople
  };
}

export function DependenciesManager() {
  const data = useOrgData();
  const { dependencias, personal, funciones, evidencias, alertas, addDependencia, removeDependencia } = data;
  const [form, setForm] = useState(initialForm);
  const alertsForDashboard = getAlerts({ alertas, personal, funciones });
  const summaries = dependencias.map((dependencia) =>
    buildDependencySummary(dependencia, personal, funciones, evidencias, alertsForDashboard)
  );

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.nombre.trim()) return;
    addDependencia({
      ...form,
      nombre: form.nombre.trim(),
      jefe: form.jefe.trim() || "Pendiente",
      mision: form.mision.trim(),
      procesos: form.procesos
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      personas: clampPeopleCount(Number(form.personas) || 1)
    });
    setForm(initialForm);
  }

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Modulo operativo</p>
            <h1>Dependencias</h1>
            <p>Registra areas evaluadas, jefes responsables, procesos principales y criticidad institucional.</p>
          </div>
          <span className="status-pill">{dependencias.length} registros</span>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Resumen por dependencia</h2>
            <span>{summaries.length} ficha(s) ejecutiva(s)</span>
          </div>
          <div className="dependency-summary-grid">
            {summaries.map((summary) => (
              <article className="dependency-summary-card" key={summary.id}>
                <div className="dependency-summary-head">
                  <div>
                    <span>{summary.criticidad}</span>
                    <h3>{summary.nombre}</h3>
                    <p>{summary.jefe}</p>
                  </div>
                  <RiskBadge level={summary.risk} compact />
                </div>
                <div className="dependency-summary-stats">
                  <article>
                    <span>Personal</span>
                    <strong>{summary.peopleCount}/{summary.expectedPeople}</strong>
                  </article>
                  <article>
                    <span>Funciones</span>
                    <strong>{summary.functionCount}</strong>
                  </article>
                  <article>
                    <span>Carga</span>
                    <strong>{summary.averageWorkload}%</strong>
                  </article>
                  <article>
                    <span>Alertas</span>
                    <strong>{summary.alertCount}</strong>
                  </article>
                  <article>
                    <span>Evidencias</span>
                    <strong>{summary.evidenceCount}</strong>
                  </article>
                  <article>
                    <span>Avance</span>
                    <strong>{summary.progress}%</strong>
                  </article>
                </div>
                <div className="dependency-progress">
                  <div>
                    <span style={{ width: `${summary.progress}%` }} />
                  </div>
                  <strong>{summary.progressLabel}</strong>
                </div>
                <p className="dependency-recommendation">{summary.recommendation}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="form-panel">
          <div className="panel-heading">
            <h2>Nueva dependencia</h2>
            <span>Datos basicos</span>
          </div>
          <form className="record-form" onSubmit={submitForm}>
            <div className="quick-options wide-field">
              <span>Plantillas por dependencia</span>
              <div className="template-option-grid">
                {dependencyTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setForm({ ...templateToForm(template), jefe: form.jefe })}
                  >
                    <strong>{template.label}</strong>
                    <small>{template.procesos.slice(0, 3).join(" - ")}</small>
                  </button>
                ))}
              </div>
            </div>
            <label>
              Nombre de la dependencia
              <input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
            </label>
            <label>
              Jefe responsable
              <input value={form.jefe} onChange={(event) => setForm({ ...form, jefe: event.target.value })} />
            </label>
            <label>
              Numero de personas
              <input
                max="30"
                min="1"
                type="number"
                value={form.personas}
                onChange={(event) => setForm({ ...form, personas: clampPeopleCount(Number(event.target.value)) })}
              />
              <small className="field-help">Cada dependencia puede registrar entre 1 y 30 personas. El avance compara el personal cargado contra este cupo.</small>
            </label>
            <label>
              Criticidad
              <select value={form.criticidad} onChange={(event) => setForm({ ...form, criticidad: event.target.value })}>
                <option>Media</option>
                <option>Alta</option>
                <option>Critica</option>
                <option>Baja</option>
              </select>
            </label>
            <label>
              Estado
              <select value={form.estado} onChange={(event) => setForm({ ...form, estado: event.target.value })}>
                <option>Controlado</option>
                <option>Seguimiento</option>
                <option>Critico</option>
              </select>
            </label>
            <label className="wide-field">
              Procesos principales
              <input
                placeholder="Separar por comas"
                value={form.procesos}
                onChange={(event) => setForm({ ...form, procesos: event.target.value })}
              />
            </label>
            <label className="wide-field">
              Mision
              <textarea value={form.mision} onChange={(event) => setForm({ ...form, mision: event.target.value })} />
            </label>
            <button className="primary-action" type="submit">
              Guardar dependencia
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Registros principales</h2>
            <span>{dependencias.length} elementos</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Dependencia</th>
                  <th>Jefe</th>
                  <th>Personas</th>
                  <th>Criticidad</th>
                  <th>Estado</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {dependencias.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                    <td>{item.jefe}</td>
                    <td>{item.personas}</td>
                    <td>{item.criticidad}</td>
                    <td>{item.estado}</td>
                    <td>
                      <button className="text-action" type="button" onClick={() => removeDependencia(item.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

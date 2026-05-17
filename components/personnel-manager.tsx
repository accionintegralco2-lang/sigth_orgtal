"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { RiskBadge } from "@/components/risk-badge";
import { classifyWorkload } from "@/lib/calculations";
import type { RiskLevel } from "@/types";

const initialForm = {
  nombre: "",
  cargo: "",
  dependencia: "",
  formacion: "",
  experiencia: "",
  tiempoCargo: "",
  funciones: 1,
  complejidad: "Media",
  competenciaTecnica: 3,
  competenciaDigital: 3,
  competenciaComportamental: 3,
  cargaLaboral: 50
};

const commonRoles = [
  "Jefe de dependencia",
  "Coordinador",
  "Profesional universitario",
  "Tecnico administrativo",
  "Auxiliar administrativo",
  "Analista",
  "Apoyo operativo"
];

const educationOptions = [
  "Bachiller",
  "Tecnico",
  "Tecnologo",
  "Profesional",
  "Especializacion",
  "Maestria",
  "Doctorado"
];

const experienceOptions = ["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "5 a 10 anos", "Mas de 10 anos"];
const tenureOptions = ["Menos de 6 meses", "6 a 12 meses", "1 a 2 anos", "2 a 5 anos", "Mas de 5 anos"];
const scoreOptions = [1, 2, 3, 4, 5];

export function PersonnelManager() {
  const { dependencias, personal, addPersona, removePersona } = useOrgData();
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState("");
  const [dependencyFilter, setDependencyFilter] = useState("Todas");
  const [workloadFilter, setWorkloadFilter] = useState<RiskLevel | "todos">("todos");
  const filteredPersonal = personal.filter((item) => {
    const searchText = [
      item.codigo,
      item.nombre,
      item.cargo,
      item.dependencia,
      item.formacion,
      item.experiencia,
      item.fortalezas
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = searchText.includes(query.toLowerCase().trim());
    const matchesDependency = dependencyFilter === "Todas" || item.dependencia === dependencyFilter;
    const matchesWorkload = workloadFilter === "todos" || classifyWorkload(item.cargaLaboral) === workloadFilter;
    return matchesQuery && matchesDependency && matchesWorkload;
  });
  const averageWorkload = personal.length
    ? Math.round(personal.reduce((total, item) => total + item.cargaLaboral, 0) / personal.length)
    : 0;
  const overloadedPeople = personal.filter((item) => item.cargaLaboral >= 71).length;
  const criticalPeople = personal.filter((item) => item.cargaLaboral >= 86).length;
  const averageCompetence = personal.length
    ? Math.round(
        personal.reduce(
          (total, item) =>
            total +
            ((item.competenciaTecnica ?? 0) + (item.competenciaDigital ?? 0) + (item.competenciaComportamental ?? 0)) / 3,
          0
        ) / personal.length
      )
    : 0;

  function csvValue(value: string | number | undefined) {
    return `"${String(value ?? "").replaceAll('"', '""')}"`;
  }

  function exportPersonal() {
    const rows = [
      ["Codigo", "Nombre", "Cargo", "Dependencia", "Formacion", "Experiencia", "CT", "CD", "CC", "Funciones", "ICLO"],
      ...filteredPersonal.map((item) => [
        item.codigo || item.id,
        item.nombre,
        item.cargo,
        item.dependencia,
        item.formacion || "Sin registrar",
        item.experiencia,
        item.competenciaTecnica ?? "",
        item.competenciaDigital ?? "",
        item.competenciaComportamental ?? "",
        item.funciones,
        item.cargaLaboral
      ])
    ];
    const csv = rows.map((row) => row.map(csvValue).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sigth_orgtal-personal-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.nombre.trim() || !form.cargo.trim()) return;
    addPersona({
      ...form,
      nombre: form.nombre.trim(),
      cargo: form.cargo.trim(),
      dependencia: form.dependencia || dependencias[0]?.nombre || "Sin dependencia",
      formacion: form.formacion || "Sin registrar",
      experiencia: form.experiencia.trim() || "Sin registrar",
      tiempoCargo: form.tiempoCargo.trim() || "Sin registrar",
      funciones: Number(form.funciones) || 0,
      competenciaTecnica: Number(form.competenciaTecnica) || 3,
      competenciaDigital: Number(form.competenciaDigital) || 3,
      competenciaComportamental: Number(form.competenciaComportamental) || 3,
      cargaLaboral: Number(form.cargaLaboral) || 0
    });
    setForm(initialForm);
  }

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Modulo operativo</p>
            <h1>Personal</h1>
            <p>Registra funcionarios, cargo, dependencia, experiencia, funciones e indice de carga laboral.</p>
          </div>
          <span className="status-pill">{personal.length} registros</span>
        </section>

        <section className="form-panel">
          <div className="panel-heading">
            <h2>Nuevo integrante</h2>
            <span>Caracterizacion</span>
          </div>
          <form className="record-form" onSubmit={submitForm}>
            <label>
              Nombre
              <input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
            </label>
            <label>
              Cargo
              <select value={form.cargo} onChange={(event) => setForm({ ...form, cargo: event.target.value })}>
                <option value="">Seleccionar cargo sugerido</option>
                {commonRoles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            <label>
              Dependencia
              <select value={form.dependencia} onChange={(event) => setForm({ ...form, dependencia: event.target.value })}>
                <option value="">Seleccionar</option>
                {dependencias.map((item) => (
                  <option key={item.id}>{item.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Formacion
              <select value={form.formacion} onChange={(event) => setForm({ ...form, formacion: event.target.value })}>
                <option value="">Seleccionar</option>
                {educationOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Experiencia
              <select value={form.experiencia} onChange={(event) => setForm({ ...form, experiencia: event.target.value })}>
                <option value="">Seleccionar</option>
                {experienceOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Tiempo en el cargo
              <select value={form.tiempoCargo} onChange={(event) => setForm({ ...form, tiempoCargo: event.target.value })}>
                <option value="">Seleccionar</option>
                {tenureOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Numero de funciones
              <input
                min="0"
                type="number"
                value={form.funciones}
                onChange={(event) => setForm({ ...form, funciones: Number(event.target.value) })}
              />
            </label>
            <label>
              Complejidad
              <select value={form.complejidad} onChange={(event) => setForm({ ...form, complejidad: event.target.value })}>
                <option>Baja</option>
                <option>Media</option>
                <option>Alta</option>
                <option>Critica</option>
              </select>
            </label>
            <label>
              Competencia tecnica
              <select
                value={form.competenciaTecnica}
                onChange={(event) => setForm({ ...form, competenciaTecnica: Number(event.target.value) })}
              >
                {scoreOptions.map((score) => (
                  <option key={score} value={score}>{score}</option>
                ))}
              </select>
            </label>
            <label>
              Competencia digital
              <select
                value={form.competenciaDigital}
                onChange={(event) => setForm({ ...form, competenciaDigital: Number(event.target.value) })}
              >
                {scoreOptions.map((score) => (
                  <option key={score} value={score}>{score}</option>
                ))}
              </select>
            </label>
            <label>
              Competencia comportamental
              <select
                value={form.competenciaComportamental}
                onChange={(event) => setForm({ ...form, competenciaComportamental: Number(event.target.value) })}
              >
                {scoreOptions.map((score) => (
                  <option key={score} value={score}>{score}</option>
                ))}
              </select>
            </label>
            <label>
              ICLO
              <input
                max="100"
                min="0"
                type="number"
                value={form.cargaLaboral}
                onChange={(event) => setForm({ ...form, cargaLaboral: Number(event.target.value) })}
              />
            </label>
            <button className="primary-action" type="submit">
              Guardar personal
            </button>
          </form>
        </section>

        <section className="function-summary-grid">
          <article>
            <span>ICLO promedio</span>
            <strong>{averageWorkload}%</strong>
            <p>Carga laboral consolidada</p>
          </article>
          <article>
            <span>Carga alta o critica</span>
            <strong>{overloadedPeople}</strong>
            <p>Personas que requieren revision</p>
          </article>
          <article>
            <span>Carga critica</span>
            <strong>{criticalPeople}</strong>
            <p>Casos prioritarios de balance</p>
          </article>
          <article>
            <span>Competencia media</span>
            <strong>{averageCompetence}</strong>
            <p>Promedio CT, CD y CC</p>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Registros principales</h2>
            <span>{filteredPersonal.length} de {personal.length} elementos</span>
          </div>
          <div className="table-toolbar personnel-toolbar">
            <label>
              Buscar personal
              <input
                placeholder="Codigo, nombre, cargo, formacion o experiencia"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label>
              Dependencia
              <select value={dependencyFilter} onChange={(event) => setDependencyFilter(event.target.value)}>
                <option>Todas</option>
                {dependencias.map((item) => (
                  <option key={item.id}>{item.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Carga laboral
              <select value={workloadFilter} onChange={(event) => setWorkloadFilter(event.target.value as RiskLevel | "todos")}>
                <option value="todos">Todas</option>
                <option value="critico">Critica</option>
                <option value="alto">Alta</option>
                <option value="moderado">Moderada</option>
                <option value="bajo">Baja</option>
              </select>
            </label>
            <div className="action-row">
              <button
                className="secondary-action"
                type="button"
                onClick={() => {
                  setQuery("");
                  setDependencyFilter("Todas");
                  setWorkloadFilter("todos");
                }}
              >
                Limpiar filtros
              </button>
              <button className="primary-action" type="button" onClick={exportPersonal}>
                Descargar CSV
              </button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Rol actual</th>
                  <th>Formacion</th>
                  <th>Experiencia</th>
                  <th>CT</th>
                  <th>CD</th>
                  <th>CC</th>
                  <th>Funciones</th>
                  <th>Carga</th>
                  <th>Ficha</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonal.length ? (
                  filteredPersonal.map((item) => {
                    const workload = classifyWorkload(item.cargaLaboral);
                    return (
                      <tr key={item.id}>
                        <td>{item.codigo || item.nombre}</td>
                        <td>{item.cargo}</td>
                        <td>{item.formacion || "Sin registrar"}</td>
                        <td>{item.experiencia}</td>
                        <td>{item.competenciaTecnica ?? "-"}</td>
                        <td>{item.competenciaDigital ?? "-"}</td>
                        <td>{item.competenciaComportamental ?? "-"}</td>
                        <td>{item.funciones}</td>
                        <td>
                          <div className="workload-cell">
                            <RiskBadge level={workload} compact />
                            <strong>{item.cargaLaboral}%</strong>
                          </div>
                        </td>
                        <td>
                          <Link className="secondary-action compact-action" href={`/personal/${item.id}`}>
                            Ver ficha
                          </Link>
                        </td>
                        <td>
                          <button className="text-action" type="button" onClick={() => removePersona(item.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11}>No hay personal que coincida con los filtros actuales.</td>
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

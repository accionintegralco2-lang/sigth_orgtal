"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import type { RiskLevel } from "@/types";

const initialForm = {
  nombre: "",
  responsable: "",
  respaldo: "",
  tipo: "Real y asignada",
  proceso: "",
  frecuencia: "Semanal",
  horasSemana: 2,
  ipf: 3,
  nivelIpf: "Media",
  estado: "Cubierta",
  riesgo: "moderado" as RiskLevel
};

const functionTemplates = [
  "Gestionar documentacion del proceso",
  "Consolidar reportes periodicos",
  "Atender requerimientos internos",
  "Actualizar matriz de seguimiento",
  "Coordinar actividades operativas",
  "Validar evidencias y soportes"
];

const processOptions = [
  "Gestion administrativa",
  "Gestion documental",
  "Talento humano",
  "Planeacion",
  "Control y seguimiento",
  "Apoyo logistico",
  "Atencion al usuario"
];

const functionTypeOptions = ["Real y asignada", "Critica", "Duplicada", "Sin responsable", "Fuera de perfil"];
const frequencyOptions = ["Diaria", "Semanal", "Quincenal", "Mensual", "Trimestral", "Eventual"];
const stateOptions = ["Cubierta", "Sin responsable", "Duplicada", "En revision", "Requiere actualizacion"];
const ipfLevels = ["Baja", "Media", "Alta", "Critica"];

export function FunctionsManager() {
  const { personal, funciones, addFuncion, removeFuncion } = useOrgData();
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "todos">("todos");
  const functionTypes = Array.from(new Set(funciones.map((item) => item.tipo))).sort();
  const filteredFunctions = funciones.filter((item) => {
    const searchText = [
      item.codigo,
      item.nombre,
      item.responsable,
      item.respaldo,
      item.tipo,
      item.proceso,
      item.estado,
      item.nivelIpf
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = searchText.includes(query.toLowerCase().trim());
    const matchesType = typeFilter === "Todos" || item.tipo === typeFilter;
    const matchesRisk = riskFilter === "todos" || item.riesgo === riskFilter;
    return matchesQuery && matchesType && matchesRisk;
  });
  const criticalCount = funciones.filter((item) => item.nivelIpf === "Critica" || item.riesgo === "critico").length;
  const duplicatedCount = funciones.filter((item) => item.tipo === "Duplicada").length;
  const unassignedCount = funciones.filter((item) => !item.responsable).length;
  const totalHours = funciones.reduce((total, item) => total + (item.horasSemana ?? 0), 0);
  const selectedResponsible = personal.find((item) => (item.codigo || item.nombre) === form.responsable);
  const selectedResponsibleFunctions = form.responsable
    ? funciones.filter((item) => item.responsable === form.responsable).length
    : 0;
  const functionsByPerson = personal.map((person) => {
    const key = person.codigo || person.nombre;
    return {
      id: person.id,
      label: `${key} - ${person.cargo}`,
      dependencia: person.dependencia,
      expected: person.funciones,
      assigned: funciones.filter((item) => item.responsable === key).length
    };
  });

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.nombre.trim()) return;
    addFuncion({
      ...form,
      nombre: form.nombre.trim(),
      horasSemana: Number(form.horasSemana) || undefined,
      ipf: Number(form.ipf) || undefined
    });
    setForm(initialForm);
  }

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Modulo operativo</p>
            <h1>Funciones</h1>
            <p>Registra funciones asignadas, reales, criticas, duplicadas o sin responsable para alimentar alertas.</p>
          </div>
          <span className="status-pill">{funciones.length} registros</span>
        </section>

        <section className="form-panel">
          <div className="panel-heading">
            <h2>Nueva funcion</h2>
            <span>Analisis funcional</span>
          </div>
          <form className="record-form" onSubmit={submitForm}>
            <div className="quick-options wide-field">
              <span>Funciones sugeridas</span>
              <div>
                {functionTemplates.map((template) => (
                  <button key={template} type="button" onClick={() => setForm({ ...form, nombre: template })}>
                    {template}
                  </button>
                ))}
              </div>
            </div>
            <label className="wide-field">
              Funcion
              <input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
              <small className="field-help">Describe la actividad concreta que se realiza o debe realizarse.</small>
            </label>
            <label>
              Responsable
              <select value={form.responsable} onChange={(event) => setForm({ ...form, responsable: event.target.value })}>
                <option value="">Sin responsable</option>
                {personal.map((item) => (
                  <option key={item.id} value={item.codigo || item.nombre}>
                    {item.codigo || item.nombre} - {item.cargo}
                  </option>
                ))}
              </select>
              <small className="field-help">Es la persona principal que responde por el cumplimiento de la funcion.</small>
              {selectedResponsible ? (
                <small className="field-help">
                  {selectedResponsible.codigo || selectedResponsible.nombre} tiene {selectedResponsibleFunctions} funcion(es) asignada(s) en la matriz y declaro {selectedResponsible.funciones}.
                </small>
              ) : null}
            </label>
            <label>
              Respaldo
              <select value={form.respaldo} onChange={(event) => setForm({ ...form, respaldo: event.target.value })}>
                <option value="">Sin respaldo</option>
                {personal.map((item) => (
                  <option key={item.id} value={item.codigo || item.nombre}>
                    {item.codigo || item.nombre} - {item.cargo}
                  </option>
                ))}
              </select>
              <small className="field-help">Respaldo es quien puede asumir la funcion si el responsable no esta.</small>
            </label>
            <label>
              Tipo
              <select value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value })}>
                {functionTypeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <small className="field-help">Clasifica si la funcion es real, critica, duplicada o esta fuera del perfil.</small>
            </label>
            <label>
              Proceso
              <select value={form.proceso} onChange={(event) => setForm({ ...form, proceso: event.target.value })}>
                <option value="">Seleccionar</option>
                {processOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Frecuencia
              <select value={form.frecuencia} onChange={(event) => setForm({ ...form, frecuencia: event.target.value })}>
                {frequencyOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <small className="field-help">Indica cada cuanto se ejecuta la actividad.</small>
            </label>
            <label>
              Horas semana
              <input
                min="0"
                type="number"
                value={form.horasSemana}
                onChange={(event) => setForm({ ...form, horasSemana: Number(event.target.value) })}
              />
              <small className="field-help">Tiempo estimado que ocupa la funcion durante una semana normal.</small>
            </label>
            <label>
              IPF
              <select value={form.ipf} onChange={(event) => setForm({ ...form, ipf: Number(event.target.value) })}>
                {[1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>{score}</option>
                ))}
              </select>
              <small className="field-help">IPF mide el peso funcional de la actividad en escala de 1 a 5.</small>
            </label>
            <label>
              Nivel IPF
              <select value={form.nivelIpf} onChange={(event) => setForm({ ...form, nivelIpf: event.target.value })}>
                {ipfLevels.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <small className="field-help">Resume si el peso de la funcion es bajo, medio, alto o critico.</small>
            </label>
            <label>
              Estado
              <select value={form.estado} onChange={(event) => setForm({ ...form, estado: event.target.value })}>
                {stateOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <small className="field-help">Muestra si la funcion esta cubierta, duplicada o requiere actualizacion.</small>
            </label>
            <label>
              Riesgo
              <select
                value={form.riesgo}
                onChange={(event) => setForm({ ...form, riesgo: event.target.value as RiskLevel })}
              >
                <option value="bajo">Bajo</option>
                <option value="moderado">Moderado</option>
                <option value="alto">Alto</option>
                <option value="critico">Critico</option>
              </select>
              <small className="field-help">Usa alto o critico cuando la funcion afecte continuidad, oportunidad o control.</small>
            </label>
            <button className="primary-action" type="submit">
              Guardar funcion
            </button>
          </form>
        </section>

        <section className="function-summary-grid">
          <article>
            <span>Funciones criticas</span>
            <strong>{criticalCount}</strong>
            <p>Requieren control prioritario</p>
          </article>
          <article>
            <span>Duplicidades</span>
            <strong>{duplicatedCount}</strong>
            <p>Casos para depuracion funcional</p>
          </article>
          <article>
            <span>Sin responsable</span>
            <strong>{unassignedCount}</strong>
            <p>Funciones por asignar formalmente</p>
          </article>
          <article>
            <span>Horas semanales</span>
            <strong>{totalHours}</strong>
            <p>Carga estimada de funciones</p>
          </article>
        </section>

        <section className="panel capacity-panel">
          <div className="panel-heading">
            <h2>Funciones variables por persona</h2>
            <span>Control de asignacion</span>
          </div>
          <p>
            Cada cargo puede tener una cantidad distinta de funciones. Esta
            comparacion ayuda a ver si lo asignado en la matriz coincide con lo
            declarado en el modulo de personal.
          </p>
          <div className="capacity-grid">
            {functionsByPerson.map((item) => {
              const gap = item.expected - item.assigned;
              return (
                <article key={item.id}>
                  <strong>{item.label}</strong>
                  <p>{item.dependencia}</p>
                  <span>
                    Matriz: {item.assigned} / Declaradas: {item.expected}
                    {gap > 0 ? ` - faltan ${gap}` : gap < 0 ? ` - excede ${Math.abs(gap)}` : " - equilibrado"}
                  </span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Registros principales</h2>
            <span>{filteredFunctions.length} de {funciones.length} elementos</span>
          </div>
          <div className="table-toolbar">
            <label>
              Buscar funcion
              <input
                placeholder="Codigo, responsable, proceso o palabra clave"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label>
              Tipo
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option>Todos</option>
                {functionTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Riesgo
              <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as RiskLevel | "todos")}>
                <option value="todos">Todos</option>
                <option value="critico">Critico</option>
                <option value="alto">Alto</option>
                <option value="moderado">Moderado</option>
                <option value="bajo">Bajo</option>
              </select>
            </label>
            <button
              className="secondary-action"
              type="button"
              onClick={() => {
                setQuery("");
                setTypeFilter("Todos");
                setRiskFilter("todos");
              }}
            >
              Limpiar filtros
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Funcion</th>
                  <th>Responsable</th>
                  <th>Respaldo</th>
                  <th>Tipo</th>
                  <th>Proceso</th>
                  <th>Horas</th>
                  <th>IPF</th>
                  <th>Nivel</th>
                  <th>Estado</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {filteredFunctions.length ? (
                  filteredFunctions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nombre}</td>
                      <td>{item.responsable || "Sin responsable"}</td>
                      <td>{item.respaldo || "Sin respaldo"}</td>
                      <td>{item.tipo}</td>
                      <td>{item.proceso || "Sin proceso"}</td>
                      <td>{item.horasSemana ?? "-"}</td>
                      <td>{item.ipf ?? "-"}</td>
                      <td>{item.nivelIpf || item.riesgo}</td>
                      <td>{item.estado || "Sin estado"}</td>
                      <td>
                        <button className="text-action" type="button" onClick={() => removeFuncion(item.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10}>No hay funciones que coincidan con los filtros actuales.</td>
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

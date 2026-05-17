"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { RiskBadge } from "@/components/risk-badge";

type MatrixRole = "" | "R" | "S" | "D";

const roleOptions: Array<{ label: string; value: MatrixRole; detail: string }> = [
  { label: "Responsable", value: "R", detail: "Responsable principal" },
  { label: "Respaldo", value: "S", detail: "Soporte o continuidad" },
  { label: "Duplicidad", value: "D", detail: "Posible duplicidad funcional" },
  { label: "Sin asignacion", value: "", detail: "Limpiar celda" }
];

const matrixStorageKey = "orgtalsigth-function-person-matrix-v1";

function cellClass(role: MatrixRole) {
  if (role === "R") return "matrix-cell responsible";
  if (role === "S") return "matrix-cell backup";
  if (role === "D") return "matrix-cell duplicated";
  return "matrix-cell";
}

function makeCellKey(functionId: string, personId: string) {
  return `${functionId}::${personId}`;
}

export function FunctionPersonMatrixView() {
  const { personal, funciones } = useOrgData();
  const [selectedRole, setSelectedRole] = useState<MatrixRole>("R");
  const [assignments, setAssignments] = useState<Record<string, MatrixRole>>({});
  const [isReady, setIsReady] = useState(false);

  const baseAssignments = useMemo(() => {
    const next: Record<string, MatrixRole> = {};
    funciones.forEach((funcion) => {
      personal.forEach((person) => {
        const identity = person.codigo || person.nombre;
        const isResponsible = funcion.responsable === identity || funcion.responsable === person.nombre;
        const isBackup = funcion.respaldo === identity || funcion.respaldo === person.nombre;
        const role: MatrixRole = isResponsible ? (funcion.tipo === "Duplicada" ? "D" : "R") : isBackup ? "S" : "";
        next[makeCellKey(funcion.id, person.id)] = role;
      });
    });
    return next;
  }, [funciones, personal]);

  const visibleAssignments = useMemo(
    () => ({ ...baseAssignments, ...assignments }),
    [assignments, baseAssignments]
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(matrixStorageKey);
    if (stored) {
      setAssignments(JSON.parse(stored) as Record<string, MatrixRole>);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(matrixStorageKey, JSON.stringify(assignments));
  }, [assignments, isReady]);

  function selectCell(functionId: string, personId: string) {
    const key = makeCellKey(functionId, personId);
    setAssignments((current) => ({ ...current, [key]: selectedRole }));
  }

  function resetMatrix() {
    setAssignments({});
    window.localStorage.removeItem(matrixStorageKey);
  }

  const assignmentValues = Object.values(visibleAssignments);
  const duplicateFunctions = funciones.filter((funcion) =>
    personal.some((person) => visibleAssignments[makeCellKey(funcion.id, person.id)] === "D")
  ).length;
  const unassignedFunctions = funciones.filter((funcion) =>
    personal.every((person) => visibleAssignments[makeCellKey(funcion.id, person.id)] !== "R")
  ).length;
  const criticalFunctions = funciones.filter((item) => item.riesgo === "critico" || item.nivelIpf === "Critica").length;

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Tablero cruzado</p>
            <h1>Matriz funcion-persona</h1>
            <p>
              Cruce visual para identificar responsable directo, respaldo,
              duplicidades y funciones sin responsable formal.
            </p>
          </div>
          <span className="status-pill">{funciones.length} funciones</span>
        </section>

        <section className="function-summary-grid">
          <article>
            <span>Responsables</span>
            <strong>{assignmentValues.filter((role) => role === "R").length}</strong>
            <p>Funciones con asignacion directa</p>
          </article>
          <article>
            <span>Respaldos</span>
            <strong>{assignmentValues.filter((role) => role === "S").length}</strong>
            <p>Funciones con continuidad</p>
          </article>
          <article>
            <span>Duplicadas</span>
            <strong>{duplicateFunctions}</strong>
            <p>Casos para depuracion</p>
          </article>
          <article>
            <span>Criticas</span>
            <strong>{criticalFunctions}</strong>
            <p>Prioridad de control</p>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Mapa de asignacion funcional</h2>
            <span>Selecciona una marca y luego una celda</span>
          </div>
          <div className="matrix-tools">
            <div className="matrix-legend">
              {roleOptions.map((option) => (
                <button
                  className={`matrix-tool ${selectedRole === option.value ? "active" : ""}`}
                  key={option.label}
                  type="button"
                  onClick={() => setSelectedRole(option.value)}
                >
                  <b className={`legend-box ${option.value === "R" ? "responsible" : option.value === "S" ? "backup" : option.value === "D" ? "duplicated" : "empty"}`}>
                    {option.value}
                  </b>
                  <span>{option.label}</span>
                  <small>{option.detail}</small>
                </button>
              ))}
            </div>
            <button className="secondary-action compact-action" type="button" onClick={resetMatrix}>
              Restaurar matriz
            </button>
          </div>
          <div className="matrix-wrap">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Funcion</th>
                  {personal.map((person) => (
                    <th key={person.id}>{person.codigo || person.nombre}</th>
                  ))}
                  <th>Riesgo</th>
                </tr>
              </thead>
              <tbody>
                {funciones.map((funcion) => (
                  <tr key={funcion.id}>
                    <td>
                      <strong>{funcion.codigo || funcion.id}</strong>
                      <p>{funcion.nombre}</p>
                      {!funcion.responsable ? <em>Sin responsable formal</em> : null}
                    </td>
                    {personal.map((person) => {
                      const key = makeCellKey(funcion.id, person.id);
                      const role = visibleAssignments[key] ?? "";
                      return (
                        <td className={cellClass(role)} key={`${funcion.id}-${person.id}`}>
                          <button
                            aria-label={`${funcion.codigo || funcion.id} con ${person.codigo || person.nombre}`}
                            className="matrix-cell-button"
                            type="button"
                            onClick={() => selectCell(funcion.id, person.id)}
                          >
                            {role || "-"}
                          </button>
                        </td>
                      );
                    })}
                    <td>
                      <RiskBadge level={funcion.riesgo} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {unassignedFunctions > 0 ? (
          <section className="panel">
            <div className="panel-heading">
              <h2>Funciones sin responsable</h2>
              <span>{unassignedFunctions} pendientes</span>
            </div>
            <div className="compact-list">
              {funciones
                .filter((funcion) =>
                  personal.every((person) => visibleAssignments[makeCellKey(funcion.id, person.id)] !== "R")
                )
                .map((item) => (
                  <div className="breach-item" key={item.id}>
                    <strong>{item.codigo || item.id}</strong>
                    <p>{item.nombre}</p>
                    <em>Asignar responsable formal y respaldo operativo.</em>
                  </div>
                ))}
            </div>
          </section>
        ) : null}
      </main>
    </AppShell>
  );
}

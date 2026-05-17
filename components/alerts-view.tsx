"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { RiskBadge } from "@/components/risk-badge";
import { getAlerts } from "@/lib/calculations";
import type { RiskLevel } from "@/types";

const filters: Array<{ label: string; value: RiskLevel | "todas" }> = [
  { label: "Todas", value: "todas" },
  { label: "Criticas", value: "critico" },
  { label: "Altas", value: "alto" },
  { label: "Seguimiento", value: "moderado" },
  { label: "Controladas", value: "bajo" }
];

type AlertTrace = {
  estadoSeguimiento: "Abierta" | "En revision" | "Cerrada";
  responsableSeguimiento: string;
  fechaSeguimiento: string;
  evidencia: string;
  accionTomada: string;
};

const traceStorageKey = "orgtalsigth-alert-trace-v1";

function csvValue(value: string | number | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function emptyTrace(): AlertTrace {
  return {
    estadoSeguimiento: "Abierta",
    responsableSeguimiento: "",
    fechaSeguimiento: "",
    evidencia: "",
    accionTomada: ""
  };
}

export function AlertsView() {
  const data = useOrgData();
  const alerts = getAlerts(data);
  const [activeFilter, setActiveFilter] = useState<RiskLevel | "todas">("todas");
  const [traces, setTraces] = useState<Record<string, AlertTrace>>({});
  const [isReady, setIsReady] = useState(false);
  const filteredAlerts = activeFilter === "todas" ? alerts : alerts.filter((alert) => alert.nivel === activeFilter);
  const enrichedAlerts = filteredAlerts.map((alert) => ({
    ...alert,
    trace: traces[alert.id] ?? {
      estadoSeguimiento: "Abierta" as const,
      responsableSeguimiento: "",
      fechaSeguimiento: "",
      evidencia: "",
      accionTomada: ""
    }
  }));
  const counts = useMemo(
    () => ({
      todas: alerts.length,
      critico: alerts.filter((alert) => alert.nivel === "critico").length,
      alto: alerts.filter((alert) => alert.nivel === "alto").length,
      moderado: alerts.filter((alert) => alert.nivel === "moderado").length,
      bajo: alerts.filter((alert) => alert.nivel === "bajo").length
    }),
    [alerts]
  );
  const traceStats = useMemo(
    () => ({
      abiertas: alerts.filter((alert) => (traces[alert.id]?.estadoSeguimiento ?? "Abierta") === "Abierta").length,
      revision: alerts.filter((alert) => traces[alert.id]?.estadoSeguimiento === "En revision").length,
      cerradas: alerts.filter((alert) => traces[alert.id]?.estadoSeguimiento === "Cerrada").length
    }),
    [alerts, traces]
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(traceStorageKey);
    if (stored) {
      setTraces(JSON.parse(stored) as Record<string, AlertTrace>);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(traceStorageKey, JSON.stringify(traces));
  }, [isReady, traces]);

  function updateTrace(alertId: string, patch: Partial<AlertTrace>) {
    setTraces((current) => ({
      ...current,
      [alertId]: {
        ...emptyTrace(),
        ...current[alertId],
        ...patch
      }
    }));
  }

  function exportTrace() {
    const rows = [
      ["Nivel", "Alerta", "Origen", "Estado", "Responsable", "Fecha", "Evidencia", "Accion tomada"],
      ...alerts.map((alert) => {
        const trace = traces[alert.id];
        return [
          alert.nivel,
          alert.titulo,
          alert.origen,
          trace?.estadoSeguimiento ?? "Abierta",
          trace?.responsableSeguimiento ?? "",
          trace?.fechaSeguimiento ?? "",
          trace?.evidencia ?? "",
          trace?.accionTomada ?? ""
        ];
      })
    ];
    const csv = rows.map((row) => row.map(csvValue).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sigth_orgtal-trazabilidad-alertas-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Control preventivo</p>
            <h1>Alertas organizacionales</h1>
            <p>
              Alertas automaticas generadas a partir de sobrecarga, funciones sin
              responsable, duplicidades y brechas de perfil.
            </p>
          </div>
          <button className="primary-action" type="button" onClick={exportTrace}>
            Descargar trazabilidad CSV
          </button>
        </section>

        <section className="function-summary-grid">
          <article>
            <span>Abiertas</span>
            <strong>{traceStats.abiertas}</strong>
            <p>Pendientes de gestion</p>
          </article>
          <article>
            <span>En revision</span>
            <strong>{traceStats.revision}</strong>
            <p>Con seguimiento activo</p>
          </article>
          <article>
            <span>Cerradas</span>
            <strong>{traceStats.cerradas}</strong>
            <p>Con accion documentada</p>
          </article>
          <article>
            <span>Criticas</span>
            <strong>{counts.critico}</strong>
            <p>Prioridad institucional</p>
          </article>
        </section>

        <section className="filter-panel">
          {filters.map((filter) => (
            <button
              className={`filter-button ${activeFilter === filter.value ? "active" : ""}`}
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
            >
              <span>{filter.label}</span>
              <strong>{counts[filter.value]}</strong>
            </button>
          ))}
        </section>

        <section className="alert-board">
          {enrichedAlerts.length ? (
            enrichedAlerts.map((alert) => (
              <article className="alert-card" key={alert.id}>
                <RiskBadge level={alert.nivel} compact />
                <div>
                  <h2>{alert.titulo}</h2>
                  <p>{alert.descripcion}</p>
                  <span>{alert.origen}</span>
                  {alert.accion ? <p className="alert-action">Accion: {alert.accion}</p> : null}
                  <div className="trace-grid">
                    <label>
                      Estado
                      <select
                        value={alert.trace.estadoSeguimiento}
                        onChange={(event) =>
                          updateTrace(alert.id, { estadoSeguimiento: event.target.value as AlertTrace["estadoSeguimiento"] })
                        }
                      >
                        <option>Abierta</option>
                        <option>En revision</option>
                        <option>Cerrada</option>
                      </select>
                    </label>
                    <label>
                      Responsable
                      <select
                        value={alert.trace.responsableSeguimiento}
                        onChange={(event) => updateTrace(alert.id, { responsableSeguimiento: event.target.value })}
                      >
                        <option value="">Pendiente</option>
                        {data.personal.map((person) => (
                          <option key={person.id} value={person.codigo || person.nombre}>
                            {person.codigo || person.nombre} - {person.cargo}
                          </option>
                        ))}
                        <option>Jefe de dependencia</option>
                        <option>Talento humano</option>
                        <option>Direccion</option>
                      </select>
                    </label>
                    <label>
                      Fecha
                      <input
                        type="date"
                        value={alert.trace.fechaSeguimiento}
                        onChange={(event) => updateTrace(alert.id, { fechaSeguimiento: event.target.value })}
                      />
                    </label>
                    <label className="wide-trace">
                      Evidencia
                      <input
                        placeholder="Acta, soporte, enlace o documento"
                        value={alert.trace.evidencia}
                        onChange={(event) => updateTrace(alert.id, { evidencia: event.target.value })}
                      />
                    </label>
                    <label className="wide-trace">
                      Accion tomada
                      <textarea
                        placeholder="Describe la gestion realizada o el compromiso de cierre"
                        value={alert.trace.accionTomada}
                        onChange={(event) => updateTrace(alert.id, { accionTomada: event.target.value })}
                      />
                    </label>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <article className="empty-state">
              <h2>Sin alertas en este filtro</h2>
              <p>No se detectan registros para la categoria seleccionada.</p>
            </article>
          )}
        </section>
      </main>
    </AppShell>
  );
}

"use client";

import type { CSSProperties } from "react";
import { AppShell } from "@/components/app-shell";
import { DiagnosisProgressPanel } from "@/components/diagnosis-progress-panel";
import { useOrgData } from "@/components/org-data-provider";
import { RiskBadge } from "@/components/risk-badge";
import { getAlerts, getDashboardMetrics } from "@/lib/calculations";

export function DashboardView() {
  const data = useOrgData();
  const metrics = getDashboardMetrics(data);
  const alerts = getAlerts(data);
  const ipfDistribution = [
    { label: "Critica", value: data.funciones.filter((item) => item.nivelIpf === "Critica").length, className: "critico" },
    { label: "Alta", value: data.funciones.filter((item) => item.nivelIpf === "Alta").length, className: "alto" },
    { label: "Media", value: data.funciones.filter((item) => item.nivelIpf === "Media").length, className: "moderado" }
  ];
  const totalFunctions = ipfDistribution.reduce((total, item) => total + item.value, 0);
  const criticalPercent = totalFunctions ? Math.round((ipfDistribution[0].value / totalFunctions) * 100) : 0;
  const highPercent = totalFunctions ? Math.round((ipfDistribution[1].value / totalFunctions) * 100) : 0;
  const donutStyle = {
    "--critical": `${criticalPercent}%`,
    "--high": `${criticalPercent + highPercent}%`
  } as CSSProperties;
  const maxWorkload = Math.max(...data.personal.map((item) => item.cargaLaboral), 1);
  const criticalFunctions = data.funciones.filter((item) => item.nivelIpf === "Critica").length;
  const highFunctions = data.funciones.filter((item) => item.nivelIpf === "Alta").length;
  const overloadedPeople = data.personal.filter((item) => item.cargaLaboral >= 71);
  const duplicatedFunctions = data.funciones.filter((item) => item.tipo === "Duplicada").length;
  const unassignedFunctions = data.funciones.filter((item) => !item.responsable).length;
  const criticalAlerts = alerts.filter((alert) => alert.nivel === "critico").length;
  const topWorkload = [...data.personal].sort((a, b) => b.cargaLaboral - a.cargaLaboral)[0];
  const highestRiskDependency = [...metrics.riesgosPorDependencia].sort((a, b) => b.valor - a.valor)[0];
  const executivePriorities = [
    {
      title: "Prioridad funcional",
      value: `${criticalFunctions + highFunctions}`,
      label: "Funciones en nivel alto o critico",
      detail: `${criticalFunctions} criticas y ${highFunctions} altas requieren seguimiento.`
    },
    {
      title: "Prioridad de talento humano",
      value: `${overloadedPeople.length}`,
      label: "Perfiles con carga elevada",
      detail: topWorkload ? `${topWorkload.codigo || topWorkload.nombre} registra la mayor carga: ${topWorkload.cargaLaboral}%.` : "Sin cargas registradas."
    },
    {
      title: "Prioridad de control",
      value: `${duplicatedFunctions + unassignedFunctions}`,
      label: "Casos por depurar",
      detail: `${duplicatedFunctions} duplicidades y ${unassignedFunctions} funciones sin responsable.`
    },
    {
      title: "Prioridad de decision",
      value: `${criticalAlerts}`,
      label: "Alertas criticas",
      detail: criticalAlerts > 0 ? "Requieren plan de accion y responsable de cierre." : "No hay alertas criticas activas."
    }
  ];

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Centro de mando</p>
            <h1>Dashboard ejecutivo</h1>
            <p>
              Vista consolidada del estado organizacional, cargas laborales,
              funciones criticas y alertas activas.
            </p>
          </div>
          <RiskBadge level={metrics.riesgoGeneral} />
        </section>

        <section className="institutional-banner">
          <div className="banner-copy">
            <span>SIGTH_ORGTAL 360</span>
            <h2>Radiografia funcional para decision directiva</h2>
            <p>
              Consolidado visual del piloto: talento humano, funciones, cargas
              laborales, alertas y brechas prospectivas.
            </p>
          </div>
          <div className="banner-stats">
            <article>
              <span>Riesgo general</span>
              <strong>{metrics.riesgoGeneral}</strong>
            </article>
            <article>
              <span>Funciones evaluadas</span>
              <strong>{totalFunctions}</strong>
            </article>
            <article>
              <span>Alertas criticas</span>
              <strong>{criticalAlerts}</strong>
            </article>
          </div>
        </section>

        <section className="metric-grid">
          {metrics.cards.map((card) => (
            <article className="metric-card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.detail}</small>
            </article>
          ))}
        </section>

        <DiagnosisProgressPanel data={data} />

        <section className="panel executive-summary">
          <div className="panel-heading">
            <h2>Lectura ejecutiva del diagnostico</h2>
            <span>Prioridades automaticas</span>
          </div>
          <div className="executive-grid">
            {executivePriorities.map((item) => (
              <article className="executive-card" key={item.title}>
                <span>{item.title}</span>
                <strong>{item.value}</strong>
                <b>{item.label}</b>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="panel risk-visual-panel">
            <div className="panel-heading">
              <h2>Riesgo por dependencia</h2>
              <span>Semaforo directivo</span>
            </div>
            <div className="risk-visual-card">
              <div>
                <span>Dependencia con mayor exposicion</span>
                <strong>{highestRiskDependency?.nombre ?? "Sin registros"}</strong>
                <p>
                  {highestRiskDependency
                    ? `Nivel ${highestRiskDependency.estado} con indicador de ${highestRiskDependency.valor}%.`
                    : "Aun no hay informacion suficiente para calcular el riesgo."}
                </p>
              </div>
              <div className={`risk-signal ${highestRiskDependency?.estado ?? "bajo"}`}>
                <strong>{highestRiskDependency?.valor ?? 0}%</strong>
                <span>{highestRiskDependency?.estado ?? "bajo"}</span>
              </div>
            </div>
            <div className="risk-bars">
              {metrics.riesgosPorDependencia.map((item) => (
                <div className="risk-row" key={item.nombre}>
                  <span>{item.nombre}</span>
                  <div className="bar-track">
                    <div className={`bar-fill ${item.estado}`} style={{ width: `${item.valor}%` }} />
                  </div>
                  <strong>{item.valor}%</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h2>Alertas prioritarias</h2>
              <span>{alerts.length} activas</span>
            </div>
            <div className="alert-list">
              {alerts.slice(0, 5).map((alert) => (
                <div className="alert-item" key={alert.id}>
                  <RiskBadge level={alert.nivel} compact />
                  <div>
                    <strong>{alert.titulo}</strong>
                    <p>{alert.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel">
            <div className="panel-heading">
              <h2>Distribucion nivel IPF</h2>
              <span>{totalFunctions} funciones</span>
            </div>
            <div className="donut-layout">
              <div className="donut-chart" style={donutStyle}>
                <strong>{totalFunctions}</strong>
                <span>Funciones</span>
              </div>
              <div className="chart-legend">
                {ipfDistribution.map((item) => (
                  <div className="legend-row" key={item.label}>
                    <span className={`legend-dot ${item.className}`} />
                    <strong>{item.label}</strong>
                    <em>{item.value}</em>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h2>Carga laboral por perfil</h2>
              <span>ICLO piloto</span>
            </div>
            <div className="column-chart">
              {data.personal.map((person) => (
                <div className="column-item" key={person.id}>
                  <div className="column-track">
                    <div
                      className={`column-fill ${person.cargaLaboral >= 86 ? "critico" : person.cargaLaboral >= 71 ? "alto" : person.cargaLaboral >= 41 ? "moderado" : "bajo"}`}
                      style={{ height: `${(person.cargaLaboral / maxWorkload) * 100}%` }}
                    />
                  </div>
                  <strong>{person.cargaLaboral}%</strong>
                  <span>{person.codigo || person.nombre}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </AppShell>
  );
}

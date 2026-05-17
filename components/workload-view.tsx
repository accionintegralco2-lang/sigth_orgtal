"use client";

import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { RiskBadge } from "@/components/risk-badge";
import { classifyWorkload } from "@/lib/calculations";
import type { CSSProperties } from "react";

export function WorkloadView() {
  const { personal } = useOrgData();

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Indice de carga laboral</p>
            <h1>Cargas laborales</h1>
            <p>
              Evaluacion inicial de carga segun numero de funciones, complejidad,
              frecuencia, responsabilidad, impacto y riesgo.
            </p>
          </div>
        </section>

        <section className="workload-grid">
          {personal.map((item) => {
            const classification = classifyWorkload(item.cargaLaboral);
            const scoreStyle = { "--score": `${item.cargaLaboral}%` } as CSSProperties;
            return (
              <article className="workload-card" key={item.nombre}>
                <div className="panel-heading">
                  <h2>{item.nombre}</h2>
                  <RiskBadge level={classification} compact />
                </div>
                <p>{item.cargo}</p>
                <div className="score-ring" style={scoreStyle}>
                  <strong>{item.cargaLaboral}</strong>
                  <span>ICLO</span>
                </div>
                <div className="compact-list">
                  <span>Dependencia: {item.dependencia}</span>
                  <span>Funciones: {item.funciones}</span>
                  <span>Complejidad: {item.complejidad}</span>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </AppShell>
  );
}

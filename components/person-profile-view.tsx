"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { RiskBadge } from "@/components/risk-badge";
import { brechas, compatibilidades } from "@/data/mock-data";
import { classifyWorkload, getAlerts } from "@/lib/calculations";

export function PersonProfileView({ personId }: { personId: string }) {
  const data = useOrgData();
  const person = data.personal.find((item) => item.id === personId || item.codigo === personId);

  if (!person) {
    return (
      <AppShell>
        <main className="page-stack">
          <section className="empty-state">
            <h2>Funcionario no encontrado</h2>
            <p>Regresa al modulo de personal y selecciona una ficha disponible.</p>
            <Link className="primary-action" href="/personal">
              Volver a personal
            </Link>
          </section>
        </main>
      </AppShell>
    );
  }

  const identity = person.codigo || person.nombre;
  const assignedFunctions = data.funciones.filter((item) => item.responsable === identity || item.responsable === person.nombre);
  const backupFunctions = data.funciones.filter((item) => item.respaldo === identity || item.respaldo === person.nombre);
  const personBreaches = brechas.filter((item) => item.responsable === identity || item.mejorPersona === identity);
  const personCompatibilities = compatibilidades.filter((item) => item.persona === identity);
  const alerts = getAlerts(data).filter(
    (alert) =>
      alert.descripcion.includes(identity) ||
      alert.titulo.includes(identity) ||
      alert.origen.includes(person.dependencia)
  );
  const workload = classifyWorkload(person.cargaLaboral);
  const competenceAverage = Math.round(
    ((person.competenciaTecnica ?? 0) + (person.competenciaDigital ?? 0) + (person.competenciaComportamental ?? 0)) / 3
  );
  const recommendations = [
    person.cargaLaboral >= 71
      ? "Revisar balance de carga y redistribuir funciones de mayor frecuencia."
      : "Mantener monitoreo de carga laboral y evidencia de responsabilidades.",
    personBreaches.length
      ? "Atender brechas funcionales asociadas al perfil y documentar plan de cierre."
      : "Conservar trazabilidad de funciones asignadas y respaldos.",
    competenceAverage < 4
      ? "Priorizar capacitacion tecnica, digital o comportamental segun brecha."
      : "Perfil con competencias suficientes para sostener responsabilidades actuales."
  ];

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Ficha individual</p>
            <h1>{identity}</h1>
            <p>
              {person.cargo} - {person.dependencia}
            </p>
          </div>
          <RiskBadge level={workload} />
        </section>

        <section className="profile-hero">
          <div>
            <span>{person.formacion || "Formacion sin registrar"}</span>
            <h2>{person.cargo}</h2>
            <p>{person.fortalezas || "Fortalezas pendientes por documentar."}</p>
          </div>
          <div className="profile-score">
            <strong>{person.cargaLaboral}%</strong>
            <span>ICLO</span>
          </div>
        </section>

        <section className="function-summary-grid">
          <article>
            <span>Funciones asignadas</span>
            <strong>{assignedFunctions.length}</strong>
            <p>Responsabilidad directa</p>
          </article>
          <article>
            <span>Funciones respaldo</span>
            <strong>{backupFunctions.length}</strong>
            <p>Continuidad operativa</p>
          </article>
          <article>
            <span>Competencia media</span>
            <strong>{competenceAverage}</strong>
            <p>Promedio CT, CD y CC</p>
          </article>
          <article>
            <span>Brechas asociadas</span>
            <strong>{personBreaches.length}</strong>
            <p>Seguimiento funcional</p>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel">
            <div className="panel-heading">
              <h2>Funciones directas</h2>
              <span>{assignedFunctions.length} registros</span>
            </div>
            <div className="compact-list">
              {assignedFunctions.length ? (
                assignedFunctions.map((item) => (
                  <div className="breach-item" key={item.id}>
                    <strong>{item.codigo || item.id}</strong>
                    <p>{item.nombre}</p>
                    <span>
                      Tipo: {item.tipo} - IPF: {item.ipf ?? "-"} - Estado: {item.estado || "Sin estado"}
                    </span>
                  </div>
                ))
              ) : (
                <p>No hay funciones directas registradas para este perfil.</p>
              )}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h2>Competencias</h2>
              <span>Escala 1 a 5</span>
            </div>
            <div className="competence-radar">
              {[
                ["Tecnica", person.competenciaTecnica ?? 0],
                ["Digital", person.competenciaDigital ?? 0],
                ["Comportamental", person.competenciaComportamental ?? 0],
                ["Autonomia", person.autonomia ?? 0],
                ["Disponibilidad", person.disponibilidad ?? 0]
              ].map(([label, value]) => (
                <div className="competence-row" key={label}>
                  <span>{label}</span>
                  <div className="bar-track">
                    <div className="bar-fill bajo" style={{ width: `${(Number(value) / 5) * 100}%` }} />
                  </div>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel">
            <div className="panel-heading">
              <h2>Brechas y compatibilidad</h2>
              <span>{personCompatibilities.length} compatibilidades</span>
            </div>
            <div className="compact-list">
              {personCompatibilities.map((item) => (
                <div className="breach-item" key={`${item.funcion}-${item.persona}`}>
                  <strong>{item.funcion}</strong>
                  <p>{item.nombreFuncion}</p>
                  <span>ICPF {item.icpf}% - {item.interpretacion}</span>
                  <em>{item.recomendacion}</em>
                </div>
              ))}
              {personBreaches.map((item) => (
                <div className="breach-item" key={`brecha-${item.funcion}`}>
                  <strong>Brecha {item.funcion}</strong>
                  <p>{item.nombreFuncion}</p>
                  <em>{item.accion}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h2>Alertas y recomendaciones</h2>
              <span>{alerts.length} alertas</span>
            </div>
            <div className="compact-list">
              {alerts.map((alert) => (
                <div className="alert-item" key={alert.id}>
                  <RiskBadge level={alert.nivel} compact />
                  <div>
                    <strong>{alert.titulo}</strong>
                    <p>{alert.descripcion}</p>
                  </div>
                </div>
              ))}
              {recommendations.map((item) => (
                <div className="breach-item" key={item}>
                  <em>{item}</em>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </AppShell>
  );
}

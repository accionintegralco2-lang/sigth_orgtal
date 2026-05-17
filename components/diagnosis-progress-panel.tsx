import Link from "next/link";
import { buildDiagnosisProgress } from "@/lib/diagnosis-progress";
import type { Alert, Dependencia, Entrevista, Evidencia, Funcion, Persona } from "@/types";

type DiagnosisProgressPanelProps = {
  data: {
    dependencias: Dependencia[];
    personal: Persona[];
    funciones: Funcion[];
    entrevistas: Entrevista[];
    evidencias: Evidencia[];
    alertas: Alert[];
    workspaceMode: "piloto" | "propio";
  };
};

export function DiagnosisProgressPanel({ data }: DiagnosisProgressPanelProps) {
  const progress = buildDiagnosisProgress(data);
  const reportReady = progress.quality.criticalIssues === 0 && progress.overall >= 75;

  return (
    <section className="panel progress-panel">
      <div className="panel-heading">
        <h2>Estado de avance del diagnostico</h2>
        <span>{progress.completed}/{progress.total} etapas completas</span>
      </div>
      <div className="progress-overview">
        <div className="progress-main">
          <span>Avance general</span>
          <strong>{progress.overall}%</strong>
          <p>{reportReady ? "El diagnostico esta cerca de un informe presentable." : `Siguiente accion: ${progress.nextItem.label}.`}</p>
        </div>
        <div className={reportReady ? "progress-report ready" : "progress-report watch"}>
          <span>{reportReady ? "Listo para reporte" : "Requiere completar"}</span>
          <strong>{progress.quality.criticalIssues}</strong>
          <p>pendientes criticos</p>
        </div>
      </div>
      <div className="progress-grid">
        {progress.items.map((item) => (
          <Link className="progress-item" href={item.href} key={item.label}>
            <div className="progress-item-head">
              <span>{item.label}</span>
              <strong>{item.progress}%</strong>
            </div>
            <div className="bar-track">
              <div className={`bar-fill ${item.progress >= 85 ? "bajo" : item.progress >= 45 ? "moderado" : "alto"}`} style={{ width: `${Math.max(5, item.progress)}%` }} />
            </div>
            <p>{item.detail}</p>
            <b className={`progress-state ${item.state.toLowerCase().replace(" ", "-")}`}>{item.state}</b>
          </Link>
        ))}
      </div>
    </section>
  );
}

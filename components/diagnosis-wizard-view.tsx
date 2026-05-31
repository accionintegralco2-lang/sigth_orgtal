"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { buildDiagnosisProgress } from "@/lib/diagnosis-progress";

type WizardStep = {
  title: string;
  description: string;
  href: string;
  action: string;
  progress: number;
  state: "Completo" | "En avance" | "Pendiente";
  facts: string[];
};

export function DiagnosisWizardView() {
  const data = useOrgData();
  const progress = buildDiagnosisProgress(data);

  const steps: WizardStep[] = [
    {
      title: "1. Crear o confirmar dependencia",
      description: "Define el area evaluada, jefe responsable, mision, procesos y cantidad estimada de personas.",
      href: progress.items[0].href,
      action: data.workspaceMode === "piloto" ? "Iniciar dependencia nueva" : "Revisar dependencia",
      progress: progress.items[0].progress,
      state: progress.items[0].state,
      facts: [progress.items[0].detail, `Modo ${data.workspaceMode === "piloto" ? "piloto" : "diagnostico propio"}`]
    },
    {
      title: "2. Cargar personal",
      description: "Registra funcionarios, cargos, experiencia, competencias y carga laboral inicial.",
      href: progress.items[1].href,
      action: "Cargar o revisar personal",
      progress: progress.items[1].progress,
      state: progress.items[1].state,
      facts: [progress.items[1].detail, progress.items[2].detail]
    },
    {
      title: "3. Registrar funciones",
      description: "Carga funciones reales y asignadas, responsables, respaldos, frecuencia, horas e IPF.",
      href: progress.items[3].href,
      action: "Completar funciones",
      progress: progress.items[3].progress,
      state: progress.items[3].state,
      facts: [progress.items[3].detail, `${data.funciones.length} funciones registradas`]
    },
    {
      title: "4. Validar matriz y cargas",
      description: "Cruza funciones con personas, marca responsables, respaldos, duplicidades y revisa cargas.",
      href: "/matriz-funcion-persona",
      action: "Abrir matriz funcional",
      progress: progress.items[4].progress,
      state: progress.items[4].state,
      facts: [progress.items[4].detail, "Matriz editable por persona"]
    },
    {
      title: "5. Aplicar encuestas",
      description: "Recoge percepciones del personal y juicio de expertos desde el sistema o enlaces externos.",
      href: progress.items[5].href,
      action: "Gestionar encuestas",
      progress: progress.items[5].progress,
      state: progress.items[5].state,
      facts: [`${data.entrevistas.length} instrumentos`, progress.items[5].detail]
    },
    {
      title: "6. Adjuntar evidencias",
      description: "Registra manuales, organigramas, actas, entrevistas, anexos y soportes de validacion.",
      href: progress.items[6].href,
      action: "Registrar evidencias",
      progress: progress.items[6].progress,
      state: progress.items[6].state,
      facts: [`${data.evidencias.length} evidencias`, progress.items[6].detail]
    },
    {
      title: "7. Revisar calidad y generar informe",
      description: "Comprueba datos incompletos, alertas, trazabilidad y prepara el reporte formal.",
      href: progress.items[7].href,
      action: progress.quality.criticalIssues ? "Corregir calidad de datos" : "Generar reporte",
      progress: progress.items[7].progress,
      state: progress.items[7].state,
      facts: [`${progress.quality.score}% calidad de datos`, `${progress.quality.criticalIssues} pendientes criticos`]
    }
  ];

  const completed = progress.completed;
  const generalProgress = progress.overall;
  const nextStep = steps.find((step) => step.state !== "Completo") ?? steps[steps.length - 1];

  return (
    <AppShell>
      <main className="page-stack">
        <section className="wizard-hero">
          <div>
            <span>Asistente de diagnostico</span>
            <h1>Ruta guiada para cualquier dependencia</h1>
            <p>
              Sigue el orden recomendado para cargar datos, validar funciones,
              aplicar encuestas, adjuntar evidencias y generar el informe final.
            </p>
            <div className="wizard-actions">
              <Link className="primary-action" href={nextStep.href}>
                Continuar: {nextStep.action}
              </Link>
              <Link className="secondary-action" href="/calidad-datos">
                Ver calidad de datos
              </Link>
            </div>
          </div>
          <div className="wizard-score">
            <strong>{generalProgress}%</strong>
            <span>avance general</span>
          </div>
        </section>

        <section className="function-summary-grid">
          <article>
            <span>Pasos completos</span>
            <strong>{completed}/{steps.length}</strong>
            <p>Ruta operativa del diagnostico</p>
          </article>
          <article>
            <span>Siguiente accion</span>
            <strong>{nextStep.title.split(".")[0]}</strong>
            <p>{nextStep.action}</p>
          </article>
          <article>
            <span>Calidad de datos</span>
            <strong>{progress.quality.score}%</strong>
            <p>{progress.quality.totalIssues} observaciones detectadas</p>
          </article>
          <article>
            <span>Uso actual</span>
            <strong>{data.workspaceMode === "piloto" ? "Piloto" : "Propio"}</strong>
            <p>Diagnostico activo en la app</p>
          </article>
        </section>

        <section className="wizard-grid">
          {steps.map((step) => (
            <article className={`wizard-step ${step.state.toLowerCase().replace(" ", "-")}`} key={step.title}>
              <div className="wizard-step-head">
                <span>{step.state}</span>
                <strong>{step.progress}%</strong>
              </div>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
              <div className="bar-track">
                <div className={`bar-fill ${step.progress >= 85 ? "bajo" : step.progress >= 45 ? "moderado" : "alto"}`} style={{ width: `${Math.max(5, step.progress)}%` }} />
              </div>
              <div className="wizard-facts">
                {step.facts.map((fact) => (
                  <span key={fact}>{fact}</span>
                ))}
              </div>
              <Link className="secondary-action compact-action" href={step.href}>
                {step.action}
              </Link>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

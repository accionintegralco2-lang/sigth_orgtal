import { buildDataQualitySummary } from "@/lib/data-quality";
import type { Alert, Dependencia, Entrevista, Evidencia, Funcion, Persona } from "@/types";

type ProgressData = {
  dependencias: Dependencia[];
  personal: Persona[];
  funciones: Funcion[];
  entrevistas: Entrevista[];
  evidencias: Evidencia[];
  alertas: Alert[];
  workspaceMode: "piloto" | "propio";
};

export type DiagnosisProgressItem = {
  label: string;
  href: string;
  progress: number;
  state: "Completo" | "En avance" | "Pendiente";
  detail: string;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function stateFor(progress: number): DiagnosisProgressItem["state"] {
  if (progress >= 85) return "Completo";
  if (progress > 0) return "En avance";
  return "Pendiente";
}

export function buildDiagnosisProgress(data: ProgressData) {
  const quality = buildDataQualitySummary(data);
  const expectedPeople = data.dependencias.reduce((total, item) => total + (Number(item.personas) || 0), 0);
  const peopleGoal = Math.max(expectedPeople, data.personal.length, 1);
  const peopleWithProfile = data.personal.filter(
    (person) => person.cargo && person.formacion && person.competenciaTecnica && person.competenciaDigital
  ).length;
  const functionsWithResponsible = data.funciones.filter((funcion) => funcion.responsable).length;
  const functionsWithLoad = data.funciones.filter((funcion) => funcion.horasSemana && funcion.ipf).length;
  const answeredInstruments = data.entrevistas.filter((item) => item.respuestas > 0 || item.estado === "Cerrado").length;
  const validEvidence = data.evidencias.filter((item) => item.estado === "Validada" || item.estado === "Recibida").length;

  const items: DiagnosisProgressItem[] = [
    {
      label: "Datos basicos",
      href: data.workspaceMode === "piloto" ? "/configuracion" : "/dependencias",
      progress: clamp(data.dependencias.length ? 100 : 0),
      state: stateFor(clamp(data.dependencias.length ? 100 : 0)),
      detail: `${data.dependencias.length} dependencia(s) activa(s)`
    },
    {
      label: "Personal",
      href: "/personal",
      progress: clamp((data.personal.length / peopleGoal) * 100),
      state: stateFor(clamp((data.personal.length / peopleGoal) * 100)),
      detail: `${data.personal.length} de ${peopleGoal} personas cargadas`
    },
    {
      label: "Perfiles",
      href: "/personal",
      progress: clamp(data.personal.length ? (peopleWithProfile / data.personal.length) * 100 : 0),
      state: stateFor(clamp(data.personal.length ? (peopleWithProfile / data.personal.length) * 100 : 0)),
      detail: `${peopleWithProfile} fichas con perfil base`
    },
    {
      label: "Funciones",
      href: "/funciones",
      progress: clamp(data.funciones.length ? (functionsWithResponsible / data.funciones.length) * 100 : 0),
      state: stateFor(clamp(data.funciones.length ? (functionsWithResponsible / data.funciones.length) * 100 : 0)),
      detail: `${functionsWithResponsible} de ${data.funciones.length} con responsable`
    },
    {
      label: "Cargas",
      href: "/cargas-laborales",
      progress: clamp(data.funciones.length ? (functionsWithLoad / data.funciones.length) * 100 : 0),
      state: stateFor(clamp(data.funciones.length ? (functionsWithLoad / data.funciones.length) * 100 : 0)),
      detail: `${functionsWithLoad} funciones con carga/IPF`
    },
    {
      label: "Encuestas",
      href: "/entrevistas",
      progress: clamp(data.entrevistas.length ? (answeredInstruments / data.entrevistas.length) * 100 : 0),
      state: stateFor(clamp(data.entrevistas.length ? (answeredInstruments / data.entrevistas.length) * 100 : 0)),
      detail: `${answeredInstruments} de ${data.entrevistas.length} con respuesta o cierre`
    },
    {
      label: "Evidencias",
      href: "/evidencias",
      progress: clamp(data.evidencias.length ? (validEvidence / data.evidencias.length) * 100 : 0),
      state: stateFor(clamp(data.evidencias.length ? (validEvidence / data.evidencias.length) * 100 : 0)),
      detail: `${validEvidence} evidencias recibidas o validadas`
    },
    {
      label: "Listo para reporte",
      href: quality.criticalIssues ? "/calidad-datos" : "/reportes",
      progress: quality.score,
      state: stateFor(quality.score),
      detail: `${quality.criticalIssues} pendiente(s) critico(s)`
    }
  ];

  const overall = clamp(items.reduce((total, item) => total + item.progress, 0) / items.length);
  const completed = items.filter((item) => item.state === "Completo").length;
  const nextItem = items.find((item) => item.state !== "Completo") ?? items[items.length - 1];

  return {
    overall,
    completed,
    total: items.length,
    nextItem,
    items,
    quality
  };
}

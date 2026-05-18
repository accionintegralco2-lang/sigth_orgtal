import { getAlerts, getDashboardMetrics } from "@/lib/calculations";
import { prospectivas } from "@/data/mock-data";
import type { Alert, Dependencia, Funcion, Persona, RiskLevel } from "@/types";

type ReportData = {
  alertas?: Alert[];
  dependencias: Dependencia[];
  personal: Persona[];
  funciones: Funcion[];
};

export type ImprovementAction = {
  id: string;
  prioridad: RiskLevel;
  hallazgo: string;
  accion: string;
  responsable: string;
  plazo: string;
};

const priorityOrder: Record<RiskLevel, number> = {
  critico: 1,
  alto: 2,
  moderado: 3,
  bajo: 4
};

function actionForAlert(alert: Alert): string {
  if (alert.titulo.includes("Sobrecarga")) {
    return "Revisar distribucion de funciones, priorizar actividades criticas y reasignar tareas repetitivas.";
  }
  if (alert.titulo.includes("sin responsable")) {
    return "Asignar responsable formal, documentar alcance y actualizar matriz de funciones.";
  }
  if (alert.titulo.includes("Duplicidad")) {
    return "Depurar responsables, eliminar cruces funcionales y dejar una unica linea de rendicion.";
  }
  if (alert.titulo.includes("Brecha")) {
    return "Definir capacitacion o redistribucion funcional segun el nivel de alineacion del perfil.";
  }
  return "Analizar causa, definir responsable y registrar evidencia de cierre.";
}

function ownerForAlert(alert: Alert): string {
  if (alert.origen === "Modulo de funciones") return "Jefe de dependencia";
  if (alert.origen === "Perfiles y competencias") return "Talento humano";
  return alert.origen;
}

export function buildImprovementPlan(data: ReportData): ImprovementAction[] {
  return getAlerts(data)
    .sort((a, b) => priorityOrder[a.nivel] - priorityOrder[b.nivel])
    .map((alert, index) => ({
      id: `plan-${index}-${alert.id}`,
      prioridad: alert.nivel,
      hallazgo: `${alert.titulo}. ${alert.descripcion}`,
      accion: actionForAlert(alert),
      responsable: ownerForAlert(alert),
      plazo: alert.nivel === "critico" ? "Inmediato" : alert.nivel === "alto" ? "30 dias" : "60 dias"
    }));
}

export function buildExecutiveFindings(data: ReportData): string[] {
  const metrics = getDashboardMetrics(data);
  const alerts = getAlerts(data);
  const unassignedFunctions = data.funciones.filter((item) => !item.responsable).length;
  const overloadedPeople = data.personal.filter((item) => item.cargaLaboral >= 71).length;
  const duplicatedFunctions = data.funciones.filter((item) => item.tipo === "Duplicada").length;
  const criticalProspectiveGaps = prospectivas.filter((item) => item.nivelBrecha === "Critica").length;

  return [
    `El riesgo general del diagnostico se clasifica como ${metrics.riesgoGeneral}.`,
    `Se evaluan ${data.dependencias.length} dependencias y ${data.personal.length} integrantes registrados.`,
    `El indice promedio de carga laboral es ${metrics.cards.find((card) => card.label === "ICLO promedio")?.value ?? "0%"}.`,
    `Hay ${alerts.length} alertas activas, de las cuales ${alerts.filter((alert) => alert.nivel === "critico").length} son criticas.`,
    `${overloadedPeople} personas registran carga laboral alta o critica.`,
    `${unassignedFunctions} funciones no tienen responsable asignado y ${duplicatedFunctions} aparecen como duplicadas.`,
    `La hoja prospectiva registra ${criticalProspectiveGaps} brecha futura critica y ${prospectivas.length} tendencias de seguimiento.`
  ];
}

export function buildReportDate(date = new Date()) {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

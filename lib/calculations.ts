import {
  alertasPiloto,
  dependencias as seedDependencias,
  funciones as seedFunciones,
  personal as seedPersonal,
  perfiles
} from "@/data/mock-data";
import type { Alert, Dependencia, Funcion, Persona, RiskLevel } from "@/types";

export function classifyWorkload(score: number): RiskLevel {
  if (score >= 86) return "critico";
  if (score >= 71) return "alto";
  if (score >= 41) return "moderado";
  return "bajo";
}

export function getAlerts(data?: {
  alertas?: Alert[];
  personal?: Persona[];
  funciones?: Funcion[];
}): Alert[] {
  if (data?.alertas?.length) {
    return data.alertas;
  }
  if (!data) {
    return alertasPiloto;
  }
  const people = data?.personal ?? seedPersonal;
  const functions = data?.funciones ?? seedFunciones;
  const workloadAlerts = people
    .filter((persona) => persona.cargaLaboral >= 71)
    .map((persona) => ({
      id: `carga-${persona.id}`,
      titulo: `Sobrecarga laboral: ${persona.nombre}`,
      descripcion: `${persona.cargo} registra un ICLO de ${persona.cargaLaboral}%.`,
      nivel: classifyWorkload(persona.cargaLaboral),
      origen: persona.dependencia
    }));

  const functionAlerts = functions
    .filter((funcion) => !funcion.responsable || funcion.tipo === "Duplicada")
    .map((funcion) => ({
      id: `funcion-${funcion.id}`,
      titulo: !funcion.responsable ? "Funcion critica sin responsable" : "Duplicidad funcional detectada",
      descripcion: funcion.nombre,
      nivel: funcion.riesgo,
      origen: "Modulo de funciones"
    }));

  const profileAlerts = perfiles
    .filter((perfil) => perfil.alineacion !== "Alta")
    .map((perfil, index) => ({
      id: `perfil-${index}`,
      titulo: `Brecha de perfil: ${perfil.cargo}`,
      descripcion: `${perfil.brecha}. Accion sugerida: ${perfil.accion}.`,
      nivel: "moderado" as RiskLevel,
      origen: "Perfiles y competencias"
    }));

  return [...workloadAlerts, ...functionAlerts, ...profileAlerts];
}

export function getDashboardMetrics(data?: {
  alertas?: Alert[];
  dependencias?: Dependencia[];
  personal?: Persona[];
  funciones?: Funcion[];
}): {
  riesgoGeneral: RiskLevel;
  cards: Array<{ label: string; value: string; detail: string }>;
  riesgosPorDependencia: Array<{ nombre: string; valor: number; estado: RiskLevel }>;
} {
  const deps = data?.dependencias ?? seedDependencias;
  const people = data?.personal ?? seedPersonal;
  const alerts = getAlerts({ alertas: data?.alertas, personal: people, funciones: data?.funciones });
  const criticalAlerts = alerts.filter((alert) => alert.nivel === "critico").length;
  const averageWorkload = people.length
    ? Math.round(people.reduce((total, item) => total + item.cargaLaboral, 0) / people.length)
    : 0;

  return {
    riesgoGeneral: criticalAlerts > 1 ? "critico" : averageWorkload >= 71 ? "alto" : "moderado",
    cards: [
      {
        label: "Personal registrado",
        value: people.length.toString(),
        detail: "Funcionarios en evaluacion"
      },
      {
        label: "Dependencias",
        value: deps.length.toString(),
        detail: "Areas caracterizadas"
      },
      {
        label: "ICLO promedio",
        value: `${averageWorkload}%`,
        detail: "Indice de carga laboral"
      },
      {
        label: "Alertas activas",
        value: alerts.length.toString(),
        detail: `${criticalAlerts} criticas`
      }
    ],
    riesgosPorDependencia: deps.map((dependencia) => {
      const peopleByDep = people.filter((persona) => persona.dependencia === dependencia.nombre);
      const score = peopleByDep.length
        ? Math.round(peopleByDep.reduce((total, item) => total + item.cargaLaboral, 0) / peopleByDep.length)
        : 0;
      return {
        nombre: dependencia.nombre,
        valor: score,
        estado: classifyWorkload(score)
      };
    })
  };
}

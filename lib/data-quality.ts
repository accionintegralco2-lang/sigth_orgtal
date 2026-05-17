import type { Alert, Dependencia, Entrevista, Evidencia, Funcion, Persona } from "@/types";

export type DataQualitySeverity = "critico" | "alto" | "moderado" | "bajo";

export type DataQualityIssue = {
  id: string;
  modulo: string;
  registro: string;
  campo: string;
  severidad: DataQualitySeverity;
  descripcion: string;
  accion: string;
  actionLabel: string;
  href: string;
};

export type DataQualitySummary = {
  score: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  byModule: Array<{ modulo: string; total: number; abiertos: number }>;
  issues: DataQualityIssue[];
};

type QualityData = {
  dependencias: Dependencia[];
  personal: Persona[];
  funciones: Funcion[];
  entrevistas: Entrevista[];
  evidencias: Evidencia[];
  alertas: Alert[];
};

function isEmpty(value: unknown) {
  if (Array.isArray(value)) return value.length === 0;
  return value === undefined || value === null || String(value).trim() === "";
}

function addIssue(
  issues: DataQualityIssue[],
  issue: Omit<DataQualityIssue, "id" | "actionLabel" | "href"> &
    Partial<Pick<DataQualityIssue, "actionLabel" | "href">>
) {
  const directAction = getDirectAction(issue.modulo, issue.campo);

  issues.push({
    ...issue,
    actionLabel: issue.actionLabel || directAction.actionLabel,
    href: issue.href || directAction.href,
    id: `${issue.modulo}-${issue.registro}-${issue.campo}-${issues.length}`
  });
}

function getDirectAction(modulo: string, campo: string) {
  if (modulo === "Personal") {
    if (campo === "Cargo") return { actionLabel: "Completar cargo", href: "/personal" };
    if (campo === "Dependencia") return { actionLabel: "Corregir dependencia", href: "/personal" };
    return { actionLabel: "Completar ficha", href: "/personal" };
  }

  if (modulo === "Funciones") {
    if (campo === "Responsable" || campo === "Respaldo") {
      return { actionLabel: "Asignar responsable", href: "/matriz-funcion-persona" };
    }
    if (campo === "Carga/IPF") return { actionLabel: "Completar carga", href: "/funciones" };
    return { actionLabel: "Corregir funcion", href: "/funciones" };
  }

  if (modulo === "Evidencias") {
    return { actionLabel: "Agregar evidencia", href: "/evidencias" };
  }

  if (modulo === "Alertas") {
    return { actionLabel: "Cerrar alerta", href: "/alertas" };
  }

  if (modulo === "Entrevistas") {
    return { actionLabel: "Aplicar encuesta", href: "/entrevistas" };
  }

  if (modulo === "Dependencias") {
    return { actionLabel: "Completar dependencia", href: "/dependencias" };
  }

  return { actionLabel: "Corregir ahora", href: "/calidad-datos" };
}

function severityWeight(severity: DataQualitySeverity) {
  if (severity === "critico") return 12;
  if (severity === "alto") return 8;
  if (severity === "moderado") return 5;
  return 2;
}

export function buildDataQualitySummary(data: QualityData): DataQualitySummary {
  const issues: DataQualityIssue[] = [];
  const personCodes = new Set(data.personal.map((person) => person.codigo || person.id));
  const dependencyNames = new Set(data.dependencias.map((dep) => dep.nombre));

  data.dependencias.forEach((dep) => {
    if (isEmpty(dep.nombre)) {
      addIssue(issues, {
        modulo: "Dependencias",
        registro: dep.id,
        campo: "Nombre",
        severidad: "critico",
        descripcion: "La dependencia no tiene nombre registrado.",
        accion: "Registrar el nombre oficial de la dependencia."
      });
    }
    if (isEmpty(dep.jefe) || dep.jefe === "Pendiente") {
      addIssue(issues, {
        modulo: "Dependencias",
        registro: dep.nombre || dep.id,
        campo: "Jefe responsable",
        severidad: "alto",
        descripcion: "No hay jefe responsable claramente asignado.",
        accion: "Asignar el responsable que valida la informacion del area."
      });
    }
    if (isEmpty(dep.mision) || dep.mision === "Pendiente por documentar") {
      addIssue(issues, {
        modulo: "Dependencias",
        registro: dep.nombre || dep.id,
        campo: "Mision",
        severidad: "moderado",
        descripcion: "La mision institucional de la dependencia esta pendiente.",
        accion: "Documentar la mision para conectar funciones con procesos."
      });
    }
    if (dep.personas !== data.personal.filter((person) => person.dependencia === dep.nombre).length) {
      addIssue(issues, {
        modulo: "Dependencias",
        registro: dep.nombre || dep.id,
        campo: "Numero de personas",
        severidad: "bajo",
        descripcion: "El total estimado no coincide con los integrantes cargados.",
        accion: "Ajustar el numero estimado o completar el cargue de personal."
      });
    }
  });

  data.personal.forEach((person) => {
    if (isEmpty(person.nombre) || person.nombre === "Sin nombre") {
      addIssue(issues, {
        modulo: "Personal",
        registro: person.codigo || person.id,
        campo: "Nombre",
        severidad: "critico",
        descripcion: "Hay un funcionario sin nombre completo.",
        accion: "Registrar nombre y apellidos para poder emitir ficha individual."
      });
    }
    if (isEmpty(person.cargo) || person.cargo === "Sin cargo") {
      addIssue(issues, {
        modulo: "Personal",
        registro: person.nombre || person.codigo || person.id,
        campo: "Cargo",
        severidad: "alto",
        descripcion: "El funcionario no tiene cargo documentado.",
        accion: "Registrar cargo actual y validar contra manual de funciones."
      });
    }
    if (!dependencyNames.has(person.dependencia)) {
      addIssue(issues, {
        modulo: "Personal",
        registro: person.nombre || person.codigo || person.id,
        campo: "Dependencia",
        severidad: "alto",
        descripcion: "La dependencia del funcionario no existe en el modulo de dependencias.",
        accion: "Crear la dependencia o corregir el nombre usado en personal."
      });
    }
    if (isEmpty(person.formacion)) {
      addIssue(issues, {
        modulo: "Personal",
        registro: person.nombre || person.codigo || person.id,
        campo: "Formacion",
        severidad: "moderado",
        descripcion: "No se registro formacion academica.",
        accion: "Completar formacion para calcular mejor brechas de perfil."
      });
    }
    if (!person.competenciaTecnica || !person.competenciaDigital || !person.competenciaComportamental) {
      addIssue(issues, {
        modulo: "Personal",
        registro: person.nombre || person.codigo || person.id,
        campo: "Competencias",
        severidad: "moderado",
        descripcion: "Faltan puntajes de competencia tecnica, digital o comportamental.",
        accion: "Registrar competencias en escala 1 a 5 para habilitar analisis por perfil."
      });
    }
  });

  data.funciones.forEach((funcion) => {
    if (isEmpty(funcion.nombre)) {
      addIssue(issues, {
        modulo: "Funciones",
        registro: funcion.codigo || funcion.id,
        campo: "Nombre",
        severidad: "critico",
        descripcion: "Hay una funcion sin descripcion.",
        accion: "Registrar la funcion real o asignada antes de reportarla."
      });
    }
    if (isEmpty(funcion.responsable)) {
      addIssue(issues, {
        modulo: "Funciones",
        registro: funcion.nombre || funcion.codigo || funcion.id,
        campo: "Responsable",
        severidad: "critico",
        descripcion: "La funcion no tiene responsable principal.",
        accion: "Asignar responsable o marcarla como vacante funcional."
      });
    } else if (!personCodes.has(funcion.responsable)) {
      addIssue(issues, {
        modulo: "Funciones",
        registro: funcion.nombre || funcion.codigo || funcion.id,
        campo: "Responsable",
        severidad: "alto",
        descripcion: "El responsable no coincide con ningun codigo de personal cargado.",
        accion: "Corregir el codigo del responsable o cargar el funcionario faltante."
      });
    }
    if (funcion.respaldo && !personCodes.has(funcion.respaldo)) {
      addIssue(issues, {
        modulo: "Funciones",
        registro: funcion.nombre || funcion.codigo || funcion.id,
        campo: "Respaldo",
        severidad: "moderado",
        descripcion: "El respaldo asignado no coincide con personal cargado.",
        accion: "Corregir el codigo del respaldo o retirarlo si no aplica."
      });
    }
    if (!funcion.horasSemana || !funcion.ipf) {
      addIssue(issues, {
        modulo: "Funciones",
        registro: funcion.nombre || funcion.codigo || funcion.id,
        campo: "Carga/IPF",
        severidad: "moderado",
        descripcion: "Faltan horas semanales o indice de peso funcional.",
        accion: "Completar variables de carga para fortalecer el diagnostico."
      });
    }
  });

  data.alertas.forEach((alerta) => {
    if (alerta.nivel === "critico" && alerta.estadoSeguimiento !== "Cerrada") {
      addIssue(issues, {
        modulo: "Alertas",
        registro: alerta.titulo,
        campo: "Trazabilidad",
        severidad: "alto",
        descripcion: "Existe una alerta critica sin cierre registrado.",
        accion: "Asignar responsable, evidencia y accion tomada desde el modulo de alertas."
      });
    }
  });

  if (data.entrevistas.length === 0) {
    addIssue(issues, {
      modulo: "Entrevistas",
      registro: "Instrumentos",
      campo: "Respuestas",
      severidad: "moderado",
      descripcion: "No hay instrumentos de entrevista o encuesta cargados.",
      accion: "Crear instrumentos o aplicar los enlaces externos de encuesta."
    });
  }

  if (data.evidencias.length === 0) {
    addIssue(issues, {
      modulo: "Evidencias",
      registro: "Soportes",
      campo: "Documentos",
      severidad: "moderado",
      descripcion: "No hay evidencias documentales asociadas al diagnostico.",
      accion: "Subir o registrar manuales, organigramas, actas, entrevistas o anexos."
    });
  }

  const penalty = issues.reduce((total, issue) => total + severityWeight(issue.severidad), 0);
  const score = Math.max(0, Math.min(100, 100 - penalty));
  const modules = ["Dependencias", "Personal", "Funciones", "Alertas", "Entrevistas", "Evidencias"];
  const byModule = modules.map((modulo) => {
    const moduleIssues = issues.filter((issue) => issue.modulo === modulo);
    return { modulo, total: moduleIssues.length, abiertos: moduleIssues.length };
  });

  return {
    score,
    totalIssues: issues.length,
    criticalIssues: issues.filter((issue) => issue.severidad === "critico").length,
    highIssues: issues.filter((issue) => issue.severidad === "alto").length,
    byModule,
    issues
  };
}

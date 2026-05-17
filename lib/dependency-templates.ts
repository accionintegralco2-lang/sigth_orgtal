export type DependencyTemplate = {
  id: string;
  label: string;
  suggestedName: string;
  personas: number;
  criticidad: string;
  estado: string;
  procesos: string[];
  mision: string;
  funcionesSugeridas: string[];
  evidenciasSugeridas: string[];
};

export const dependencyTemplates: DependencyTemplate[] = [
  {
    id: "administrativa",
    label: "Administrativa",
    suggestedName: "Dependencia administrativa",
    personas: 6,
    criticidad: "Media",
    estado: "Seguimiento",
    procesos: ["Gestion documental", "Atencion al usuario", "Soporte administrativo", "Archivo"],
    mision:
      "Apoyar la gestion administrativa mediante control documental, atencion interna y seguimiento a procesos.",
    funcionesSugeridas: [
      "Gestionar documentacion del proceso",
      "Atender requerimientos internos",
      "Consolidar reportes periodicos"
    ],
    evidenciasSugeridas: ["Manual de funciones", "Actas", "Matriz de seguimiento"]
  },
  {
    id: "academica",
    label: "Academica",
    suggestedName: "Dependencia academica",
    personas: 8,
    criticidad: "Alta",
    estado: "Seguimiento",
    procesos: ["Planeacion academica", "Seguimiento curricular", "Evaluacion", "Gestion de docentes"],
    mision:
      "Coordinar procesos academicos, curriculares y de seguimiento formativo segun lineamientos institucionales.",
    funcionesSugeridas: [
      "Programar actividades academicas",
      "Hacer seguimiento a planes curriculares",
      "Consolidar informes academicos"
    ],
    evidenciasSugeridas: ["Plan academico", "Informes de seguimiento", "Actas de comite"]
  },
  {
    id: "logistica",
    label: "Logistica",
    suggestedName: "Dependencia logistica",
    personas: 7,
    criticidad: "Alta",
    estado: "Seguimiento",
    procesos: ["Inventarios", "Suministros", "Mantenimiento", "Apoyo operativo"],
    mision:
      "Garantizar soporte logistico y operativo para la continuidad de los procesos de la dependencia.",
    funcionesSugeridas: [
      "Controlar inventarios y suministros",
      "Coordinar apoyos logisticos",
      "Registrar novedades de mantenimiento"
    ],
    evidenciasSugeridas: ["Inventarios", "Solicitudes de suministro", "Actas de entrega"]
  },
  {
    id: "talento-humano",
    label: "Talento humano",
    suggestedName: "Dependencia de talento humano",
    personas: 5,
    criticidad: "Alta",
    estado: "Seguimiento",
    procesos: ["Bienestar", "Vinculacion", "Competencias", "Evaluacion", "Capacitacion"],
    mision:
      "Gestionar informacion, perfiles, competencias y acciones asociadas al talento humano de la dependencia.",
    funcionesSugeridas: [
      "Actualizar informacion de personal",
      "Gestionar necesidades de capacitacion",
      "Consolidar seguimiento de competencias"
    ],
    evidenciasSugeridas: ["Perfiles de cargo", "Plan de capacitacion", "Registros de evaluacion"]
  },
  {
    id: "direccion",
    label: "Direccion",
    suggestedName: "Direccion o jefatura",
    personas: 4,
    criticidad: "Critica",
    estado: "Seguimiento",
    procesos: ["Direccion estrategica", "Toma de decisiones", "Coordinacion institucional", "Seguimiento"],
    mision:
      "Orientar, coordinar y controlar la ejecucion de los procesos institucionales bajo su responsabilidad.",
    funcionesSugeridas: [
      "Definir prioridades de gestion",
      "Validar reportes institucionales",
      "Hacer seguimiento a planes de accion"
    ],
    evidenciasSugeridas: ["Plan de accion", "Actas directivas", "Informes ejecutivos"]
  },
  {
    id: "bienestar",
    label: "Bienestar",
    suggestedName: "Dependencia de bienestar",
    personas: 5,
    criticidad: "Media",
    estado: "Seguimiento",
    procesos: ["Bienestar institucional", "Acompanamiento", "Actividades de integracion", "Seguimiento social"],
    mision:
      "Promover acciones de bienestar, acompanamiento y fortalecimiento del clima organizacional.",
    funcionesSugeridas: [
      "Programar actividades de bienestar",
      "Registrar seguimiento a beneficiarios",
      "Consolidar reportes de participacion"
    ],
    evidenciasSugeridas: ["Plan de bienestar", "Listados de asistencia", "Informes de actividades"]
  },
  {
    id: "investigacion",
    label: "Investigacion",
    suggestedName: "Dependencia de investigacion",
    personas: 6,
    criticidad: "Alta",
    estado: "Seguimiento",
    procesos: ["Gestion de proyectos", "Produccion academica", "Semilleros", "Transferencia de conocimiento"],
    mision:
      "Coordinar proyectos, productos y procesos de investigacion conforme a lineas institucionales.",
    funcionesSugeridas: [
      "Registrar proyectos de investigacion",
      "Hacer seguimiento a productos academicos",
      "Gestionar evidencias de transferencia"
    ],
    evidenciasSugeridas: ["Proyectos", "Productos academicos", "Actas de investigacion"]
  },
  {
    id: "control",
    label: "Control y seguimiento",
    suggestedName: "Dependencia de control y seguimiento",
    personas: 4,
    criticidad: "Alta",
    estado: "Seguimiento",
    procesos: ["Auditoria", "Seguimiento documental", "Control de riesgos", "Planes de mejora"],
    mision:
      "Verificar trazabilidad, cumplimiento documental, riesgos y acciones de mejora de la dependencia.",
    funcionesSugeridas: [
      "Revisar evidencias documentales",
      "Hacer seguimiento a alertas",
      "Consolidar planes de mejora"
    ],
    evidenciasSugeridas: ["Listas de chequeo", "Planes de mejora", "Informes de auditoria"]
  }
];

export function templateToForm(template: DependencyTemplate) {
  return {
    nombre: template.suggestedName,
    jefe: "",
    mision: template.mision,
    procesos: template.procesos.join(", "),
    personas: template.personas,
    criticidad: template.criticidad,
    estado: template.estado
  };
}

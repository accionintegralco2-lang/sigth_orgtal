export type MainModule = {
  title: string;
  href: string;
  description: string;
  tag: string;
  scope: string;
  relatedRoutes: string[];
};

export const routeLabels: Record<string, string> = {
  "/": "Inicio",
  "/alertas": "Alertas",
  "/asistente-diagnostico": "Asistente",
  "/calidad-datos": "Calidad de datos",
  "/cargas-laborales": "Cargas laborales",
  "/configuracion": "Configuracion",
  "/dashboard": "Dashboard",
  "/dependencias": "Dependencias",
  "/entrevistas": "Entrevistas",
  "/evidencias": "Evidencias",
  "/funciones": "Funciones",
  "/juicio-expertos": "Juicio expertos",
  "/matriz-funcion-persona": "Matriz",
  "/organizacion-requerida": "Organizacion requerida",
  "/perfiles": "Perfiles y brechas",
  "/personal": "Personal",
  "/prospectiva": "Prospectiva",
  "/reportes": "Reportes",
  "/roles": "Roles",
  "/sustentacion": "Sustentacion",
  "/validacion": "Validacion"
};

export const mainModules: MainModule[] = [
  {
    title: "Dashboard ejecutivo",
    href: "/dashboard",
    description: "Estado general, riesgos, avance y prioridades directivas.",
    tag: "Direccion",
    scope: "Incluye sustentacion, reportes ejecutivos, graficos y avance general.",
    relatedRoutes: ["/dashboard", "/sustentacion", "/reportes"]
  },
  {
    title: "Modulo misional",
    href: "/dependencias",
    description: "Dependencias, mision, procesos y estructura evaluada.",
    tag: "Estructura",
    scope: "Incluye dependencias, procesos, datos base y resumen por dependencia.",
    relatedRoutes: ["/dependencias"]
  },
  {
    title: "Modulo funcional",
    href: "/funciones",
    description: "Funciones reales, asignadas, criticas, duplicadas o sin responsable.",
    tag: "Funciones",
    scope: "Incluye funciones, cargas laborales, entrevistas y cuestionarios internos.",
    relatedRoutes: ["/funciones", "/cargas-laborales", "/entrevistas"]
  },
  {
    title: "Organizacion requerida",
    href: "/organizacion-requerida",
    description: "Nueva dependencia, personal esperado y configuracion inicial.",
    tag: "Planeacion",
    scope: "Incluye plantillas por dependencia, parametros iniciales y carga guiada.",
    relatedRoutes: ["/organizacion-requerida", "/configuracion", "/calidad-datos"]
  },
  {
    title: "Talento disponible",
    href: "/personal",
    description: "Personal, cargos, experiencia, competencias y carga laboral.",
    tag: "Talento",
    scope: "Incluye ficha por persona, competencias, perfiles y datos del personal.",
    relatedRoutes: ["/personal", "/perfiles"]
  },
  {
    title: "Matriz persona-funcion",
    href: "/matriz-funcion-persona",
    description: "Responsables, respaldos, duplicidades y vacios funcionales.",
    tag: "Matriz",
    scope: "Incluye mapa de responsables, respaldos, duplicidades y sin asignacion.",
    relatedRoutes: ["/matriz-funcion-persona"]
  },
  {
    title: "Brechas",
    href: "/perfiles",
    description: "Comparacion entre perfil requerido, talento disponible y acciones.",
    tag: "Analisis",
    scope: "Incluye brechas de perfil, competencias, recomendaciones y acciones.",
    relatedRoutes: ["/perfiles", "/validacion", "/juicio-expertos"]
  },
  {
    title: "Alertas",
    href: "/alertas",
    description: "Riesgos, trazabilidad, responsables y acciones de cierre.",
    tag: "Control",
    scope: "Incluye alertas, trazabilidad, estados, evidencias y acciones tomadas.",
    relatedRoutes: ["/alertas", "/evidencias"]
  },
  {
    title: "Prospectiva",
    href: "/prospectiva",
    description: "Funciones futuras, competencias emergentes y riesgos proyectados.",
    tag: "Futuro",
    scope: "Incluye escenarios futuros, competencias emergentes y riesgos proyectados.",
    relatedRoutes: ["/prospectiva"]
  },
  {
    title: "Guia de uso",
    href: "/asistente-diagnostico",
    description: "Ruta guiada para cargar datos y completar el diagnostico.",
    tag: "Ayuda",
    scope: "Incluye asistente, ruta de trabajo, modo usuario simple y orientacion.",
    relatedRoutes: ["/asistente-diagnostico", "/roles"]
  },
  {
    title: "Configuracion",
    href: "/configuracion",
    description: "Supabase, respaldos, carga masiva, instalacion y datos piloto.",
    tag: "Sistema",
    scope: "Incluye Supabase, datos piloto, respaldo, instalacion y pruebas tecnicas.",
    relatedRoutes: ["/configuracion", "/calidad-datos"]
  }
];

export function getModuleForPath(pathname: string) {
  return mainModules.find((module) =>
    module.relatedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  );
}

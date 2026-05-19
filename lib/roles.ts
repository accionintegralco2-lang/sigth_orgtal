import type { UserRole } from "@/types";
import { mainModules } from "@/lib/module-menu";

export const userRoles: UserRole[] = [
  "Administrador",
  "Director",
  "Jefe de dependencia",
  "Analista TH",
  "Experto validador",
  "Personal"
];

export type NavItem = {
  label: string;
  href: string;
};

export const allNavItems: NavItem[] = [
  { label: "Inicio", href: "/" },
  ...mainModules.map((module) => ({ label: module.title, href: module.href }))
];

const navByHref = new Map(allNavItems.map((item) => [item.href, item]));

export const roleNavigation: Record<UserRole, string[]> = {
  Administrador: allNavItems.map((item) => item.href),
  Director: ["/", "/dashboard", "/dependencias", "/matriz-funcion-persona", "/perfiles", "/alertas", "/prospectiva"],
  "Jefe de dependencia": ["/", "/dependencias", "/funciones", "/personal", "/matriz-funcion-persona", "/alertas", "/asistente-diagnostico"],
  "Analista TH": ["/", "/configuracion", "/dependencias", "/personal", "/funciones", "/perfiles", "/alertas", "/asistente-diagnostico"],
  "Experto validador": ["/", "/entrevistas", "/perfiles", "/asistente-diagnostico"],
  Personal: ["/", "/entrevistas", "/asistente-diagnostico", "/personal", "/matriz-funcion-persona"]
};

export function getNavigationForRole(role: UserRole) {
  return roleNavigation[role].map((href) => navByHref.get(href)).filter(Boolean) as NavItem[];
}

export const rolePermissions: Record<UserRole, string[]> = {
  Administrador: [
    "Configurar diagnosticos",
    "Gestionar dependencias, personal y funciones",
    "Consultar alertas, evidencias y reportes",
    "Restaurar datos piloto"
  ],
  Director: [
    "Consultar dashboard ejecutivo",
    "Revisar matriz funcion-persona",
    "Aprobar reportes",
    "Ver alertas criticas"
  ],
  "Jefe de dependencia": [
    "Actualizar datos de su dependencia",
    "Validar funciones reales",
    "Registrar evidencias",
    "Dar seguimiento a alertas asignadas"
  ],
  "Analista TH": [
    "Cargar personal y funciones",
    "Evaluar cargas laborales",
    "Gestionar encuestas",
    "Construir plan de mejora"
  ],
  "Experto validador": [
    "Diligenciar encuestas de expertos",
    "Revisar juicio de expertos",
    "Consultar evidencias de validacion",
    "Emitir recomendaciones"
  ],
  Personal: [
    "Diligenciar encuesta funcional",
    "Validar funciones asignadas y reales",
    "Consultar matriz de asignacion",
    "Reportar inconsistencias al jefe o analista"
  ]
};

export const roleHome: Record<UserRole, string> = {
  Administrador: "/configuracion",
  Director: "/dashboard",
  "Jefe de dependencia": "/dependencias",
  "Analista TH": "/personal",
  "Experto validador": "/entrevistas",
  Personal: "/entrevistas"
};

export const roleMission: Record<UserRole, string> = {
  Administrador: "Configura el diagnostico, administra datos y prepara la operacion general del sistema.",
  Director: "Consulta el estado institucional, revisa riesgos y toma decisiones con reportes ejecutivos.",
  "Jefe de dependencia": "Valida funciones reales, soportes, responsables y alertas de su dependencia.",
  "Analista TH": "Carga personal, funciones, evidencias y corrige datos criticos del diagnostico.",
  "Experto validador": "Diligencia rubricas, revisa criterios y aporta validacion metodologica.",
  Personal: "Diligencia su encuesta funcional y valida informacion de funciones asignadas o reales."
};

export const roleWorkflow: Record<UserRole, string[]> = {
  Administrador: ["Crear diagnostico", "Cargar datos", "Revisar calidad", "Publicar reporte"],
  Director: ["Ver dashboard", "Revisar alertas", "Analizar matriz", "Aprobar reporte"],
  "Jefe de dependencia": ["Revisar dependencia", "Validar funciones", "Agregar evidencias", "Cerrar alertas"],
  "Analista TH": ["Cargar personal", "Cargar funciones", "Revisar cargas", "Corregir datos"],
  "Experto validador": ["Abrir rubrica", "Valorar criterios", "Revisar juicio", "Emitir recomendacion"],
  Personal: ["Abrir encuesta", "Identificarse", "Responder escala", "Enviar validacion"]
};

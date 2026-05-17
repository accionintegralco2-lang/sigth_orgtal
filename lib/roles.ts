import type { UserRole } from "@/types";

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
  { label: "Asistente", href: "/asistente-diagnostico" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Dependencias", href: "/dependencias" },
  { label: "Personal", href: "/personal" },
  { label: "Funciones", href: "/funciones" },
  { label: "Matriz", href: "/matriz-funcion-persona" },
  { label: "Cargas", href: "/cargas-laborales" },
  { label: "Perfiles", href: "/perfiles" },
  { label: "Entrevistas", href: "/entrevistas" },
  { label: "Encuesta personal", href: "/encuesta/personal" },
  { label: "Rubrica expertos", href: "/encuesta/expertos" },
  { label: "Prospectiva", href: "/prospectiva" },
  { label: "Validacion", href: "/validacion" },
  { label: "Expertos", href: "/juicio-expertos" },
  { label: "Alertas", href: "/alertas" },
  { label: "Evidencias", href: "/evidencias" },
  { label: "Calidad datos", href: "/calidad-datos" },
  { label: "Roles", href: "/roles" },
  { label: "Reportes", href: "/reportes" },
  { label: "Configuracion", href: "/configuracion" }
];

const navByHref = new Map(allNavItems.map((item) => [item.href, item]));

export const roleNavigation: Record<UserRole, string[]> = {
  Administrador: allNavItems.map((item) => item.href),
  Director: ["/dashboard", "/dependencias", "/matriz-funcion-persona", "/alertas", "/reportes"],
  "Jefe de dependencia": ["/dependencias", "/funciones", "/matriz-funcion-persona", "/evidencias", "/alertas", "/reportes"],
  "Analista TH": ["/configuracion", "/personal", "/funciones", "/cargas-laborales", "/alertas", "/calidad-datos", "/evidencias"],
  "Experto validador": ["/encuesta/expertos", "/juicio-expertos", "/validacion"],
  Personal: ["/encuesta/personal", "/matriz-funcion-persona"]
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
  "Experto validador": "/encuesta/expertos",
  Personal: "/encuesta/personal"
};

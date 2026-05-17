export type RiskLevel = "bajo" | "moderado" | "alto" | "critico";
export type UserRole =
  | "Administrador"
  | "Director"
  | "Jefe de dependencia"
  | "Analista TH"
  | "Experto validador"
  | "Personal";

export type Dependencia = {
  id: string;
  nombre: string;
  jefe: string;
  mision: string;
  procesos: string[];
  personas: number;
  criticidad: string;
  estado: string;
};

export type Persona = {
  id: string;
  codigo?: string;
  nombre: string;
  cargo: string;
  dependencia: string;
  formacion?: string;
  experiencia: string;
  competenciaTecnica?: number;
  competenciaDigital?: number;
  competenciaComportamental?: number;
  autonomia?: number;
  disponibilidad?: number;
  fortalezas?: string;
  tiempoCargo: string;
  funciones: number;
  complejidad: string;
  cargaLaboral: number;
};

export type Funcion = {
  id: string;
  codigo?: string;
  nombre: string;
  responsable: string;
  respaldo?: string;
  tipo: string;
  proceso?: string;
  producto?: string;
  frecuencia: string;
  criticidad?: number;
  frecuenciaValor?: number;
  complejidadValor?: number;
  horasSemana?: number;
  ipf?: number;
  nivelIpf?: string;
  estado?: string;
  observaciones?: string;
  rankingIpf?: number;
  riesgo: RiskLevel;
};

export type Perfil = {
  cargo: string;
  perfilEsperado: string;
  alineacion: string;
  brecha: string;
  accion: string;
};

export type Compatibilidad = {
  funcion: string;
  nombreFuncion: string;
  ipf: number;
  persona: string;
  icpf: number;
  interpretacion: string;
  recomendacion: string;
};

export type Brecha = {
  funcion: string;
  nombreFuncion: string;
  responsable: string;
  mejorPersona: string;
  mejorIcpf: number;
  nivelBrecha: string;
  accion: string;
};

export type Entrevista = {
  id: string;
  instrumento: string;
  dirigidoA: string;
  respuestas: number;
  estado: string;
  impacto: string;
  objetivo: string;
};

export type Evidencia = {
  id: string;
  nombre: string;
  tipo: string;
  dependencia: string;
  asociadoA: string;
  ubicacion: string;
  estado: "Pendiente" | "Recibida" | "Validada" | "Observada";
  fecha: string;
  observaciones: string;
};

export type Alert = {
  id: string;
  titulo: string;
  descripcion: string;
  nivel: RiskLevel;
  origen: string;
  codigo?: string;
  condicion?: string;
  semaforo?: string;
  accion?: string;
  trazabilidad?: string;
  estadoSeguimiento?: "Abierta" | "En revision" | "Cerrada";
  responsableSeguimiento?: string;
  fechaSeguimiento?: string;
  evidencia?: string;
  accionTomada?: string;
};

export type Reporte = {
  nombre: string;
  tipo: string;
  descripcion: string;
};

export type Prospectiva = {
  tendencia: string;
  impacto: string;
  funcionEmergente: string;
  competenciaFutura: string;
  nivelActual: number;
  nivelRequeridoFuturo: number;
  ibp: number;
  nivelBrecha: string;
  horizonte: string;
  accionSugerida: string;
};

export type ValidacionPiloto = {
  prueba: string;
  rango: string;
  resultadoCalculado: string;
  criterio: string;
  estado: string;
  observacion: string;
  tipo: string;
  resultado: string;
};

export type CriterioExperto = {
  criterio: string;
  definicion: string;
  pregunta: string;
  e1: number;
  e2: number;
  e3: number;
  e4: number;
  e5: number;
  promedio: number;
  cvr: number;
  interpretacion: string;
  accion: string;
};

export type DimensionExperta = {
  dimension: string;
  peso: number;
  promedio: number;
  cvr: number;
  ponderado: number;
  semaforo: string;
  interpretacion: string;
  validez: string;
};

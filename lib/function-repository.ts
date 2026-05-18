import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Funcion, RiskLevel } from "@/types";

type FunctionRow = {
  id?: string;
  client_id?: string | null;
  codigo: string | null;
  nombre: string;
  responsable: string | null;
  respaldo: string | null;
  tipo: string | null;
  proceso: string | null;
  producto: string | null;
  frecuencia: string | null;
  criticidad: number | null;
  frecuencia_valor: number | null;
  complejidad_valor: number | null;
  horas_semana: number | null;
  ipf: number | null;
  nivel_ipf: string | null;
  estado: string | null;
  observaciones: string | null;
  ranking_ipf: number | null;
  riesgo: string | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeRisk(value: string | null): RiskLevel {
  return ["bajo", "moderado", "alto", "critico"].includes(String(value).toLowerCase())
    ? (String(value).toLowerCase() as RiskLevel)
    : "moderado";
}

function toFuncion(row: FunctionRow): Funcion {
  return {
    id: row.client_id || row.id || crypto.randomUUID(),
    codigo: row.codigo || undefined,
    nombre: row.nombre,
    responsable: row.responsable || "",
    respaldo: row.respaldo || undefined,
    tipo: row.tipo || "Real y asignada",
    proceso: row.proceso || undefined,
    producto: row.producto || undefined,
    frecuencia: row.frecuencia || "Semanal",
    criticidad: row.criticidad || undefined,
    frecuenciaValor: row.frecuencia_valor || undefined,
    complejidadValor: row.complejidad_valor || undefined,
    horasSemana: row.horas_semana || undefined,
    ipf: row.ipf || undefined,
    nivelIpf: row.nivel_ipf || undefined,
    estado: row.estado || undefined,
    observaciones: row.observaciones || undefined,
    rankingIpf: row.ranking_ipf || undefined,
    riesgo: normalizeRisk(row.riesgo)
  };
}

function toRow(funcion: Funcion): FunctionRow {
  return {
    client_id: funcion.id,
    codigo: funcion.codigo || null,
    nombre: funcion.nombre,
    responsable: funcion.responsable || null,
    respaldo: funcion.respaldo || null,
    tipo: funcion.tipo,
    proceso: funcion.proceso || null,
    producto: funcion.producto || null,
    frecuencia: funcion.frecuencia,
    criticidad: funcion.criticidad || null,
    frecuencia_valor: funcion.frecuenciaValor || null,
    complejidad_valor: funcion.complejidadValor || null,
    horas_semana: funcion.horasSemana || null,
    ipf: funcion.ipf || null,
    nivel_ipf: funcion.nivelIpf || null,
    estado: funcion.estado || null,
    observaciones: funcion.observaciones || null,
    ranking_ipf: funcion.rankingIpf || null,
    riesgo: funcion.riesgo
  };
}

export async function fetchFunctionRecords() {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("funciones")
    .select("id, client_id, codigo, nombre, responsable, respaldo, tipo, proceso, producto, frecuencia, criticidad, frecuencia_valor, complejidad_valor, horas_semana, ipf, nivel_ipf, estado, observaciones, ranking_ipf, riesgo")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => toFuncion(row as FunctionRow));
}

export async function saveFunctionRecord(funcion: Funcion) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase
    .from("funciones")
    .upsert(toRow(funcion), { onConflict: "client_id" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function saveFunctionRecords(funciones: Funcion[]) {
  if (!isSupabaseConfigured || !supabase || !funciones.length) return;

  const { error } = await supabase
    .from("funciones")
    .upsert(funciones.map(toRow), { onConflict: "client_id" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteFunctionRecord(id: string) {
  if (!isSupabaseConfigured || !supabase) return;

  const query = isUuid(id)
    ? supabase.from("funciones").delete().eq("id", id)
    : supabase.from("funciones").delete().eq("client_id", id);

  const { error } = await query;
  if (error) {
    throw new Error(error.message);
  }
}

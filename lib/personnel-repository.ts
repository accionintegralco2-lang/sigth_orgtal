import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { defaultDiagnosisId } from "@/lib/security-context";
import type { Persona } from "@/types";

type PersonnelRow = {
  id?: string;
  client_id?: string | null;
  codigo: string | null;
  nombre: string;
  cargo: string | null;
  dependencia: string | null;
  perfil_profesional: string | null;
  experiencia: string | null;
  tiempo_en_cargo: string | null;
  numero_funciones: number | null;
  complejidad: string | null;
  competencia_tecnica: number | null;
  competencia_digital: number | null;
  competencia_comportamental: number | null;
  autonomia: number | null;
  disponibilidad: number | null;
  fortalezas: string | null;
  carga_laboral_estimada: number | null;
  diagnostico_id?: string | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toPersona(row: PersonnelRow): Persona {
  return {
    id: row.client_id || row.id || crypto.randomUUID(),
    codigo: row.codigo || undefined,
    nombre: row.nombre,
    cargo: row.cargo || "Sin cargo",
    dependencia: row.dependencia || "Sin dependencia",
    formacion: row.perfil_profesional || "Sin registrar",
    experiencia: row.experiencia || "Sin registrar",
    tiempoCargo: row.tiempo_en_cargo || "Sin registrar",
    funciones: row.numero_funciones || 0,
    complejidad: row.complejidad || "Media",
    competenciaTecnica: row.competencia_tecnica || undefined,
    competenciaDigital: row.competencia_digital || undefined,
    competenciaComportamental: row.competencia_comportamental || undefined,
    autonomia: row.autonomia || undefined,
    disponibilidad: row.disponibilidad || undefined,
    fortalezas: row.fortalezas || undefined,
    cargaLaboral: row.carga_laboral_estimada || 0
  };
}

function toRow(persona: Persona, diagnosisId: string): PersonnelRow {
  return {
    client_id: persona.id,
    diagnostico_id: diagnosisId,
    codigo: persona.codigo || null,
    nombre: persona.nombre,
    cargo: persona.cargo,
    dependencia: persona.dependencia,
    perfil_profesional: persona.formacion || null,
    experiencia: persona.experiencia,
    tiempo_en_cargo: persona.tiempoCargo,
    numero_funciones: persona.funciones,
    complejidad: persona.complejidad,
    competencia_tecnica: persona.competenciaTecnica || null,
    competencia_digital: persona.competenciaDigital || null,
    competencia_comportamental: persona.competenciaComportamental || null,
    autonomia: persona.autonomia || null,
    disponibilidad: persona.disponibilidad || null,
    fortalezas: persona.fortalezas || null,
    carga_laboral_estimada: persona.cargaLaboral
  };
}

export async function fetchPersonnelRecords(diagnosisId = defaultDiagnosisId) {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("personal")
    .select("id, client_id, codigo, nombre, cargo, dependencia, perfil_profesional, experiencia, tiempo_en_cargo, numero_funciones, complejidad, competencia_tecnica, competencia_digital, competencia_comportamental, autonomia, disponibilidad, fortalezas, carga_laboral_estimada, diagnostico_id")
    .eq("diagnostico_id", diagnosisId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => toPersona(row as PersonnelRow));
}

export async function savePersonnelRecord(persona: Persona, diagnosisId = defaultDiagnosisId) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase
    .from("personal")
    .upsert(toRow(persona, diagnosisId), { onConflict: "client_id" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function savePersonnelRecords(personas: Persona[], diagnosisId = defaultDiagnosisId) {
  if (!isSupabaseConfigured || !supabase || !personas.length) return;

  const { error } = await supabase
    .from("personal")
    .upsert(personas.map((persona) => toRow(persona, diagnosisId)), { onConflict: "client_id" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deletePersonnelRecord(id: string, diagnosisId = defaultDiagnosisId) {
  if (!isSupabaseConfigured || !supabase) return;

  const query = isUuid(id)
    ? supabase.from("personal").delete().eq("id", id).eq("diagnostico_id", diagnosisId)
    : supabase.from("personal").delete().eq("client_id", id).eq("diagnostico_id", diagnosisId);

  const { error } = await query;
  if (error) {
    throw new Error(error.message);
  }
}

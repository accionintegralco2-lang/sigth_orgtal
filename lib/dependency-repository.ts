import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Dependencia } from "@/types";

type DependencyRow = {
  id?: string;
  client_id?: string | null;
  nombre: string;
  jefe_responsable: string | null;
  mision: string | null;
  procesos: string[] | null;
  numero_personas: number | null;
  criticidad: string | null;
  estado: string | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(value);
}

function toDependencia(row: DependencyRow): Dependencia {
  return {
    id: row.client_id || row.id || crypto.randomUUID(),
    nombre: row.nombre,
    jefe: row.jefe_responsable || "Sin responsable",
    mision: row.mision || "",
    procesos: row.procesos || [],
    personas: row.numero_personas || 0,
    criticidad: row.criticidad || "Media",
    estado: row.estado || "En diagnostico"
  };
}

function toRow(dependencia: Dependencia): DependencyRow {
  return {
    client_id: dependencia.id,
    nombre: dependencia.nombre,
    jefe_responsable: dependencia.jefe,
    mision: dependencia.mision,
    procesos: dependencia.procesos,
    numero_personas: dependencia.personas,
    criticidad: dependencia.criticidad,
    estado: dependencia.estado
  };
}

export async function fetchDependencyRecords() {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("dependencias")
    .select("id, client_id, nombre, jefe_responsable, mision, procesos, numero_personas, criticidad, estado")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => toDependencia(row as DependencyRow));
}

export async function saveDependencyRecord(dependencia: Dependencia) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase
    .from("dependencias")
    .upsert(toRow(dependencia), { onConflict: "client_id" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteDependencyRecord(id: string) {
  if (!isSupabaseConfigured || !supabase) return;

  const query = isUuid(id)
    ? supabase.from("dependencias").delete().eq("id", id)
    : supabase.from("dependencias").delete().eq("client_id", id);

  const { error } = await query;
  if (error) {
    throw new Error(error.message);
  }
}

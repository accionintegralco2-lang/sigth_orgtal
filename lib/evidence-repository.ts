import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Evidencia } from "@/types";

type EvidenceRow = {
  id?: string;
  client_id?: string | null;
  nombre: string;
  tipo: string | null;
  dependencia: string | null;
  asociado_a: string | null;
  url: string | null;
  estado: string | null;
  fecha: string | null;
  observaciones: string | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toEvidence(row: EvidenceRow): Evidencia {
  return {
    id: row.client_id || row.id || crypto.randomUUID(),
    nombre: row.nombre,
    tipo: row.tipo || "Otro",
    dependencia: row.dependencia || "Sin dependencia",
    asociadoA: row.asociado_a || "Diagnostico general",
    ubicacion: row.url || "Pendiente por cargar",
    estado: (row.estado as Evidencia["estado"]) || "Pendiente",
    fecha: row.fecha || "",
    observaciones: row.observaciones || ""
  };
}

function toRow(evidence: Evidencia): EvidenceRow {
  return {
    client_id: evidence.id,
    nombre: evidence.nombre,
    tipo: evidence.tipo,
    dependencia: evidence.dependencia,
    asociado_a: evidence.asociadoA,
    url: evidence.ubicacion,
    estado: evidence.estado,
    fecha: evidence.fecha || null,
    observaciones: evidence.observaciones
  };
}

export async function fetchEvidenceRecords() {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("evidencias")
    .select("id, client_id, nombre, tipo, dependencia, asociado_a, url, estado, fecha, observaciones")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => toEvidence(row as EvidenceRow));
}

export async function saveEvidenceRecord(evidence: Evidencia) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase
    .from("evidencias")
    .upsert(toRow(evidence), { onConflict: "client_id" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteEvidenceRecord(id: string) {
  if (!isSupabaseConfigured || !supabase) return;

  const query = isUuid(id)
    ? supabase.from("evidencias").delete().eq("id", id)
    : supabase.from("evidencias").delete().eq("client_id", id);

  const { error } = await query;
  if (error) {
    throw new Error(error.message);
  }
}

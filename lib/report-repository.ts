import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { defaultDiagnosisId } from "@/lib/security-context";

export type ReportHistoryItem = {
  id: string;
  nombre: string;
  tipo: string;
  fecha: string;
  estado: string;
  calidad: number;
  riesgo: string;
  dependencias: number;
  personal: number;
  funciones: number;
  alertas: number;
};

type ReportRow = {
  id?: string;
  client_id?: string | null;
  nombre: string;
  tipo: string | null;
  fecha_label: string | null;
  estado: string | null;
  calidad: number | null;
  riesgo: string | null;
  dependencias: number | null;
  personal: number | null;
  funciones: number | null;
  alertas: number | null;
  contenido: Record<string, unknown> | null;
  diagnostico_id?: string | null;
};

function toReport(row: ReportRow): ReportHistoryItem {
  return {
    id: row.client_id || row.id || crypto.randomUUID(),
    nombre: row.nombre,
    tipo: row.tipo || "Ejecutivo",
    fecha: row.fecha_label || "",
    estado: row.estado || "Generado",
    calidad: Number(row.calidad) || 0,
    riesgo: row.riesgo || "moderado",
    dependencias: Number(row.dependencias) || 0,
    personal: Number(row.personal) || 0,
    funciones: Number(row.funciones) || 0,
    alertas: Number(row.alertas) || 0
  };
}

function toRow(item: ReportHistoryItem, diagnosisId: string): ReportRow {
  return {
    client_id: item.id,
    diagnostico_id: diagnosisId,
    nombre: item.nombre,
    tipo: item.tipo,
    fecha_label: item.fecha,
    estado: item.estado,
    calidad: item.calidad,
    riesgo: item.riesgo,
    dependencias: item.dependencias,
    personal: item.personal,
    funciones: item.funciones,
    alertas: item.alertas,
    contenido: {
      calidad: item.calidad,
      riesgo: item.riesgo,
      dependencias: item.dependencias,
      personal: item.personal,
      funciones: item.funciones,
      alertas: item.alertas
    }
  };
}

export async function fetchReportRecords(diagnosisId = defaultDiagnosisId) {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("reportes")
    .select("id, client_id, nombre, tipo, fecha_label, estado, calidad, riesgo, dependencias, personal, funciones, alertas, contenido, diagnostico_id")
    .eq("diagnostico_id", diagnosisId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => toReport(row as ReportRow));
}

export async function saveReportRecord(item: ReportHistoryItem, diagnosisId = defaultDiagnosisId) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase
    .from("reportes")
    .upsert(toRow(item, diagnosisId), { onConflict: "client_id" });

  if (error) {
    throw new Error(error.message);
  }
}

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type AlertTraceRecord = {
  estadoSeguimiento: "Abierta" | "En revision" | "Cerrada";
  responsableSeguimiento: string;
  fechaSeguimiento: string;
  evidencia: string;
  accionTomada: string;
};

type AlertTraceRow = {
  alerta_client_id: string;
  estado: string | null;
  responsable: string | null;
  fecha_seguimiento: string | null;
  evidencia: string | null;
  accion_tomada: string | null;
};

function toTrace(row: AlertTraceRow): AlertTraceRecord {
  return {
    estadoSeguimiento: row.estado === "Cerrada" || row.estado === "En revision" ? row.estado : "Abierta",
    responsableSeguimiento: row.responsable || "",
    fechaSeguimiento: row.fecha_seguimiento || "",
    evidencia: row.evidencia || "",
    accionTomada: row.accion_tomada || ""
  };
}

function toRow(alertId: string, trace: AlertTraceRecord): AlertTraceRow {
  return {
    alerta_client_id: alertId,
    estado: trace.estadoSeguimiento,
    responsable: trace.responsableSeguimiento || null,
    fecha_seguimiento: trace.fechaSeguimiento || null,
    evidencia: trace.evidencia || null,
    accion_tomada: trace.accionTomada || null
  };
}

export async function fetchAlertTraceRecords() {
  if (!isSupabaseConfigured || !supabase) return {};

  const { data, error } = await supabase
    .from("alertas_trazabilidad")
    .select("alerta_client_id, estado, responsable, fecha_seguimiento, evidencia, accion_tomada")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return Object.fromEntries(
    (data || []).map((row) => {
      const typedRow = row as AlertTraceRow;
      return [typedRow.alerta_client_id, toTrace(typedRow)];
    })
  ) as Record<string, AlertTraceRecord>;
}

export async function saveAlertTraceRecord(alertId: string, trace: AlertTraceRecord) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase
    .from("alertas_trazabilidad")
    .upsert(toRow(alertId, trace), { onConflict: "alerta_client_id" });

  if (error) {
    throw new Error(error.message);
  }
}

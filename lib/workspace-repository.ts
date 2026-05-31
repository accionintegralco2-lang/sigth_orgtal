import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { defaultDiagnosisId } from "@/lib/security-context";

const workspaceTables = [
  "alertas_trazabilidad",
  "encuesta_respuestas",
  "evidencias",
  "entrevistas",
  "funciones",
  "personal",
  "dependencias"
];

export async function clearWorkspaceRecords(diagnosisId = defaultDiagnosisId) {
  if (!isSupabaseConfigured || !supabase) return;

  for (const table of workspaceTables) {
    const { error } = await supabase.from(table).delete().eq("diagnostico_id", diagnosisId);
    if (error) {
      throw new Error(`No se pudo limpiar ${table}: ${error.message}`);
    }
  }
}

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const workspaceTables = [
  "alertas_trazabilidad",
  "encuesta_respuestas",
  "evidencias",
  "entrevistas",
  "funciones",
  "personal",
  "dependencias"
];

export async function clearWorkspaceRecords() {
  if (!isSupabaseConfigured || !supabase) return;

  for (const table of workspaceTables) {
    const { error } = await supabase.from(table).delete().not("id", "is", null);
    if (error) {
      throw new Error(`No se pudo limpiar ${table}: ${error.message}`);
    }
  }
}

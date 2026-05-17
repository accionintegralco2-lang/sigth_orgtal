import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const evidenceBucket = process.env.NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET || "evidencias";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseStatus = {
  configured: isSupabaseConfigured,
  url: supabaseUrl || "",
  evidenceBucket
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export async function testSupabaseEvidenceStorage() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message: "Supabase no esta configurado. Falta crear .env.local con URL y llave publica."
    };
  }

  const { error } = await supabase.storage.from(evidenceBucket).list("", { limit: 1 });
  if (error) {
    return {
      ok: false,
      message: `No se pudo acceder al bucket ${evidenceBucket}: ${error.message}`
    };
  }

  return {
    ok: true,
    message: `Conexion correcta. El bucket ${evidenceBucket} responde.`
  };
}

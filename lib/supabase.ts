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

export type SupabaseReadinessCheck = {
  label: string;
  ok: boolean;
  detail: string;
};

export async function testSupabaseOperationalReadiness(): Promise<{
  ok: boolean;
  message: string;
  checks: SupabaseReadinessCheck[];
}> {
  const checks: SupabaseReadinessCheck[] = [];

  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message: "Supabase no esta configurado. Faltan variables de entorno.",
      checks: [
        {
          label: "Variables de entorno",
          ok: false,
          detail: "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."
        }
      ]
    };
  }

  checks.push({
    label: "Variables de entorno",
    ok: true,
    detail: "URL y llave publica detectadas por la app."
  });

  const tables = [
    "dependencias",
    "personal",
    "funciones",
    "entrevistas",
    "encuesta_respuestas",
    "alertas_trazabilidad",
    "reportes",
    "evidencias"
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select("*").limit(1);
    checks.push({
      label: `Tabla ${table}`,
      ok: !error,
      detail: error ? error.message : "Lectura disponible."
    });
  }

  const storageResult = await testSupabaseEvidenceStorage();
  checks.push({
    label: `Bucket ${evidenceBucket}`,
    ok: storageResult.ok,
    detail: storageResult.message
  });

  const testClientId = `healthcheck-${Date.now()}`;
  const { error: insertError } = await supabase.from("dependencias").insert({
    client_id: testClientId,
    nombre: "Prueba tecnica SIGTH_ORGTAL",
    jefe_responsable: "Sistema",
    mision: "Registro temporal de validacion",
    procesos: ["Validacion"],
    numero_personas: 1,
    criticidad: "Baja",
    estado: "Prueba"
  });

  checks.push({
    label: "Escritura temporal",
    ok: !insertError,
    detail: insertError ? insertError.message : "La app pudo crear un registro temporal."
  });

  if (!insertError) {
    const { error: deleteError } = await supabase.from("dependencias").delete().eq("client_id", testClientId);
    checks.push({
      label: "Limpieza temporal",
      ok: !deleteError,
      detail: deleteError ? deleteError.message : "El registro temporal fue eliminado."
    });
  }

  const failed = checks.filter((check) => !check.ok);

  return {
    ok: failed.length === 0,
    message: failed.length
      ? `Supabase requiere ajuste: ${failed.length} punto(s) pendiente(s).`
      : "Supabase esta listo para uso real con dependencias nuevas.",
    checks
  };
}

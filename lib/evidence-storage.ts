import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const evidenceBucket = process.env.NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET || "evidencias";

function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
}

export async function uploadEvidenceFile(file: File) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      uploaded: false,
      location: `Archivo seleccionado: ${file.name}`,
      message: "Supabase aun no esta configurado. Se registro el nombre del archivo."
    };
  }

  const path = `evidencias/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(evidenceBucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(evidenceBucket).getPublicUrl(path);

  return {
    uploaded: true,
    location: data.publicUrl || path,
    message: "Documento cargado en Supabase Storage correctamente."
  };
}

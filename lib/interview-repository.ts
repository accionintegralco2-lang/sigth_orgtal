import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { SurveySubmission, SurveyTarget } from "@/lib/surveys";
import type { Entrevista } from "@/types";

type InterviewRow = {
  id?: string;
  client_id?: string | null;
  nombre: string;
  dirigido_a: string | null;
  respuestas: number | null;
  estado: string | null;
  impacto: string | null;
  objetivo: string | null;
};

type SurveySubmissionRow = {
  id?: string;
  client_id?: string | null;
  target: string | null;
  respondent: string | null;
  average: number | null;
  answers: number[] | null;
  created_at_label: string | null;
  interpretation: string | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toInterview(row: InterviewRow): Entrevista {
  return {
    id: row.client_id || row.id || crypto.randomUUID(),
    instrumento: row.nombre,
    dirigidoA: row.dirigido_a || "Personal",
    respuestas: row.respuestas || 0,
    estado: row.estado || "Pendiente",
    impacto: row.impacto || "Medio",
    objetivo: row.objetivo || "Levantar informacion para alimentar el diagnostico organizacional."
  };
}

function toInterviewRow(item: Entrevista): InterviewRow {
  return {
    client_id: item.id,
    nombre: item.instrumento,
    dirigido_a: item.dirigidoA,
    respuestas: item.respuestas,
    estado: item.estado,
    impacto: item.impacto,
    objetivo: item.objetivo
  };
}

function normalizeTarget(target: string | null): SurveyTarget {
  return target === "Expertos" ? "Expertos" : "Personal";
}

function toSurveySubmission(row: SurveySubmissionRow): SurveySubmission {
  return {
    id: row.client_id || row.id || crypto.randomUUID(),
    target: normalizeTarget(row.target),
    respondent: row.respondent || "Sin identificar",
    average: Number(row.average) || 0,
    answers: Array.isArray(row.answers) ? row.answers.map(Number) : [],
    createdAt: row.created_at_label || "",
    interpretation: row.interpretation || "Requiere seguimiento"
  };
}

function toSurveySubmissionRow(item: SurveySubmission): SurveySubmissionRow {
  return {
    client_id: item.id,
    target: item.target,
    respondent: item.respondent,
    average: item.average,
    answers: item.answers,
    created_at_label: item.createdAt,
    interpretation: item.interpretation
  };
}

export async function fetchInterviewRecords() {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("entrevistas")
    .select("id, client_id, nombre, dirigido_a, respuestas, estado, impacto, objetivo")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => toInterview(row as InterviewRow));
}

export async function saveInterviewRecord(item: Entrevista) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase
    .from("entrevistas")
    .upsert(toInterviewRow(item), { onConflict: "client_id" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteInterviewRecord(id: string) {
  if (!isSupabaseConfigured || !supabase) return;

  const query = isUuid(id)
    ? supabase.from("entrevistas").delete().eq("id", id)
    : supabase.from("entrevistas").delete().eq("client_id", id);

  const { error } = await query;
  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchSurveySubmissions() {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("encuesta_respuestas")
    .select("id, client_id, target, respondent, average, answers, created_at_label, interpretation")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => toSurveySubmission(row as SurveySubmissionRow));
}

export async function saveSurveySubmission(item: SurveySubmission) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase
    .from("encuesta_respuestas")
    .upsert(toSurveySubmissionRow(item), { onConflict: "client_id" });

  if (error) {
    throw new Error(error.message);
  }
}

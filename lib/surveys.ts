import { criteriosExpertos } from "@/data/mock-data";

export type SurveyTarget = "Personal" | "Expertos";

export type SurveySubmission = {
  id: string;
  target: SurveyTarget;
  respondent: string;
  average: number;
  answers: number[];
  createdAt: string;
  interpretation: string;
};

export const surveyStorageKey = "orgtal-survey-submissions-v1";

export const personalSurveyQuestions = [
  "Las funciones que realizo coinciden con las funciones formalmente asignadas.",
  "La cantidad de actividades semanales es manejable dentro de mi jornada.",
  "Cuento con las competencias y herramientas necesarias para cumplir mis funciones.",
  "Existen tareas repetidas o cruzadas con otros cargos.",
  "Mi cargo tiene claridad sobre prioridades, responsables y productos esperados."
];

export const expertRespondents = ["Experto 1", "Experto 2", "Experto 3", "Experto 4", "Experto 5"];

export const expertSurveyQuestions = criteriosExpertos.map(
  (item, index) => `${index + 1}. ${item.criterio}: ${item.pregunta}`
);

export function getSurveyQuestions(target: SurveyTarget) {
  return target === "Personal" ? personalSurveyQuestions : expertSurveyQuestions;
}

export function interpretAverage(value: number) {
  if (value >= 4.5) return "Muy favorable";
  if (value >= 4) return "Favorable";
  if (value >= 3) return "Requiere seguimiento";
  return "Critico";
}


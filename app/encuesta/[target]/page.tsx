import { PublicSurveyView } from "@/components/public-survey-view";
import type { SurveyTarget } from "@/lib/surveys";

export default async function EncuestaPage({ params }: { params: Promise<{ target: string }> }) {
  const { target } = await params;
  const surveyTarget: SurveyTarget = target === "expertos" ? "Expertos" : "Personal";
  return <PublicSurveyView target={surveyTarget} />;
}

"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useOrgData } from "@/components/org-data-provider";
import {
  expertRespondents,
  getSurveyQuestions,
  interpretAverage,
  surveyStorageKey,
  type SurveySubmission,
  type SurveyTarget
} from "@/lib/surveys";

export function PublicSurveyView({ target }: { target: SurveyTarget }) {
  const { personal } = useOrgData();
  const questions = getSurveyQuestions(target);
  const [respondent, setRespondent] = useState("");
  const [answers, setAnswers] = useState<number[]>(questions.map(() => 3));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAnswers(questions.map(() => 3));
    setRespondent("");
    setSaved(false);
  }, [questions]);

  function submitSurvey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const average = Number((answers.reduce((total, value) => total + value, 0) / answers.length).toFixed(1));
    const stored = window.localStorage.getItem(surveyStorageKey);
    const current = stored ? (JSON.parse(stored) as SurveySubmission[]) : [];
    const submission: SurveySubmission = {
      id: `survey-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      target,
      respondent: respondent.trim() || (target === "Personal" ? "Personal" : "Experto"),
      average,
      answers,
      createdAt: new Date().toLocaleDateString("es-CO"),
      interpretation: interpretAverage(average)
    };
    window.localStorage.setItem(surveyStorageKey, JSON.stringify([submission, ...current]));
    setSaved(true);
  }

  return (
    <main className="public-survey-shell">
      <section className="public-survey-card">
        <div className="public-survey-heading">
          <p className="eyebrow">SIGTH_ORGTAL</p>
          <h1>Encuesta para {target.toLowerCase()}</h1>
          <p>
            {target === "Expertos"
              ? "Rubrica para validadores que evalúan claridad, pertinencia y aplicabilidad del instrumento."
              : "Diligencia la escala de 1 a 5. La respuesta alimenta el diagnóstico del módulo de entrevistas y cuestionarios."}
          </p>
        </div>

        {saved ? (
          <div className="survey-success">
            <h2>Respuesta registrada</h2>
            <p>Gracias. La información quedó guardada para el análisis del diagnóstico.</p>
            <Link className="primary-action" href={target === "Personal" ? "/encuesta/personal" : "/encuesta/expertos"}>
              Registrar otra respuesta
            </Link>
          </div>
        ) : (
          <form className="survey-form" onSubmit={submitSurvey}>
            <label>
              Identificación del respondiente
              {target === "Personal" ? (
                <select value={respondent} onChange={(event) => setRespondent(event.target.value)}>
                  <option value="">Seleccionar o dejar anonimo</option>
                  {personal.map((item) => (
                    <option key={item.id} value={item.codigo || item.nombre}>
                      {item.codigo || item.nombre} - {item.cargo}
                    </option>
                  ))}
                </select>
              ) : (
                <select value={respondent} onChange={(event) => setRespondent(event.target.value)}>
                  <option value="">Seleccionar experto</option>
                  {expertRespondents.map((expert) => (
                    <option key={expert} value={expert}>
                      {expert}
                    </option>
                  ))}
                </select>
              )}
            </label>

            <div className="survey-questions">
              {questions.map((question, index) => (
                <div className="survey-question" key={question}>
                  <p>{question}</p>
                  <div className="rating-row" role="group" aria-label={question}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        className={answers[index] === value ? "active" : ""}
                        key={value}
                        type="button"
                        onClick={() =>
                          setAnswers((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)))
                        }
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="primary-action" type="submit">
              Enviar encuesta
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

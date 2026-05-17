"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import {
  expertRespondents,
  expertSurveyQuestions,
  interpretAverage,
  personalSurveyQuestions,
  surveyStorageKey,
  type SurveySubmission,
  type SurveyTarget
} from "@/lib/surveys";

const initialForm = {
  instrumento: "",
  dirigidoA: "Jefes",
  respuestas: 0,
  estado: "Pendiente",
  impacto: "Medio",
  objetivo: ""
};

const questionBank: Record<string, string[]> = {
  Jefes: [
    "Cuales son los procesos criticos de la dependencia?",
    "Que funciones presentan mayor sobrecarga o duplicidad?",
    "Existen funciones importantes sin responsable formal?",
    "Que documentos soportan la estructura actual?"
  ],
  Personal: [
    "Que funciones realiza realmente durante la semana?",
    "Que actividades no aparecen en el manual de funciones?",
    "Que tareas consumen mayor tiempo o generan mayor riesgo?",
    "Que competencias necesita fortalecer para su cargo?"
  ],
  Auditor: [
    "La dependencia cuenta con organigrama actualizado?",
    "El manual de funciones esta vigente y disponible?",
    "Existen evidencias de trazabilidad documental?",
    "Los procesos tienen responsables claramente definidos?"
  ],
  Expertos: [
    "El instrumento evalua adecuadamente funciones y cargas?",
    "Los criterios de riesgo son pertinentes para la institucion?",
    "La escala de valoracion es clara y aplicable?",
    "Que ajustes recomienda antes de la validacion final?"
  ]
};

function csvValue(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function InterviewsManager() {
  const { entrevistas, personal, addEntrevista, removeEntrevista } = useOrgData();
  const [form, setForm] = useState(initialForm);
  const [surveyTarget, setSurveyTarget] = useState<SurveyTarget>("Personal");
  const [respondent, setRespondent] = useState("");
  const [answers, setAnswers] = useState<number[]>(personalSurveyQuestions.map(() => 3));
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [isSurveyReady, setIsSurveyReady] = useState(false);
  const questions = useMemo(() => questionBank[form.dirigidoA] ?? questionBank.Jefes, [form.dirigidoA]);
  const activeSurveyQuestions = surveyTarget === "Personal" ? personalSurveyQuestions : expertSurveyQuestions;
  const targetSubmissions = submissions.filter((item) => item.target === surveyTarget);
  const averageSurveyScore = targetSubmissions.length
    ? Number((targetSubmissions.reduce((total, item) => total + item.average, 0) / targetSubmissions.length).toFixed(1))
    : 0;
  const favorableResponses = targetSubmissions.filter((item) => item.average >= 4).length;

  useEffect(() => {
    const stored = window.localStorage.getItem(surveyStorageKey);
    if (stored) {
      setSubmissions(JSON.parse(stored) as SurveySubmission[]);
    }
    setIsSurveyReady(true);
  }, []);

  useEffect(() => {
    setAnswers(activeSurveyQuestions.map(() => 3));
    setRespondent("");
  }, [activeSurveyQuestions, surveyTarget]);

  useEffect(() => {
    if (!isSurveyReady) return;
    window.localStorage.setItem(surveyStorageKey, JSON.stringify(submissions));
  }, [isSurveyReady, submissions]);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.instrumento.trim()) return;
    addEntrevista({
      ...form,
      instrumento: form.instrumento.trim(),
      objetivo: form.objetivo.trim() || "Levantar informacion para alimentar el diagnostico organizacional.",
      respuestas: Number(form.respuestas) || 0
    });
    setForm(initialForm);
  }

  function submitSurvey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resolvedRespondent = respondent.trim() || (surveyTarget === "Personal" ? personal[0]?.codigo || "Personal" : "Experto");
    const average = Number((answers.reduce((total, value) => total + value, 0) / answers.length).toFixed(1));
    setSubmissions((current) => [
      {
        id: `survey-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        target: surveyTarget,
        respondent: resolvedRespondent,
        average,
        answers,
        createdAt: new Date().toLocaleDateString("es-CO"),
        interpretation: interpretAverage(average)
      },
      ...current
    ]);
    setAnswers(activeSurveyQuestions.map(() => 3));
    setRespondent("");
  }

  function exportSurveys() {
    const rows = [
      ["Poblacion", "Respondiente", "Promedio", "Interpretacion", "Fecha"],
      ...submissions.map((item) => [item.target, item.respondent, item.average, item.interpretation, item.createdAt])
    ];
    const csv = rows.map((row) => row.map(csvValue).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sigth_orgtal-encuestas-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Instrumentos de diagnostico</p>
            <h1>Entrevistas y cuestionarios</h1>
            <p>
              Crea instrumentos para jefes, personal, auditores o expertos validadores y
              controla su estado dentro del diagnostico.
            </p>
          </div>
          <span className="status-pill">{entrevistas.length} instrumentos</span>
        </section>

        <section className="form-panel">
          <div className="panel-heading">
            <h2>Nuevo instrumento</h2>
            <span>Entrevista, encuesta o lista de chequeo</span>
          </div>
          <form className="record-form" onSubmit={submitForm}>
            <label className="wide-field">
              Nombre del instrumento
              <input
                value={form.instrumento}
                onChange={(event) => setForm({ ...form, instrumento: event.target.value })}
              />
            </label>
            <label>
              Dirigido a
              <select value={form.dirigidoA} onChange={(event) => setForm({ ...form, dirigidoA: event.target.value })}>
                <option>Jefes</option>
                <option>Personal</option>
                <option>Auditor</option>
                <option>Expertos</option>
              </select>
            </label>
            <label>
              Estado
              <select value={form.estado} onChange={(event) => setForm({ ...form, estado: event.target.value })}>
                <option>Pendiente</option>
                <option>Activo</option>
                <option>En curso</option>
                <option>Cerrado</option>
              </select>
            </label>
            <label>
              Impacto
              <select value={form.impacto} onChange={(event) => setForm({ ...form, impacto: event.target.value })}>
                <option>Bajo</option>
                <option>Medio</option>
                <option>Alto</option>
                <option>Critico</option>
              </select>
            </label>
            <label>
              Respuestas
              <input
                min="0"
                type="number"
                value={form.respuestas}
                onChange={(event) => setForm({ ...form, respuestas: Number(event.target.value) })}
              />
            </label>
            <label className="wide-field">
              Objetivo
              <textarea value={form.objetivo} onChange={(event) => setForm({ ...form, objetivo: event.target.value })} />
            </label>
            <button className="primary-action" type="submit">
              Guardar instrumento
            </button>
          </form>
        </section>

        <section className="survey-grid">
          <article className="panel survey-panel">
            <div className="panel-heading">
              <h2>Encuesta funcional</h2>
              <span>{surveyTarget}</span>
            </div>
            <div className="survey-tabs">
              <button
                className={surveyTarget === "Personal" ? "active" : ""}
                type="button"
                onClick={() => setSurveyTarget("Personal")}
              >
                Personal
              </button>
              <button
                className={surveyTarget === "Expertos" ? "active" : ""}
                type="button"
                onClick={() => setSurveyTarget("Expertos")}
              >
                Expertos
              </button>
            </div>
            <form className="survey-form" onSubmit={submitSurvey}>
              <label>
                Respondiente
                {surveyTarget === "Personal" ? (
                  <select value={respondent} onChange={(event) => setRespondent(event.target.value)}>
                    <option value="">Seleccionar personal</option>
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
                {activeSurveyQuestions.map((question, index) => (
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
                Guardar respuesta
              </button>
            </form>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h2>Resultados de encuestas</h2>
              <span>{targetSubmissions.length} respuestas</span>
            </div>
            <div className="survey-metrics">
              <div>
                <span>Promedio</span>
                <strong>{averageSurveyScore || "-"}</strong>
              </div>
              <div>
                <span>Favorables</span>
                <strong>{favorableResponses}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{submissions.length}</strong>
              </div>
            </div>
            <div className="survey-results">
              {targetSubmissions.length ? (
                targetSubmissions.slice(0, 6).map((item) => (
                  <div className="survey-result" key={item.id}>
                    <div>
                      <strong>{item.respondent}</strong>
                      <span>{item.createdAt}</span>
                    </div>
                    <b>{item.average}</b>
                    <p>{item.interpretation}</p>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h2>Sin respuestas</h2>
                  <p>Diligencia la primera encuesta para activar los resultados.</p>
                </div>
              )}
            </div>
            <button className="secondary-action" type="button" onClick={exportSurveys}>
              Descargar resultados CSV
            </button>
          </article>
        </section>

        <section className="panel external-survey-panel">
          <div className="panel-heading">
            <h2>Links externos de diligenciamiento</h2>
            <span>Acceso sin tablero</span>
          </div>
          <div className="external-link-grid">
            <article>
              <span>Encuesta personal</span>
              <strong>/encuesta/personal</strong>
              <p>Para funcionarios que reportan funciones reales, carga y claridad del cargo.</p>
              <Link className="primary-action" href="/encuesta/personal" target="_blank">
                Abrir link
              </Link>
            </article>
            <article>
              <span>Encuesta expertos</span>
              <strong>/encuesta/expertos</strong>
              <p>
                Para validadores que evalúan claridad, pertinencia y aplicabilidad
                del instrumento. Incluye {expertSurveyQuestions.length} preguntas
                de la rúbrica de criterios.
              </p>
              <Link className="primary-action" href="/encuesta/expertos" target="_blank">
                Abrir link
              </Link>
            </article>
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="panel">
            <div className="panel-heading">
              <h2>Instrumentos registrados</h2>
              <span>{entrevistas.length} elementos</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Instrumento</th>
                    <th>Dirigido a</th>
                    <th>Respuestas</th>
                    <th>Estado</th>
                    <th>Impacto</th>
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {entrevistas.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.instrumento}</strong>
                        <p>{item.objetivo}</p>
                      </td>
                      <td>{item.dirigidoA}</td>
                      <td>{item.respuestas}</td>
                      <td>{item.estado}</td>
                      <td>{item.impacto}</td>
                      <td>
                        <button className="text-action" type="button" onClick={() => removeEntrevista(item.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h2>Preguntas sugeridas</h2>
              <span>{form.dirigidoA}</span>
            </div>
            <ol className="question-list">
              {questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
          </article>
        </section>
      </main>
    </AppShell>
  );
}

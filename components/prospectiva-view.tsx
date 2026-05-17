import { AppShell } from "@/components/app-shell";
import { prospectivas } from "@/data/mock-data";

function gapClass(level: string) {
  const normalized = level.toLowerCase();
  if (normalized === "critica") return "critico";
  if (normalized === "alta") return "alto";
  if (normalized === "media") return "moderado";
  return "bajo";
}

export function ProspectivaView() {
  const criticalGaps = prospectivas.filter((item) => item.nivelBrecha === "Critica").length;
  const highImpact = prospectivas.filter((item) => item.impacto === "Alto").length;
  const shortTerm = prospectivas.filter((item) => item.horizonte === "Corto").length;
  const averageGap = Math.round(
    prospectivas.reduce((total, item) => total + item.ibp, 0) / prospectivas.length
  );

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Hoja 10 del piloto</p>
            <h1>Prospectiva organizacional</h1>
            <p>
              Tendencias futuras, competencias requeridas, brechas prospectivas y
              acciones sugeridas para anticipar riesgos del talento humano.
            </p>
          </div>
          <span className="status-pill">{prospectivas.length} tendencias</span>
        </section>

        <section className="metric-grid">
          <article className="metric-card">
            <span>Impacto alto</span>
            <strong>{highImpact}</strong>
            <small>Tendencias prioritarias</small>
          </article>
          <article className="metric-card">
            <span>Brecha critica</span>
            <strong>{criticalGaps}</strong>
            <small>Capacidad futura en riesgo</small>
          </article>
          <article className="metric-card">
            <span>Horizonte corto</span>
            <strong>{shortTerm}</strong>
            <small>Acciones inmediatas</small>
          </article>
          <article className="metric-card">
            <span>IBP promedio</span>
            <strong>{averageGap}</strong>
            <small>Indice de brecha prospectiva</small>
          </article>
        </section>

        <section className="prospect-grid">
          {prospectivas.map((item) => (
            <article className="prospect-card" key={item.tendencia}>
              <div className="panel-heading">
                <h2>{item.tendencia}</h2>
                <span className={`risk-badge compact ${gapClass(item.nivelBrecha)}`}>
                  {item.nivelBrecha}
                </span>
              </div>
              <p>{item.funcionEmergente}</p>
              <div className="prospect-levels">
                <span>Actual {item.nivelActual}</span>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${gapClass(item.nivelBrecha)}`}
                    style={{ width: `${(item.nivelActual / item.nivelRequeridoFuturo) * 100}%` }}
                  />
                </div>
                <strong>Futuro {item.nivelRequeridoFuturo}</strong>
              </div>
              <dl className="prospect-facts">
                <div>
                  <dt>Competencia futura</dt>
                  <dd>{item.competenciaFutura}</dd>
                </div>
                <div>
                  <dt>Impacto</dt>
                  <dd>{item.impacto}</dd>
                </div>
                <div>
                  <dt>Horizonte</dt>
                  <dd>{item.horizonte}</dd>
                </div>
              </dl>
              <strong className="recommendation">{item.accionSugerida}</strong>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

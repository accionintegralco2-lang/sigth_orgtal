import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { criteriosExpertos, dimensionesExpertas } from "@/data/mock-data";

function average(values: number[]) {
  return values.reduce((total, item) => total + item, 0) / values.length;
}

export function ExpertJudgementView() {
  const globalAverage = average(dimensionesExpertas.map((item) => item.promedio));
  const weightedAverage = dimensionesExpertas.reduce((total, item) => total + item.ponderado, 0);
  const strongCriteria = criteriosExpertos.filter((item) => item.promedio >= 4.5).length;

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Hoja 12 del piloto</p>
            <h1>Juicio de expertos</h1>
            <p>
              Validacion preliminar de contenido, usabilidad, trazabilidad,
              proteccion de datos y utilidad directiva de SIGTH_ORGTAL.
            </p>
          </div>
          <div className="action-row">
            <span className="status-pill">Validado preliminarmente</span>
            <Link className="primary-action" href="/encuesta/expertos" target="_blank">
              Abrir encuesta expertos
            </Link>
          </div>
        </section>

        <section className="metric-grid">
          <article className="metric-card">
            <span>Criterios valorados</span>
            <strong>{criteriosExpertos.length}</strong>
            <small>Rubrica de validacion</small>
          </article>
          <article className="metric-card">
            <span>Promedio global</span>
            <strong>{weightedAverage.toFixed(2)}</strong>
            <small>Ponderado por dimension</small>
          </article>
          <article className="metric-card">
            <span>CVR promedio</span>
            <strong>1.00</strong>
            <small>Validez de contenido</small>
          </article>
          <article className="metric-card">
            <span>Muy satisfactorios</span>
            <strong>{strongCriteria}</strong>
            <small>Criterios mayor o igual a 4.5</small>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel">
            <div className="panel-heading">
              <h2>Promedio por dimension</h2>
              <span>Promedio simple {globalAverage.toFixed(2)}</span>
            </div>
            <div className="expert-bars">
              {dimensionesExpertas.map((item) => (
                <div className="expert-bar-row" key={item.dimension}>
                  <span>{item.dimension.replace("D", "D ")}</span>
                  <div className="bar-track">
                    <div className="bar-fill bajo" style={{ width: `${(item.promedio / 5) * 100}%` }} />
                  </div>
                  <strong>{item.promedio.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h2>Consolidado de validez</h2>
              <span>CVR</span>
            </div>
            <div className="compact-list">
              {dimensionesExpertas.map((item) => (
                <div className="breach-item" key={item.dimension}>
                  <strong>{item.dimension}</strong>
                  <span>
                    Peso {Math.round(item.peso * 100)}% - CVR {item.cvr.toFixed(2)} - {item.validez}
                  </span>
                  <em>{item.interpretacion}</em>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Rubrica de criterios</h2>
            <span>{criteriosExpertos.length} criterios x 5 expertos</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>E01</th>
                  <th>E02</th>
                  <th>E03</th>
                  <th>E04</th>
                  <th>E05</th>
                  <th>Prom.</th>
                  <th>CVR</th>
                  <th>Interpretacion</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {criteriosExpertos.map((item) => (
                  <tr key={item.criterio}>
                    <td>
                      <strong>{item.criterio}</strong>
                      <p>{item.definicion}</p>
                    </td>
                    <td>{item.e1}</td>
                    <td>{item.e2}</td>
                    <td>{item.e3}</td>
                    <td>{item.e4}</td>
                    <td>{item.e5}</td>
                    <td>{item.promedio.toFixed(2)}</td>
                    <td>{item.cvr.toFixed(2)}</td>
                    <td>{item.interpretacion}</td>
                    <td>{item.accion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

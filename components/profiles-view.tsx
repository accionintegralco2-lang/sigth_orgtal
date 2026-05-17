import { AppShell } from "@/components/app-shell";
import { brechas, compatibilidades, perfiles } from "@/data/mock-data";

function scoreClass(score: number) {
  if (score >= 90) return "score-high";
  if (score >= 80) return "score-good";
  return "score-watch";
}

export function ProfilesView() {
  const averageCompatibility = Math.round(
    compatibilidades.reduce((total, item) => total + item.icpf, 0) / compatibilidades.length
  );
  const partialRoles = perfiles.filter((item) => item.alineacion !== "Alta").length;

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Analisis del piloto</p>
            <h1>Perfiles y competencias</h1>
            <p>
              Vista integrada de roles funcionales requeridos, brechas detectadas y
              compatibilidad persona-funcion tomada del modelo piloto SIGTH_ORGTAL v1.5.
            </p>
          </div>
          <span className="status-pill">ICPF promedio {averageCompatibility}%</span>
        </section>

        <section className="metric-grid">
          <article className="metric-card">
            <span>Roles requeridos</span>
            <strong>{perfiles.length}</strong>
            <small>Modelo funcional piloto</small>
          </article>
          <article className="metric-card">
            <span>Alineacion parcial</span>
            <strong>{partialRoles}</strong>
            <small>Requieren validacion o respaldo</small>
          </article>
          <article className="metric-card">
            <span>Compatibilidades</span>
            <strong>{compatibilidades.length}</strong>
            <small>Funciones priorizadas</small>
          </article>
          <article className="metric-card">
            <span>Brechas destacadas</span>
            <strong>{brechas.length}</strong>
            <small>Seguimiento recomendado</small>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Roles funcionales requeridos</h2>
            <span>{perfiles.length} roles</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Competencias requeridas</th>
                  <th>Alineacion</th>
                  <th>Brecha</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {perfiles.map((item) => (
                  <tr key={item.cargo}>
                    <td>{item.cargo}</td>
                    <td>{item.perfilEsperado}</td>
                    <td>{item.alineacion}</td>
                    <td>{item.brecha}</td>
                    <td>{item.accion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="panel">
            <div className="panel-heading">
              <h2>Compatibilidad persona-funcion</h2>
              <span>ICPF</span>
            </div>
            <div className="compat-list">
              {compatibilidades.map((item) => (
                <div className="compat-item" key={`${item.funcion}-${item.persona}`}>
                  <div>
                    <strong>
                      {item.funcion} - {item.persona}
                    </strong>
                    <p>{item.nombreFuncion}</p>
                    <span>{item.recomendacion}</span>
                  </div>
                  <b className={scoreClass(item.icpf)}>{item.icpf}%</b>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <h2>Brechas destacadas</h2>
              <span>Seguimiento</span>
            </div>
            <div className="compact-list">
              {brechas.map((item) => (
                <div className="breach-item" key={item.funcion}>
                  <strong>{item.funcion}</strong>
                  <p>{item.nombreFuncion}</p>
                  <span>
                    Responsable: {item.responsable} - Mejor opcion: {item.mejorPersona} ({item.mejorIcpf}%)
                  </span>
                  <em>{item.accion}</em>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </AppShell>
  );
}

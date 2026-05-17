import { AppShell } from "@/components/app-shell";
import { validacionesPiloto } from "@/data/mock-data";

export function ValidationView() {
  const total = validacionesPiloto.length;
  const ok = validacionesPiloto.filter((item) => item.resultado === "OK").length;
  const expertTests = validacionesPiloto.filter((item) => item.tipo === "Juicio expertos").length;
  const finalResult = validacionesPiloto.find((item) => item.prueba === "Resultado final");

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Control de calidad</p>
            <h1>Validacion piloto</h1>
            <p>
              Trazabilidad de pruebas del archivo SIGTH_ORGTAL v1.5: conteos, controles,
              compatibilidad, prospectiva y juicio de expertos.
            </p>
          </div>
          <span className="status-pill">{finalResult?.resultadoCalculado ?? `${ok}/${total}`} OK</span>
        </section>

        <section className="metric-grid">
          <article className="metric-card">
            <span>Pruebas registradas</span>
            <strong>{total}</strong>
            <small>Hoja 17 del piloto</small>
          </article>
          <article className="metric-card">
            <span>Resultado OK</span>
            <strong>{ok}</strong>
            <small>Controles aprobados</small>
          </article>
          <article className="metric-card">
            <span>Juicio expertos</span>
            <strong>{expertTests}</strong>
            <small>Validacion preliminar</small>
          </article>
          <article className="metric-card">
            <span>Promedio expertos</span>
            <strong>4.29</strong>
            <small>Criterio mayor o igual a 4.0</small>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Matriz de pruebas</h2>
            <span>17_Validacion_Piloto</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Prueba</th>
                  <th>Hoja/Rango</th>
                  <th>Calculado</th>
                  <th>Criterio</th>
                  <th>Estado</th>
                  <th>Tipo</th>
                  <th>Observacion</th>
                </tr>
              </thead>
              <tbody>
                {validacionesPiloto.map((item) => (
                  <tr key={`${item.prueba}-${item.rango}`}>
                    <td>{item.prueba}</td>
                    <td>{item.rango}</td>
                    <td>{item.resultadoCalculado}</td>
                    <td>{item.criterio}</td>
                    <td>
                      <span className="validation-ok">{item.estado}</span>
                    </td>
                    <td>{item.tipo}</td>
                    <td>{item.observacion}</td>
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

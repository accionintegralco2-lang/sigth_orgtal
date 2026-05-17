import { AppShell } from "@/components/app-shell";

type ModulePageProps = {
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
};

export function ModulePage({ title, description, columns, rows }: ModulePageProps) {
  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Modulo operativo</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <button className="secondary-action" type="button">
            Nuevo registro
          </button>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Registros principales</h2>
            <span>{rows.length} elementos</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${title}-${index}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${cell}-${cellIndex}`}>{cell}</td>
                    ))}
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

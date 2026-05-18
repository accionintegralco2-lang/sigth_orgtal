import Link from "next/link";

export default function HomePage() {
  return (
    <main className="login-shell">
      <section className="login-panel">
        <div>
          <p className="eyebrow">Sistema institucional</p>
          <h1>SIGTH_ORGTAL</h1>
          <p className="lead">
            Diagnostico organizacional, talento humano, funciones, cargas laborales,
            alertas y reportes para la toma de decisiones.
          </p>
          <p className="author-credit">
            Derechos de autor, creacion e innovacion tecnologica: Edwyn Arvey Lopez Acosta.
          </p>
        </div>

        <div className="login-card">
          <p className="eyebrow">Acceso version 1.0</p>
          <h2>Panel demostrativo</h2>
          <p>
            Esta version usa datos de prueba y queda preparada para conectarse a
            Supabase Auth.
          </p>
          <p className="login-author">
            Modelo y desarrollo conceptual: Edwyn Arvey Lopez Acosta.
          </p>
          <Link className="primary-action" href="/dashboard">
            Ingresar al dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

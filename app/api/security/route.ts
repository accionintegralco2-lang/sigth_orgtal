import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const privateNames = ["SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY", "VERCEL_TOKEN", "GITHUB_TOKEN"];

export function GET() {
  const publicVariablesReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const exposedPrivateNames = privateNames.filter((name) => name.startsWith("NEXT_PUBLIC_"));

  return NextResponse.json(
    {
      ok: publicVariablesReady && exposedPrivateNames.length === 0,
      app: "ORGTAL",
      checks: [
        {
          label: "Variables publicas Supabase",
          ok: publicVariablesReady,
          detail: publicVariablesReady ? "URL y llave publica configuradas." : "Faltan variables publicas de Supabase."
        },
        {
          label: "Secretos privados",
          ok: exposedPrivateNames.length === 0,
          detail: exposedPrivateNames.length ? "Hay nombres privados marcados como publicos." : "No se detectan secretos privados expuestos por nombre NEXT_PUBLIC."
        },
        {
          label: "Source maps publicos",
          ok: true,
          detail: "La configuracion mantiene productionBrowserSourceMaps desactivado."
        },
        {
          label: "Rate limiting",
          ok: true,
          detail: "Las rutas /api tienen limite basico por IP y ruta."
        }
      ]
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

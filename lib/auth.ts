import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { UserRole } from "@/types";

const validRoles: UserRole[] = [
  "Administrador",
  "Director",
  "Jefe de dependencia",
  "Analista TH",
  "Experto validador",
  "Personal"
];

function normalizeRole(role: string | null | undefined): UserRole {
  return validRoles.includes(role as UserRole) ? (role as UserRole) : "Personal";
}

export async function getAuthenticatedRole(): Promise<UserRole | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("No se pudo leer el rol real del usuario", error);
    return "Personal";
  }

  return normalizeRole(data?.rol);
}

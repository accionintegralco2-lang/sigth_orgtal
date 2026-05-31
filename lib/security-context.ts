import type { UserRole } from "@/types";

export const defaultDiagnosisId = "orgtal-demo";
const diagnosisStorageKey = "orgtal-active-diagnosis-id";

export const protectedRoles: UserRole[] = ["Administrador", "Analista TH", "Jefe de dependencia"];

export function createDiagnosisId() {
  return `diag-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getStoredDiagnosisId() {
  if (typeof window === "undefined") return defaultDiagnosisId;
  return window.localStorage.getItem(diagnosisStorageKey) || defaultDiagnosisId;
}

export function setStoredDiagnosisId(diagnosisId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(diagnosisStorageKey, diagnosisId);
}

export function canManageData(role: UserRole) {
  return protectedRoles.includes(role);
}

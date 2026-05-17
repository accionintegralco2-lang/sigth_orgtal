"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { alertasPiloto, dependencias, entrevistas, funciones, personal } from "@/data/mock-data";
import type { Alert, Dependencia, Entrevista, Evidencia, Funcion, Persona, UserRole } from "@/types";

type OrgDataContextValue = {
  dependencias: Dependencia[];
  personal: Persona[];
  funciones: Funcion[];
  entrevistas: Entrevista[];
  evidencias: Evidencia[];
  alertas: Alert[];
  workspaceMode: "piloto" | "propio";
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  addDependencia: (item: Omit<Dependencia, "id">) => void;
  addPersona: (item: Omit<Persona, "id">) => void;
  addPersonas: (items: Array<Omit<Persona, "id">>) => void;
  addFuncion: (item: Omit<Funcion, "id">) => void;
  addFunciones: (items: Array<Omit<Funcion, "id">>) => void;
  addEntrevista: (item: Omit<Entrevista, "id">) => void;
  addEvidencia: (item: Omit<Evidencia, "id">) => void;
  removeDependencia: (id: string) => void;
  removePersona: (id: string) => void;
  removeFuncion: (id: string) => void;
  removeEntrevista: (id: string) => void;
  removeEvidencia: (id: string) => void;
  resetDemoData: () => void;
  startNewDiagnosis: (item: Omit<Dependencia, "id">) => void;
  exportWorkspace: () => WorkspaceBackup;
  importWorkspace: (backup: WorkspaceBackup) => void;
};

const storageKey = "orgtalsigth-demo-data-v4";
const OrgDataContext = createContext<OrgDataContextValue | null>(null);

export type WorkspaceBackup = {
  version: 1;
  exportedAt: string;
  workspaceMode: "piloto" | "propio";
  activeRole: UserRole;
  dependencias: Dependencia[];
  personal: Persona[];
  funciones: Funcion[];
  entrevistas: Entrevista[];
  evidencias: Evidencia[];
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function OrgDataProvider({ children }: { children: ReactNode }) {
  const [depsState, setDepsState] = useState<Dependencia[]>(dependencias);
  const [peopleState, setPeopleState] = useState<Persona[]>(personal);
  const [functionsState, setFunctionsState] = useState<Funcion[]>(funciones);
  const [interviewsState, setInterviewsState] = useState<Entrevista[]>(entrevistas);
  const [evidenceState, setEvidenceState] = useState<Evidencia[]>([]);
  const [alertsState] = useState<Alert[]>(alertasPiloto);
  const [workspaceMode, setWorkspaceMode] = useState<"piloto" | "propio">("piloto");
  const [activeRole, setActiveRole] = useState<UserRole>("Administrador");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored) as {
        dependencias?: Dependencia[];
        personal?: Persona[];
        funciones?: Funcion[];
        entrevistas?: Entrevista[];
        evidencias?: Evidencia[];
        workspaceMode?: "piloto" | "propio";
        activeRole?: UserRole;
      };
      setDepsState(parsed.dependencias?.length ? parsed.dependencias : dependencias);
      setPeopleState(parsed.personal?.length ? parsed.personal : personal);
      setFunctionsState(parsed.funciones?.length ? parsed.funciones : funciones);
      setInterviewsState(parsed.entrevistas?.length ? parsed.entrevistas : entrevistas);
      setEvidenceState(parsed.evidencias ?? []);
      setWorkspaceMode(parsed.workspaceMode ?? "piloto");
      setActiveRole(parsed.activeRole ?? "Administrador");
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        dependencias: depsState,
        personal: peopleState,
        funciones: functionsState,
        entrevistas: interviewsState,
        evidencias: evidenceState,
        workspaceMode,
        activeRole
      })
    );
  }, [activeRole, depsState, evidenceState, functionsState, interviewsState, isReady, peopleState, workspaceMode]);

  const value = useMemo<OrgDataContextValue>(
    () => ({
      dependencias: depsState,
      personal: peopleState,
      funciones: functionsState,
      entrevistas: interviewsState,
      evidencias: evidenceState,
      alertas: alertsState,
      workspaceMode,
      activeRole,
      setActiveRole,
      addDependencia: (item) => setDepsState((current) => [{ ...item, id: makeId("dep") }, ...current]),
      addPersona: (item) => setPeopleState((current) => [{ ...item, id: makeId("per") }, ...current]),
      addPersonas: (items) =>
        setPeopleState((current) => [
          ...items.map((item, index) => ({ ...item, id: makeId(`per-${index}`) })),
          ...current
        ]),
      addFuncion: (item) => setFunctionsState((current) => [{ ...item, id: makeId("fun") }, ...current]),
      addFunciones: (items) =>
        setFunctionsState((current) => [
          ...items.map((item, index) => ({ ...item, id: makeId(`fun-${index}`) })),
          ...current
        ]),
      addEntrevista: (item) => setInterviewsState((current) => [{ ...item, id: makeId("ent") }, ...current]),
      addEvidencia: (item) => setEvidenceState((current) => [{ ...item, id: makeId("evi") }, ...current]),
      removeDependencia: (id) => setDepsState((current) => current.filter((item) => item.id !== id)),
      removePersona: (id) => setPeopleState((current) => current.filter((item) => item.id !== id)),
      removeFuncion: (id) => setFunctionsState((current) => current.filter((item) => item.id !== id)),
      removeEntrevista: (id) => setInterviewsState((current) => current.filter((item) => item.id !== id)),
      removeEvidencia: (id) => setEvidenceState((current) => current.filter((item) => item.id !== id)),
      resetDemoData: () => {
        setDepsState(dependencias);
        setPeopleState(personal);
        setFunctionsState(funciones);
        setInterviewsState(entrevistas);
        setEvidenceState([]);
        setWorkspaceMode("piloto");
        setActiveRole("Administrador");
        window.localStorage.removeItem(storageKey);
      },
      startNewDiagnosis: (item) => {
        setDepsState([{ ...item, id: makeId("dep") }]);
        setPeopleState([]);
        setFunctionsState([]);
        setInterviewsState([]);
        setEvidenceState([]);
        setWorkspaceMode("propio");
        setActiveRole("Administrador");
      },
      exportWorkspace: () => ({
        version: 1,
        exportedAt: new Date().toISOString(),
        workspaceMode,
        activeRole,
        dependencias: depsState,
        personal: peopleState,
        funciones: functionsState,
        entrevistas: interviewsState,
        evidencias: evidenceState
      }),
      importWorkspace: (backup) => {
        setDepsState(Array.isArray(backup.dependencias) ? backup.dependencias : []);
        setPeopleState(Array.isArray(backup.personal) ? backup.personal : []);
        setFunctionsState(Array.isArray(backup.funciones) ? backup.funciones : []);
        setInterviewsState(Array.isArray(backup.entrevistas) ? backup.entrevistas : []);
        setEvidenceState(Array.isArray(backup.evidencias) ? backup.evidencias : []);
        setWorkspaceMode(backup.workspaceMode ?? "propio");
        setActiveRole(backup.activeRole ?? "Administrador");
      }
    }),
    [activeRole, alertsState, depsState, evidenceState, functionsState, interviewsState, peopleState, workspaceMode]
  );

  return <OrgDataContext.Provider value={value}>{children}</OrgDataContext.Provider>;
}

export function useOrgData() {
  const context = useContext(OrgDataContext);
  if (!context) {
    throw new Error("useOrgData must be used inside OrgDataProvider");
  }
  return context;
}

"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { alertasPiloto, dependencias, entrevistas, funciones, personal } from "@/data/mock-data";
import { deleteDependencyRecord, fetchDependencyRecords, saveDependencyRecord } from "@/lib/dependency-repository";
import { deleteEvidenceRecord, fetchEvidenceRecords, saveEvidenceRecord } from "@/lib/evidence-repository";
import { deleteFunctionRecord, fetchFunctionRecords, saveFunctionRecord, saveFunctionRecords } from "@/lib/function-repository";
import { deletePersonnelRecord, fetchPersonnelRecords, savePersonnelRecord, savePersonnelRecords } from "@/lib/personnel-repository";
import { isSupabaseConfigured } from "@/lib/supabase";
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
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
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
    if (!isSupabaseConfigured) return;
    fetchDependencyRecords()
      .then((records) => {
        if (records.length) {
          setDepsState(records);
          setWorkspaceMode("propio");
        }
      })
      .catch((error) => {
        console.warn("No se pudieron cargar dependencias desde Supabase", error);
      });

    fetchPersonnelRecords()
      .then((records) => {
        if (records.length) {
          setPeopleState(records);
          setWorkspaceMode("propio");
        }
      })
      .catch((error) => {
        console.warn("No se pudo cargar personal desde Supabase", error);
      });

    fetchFunctionRecords()
      .then((records) => {
        if (records.length) {
          setFunctionsState(records);
          setWorkspaceMode("propio");
        }
      })
      .catch((error) => {
        console.warn("No se pudieron cargar funciones desde Supabase", error);
      });

    fetchEvidenceRecords()
      .then((records) => {
        if (records.length) {
          setEvidenceState(records);
        }
      })
      .catch((error) => {
        console.warn("No se pudieron cargar evidencias desde Supabase", error);
      });
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
      addDependencia: (item) => {
        const dependencia = { ...item, id: makeId("dep") };
        setDepsState((current) => [dependencia, ...current]);
        setWorkspaceMode("propio");
        saveDependencyRecord(dependencia).catch((error) => {
          console.warn("No se pudo guardar la dependencia en Supabase", error);
        });
      },
      addPersona: (item) => {
        const persona = { ...item, id: makeId("per") };
        setPeopleState((current) => [persona, ...current]);
        setWorkspaceMode("propio");
        savePersonnelRecord(persona).catch((error) => {
          console.warn("No se pudo guardar el personal en Supabase", error);
        });
      },
      addPersonas: (items) => {
        const personas = items.map((item, index) => ({ ...item, id: makeId(`per-${index}`) }));
        setPeopleState((current) => [...personas, ...current]);
        setWorkspaceMode("propio");
        savePersonnelRecords(personas).catch((error) => {
          console.warn("No se pudo guardar la carga masiva de personal en Supabase", error);
        });
      },
      addFuncion: (item) => {
        const funcion = { ...item, id: makeId("fun") };
        setFunctionsState((current) => [funcion, ...current]);
        setWorkspaceMode("propio");
        saveFunctionRecord(funcion).catch((error) => {
          console.warn("No se pudo guardar la funcion en Supabase", error);
        });
      },
      addFunciones: (items) => {
        const nuevasFunciones = items.map((item, index) => ({ ...item, id: makeId(`fun-${index}`) }));
        setFunctionsState((current) => [...nuevasFunciones, ...current]);
        setWorkspaceMode("propio");
        saveFunctionRecords(nuevasFunciones).catch((error) => {
          console.warn("No se pudo guardar la carga masiva de funciones en Supabase", error);
        });
      },
      addEntrevista: (item) => setInterviewsState((current) => [{ ...item, id: makeId("ent") }, ...current]),
      addEvidencia: (item) => {
        const evidence = { ...item, id: makeId("evi") };
        setEvidenceState((current) => [evidence, ...current]);
        saveEvidenceRecord(evidence).catch((error) => {
          console.warn("No se pudo guardar la evidencia en Supabase", error);
        });
      },
      removeDependencia: (id) => {
        setDepsState((current) => current.filter((item) => item.id !== id));
        deleteDependencyRecord(id).catch((error) => {
          console.warn("No se pudo eliminar la dependencia en Supabase", error);
        });
      },
      removePersona: (id) => {
        setPeopleState((current) => current.filter((item) => item.id !== id));
        deletePersonnelRecord(id).catch((error) => {
          console.warn("No se pudo eliminar el personal en Supabase", error);
        });
      },
      removeFuncion: (id) => {
        setFunctionsState((current) => current.filter((item) => item.id !== id));
        deleteFunctionRecord(id).catch((error) => {
          console.warn("No se pudo eliminar la funcion en Supabase", error);
        });
      },
      removeEntrevista: (id) => setInterviewsState((current) => current.filter((item) => item.id !== id)),
      removeEvidencia: (id) => {
        setEvidenceState((current) => current.filter((item) => item.id !== id));
        deleteEvidenceRecord(id).catch((error) => {
          console.warn("No se pudo eliminar la evidencia en Supabase", error);
        });
      },
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
        const dependencia = { ...item, id: makeId("dep") };
        setDepsState([dependencia]);
        setPeopleState([]);
        setFunctionsState([]);
        setInterviewsState([]);
        setEvidenceState([]);
        setWorkspaceMode("propio");
        setActiveRole("Administrador");
        saveDependencyRecord(dependencia).catch((error) => {
          console.warn("No se pudo guardar la nueva dependencia en Supabase", error);
        });
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

  if (!hasMounted || !isReady) {
    return (
      <div className="app-loading-screen">
        <strong>SIGTH_ORGTAL</strong>
        <span>Preparando diagnostico institucional...</span>
      </div>
    );
  }

  return <OrgDataContext.Provider value={value}>{children}</OrgDataContext.Provider>;
}

export function useOrgData() {
  const context = useContext(OrgDataContext);
  if (!context) {
    throw new Error("useOrgData must be used inside OrgDataProvider");
  }
  return context;
}

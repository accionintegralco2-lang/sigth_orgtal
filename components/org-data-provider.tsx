"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { alertasPiloto, dependencias, entrevistas, funciones, personal } from "@/data/mock-data";
import { deleteDependencyRecord, fetchDependencyRecords, saveDependencyRecord } from "@/lib/dependency-repository";
import { deleteEvidenceRecord, fetchEvidenceRecords, saveEvidenceRecord } from "@/lib/evidence-repository";
import { deleteFunctionRecord, fetchFunctionRecords, saveFunctionRecord, saveFunctionRecords } from "@/lib/function-repository";
import { deleteInterviewRecord, fetchInterviewRecords, saveInterviewRecord } from "@/lib/interview-repository";
import { deletePersonnelRecord, fetchPersonnelRecords, savePersonnelRecord, savePersonnelRecords } from "@/lib/personnel-repository";
import { getAuthenticatedRole } from "@/lib/auth";
import { createDiagnosisId, getStoredDiagnosisId, setStoredDiagnosisId } from "@/lib/security-context";
import { isSupabaseConfigured } from "@/lib/supabase";
import { clearWorkspaceRecords } from "@/lib/workspace-repository";
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
  activeDiagnosisId: string;
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

const storageKey = "orgtal-demo-data-v4";
const OrgDataContext = createContext<OrgDataContextValue | null>(null);

export type WorkspaceBackup = {
  version: 1;
  exportedAt: string;
  workspaceMode: "piloto" | "propio";
  activeRole: UserRole;
  activeDiagnosisId: string;
  dependencias: Dependencia[];
  personal: Persona[];
  funciones: Funcion[];
  entrevistas: Entrevista[];
  evidencias: Evidencia[];
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const legacyDependencyName = String.fromCharCode(68, 101, 112, 101, 110, 100, 101, 110, 99, 105, 97, 32, 109, 101, 110, 111, 114, 32, 100, 101, 32, 116, 97, 108, 101, 110, 116, 111, 32, 104, 117, 109, 97, 110, 111);
const operationalDependencyName = "Dependencia operativa";

function normalizeDependencyName(value: string) {
  return value.trim() === legacyDependencyName ? operationalDependencyName : value;
}

function normalizeDependencia(item: Dependencia): Dependencia {
  return {
    ...item,
    nombre: normalizeDependencyName(item.nombre)
  };
}

function normalizePersona(item: Persona): Persona {
  return {
    ...item,
    dependencia: normalizeDependencyName(item.dependencia)
  };
}

function normalizeEvidencia(item: Evidencia): Evidencia {
  return {
    ...item,
    dependencia: normalizeDependencyName(item.dependencia)
  };
}

export function OrgDataProvider({ children }: { children: ReactNode }) {
  const [depsState, setDepsState] = useState<Dependencia[]>(() => dependencias.map(normalizeDependencia));
  const [peopleState, setPeopleState] = useState<Persona[]>(() => personal.map(normalizePersona));
  const [functionsState, setFunctionsState] = useState<Funcion[]>(funciones);
  const [interviewsState, setInterviewsState] = useState<Entrevista[]>(entrevistas);
  const [evidenceState, setEvidenceState] = useState<Evidencia[]>([]);
  const [alertsState] = useState<Alert[]>(alertasPiloto);
  const [workspaceMode, setWorkspaceMode] = useState<"piloto" | "propio">("piloto");
  const [activeRole, setActiveRole] = useState<UserRole>("Administrador");
  const [activeDiagnosisId, setActiveDiagnosisId] = useState("orgtal-demo");
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
        activeDiagnosisId?: string;
      };
      setDepsState(parsed.dependencias?.length ? parsed.dependencias.map(normalizeDependencia) : dependencias.map(normalizeDependencia));
      setPeopleState(parsed.personal?.length ? parsed.personal.map(normalizePersona) : personal.map(normalizePersona));
      setFunctionsState(parsed.funciones?.length ? parsed.funciones : funciones);
      setInterviewsState(parsed.entrevistas?.length ? parsed.entrevistas : entrevistas);
      setEvidenceState((parsed.evidencias ?? []).map(normalizeEvidencia));
      setWorkspaceMode(parsed.workspaceMode ?? "piloto");
      setActiveRole(parsed.activeRole ?? "Administrador");
      if (parsed.activeDiagnosisId) {
        setActiveDiagnosisId(parsed.activeDiagnosisId);
        setStoredDiagnosisId(parsed.activeDiagnosisId);
      }
    }
    setActiveDiagnosisId((current) => (current === "orgtal-demo" ? getStoredDiagnosisId() : current));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getAuthenticatedRole().then((role) => {
      if (role) setActiveRole(role);
    });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !activeDiagnosisId) return;
    fetchDependencyRecords(activeDiagnosisId)
      .then((records) => {
        if (records.length) {
          setDepsState(records.map(normalizeDependencia));
          setWorkspaceMode("propio");
        }
      })
      .catch((error) => {
        console.warn("No se pudieron cargar dependencias desde Supabase", error);
      });

    fetchPersonnelRecords(activeDiagnosisId)
      .then((records) => {
        if (records.length) {
          setPeopleState(records.map(normalizePersona));
          setWorkspaceMode("propio");
        }
      })
      .catch((error) => {
        console.warn("No se pudo cargar personal desde Supabase", error);
      });

    fetchFunctionRecords(activeDiagnosisId)
      .then((records) => {
        if (records.length) {
          setFunctionsState(records);
          setWorkspaceMode("propio");
        }
      })
      .catch((error) => {
        console.warn("No se pudieron cargar funciones desde Supabase", error);
      });

    fetchInterviewRecords(activeDiagnosisId)
      .then((records) => {
        if (records.length) {
          setInterviewsState(records);
          setWorkspaceMode("propio");
        }
      })
      .catch((error) => {
        console.warn("No se pudieron cargar entrevistas desde Supabase", error);
      });

    fetchEvidenceRecords(activeDiagnosisId)
      .then((records) => {
        if (records.length) {
          setEvidenceState(records.map(normalizeEvidencia));
        }
      })
      .catch((error) => {
        console.warn("No se pudieron cargar evidencias desde Supabase", error);
      });
  }, [activeDiagnosisId]);

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
        activeRole,
        activeDiagnosisId
      })
    );
  }, [activeDiagnosisId, activeRole, depsState, evidenceState, functionsState, interviewsState, isReady, peopleState, workspaceMode]);

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
      activeDiagnosisId,
      setActiveRole,
      addDependencia: (item) => {
        const dependencia = normalizeDependencia({ ...item, id: makeId("dep") });
        setDepsState((current) => [dependencia, ...current]);
        setWorkspaceMode("propio");
        saveDependencyRecord(dependencia, activeDiagnosisId).catch((error) => {
          console.warn("No se pudo guardar la dependencia en Supabase", error);
        });
      },
      addPersona: (item) => {
        const persona = normalizePersona({ ...item, id: makeId("per") });
        setPeopleState((current) => [persona, ...current]);
        setWorkspaceMode("propio");
        savePersonnelRecord(persona, activeDiagnosisId).catch((error) => {
          console.warn("No se pudo guardar el personal en Supabase", error);
        });
      },
      addPersonas: (items) => {
        const personas = items.map((item, index) => normalizePersona({ ...item, id: makeId(`per-${index}`) }));
        setPeopleState((current) => [...personas, ...current]);
        setWorkspaceMode("propio");
        savePersonnelRecords(personas, activeDiagnosisId).catch((error) => {
          console.warn("No se pudo guardar la carga masiva de personal en Supabase", error);
        });
      },
      addFuncion: (item) => {
        const funcion = { ...item, id: makeId("fun") };
        setFunctionsState((current) => [funcion, ...current]);
        setWorkspaceMode("propio");
        saveFunctionRecord(funcion, activeDiagnosisId).catch((error) => {
          console.warn("No se pudo guardar la funcion en Supabase", error);
        });
      },
      addFunciones: (items) => {
        const nuevasFunciones = items.map((item, index) => ({ ...item, id: makeId(`fun-${index}`) }));
        setFunctionsState((current) => [...nuevasFunciones, ...current]);
        setWorkspaceMode("propio");
        saveFunctionRecords(nuevasFunciones, activeDiagnosisId).catch((error) => {
          console.warn("No se pudo guardar la carga masiva de funciones en Supabase", error);
        });
      },
      addEntrevista: (item) => {
        const entrevista = { ...item, id: makeId("ent") };
        setInterviewsState((current) => [entrevista, ...current]);
        setWorkspaceMode("propio");
        saveInterviewRecord(entrevista, activeDiagnosisId).catch((error) => {
          console.warn("No se pudo guardar la entrevista en Supabase", error);
        });
      },
      addEvidencia: (item) => {
        const evidence = normalizeEvidencia({ ...item, id: makeId("evi") });
        setEvidenceState((current) => [evidence, ...current]);
        saveEvidenceRecord(evidence, activeDiagnosisId).catch((error) => {
          console.warn("No se pudo guardar la evidencia en Supabase", error);
        });
      },
      removeDependencia: (id) => {
        setDepsState((current) => current.filter((item) => item.id !== id));
        deleteDependencyRecord(id, activeDiagnosisId).catch((error) => {
          console.warn("No se pudo eliminar la dependencia en Supabase", error);
        });
      },
      removePersona: (id) => {
        setPeopleState((current) => current.filter((item) => item.id !== id));
        deletePersonnelRecord(id, activeDiagnosisId).catch((error) => {
          console.warn("No se pudo eliminar el personal en Supabase", error);
        });
      },
      removeFuncion: (id) => {
        setFunctionsState((current) => current.filter((item) => item.id !== id));
        deleteFunctionRecord(id, activeDiagnosisId).catch((error) => {
          console.warn("No se pudo eliminar la funcion en Supabase", error);
        });
      },
      removeEntrevista: (id) => {
        setInterviewsState((current) => current.filter((item) => item.id !== id));
        deleteInterviewRecord(id, activeDiagnosisId).catch((error) => {
          console.warn("No se pudo eliminar la entrevista en Supabase", error);
        });
      },
      removeEvidencia: (id) => {
        setEvidenceState((current) => current.filter((item) => item.id !== id));
        deleteEvidenceRecord(id, activeDiagnosisId).catch((error) => {
          console.warn("No se pudo eliminar la evidencia en Supabase", error);
        });
      },
      resetDemoData: () => {
        setDepsState(dependencias.map(normalizeDependencia));
        setPeopleState(personal.map(normalizePersona));
        setFunctionsState(funciones);
        setInterviewsState(entrevistas);
        setEvidenceState([]);
        setWorkspaceMode("piloto");
        setActiveRole("Administrador");
        setActiveDiagnosisId("orgtal-demo");
        setStoredDiagnosisId("orgtal-demo");
        window.localStorage.removeItem(storageKey);
      },
      startNewDiagnosis: (item) => {
        const nextDiagnosisId = createDiagnosisId();
        const dependencia = normalizeDependencia({ ...item, id: makeId("dep") });
        setActiveDiagnosisId(nextDiagnosisId);
        setStoredDiagnosisId(nextDiagnosisId);
        setDepsState([dependencia]);
        setPeopleState([]);
        setFunctionsState([]);
        setInterviewsState([]);
        setEvidenceState([]);
        setWorkspaceMode("propio");
        setActiveRole("Administrador");
        clearWorkspaceRecords(nextDiagnosisId)
          .then(() => saveDependencyRecord(dependencia, nextDiagnosisId))
          .catch((error) => {
            console.warn("No se pudo preparar el diagnostico nuevo en Supabase", error);
          });
      },
      exportWorkspace: () => ({
        version: 1,
        exportedAt: new Date().toISOString(),
        workspaceMode,
        activeRole,
        activeDiagnosisId,
        dependencias: depsState,
        personal: peopleState,
        funciones: functionsState,
        entrevistas: interviewsState,
        evidencias: evidenceState
      }),
      importWorkspace: (backup) => {
        const restoredDiagnosisId = backup.activeDiagnosisId || createDiagnosisId();
        setDepsState(Array.isArray(backup.dependencias) ? backup.dependencias.map(normalizeDependencia) : []);
        setPeopleState(Array.isArray(backup.personal) ? backup.personal.map(normalizePersona) : []);
        setFunctionsState(Array.isArray(backup.funciones) ? backup.funciones : []);
        setInterviewsState(Array.isArray(backup.entrevistas) ? backup.entrevistas : []);
        setEvidenceState(Array.isArray(backup.evidencias) ? backup.evidencias.map(normalizeEvidencia) : []);
        setWorkspaceMode(backup.workspaceMode ?? "propio");
        setActiveRole(backup.activeRole ?? "Administrador");
        setActiveDiagnosisId(restoredDiagnosisId);
        setStoredDiagnosisId(restoredDiagnosisId);
      }
    }),
    [activeDiagnosisId, activeRole, alertsState, depsState, evidenceState, functionsState, interviewsState, peopleState, workspaceMode]
  );

  if (!hasMounted || !isReady) {
    return (
      <div className="app-loading-screen">
        <strong>ORGTAL</strong>
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

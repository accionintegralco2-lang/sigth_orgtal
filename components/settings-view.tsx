"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useOrgData, type WorkspaceBackup } from "@/components/org-data-provider";
import { buildDataQualitySummary } from "@/lib/data-quality";
import { dependencyTemplates, templateToForm } from "@/lib/dependency-templates";
import { supabaseStatus, testSupabaseEvidenceStorage } from "@/lib/supabase";
import type { Funcion, Persona, RiskLevel } from "@/types";

const initialDiagnosis = {
  nombre: "",
  jefe: "",
  mision: "",
  procesos: "",
  personas: 0,
  criticidad: "Media",
  estado: "Seguimiento"
};

type CsvRow = Record<string, string>;
type BulkTarget = "personal" | "funciones";
type BulkIssue = {
  row: number;
  type: "error" | "warning";
  message: string;
};
type BulkPreview =
  | {
      target: "personal";
      fileName: string;
      rows: CsvRow[];
      items: Array<Omit<Persona, "id">>;
      issues: BulkIssue[];
    }
  | {
      target: "funciones";
      fileName: string;
      rows: CsvRow[];
      items: Array<Omit<Funcion, "id">>;
      issues: BulkIssue[];
    };
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function SettingsView() {
  const {
    dependencias,
    personal,
    funciones,
    entrevistas,
    evidencias,
    workspaceMode,
    addFunciones,
    addPersonas,
    exportWorkspace,
    importWorkspace,
    resetDemoData,
    startNewDiagnosis
  } = useOrgData();
  const [form, setForm] = useState(initialDiagnosis);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkPreview, setBulkPreview] = useState<BulkPreview | null>(null);
  const [supabaseTestMessage, setSupabaseTestMessage] = useState("");
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installMessage, setInstallMessage] = useState("");
  const bulkErrors = bulkPreview?.issues.filter((issue) => issue.type === "error") ?? [];
  const bulkWarnings = bulkPreview?.issues.filter((issue) => issue.type === "warning") ?? [];
  const qualitySummary = buildDataQualitySummary({
    dependencias,
    personal,
    funciones,
    entrevistas,
    evidencias,
    alertas: []
  });
  const productionChecks = [
    {
      label: "Base de datos Supabase",
      ready: supabaseStatus.configured,
      detail: supabaseStatus.configured ? "Variables configuradas" : "Faltan variables en Vercel o .env.local",
      action: "Configurar Supabase"
    },
    {
      label: "Dependencia activa",
      ready: dependencias.length > 0,
      detail: `${dependencias.length} dependencia(s) registradas`,
      action: "Crear dependencia"
    },
    {
      label: "Personal cargado",
      ready: personal.length > 0,
      detail: `${personal.length} funcionario(s) cargados`,
      action: "Cargar personal"
    },
    {
      label: "Funciones registradas",
      ready: funciones.length > 0,
      detail: `${funciones.length} funcion(es) registradas`,
      action: "Cargar funciones"
    },
    {
      label: "Encuestas disponibles",
      ready: entrevistas.length > 0,
      detail: `${entrevistas.length} instrumento(s) registrados`,
      action: "Crear encuesta"
    },
    {
      label: "Evidencias",
      ready: evidencias.length > 0,
      detail: `${evidencias.length} soporte(s) documentales`,
      action: "Agregar evidencia"
    },
    {
      label: "Calidad de datos",
      ready: qualitySummary.criticalIssues === 0,
      detail: qualitySummary.criticalIssues
        ? `${qualitySummary.criticalIssues} dato(s) criticos pendientes`
        : `Calidad ${qualitySummary.score}%`,
      action: "Corregir datos"
    }
  ];
  const productionReadyCount = productionChecks.filter((item) => item.ready).length;
  const productionScore = Math.round((productionReadyCount / productionChecks.length) * 100);

  useEffect(() => {
    function captureInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
      setInstallMessage("La app esta lista para instalarse en este dispositivo.");
    }

    function markInstalled() {
      setInstallPrompt(null);
      setInstallMessage("SIGTH_ORGTAL ya quedo instalada en este dispositivo.");
    }

    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", markInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  function submitNewDiagnosis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.nombre.trim()) return;
    startNewDiagnosis({
      nombre: form.nombre.trim(),
      jefe: form.jefe.trim() || "Pendiente",
      mision: form.mision.trim() || "Pendiente por documentar",
      procesos: form.procesos
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      personas: Number(form.personas) || 0,
      criticidad: form.criticidad,
      estado: form.estado
    });
    setForm(initialDiagnosis);
    setConfirmReset(false);
  }

  function downloadBackup() {
    const backup = exportWorkspace();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sigth_orgtal-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as WorkspaceBackup;
        if (!parsed.version || !Array.isArray(parsed.dependencias)) {
          setImportMessage("El archivo no parece ser un respaldo valido de SIGTH_ORGTAL.");
          return;
        }
        importWorkspace(parsed);
        setImportMessage("Respaldo importado correctamente.");
      } catch {
        setImportMessage("No se pudo leer el archivo. Verifica que sea JSON valido.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function downloadCsv(filename: string, rows: string[][]) {
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function parseCsvLine(line: string, separator: string) {
    const values: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === '"' && next === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === separator && !insideQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  function parseCsv(text: string): CsvRow[] {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length < 2) return [];
    const separator = lines[0].includes(";") ? ";" : ",";
    const headers = parseCsvLine(lines[0], separator).map((item) => item.replaceAll('"', "").trim());
    return lines.slice(1).map((line) => {
      const values = parseCsvLine(line, separator).map((item) => item.replaceAll('"', "").trim());
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    });
  }

  function downloadPersonalTemplate() {
    downloadCsv("plantilla-personal-sigth_orgtal.csv", [
      ["codigo", "nombre", "cargo", "dependencia", "formacion", "experiencia", "tiempoCargo", "funciones", "complejidad", "cargaLaboral", "competenciaTecnica", "competenciaDigital", "competenciaComportamental", "fortalezas"],
      ["P01", "Nombre funcionario", "Cargo", dependencias[0]?.nombre ?? "Dependencia", "Formacion", "5 anos", "1 ano", "3", "Media", "50", "4", "4", "4", "Fortalezas principales"]
    ]);
  }

  function downloadFunctionsTemplate() {
    downloadCsv("plantilla-funciones-sigth_orgtal.csv", [
      ["codigo", "nombre", "responsable", "respaldo", "tipo", "proceso", "producto", "frecuencia", "horasSemana", "ipf", "nivelIpf", "estado", "riesgo", "observaciones"],
      ["F01", "Nombre de la funcion", "P01", "P02", "Misional", "Proceso", "Producto", "Semanal", "4", "4.2", "Alta", "Cubierta", "alto", "Observacion"]
    ]);
  }

  function normalizeRisk(value: string): RiskLevel {
    return ["bajo", "moderado", "alto", "critico"].includes(value.toLowerCase())
      ? (value.toLowerCase() as RiskLevel)
      : "moderado";
  }

  function validatePersonalRows(rows: CsvRow[]) {
    const dependencyNames = new Set(dependencias.map((item) => item.nombre));
    const seenCodes = new Set<string>();
    const issues: BulkIssue[] = [];
    const items: Array<Omit<Persona, "id">> = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const codigo = row.codigo?.trim();
      const nombre = row.nombre?.trim();
      const cargo = row.cargo?.trim();
      const dependencia = row.dependencia?.trim() || dependencias[0]?.nombre || "Sin dependencia";

      if (!nombre && !codigo) issues.push({ row: rowNumber, type: "error", message: "Falta nombre o codigo del funcionario." });
      if (!cargo) issues.push({ row: rowNumber, type: "error", message: "Falta cargo del funcionario." });
      if (!dependencyNames.has(dependencia)) {
        issues.push({ row: rowNumber, type: "warning", message: `La dependencia "${dependencia}" no existe aun.` });
      }
      if (codigo && seenCodes.has(codigo)) {
        issues.push({ row: rowNumber, type: "warning", message: `El codigo ${codigo} esta repetido en el archivo.` });
      }
      if (codigo) seenCodes.add(codigo);

      items.push({
        codigo,
        nombre: nombre || codigo || "Sin nombre",
        cargo: cargo || "Sin cargo",
        dependencia,
        formacion: row.formacion?.trim(),
        experiencia: row.experiencia?.trim() || "Sin registrar",
        tiempoCargo: row.tiempoCargo?.trim() || "Sin registrar",
        funciones: Number(row.funciones) || 0,
        complejidad: row.complejidad?.trim() || "Media",
        cargaLaboral: Number(row.cargaLaboral) || 0,
        competenciaTecnica: Number(row.competenciaTecnica) || undefined,
        competenciaDigital: Number(row.competenciaDigital) || undefined,
        competenciaComportamental: Number(row.competenciaComportamental) || undefined,
        fortalezas: row.fortalezas?.trim()
      });
    });

    return { items, issues };
  }

  function validateFunctionRows(rows: CsvRow[]) {
    const personCodes = new Set(personal.map((item) => item.codigo || item.nombre));
    const issues: BulkIssue[] = [];
    const items: Array<Omit<Funcion, "id">> = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const codigo = row.codigo?.trim();
      const nombre = row.nombre?.trim();
      const responsable = row.responsable?.trim() || "";
      const respaldo = row.respaldo?.trim();

      if (!nombre && !codigo) issues.push({ row: rowNumber, type: "error", message: "Falta nombre o codigo de la funcion." });
      if (!responsable) {
        issues.push({ row: rowNumber, type: "warning", message: "La funcion quedara sin responsable." });
      } else if (!personCodes.has(responsable)) {
        issues.push({ row: rowNumber, type: "warning", message: `El responsable ${responsable} no coincide con personal cargado.` });
      }
      if (respaldo && !personCodes.has(respaldo)) {
        issues.push({ row: rowNumber, type: "warning", message: `El respaldo ${respaldo} no coincide con personal cargado.` });
      }

      items.push({
        codigo,
        nombre: nombre || codigo || "Sin nombre",
        responsable,
        respaldo,
        tipo: row.tipo?.trim() || "Real y asignada",
        proceso: row.proceso?.trim(),
        producto: row.producto?.trim(),
        frecuencia: row.frecuencia?.trim() || "Semanal",
        horasSemana: Number(row.horasSemana) || undefined,
        ipf: Number(row.ipf) || undefined,
        nivelIpf: row.nivelIpf?.trim(),
        estado: row.estado?.trim(),
        riesgo: normalizeRisk(row.riesgo || "moderado"),
        observaciones: row.observaciones?.trim()
      });
    });

    return { items, issues };
  }

  function reviewCsv(event: ChangeEvent<HTMLInputElement>, target: BulkTarget) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBulkMessage("");
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result)).filter((row) => Object.values(row).some(Boolean));
      if (!rows.length) {
        setBulkPreview(null);
        setBulkMessage("El archivo no contiene registros para revisar.");
        return;
      }

      if (target === "personal") {
        const result = validatePersonalRows(rows);
        setBulkPreview({ target, fileName: file.name, rows, ...result });
      } else {
        const result = validateFunctionRows(rows);
        setBulkPreview({ target, fileName: file.name, rows, ...result });
      }
      setBulkMessage("Archivo revisado. Confirma la importacion si no hay errores.");
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function confirmBulkImport() {
    if (!bulkPreview || bulkErrors.length) return;

    if (bulkPreview.target === "personal") {
      addPersonas(bulkPreview.items);
      setBulkMessage(`Personal importado: ${bulkPreview.items.length} registros.`);
    } else {
      addFunciones(bulkPreview.items);
      setBulkMessage(`Funciones importadas: ${bulkPreview.items.length} registros.`);
    }

    setBulkPreview(null);
  }

  async function testSupabaseConnection() {
    setIsTestingSupabase(true);
    const result = await testSupabaseEvidenceStorage();
    setSupabaseTestMessage(result.message);
    setIsTestingSupabase(false);
  }

  async function installApp() {
    if (!installPrompt) {
      setInstallMessage(
        "Si el boton no aparece disponible, usa el menu del navegador y selecciona Instalar app o Agregar a pantalla de inicio."
      );
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstallMessage(
      choice.outcome === "accepted"
        ? "Instalacion aceptada. SIGTH_ORGTAL quedara disponible como app en el dispositivo."
        : "Instalacion cancelada. Puedes intentarlo nuevamente desde el menu del navegador."
    );
  }

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Administracion del diagnostico</p>
            <h1>Configuracion</h1>
            <p>
              Cambia entre los datos piloto y un diagnostico propio para cargar
              una dependencia nueva sin mezclar informacion.
            </p>
          </div>
          <span className="status-pill">{workspaceMode === "piloto" ? "Modo piloto" : "Diagnostico propio"}</span>
        </section>

        <section className="panel setup-panel author-panel">
          <div className="panel-heading">
            <h2>Autor y derechos de creacion</h2>
            <span>Innovacion tecnologica</span>
          </div>
          <p>
            SIGTH_ORGTAL se presenta como una solucion de diagnostico organizacional
            basada en el modelo creado por Edwyn Arvey Lopez Acosta.
          </p>
          <div className="author-statement">
            <span>Derechos de autor, creacion e innovacion tecnologica</span>
            <strong>Edwyn Arvey Lopez Acosta</strong>
          </div>
        </section>

        <section className="function-summary-grid">
          <article>
            <span>Dependencias</span>
            <strong>{dependencias.length}</strong>
            <p>Areas activas en el diagnostico</p>
          </article>
          <article>
            <span>Personal</span>
            <strong>{personal.length}</strong>
            <p>Integrantes cargados</p>
          </article>
          <article>
            <span>Funciones</span>
            <strong>{funciones.length}</strong>
            <p>Funciones registradas</p>
          </article>
          <article>
            <span>Instrumentos</span>
            <strong>{entrevistas.length}</strong>
            <p>Entrevistas o encuestas</p>
          </article>
          <article>
            <span>Evidencias</span>
            <strong>{evidencias.length}</strong>
            <p>Soportes documentales</p>
          </article>
        </section>

        <section className={`panel setup-panel production-readiness ${productionScore >= 85 ? "ready" : "watch"}`}>
          <div className="panel-heading">
            <h2>Preparacion para uso externo</h2>
            <span>{productionScore}% listo</span>
          </div>
          <p>
            Control rapido para saber si SIGTH_ORGTAL esta listo para jueces,
            usuarios externos o carga de una dependencia nueva.
          </p>
          <div className="readiness-meter">
            <strong>{productionScore}%</strong>
            <span>{productionReadyCount} de {productionChecks.length} criterios completos</span>
            <div>
              <i style={{ width: `${productionScore}%` }} />
            </div>
          </div>
          <div className="readiness-grid">
            {productionChecks.map((check) => (
              <article className={check.ready ? "is-ready" : "is-pending"} key={check.label}>
                <span>{check.ready ? "Listo" : "Pendiente"}</span>
                <strong>{check.label}</strong>
                <p>{check.detail}</p>
                {!check.ready ? <small>{check.action}</small> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="panel setup-panel install-panel">
          <div className="panel-heading">
            <h2>Instalar aplicacion</h2>
            <span>PWA web</span>
          </div>
          <p>
            SIGTH_ORGTAL ya esta preparada para instalarse desde la URL publica
            en computadores y celulares compatibles, sin depender todavia de Play Store.
          </p>
          <div className="install-grid">
            <article className="install-card ready">
              <span>Estado</span>
              <strong>Instalable</strong>
              <p>Incluye manifiesto, icono institucional e inicio en dashboard.</p>
            </article>
            <article className="install-card">
              <span>Jueces</span>
              <strong>Acceso directo</strong>
              <p>Permite mostrar la app como producto web funcional durante la sustentacion.</p>
            </article>
            <article className="install-card">
              <span>Play Store</span>
              <strong>Siguiente fase</strong>
              <p>Despues de validar Supabase y roles se puede empaquetar como Android.</p>
            </article>
          </div>
          <div className="action-row">
            <button className="primary-action" type="button" onClick={installApp}>
              Instalar SIGTH_ORGTAL
            </button>
          </div>
          {installMessage ? <p className="import-message">{installMessage}</p> : null}
        </section>

        <section className="dashboard-grid">
          <article className="form-panel">
            <div className="panel-heading">
              <h2>Iniciar dependencia nueva</h2>
              <span>Diagnostico limpio</span>
            </div>
            <form className="record-form" onSubmit={submitNewDiagnosis}>
              <div className="quick-options wide-field">
                <span>Arrancar desde plantilla</span>
                <div className="template-option-grid">
                  {dependencyTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setForm({ ...templateToForm(template), jefe: form.jefe })}
                    >
                      <strong>{template.label}</strong>
                      <small>{template.procesos.slice(0, 3).join(" - ")}</small>
                    </button>
                  ))}
                </div>
              </div>
              <label>
                Nombre de la dependencia
                <input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
              </label>
              <label>
                Jefe responsable
                <input value={form.jefe} onChange={(event) => setForm({ ...form, jefe: event.target.value })} />
              </label>
              <label>
                Personas estimadas
                <input
                  min="0"
                  type="number"
                  value={form.personas}
                  onChange={(event) => setForm({ ...form, personas: Number(event.target.value) })}
                />
              </label>
              <label>
                Criticidad
                <select value={form.criticidad} onChange={(event) => setForm({ ...form, criticidad: event.target.value })}>
                  <option>Baja</option>
                  <option>Media</option>
                  <option>Alta</option>
                  <option>Critica</option>
                </select>
              </label>
              <label className="wide-field">
                Procesos principales
                <input
                  placeholder="Separar por comas"
                  value={form.procesos}
                  onChange={(event) => setForm({ ...form, procesos: event.target.value })}
                />
              </label>
              <label className="wide-field">
                Mision
                <textarea value={form.mision} onChange={(event) => setForm({ ...form, mision: event.target.value })} />
              </label>
              <button className="primary-action" type="submit">
                Crear diagnostico propio
              </button>
            </form>
          </article>

          <article className="panel setup-panel">
            <div className="panel-heading">
              <h2>Datos piloto</h2>
              <span>Restauracion segura</span>
            </div>
            <p>
              Usa esta opcion cuando quieras volver al modelo piloto cargado
              desde el archivo Excel. El diagnostico propio actual se reemplaza.
            </p>
            <label className="confirm-check">
              <input
                checked={confirmReset}
                type="checkbox"
                onChange={(event) => setConfirmReset(event.target.checked)}
              />
              Confirmo que deseo restaurar los datos piloto.
            </label>
            <button className="secondary-action" disabled={!confirmReset} type="button" onClick={resetDemoData}>
              Restaurar datos piloto
            </button>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel setup-panel">
            <div className="panel-heading">
              <h2>Respaldo del diagnostico</h2>
              <span>Exportar</span>
            </div>
            <p>
              Descarga un archivo JSON con los datos actuales para guardarlo,
              moverlo a otro equipo o conservar una version antes de hacer cambios.
            </p>
            <button className="primary-action" type="button" onClick={downloadBackup}>
              Descargar respaldo JSON
            </button>
          </article>

          <article className="panel setup-panel">
            <div className="panel-heading">
              <h2>Importar respaldo</h2>
              <span>Restaurar</span>
            </div>
            <p>
              Carga un respaldo generado por la app. Esta accion reemplaza los
              datos actuales del diagnostico.
            </p>
            <label className="file-import">
              Seleccionar respaldo JSON
              <input accept="application/json,.json" type="file" onChange={importBackup} />
            </label>
            {importMessage ? <p className="import-message">{importMessage}</p> : null}
          </article>
        </section>

        <section className="panel setup-panel">
          <div className="panel-heading">
            <h2>Estado de Supabase</h2>
            <span>{supabaseStatus.configured ? "Conectado" : "Modo local"}</span>
          </div>
          <div className="supabase-status-grid">
            <article className={supabaseStatus.configured ? "supabase-card ready" : "supabase-card watch"}>
              <span>Conexion</span>
              <strong>{supabaseStatus.configured ? "Activa" : "Pendiente"}</strong>
              <p>
                {supabaseStatus.configured
                  ? "La app ya tiene URL y llave publica para comunicarse con Supabase."
                  : "La app sigue funcionando en local. Para subir documentos reales falta configurar Supabase."}
              </p>
            </article>
            <article className="supabase-card">
              <span>Bucket evidencias</span>
              <strong>{supabaseStatus.evidenceBucket}</strong>
              <p>Este es el contenedor donde se guardaran documentos, soportes y anexos.</p>
            </article>
            <article className="supabase-card">
              <span>Archivo requerido</span>
              <strong>.env.local</strong>
              <p>Debe contener NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y el bucket.</p>
            </article>
          </div>
          <ol className="setup-steps">
            <li>Crear un proyecto en Supabase.</li>
            <li>Ejecutar el archivo supabase/schema.sql en el editor SQL de Supabase.</li>
            <li>Crear el archivo .env.local usando .env.local.example como guia.</li>
            <li>Reiniciar la app para activar la carga real de documentos.</li>
          </ol>
          <div className="action-row">
            <button className="secondary-action" disabled={isTestingSupabase} type="button" onClick={testSupabaseConnection}>
              {isTestingSupabase ? "Probando..." : "Probar conexion"}
            </button>
          </div>
          {supabaseTestMessage ? <p className="import-message">{supabaseTestMessage}</p> : null}
        </section>

        <section className="panel setup-panel">
          <div className="panel-heading">
            <h2>Carga masiva por CSV</h2>
            <span>Flujo guiado</span>
          </div>
          <p>
            Descarga una plantilla, completala en Excel, carga el archivo y
            revisa errores antes de confirmar la importacion.
          </p>
          <div className="bulk-step-list">
            <article className="bulk-step-card active">
              <strong>1</strong>
              <span>Descargar plantilla</span>
              <p>Usa columnas correctas para evitar datos incompletos.</p>
            </article>
            <article className={`bulk-step-card ${bulkPreview ? "active" : ""}`}>
              <strong>2</strong>
              <span>Cargar archivo</span>
              <p>Selecciona el CSV de personal o funciones.</p>
            </article>
            <article className={`bulk-step-card ${bulkPreview ? "active" : ""}`}>
              <strong>3</strong>
              <span>Revisar errores</span>
              <p>La app separa errores bloqueantes y advertencias.</p>
            </article>
            <article className={`bulk-step-card ${bulkPreview && !bulkErrors.length ? "active" : ""}`}>
              <strong>4</strong>
              <span>Confirmar importacion</span>
              <p>Solo se cargan datos despues de aprobar la revision.</p>
            </article>
          </div>
          <div className="bulk-grid">
            <article>
              <span>Personal</span>
              <p>Integrantes, cargo, competencias e ICLO.</p>
              <button className="secondary-action" type="button" onClick={downloadPersonalTemplate}>
                Descargar plantilla personal
              </button>
              <label className="file-import">
                Cargar archivo personal
                <input accept=".csv,text/csv" type="file" onChange={(event) => reviewCsv(event, "personal")} />
              </label>
            </article>
            <article>
              <span>Funciones</span>
              <p>Funciones, responsable, respaldo, IPF, estado y riesgo.</p>
              <button className="secondary-action" type="button" onClick={downloadFunctionsTemplate}>
                Descargar plantilla funciones
              </button>
              <label className="file-import">
                Cargar archivo funciones
                <input accept=".csv,text/csv" type="file" onChange={(event) => reviewCsv(event, "funciones")} />
              </label>
            </article>
          </div>
          {bulkPreview ? (
            <div className="bulk-review-panel">
              <div className="panel-heading">
                <h3>Revision del archivo</h3>
                <span>{bulkPreview.fileName}</span>
              </div>
              <div className="bulk-review-summary">
                <article>
                  <span>Registros detectados</span>
                  <strong>{bulkPreview.items.length}</strong>
                </article>
                <article className={bulkErrors.length ? "has-errors" : "is-ok"}>
                  <span>Errores</span>
                  <strong>{bulkErrors.length}</strong>
                </article>
                <article className={bulkWarnings.length ? "has-warnings" : "is-ok"}>
                  <span>Advertencias</span>
                  <strong>{bulkWarnings.length}</strong>
                </article>
              </div>
              {bulkPreview.issues.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Fila</th>
                        <th>Tipo</th>
                        <th>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPreview.issues.slice(0, 8).map((issue, index) => (
                        <tr key={`${issue.row}-${issue.message}-${index}`}>
                          <td>{issue.row}</td>
                          <td>
                            <span className={`bulk-issue ${issue.type}`}>
                              {issue.type === "error" ? "Error" : "Advertencia"}
                            </span>
                          </td>
                          <td>{issue.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="import-message">Archivo listo para importar. No se detectaron errores.</p>
              )}
              <div className="action-row">
                <button className="secondary-action" type="button" onClick={() => setBulkPreview(null)}>
                  Cancelar revision
                </button>
                <button className="primary-action" disabled={bulkErrors.length > 0} type="button" onClick={confirmBulkImport}>
                  Confirmar importacion
                </button>
              </div>
            </div>
          ) : null}
          {bulkMessage ? <p className="import-message">{bulkMessage}</p> : null}
        </section>
      </main>
    </AppShell>
  );
}

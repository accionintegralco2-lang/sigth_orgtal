"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { uploadEvidenceFile } from "@/lib/evidence-storage";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Evidencia } from "@/types";

const initialEvidence = {
  nombre: "",
  tipo: "Manual de funciones",
  dependencia: "",
  asociadoA: "",
  ubicacion: "",
  estado: "Pendiente" as Evidencia["estado"],
  fecha: "",
  observaciones: ""
};

const evidenceTypes = [
  "Manual de funciones",
  "Organigrama",
  "Acta",
  "Entrevista",
  "Encuesta",
  "Soporte de carga laboral",
  "Validacion de experto",
  "Otro"
];

const associatedOptions = [
  "Diagnostico general",
  "Manual de funciones",
  "Organigrama",
  "Entrevista a jefe",
  "Entrevistas y cuestionarios",
  "Juicio de expertos",
  "Alerta critica",
  "Reporte final"
];

function csvValue(value: string | number | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function EvidenceView() {
  const { dependencias, evidencias, addEvidencia, removeEvidencia } = useOrgData();
  const [form, setForm] = useState(initialEvidence);
  const [selectedFile, setSelectedFile] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const filteredEvidence = evidencias.filter((item) => {
    const text = [item.nombre, item.tipo, item.dependencia, item.asociadoA, item.ubicacion, item.observaciones]
      .join(" ")
      .toLowerCase();
    return (
      text.includes(query.toLowerCase().trim()) &&
      (typeFilter === "Todos" || item.tipo === typeFilter) &&
      (statusFilter === "Todos" || item.estado === statusFilter)
    );
  });
  const stats = useMemo(
    () => ({
      total: evidencias.length,
      recibidas: evidencias.filter((item) => item.estado === "Recibida").length,
      validadas: evidencias.filter((item) => item.estado === "Validada").length,
      observadas: evidencias.filter((item) => item.estado === "Observada").length
    }),
    [evidencias]
  );

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.nombre.trim()) return;
    setIsUploading(true);
    setUploadMessage("");
    let resolvedLocation = form.ubicacion.trim() || "Pendiente por cargar";

    try {
      if (documentFile) {
        const upload = await uploadEvidenceFile(documentFile);
        resolvedLocation = upload.location;
        setUploadMessage(upload.message);
      }
    } catch (error) {
      setUploadMessage(`No se pudo cargar el documento: ${error instanceof Error ? error.message : "error desconocido"}`);
      setIsUploading(false);
      return;
    }

    addEvidencia({
      ...form,
      nombre: form.nombre.trim(),
      dependencia: form.dependencia || dependencias[0]?.nombre || "Sin dependencia",
      asociadoA: form.asociadoA.trim() || "Diagnostico general",
      ubicacion: resolvedLocation,
      fecha: form.fecha || new Date().toISOString().slice(0, 10),
      observaciones: form.observaciones.trim()
    });
    setForm(initialEvidence);
    setSelectedFile("");
    setDocumentFile(null);
    setIsUploading(false);
  }

  function selectDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileName = file.name;
    setSelectedFile(fileName);
    setDocumentFile(file);
    setUploadMessage("");
    setForm((current) => ({
      ...current,
      nombre: current.nombre || fileName.replace(/\.[^/.]+$/, ""),
      ubicacion: `Archivo seleccionado: ${fileName}`,
      estado: current.estado === "Pendiente" ? "Recibida" : current.estado
    }));
  }

  function exportEvidence() {
    const rows = [
      ["Nombre", "Tipo", "Dependencia", "Asociado a", "Ubicacion", "Estado", "Fecha", "Observaciones"],
      ...filteredEvidence.map((item) => [
        item.nombre,
        item.tipo,
        item.dependencia,
        item.asociadoA,
        item.ubicacion,
        item.estado,
        item.fecha,
        item.observaciones
      ])
    ];
    const csv = rows.map((row) => row.map(csvValue).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orgtal-evidencias-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Soporte documental</p>
            <h1>Evidencias</h1>
            <p>
              Registra documentos, actas, organigramas, soportes de entrevistas,
              anexos y validaciones asociadas al diagnostico.
            </p>
          </div>
          <button className="primary-action" type="button" onClick={exportEvidence}>
            Descargar evidencias CSV
          </button>
        </section>

        <section className="function-summary-grid">
          <article>
            <span>Total</span>
            <strong>{stats.total}</strong>
            <p>Evidencias registradas</p>
          </article>
          <article>
            <span>Recibidas</span>
            <strong>{stats.recibidas}</strong>
            <p>Soportes disponibles</p>
          </article>
          <article>
            <span>Validadas</span>
            <strong>{stats.validadas}</strong>
            <p>Listas para informe</p>
          </article>
          <article>
            <span>Observadas</span>
            <strong>{stats.observadas}</strong>
            <p>Requieren ajuste</p>
          </article>
        </section>

        <section className="form-panel">
          <div className="panel-heading">
            <h2>Nueva evidencia</h2>
            <span>{isSupabaseConfigured ? "Carga real con Supabase" : "Registro local hasta configurar Supabase"}</span>
          </div>
          <form className="record-form" onSubmit={submitForm}>
            <label className="file-import wide-field">
              Cargar documento
              <input
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                type="file"
                onChange={selectDocument}
              />
              {selectedFile ? <span className="selected-file">Documento seleccionado: {selectedFile}</span> : null}
            </label>
            {uploadMessage ? <p className="import-message wide-field">{uploadMessage}</p> : null}
            <label>
              Nombre
              <input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
            </label>
            <label>
              Tipo
              <select value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value })}>
                {evidenceTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Dependencia
              <select value={form.dependencia} onChange={(event) => setForm({ ...form, dependencia: event.target.value })}>
                <option value="">Seleccionar</option>
                {dependencias.map((item) => (
                  <option key={item.id}>{item.nombre}</option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <select
                value={form.estado}
                onChange={(event) => setForm({ ...form, estado: event.target.value as Evidencia["estado"] })}
              >
                <option>Pendiente</option>
                <option>Recibida</option>
                <option>Validada</option>
                <option>Observada</option>
              </select>
            </label>
            <label>
              Fecha
              <input type="date" value={form.fecha} onChange={(event) => setForm({ ...form, fecha: event.target.value })} />
            </label>
            <label className="wide-field">
              Asociado a
              <select value={form.asociadoA} onChange={(event) => setForm({ ...form, asociadoA: event.target.value })}>
                <option value="">Seleccionar</option>
                {associatedOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="wide-field">
              Ubicacion o enlace
              <input
                placeholder="Ruta del archivo, enlace, carpeta o codigo documental"
                value={form.ubicacion}
                onChange={(event) => setForm({ ...form, ubicacion: event.target.value })}
              />
            </label>
            <label className="wide-field">
              Observaciones
              <textarea
                value={form.observaciones}
                onChange={(event) => setForm({ ...form, observaciones: event.target.value })}
              />
            </label>
            <button className="primary-action" disabled={isUploading} type="submit">
              {isUploading ? "Guardando..." : "Guardar evidencia"}
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Repositorio de evidencias</h2>
            <span>{filteredEvidence.length} de {evidencias.length}</span>
          </div>
          <div className="table-toolbar">
            <label>
              Buscar
              <input
                placeholder="Documento, dependencia, alerta o ubicacion"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label>
              Tipo
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option>Todos</option>
                {evidenceTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>Todos</option>
                <option>Pendiente</option>
                <option>Recibida</option>
                <option>Validada</option>
                <option>Observada</option>
              </select>
            </label>
            <button
              className="secondary-action"
              type="button"
              onClick={() => {
                setQuery("");
                setTypeFilter("Todos");
                setStatusFilter("Todos");
              }}
            >
              Limpiar filtros
            </button>
          </div>
          <div className="evidence-grid">
            {filteredEvidence.length ? (
              filteredEvidence.map((item) => (
                <article className="evidence-card" key={item.id}>
                  <div>
                    <span>{item.tipo}</span>
                    <h2>{item.nombre}</h2>
                    <p>{item.observaciones || "Sin observaciones."}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>Dependencia</dt>
                      <dd>{item.dependencia}</dd>
                    </div>
                    <div>
                      <dt>Asociado a</dt>
                      <dd>{item.asociadoA}</dd>
                    </div>
                    <div>
                      <dt>Ubicacion</dt>
                      <dd>{item.ubicacion}</dd>
                    </div>
                  </dl>
                  <div className="evidence-footer">
                    <b className={`evidence-status ${item.estado.toLowerCase()}`}>{item.estado}</b>
                    <span>{item.fecha}</span>
                    <button className="text-action" type="button" onClick={() => removeEvidencia(item.id)}>
                      Eliminar
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <article className="empty-state">
                <h2>Sin evidencias</h2>
                <p>Registra el primer soporte documental del diagnostico.</p>
              </article>
            )}
          </div>
        </section>
      </main>
    </AppShell>
  );
}


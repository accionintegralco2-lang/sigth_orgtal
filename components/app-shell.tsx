"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useOrgData } from "@/components/org-data-provider";
import { buildDiagnosisProgress } from "@/lib/diagnosis-progress";
import { getNavigationForRole, userRoles } from "@/lib/roles";
import type { UserRole } from "@/types";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isConfig = pathname === "/configuracion";
  const data = useOrgData();
  const { activeRole, setActiveRole } = data;
  const progress = buildDiagnosisProgress(data);
  const navItems = getNavigationForRole(activeRole);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">OS</span>
          <div>
            <strong>SIGTH_ORGTAL</strong>
            <small>Sistema 360</small>
          </div>
        </div>
        <nav className="main-nav" aria-label="Navegacion principal">
          {navItems.map(({ label, href }) => (
            <Link className={pathname === href || pathname.startsWith(`${href}/`) ? "active" : ""} key={href} href={href}>
              <span className="nav-indicator" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>Modo usuario simple</span>
          <strong>{activeRole}</strong>
          <small>Autor: Edwyn Arvey Lopez Acosta</small>
        </div>
      </aside>
      <div className="content-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Version minima funcional</p>
            <strong>Diagnostico organizacional institucional</strong>
          </div>
          <div className="topbar-status">
            <span className="status-dot" />
            <span className="status-pill">{isConfig ? "Gestion de datos" : "Datos activos"}</span>
            <Link className="topbar-progress" href="/asistente-diagnostico">
              <span>Avance</span>
              <strong>{progress.overall}%</strong>
            </Link>
            <label className="role-switcher">
              Rol
              <select value={activeRole} onChange={(event) => setActiveRole(event.target.value as UserRole)}>
                {userRoles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

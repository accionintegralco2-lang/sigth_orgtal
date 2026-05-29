"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useOrgData } from "@/components/org-data-provider";
import { buildDiagnosisProgress } from "@/lib/diagnosis-progress";
import { getModuleForPath, routeLabels } from "@/lib/module-menu";
import { getNavigationForRole, roleHome, roleMission, userRoles } from "@/lib/roles";
import type { UserRole } from "@/types";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isConfig = pathname === "/configuracion";
  const data = useOrgData();
  const { activeRole, setActiveRole } = data;
  const progress = buildDiagnosisProgress(data);
  const navItems = getNavigationForRole(activeRole);
  const currentModule = getModuleForPath(pathname);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">OS</span>
          <div>
            <strong>ORGTAL</strong>
            <small>Sistema 360</small>
          </div>
        </div>
        <span className="nav-section-label">Modulos ORGTAL</span>
        <nav className="main-nav" aria-label="Navegacion principal">
          {navItems.map(({ label, href }) => (
            <Link
              className={
                pathname === href || pathname.startsWith(`${href}/`) || currentModule?.href === href
                  ? "active"
                  : ""
              }
              key={`${label}-${href}`}
              href={href}
            >
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
            <small className="topbar-role-mission">
              {currentModule ? `${currentModule.tag}: ${currentModule.title}` : roleMission[activeRole]}
            </small>
          </div>
          <div className="topbar-status">
            <span className="status-dot" />
            <span className="status-pill">{isConfig ? "Gestion de datos" : "Datos activos"}</span>
            <Link className="topbar-home-link" href={roleHome[activeRole]}>
              Mi inicio
            </Link>
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
        {currentModule && currentModule.relatedRoutes.length > 1 ? (
          <nav className="module-subnav" aria-label={`Accesos del modulo ${currentModule.title}`}>
            <span>{currentModule.title}</span>
            <div>
              {currentModule.relatedRoutes.map((route) => (
                <Link
                  className={pathname === route || pathname.startsWith(`${route}/`) ? "active" : ""}
                  href={route}
                  key={route}
                >
                  {routeLabels[route] ?? route}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}
        {children}
      </div>
    </div>
  );
}

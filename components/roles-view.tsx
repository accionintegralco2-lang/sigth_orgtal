"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useOrgData } from "@/components/org-data-provider";
import { getNavigationForRole, roleHome, roleMission, rolePermissions, roleWorkflow, userRoles } from "@/lib/roles";

export function RolesView() {
  const { activeRole, setActiveRole } = useOrgData();

  return (
    <AppShell>
      <main className="page-stack">
        <section className="page-heading">
          <div>
            <p className="eyebrow">Gobernanza del sistema</p>
            <h1>Roles de usuario</h1>
            <p>
              Define la vista de trabajo para administrador, director, jefe de
              dependencia, analista de talento humano y experto validador.
            </p>
          </div>
          <span className="status-pill">{activeRole}</span>
        </section>

        <section className="role-grid">
          {userRoles.map((role) => (
            <article className={`role-card ${activeRole === role ? "active" : ""}`} key={role}>
              <div>
                <span>Perfil</span>
                <h2>{role}</h2>
                <p>{roleMission[role]}</p>
              </div>
              <div className="role-home-strip">
                <span>Inicio recomendado</span>
                <strong>{roleHome[role]}</strong>
              </div>
              <div className="role-workflow">
                {roleWorkflow[role].map((step, index) => (
                  <span key={step}>
                    <b>{index + 1}</b>
                    {step}
                  </span>
                ))}
              </div>
              <div className="role-route-list">
                {getNavigationForRole(role).map((item) => (
                  <span key={item.href}>{item.label}</span>
                ))}
              </div>
              <ul>
                {rolePermissions[role].map((permission) => (
                  <li key={permission}>{permission}</li>
                ))}
              </ul>
              <div className="role-actions">
                <button className="secondary-action" type="button" onClick={() => setActiveRole(role)}>
                  Usar este rol
                </button>
                <Link className="primary-action" href={roleHome[role]}>
                  Ir a su vista
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

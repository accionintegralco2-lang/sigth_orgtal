"use client";

import { useEffect } from "react";
import { saveMonitorEvent } from "@/lib/monitoring";

export function AppMonitor() {
  useEffect(() => {
    function save(type: "error" | "unhandledrejection", message: string) {
      saveMonitorEvent({
        type,
        message,
        path: window.location.pathname,
        createdAt: new Date().toISOString()
      });
    }

    function onError(event: ErrorEvent) {
      save("error", event.message || "Error no identificado en la interfaz.");
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      save("unhandledrejection", event.reason instanceof Error ? event.reason.message : String(event.reason || "Promesa rechazada."));
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}

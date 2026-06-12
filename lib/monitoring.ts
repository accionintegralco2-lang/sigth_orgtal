export type ClientMonitorEvent = {
  type: "error" | "unhandledrejection";
  message: string;
  path: string;
  createdAt: string;
};

const monitorKey = "orgtal-monitor-events-v1";
const maxEvents = 30;

export function saveMonitorEvent(event: ClientMonitorEvent) {
  if (typeof window === "undefined") return;

  try {
    const current = JSON.parse(window.localStorage.getItem(monitorKey) || "[]") as ClientMonitorEvent[];
    window.localStorage.setItem(monitorKey, JSON.stringify([event, ...current].slice(0, maxEvents)));
  } catch {
    window.localStorage.setItem(monitorKey, JSON.stringify([event]));
  }
}

export function readMonitorEvents() {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(monitorKey) || "[]") as ClientMonitorEvent[];
  } catch {
    return [];
  }
}

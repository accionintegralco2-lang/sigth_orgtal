type RiskLevel = "bajo" | "moderado" | "alto" | "critico";

const labels: Record<RiskLevel, string> = {
  bajo: "Controlado",
  moderado: "Seguimiento",
  alto: "Alto",
  critico: "Critico"
};

export function RiskBadge({ level, compact = false }: { level: RiskLevel; compact?: boolean }) {
  return <span className={`risk-badge ${level} ${compact ? "compact" : ""}`}>{labels[level]}</span>;
}

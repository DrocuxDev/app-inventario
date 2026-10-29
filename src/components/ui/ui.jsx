import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

const ICON_PROPS = { size: 18, strokeWidth: 1.75 };

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="page-header">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {actions && <div className="d-flex gap-2">{actions}</div>}
  </div>
);

export const Alert = ({ mensaje, onClose }) => {
  if (!mensaje?.texto) return null;
  const tipo = mensaje.tipo || "success";
  const Icon = tipo === "danger" ? XCircle : tipo === "warning" ? AlertTriangle : CheckCircle2;
  return (
    <div className={`alert-ui alert-${tipo}`} role="alert">
      <Icon {...ICON_PROPS} />
      <span>{mensaje.texto}</span>
      <button type="button" className="alert-close" onClick={onClose} aria-label="Cerrar">
        <X size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="empty-state">
    <div className="empty-icon">
      <Icon size={22} strokeWidth={1.75} />
    </div>
    <p className="empty-title">{title}</p>
    {subtitle && <p className="empty-subtitle">{subtitle}</p>}
  </div>
);

export const EmptyRow = ({ colSpan, ...props }) => (
  <tr>
    <td colSpan={colSpan} style={{ padding: 0 }}>
      <EmptyState {...props} />
    </td>
  </tr>
);

export const StockBadge = ({ stock, umbral = 10 }) => {
  if (stock < umbral) {
    return (
      <span className="badge-ui badge-red">
        <span className="dot dot-red" />
        {stock} und.
      </span>
    );
  }
  return (
    <span className="badge-ui badge-green">
      <span className="dot dot-green" />
      {stock} und.
    </span>
  );
};

export const CategoriaBadge = ({ categoria }) =>
  categoria ? (
    <span className="badge-ui badge-indigo">{categoria.nombre}</span>
  ) : (
    <span className="badge-ui badge-slate">Sin categoría</span>
  );

export const TipoMovimientoBadge = ({ tipo }) => {
  const cls = tipo === "Entrada" ? "badge-green" : tipo === "Salida" ? "badge-red" : "badge-amber";
  return <span className={`badge-ui ${cls}`}>{tipo}</span>;
};

export const formatFecha = (valor) =>
  new Date(valor).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const useAutoDismiss = (setMensaje, ms = 4000) => (texto, tipo = "success") => {
  setMensaje({ texto, tipo });
  setTimeout(() => setMensaje({ texto: "", tipo: "" }), ms);
};

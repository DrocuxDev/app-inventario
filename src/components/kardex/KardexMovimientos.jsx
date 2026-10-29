import { useState, useEffect } from "react";
import { ArrowDownLeft, ArrowUpRight, SlidersHorizontal, History, Send } from "lucide-react";
import api from "../../services/api";
import { PageHeader, Alert, EmptyRow, TipoMovimientoBadge, formatFecha, useAutoDismiss } from "../ui/ui";

const TIPOS = [
  { value: "Entrada", label: "Entrada", hint: "+ Suma stock", icon: ArrowDownLeft, activeClass: "active-in" },
  { value: "Salida", label: "Salida", hint: "− Resta stock", icon: ArrowUpRight, activeClass: "active-out" },
  { value: "Ajuste", label: "Ajuste", hint: "= Corrección", icon: SlidersHorizontal, activeClass: "active-adj" },
];

const FORM_VACIO = { producto_id: "", usuario_id: "", tipo_movimiento: "Entrada", cantidad: "", observaciones: "" };

const KardexMovimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [form, setForm] = useState(FORM_VACIO);
  const mostrarAlerta = useAutoDismiss(setMensaje, 5000);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resMov, resProd, resUser] = await Promise.all([
        api.get("/api/movimientos"),
        api.get("/api/productos"),
        api.get("/api/usuarios"),
      ]);
      setMovimientos(resMov.data);
      setProductos(resProd.data);
      setUsuarios(resUser.data);
    } catch {
      mostrarAlerta("Error al cargar datos del Kardex", "danger");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/movimientos", {
        ...form,
        producto_id: Number(form.producto_id),
        usuario_id: form.usuario_id ? Number(form.usuario_id) : null,
        cantidad: Number(form.cantidad),
      });
      mostrarAlerta(res.data.message || "Movimiento registrado exitosamente");
      setForm({ ...FORM_VACIO, usuario_id: form.usuario_id });
      cargarDatos();
    } catch (error) {
      mostrarAlerta(error.response?.data?.error || "Error en la transacción de Kardex", "danger");
    }
  };

  const productoSel = productos.find((p) => String(p.id) === String(form.producto_id));
  const cant = Number(form.cantidad) || 0;
  let stockProyectado = null;
  if (productoSel && form.cantidad !== "") {
    if (form.tipo_movimiento === "Entrada") stockProyectado = productoSel.stock + cant;
    else if (form.tipo_movimiento === "Salida") stockProyectado = productoSel.stock - cant;
    else stockProyectado = cant;
  }

  const movimientosFiltrados = filtroTipo ? movimientos.filter((m) => m.tipo_movimiento === filtroTipo) : movimientos;

  return (
    <div>
      <PageHeader
        title="Kardex / Movimientos"
        subtitle="Control transaccional ACID de entradas, salidas y ajustes con actualización automática de stock"
      />
      <Alert mensaje={mensaje} onClose={() => setMensaje({ texto: "", tipo: "" })} />

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="ui-card">
            <div className="ui-card-header">
              <h2 className="ui-card-title">Registrar movimiento</h2>
            </div>
            <div className="ui-card-body">
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field-label">Tipo de movimiento</label>
                  <div className="segmented" role="radiogroup">
                    {TIPOS.map(({ value, label, hint, icon: Icon, activeClass }) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={form.tipo_movimiento === value}
                        className={`seg-option ${form.tipo_movimiento === value ? activeClass : ""}`}
                        onClick={() => setForm({ ...form, tipo_movimiento: value })}
                      >
                        <Icon size={18} strokeWidth={1.75} />
                        {label}
                        <small>{hint}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Producto</label>
                  <select name="producto_id" className="input-ui" value={form.producto_id} onChange={handleChange} required>
                    <option value="">Seleccione un producto</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — stock {p.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">
                    {form.tipo_movimiento === "Ajuste" ? "Nuevo stock total" : "Cantidad"}
                  </label>
                  <input
                    type="number"
                    name="cantidad"
                    min={form.tipo_movimiento === "Ajuste" ? "0" : "1"}
                    className="input-ui tabular"
                    placeholder="0"
                    value={form.cantidad}
                    onChange={handleChange}
                    required
                  />
                  {stockProyectado !== null && (
                    <span className="field-hint tabular" style={{ color: stockProyectado < 0 ? "#DC2626" : undefined }}>
                      Stock: {productoSel.stock} → {stockProyectado}
                      {stockProyectado < 0 && " · stock insuficiente"}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label className="field-label">Responsable</label>
                  <select name="usuario_id" className="input-ui" value={form.usuario_id} onChange={handleChange}>
                    <option value="">Seleccione responsable</option>
                    {usuarios
                      .filter((u) => u.estado)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nombre} ({u.rol})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">Observaciones</label>
                  <textarea
                    name="observaciones"
                    className="input-ui"
                    rows="2"
                    placeholder="Ej. Compra según factura F001-124"
                    value={form.observaciones}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className={`btn-ui btn-block ${
                    form.tipo_movimiento === "Entrada"
                      ? "btn-emerald"
                      : form.tipo_movimiento === "Salida"
                      ? "btn-rose"
                      : "btn-primary-ui"
                  }`}
                  style={{
                    backgroundColor:
                      form.tipo_movimiento === "Entrada"
                        ? "#10B981"
                        : form.tipo_movimiento === "Salida"
                        ? "#EF4444"
                        : "#4F46E5",
                    color: "#FFFFFF",
                  }}
                >
                  <Send size={16} strokeWidth={1.75} />
                  {form.tipo_movimiento === "Entrada"
                    ? "Registrar Entrada en Kardex (+)"
                    : form.tipo_movimiento === "Salida"
                    ? "Registrar Salida en Kardex (−)"
                    : "Aplicar Ajuste en Kardex (=)"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="ui-card">
            <div className="ui-card-header">
              <h2 className="ui-card-title">Historial de movimientos</h2>
              <select className="input-ui sm" style={{ width: "auto" }} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="">Todos los tipos</option>
                <option value="Entrada">Solo entradas</option>
                <option value="Salida">Solo salidas</option>
                <option value="Ajuste">Solo ajustes</option>
              </select>
            </div>
            <div className="table-wrap">
              <table className="table-ui">
                <thead>
                  <tr>
                    <th>Transacción</th>
                    <th>Fecha y hora</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th className="text-end">Cantidad</th>
                    <th>Responsable</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosFiltrados.length === 0 ? (
                    <EmptyRow
                      colSpan={7}
                      icon={History}
                      title="El Kardex está vacío"
                      subtitle="Registra una entrada, salida o ajuste para iniciar el historial."
                    />
                  ) : (
                    movimientosFiltrados.map((mov) => (
                      <tr key={mov.id}>
                        <td className="mono cell-muted">TX-{String(mov.id).padStart(5, "0")}</td>
                        <td className="mono cell-muted">{formatFecha(mov.fecha_hora)}</td>
                        <td className="cell-primary">{mov.Producto ? mov.Producto.nombre : `ID #${mov.producto_id}`}</td>
                        <td><TipoMovimientoBadge tipo={mov.tipo_movimiento} /></td>
                        <td className="text-end tabular cell-primary">
                          {mov.tipo_movimiento === "Entrada" ? "+" : mov.tipo_movimiento === "Salida" ? "−" : "="}
                          {mov.cantidad}
                        </td>
                        <td>{mov.Usuario ? mov.Usuario.nombre : "Sistema"}</td>
                        <td className="cell-muted">{mov.observaciones || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KardexMovimientos;

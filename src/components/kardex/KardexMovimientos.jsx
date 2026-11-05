import { formatFecha, useAutoDismiss } from "../ui/helpers";
import { useState, useEffect, useCallback } from "react";
import { ArrowDownLeft, ArrowUpRight, SlidersHorizontal, History, Send, Plus } from "lucide-react";
import api from "../../services/api";
import { PageHeader, Alert, DataTable, Modal, TipoMovimientoBadge } from "../ui/ui";

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
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [form, setForm] = useState(FORM_VACIO);
  const mostrarAlerta = useAutoDismiss(setMensaje, 5000);

  const cargarDatos = useCallback(() => Promise.all([api.get("/api/movimientos"), api.get("/api/productos"), api.get("/api/usuarios")])
    .then(([resMov, resProd, resUser]) => { setMovimientos(resMov.data); setProductos(resProd.data); setUsuarios(resUser.data); })
    .catch(() => mostrarAlerta("Error al cargar datos del Kardex", "danger"))
    .finally(() => setLoading(false)), [mostrarAlerta]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const abrirModal = () => {
    setForm((prev) => ({ ...FORM_VACIO, usuario_id: prev.usuario_id }));
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm((prev) => ({ ...FORM_VACIO, usuario_id: prev.usuario_id }));
  };

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
      cerrarModal();
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
  const isDirty = Boolean(form.producto_id !== "" || form.cantidad !== "" || form.observaciones.trim() !== "");

  const submitBtnClass =
    form.tipo_movimiento === "Entrada"
      ? "btn-success-ui"
      : form.tipo_movimiento === "Salida"
      ? "btn-danger-ui"
      : "btn-primary-ui";

  const columns = [
    {
      key: "fecha_hora",
      header: "Fecha y hora",
      sortable: true,
      sticky: true,
      nowrap: true,
      sortValue: (mov) => new Date(mov.fecha_hora).getTime(),
      cellClassName: "mono cell-muted",
      render: (mov) => (
        <>
          {formatFecha(mov.fecha_hora)}
          <span className="cell-secondary">TX-{String(mov.id).padStart(5, "0")}</span>
        </>
      ),
    },
    {
      key: "producto",
      header: "Producto / Observación",
      sortable: true,
      sortValue: (mov) => (mov.Producto ? mov.Producto.nombre : `ID #${mov.producto_id}`),
      render: (mov) => (
        <div style={{ minWidth: 0 }}>
          <span className="cell-primary">
            {mov.Producto ? mov.Producto.nombre : `ID #${mov.producto_id}`}
          </span>
          <span
            className="cell-secondary cell-truncate"
            style={{ "--truncate-w": "320px" }}
            title={mov.observaciones || undefined}
          >
            {mov.observaciones || "Sin observaciones"}
          </span>
        </div>
      ),
    },
    {
      key: "tipo_movimiento",
      header: "Tipo",
      sortable: true,
      render: (mov) => <TipoMovimientoBadge tipo={mov.tipo_movimiento} />,
    },
    {
      key: "cantidad",
      header: "Cantidad",
      align: "right",
      sortable: true,
      sortValue: (mov) => Number(mov.cantidad || 0),
      cellClassName: "cell-primary",
      render: (mov) =>
        `${mov.tipo_movimiento === "Entrada" ? "+" : mov.tipo_movimiento === "Salida" ? "−" : "="}${mov.cantidad}`,
    },
    {
      key: "responsable",
      header: "Responsable",
      sortable: true,
      sortValue: (mov) => (mov.Usuario ? mov.Usuario.nombre : "Sistema"),
      render: (mov) => (mov.Usuario ? mov.Usuario.nombre : "Sistema"),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Kardex / Movimientos"
        subtitle="Entradas, salidas y ajustes con un historial auditable de cada cambio de stock"
        actions={
          <button type="button" className="btn-ui btn-primary-ui" onClick={abrirModal}>
            <Plus size={16} strokeWidth={1.75} />
            Registrar movimiento
          </button>
        }
      />
      <Alert mensaje={mensaje} onClose={() => setMensaje({ texto: "", tipo: "" })} />

      <div className="catalog-summary">
        <div>
          <span>Total movimientos</span>
          <strong className="tabular">{movimientos.length}</strong>
        </div>
        <div>
          <span>Entradas (+)</span>
          <strong className="tabular">
            {movimientos.filter((m) => m.tipo_movimiento === "Entrada").length}
          </strong>
        </div>
        <div>
          <span>Salidas / Ajustes</span>
          <strong className="tabular">
            {movimientos.filter((m) => m.tipo_movimiento !== "Entrada").length}
          </strong>
        </div>
      </div>

      <DataTable
        title="Historial de movimientos"
        countLabel="movimientos"
        searchPlaceholder="Filtrar por producto, tipo o responsable…"
        columns={columns}
        data={movimientosFiltrados}
        loading={loading}
        toolbar={
          <select
            className="input-ui sm"
            style={{ width: "auto" }}
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            aria-label="Filtrar por tipo de movimiento"
          >
            <option value="">Todos los tipos</option>
            <option value="Entrada">Solo entradas</option>
            <option value="Salida">Solo salidas</option>
            <option value="Ajuste">Solo ajustes</option>
          </select>
        }
        emptyState={{
          icon: History,
          title: "El Kardex está vacío",
          subtitle: "Haz clic en «Registrar movimiento» para iniciar el historial de existencias.",
        }}
      />

      <Modal
        open={modalAbierto}
        onClose={cerrarModal}
        title="Registrar movimiento de Kardex"
        size="md"
        isDirty={isDirty}
        footer={
          <>
            <button type="button" className="btn-ui btn-secondary-ui" onClick={cerrarModal}>
              Cancelar
            </button>
            <button type="submit" form="kardex-modal-form" className={`btn-ui ${submitBtnClass}`}>
              <Send size={16} strokeWidth={1.75} />
              {form.tipo_movimiento === "Entrada"
                ? "Registrar Entrada (+)"
                : form.tipo_movimiento === "Salida"
                ? "Registrar Salida (−)"
                : "Aplicar Ajuste (=)"}
            </button>
          </>
        }
      >
        <form id="kardex-modal-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Tipo de movimiento</label>
            <div className="segmented" role="radiogroup" aria-label="Tipo de movimiento">
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
            <label className="field-label" htmlFor="kdx-producto">
              Producto
            </label>
            <select
              id="kdx-producto"
              name="producto_id"
              className="input-ui"
              value={form.producto_id}
              onChange={handleChange}
              required
              aria-label="Producto"
            >
              <option value="">Seleccione un producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — stock actual: {p.stock}
                </option>
              ))}
            </select>
          </div>

          <div className="row g-3">
            <div className="col-sm-6">
              <div className="field">
                <label className="field-label" htmlFor="kdx-cantidad">
                  {form.tipo_movimiento === "Ajuste" ? "Nuevo stock total" : "Cantidad"}
                </label>
                <input
                  id="kdx-cantidad"
                  type="number"
                  name="cantidad"
                  min={form.tipo_movimiento === "Ajuste" ? "0" : "1"}
                  className="input-ui tabular"
                  placeholder="0"
                  value={form.cantidad}
                  onChange={handleChange}
                  required
                  aria-label="Cantidad"
                />
                {stockProyectado !== null && (
                  <span className={`field-hint tabular${stockProyectado < 0 ? " danger" : ""}`}>
                    Stock: {productoSel.stock} → {stockProyectado}
                    {stockProyectado < 0 && " · stock insuficiente"}
                  </span>
                )}
              </div>
            </div>

            <div className="col-sm-6">
              <div className="field">
                <label className="field-label" htmlFor="kdx-usuario">
                  Responsable
                </label>
                <select
                  id="kdx-usuario"
                  name="usuario_id"
                  className="input-ui"
                  value={form.usuario_id}
                  onChange={handleChange}
                  aria-label="Responsable"
                >
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
            </div>
          </div>

          <div className="field mb-0">
            <label className="field-label" htmlFor="kdx-obs">
              Observaciones
            </label>
            <textarea
              id="kdx-obs"
              name="observaciones"
              className="input-ui"
              rows="2"
              placeholder="Ej. Compra según factura F001-124"
              value={form.observaciones}
              onChange={handleChange}
              aria-label="Observaciones"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KardexMovimientos;

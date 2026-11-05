import { useAutoDismiss } from "../ui/helpers";
import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, Truck, Save, Plus, Mail, Phone } from "lucide-react";
import api from "../../services/api";
import { PageHeader, Alert, DataTable, Modal, ConfirmDialog } from "../ui/ui";

const FORM_VACIO = { id: null, razon_social: "", contacto: "", telefono: "", email: "" };

const CrudProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(FORM_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const mostrarAlerta = useAutoDismiss(setMensaje);

  const obtenerProveedores = useCallback(() => api.get("/api/proveedores")
    .then((res) => { setProveedores(res.data); })
    .catch(() => mostrarAlerta("Error al cargar proveedores", "danger"))
    .finally(() => setLoading(false)), [mostrarAlerta]);

  useEffect(() => {
    obtenerProveedores();
  }, [obtenerProveedores]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const limpiar = () => setForm(FORM_VACIO);

  const abrirNuevo = () => {
    limpiar();
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    limpiar();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/api/proveedores/${form.id}`, form);
        mostrarAlerta("Proveedor actualizado correctamente");
      } else {
        await api.post("/api/proveedores", form);
        mostrarAlerta("Proveedor registrado correctamente");
      }
      cerrarModal();
      obtenerProveedores();
    } catch (error) {
      mostrarAlerta(error.response?.data?.error || "Error al guardar proveedor", "danger");
    }
  };

  const handleEdit = (p) => {
    setForm({
      id: p.id,
      razon_social: p.razon_social,
      contacto: p.contacto ?? "",
      telefono: p.telefono ?? "",
      email: p.email ?? "",
    });
    setModalAbierto(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/proveedores/${id}`);
      mostrarAlerta("Proveedor eliminado", "warning");
      if (form.id === id) cerrarModal();
      obtenerProveedores();
    } catch {
      mostrarAlerta("Error al eliminar proveedor", "danger");
    } finally {
      setProveedorAEliminar(null);
    }
  };

  const isDirty = Boolean(
    !form.id &&
      (form.razon_social.trim() !== "" ||
        form.contacto.trim() !== "" ||
        form.telefono.trim() !== "" ||
        form.email.trim() !== "")
  );

  const columns = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      sticky: true,
      cellClassName: "mono cell-muted",
      render: (p) => `#${String(p.id).padStart(3, "0")}`,
    },
    {
      key: "razon_social",
      header: "Razón social",
      sortable: true,
      truncate: 260,
      cellClassName: "cell-primary",
    },
    {
      key: "contacto",
      header: "Contacto",
      sortable: true,
      truncate: 200,
      render: (p) => p.contacto || "—",
    },
    {
      key: "telefono",
      header: "Teléfono",
      nowrap: true,
      cellClassName: "tabular cell-muted",
      render: (p) =>
        p.telefono ? (
          <span className="d-inline-flex align-items-center gap-1">
            <Phone size={14} strokeWidth={1.75} />
            {p.telefono}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "email",
      header: "Email",
      cellClassName: "cell-muted",
      render: (p) =>
        p.email ? (
          <span className="d-inline-flex align-items-center gap-1" title={p.email}>
            <Mail size={14} strokeWidth={1.75} />
            <span className="cell-truncate" style={{ "--truncate-w": "240px" }}>
              {p.email}
            </span>
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      nowrap: true,
      render: (p) => (
        <div className="row-actions">
          <button
            type="button"
            className="icon-btn"
            title="Editar"
            aria-label={`Editar proveedor ${p.razon_social}`}
            onClick={() => handleEdit(p)}
          >
            <Pencil size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="icon-btn danger"
            title="Eliminar"
            aria-label={`Eliminar proveedor ${p.razon_social}`}
            onClick={() => setProveedorAEliminar(p)}
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Proveedores"
        subtitle="Directorio de empresas y contactos de abastecimiento"
        actions={
          <button type="button" className="btn-ui btn-primary-ui" onClick={abrirNuevo}>
            <Plus size={16} strokeWidth={1.75} />
            Nuevo proveedor
          </button>
        }
      />
      <Alert mensaje={mensaje} onClose={() => setMensaje({ texto: "", tipo: "" })} />

      <DataTable
        title="Directorio de proveedores"
        countLabel="registros"
        searchPlaceholder="Filtrar por razón social, contacto o correo…"
        columns={columns}
        data={proveedores}
        loading={loading}
        activeRowId={modalAbierto ? form.id : null}
        emptyState={{
          icon: Truck,
          title: "Sin proveedores registrados",
          subtitle: "Haz clic en «Nuevo proveedor» para agregar una empresa abastecedora.",
        }}
      />

      <Modal
        open={modalAbierto}
        onClose={cerrarModal}
        title={form.id ? "Editar proveedor" : "Nuevo proveedor"}
        size="md"
        isDirty={isDirty}
        badge={
          form.id ? (
            <span className="badge-ui badge-indigo mono">ID #{String(form.id).padStart(3, "0")}</span>
          ) : null
        }
        footer={
          <>
            <button type="button" className="btn-ui btn-secondary-ui" onClick={cerrarModal}>
              Cancelar
            </button>
            <button type="submit" form="proveedor-modal-form" className="btn-ui btn-primary-ui">
              <Save size={16} strokeWidth={1.75} />
              {form.id ? "Actualizar proveedor" : "Guardar proveedor"}
            </button>
          </>
        }
      >
        <form id="proveedor-modal-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="prov-razon">
              Razón social
            </label>
            <input
              id="prov-razon"
              type="text"
              name="razon_social"
              className="input-ui"
              placeholder="Ej. Importaciones SAC"
              value={form.razon_social}
              onChange={handleChange}
              required
              aria-label="Razón social"
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="prov-contacto">
              Persona de contacto
            </label>
            <input
              id="prov-contacto"
              type="text"
              name="contacto"
              className="input-ui"
              placeholder="Ej. Juan Pérez"
              value={form.contacto}
              onChange={handleChange}
              aria-label="Contacto"
            />
          </div>
          <div className="row g-3">
            <div className="col-sm-6">
              <div className="field mb-0">
                <label className="field-label" htmlFor="prov-telefono">
                  Teléfono
                </label>
                <input
                  id="prov-telefono"
                  type="text"
                  name="telefono"
                  className="input-ui tabular"
                  placeholder="987 654 321"
                  value={form.telefono}
                  onChange={handleChange}
                  aria-label="Teléfono"
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="field mb-0">
                <label className="field-label" htmlFor="prov-email">
                  Correo electrónico
                </label>
                <input
                  id="prov-email"
                  type="email"
                  name="email"
                  className="input-ui"
                  placeholder="ventas@empresa.com"
                  value={form.email}
                  onChange={handleChange}
                  aria-label="Correo electrónico"
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(proveedorAEliminar)}
        onClose={() => setProveedorAEliminar(null)}
        onConfirm={() => proveedorAEliminar && handleDelete(proveedorAEliminar.id)}
        title="Eliminar proveedor"
        confirmLabel="Eliminar proveedor"
        description={
          <>
            ¿Seguro que deseas eliminar al proveedor{" "}
            <strong className="cell-primary">«{proveedorAEliminar?.razon_social}»</strong>? Si tiene
            productos asociados, el sistema impedirá su eliminación.
          </>
        }
      />
    </div>
  );
};

export default CrudProveedores;

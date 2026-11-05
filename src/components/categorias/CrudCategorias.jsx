import { useAutoDismiss } from "../ui/helpers";
import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, FolderOpen, Save, Plus } from "lucide-react";
import api from "../../services/api";
import { PageHeader, Alert, DataTable, Modal, ConfirmDialog } from "../ui/ui";

const FORM_VACIO = { id: null, nombre: "", descripcion: "" };

const CrudCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(FORM_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const mostrarAlerta = useAutoDismiss(setMensaje);

  const obtenerCategorias = useCallback(() => api.get("/api/categorias")
    .then((res) => { setCategorias(res.data); })
    .catch(() => mostrarAlerta("Error al cargar categorías", "danger"))
    .finally(() => setLoading(false)), [mostrarAlerta]);

  useEffect(() => {
    obtenerCategorias();
  }, [obtenerCategorias]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm(FORM_VACIO);
  };

  const abrirNueva = () => {
    setForm(FORM_VACIO);
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/api/categorias/${form.id}`, form);
        mostrarAlerta("Categoría actualizada correctamente");
      } else {
        await api.post("/api/categorias", form);
        mostrarAlerta("Categoría creada correctamente");
      }
      cerrarModal();
      obtenerCategorias();
    } catch (error) {
      mostrarAlerta(error.response?.data?.error || "Error al guardar categoría", "danger");
    }
  };

  const handleEdit = (cat) => {
    setForm({ id: cat.id, nombre: cat.nombre, descripcion: cat.descripcion ?? "" });
    setModalAbierto(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/categorias/${id}`);
      mostrarAlerta("Categoría eliminada", "warning");
      if (form.id === id) cerrarModal();
      obtenerCategorias();
    } catch {
      mostrarAlerta("No se puede eliminar la categoría porque tiene productos asociados.", "danger");
    } finally {
      setCategoriaAEliminar(null);
    }
  };

  const isDirty = Boolean(!form.id && (form.nombre.trim() !== "" || form.descripcion.trim() !== ""));

  const columns = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      sticky: true,
      cellClassName: "mono cell-muted",
      render: (cat) => `#${String(cat.id).padStart(3, "0")}`,
    },
    {
      key: "nombre",
      header: "Nombre",
      sortable: true,
      cellClassName: "cell-primary",
    },
    {
      key: "descripcion",
      header: "Descripción",
      truncate: 420,
      cellClassName: "cell-muted",
      render: (cat) => cat.descripcion || "—",
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      nowrap: true,
      render: (cat) => (
        <div className="row-actions">
          <button
            type="button"
            className="icon-btn"
            title="Editar"
            aria-label={`Editar categoría ${cat.nombre}`}
            onClick={() => handleEdit(cat)}
          >
            <Pencil size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="icon-btn danger"
            title="Eliminar"
            aria-label={`Eliminar categoría ${cat.nombre}`}
            onClick={() => setCategoriaAEliminar(cat)}
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
        title="Categorías"
        subtitle="Clasificación de productos del almacén"
        actions={
          <button type="button" className="btn-ui btn-primary-ui" onClick={abrirNueva}>
            <Plus size={16} strokeWidth={1.75} />
            Nueva categoría
          </button>
        }
      />
      <Alert mensaje={mensaje} onClose={() => setMensaje({ texto: "", tipo: "" })} />

      <DataTable
        title="Listado de categorías"
        countLabel="registros"
        searchPlaceholder="Filtrar categorías…"
        columns={columns}
        data={categorias}
        loading={loading}
        activeRowId={modalAbierto ? form.id : null}
        emptyState={{
          icon: FolderOpen,
          title: "Aún no hay categorías",
          subtitle: "Haz clic en «Nueva categoría» para crear la primera clasificación.",
        }}
      />

      <Modal
        open={modalAbierto}
        onClose={cerrarModal}
        title={form.id ? "Editar categoría" : "Nueva categoría"}
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
            <button type="submit" form="categoria-modal-form" className="btn-ui btn-primary-ui">
              <Save size={16} strokeWidth={1.75} />
              {form.id ? "Actualizar categoría" : "Guardar categoría"}
            </button>
          </>
        }
      >
        <form id="categoria-modal-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="cat-nombre">
              Nombre
            </label>
            <input
              id="cat-nombre"
              type="text"
              name="nombre"
              className="input-ui"
              placeholder="Ej. Electrónica"
              value={form.nombre}
              onChange={handleChange}
              required
              aria-label="Nombre"
            />
          </div>
          <div className="field mb-0">
            <label className="field-label" htmlFor="cat-descripcion">
              Descripción
            </label>
            <textarea
              id="cat-descripcion"
              name="descripcion"
              className="input-ui"
              rows="3"
              placeholder="Descripción de la categoría"
              value={form.descripcion}
              onChange={handleChange}
              aria-label="Descripción"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(categoriaAEliminar)}
        onClose={() => setCategoriaAEliminar(null)}
        onConfirm={() => categoriaAEliminar && handleDelete(categoriaAEliminar.id)}
        title="Eliminar categoría"
        confirmLabel="Eliminar categoría"
        description={
          <>
            ¿Seguro que deseas eliminar la categoría{" "}
            <strong className="cell-primary">«{categoriaAEliminar?.nombre}»</strong>? Si tiene
            productos asociados, el sistema impedirá su eliminación.
          </>
        }
      />
    </div>
  );
};

export default CrudCategorias;

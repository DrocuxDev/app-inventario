import { useState, useEffect } from "react";
import { Pencil, Trash2, FolderOpen, Save, X } from "lucide-react";
import api from "../../services/api";
import { PageHeader, Alert, EmptyRow, useAutoDismiss } from "../ui/ui";

const FORM_VACIO = { id: null, nombre: "", descripcion: "" };

const CrudCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const mostrarAlerta = useAutoDismiss(setMensaje);

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    try {
      const res = await api.get("/api/categorias");
      setCategorias(res.data);
    } catch {
      mostrarAlerta("Error al cargar categorías", "danger");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      setForm(FORM_VACIO);
      obtenerCategorias();
    } catch (error) {
      mostrarAlerta(error.response?.data?.error || "Error al guardar categoría", "danger");
    }
  };

  const handleEdit = (cat) => setForm({ id: cat.id, nombre: cat.nombre, descripcion: cat.descripcion ?? "" });

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      await api.delete(`/api/categorias/${id}`);
      mostrarAlerta("Categoría eliminada", "warning");
      obtenerCategorias();
    } catch {
      mostrarAlerta("No se puede eliminar la categoría porque tiene productos asociados.", "danger");
    }
  };

  return (
    <div>
      <PageHeader title="Categorías" subtitle="Clasificación de productos del almacén" />
      <Alert mensaje={mensaje} onClose={() => setMensaje({ texto: "", tipo: "" })} />

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="ui-card">
            <div className="ui-card-header">
              <h2 className="ui-card-title">{form.id ? "Editar categoría" : "Nueva categoría"}</h2>
              {form.id && <span className="badge-ui badge-slate mono">ID {form.id}</span>}
            </div>
            <div className="ui-card-body">
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field-label">Nombre</label>
                  <input type="text" name="nombre" className="input-ui" placeholder="Ej. Electrónica" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label className="field-label">Descripción</label>
                  <textarea name="descripcion" className="input-ui" rows="3" placeholder="Descripción de la categoría" value={form.descripcion} onChange={handleChange} />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn-ui btn-primary-ui btn-block">
                    <Save size={16} strokeWidth={1.75} />
                    {form.id ? "Actualizar" : "Guardar"}
                  </button>
                  {form.id && (
                    <button type="button" className="btn-ui btn-secondary-ui" onClick={() => setForm(FORM_VACIO)}>
                      <X size={16} strokeWidth={1.75} />
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="ui-card">
            <div className="ui-card-header">
              <h2 className="ui-card-title">Listado de categorías</h2>
              <span className="badge-ui badge-slate tabular">{categorias.length} registros</span>
            </div>
            <div className="table-wrap">
              <table className="table-ui">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.length === 0 ? (
                    <EmptyRow colSpan={4} icon={FolderOpen} title="Aún no hay categorías" subtitle="Crea categorías para organizar tus productos." />
                  ) : (
                    categorias.map((cat) => (
                      <tr key={cat.id}>
                        <td className="mono cell-muted">#{String(cat.id).padStart(3, "0")}</td>
                        <td className="cell-primary">{cat.nombre}</td>
                        <td className="cell-muted">{cat.descripcion || "—"}</td>
                        <td className="text-end" style={{ whiteSpace: "nowrap" }}>
                          <button className="icon-btn" title="Editar" onClick={() => handleEdit(cat)}>
                            <Pencil size={16} strokeWidth={1.75} />
                          </button>
                          <button className="icon-btn danger" title="Eliminar" onClick={() => handleDelete(cat.id)}>
                            <Trash2 size={16} strokeWidth={1.75} />
                          </button>
                        </td>
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

export default CrudCategorias;

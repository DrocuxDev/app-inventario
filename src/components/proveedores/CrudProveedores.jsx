import { useState, useEffect } from "react";
import { Pencil, Trash2, Truck, Save, X, Mail, Phone } from "lucide-react";
import api from "../../services/api";
import { PageHeader, Alert, EmptyRow, useAutoDismiss } from "../ui/ui";

const FORM_VACIO = { id: null, razon_social: "", contacto: "", telefono: "", email: "" };

const CrudProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const mostrarAlerta = useAutoDismiss(setMensaje);

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const obtenerProveedores = async () => {
    try {
      const res = await api.get("/api/proveedores");
      setProveedores(res.data);
    } catch {
      mostrarAlerta("Error al cargar proveedores", "danger");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const limpiar = () => setForm(FORM_VACIO);

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
      limpiar();
      obtenerProveedores();
    } catch (error) {
      mostrarAlerta(error.response?.data?.error || "Error al guardar proveedor", "danger");
    }
  };

  const handleEdit = (p) =>
    setForm({
      id: p.id,
      razon_social: p.razon_social,
      contacto: p.contacto ?? "",
      telefono: p.telefono ?? "",
      email: p.email ?? "",
    });

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este proveedor?")) return;
    try {
      await api.delete(`/api/proveedores/${id}`);
      mostrarAlerta("Proveedor eliminado", "warning");
      obtenerProveedores();
    } catch {
      mostrarAlerta("Error al eliminar proveedor", "danger");
    }
  };

  return (
    <div>
      <PageHeader title="Proveedores" subtitle="Directorio de empresas y contactos de abastecimiento" />
      <Alert mensaje={mensaje} onClose={() => setMensaje({ texto: "", tipo: "" })} />

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="ui-card">
            <div className="ui-card-header">
              <h2 className="ui-card-title">{form.id ? "Editar proveedor" : "Nuevo proveedor"}</h2>
              {form.id && <span className="badge-ui badge-slate mono">ID {form.id}</span>}
            </div>
            <div className="ui-card-body">
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field-label">Razón social</label>
                  <input type="text" name="razon_social" className="input-ui" placeholder="Ej. Importaciones SAC" value={form.razon_social} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label className="field-label">Persona de contacto</label>
                  <input type="text" name="contacto" className="input-ui" placeholder="Ej. Juan Pérez" value={form.contacto} onChange={handleChange} />
                </div>
                <div className="field">
                  <label className="field-label">Teléfono</label>
                  <input type="text" name="telefono" className="input-ui tabular" placeholder="987 654 321" value={form.telefono} onChange={handleChange} />
                </div>
                <div className="field">
                  <label className="field-label">Correo electrónico</label>
                  <input type="email" name="email" className="input-ui" placeholder="ventas@empresa.com" value={form.email} onChange={handleChange} />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn-ui btn-primary-ui btn-block">
                    <Save size={16} strokeWidth={1.75} />
                    {form.id ? "Actualizar" : "Guardar"}
                  </button>
                  {form.id && (
                    <button type="button" className="btn-ui btn-secondary-ui" onClick={limpiar}>
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
              <h2 className="ui-card-title">Directorio de proveedores</h2>
              <span className="badge-ui badge-slate tabular">{proveedores.length} registros</span>
            </div>
            <div className="table-wrap">
              <table className="table-ui">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Razón social</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.length === 0 ? (
                    <EmptyRow colSpan={6} icon={Truck} title="Sin proveedores registrados" subtitle="Agrega las empresas que abastecen tu almacén." />
                  ) : (
                    proveedores.map((p) => (
                      <tr key={p.id}>
                        <td className="mono cell-muted">#{String(p.id).padStart(3, "0")}</td>
                        <td className="cell-primary">{p.razon_social}</td>
                        <td>{p.contacto || "—"}</td>
                        <td className="tabular cell-muted">
                          {p.telefono ? (
                            <span className="d-inline-flex align-items-center gap-1">
                              <Phone size={14} strokeWidth={1.75} />
                              {p.telefono}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="cell-muted">
                          {p.email ? (
                            <span className="d-inline-flex align-items-center gap-1">
                              <Mail size={14} strokeWidth={1.75} />
                              {p.email}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="text-end" style={{ whiteSpace: "nowrap" }}>
                          <button className="icon-btn" title="Editar" onClick={() => handleEdit(p)}>
                            <Pencil size={16} strokeWidth={1.75} />
                          </button>
                          <button className="icon-btn danger" title="Eliminar" onClick={() => handleDelete(p.id)}>
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

export default CrudProveedores;

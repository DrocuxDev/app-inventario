import { useState, useEffect } from "react";
import { Pencil, Trash2, Users, Save, X } from "lucide-react";
import api from "../../services/api";
import { PageHeader, Alert, EmptyRow, useAutoDismiss } from "../ui/ui";

const FORM_VACIO = { id: null, nombre: "", email: "", password: "", rol: "Almacenero", estado: true };

const iniciales = (nombre = "") =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

const CrudUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const mostrarAlerta = useAutoDismiss(setMensaje);

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const res = await api.get("/api/usuarios");
      setUsuarios(res.data);
    } catch {
      mostrarAlerta("Error al cargar usuarios", "danger");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const limpiar = () => setForm(FORM_VACIO);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/api/usuarios/${form.id}`, payload);
        mostrarAlerta("Usuario actualizado correctamente");
      } else {
        await api.post("/api/usuarios", form);
        mostrarAlerta("Usuario registrado correctamente");
      }
      limpiar();
      obtenerUsuarios();
    } catch (error) {
      mostrarAlerta(error.response?.data?.error || "Error al guardar usuario", "danger");
    }
  };

  const handleEdit = (u) =>
    setForm({ id: u.id, nombre: u.nombre, email: u.email, password: "", rol: u.rol, estado: Boolean(u.estado) });

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await api.delete(`/api/usuarios/${id}`);
      mostrarAlerta("Usuario eliminado", "warning");
      obtenerUsuarios();
    } catch {
      mostrarAlerta("No se puede eliminar un usuario con movimientos registrados.", "danger");
    }
  };

  return (
    <div>
      <PageHeader title="Usuarios" subtitle="Administración de personal, roles y estado de acceso" />
      <Alert mensaje={mensaje} onClose={() => setMensaje({ texto: "", tipo: "" })} />

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="ui-card">
            <div className="ui-card-header">
              <h2 className="ui-card-title">{form.id ? "Editar usuario" : "Nuevo usuario"}</h2>
              {form.id && <span className="badge-ui badge-slate mono">ID {form.id}</span>}
            </div>
            <div className="ui-card-body">
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field-label">Nombre completo</label>
                  <input type="text" name="nombre" className="input-ui" placeholder="Ej. Ana Torres" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label className="field-label">Correo electrónico</label>
                  <input type="email" name="email" className="input-ui" placeholder="usuario@inventario.com" value={form.email} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label className="field-label">Contraseña</label>
                  <input type="password" name="password" className="input-ui" placeholder="••••••••" value={form.password} onChange={handleChange} required={!form.id} />
                  {form.id && <span className="field-hint">Déjala en blanco para mantener la actual</span>}
                </div>
                <div className="field">
                  <label className="field-label">Rol</label>
                  <select name="rol" className="input-ui" value={form.rol} onChange={handleChange}>
                    <option value="Administrador">Administrador</option>
                    <option value="Almacenero">Almacenero</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
                <div className="field">
                  <label className="switch-row">
                    <input type="checkbox" name="estado" checked={form.estado} onChange={handleChange} />
                    Usuario activo
                  </label>
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
              <h2 className="ui-card-title">Equipo</h2>
              <span className="badge-ui badge-slate tabular">{usuarios.length} usuarios</span>
            </div>
            <div className="table-wrap">
              <table className="table-ui">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length === 0 ? (
                    <EmptyRow colSpan={4} icon={Users} title="Sin usuarios registrados" subtitle="Agrega a las personas que operarán el inventario." />
                  ) : (
                    usuarios.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar" style={{ background: "#EEF2FF", color: "#4338CA" }}>
                              {iniciales(u.nombre)}
                            </div>
                            <div>
                              <span className="cell-primary">{u.nombre}</span>
                              <span className="cell-secondary">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge-ui ${u.rol === "Administrador" ? "badge-indigo" : "badge-slate"}`}>{u.rol}</span>
                        </td>
                        <td>
                          {u.estado ? (
                            <span className="badge-ui badge-green"><span className="dot dot-green" />Activo</span>
                          ) : (
                            <span className="badge-ui badge-slate"><span className="dot dot-slate" />Inactivo</span>
                          )}
                        </td>
                        <td className="text-end" style={{ whiteSpace: "nowrap" }}>
                          <button className="icon-btn" title="Editar" onClick={() => handleEdit(u)}>
                            <Pencil size={16} strokeWidth={1.75} />
                          </button>
                          <button className="icon-btn danger" title="Eliminar" onClick={() => handleDelete(u.id)}>
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

export default CrudUsuarios;

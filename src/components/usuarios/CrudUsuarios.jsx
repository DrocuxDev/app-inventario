import { useAutoDismiss } from "../ui/helpers";
import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2, Users, Save, Plus } from "lucide-react";
import api from "../../services/api";
import { PageHeader, Alert, DataTable, Modal, ConfirmDialog } from "../ui/ui";
import { MODULOS, MODULOS_POR_DEFECTO } from "../../auth/modulos";
import { usePermisos } from "../../auth/permisosContext";
import RolesModulos from "./RolesModulos";

const ROLES_RESPALDO = ["Administrador", "Almacenero", "Supervisor"];
const ROLES_INICIALES = ROLES_RESPALDO.map((nombre, i) => ({
  id: i + 1,
  nombre,
  modulos: MODULOS_POR_DEFECTO[nombre] || ["dashboard"],
  protegido: nombre === "Administrador",
}));

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
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(FORM_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const mostrarAlerta = useAutoDismiss(setMensaje);
  const { usuario: sesion, refrescar } = usePermisos();
  const esAdmin = sesion?.rol === "Administrador";
  const [roles, setRoles] = useState(ROLES_INICIALES);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const obtenerUsuarios = useCallback(() => api.get("/api/usuarios")
    .then((res) => { setUsuarios(res.data); })
    .catch(() => mostrarAlerta("Error al cargar usuarios", "danger"))
    .finally(() => setLoading(false)), [mostrarAlerta]);

  const obtenerRoles = useCallback(() => api.get("/api/roles")
    .then((res) => { if (Array.isArray(res.data) && res.data.length) setRoles(res.data); })
    .catch(() => {})
    .finally(() => setLoadingRoles(false)), []);

  useEffect(() => {
    obtenerUsuarios();
    obtenerRoles();
  }, [obtenerUsuarios, obtenerRoles]);

  // Roles disponibles en el formulario (solo un Administrador puede asignar "Administrador")
  const nombresRoles = roles.length ? roles.map((r) => r.nombre) : ROLES_RESPALDO;
  const opcionesRol = [...new Set([...nombresRoles, form.rol].filter(Boolean))].filter(
    (nombre) => esAdmin || nombre !== "Administrador" || form.rol === "Administrador"
  );
  const modulosRolSel = roles.find((r) => r.nombre === form.rol)?.modulos;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

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
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/api/usuarios/${form.id}`, payload);
        mostrarAlerta("Usuario actualizado correctamente");
      } else {
        await api.post("/api/usuarios", form);
        mostrarAlerta("Usuario registrado correctamente");
      }
      cerrarModal();
      obtenerUsuarios();
      refrescar(); // por si se modificó el propio usuario
    } catch (error) {
      mostrarAlerta(error.response?.data?.error || "Error al guardar usuario", "danger");
    }
  };

  const handleEdit = (u) => {
    setForm({ id: u.id, nombre: u.nombre, email: u.email, password: "", rol: u.rol, estado: Boolean(u.estado) });
    setModalAbierto(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/usuarios/${id}`);
      mostrarAlerta("Usuario eliminado", "warning");
      if (form.id === id) cerrarModal();
      obtenerUsuarios();
    } catch {
      mostrarAlerta("No se puede eliminar un usuario con movimientos registrados.", "danger");
    } finally {
      setUsuarioAEliminar(null);
    }
  };

  const isDirty = Boolean(
    !form.id && (form.nombre.trim() !== "" || form.email.trim() !== "" || form.password !== "")
  );

  const columns = [
    {
      key: "nombre",
      header: "Usuario",
      sortable: true,
      sticky: true,
      render: (u) => (
        <div className="d-flex align-items-center gap-2">
          <div className="avatar avatar-light">{iniciales(u.nombre)}</div>
          <div style={{ minWidth: 0 }}>
            <span className="cell-primary cell-truncate" style={{ "--truncate-w": "240px" }} title={u.nombre}>
              {u.nombre}
            </span>
            <span className="cell-secondary cell-truncate" style={{ "--truncate-w": "260px" }} title={u.email}>
              {u.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "rol",
      header: "Rol",
      sortable: true,
      render: (u) => (
        <span className={`badge-ui ${u.rol === "Administrador" ? "badge-indigo" : "badge-slate"}`}>
          {u.rol}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      sortable: true,
      sortValue: (u) => (u.estado ? 1 : 0),
      render: (u) =>
        u.estado ? (
          <span className="badge-ui badge-green">
            <span className="dot dot-green" />
            Activo
          </span>
        ) : (
          <span className="badge-ui badge-slate">
            <span className="dot dot-slate" />
            Inactivo
          </span>
        ),
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      nowrap: true,
      render: (u) => (
        <div className="row-actions">
          <button
            type="button"
            className="icon-btn"
            title="Editar"
            aria-label={`Editar usuario ${u.nombre}`}
            onClick={() => handleEdit(u)}
          >
            <Pencil size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="icon-btn danger"
            title="Eliminar"
            aria-label={`Eliminar usuario ${u.nombre}`}
            onClick={() => setUsuarioAEliminar(u)}
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
        title="Usuarios"
        subtitle="Administración de personal, roles y estado de acceso"
        actions={
          <button type="button" className="btn-ui btn-primary-ui" onClick={abrirNuevo}>
            <Plus size={16} strokeWidth={1.75} />
            Nuevo usuario
          </button>
        }
      />
      <Alert mensaje={mensaje} onClose={() => setMensaje({ texto: "", tipo: "" })} />

      <DataTable
        title="Equipo registrado"
        countLabel="usuarios"
        searchPlaceholder="Filtrar por nombre, correo o rol…"
        columns={columns}
        data={usuarios}
        loading={loading}
        activeRowId={modalAbierto ? form.id : null}
        emptyState={{
          icon: Users,
          title: "Sin usuarios registrados",
          subtitle: "Haz clic en «Nuevo usuario» para agregar personal al sistema.",
        }}
      />

      {/* Configuración de módulos por tipo de usuario: solo Administrador */}
      {esAdmin && (
        <div className="mt-4">
          <RolesModulos
            roles={roles}
            loading={loadingRoles}
            mostrarAlerta={mostrarAlerta}
            onCambio={async () => {
              await obtenerRoles();
              refrescar();
            }}
          />
        </div>
      )}

      <Modal
        open={modalAbierto}
        onClose={cerrarModal}
        title={form.id ? "Editar usuario" : "Nuevo usuario"}
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
            <button type="submit" form="usuario-modal-form" className="btn-ui btn-primary-ui">
              <Save size={16} strokeWidth={1.75} />
              {form.id ? "Actualizar usuario" : "Guardar usuario"}
            </button>
          </>
        }
      >
        <form id="usuario-modal-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="usr-nombre">
              Nombre completo
            </label>
            <input
              id="usr-nombre"
              type="text"
              name="nombre"
              className="input-ui"
              placeholder="Ej. Ana Torres"
              value={form.nombre}
              onChange={handleChange}
              required
              aria-label="Nombre"
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="usr-email">
              Correo electrónico
            </label>
            <input
              id="usr-email"
              type="email"
              name="email"
              className="input-ui"
              placeholder="usuario@inventario.com"
              value={form.email}
              onChange={handleChange}
              required
              aria-label="Correo electrónico"
            />
          </div>
          <div className="row g-3">
            <div className="col-sm-6">
              <div className="field">
                <label className="field-label" htmlFor="usr-password">
                  Contraseña
                </label>
                <input
                  id="usr-password"
                  type="password"
                  name="password"
                  className="input-ui"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required={!form.id}
                  aria-label="Contraseña"
                />
                {form.id && <span className="field-hint">En blanco mantiene la actual</span>}
              </div>
            </div>
            <div className="col-sm-6">
              <div className="field">
                <label className="field-label" htmlFor="usr-rol">
                  Rol
                </label>
                <select
                  id="usr-rol"
                  name="rol"
                  className="input-ui"
                  value={form.rol}
                  onChange={handleChange}
                  aria-label="Rol"
                >
                  {opcionesRol.map((nombre) => (
                    <option key={nombre} value={nombre}>
                      {nombre}
                    </option>
                  ))}
                </select>
                {modulosRolSel && (
                  <span className="field-hint">
                    {modulosRolSel.length
                      ? `Acceso a: ${MODULOS.filter((m) => modulosRolSel.includes(m.key)).map((m) => m.label).join(", ")}`
                      : "Este rol no tiene módulos habilitados"}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="field mb-0">
            <label className="switch-row">
              <input
                type="checkbox"
                name="estado"
                checked={form.estado}
                onChange={handleChange}
                aria-label="Activo"
              />
              Usuario activo con acceso al sistema
            </label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(usuarioAEliminar)}
        onClose={() => setUsuarioAEliminar(null)}
        onConfirm={() => usuarioAEliminar && handleDelete(usuarioAEliminar.id)}
        title="Eliminar usuario"
        confirmLabel="Eliminar usuario"
        description={
          <>
            ¿Seguro que deseas eliminar al usuario{" "}
            <strong className="cell-primary">«{usuarioAEliminar?.nombre}»</strong>? Si tiene
            movimientos registrados en el Kardex, el sistema impedirá su eliminación.
          </>
        }
      />
    </div>
  );
};

export default CrudUsuarios;

import { useState } from "react";
import { Save, Trash2, Plus, ShieldCheck, KeyRound } from "lucide-react";
import api from "../../services/api";
import { DataTable, ConfirmDialog } from "../ui/ui";
import { MODULOS } from "../../auth/modulos";

// Tabla de tipos de usuario (roles) con los módulos habilitados para cada uno.
// Solo la ve un Administrador.
const RolesModulos = ({ roles, loading, onCambio, mostrarAlerta }) => {
  const [borradores, setBorradores] = useState({}); // id del rol → módulos marcados sin guardar
  const [nuevoRol, setNuevoRol] = useState("");
  const [rolAEliminar, setRolAEliminar] = useState(null);
  const [guardando, setGuardando] = useState(null);

  const modulosDe = (rol) => borradores[rol.id] ?? rol.modulos;

  const descartarBorrador = (id) =>
    setBorradores((prev) => {
      const siguiente = { ...prev };
      delete siguiente[id];
      return siguiente;
    });

  const hayCambios = (rol) => {
    const borrador = borradores[rol.id];
    if (!borrador) return false;
    return borrador.length !== rol.modulos.length || borrador.some((m) => !rol.modulos.includes(m));
  };

  const alternar = (rol, modulo) => {
    const actuales = modulosDe(rol);
    const siguientes = actuales.includes(modulo) ? actuales.filter((m) => m !== modulo) : [...actuales, modulo];
    setBorradores((prev) => ({ ...prev, [rol.id]: siguientes }));
  };

  const guardar = async (rol) => {
    setGuardando(rol.id);
    try {
      await api.put(`/api/roles/${rol.id}`, { modulos: modulosDe(rol) });
      descartarBorrador(rol.id);
      mostrarAlerta(`Módulos del rol «${rol.nombre}» actualizados`);
      await onCambio();
    } catch (error) {
      mostrarAlerta(error.response?.data?.error || "Error al guardar los módulos del rol", "danger");
    } finally {
      setGuardando(null);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    const nombre = nuevoRol.trim();
    if (!nombre) return;
    try {
      await api.post("/api/roles", { nombre, modulos: ["dashboard"] });
      setNuevoRol("");
      mostrarAlerta(`Rol «${nombre}» creado. Marca sus módulos y guarda los cambios.`);
      await onCambio();
    } catch (error) {
      mostrarAlerta(error.response?.data?.error || "Error al crear el rol", "danger");
    }
  };

  const eliminar = async (rol) => {
    try {
      await api.delete(`/api/roles/${rol.id}`);
      descartarBorrador(rol.id);
      mostrarAlerta(`Rol «${rol.nombre}» eliminado`, "warning");
      await onCambio();
    } catch (error) {
      mostrarAlerta(error.response?.data?.error || "Error al eliminar el rol", "danger");
    } finally {
      setRolAEliminar(null);
    }
  };

  const columns = [
    {
      key: "nombre",
      header: "Tipo de usuario",
      sticky: true,
      render: (rol) => (
        <div>
          <span className="cell-primary">{rol.nombre}</span>
          {rol.protegido ? (
            <span className="cell-secondary d-inline-flex align-items-center gap-1">
              <ShieldCheck size={13} strokeWidth={1.75} /> Acceso total
            </span>
          ) : (
            <span className="cell-secondary">{modulosDe(rol).length} de {MODULOS.length} módulos</span>
          )}
        </div>
      ),
    },
    ...MODULOS.map((modulo) => ({
      key: `mod-${modulo.key}`,
      header: modulo.label,
      align: "center",
      render: (rol) => (
        <input
          type="checkbox"
          className="form-check-input m-0"
          style={{ cursor: rol.protegido ? "not-allowed" : "pointer" }}
          checked={rol.protegido || modulosDe(rol).includes(modulo.key)}
          disabled={rol.protegido || guardando === rol.id}
          onChange={() => alternar(rol, modulo.key)}
          aria-label={`${modulo.label} para ${rol.nombre}`}
        />
      ),
    })),
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      nowrap: true,
      render: (rol) =>
        rol.protegido ? (
          <span className="cell-muted">—</span>
        ) : (
          <div className="row-actions">
            <button
              type="button"
              className="btn-ui btn-primary-ui btn-sm-ui"
              disabled={!hayCambios(rol) || guardando === rol.id}
              onClick={() => guardar(rol)}
            >
              <Save size={14} strokeWidth={1.75} />
              Guardar
            </button>
            <button
              type="button"
              className="icon-btn danger"
              title="Eliminar rol"
              aria-label={`Eliminar rol ${rol.nombre}`}
              onClick={() => setRolAEliminar(rol)}
            >
              <Trash2 size={16} strokeWidth={1.75} />
            </button>
          </div>
        ),
    },
  ];

  return (
    <>
      <DataTable
        title="Roles y módulos habilitados"
        countLabel="roles"
        paginated={false}
        searchable={false}
        showDensityToggle={false}
        columns={columns}
        data={roles}
        loading={loading}
        headerActions={
          <form className="d-flex align-items-center gap-2" onSubmit={crear}>
            <input
              type="text"
              className="input-ui sm"
              placeholder="Nuevo tipo de usuario…"
              maxLength={50}
              value={nuevoRol}
              onChange={(e) => setNuevoRol(e.target.value)}
              aria-label="Nombre del nuevo rol"
            />
            <button type="submit" className="btn-ui btn-secondary-ui btn-sm-ui" disabled={!nuevoRol.trim()}>
              <Plus size={14} strokeWidth={1.75} />
              Agregar rol
            </button>
          </form>
        }
        emptyState={{
          icon: KeyRound,
          title: "Sin roles registrados",
          subtitle: "Crea un tipo de usuario y marca los módulos a los que tendrá acceso.",
        }}
      />

      <ConfirmDialog
        open={Boolean(rolAEliminar)}
        onClose={() => setRolAEliminar(null)}
        onConfirm={() => rolAEliminar && eliminar(rolAEliminar)}
        title="Eliminar rol"
        confirmLabel="Eliminar rol"
        description={
          <>
            ¿Seguro que deseas eliminar el rol{" "}
            <strong className="cell-primary">«{rolAEliminar?.nombre}»</strong>? Si hay usuarios con este rol, el
            sistema impedirá su eliminación.
          </>
        }
      />
    </>
  );
};

export default RolesModulos;

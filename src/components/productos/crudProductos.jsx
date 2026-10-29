import { useState, useEffect } from "react";
import { Search, Pencil, Trash2, PackageOpen, Save, X } from "lucide-react";
import api from "../../services/api";
import {
  PageHeader,
  Alert,
  EmptyRow,
  StockBadge,
  CategoriaBadge,
  useAutoDismiss,
} from "../ui/ui";

const FORM_VACIO = { id: null, nombre: "", descripcion: "", precio: "", stock: 0, categoria_id: "" };

const CrudProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [form, setForm] = useState(FORM_VACIO);
  const mostrarAlerta = useAutoDismiss(setMensaje);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const [resProd, resCat] = await Promise.all([api.get("/api/productos"), api.get("/api/categorias")]);
      setProductos(resProd.data);
      setCategorias(resCat.data);
    } catch {
      mostrarAlerta("Error al cargar productos o categorías", "danger");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const limpiarFormulario = () => setForm(FORM_VACIO);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, categoria_id: form.categoria_id ? Number(form.categoria_id) : null };
      if (form.id) {
        // El stock no se edita directamente: solo cambia vía transacciones del Kardex
        // eslint-disable-next-line no-unused-vars
        const { stock, ...datosActualizables } = payload;
        await api.put(`/api/productos/${form.id}`, datosActualizables);
        mostrarAlerta("Producto actualizado correctamente");
      } else {
        await api.post("/api/productos", payload);
        mostrarAlerta("Producto registrado exitosamente");
      }
      limpiarFormulario();
      obtenerDatos();
    } catch (error) {
      mostrarAlerta(error.response?.data?.error || "Error al guardar el producto", "danger");
    }
  };

  const handleEdit = (p) =>
    setForm({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      precio: p.precio,
      stock: p.stock,
      categoria_id: p.categoria_id ?? "",
    });

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      await api.delete(`/api/productos/${id}`);
      mostrarAlerta("Producto eliminado", "warning");
      obtenerDatos();
    } catch {
      mostrarAlerta("No se puede eliminar un producto con movimientos asociados en Kardex.", "danger");
    }
  };

  const texto = busqueda.toLowerCase();
  const productosFiltrados = productos.filter((p) => {
    const coincideTexto =
      p.nombre.toLowerCase().includes(texto) || (p.descripcion && p.descripcion.toLowerCase().includes(texto));
    const coincideCat = filtroCategoria ? String(p.categoria_id) === String(filtroCategoria) : true;
    return coincideTexto && coincideCat;
  });

  return (
    <div>
      <PageHeader title="Productos" subtitle="Catálogo de productos vinculado a categorías" />
      <Alert mensaje={mensaje} onClose={() => setMensaje({ texto: "", tipo: "" })} />

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="ui-card">
            <div className="ui-card-header">
              <h2 className="ui-card-title">{form.id ? "Editar producto" : "Nuevo producto"}</h2>
              {form.id && <span className="badge-ui badge-slate mono">ID {form.id}</span>}
            </div>
            <div className="ui-card-body">
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field-label">Nombre del producto</label>
                  <input type="text" name="nombre" className="input-ui" placeholder="Ej. Laptop Lenovo ThinkPad" value={form.nombre} onChange={handleChange} required />
                </div>

                <div className="field">
                  <label className="field-label">Categoría</label>
                  <select name="categoria_id" className="input-ui" value={form.categoria_id} onChange={handleChange} required>
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">Descripción</label>
                  <textarea name="descripcion" className="input-ui" rows="2" placeholder="Características o detalles" value={form.descripcion} onChange={handleChange} />
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="field">
                      <label className="field-label">Precio (S/)</label>
                      <input type="number" step="0.01" min="0" name="precio" className="input-ui tabular" value={form.precio} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label className="field-label">{form.id ? "Stock actual" : "Stock inicial"}</label>
                      <input type="number" min="0" name="stock" className="input-ui tabular" value={form.stock} onChange={handleChange} disabled={Boolean(form.id)} required />
                      {form.id && <span className="field-hint">Modificable solo vía Kardex</span>}
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn-ui btn-primary-ui btn-block">
                    <Save size={16} strokeWidth={1.75} />
                    {form.id ? "Actualizar producto" : "Guardar producto"}
                  </button>
                  {form.id && (
                    <button type="button" className="btn-ui btn-secondary-ui" onClick={limpiarFormulario}>
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
              <div className="toolbar w-100">
                <div className="input-icon-wrap">
                  <Search size={16} strokeWidth={1.75} />
                  <input type="text" className="input-ui sm" placeholder="Buscar por nombre o descripción" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                </div>
                <select className="input-ui sm" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                  <option value="">Todas las categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table-ui">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th className="text-end">Precio</th>
                    <th className="text-end">Stock</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length === 0 ? (
                    <EmptyRow
                      colSpan={6}
                      icon={PackageOpen}
                      title="No se encontraron productos"
                      subtitle={busqueda || filtroCategoria ? "Prueba ajustando la búsqueda o el filtro de categoría." : "Registra tu primer producto usando el formulario."}
                    />
                  ) : (
                    productosFiltrados.map((prod) => (
                      <tr key={prod.id}>
                        <td className="mono cell-muted">#{String(prod.id).padStart(4, "0")}</td>
                        <td>
                          <span className="cell-primary">{prod.nombre}</span>
                          {prod.descripcion && <span className="cell-secondary">{prod.descripcion}</span>}
                        </td>
                        <td><CategoriaBadge categoria={prod.Categoria} /></td>
                        <td className="text-end tabular">S/ {Number(prod.precio).toFixed(2)}</td>
                        <td className="text-end"><StockBadge stock={prod.stock} /></td>
                        <td className="text-end" style={{ whiteSpace: "nowrap" }}>
                          <button className="icon-btn" title="Editar" onClick={() => handleEdit(prod)}>
                            <Pencil size={16} strokeWidth={1.75} />
                          </button>
                          <button className="icon-btn danger" title="Eliminar" onClick={() => handleDelete(prod.id)}>
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

export default CrudProductos;

import { useAutoDismiss } from "../ui/helpers";
import { useState, useEffect, useCallback, useRef } from "react";
import { Pencil, Trash2, PackageOpen, Save, X, Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { PageHeader, Alert, EmptyRow, StockBadge, CategoriaBadge } from "../ui/ui";

const FORM_VACIO = { id: null, nombre: "", descripcion: "", precio: "", stock: 0, categoria_id: "", proveedor_id: "" };

const CrudProductos = () => {
  const dialogRef = useRef(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [searchParams] = useSearchParams();
  const busqueda = searchParams.get("q") || "";
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [form, setForm] = useState(FORM_VACIO);
  const mostrarAlerta = useAutoDismiss(setMensaje);

  const obtenerDatos = useCallback(() => Promise.all([api.get("/api/productos"), api.get("/api/categorias"), api.get("/api/proveedores")])
    .then(([resProd, resCat, resProv]) => { setProductos(resProd.data); setCategorias(resCat.data); setProveedores(resProv.data); })
    .catch(() => mostrarAlerta("Error al cargar productos, categorías o proveedores", "danger")), [mostrarAlerta]);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const limpiarFormulario = () => setForm(FORM_VACIO);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, categoria_id: Number(form.categoria_id), proveedor_id: Number(form.proveedor_id) };
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
      dialogRef.current.close();
      obtenerDatos();
    } catch (error) {
      mostrarAlerta(error.response?.data?.error || "Error al guardar el producto", "danger");
    }
  };

  const handleEdit = (p) => {
    setForm({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      precio: p.precio,
      stock: p.stock,
      categoria_id: p.categoria_id ?? "",
      proveedor_id: p.proveedor_id ?? "",
    });
    dialogRef.current.showModal();
  };

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
      <PageHeader title="Productos" subtitle="Controla las existencias de tu almacén" actions={
        <button type="button" className="btn-ui btn-primary-ui" onClick={() => { limpiarFormulario(); dialogRef.current.showModal(); }}><Plus size={17} /> Nuevo producto</button>
      } />
      <Alert mensaje={mensaje} onClose={() => setMensaje({ texto: "", tipo: "" })} />

      <div className="catalog-summary">
        <div><span>Productos registrados</span><strong className="tabular">{productos.length}</strong></div>
        <div><span>Unidades disponibles</span><strong className="tabular">{productos.reduce((sum, item) => sum + Number(item.stock), 0)}</strong></div>
        <div><span>Con stock bajo</span><strong className="tabular">{productos.filter(item => item.stock < 10).length}</strong></div>
      </div>
      <dialog ref={dialogRef} className="product-dialog" aria-labelledby="product-dialog-title" onClose={limpiarFormulario}>
          <div className="ui-card">
            <div className="ui-card-header">
              <h2 id="product-dialog-title" className="ui-card-title">{form.id ? "Editar producto" : "Nuevo producto"}</h2>
              <button type="button" className="icon-btn" aria-label="Cerrar formulario" onClick={() => dialogRef.current.close()}><X size={18} /></button>
              {form.id && <span className="badge-ui badge-slate mono">ID {form.id}</span>}
            </div>
            <div className="ui-card-body">
              <Alert mensaje={mensaje} onClose={() => setMensaje({ texto: "", tipo: "" })} />
              <form onSubmit={handleSubmit} className="product-form">
                <div className="field">
                  <label className="field-label">Nombre del producto</label>
                  <input type="text" name="nombre" className="input-ui" placeholder="Ej. Laptop Lenovo ThinkPad" value={form.nombre} onChange={handleChange} required aria-label="Nombre" />
                </div>

                <div className="field">
                  <label className="field-label">Categoría</label>
                  <select name="categoria_id" className="input-ui" value={form.categoria_id} onChange={handleChange} required aria-label="Categoría">
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">Proveedor</label>
                  <select name="proveedor_id" aria-label="Proveedor" className="input-ui" value={form.proveedor_id} onChange={handleChange} required>
                    <option value="">Seleccione un proveedor</option>
                    {proveedores.map((proveedor) => <option key={proveedor.id} value={proveedor.id}>{proveedor.razon_social}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Descripción</label>
                  <textarea name="descripcion" className="input-ui" rows="2" placeholder="Características o detalles" value={form.descripcion} onChange={handleChange} aria-label="Descripción" />
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="field">
                      <label className="field-label">Precio (S/)</label>
                      <input type="number" step="0.01" min="0" name="precio" className="input-ui tabular" value={form.precio} onChange={handleChange} required aria-label="Precio" />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="field">
                      <label className="field-label">{form.id ? "Stock actual" : "Stock inicial"}</label>
                      <input type="number" min="0" name="stock" className="input-ui tabular" value={form.stock} onChange={handleChange} disabled={Boolean(form.id)} required aria-label="Stock" />
                      {form.id && <span className="field-hint">Modificable solo vía Kardex</span>}
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn-ui btn-primary-ui btn-block">
                    <Save size={16} strokeWidth={1.75} />
                    {form.id ? "Actualizar producto" : "Guardar producto"}
                  </button>
                  {(
                    <button type="button" className="btn-ui btn-secondary-ui" onClick={() => dialogRef.current.close()}>
                      <X size={16} strokeWidth={1.75} />
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
      </dialog>

      <div className="catalog-list">
          <div className="ui-card">
            <div className="ui-card-header">
              <div className="toolbar w-100">
                <span className="catalog-results" aria-live="polite">{productosFiltrados.length} productos{busqueda ? ` para “${busqueda}”` : " en el catálogo"}</span>
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
                    <th>Categoría / proveedor</th>
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
                      subtitle={busqueda || filtroCategoria ? "Prueba ajustando la búsqueda o el filtro de categoría." : "Usa Nuevo producto para agregar el primero."}
                    />
                  ) : (
                    productosFiltrados.map((prod) => (
                      <tr key={prod.id}>
                        <td className="mono cell-muted">#{String(prod.id).padStart(4, "0")}</td>
                        <td>
                          <span className="cell-primary">{prod.nombre}</span>
                          {prod.descripcion && <span className="cell-secondary">{prod.descripcion}</span>}
                        </td>
                        <td><CategoriaBadge categoria={prod.Categoria} /><span className="cell-secondary">{prod.Proveedor?.razon_social}</span></td>
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
  );
};

export default CrudProductos;

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Trash2, Package, Save, Plus } from "lucide-react";
import api from "../../services/api";
import { useAutoDismiss } from "../ui/helpers";
import { PageHeader, Alert, DataTable, Modal, ConfirmDialog, StockBadge, CategoriaBadge } from "../ui/ui";

const FORM_VACIO = {
  id: null,
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  categoria_id: 1,
  proveedor_id: 1,
};

const CrudProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(FORM_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const mostrarAlerta = useAutoDismiss(setMensaje);
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  // Función auxiliar para obtener los headers con el token
  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  }, []);

  const obtenerProductos = useCallback(
    () =>
      Promise.all([
        api.get("/api/productos", getHeaders()),
        api.get("/api/categorias", getHeaders()).catch(() => ({ data: [] })),
        api.get("/api/proveedores", getHeaders()).catch(() => ({ data: [] })),
      ])
        .then(([resProd, resCat, resProv]) => {
          setProductos(resProd.data);
          setCategorias(resCat.data);
          setProveedores(resProv.data);
        })
        .catch((error) => {
          console.error("Error al obtener productos (posible token expirado)", error);
          mostrarAlerta("Error al cargar productos", "danger");
        })
        .finally(() => {
          setLoading(false);
        }),
    [getHeaders, mostrarAlerta]
  );

  useEffect(() => {
    obtenerProductos();
  }, [obtenerProductos]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiar = () => {
    setForm({
      ...FORM_VACIO,
      categoria_id: categorias[0]?.id || 1,
      proveedor_id: proveedores[0]?.id || 1,
    });
  };

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
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: form.precio,
        categoria_id: Number(form.categoria_id || categorias[0]?.id || 1),
        proveedor_id: Number(form.proveedor_id || proveedores[0]?.id || 1),
      };
      // El stock solo se envía al crear (entrada inicial); luego se modifica desde el Kardex
      if (!form.id) payload.stock = Number(form.stock || 0);
      if (form.id) {
        await api.put(`/api/productos/${form.id}`, payload, getHeaders());
        mostrarAlerta("Producto actualizado correctamente");
      } else {
        await api.post("/api/productos", payload, getHeaders());
        mostrarAlerta("Producto registrado correctamente");
      }
      cerrarModal();
      obtenerProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      mostrarAlerta(error.response?.data?.error || "Error al guardar producto", "danger");
    }
  };

  const handleEdit = (producto) => {
    setForm({
      ...producto,
      descripcion: producto.descripcion ?? "",
      categoria_id: producto.categoria_id || categorias[0]?.id || 1,
      proveedor_id: producto.proveedor_id || proveedores[0]?.id || 1,
    });
    setModalAbierto(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/productos/${id}`, getHeaders());
      mostrarAlerta("Producto eliminado", "warning");
      if (form.id === id) cerrarModal();
      obtenerProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      mostrarAlerta("No se puede eliminar un producto con movimientos registrados.", "danger");
    } finally {
      setProductoAEliminar(null);
    }
  };

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const matchQuery =
        !query ||
        String(p.nombre || "").toLowerCase().includes(query) ||
        String(p.descripcion || "").toLowerCase().includes(query);
      const matchCat = !filtroCategoria || String(p.categoria_id) === String(filtroCategoria);
      return matchQuery && matchCat;
    });
  }, [productos, query, filtroCategoria]);

  const isDirty = Boolean(
    !form.id && (form.nombre.trim() !== "" || form.descripcion.trim() !== "" || form.precio !== "")
  );

  const columns = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      sticky: true,
      cellClassName: "mono cell-muted",
      render: (prod) => `#${String(prod.id).padStart(4, "0")}`,
    },
    {
      key: "nombre",
      header: "Producto",
      sortable: true,
      render: (prod) => (
        <div style={{ minWidth: 0 }}>
          <span className="cell-primary cell-truncate" style={{ "--truncate-w": "260px" }} title={prod.nombre}>
            {prod.nombre}
          </span>
          {prod.descripcion && (
            <span className="cell-secondary cell-truncate" style={{ "--truncate-w": "300px" }} title={prod.descripcion}>
              {prod.descripcion}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "categoria_id",
      header: "Categoría / Proveedor",
      sortable: true,
      sortValue: (prod) => prod.Categoria?.nombre || categorias.find((c) => c.id === prod.categoria_id)?.nombre || "",
      render: (prod) => {
        const catObj = prod.Categoria || categorias.find((c) => Number(c.id) === Number(prod.categoria_id));
        const provObj = prod.Proveedor || proveedores.find((pr) => Number(pr.id) === Number(prod.proveedor_id));
        return (
          <div>
            <CategoriaBadge categoria={catObj} />
            {provObj && <span className="cell-secondary">{provObj.razon_social}</span>}
          </div>
        );
      },
    },
    {
      key: "precio",
      header: "Precio (S/)",
      align: "right",
      sortable: true,
      sortValue: (prod) => Number(prod.precio || 0),
      cellClassName: "cell-primary",
      render: (prod) => `S/ ${Number(prod.precio || 0).toFixed(2)}`,
    },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      sortable: true,
      sortValue: (prod) => Number(prod.stock || 0),
      render: (prod) => <StockBadge stock={Number(prod.stock || 0)} />,
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      nowrap: true,
      render: (prod) => (
        <div className="row-actions">
          <button
            type="button"
            className="icon-btn"
            title="Editar"
            aria-label={`Editar producto ${prod.nombre}`}
            onClick={() => handleEdit(prod)}
          >
            <Pencil size={16} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="icon-btn danger"
            title="Eliminar"
            aria-label={`Eliminar producto ${prod.nombre}`}
            onClick={() => setProductoAEliminar(prod)}
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
        title="Productos"
        subtitle="Catálogo de existencias, precios unitarios y control de stock"
        actions={
          <button type="button" className="btn-ui btn-primary-ui" onClick={abrirNuevo}>
            <Plus size={16} strokeWidth={1.75} />
            Nuevo producto
          </button>
        }
      />
      <Alert mensaje={mensaje} onClose={() => setMensaje({ texto: "", tipo: "" })} />

      <div className="catalog-summary">
        <div>
          <span>Productos registrados</span>
          <strong className="tabular">{productos.length}</strong>
        </div>
        <div>
          <span>Unidades disponibles</span>
          <strong className="tabular">
            {productos.reduce((sum, item) => sum + Number(item.stock || 0), 0)}
          </strong>
        </div>
        <div>
          <span>Con stock bajo (&lt; 10)</span>
          <strong className="tabular">
            {productos.filter((item) => Number(item.stock || 0) < 10).length}
          </strong>
        </div>
      </div>

      <DataTable
        title="Catálogo de productos"
        countLabel="productos"
        searchPlaceholder="Filtrar por nombre o código…"
        columns={columns}
        data={productosFiltrados}
        loading={loading}
        activeRowId={modalAbierto ? form.id : null}
        toolbar={
          categorias.length > 0 && (
            <select
              className="input-ui sm"
              style={{ width: "auto" }}
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              aria-label="Filtrar por categoría"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          )
        }
        emptyState={{
          icon: Package,
          title: query || filtroCategoria ? "Sin coincidencias de búsqueda" : "Aún no hay productos registrados",
          subtitle:
            query || filtroCategoria
              ? "Prueba ajustando los filtros o el término buscado."
              : "Haz clic en «Nuevo producto» para registrar el primero en el catálogo.",
        }}
      />

      <Modal
        open={modalAbierto}
        onClose={cerrarModal}
        title={form.id ? "Editar producto" : "Nuevo producto"}
        size="lg"
        isDirty={isDirty}
        badge={
          form.id ? (
            <span className="badge-ui badge-indigo mono">ID #{String(form.id).padStart(4, "0")}</span>
          ) : null
        }
        footer={
          <>
            <button type="button" className="btn-ui btn-secondary-ui" onClick={cerrarModal}>
              Cancelar
            </button>
            <button type="submit" form="product-modal-form" className="btn-ui btn-primary-ui">
              <Save size={16} strokeWidth={1.75} />
              {form.id ? "Actualizar producto" : "Guardar producto"}
            </button>
          </>
        }
      >
        <form id="product-modal-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="prod-nombre">
              Nombre del producto
            </label>
            <input
              id="prod-nombre"
              type="text"
              name="nombre"
              className="input-ui"
              placeholder="Ej. Mouse Logitech M90"
              value={form.nombre}
              onChange={handleChange}
              required
              aria-label="Nombre"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="prod-descripcion">
              Descripción
            </label>
            <textarea
              id="prod-descripcion"
              name="descripcion"
              rows="2"
              className="input-ui"
              placeholder="Detalle técnico o presentación"
              value={form.descripcion}
              onChange={handleChange}
              aria-label="Descripción"
            />
          </div>

          <div className="row g-3">
            <div className="col-sm-6">
              <div className="field">
                <label className="field-label" htmlFor="prod-categoria">
                  Categoría
                </label>
                {categorias.length > 0 ? (
                  <select
                    id="prod-categoria"
                    name="categoria_id"
                    className="input-ui"
                    value={form.categoria_id}
                    onChange={handleChange}
                    required
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="prod-categoria"
                    type="number"
                    min="1"
                    name="categoria_id"
                    className="input-ui tabular"
                    value={form.categoria_id}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>
            </div>

            <div className="col-sm-6">
              <div className="field">
                <label className="field-label" htmlFor="prod-proveedor">
                  Proveedor
                </label>
                {proveedores.length > 0 ? (
                  <select
                    id="prod-proveedor"
                    name="proveedor_id"
                    className="input-ui"
                    value={form.proveedor_id}
                    onChange={handleChange}
                    required
                  >
                    {proveedores.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.razon_social}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="prod-proveedor"
                    type="number"
                    min="1"
                    name="proveedor_id"
                    className="input-ui tabular"
                    value={form.proveedor_id}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-sm-6">
              <div className="field mb-0">
                <label className="field-label" htmlFor="prod-precio">
                  Precio unitario (S/)
                </label>
                <input
                  id="prod-precio"
                  type="number"
                  step="0.01"
                  min="0"
                  name="precio"
                  className="input-ui tabular"
                  placeholder="0.00"
                  value={form.precio}
                  onChange={handleChange}
                  required
                  aria-label="Precio (S/)"
                />
              </div>
            </div>

            <div className="col-sm-6">
              <div className="field mb-0">
                <label className="field-label" htmlFor="prod-stock">
                  {form.id ? "Stock actual" : "Stock inicial"}
                </label>
                <input
                  id="prod-stock"
                  type="number"
                  min="0"
                  name="stock"
                  className="input-ui tabular"
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange}
                  required={!form.id}
                  disabled={Boolean(form.id)}
                  aria-label="Stock"
                />
                {form.id && <span className="field-hint">El stock se modifica desde el Kardex</span>}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(productoAEliminar)}
        onClose={() => setProductoAEliminar(null)}
        onConfirm={() => productoAEliminar && handleDelete(productoAEliminar.id)}
        title="Eliminar producto"
        confirmLabel="Eliminar producto"
        description={
          <>
            ¿Seguro que deseas eliminar el producto{" "}
            <strong className="cell-primary">«{productoAEliminar?.nombre}»</strong>? Si tiene
            movimientos en el Kardex, el sistema impedirá su eliminación.
          </>
        }
      />
    </div>
  );
};

export default CrudProductos;

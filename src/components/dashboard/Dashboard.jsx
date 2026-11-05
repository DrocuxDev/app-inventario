import { formatFecha } from "../ui/helpers";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Layers,
  Truck,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  History,
  ShieldCheck,
} from "lucide-react";
import api from "../../services/api";
import { Alert, PageHeader, DataTable, StockBadge, CategoriaBadge, TipoMovimientoBadge } from "../ui/ui";

const KpiCard = ({ label, value, hint, icon: Icon, tone, loading }) => (
  <div className="ui-card kpi-card h-100">
    <div className="kpi-head">
      <span className="kpi-label">{label}</span>
      <div className={`kpi-icon ${tone}`}>
        <Icon size={20} strokeWidth={1.75} />
      </div>
    </div>
    <div className="kpi-value">{loading ? "—" : value}</div>
    <div className="kpi-hint">{hint}</div>
  </div>
);

const Dashboard = () => {
  const [kpis, setKpis] = useState({
    totalProductos: 0,
    totalCategorias: 0,
    totalProveedores: 0,
    totalUsuarios: 0,
    alertasBajoStock: 0,
    productosBajoStock: [],
    ultimosMovimientos: [],
    stockPorCategoria: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarKpis = () => api.get("/api/dashboard/kpis")
    .then((res) => {
      setKpis(res.data);
      setError("");
    }).catch(() => {
      setError("No se pudo conectar con la API. Comprueba que el servidor y MySQL estén activos.");
    }).finally(() => {
      setLoading(false);
    });

  useEffect(() => {
    cargarKpis();
  }, []);

  const columnasMovimientos = [
    {
      key: "fecha_hora",
      header: "Fecha",
      sortable: true,
      sticky: true,
      nowrap: true,
      sortValue: (mov) => new Date(mov.fecha_hora).getTime(),
      cellClassName: "mono cell-muted",
      render: (mov) => formatFecha(mov.fecha_hora),
    },
    {
      key: "producto",
      header: "Producto",
      sortable: true,
      truncate: 180,
      cellClassName: "cell-primary",
      sortValue: (mov) => (mov.Producto ? mov.Producto.nombre : `Producto #${mov.producto_id}`),
      render: (mov) => (mov.Producto ? mov.Producto.nombre : `Producto #${mov.producto_id}`),
    },
    {
      key: "tipo_movimiento",
      header: "Tipo",
      render: (mov) => <TipoMovimientoBadge tipo={mov.tipo_movimiento} />,
    },
    {
      key: "cantidad",
      header: "Cant.",
      align: "right",
      sortable: true,
      sortValue: (mov) => Number(mov.cantidad || 0),
      cellClassName: "cell-primary",
    },
    {
      key: "responsable",
      header: "Responsable",
      cellClassName: "cell-muted",
      render: (mov) => (mov.Usuario ? mov.Usuario.nombre : "Sistema"),
    },
  ];

  const columnasBajoStock = [
    {
      key: "nombre",
      header: "Producto",
      sortable: true,
      sticky: true,
      truncate: 180,
      cellClassName: "cell-primary",
    },
    {
      key: "categoria",
      header: "Categoría",
      render: (prod) => <CategoriaBadge categoria={prod.Categoria} />,
    },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      sortable: true,
      sortValue: (prod) => Number(prod.stock || 0),
      render: (prod) => <StockBadge stock={prod.stock} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tu inventario, bajo control"
        subtitle="Disponibilidad, movimientos y alertas en un solo lugar."
        actions={
          <button className="btn-ui btn-secondary-ui" onClick={() => { setLoading(true); cargarKpis(); }}>
            <RefreshCw size={16} strokeWidth={1.75} />
            Actualizar
          </button>
        }
      />

      <Alert mensaje={{ texto: error, tipo: "danger" }} onClose={() => setError("")} />
      {!error && (
        <>
          <div className="row g-3 mb-4 dashboard-kpis">
            <div className="col-sm-6 col-xl-3">
              <KpiCard label="Total productos" value={kpis.totalProductos} hint="Registrados en catálogo" icon={Package} tone="indigo" loading={loading} />
            </div>
            <div className="col-sm-6 col-xl-3">
              <KpiCard label="Categorías" value={kpis.totalCategorias} hint="Clasificaciones activas" icon={Layers} tone="emerald" loading={loading} />
            </div>
            <div className="col-sm-6 col-xl-3">
              <KpiCard label="Proveedores" value={kpis.totalProveedores} hint="Empresas abastecedoras" icon={Truck} tone="sky" loading={loading} />
            </div>
            <div className="col-sm-6 col-xl-3">
              <KpiCard label="Alertas de stock" value={kpis.alertasBajoStock} hint="Productos con stock menor a 10" icon={AlertTriangle} tone="red" loading={loading} />
            </div>
          </div>

          <div className="row g-4 mb-4 dashboard-overview">
            <div className="col-lg-7">
              <section className="ui-card h-100" aria-labelledby="stock-chart-title">
                <div className="ui-card-header">
                  <h2 id="stock-chart-title" className="ui-card-title">Stock por categoría</h2>
                  <span className="cell-muted">Unidades disponibles</span>
                </div>
                <div className="ui-card-body stock-chart">
                  {kpis.stockPorCategoria.length === 0 ? (
                    <p className="cell-muted mb-0">Registra categorías para ver la distribución.</p>
                  ) : (
                    kpis.stockPorCategoria.map((category) => (
                      <div className="stock-chart-row" key={category.nombre}>
                        <div className="stock-chart-label">
                          <span>{category.nombre}</span>
                          <strong className="tabular">{category.unidades}</strong>
                        </div>
                        <div className="stock-chart-track" aria-hidden="true">
                          <div
                            style={{
                              width: `${(category.unidades / Math.max(1, ...kpis.stockPorCategoria.map((c) => c.unidades))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
            <div className="col-lg-5">
              <section className="ui-card quick-actions h-100">
                <span className="eyebrow">OPERACIÓN DIARIA</span>
                <h2>Un movimiento.<br />Todo actualizado.</h2>
                <p>Registra entradas, salidas y ajustes con un historial de cada operación.</p>
                <Link to="/kardex" className="btn-ui btn-primary-ui">
                  Registrar movimiento <ArrowRight size={16} />
                </Link>
              </section>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <DataTable
                title="Movimientos recientes"
                countLabel="recientes"
                paginated={false}
                showDensityToggle={true}
                cardClassName="h-100"
                columns={columnasMovimientos}
                data={kpis.ultimosMovimientos}
                loading={loading}
                headerActions={
                  <Link to="/kardex" className="btn-ui btn-secondary-ui btn-sm-ui">
                    Ver Kardex
                    <ArrowRight size={15} strokeWidth={1.75} />
                  </Link>
                }
                emptyState={{
                  icon: History,
                  title: "Sin movimientos registrados",
                  subtitle: "Las entradas, salidas y ajustes del Kardex aparecerán aquí.",
                }}
              />
            </div>

            <div className="col-lg-5">
              <DataTable
                title="Stock crítico"
                countLabel="alertas"
                paginated={false}
                showDensityToggle={true}
                cardClassName="h-100"
                columns={columnasBajoStock}
                data={kpis.productosBajoStock}
                loading={loading}
                headerActions={
                  <Link to="/productos" className="btn-ui btn-secondary-ui btn-sm-ui">
                    Productos
                    <ArrowRight size={15} strokeWidth={1.75} />
                  </Link>
                }
                emptyState={{
                  icon: ShieldCheck,
                  title: "Inventario saludable",
                  subtitle: "Ningún producto está por debajo del umbral mínimo de 10 unidades.",
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

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
import {
  PageHeader,
  EmptyRow,
  StockBadge,
  CategoriaBadge,
  TipoMovimientoBadge,
  formatFecha,
} from "../ui/ui";

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
  });
  const [loading, setLoading] = useState(true);

  const cargarKpis = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/dashboard/kpis");
      setKpis(res.data);
    } catch (error) {
      console.error("Error al cargar KPIs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarKpis();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard general"
        subtitle="Resumen ejecutivo del estado actual del inventario y Kardex"
        actions={
          <button className="btn-ui btn-secondary-ui" onClick={cargarKpis}>
            <RefreshCw size={16} strokeWidth={1.75} />
            Actualizar
          </button>
        }
      />

      <div className="row g-3 mb-4">
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

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="ui-card h-100">
            <div className="ui-card-header">
              <h2 className="ui-card-title">Movimientos recientes</h2>
              <Link to="/kardex" className="btn-ui btn-secondary-ui">
                Ver Kardex
                <ArrowRight size={16} strokeWidth={1.75} />
              </Link>
            </div>
            <div className="table-wrap">
              <table className="table-ui">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th className="text-end">Cant.</th>
                    <th>Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.ultimosMovimientos.length === 0 ? (
                    <EmptyRow
                      colSpan={5}
                      icon={History}
                      title="Sin movimientos registrados"
                      subtitle="Las entradas, salidas y ajustes del Kardex aparecerán aquí."
                    />
                  ) : (
                    kpis.ultimosMovimientos.map((mov) => (
                      <tr key={mov.id}>
                        <td className="mono cell-muted">{formatFecha(mov.fecha_hora)}</td>
                        <td className="cell-primary">
                          {mov.Producto ? mov.Producto.nombre : `Producto #${mov.producto_id}`}
                        </td>
                        <td>
                          <TipoMovimientoBadge tipo={mov.tipo_movimiento} />
                        </td>
                        <td className="text-end tabular cell-primary">{mov.cantidad}</td>
                        <td className="cell-muted">{mov.Usuario ? mov.Usuario.nombre : "Sistema"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="ui-card h-100">
            <div className="ui-card-header">
              <h2 className="ui-card-title">Stock crítico</h2>
              <Link to="/productos" className="btn-ui btn-secondary-ui">
                Productos
                <ArrowRight size={16} strokeWidth={1.75} />
              </Link>
            </div>
            <div className="table-wrap">
              <table className="table-ui">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th className="text-end">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.productosBajoStock.length === 0 ? (
                    <EmptyRow
                      colSpan={3}
                      icon={ShieldCheck}
                      title="Inventario saludable"
                      subtitle="Ningún producto está por debajo del umbral mínimo de 10 unidades."
                    />
                  ) : (
                    kpis.productosBajoStock.map((prod) => (
                      <tr key={prod.id}>
                        <td className="cell-primary">{prod.nombre}</td>
                        <td>
                          <CategoriaBadge categoria={prod.Categoria} />
                        </td>
                        <td className="text-end">
                          <StockBadge stock={prod.stock} />
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

export default Dashboard;

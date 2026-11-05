import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, AlertTriangle, Search } from "lucide-react";
import { EmptyRow } from "./ui";

const compareValues = (a, b, direction) => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  const numA = typeof a === "number" ? a : Number(a);
  const numB = typeof b === "number" ? b : Number(b);
  let result;

  if (!Number.isNaN(numA) && !Number.isNaN(numB) && a !== "" && b !== "") {
    result = numA - numB;
  } else {
    result = String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" });
  }
  return direction === "asc" ? result : -result;
};

const DENSITIES = [
  { id: "compact", label: "Compacta" },
  { id: "normal", label: "Normal" },
  { id: "comfortable", label: "Cómoda" },
];

export const DataTable = ({
  title,
  countLabel = "registros",
  showCount = true,
  headerActions,
  toolbar,
  searchable,
  searchPlaceholder = "Filtrar en tabla…",
  showDensityToggle,
  columns = [],
  data = [],
  rowKey = "id",
  loading = false,
  error = "",
  onRetry,
  emptyState,
  activeRowId = null,
  density: initialDensity = "normal",
  zebra = "auto",
  paginated = true,
  defaultPageSize = 10,
  cardClassName = "",
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearch, setLocalSearch] = useState("");
  const [density, setDensity] = useState(initialDensity);

  const isSearchable = searchable ?? paginated;
  const hasDensityToggle = showDensityToggle ?? paginated;

  const getRowId = (row, index) => (typeof rowKey === "function" ? rowKey(row, index) : row[rowKey] ?? index);

  const handleSort = (col) => {
    if (!col.sortable) return;
    setSortConfig((prev) => {
      if (prev.key === col.key) {
        return { key: col.key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key: col.key, direction: "asc" };
    });
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      columns.some((col) => {
        if (col.key === "acciones") return false;
        const val = col.sortValue ? col.sortValue(row) : row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, columns, localSearch]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const col = columns.find((c) => c.key === sortConfig.key);
    if (!col) return filteredData;
    const extractor = col.sortValue || ((row) => row[col.key]);
    return [...filteredData].sort((a, b) => compareValues(extractor(a), extractor(b), sortConfig.direction));
  }, [filteredData, columns, sortConfig]);

  const totalItems = sortedData.length;
  const totalPages = paginated ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;
  const safePage = Math.min(currentPage, totalPages);

  const visibleRows = useMemo(() => {
    if (!paginated) return sortedData;
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, paginated, safePage, pageSize]);

  const useZebra = zebra === true || (zebra === "auto" && visibleRows.length > 10);
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = paginated ? Math.min(totalItems, safePage * pageSize) : totalItems;

  return (
    <div className={`ui-card data-table-card ${cardClassName}`.trim()} data-density={density}>
      {(title || headerActions || showCount) && (
        <div className="ui-card-header">
          <div className="d-flex align-items-center gap-2">
            {title && <h2 className="ui-card-title">{title}</h2>}
            {showCount && (
              <span className="badge-ui badge-slate tabular">
                {loading ? "—" : `${totalItems} ${countLabel}`}
              </span>
            )}
          </div>
          {headerActions && <div className="d-flex align-items-center gap-2">{headerActions}</div>}
        </div>
      )}

      {(isSearchable || toolbar || hasDensityToggle) && (
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            {isSearchable && (
              <div className="table-search-wrap">
                <Search size={15} strokeWidth={1.75} aria-hidden="true" />
                <input
                  type="search"
                  className="table-search-input"
                  placeholder={searchPlaceholder}
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label={searchPlaceholder}
                />
              </div>
            )}
            {toolbar}
          </div>

          {hasDensityToggle && (
            <div className="table-toolbar-right">
              <div className="density-switch" role="group" aria-label="Densidad de tabla">
                {DENSITIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`density-btn${density === d.id ? " active" : ""}`}
                    onClick={() => setDensity(d.id)}
                    aria-pressed={density === d.id}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="table-wrap">
        <table className={`table-ui${useZebra ? " table-zebra" : ""}`} aria-busy={loading}>
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortConfig.key === col.key;
                const alignClass =
                  col.align === "right" ? "text-end" : col.align === "center" ? "text-center" : "";
                const stickyClass = col.sticky ? "col-sticky" : "";
                const thClass = [alignClass, stickyClass].filter(Boolean).join(" ");
                const ariaSort = !col.sortable
                  ? undefined
                  : isSorted
                  ? sortConfig.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none";

                return (
                  <th key={col.key} className={thClass || undefined} aria-sort={ariaSort}>
                    {col.sortable ? (
                      <button
                        type="button"
                        className={`th-sort-btn${isSorted ? " is-sorted" : ""}`}
                        onClick={() => handleSort(col)}
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowUp size={13} strokeWidth={2} className="sort-icon" />
                          ) : (
                            <ArrowDown size={13} strokeWidth={2} className="sort-icon" />
                          )
                        ) : (
                          <ArrowUpDown size={13} strokeWidth={1.75} className="sort-icon" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={col.align === "right" ? "text-end" : col.sticky ? "col-sticky" : undefined}
                    >
                      <span
                        className="skeleton-bar"
                        style={{ width: col.align === "right" ? "45%" : rowIdx % 2 === 0 ? "75%" : "60%" }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: 0 }}>
                  <div className="empty-state">
                    <div className="empty-icon" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
                      <AlertTriangle size={22} strokeWidth={1.75} />
                    </div>
                    <p className="empty-title">No se pudo cargar la tabla</p>
                    <p className="empty-subtitle">{error}</p>
                    {onRetry && (
                      <button type="button" className="btn-ui btn-secondary-ui mt-3" onClick={onRetry}>
                        Reintentar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
              emptyState ? (
                <EmptyRow
                  colSpan={columns.length}
                  icon={emptyState.icon}
                  title={localSearch ? "Sin resultados para tu filtro" : emptyState.title}
                  subtitle={
                    localSearch
                      ? `No hay coincidencias para «${localSearch}» en esta tabla.`
                      : emptyState.subtitle
                  }
                />
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center cell-muted">
                    Sin registros para mostrar.
                  </td>
                </tr>
              )
            ) : (
              visibleRows.map((row, rowIdx) => {
                const id = getRowId(row, rowIdx);
                const isEditing = activeRowId != null && String(activeRowId) === String(id);
                return (
                  <tr key={id} className={isEditing ? "is-editing" : undefined}>
                    {columns.map((col) => {
                      const alignClass =
                        col.align === "right"
                          ? "text-end tabular"
                          : col.align === "center"
                          ? "text-center"
                          : "";
                      const stickyClass = col.sticky ? "col-sticky" : "";
                      const tdClass = [alignClass, stickyClass, col.cellClassName]
                        .filter(Boolean)
                        .join(" ");

                      const rawValue = row[col.key];
                      const content = col.render ? col.render(row, rowIdx) : rawValue ?? "—";

                      return (
                        <td
                          key={col.key}
                          className={tdClass || undefined}
                          style={col.nowrap ? { whiteSpace: "nowrap" } : undefined}
                        >
                          {col.truncate && typeof content === "string" ? (
                            <span
                              className="cell-truncate"
                              style={
                                typeof col.truncate === "number"
                                  ? { "--truncate-w": `${col.truncate}px` }
                                  : undefined
                              }
                              title={content !== "—" ? content : undefined}
                            >
                              {content}
                            </span>
                          ) : (
                            content
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {paginated && !loading && !error && (
        <div className="table-pagination">
          <div className="table-pagination-info">
            <span className="tabular">
              Mostrando <strong>{startItem}–{endItem}</strong> de <strong>{totalItems}</strong>
            </span>
            <label className="d-inline-flex align-items-center gap-1">
              <span>Filas:</span>
              <select
                className="input-ui page-size-select tabular"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                aria-label="Filas por página"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>

          <div className="table-pagination-controls">
            <span className="tabular me-1">
              Pág. {safePage} / {totalPages}
            </span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

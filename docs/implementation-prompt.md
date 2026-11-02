# Prompt de implementación visual: Panel de Inventario SENATI

Fecha: 2026-11-02. Tema personalizado solicitado por el usuario: **"Colores de senati pero finos"**. Nombre de implementación: **Senati Sobrio**.

Este documento compone la plantilla `assets/vibe-design-template.md` de la skill pública `design-system-builder` con el PRD existente de la Guía Práctica 9 y el análisis de `design-system.md`. Es una adaptación al repositorio React ya funcional; conserva su arquitectura y sus componentes.

## Objetivo

Mejorar el panel de inventario para que una persona que administra un almacén pueda consultar existencias, mantener catálogos y registrar entradas, salidas o ajustes con claridad. El resultado debe ser la aplicación existente, ejecutable y conectada con MySQL, acompañada por capturas reales para la entrega del laboratorio.

## Contexto del producto y requisitos

- Frontend React/Vite con React Router y seis vistas: Dashboard, Productos, Categorías, Proveedores, Usuarios y Kardex.
- Backend Express/Sequelize/MySQL con categoría y proveedor obligatorios por producto.
- Un proveedor tiene muchos productos; una categoría tiene muchos productos; un producto tiene muchos movimientos; un usuario puede registrar muchos movimientos.
- El stock inicial genera una entrada en Kardex; toda modificación posterior se realiza con movimientos transaccionales. La UI debe reflejar estos permisos y las respuestas de error.
- No introducir un flujo de autenticación dentro de esta entrega: la guía lo plantea como investigación posterior.

## Dirección visual

Aplicar `design-system.md` como especificación de tokens, tipografía, componentes, accesibilidad y responsive. La referencia de la guía aporta sidebar oscura, superficies claras, cuatro KPI, tablas legibles y acciones breves. El encabezado usa el logo SENATI proporcionado por el usuario.

Aplicar el tema personalizado Senati Sobrio, creado con el flujo de `theme-factory`: navy `#101A33`, azul de acción `#153EC5`, hover `#0F2F99`, azul suave `#EBEFFE`, canvas frío `#F5F7FC`, superficies blancas, texto principal `#15213A` y secundario `#53617B`. El azul intenso de la guía inspira detalles de marca; las superficies amplias deben permanecer neutras. Conservar Inter local para la interfaz y usar DejaVu Sans en el PDF. Los contrastes principales están verificados en `design-system.md` (botón blanco/azul 8.31:1). Este es un tema propio inspirado en la preferencia del usuario, no una especificación oficial de SENATI.

## Principios de ejecución

- Jerarquía de contenido con espacios consistentes y títulos de pantalla claros.
- Una acción primaria por tarea; las acciones secundarias deben tener menor peso visual.
- Datos y errores visibles: no construir tendencias simuladas ni esconder fallos tras KPI en cero.
- Iconos Lucide con significado consistente y texto en español.
- Mantener CSS y componentes existentes; no se requiere introducir Tailwind, crear otra app o duplicar cada pantalla en varias soluciones.
- Mantener nombres y contratos de API verificados. El diseño no debe alterar stock, omitir validaciones ni sustituir datos reales.
- Pequeñas transiciones con soporte de movimiento reducido. La legibilidad y respuesta de los controles tienen prioridad.

## Implementación por pantalla

1. **Shell:** unificar la navegación, simplificarla en móvil, mantener estado activo y foco visible. El encabezado muestra ubicación y acciones útiles sin simular identidad autenticada.
2. **Dashboard:** cuatro KPI, distribución de stock por categoría calculada desde MySQL, movimientos recientes y alertas. Añadir estado de carga y aviso persistente de error con reintento. El gráfico incluye valores y leyenda textual.
3. **Productos:** formulario con selectores dinámicos y obligatorios de categoría/proveedor; explicación del stock inicial; edición de stock bloqueada y acceso a Kardex. En listado, nombre del producto y sus referencias son fáciles de localizar.
4. **Categorías y Proveedores:** encabezados y formularios consistentes; errores de eliminación con relaciones expresados de forma comprensible.
5. **Usuarios:** mostrar campos y estado de forma clara; no mostrar contraseñas en listados ni respuestas. Etiquetar los controles sin aparentar un login implementado.
6. **Kardex:** selección clara de entrada/salida/ajuste, stock previsto, responsable y observación; historial con signos y colores semánticos. Conservar el formulario cuando una operación se rechaza.

## Uso concreto de las otras skills

- `theme-factory`: seguir el tema que el usuario elija y mantener una aplicación consistente de sus colores/fuentes.
- `data-viz-renderer`: generar un resumen HTML/SVG autocontenido con una instantánea real de los KPI y stock por categoría para las evidencias. Los gráficos vivos del panel continúan obteniendo datos de la API.
- `chart-image`: generar un PNG del stock real por categoría o de una secuencia de movimientos comprobada para el PDF. Indicar fecha, unidad y si son datos de demostración.

## Comprobación

- Ejecutar lint y build sin errores.
- Probar carga del dashboard y creación de un producto desde navegador, seguida por un movimiento y la lectura del stock actualizado.
- Revisar escritorio a 1440 px y móvil a 390 px; comprobar scroll de tablas dentro de su contenedor.
- Revisar navegación por teclado, foco, etiquetas y contraste.
- Capturar el estado final del dashboard, formulario/listado de productos y Kardex con datos reales.
- Documentar alcance de pruebas y cualquier limitación real; la documentación no debe presentar una visualización estática como prueba de conexión en vivo.

## Entregables esperados

- Aplicación existente actualizada.
- Documento de sistema visual y prompt compuesto.
- Resumen de datos HTML/SVG y gráfico PNG generados con las skills indicadas.
- Capturas del navegador que se incorporan al PDF del laboratorio.


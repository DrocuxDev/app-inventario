# SENATI - Panel de Inventario

React + Vite + React Router. Tema personalizado Senati Sobrio.
Backend: [api-db](https://github.com/DrocuxDev/api-db).

## Desarrollo

Requiere Node.js 22.12 o superior. Inicia primero la API en el puerto 3006.
Ejecuta `npm ci` y `npm run dev`. Abre la URL que indique Vite (habitualmente
http://localhost:5173). El proxy envía `/api` al backend; no necesitas `.env` local.

## Compilación y revisión

`npm run lint` comprueba el código. `npm run build` genera `dist/`.
Se verificaron ambos comandos sin errores ni advertencias de ESLint.

Para un backend en otro dominio, establece `VITE_API_URL=https://tu-api.example.com`
antes de compilar. Usa solo el origen, sin añadir `/api`. Si sirves ambos desde
el mismo dominio, configura tu servidor web para redirigir `/api` al backend y
para resolver las rutas React a `index.html`.

## Funcionalidad

Seis vistas: Dashboard, Productos, Categorías, Proveedores, Usuarios y Kardex.
Categoría/proveedor dinámicos; stock editable solamente con movimientos;
dashboard con KPIs, distribución por categoría, alertas y actividad reciente.
Los fallos de conexión se muestran como error, sin presentar ceros como datos.

## Diseño

Consulta `DESIGN.md` y `docs/design-system.md`. Se aplicaron versiones públicas de
design-system-builder, theme-factory, data-viz-renderer y chart-image. El tema
Senati Sobrio fue solicitado por el usuario; no es un manual oficial de marca.
Las dos últimas skills generan los anexos HTML y PNG del informe; el gráfico
del panel usa directamente los datos de la API para actualizarse al recargar.

## GitHub

Sustituye los archivos de tu checkout con esta versión, ejecuta lint/build,
revisa `git diff`, crea un commit y súbelo. Este paquete no incluye `.git`,
credenciales ni `node_modules`.

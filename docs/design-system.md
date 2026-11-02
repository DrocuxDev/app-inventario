# Panel de inventario SENATI: sistema de diseño del Laboratorio 9

Estado: especificación para implementar en el proyecto existente. El usuario pidió un tema personalizado: **"Colores de senati pero finos"**. La propuesta se denomina **Senati Sobrio**; los tokens concretos de este documento son decisiones de implementación derivadas de esa preferencia, no una identidad corporativa oficial de SENATI.

## Fuentes y método

- Skill aplicada: `design-system-builder`, versión pública en `zebbern/claude-code-guide`, archivo `skills/design-system-builder/SKILL.md`.
- Plantilla utilizada: `assets/design-system.md` (paleta, tipografía, componentes, espaciado, movimiento y modo oscuro).
- Referencias inspeccionadas: las páginas 3, 4, 5 y 6 de la Guía Práctica 9, disponibles como `work/guia9-pages/page-3.png` a `page-6.png`.
- PRD existente: panel administrativo React + Express + MySQL, con Dashboard, Productos, Categorías, Proveedores, Usuarios y Kardex; asociaciones y stock transaccional.
- Las referencias son fotografías de pantallas. Los valores siguientes son una traducción coherente a tokens de implementación, no mediciones exactas de los píxeles originales.
- Se adapta el flujo de la skill al producto ya implementado: una dirección visual consistente y comprobaciones responsive, sin crear cinco aplicaciones paralelas ni migrar el CSS a otra herramienta.

## Patrones visibles en las referencias

| Elemento | Observación | Regla de implementación |
|---|---|---|
| Navegación | Barra lateral oscura con icono y texto; elemento activo claramente destacado | Mantener seis destinos estables, indicador activo y nombres legibles |
| Área principal | Fondo gris muy claro, tarjetas blancas y encabezado compacto | Reservar superficies sólidas y márgenes constantes para separar tareas |
| Dashboard | Cuatro KPI, movimientos recientes y distribución de stock | Cifras reales, unidad explícita y enlaces a las tareas correspondientes |
| Listados | Tablas con encabezados, filtros y acciones por fila | Alinear números a la derecha; mostrar categoría/proveedor junto al producto |
| Formularios | Acción de creación claramente identificable | Un botón primario por formulario, cancelación secundaria y validación cercana al campo |
| Semántica | Verde en entradas/activos, rojo en salidas/alertas, ámbar en ajustes | Conservar texto y símbolos además del color |
| Marca | Identidad institucional y título de sistema en la muestra | Mostrar el logo SENATI proporcionado por el usuario en el encabezado lateral |

## Paleta base extraída y normalizada

| Token | Valor | Uso |
|---|---|---|
| `--nav-bg` | `#172336` | Navegación lateral |
| `--nav-text` | `#DCE5EE` | Etiquetas de navegación |
| `--canvas` | `#F4F6F8` | Fondo de la aplicación |
| `--surface` | `#FFFFFF` | Formularios, tablas y KPI |
| `--text-900` | `#182334` | Títulos, valores y texto principal |
| `--text-600` | `#526171` | Descripciones y etiquetas secundarias |
| `--border` | `#DDE4EB` | Separadores de baja prominencia |
| `--border-strong` | `#A8B6C5` | Bordes de controles y límites que requieren identificación |
| `--accent` | `#275BBF` | Botón primario, enlace y estado activo |
| `--accent-hover` | `#204A9C` | Hover y pressed de acción primaria |
| `--accent-soft` | `#EAF0FB` | Fondo de selección |
| `--success` | `#116644` | Entrada, operación completada y usuario activo |
| `--success-soft` | `#E8F5EE` | Fondo de estado positivo |
| `--danger` | `#A82C35` | Salida, error y acción destructiva |
| `--danger-soft` | `#FCEDEF` | Fondo de alerta |
| `--warning` | `#79520D` | Ajuste o advertencia |
| `--warning-soft` | `#FFF4D7` | Fondo de advertencia |

La paleta base describe las referencias. Para la implementación final, reemplazar sus tokens con el tema personalizado siguiente.

## Tema personalizado: Senati Sobrio

Se aplica la vía "Create your Own Theme" de `theme-factory` a la preferencia del usuario. La portada y los encabezados azules de la guía inspiran el acento; la interfaz utiliza versiones más contenidas y fondos neutros para mantener legibles formularios y tablas. No se reproduce el logotipo ni se atribuye la app a SENATI.

| Token | Valor | Aplicación |
|---|---|---|
| `--brand-blue` | `#1400D2` | Referencia de azul intenso del PDF, normalizada visualmente; pequeños detalles de marca |
| `--nav-bg` | `#101A33` | Sidebar y fondos destacados del informe |
| `--nav-text` | `#C4CDE1` | Navegación secundaria sobre navy |
| `--canvas` | `#F5F7FC` | Fondo gris frío de la aplicación |
| `--surface` | `#FFFFFF` | Tarjetas y formularios |
| `--text-900` | `#15213A` | Títulos, valores y texto principal |
| `--text-600` | `#53617B` | Descripciones y texto secundario |
| `--border` | `#DDE3F0` | Separadores y contornos de tarjeta |
| `--border-strong` | `#9AA9C2` | Controles que requieren identificación clara |
| `--accent` | `#153EC5` | Acción primaria, selección y primera serie de datos |
| `--accent-hover` | `#0F2F99` | Hover y pressed |
| `--accent-soft` | `#EBEFFE` | Selección suave y fondo de iconos |
| `--focus` | `#3969EC` | Contorno de foco de 2 px, offset de 3 px |
| `--success` | `#126348` | Confirmación y entrada, siempre acompañado de texto |
| `--danger` | `#AC2B3D` | Error, salida y acción destructiva |
| `--warning` | `#805300` | Ajuste y advertencia |

Contrastes sRGB calculados: blanco/azul primario 8.31:1; blanco/hover 11.13:1; navegación secundaria/navy 10.81:1; texto secundario/canvas 5.82:1; texto principal/blanco 16.02:1; blanco/verde 7.23:1; blanco/rojo 6.63:1; blanco/ámbar 6.66:1; foco/blanco 4.77:1. Estos pares superan 4.5:1; comprobar además los estados reales y cualquier combinación adicional.

Tipografía del tema personalizado: **Inter** para la interfaz y **DejaVu Sans** para el informe. Inter ya se sirve localmente en el proyecto, evita una descarga adicional y mantiene una lectura nítida en tablas. DejaVu Sans ofrece cobertura fiable de acentos y símbolos en el PDF. JetBrains Mono queda reservado a identificadores y fragmentos de código. No es una sustitución del tema Ocean Depths: es la definición de un tema propio solicitado por el usuario.

Usar azul/navy para identidad y jerarquía; reservar verde, rojo y ámbar para el significado de los movimientos y mensajes. Para gráficas, preferir una serie azul y diferencias de luminosidad cuando se comparen categorías, sin convertir cada tarjeta en un color independiente.

## Tipografía

La guía muestra sans serif de alto contraste y numerales claros. Las familias exactas no son identificables en las fotografías. El proyecto ya usa Inter y JetBrains Mono; pueden mantenerse en la paleta base.

| Estilo | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| Título de pantalla | 28 / 36 px | 700 | Dashboard, Productos, Kardex |
| Título de tarjeta | 16 / 24 px | 600 | Formularios, tablas, gráficos |
| Valor KPI | 32 / 40 px | 700 | Conteos y unidades |
| Texto base | 14 / 21 px | 400 | Filas, descripción y navegación |
| Campo/control | 14 / 20 px; 16 px en móvil | 400 | Evitar zoom involuntario al enfocar controles móviles |
| Etiqueta | 13 / 18 px | 600 | Nombre de campo |
| Texto auxiliar | 12 / 18 px | 400 | Ayudas y fecha |
| ID técnico | 12 / 18 px | 400 | Familia mono solo para ID o código corto |

Usar `font-variant-numeric: tabular-nums` en precios, stock, cantidades y KPI. Limitar mayúsculas a rótulos breves; los párrafos y mensajes van en caja normal.

## Espaciado y composición

- Escala: 4, 8, 12, 16, 24, 32 y 48 px.
- Sidebar de escritorio: 232-248 px. Encabezado: 60-64 px.
- Margen de contenido: 32 px en escritorio, 24 px en tablet, 16 px en móvil.
- Espacio entre tarjetas: 24 px; padding interno: 20-24 px; separación etiqueta-control: 8 px.
- Radio de tarjeta: 12 px. Radio de controles: 8 px. Bordes de 1 px.
- Sombra: `0 2px 8px rgb(26 35 50 / 5%)`, solo para elevar superficies útiles.
- Ancho de contenido útil máximo: 1440 px. No estirar formularios de una columna de forma indefinida.
- Formularios junto a listados en escritorio; apilados en móvil. La columna del formulario puede ocupar 32-36% mientras los datos reciben el resto.

## Componentes y estados

### Navegación

- Iconos Lucide de 18-20 px con etiqueta textual. Un `nav` con nombre accesible.
- El estado activo combina fondo, texto fuerte e indicador; debe quedar visible con teclado.
- En móvil, una barra de destinos con desplazamiento horizontal o menú compacto. Evitar tres filas de grupos que ocupen gran parte de la pantalla.
- No representar un usuario autenticado si la aplicación aún no tiene inicio de sesión.

### Botones y acciones

- Altura mínima 40 px en escritorio y área de interacción de 44 px en pantallas táctiles.
- Primario relleno; secundario de borde; destructivo con texto y color semántico.
- Iconos sin texto requieren `aria-label` comprensible en español, no nombres técnicos de campos.
- Estado pendiente: texto de acción en curso y botón desactivado para evitar envíos duplicados.
- Focus: outline visible de 2 px y offset de 3 px; comprobar contraste con el fondo.

### Formularios

- Etiqueta visible asociada mediante `htmlFor`/`id` o nombre accesible equivalente.
- Categoría y proveedor obligatorios: opciones alimentadas por la API; el mensaje debe explicar si primero se necesita registrar una referencia.
- Stock editable únicamente al crear producto. Al editar, mostrar el valor y un enlace a Kardex para cambiarlo.
- Mostrar ayuda: el stock inicial crea una entrada automática.
- Errores visibles próximos al formulario, `role="alert"` y foco manejable. No confiar únicamente en validaciones del navegador.

### Tablas

- Encabezado distinguible, altura de fila entre 44 y 52 px, alineación numérica a la derecha.
- En móvil, scroll horizontal contenido dentro de la tabla; no generar scroll horizontal de toda la página.
- Estado vacío explica la siguiente acción. Estado de carga distinto del estado vacío.
- Una avería de la API debe mostrarse como error; no presentar ceros o inventario saludable a falta de datos.

### Dashboard y gráficos

- Cada gráfico consume datos reales desde la API. Mostrar nombre, unidad y valores, también fuera de la representación visual.
- Distribución por categoría: barras horizontales simples con valor de unidades y nombre completo; la longitud usa una escala común cuyo origen es cero.
- Donut opcional solo si la leyenda incluye cantidad/porcentaje; barras son más legibles para nombres largos y tamaños pequeños.
- Sin datos: texto explicativo. No inventar tendencias, porcentajes de crecimiento ni datos de relleno.
- Estado de bajo stock: umbral explícito de menos de 10 unidades y enlace a productos.

### Kardex

- Entrada, salida y ajuste con etiqueta, signo e icono además del color.
- Mostrar stock actual y resultado previsto antes de registrar.
- El historial debe incluir fecha, producto, responsable, tipo, cantidad y observación.
- Para stock inicial, mostrar responsable "Sistema" y observación explicativa.
- Un rechazo por stock insuficiente debe conservar los valores del formulario para corregirlos.

## Movimiento

Las fotografías no permiten inferir animaciones. Propuesta de implementación: transiciones de color y opacidad de 120-180 ms, `ease-out`, sin efectos decorativos continuos. Respetar `prefers-reduced-motion: reduce`. Evitar animar medidas de layout o gráficos de forma que se oculten los valores.

## Responsive y accesibilidad

- Desktop >= 1024 px: sidebar, cuatro KPI en fila y composición en columnas.
- Tablet 768-1023 px: navegación compacta, dos KPI por fila y formularios ajustados al ancho disponible.
- Móvil <= 767 px: una columna de contenido; los KPI pueden ocupar dos columnas solo si su texto permanece legible; a 390 px probar desbordes y controles completos.
- Comprobar al menos 1440 px y 390 px, zoom 200%, tabulación y foco. Ningún destino principal debe desaparecer sin sustituto accesible.
- Contraste objetivo: 4.5:1 para texto normal y 3:1 para elementos gráficos esenciales/texto grande.
- Mantener encabezados semánticos, botones reales, nombres en español y alternativas textuales para gráficos.
- No se observa modo oscuro integral en las referencias: la sidebar oscura es parte del diseño claro. No anunciar un modo oscuro que no esté implementado.

## Criterios de aceptación visual

1. Las seis vistas comparten paleta, tipografía, espaciado y componentes.
2. El dashboard muestra datos reales y los errores de conexión no se confunden con ceros.
3. No hay texto cortado, superposiciones ni desbordes globales a 1440 y 390 px.
4. La relación categoría/proveedor se entiende en formulario y listado.
5. El Kardex distingue los tres tipos sin depender solo del color.
6. Las capturas del informe pertenecen a la ejecución final comprobada.


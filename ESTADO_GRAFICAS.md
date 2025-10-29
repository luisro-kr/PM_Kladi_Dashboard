# Estado de Gráficas del Dashboard - PM Kladi

**Última actualización:** 29 de octubre de 2025

> **Dashboard Simplificado:** El dashboard ahora se enfoca en 7 gráficas esenciales que proporcionan las métricas clave de negocio. Se eliminaron gráficas redundantes y pendientes de revisión para mantener claridad y enfoque.

---

## 📊 Gráficas Completadas ✅

### 1. **Estado de Empresas (Semáforo)**
- **Estado:** ✅ TERMINADO
- **Descripción:** Muestra la distribución de empresas en 3 categorías según actividad reciente
- **Características implementadas:**
  - Slider ajustable de 1-60 días (default: 7 días)
  - Categorías: Activos (verde), Exploradores (amarillo), Inactivos (rojo)
  - Gráfico de pie con porcentajes y cantidades
  - Indicadores claramente definidos:
    - **Activos:** Actividad comercial (ventas, facturas, cotizaciones) en últimos N días
    - **Exploradores:** Actividad exploratoria (clientes, proveedores, artículos) sin actividad comercial en últimos N días
    - **Inactivos:** Sin ninguna actividad en últimos N días
- **Fuente de datos:** Columnas de "última actividad" (O, Q, S, U, W, Y)

---

### 2. **Evolución de Estado de Empresas por Mes**
- **Estado:** ✅ TERMINADO
- **Descripción:** Muestra cómo ha evolucionado el estado de las empresas mes a mes
- **Características implementadas:**
  - Gráfico de líneas apiladas por mes
  - Se sincroniza con el slider del semáforo
  - Muestra tendencias de activación, exploración e inactividad
  - Permite identificar patrones estacionales
- **Fuente de datos:** Fecha de creación de empresa + columnas de última actividad

---

### 3. **Adopción de Funcionalidades**
- **Estado:** ✅ TERMINADO
- **Descripción:** Muestra el porcentaje de empresas que usan cada funcionalidad de la plataforma
- **Características implementadas:**
  - **Toggle de vista:** Histórico vs Últimos N días
  - Ordenamiento automático de mayor a menor adopción
  - Gráfico de barras horizontal con colores diferenciados
  - Tooltip mejorado que muestra:
    - Porcentaje de adopción
    - Cantidad de empresas (X de Y empresas)
    - Texto descriptivo según el período seleccionado
  - Funcionalidades monitoreadas: Tickets, Facturas, Cotizaciones, Clientes, Proveedores, Artículos
- **Fuente de datos:** 
  - Vista Histórica: Totales acumulados (columnas E, I, J, L, M, K)
  - Vista Reciente: Columnas de "última actividad" según slider

---

### 4. **Top 15 Empresas con Mayor Actividad**
- **Estado:** ✅ TERMINADO
- **Descripción:** Ranking de empresas basado en score ponderado de actividad global
- **Características implementadas:**
  - Sistema de scoring ponderado:
    - Clientes nuevos: 5,000x (máximo peso)
    - Facturas emitidas: 10,000x (muy alto peso)
    - Tickets generados: 50x
    - Cotizaciones: 100x
    - Artículos: 1x
    - Ventas totales: 0.001x (mínimo peso)
  - Tabla con 15 filas ordenadas por score
  - Indicadores de estado (Activo/Explorador/Inactivo) sincronizados con slider
  - Formato de moneda mexicano: $1,234.56
  - Muestra: Empresa, Tickets, Ventas, Facturas, Clientes
  - Leyenda con fórmula de scoring
- **Fuente de datos:** Columnas E, G, I, L + columnas de última actividad

---

### 5. **Top 15 Empresas por Ventas Totales**
- **Estado:** ✅ TERMINADO
- **Descripción:** Ranking de empresas por volumen de facturación histórica
- **Características implementadas:**
  - Ordenamiento por ventas totales (mayor a menor)
  - Tabla con 15 filas
  - Indicadores de estado sincronizados con slider
  - Formato de moneda mexicano: $1,234.56
  - Muestra: Empresa, Ventas, Tickets, Facturas, Clientes
  - Badge color verde para diferenciarlo del ranking de actividad
- **Fuente de datos:** Columna G (total_ventas) + columnas complementarias

---

### 6. **Evolución de Churn y Retención Mensual** ⚠️
- **Estado:** ⏳ PENDIENTE DE REVISIÓN (con etiqueta visible en dashboard)
- **Descripción:** Análisis mensual de churn (pérdida de clientes) vs retención (clientes activos)
- **Características implementadas:**
  - Gráfico combinado (barras apiladas + líneas)
  - Barras: Empresas Activas (verde) e Inactivas/Churn (rojo)
  - Líneas: % Retención (verde sólida) y % Churn (roja discontinua)
  - Tooltip detallado con:
    - Total de empresas del mes
    - Empresas activas vs inactivas
    - Tasa de retención y churn en porcentaje
  - **Criterio de Churn:** Empresas sin actividad en los últimos 30 días del mes
  - **Criterio de Retención:** 100% - Churn%
  - ⚠️ **Etiqueta de advertencia visible:** Banner amarillo indicando que está pendiente de revisión
- **Fuente de datos:** 
  - Fecha de creación (columna A)
  - Últimas actividades (columnas O, Q, S, U, W, Y)
  - Lógica: Por cada mes, cuenta empresas que existían y tuvieron actividad en últimos 30 días
- **Limitación actual:** No detecta reactivaciones (empresas que vuelven después de inactividad). Para mejorar esto se necesitaría data mensual histórica de ingeniería.
- **Próxima mejora:** Cuando ingeniería proporcione datos de actividad mensual, se podrá calcular:
  - Churn real mes a mes (empresas que pasan de activas a inactivas)
  - Tasa de reactivación (empresas que vuelven)
  - Clientes "sticky" vs intermitentes

---

### 7. **Retención por Cohorte Mensual** ⚠️
- **Estado:** ⏳ PENDIENTE DE REVISIÓN (con etiqueta visible en dashboard)
- **Descripción:** Análisis de retención de empresas nuevas agrupadas por mes de registro (cohorte)
- **Características implementadas:**
  - Gráfico combinado (barras apiladas + líneas)
  - Barras: Empresas Retenidas (azul) y con Churn (naranja)
  - Líneas: % Retención (azul sólida) y % Churn (naranja discontinua)
  - Tooltip detallado con:
    - Mes de la cohorte (mes de registro)
    - Total de empresas nuevas en ese mes
    - Empresas retenidas (activas HOY en últimos 30 días)
    - Empresas con churn
    - Porcentajes de retención y churn de la cohorte
  - **Diferencia clave con gráfica #6:** 
    - Gráfica #6 = Churn acumulado (todas las empresas hasta ese mes)
    - Gráfica #7 = Churn por cohorte (solo empresas nuevas de ese mes específico)
  - ⚠️ **Etiqueta de advertencia visible:** Banner amarillo indicando que está pendiente de revisión
- **Fuente de datos:** 
  - Fecha de creación (columna A) - para identificar cohorte
  - Últimas actividades (columnas O, Q, S, U, W, Y) - para determinar si siguen activas HOY
- **Casos de uso:**
  - Identificar qué meses tuvieron mejor retención de nuevos clientes
  - Evaluar efectividad de onboarding en diferentes períodos
  - Detectar si hay estacionalidad en el abandono de clientes nuevos
  - Comparar calidad de adquisición mes a mes

---

## 🎯 Próximos Pasos Sugeridos

1. **Solicitar datos mensuales de actividad a ingeniería**
   - Para mejorar la precisión del análisis de churn
   - Formato sugerido: `empresa_id | mes | tuvo_actividad_comercial | tuvo_actividad_exploratoria`
   - Esto permitirá detectar reactivaciones y medir churn real

2. **Agregar más funcionalidades al dashboard**
   - Considerar nuevas métricas de valor de negocio
   - Explorar análisis de retención y churn por cohortes

3. **Optimizaciones posibles**
   - ¿Necesitan más gráficas filtros temporales?
   - ¿Hay métricas adicionales que quieras ver?

---

## 📝 Cambios Recientes

- **29/10/2025:** 
  - ✅ Corregido formato de moneda a mexicano en todo el dashboard
  - ✅ Agregado toggle Histórico/Reciente en Adopción de Funcionalidades
  - ✅ Implementada tabla Top 15 por Ventas Totales
  - ✅ Ajustada fórmula de scoring en Top 15 por Actividad
  - ✅ Mejorados tooltips con más información contextual
  - 🗑️ **Eliminada gráfica "Crecimiento de Empresas"** (redundante con "Evolución de Estado por Mes")
  - 🗑️ **Eliminadas 6 gráficas pendientes de revisión:**
    - Ventas Totales por Mes
    - Tasa de Facturación
    - Top 10 Empresas por Ventas (gráfico - redundante con tabla Top 15)
    - Clientes y Proveedores Nuevos
    - Ticket Promedio - Top 10
    - Conversión de Cotizaciones
  - ✨ **Nueva gráfica: Evolución de Churn y Retención Mensual**
    - Mide pérdida de clientes (churn) y retención mes a mes
    - Barras apiladas + líneas de tendencia
    - Criterio: Empresas sin actividad en últimos 30 días del mes
  - ✨ **Nueva gráfica: Retención por Cohorte Mensual**
    - Análisis de retención de empresas nuevas por mes de registro
    - Muestra qué cohortes tienen mejor/peor retención
    - Útil para evaluar efectividad de onboarding
  - ⚠️ **Etiquetas de "Pendiente de Revisión":** Agregadas a ambas gráficas de churn (#6 y #7)
    - Banner amarillo visible con ícono de advertencia
    - Texto explicativo de qué se necesita de ingeniería
    - Facilita identificar qué gráficas requieren actualización futura
  - 🎨 **Mejora de legibilidad:** Leyendas con texto más oscuro y contrastado
  - ✨ **Dashboard ahora tiene 7 gráficas esenciales** enfocadas en métricas clave de negocio

---

## 📋 Notas Técnicas

### Sistema de Datos Limpiados
- **Filtros aplicados:**
  - Correos @kladi.mx (cuentas de prueba)
  - Correos @djkux.com (cuentas de prueba)
- **Deduplicación:**
  - Por nombre_empresa o correo_empresa
  - Criterio: Mayor score de actividad o más reciente
- **Resultado:** 2,344 empresas limpias (de 2,658 originales)

### Formato de Moneda
- **Formato mexicano implementado:** `$1,234.56`
- Aplicado en:
  - Todos los tooltips de gráficas con dinero
  - Ejes de gráficas con valores monetarios
  - Tablas Top 15

### Índices de Columnas (Google Sheets)
```
A (0):  fecha_creacion_empresa
B (1):  nombre_empresa
C (2):  empresa_id
D (3):  correo_empresa
E (4):  tickets_generados
F (5):  tickets_facturados
G (6):  total_ventas
H (7):  ticket_promedio
I (8):  facturas_emitidas
J (9):  cotizaciones_generadas
K (10): articulos_nuevos
L (11): clientes_nuevos
M (12): proveedores_nuevos
N (13): primera_venta
O (14): ultima_venta
P (15): primera_factura
Q (16): ultima_factura
R (17): primera_cotizacion
S (18): ultima_cotizacion
T (19): primer_cliente_nuevo
U (20): ultimo_cliente_nuevo
V (21): primer_registro_proveedor
W (22): ultimo_registro_proveedor
X (23): primer_articulo_agregado
Y (24): ultimo_articulo_agregado
```


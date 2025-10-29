# 🎯 Dashboard PM Kladi - Ajustado con Datos Reales

## ✅ Migración Completada

El dashboard ha sido completamente rediseñado para trabajar con los **datos reales** de tu Google Sheet "Metricas Empresas".

---

## 📊 **Estructura de Datos Real**

### Columnas de Google Sheets (25 total):

| Col | Nombre | Descripción | Uso en Dashboard |
|-----|--------|-------------|------------------|
| A | `fecha_creacion_empresa` | Fecha de registro de la empresa | Crecimiento por mes, segmentación temporal |
| B | `nombre_empresa` | Nombre de la empresa | Identificación, rankings |
| C | `empresa_id` | ID único | Referencia |
| D | `correo_empresa` | Email de contacto | (No usado actualmente) |
| E | `tickets_generados` | Total de tickets creados | Actividad, volumen de operaciones |
| F | `tickets_facturados` | Tickets que se facturaron | Tasa de facturación, conversión |
| G | `total_ventas` | Suma total de ventas ($) | Revenue, rankings, tendencias |
| H | `ticket_promedio` | Valor promedio por ticket | Monetización, segmentación |
| I | `facturas_emitidas` | Cantidad de facturas | Adopción de feature, actividad |
| J | `cotizaciones_generadas` | Total de cotizaciones | Lead generation, funnel |
| K | `articulos_nuevos` | Productos agregados | Adopción, expansión de catálogo |
| L | `clientes_nuevos` | Clientes añadidos | Expansión, crecimiento de uso |
| M | `proveedores_nuevos` | Proveedores añadidos | Adopción, diversificación |
| N | `primera_venta` | Fecha de primera venta | Time to first value |
| O | `ultima_venta` | Fecha de última venta | **Actividad, estado de empresa** |
| P | `primera_factura` | Fecha de primera factura | Onboarding |
| Q | `ultima_factura` | Fecha de última factura | **Engagement reciente** |
| R | `primera_cotizacion` | Fecha de primera cotización | Onboarding |
| S | `ultima_cotizacion` | Fecha de última cotizacion | **Engagement reciente** |
| T | `primer_cliente_nuevo` | Primera adición de cliente | Onboarding |
| U | `ultimo_cliente_nuevo` | Último cliente añadido | **Expansión reciente** |
| V | `primer_registro_proveedor` | Primer proveedor agregado | Onboarding |
| W | `ultimo_registro_proveedor` | Último proveedor agregado | Actividad supply chain |
| X | `primer_articulo_agregado` | Primer producto agregado | Onboarding |
| Y | `ultimo_articulo_agregado` | Último producto agregado | Expansión de catálogo |

---

## 📈 **Métricas Implementadas (Basadas en Datos Reales)**

### 1. **Crecimiento de Empresas** 🚀
- **Qué muestra**: Empresas nuevas por mes + total acumulado
- **Cálculo**: Agrupa por `fecha_creacion_empresa` (mes/año)
- **Utilidad PM**: 
  - Medir tasa de adquisición de clientes
  - Identificar períodos de mayor crecimiento
  - Evaluar efectividad de campañas de marketing
  - Proyectar crecimiento futuro

### 2. **Ventas Totales por Mes** 💰
- **Qué muestra**: Suma de `total_ventas` y `tickets_generados` por mes
- **Cálculo**: Agrupa empresas por mes de creación, suma ventas
- **Utilidad PM**:
  - Evaluar revenue generado por cohorte
  - Identificar estacionalidad
  - Proyectar ingresos futuros
  - Correlacionar con lanzamientos de features

### 3. **Tasa de Facturación** 📋
- **Qué muestra**: `tickets_facturados` / `tickets_generados` × 100
- **Cálculo**: Por mes, calcula el ratio de conversión
- **Utilidad PM**:
  - Medir eficiencia del proceso de facturación
  - Identificar fricciones en el flujo
  - Evaluar mejoras en UX
  - Detectar problemas de product-market fit

### 4. **Top 10 Empresas por Ventas** 🏆
- **Qué muestra**: Las 10 empresas con mayor `total_ventas`
- **Cálculo**: Ordena por ventas descendente, toma top 10
- **Utilidad PM**:
  - Identificar high-value customers
  - Priorizar customer success
  - Definir segmento enterprise
  - Personalizar roadmap para clientes clave

### 5. **Adopción de Funcionalidades** 🎯
- **Qué muestra**: % de empresas que usan cada feature
- **Features medidas**:
  - Tickets (column E > 0)
  - Facturas (column I > 0)
  - Cotizaciones (column J > 0)
  - Clientes (column L > 0)
  - Proveedores (column M > 0)
  - Artículos (column K > 0)
- **Utilidad PM**:
  - Identificar features más adoptadas
  - Detectar features subutilizadas
  - Priorizar mejoras en onboarding
  - Decidir qué features deprecar

### 6. **Estado de Empresas** 🚦
- **Qué muestra**: Empresas activas, moderadas, inactivas
- **Cálculo** (basado en `ultima_venta`):
  - **Activas**: Última venta en últimos 30 días
  - **Moderadas**: Última venta entre 30-60 días
  - **Inactivas**: Sin ventas en >60 días o nunca
- **Utilidad PM**:
  - Medir health del producto
  - Identificar empresas en riesgo de churn
  - Activar campañas de reactivación
  - Calcular retención efectiva

### 7. **Clientes y Proveedores Nuevos** 👥
- **Qué muestra**: Total de `clientes_nuevos` y `proveedores_nuevos` por mes
- **Cálculo**: Suma por mes de creación
- **Utilidad PM**:
  - Medir expansión de uso
  - Evaluar sticky del producto
  - Proyectar network effects
  - Identificar crecimiento orgánico

### 8. **Ticket Promedio - Top 10** 💎
- **Qué muestra**: 10 empresas con mayor `ticket_promedio`
- **Cálculo**: Ordena por ticket promedio, filtra top 10
- **Utilidad PM**:
  - Identificar segmentos de alto valor
  - Optimizar pricing strategy
  - Definir tier enterprise
  - Priorizar features premium

### 9. **Conversión de Cotizaciones** 🔄
- **Qué muestra**: Ratio `tickets_facturados` / `cotizaciones_generadas`
- **Cálculo**: Por empresa, calcula tasa de conversión
- **Utilidad PM**:
  - Medir efectividad de sales funnel
  - Detectar problemas en propuesta de valor
  - Evaluar competitividad de precios
  - Optimizar flujo de aprobación

---

## 🎨 **Visualizaciones Implementadas**

### Tipos de Gráficas:
1. **ComposedChart** - Crecimiento (Barras + Línea)
2. **ComposedChart** - Ventas (Área + Barras)
3. **ComposedChart** - Tasa de Facturación (2 Barras + Línea)
4. **BarChart Horizontal** - Top 10 Ventas
5. **BarChart Vertical** - Adopción de Features
6. **BarChart** - Clientes y Proveedores
7. **BarChart Horizontal** - Ticket Promedio Top 10
8. **ComposedChart** - Conversión Cotizaciones
9. **Semáforo Visual** - Estado de Empresas (Custom)

---

## 🔍 **Cálculos Clave para PM**

### 1. Tasa de Activación Inicial
```javascript
empresas_con_primera_venta / total_empresas
```

### 2. Time to First Value
```javascript
primera_venta - fecha_creacion_empresa (en días)
```

### 3. Engagement Score por Feature
```javascript
// Ejemplo para Tickets
(empresas_con_tickets_generados / total_empresas) × 100
```

### 4. Tasa de Retención (30 días)
```javascript
empresas_activas_ultimos_30_dias / total_empresas_con_>30_dias
```

### 5. Expansión de Uso
```javascript
(clientes_nuevos_mes_actual - clientes_nuevos_mes_anterior) / 
 clientes_nuevos_mes_anterior × 100
```

---

## 🚀 **Cómo Usar el Dashboard**

### 1. Conectar tu Google Sheet Real

Edita `app/api/data/route.ts`:

```typescript
const SPREADSHEET_ID = 'TU_ID_AQUI'; // De la URL de Google Sheets
const API_KEY = 'TU_API_KEY_AQUI';    // De Google Cloud Console
const RANGE = 'Metricas Empresas!A1:Y';
```

### 2. Asegurar Permisos

1. Google Sheet debe ser **público** o compartido
2. API debe estar **habilitada** en Google Cloud
3. Rango debe coincidir: **'Metricas Empresas!A1:Y'**

### 3. Ejecutar Dashboard

```bash
npm run dev
```

Abre http://localhost:3000

---

## 📊 **Insights para Product Management**

### Preguntas que Puedes Responder:

#### Adquisición:
- ¿Cuántas empresas nuevas adquirimos por mes?
- ¿Cuál es la tendencia de crecimiento?
- ¿Qué meses tienen mejor adquisición?

#### Activación:
- ¿Qué % de empresas completan su primera venta?
- ¿Cuánto tiempo toma el time-to-first-value?
- ¿Qué features se adoptan primero?

#### Revenue:
- ¿Cuánto revenue genera cada cohorte?
- ¿Quiénes son nuestros high-value customers?
- ¿Cuál es el ticket promedio por segmento?

#### Retención:
- ¿Cuántas empresas están activas?
- ¿Cuál es la tasa de inactividad?
- ¿Qué empresas están en riesgo de churn?

#### Expansión:
- ¿Las empresas están agregando más clientes?
- ¿Están expandiendo su catálogo?
- ¿Qué features impulsan el growth?

#### Conversión:
- ¿Qué % de cotizaciones se facturan?
- ¿Qué % de tickets se facturan?
- ¿Dónde hay fricciones en el funnel?

---

## 💡 **Próximas Métricas Sugeridas**

### Corto Plazo:
1. **Cohort Retention** - Retención por mes de registro
2. **MRR/ARR** - Si tienes modelo de suscripción
3. **Feature Adoption Funnel** - Secuencia de adopción

### Mediano Plazo:
4. **Customer Lifetime Value** - Proyección de valor por empresa
5. **Churn Prediction** - ML model basado en actividad
6. **NPS Score** - Si recolectas feedback

### Largo Plazo:
7. **Product-Market Fit Score** - Combinación de métricas
8. **Expansion Revenue** - Crecimiento dentro de empresas existentes
9. **Network Effects** - Correlación clientes ↔ proveedores

---

## 🔧 **Modificaciones Realizadas**

### Archivos Creados:
- ✅ `app/components/DashboardReal.tsx` - Dashboard con métricas reales
- ✅ Datos mock actualizados en `route.ts` con estructura real

### Archivos Modificados:
- ✅ `app/api/data/route.ts` - Range cambiado a 'Metricas Empresas!A1:Y'
- ✅ `app/page.tsx` - Usa DashboardReal en lugar de Dashboard antiguo

### Archivos Deprecados (no se usan):
- ⚠️ `app/components/Dashboard.tsx` - Versión antigua (puede eliminarse)
- ⚠️ `app/components/ConversionSemaphore.tsx` - Reemplazado por semáforo integrado

---

## ✅ **Ventajas del Nuevo Dashboard**

### 1. **Datos Reales**
- Conecta directamente con tu Google Sheet
- No necesitas transformar datos manualmente
- Actualización automática al recargar

### 2. **Métricas Accionables**
- Cada métrica tiene purpose claro
- Visualizaciones fáciles de interpretar
- Insights directos para decisiones de PM

### 3. **Escalable**
- Fácil agregar nuevas métricas
- Modular y mantenible
- Preparado para integración con APIs

### 4. **Educativo**
- Cada gráfica tiene botón "Descripción"
- Explica qué, para qué, y de dónde vienen los datos
- Ideal para compartir con stakeholders

---

## 🎯 **Próximos Pasos Recomendados**

1. **Conecta tu Google Sheet real** con tus credenciales
2. **Valida los cálculos** contra tus expectativas
3. **Agrega filtros** por fecha o segmento
4. **Exporta reportes** en PDF/CSV
5. **Integra alertas** cuando métricas cambien significativamente
6. **Crea dashboards específicos** por rol (Executive, Sales, Product)

---

## 📞 **Soporte**

Si necesitas agregar más métricas o modificar visualizaciones:
1. Las funciones de procesamiento están en `processDataForCharts()`
2. Cada métrica está documentada con comentarios
3. Los componentes `ChartCard` son reutilizables
4. Puedes agregar nuevas gráficas fácilmente

---

**✨ Dashboard listo para usarse con datos reales de Product Management ✨**

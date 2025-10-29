# 🚦 Cambios Implementados en el Semáforo de Empresas

## 📋 Resumen Ejecutivo

Se rediseñó completamente el **Semáforo de Estado de Empresas** según las especificaciones del usuario. Ahora categoriza empresas en 3 grupos con lógica personalizada y un slider ajustable para el período de análisis.

---

## ✅ Cambios Implementados

### 1. **Nueva Categorización**

#### 🟢 ACTIVOS (antes "Activas")
**Antes:** Empresas con ventas en últimos 30 días fijos  
**Ahora:** Empresas con tickets/facturas/cotizaciones en últimos N días (ajustable)

**Criterios:**
- Al menos 1 actividad comercial (`ultima_venta`, `ultima_factura`, `ultima_cotizacion`) en últimos N días
- Columnas: 14, 16, 18

---

#### 🟡 EXPLORADORES (antes "Moderadas")
**Antes:** Empresas con ventas entre 30-60 días  
**Ahora:** Empresas configurando la plataforma SIN actividad comercial

**Criterios:**
- Al menos 1 actividad exploratoria (`ultimo_articulo_agregado`, `ultimo_cliente_nuevo`, `ultimo_registro_proveedor`) en últimos N días
- PERO sin actividad comercial en esos N días
- Columnas: 20, 22, 24 (excluyendo 14, 16, 18)

---

#### 🔴 INACTIVOS (antes "Inactivas")
**Antes:** Empresas sin ventas en >60 días  
**Ahora:** Empresas que tenían actividad pero dejaron de usar la plataforma

**Criterios:**
- Tienen al menos 1 actividad histórica en cualquier columna `ultima_*`
- PERO no tienen ninguna actividad en los últimos N días
- Verifica todas las columnas: 14, 16, 18, 20, 22, 24

---

### 2. **Slider de Días (0-60)**

**Características:**
- Rango: 1 a 60 días
- Valor por defecto: 30 días
- Actualización en tiempo real (sin recargar página)
- Ubicación: Encabezado del semáforo

**Funcionalidad:**
```javascript
const [diasInactividad, setDiasInactividad] = useState(30);
const haceNDias = new Date(hoy.getTime() - diasInactividad * 24 * 60 * 60 * 1000);
```

---

### 3. **Total de Usuarios Nuevos**

**Nuevo elemento:** Contador en el encabezado del semáforo  
**Muestra:** Total de empresas registradas desde el inicio  
**Cálculo:** `data.length - 1` (excluyendo header)

**Visualización:**
```
Total de empresas registradas: 24
```

---

### 4. **Actualización de Lógica de Cálculo**

#### Código anterior (DashboardReal.tsx):
```javascript
// Empresas Activas vs Inactivas (lógica antigua)
const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
const hace60Dias = new Date(hoy.getTime() - 60 * 24 * 60 * 60 * 1000);

const empresasActivas = {
  activas: rows.filter(r => r[14] && new Date(r[14]) >= hace30Dias).length,
  moderadas: rows.filter(r => r[14] && new Date(r[14]) >= hace60Dias && new Date(r[14]) < hace30Dias).length,
  inactivas: rows.filter(r => !r[14] || new Date(r[14]) < hace60Dias).length,
};
```

#### Código nuevo:
```javascript
// Semáforo: Empresas Activas vs Exploradores vs Inactivos
const hoy = new Date();
const haceNDias = new Date(hoy.getTime() - diasInactividad * 24 * 60 * 60 * 1000);

// ACTIVOS: Empresas con actividad comercial en últimos N días
const activos = rows.filter(row => {
  const ultimaVenta = row[14] ? new Date(row[14]) : null;
  const ultimaFactura = row[16] ? new Date(row[16]) : null;
  const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
  
  return (ultimaVenta && ultimaVenta >= haceNDias) ||
         (ultimaFactura && ultimaFactura >= haceNDias) ||
         (ultimaCotizacion && ultimaCotizacion >= haceNDias);
}).length;

// EXPLORADORES: Empresas con actividad exploratoria PERO SIN actividad comercial
const exploradores = rows.filter(row => {
  const ultimaVenta = row[14] ? new Date(row[14]) : null;
  const ultimaFactura = row[16] ? new Date(row[16]) : null;
  const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
  
  const ultimoClienteNuevo = row[20] ? new Date(row[20]) : null;
  const ultimoProveedor = row[22] ? new Date(row[22]) : null;
  const ultimoArticulo = row[24] ? new Date(row[24]) : null;
  
  const sinActividadComercial = 
    (!ultimaVenta || ultimaVenta < haceNDias) &&
    (!ultimaFactura || ultimaFactura < haceNDias) &&
    (!ultimaCotizacion || ultimaCotizacion < haceNDias);
  
  const conActividadExploratoria =
    (ultimoClienteNuevo && ultimoClienteNuevo >= haceNDias) ||
    (ultimoProveedor && ultimoProveedor >= haceNDias) ||
    (ultimoArticulo && ultimoArticulo >= haceNDias);
  
  return sinActividadComercial && conActividadExploratoria;
}).length;

// INACTIVOS: Empresas que tenían actividad pero NO en los últimos N días
const inactivos = rows.filter(row => {
  const tieneActividadHistorica = row[14] || row[16] || row[18] || row[20] || row[22] || row[24];
  if (!tieneActividadHistorica) return false;
  
  const ultimaVenta = row[14] ? new Date(row[14]) : null;
  const ultimaFactura = row[16] ? new Date(row[16]) : null;
  const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
  const ultimoClienteNuevo = row[20] ? new Date(row[20]) : null;
  const ultimoProveedor = row[22] ? new Date(row[22]) : null;
  const ultimoArticulo = row[24] ? new Date(row[24]) : null;
  
  const ningunActividadReciente =
    (!ultimaVenta || ultimaVenta < haceNDias) &&
    (!ultimaFactura || ultimaFactura < haceNDias) &&
    (!ultimaCotizacion || ultimaCotizacion < haceNDias) &&
    (!ultimoClienteNuevo || ultimoClienteNuevo < haceNDias) &&
    (!ultimoProveedor || ultimoProveedor < haceNDias) &&
    (!ultimoArticulo || ultimoArticulo < haceNDias);
  
  return ningunActividadReciente;
}).length;

const empresasActivas = {
  activos,
  exploradores,
  inactivos,
  totalEmpresas: rows.length,
};
```

---

### 5. **Actualización de Visualización (UI)**

#### Antes:
```jsx
<h3>Activas</h3>
<p>{chartData.empresasActivas.activas}</p>
<p>Últimos 30 días</p>
```

#### Ahora:
```jsx
<div className="flex justify-between items-center mb-6">
  <div>
    <h2>Estado de Empresas</h2>
    <p>Total de empresas registradas: <span>{chartData.empresasActivas.totalEmpresas}</span></p>
  </div>
  
  {/* Slider de días */}
  <div className="bg-gray-50 rounded-lg p-4 min-w-[280px]">
    <label>Período de análisis: <span>{diasInactividad} días</span></label>
    <input
      type="range"
      min="1"
      max="60"
      value={diasInactividad}
      onChange={(e) => setDiasInactividad(Number(e.target.value))}
    />
  </div>
</div>

{/* Categorías */}
<h3>Activos</h3>
<p>{chartData.empresasActivas.activos}</p>
<p>Tickets, facturas o cotizaciones en últimos {diasInactividad} días</p>

<h3>Exploradores</h3>
<p>{chartData.empresasActivas.exploradores}</p>
<p>Artículos, clientes o proveedores (sin actividad comercial)</p>

<h3>Inactivos</h3>
<p>{chartData.empresasActivas.inactivos}</p>
<p>Tenían actividad pero no en últimos {diasInactividad} días</p>
```

---

## 📊 Resultados con Datos Mock (30 días)

Con los datos mock actuales y **diasInactividad = 30**:

- **Activos:** ~22 empresas (aquellas con última venta/factura/cotización en octubre 2025)
- **Exploradores:** ~0-2 empresas (tienen artículos/clientes recientes pero no ventas)
- **Inactivos:** ~0-2 empresas (tenían actividad pero no en últimos 30 días)
- **Total:** 24 empresas

*Nota: Los números exactos dependen de la fecha actual del sistema (hoy es 29 de octubre 2025).*

---

## 🎯 Ventajas del Nuevo Sistema

### 1. **Flexibilidad**
- El slider permite análisis en múltiples ventanas de tiempo
- Útil para detectar tendencias de corto (7 días) y largo plazo (60 días)

### 2. **Precisión**
- **Activos** se identifican por actividad comercial real, no solo ventas
- **Exploradores** se separan de activos, permitiendo onboarding específico
- **Inactivos** solo incluyen empresas con historial (no empresas recién creadas sin actividad)

### 3. **Accionabilidad**
Cada categoría tiene acciones claras:
- Activos → Retener y expandir
- Exploradores → Acelerar onboarding
- Inactivos → Reactivar urgentemente

### 4. **Exclusividad**
- Una empresa solo puede estar en UNA categoría
- Prioridad: Activos > Exploradores > Inactivos
- No hay ambigüedad

---

## 🔧 Archivos Modificados

### 1. `app/components/DashboardReal.tsx`
**Cambios:**
- Agregado estado `diasInactividad` (línea 35)
- Reescrita función `processDataForCharts()` - sección empresasActivas (líneas 158-228)
- Actualizada visualización del semáforo con slider (líneas 310-390)
- Cambiado objeto de retorno inicial (línea 73)

### 2. `app/globals.css`
**Sin cambios:** Los estilos del slider ya existían.

### 3. **Nuevos archivos de documentación:**
- `SEMAFORO_EMPRESAS.md` - Documentación completa del semáforo
- `CAMBIOS_SEMAFORO.md` - Este archivo

---

## 🧪 Testing Realizado

### ✅ Compilación
```bash
npm run dev
# ✓ Ready in 3.4s
# No TypeScript errors
```

### ✅ Verificación de Lógica
- Empresas con `ultima_venta = 2025-10-28` → **Activos** ✅
- Empresas con `ultimo_articulo_agregado = 2025-10-27` pero sin ventas recientes → **Exploradores** ✅
- Empresas con `ultima_venta = 2025-08-15` (>30 días) → **Inactivos** ✅

### ✅ Slider
- Cambio de 30 → 7 días → Números se recalculan en tiempo real ✅
- Cambio de 30 → 60 días → Más empresas se vuelven activas ✅

---

## 📚 Documentación Actualizada

### Nuevos documentos:
1. **SEMAFORO_EMPRESAS.md**
   - Definición de cada categoría
   - Criterios de inclusión
   - Fórmulas de cálculo
   - Casos de uso para PM
   - Ejemplos de interpretación

2. **CAMBIOS_SEMAFORO.md**
   - Este documento
   - Log de cambios técnicos
   - Antes/después de código
   - Testing realizado

---

## 🚀 Próximos Pasos Sugeridos

### 1. Conectar Google Sheets Real
- Actualizar `SPREADSHEET_ID` y `API_KEY` en `app/api/data/route.ts`
- Verificar que las fechas en Google Sheets estén en formato correcto

### 2. Validar con Datos Reales
- Revisar que los números de Activos/Exploradores/Inactivos sean coherentes
- Ajustar el valor por defecto del slider si es necesario

### 3. Agregar Métricas Derivadas
- **Tasa de activación:** % de Exploradores que pasan a Activos por mes
- **Tasa de churn:** % de Activos que pasan a Inactivos por mes
- **Time to Activation:** Días promedio de Explorador a Activo

### 4. Alertas Automatizadas
- Email cuando % Inactivos > 40%
- Notificación cuando empresa Activa pasa 15 días sin actividad
- Celebración cuando Explorador se activa

---

## 📊 Comparación Antes/Después

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Categorías** | Activas / Moderadas / Inactivas | Activos / Exploradores / Inactivos |
| **Período** | Fijo (30, 60 días) | Ajustable (1-60 días) |
| **Criterio Activos** | Solo última venta | Venta O factura O cotización |
| **Criterio Exploradores** | Ventas entre 30-60 días | Artículos/clientes/proveedores SIN ventas |
| **Criterio Inactivos** | Sin ventas >60 días | Sin ninguna actividad en N días |
| **Total empresas** | No visible | Visible en encabezado |
| **Flexibilidad** | Baja | Alta (slider) |
| **Accionabilidad** | Media | Alta (3 categorías claras) |

---

## ✅ Checklist de Implementación

- [x] Agregar estado `diasInactividad`
- [x] Implementar lógica ACTIVOS
- [x] Implementar lógica EXPLORADORES
- [x] Implementar lógica INACTIVOS
- [x] Agregar slider de días (1-60)
- [x] Mostrar total de empresas
- [x] Actualizar visualización UI
- [x] Actualizar descripciones de categorías
- [x] Compilar sin errores TypeScript
- [x] Testing con datos mock
- [x] Documentar cambios en SEMAFORO_EMPRESAS.md
- [x] Documentar cambios técnicos en este archivo

---

## 🎯 Impacto Esperado

### Para el Product Manager:
✅ Visibilidad clara del funnel de adopción  
✅ Detección temprana de churn  
✅ Priorización de intervenciones  
✅ Medición de efectividad de onboarding  

### Para el Negocio:
✅ Mayor retención de clientes  
✅ Activación más rápida  
✅ Reducción de churn  
✅ Mejor entendimiento del customer journey  

---

**Implementado:** Octubre 29, 2025  
**Dashboard:** http://localhost:3001  
**Documentación completa:** `SEMAFORO_EMPRESAS.md`  
**Componente:** `app/components/DashboardReal.tsx`

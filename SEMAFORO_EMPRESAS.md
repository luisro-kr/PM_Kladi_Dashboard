# 🚦 Semáforo de Estado de Empresas

## 📊 Descripción General

El **Semáforo de Empresas** es una métrica visual que categoriza a todas las empresas registradas en la plataforma según su nivel de actividad reciente. Permite identificar rápidamente qué empresas están activas, cuáles están explorando la plataforma y cuáles están en riesgo de churn.

---

## 🎯 Categorías del Semáforo

### 🟢 **ACTIVOS** (Verde)
**Definición:** Empresas con actividad comercial en los últimos N días.

**Criterios de inclusión:**
- Han generado al menos 1 **ticket** (venta) en los últimos N días, O
- Han emitido al menos 1 **factura** en los últimos N días, O
- Han creado al menos 1 **cotización** en los últimos N días

**Columnas utilizadas:**
- `ultima_venta` (columna 14)
- `ultima_factura` (columna 16)
- `ultima_cotizacion` (columna 18)

**Interpretación:**
- ✅ Empresas que están **usando activamente** la plataforma para su core business
- ✅ Están generando revenue o están en proceso de generar revenue
- ✅ **Bajo riesgo de churn**

**Acción recomendada:**
- Mantener engagement con producto
- Identificar upsell opportunities
- Recopilar feedback para mejoras

---

### 🟡 **EXPLORADORES** (Amarillo)
**Definición:** Empresas con actividad exploratoria PERO sin actividad comercial en los últimos N días.

**Criterios de inclusión:**
- Han agregado al menos 1 **artículo nuevo** en los últimos N días, O
- Han agregado al menos 1 **cliente nuevo** en los últimos N días, O
- Han agregado al menos 1 **proveedor nuevo** en los últimos N días

**Y además:**
- NO han tenido actividad comercial (tickets, facturas, cotizaciones) en esos N días

**Columnas utilizadas:**
- `ultimo_articulo_agregado` (columna 24)
- `ultimo_cliente_nuevo` (columna 20)
- `ultimo_registro_proveedor` (columna 22)

**Interpretación:**
- 🔍 Empresas que están **configurando** la plataforma
- 🔍 Están en proceso de **onboarding** o **exploración**
- 🔍 No han convertido a actividad comercial aún
- ⚠️ **Riesgo medio de churn** si no avanzan pronto

**Acción recomendada:**
- **Activar onboarding intensivo**
- Proveer tutoriales específicos sobre cómo usar tickets/facturas
- Contactar para entender barreras de adopción
- Ofrecer demos o sesiones de capacitación

---

### 🔴 **INACTIVOS** (Rojo)
**Definición:** Empresas que tenían actividad histórica pero NO han tenido ninguna actividad en los últimos N días.

**Criterios de inclusión:**
- Tienen al menos 1 registro de actividad histórica en cualquier columna `ultima_*`, Y
- NO tienen actividad en ninguna columna en los últimos N días

**Columnas utilizadas (todas las de actividad reciente):**
- `ultima_venta` (columna 14)
- `ultima_factura` (columna 16)
- `ultima_cotizacion` (columna 18)
- `ultimo_cliente_nuevo` (columna 20)
- `ultimo_registro_proveedor` (columna 22)
- `ultimo_articulo_agregado` (columna 24)

**Interpretación:**
- 🚨 Empresas que **dejaron de usar** la plataforma
- 🚨 **Alto riesgo de churn** (o ya churned)
- 🚨 Necesitan intervención urgente

**Acción recomendada:**
- **Campaña de reactivación inmediata**
- Contacto personal (llamada/email)
- Entender razones de inactividad
- Ofrecer incentivos para reactivación
- Considerar win-back campaigns

---

## ⚙️ Configuración del Período (Slider)

### 📏 **Días de Inactividad (N)**
El dashboard incluye un **slider ajustable** que permite modificar el período de análisis:

- **Rango:** 1 a 60 días
- **Valor por defecto:** 30 días
- **Función:** Determina qué tan "reciente" debe ser una actividad para considerar una empresa en cada categoría

### 🔄 **Cómo afecta el slider a cada categoría:**

#### Si **aumentas** el período (ej. de 30 a 45 días):
- ✅ **Activos:** Más empresas se considerarán activas (porque miras más atrás en el tiempo)
- 🟡 **Exploradores:** Más empresas se considerarán exploradores
- 🔴 **Inactivos:** Menos empresas se considerarán inactivas

#### Si **disminuyes** el período (ej. de 30 a 7 días):
- ✅ **Activos:** Menos empresas se considerarán activas (solo las muy recientes)
- 🟡 **Exploradores:** Menos empresas se considerarán exploradores
- 🔴 **Inactivos:** Más empresas se considerarán inactivas

---

## 📈 Métricas Clave del Semáforo

### Total de Empresas Registradas
**Muestra:** Todas las empresas desde el inicio del conteo (campo `fecha_creacion_empresa`).

**Cálculo:** `Total = Activos + Exploradores + Inactivos`

### Distribución Porcentual
```
% Activos = (Activos / Total) × 100
% Exploradores = (Exploradores / Total) × 100
% Inactivos = (Inactivos / Total) × 100
```

---

## 🎯 Casos de Uso para Product Managers

### 1. **Monitoreo de Salud del Producto**
- Si % Activos > 60%: Producto saludable ✅
- Si % Exploradores > 30%: Problema de onboarding ⚠️
- Si % Inactivos > 40%: Crisis de retención 🚨

### 2. **Priorización de Intervenciones**
```
Alta prioridad: Inactivos (reactivación urgente)
Media prioridad: Exploradores (acelerar onboarding)
Baja prioridad: Activos (mantener engagement)
```

### 3. **Análisis de Cohortes**
Combinar con `fecha_creacion_empresa` para:
- ¿Las empresas nuevas se activan más rápido?
- ¿Hay cohortes con mayor % de inactivos?
- ¿El tiempo de activación ha mejorado?

### 4. **Detección de Churn Predictivo**
- Empresas que pasan de **Activos → Exploradores**: Riesgo medio
- Empresas que pasan de **Activos → Inactivos**: Churn confirmado
- Empresas que nunca salen de **Exploradores**: Onboarding fallido

### 5. **Evaluación de Estrategias**
- Lanzar feature nueva → ¿aumentó % Activos?
- Campaña de onboarding → ¿disminuyó % Exploradores?
- Programa de reactivación → ¿disminuyó % Inactivos?

---

## 🔍 Insights Accionables

### Si % Activos es bajo:
- Revisar fricciones en el flujo de tickets/facturas
- Mejorar educación sobre features comerciales
- Analizar competencia

### Si % Exploradores es alto:
- Mejorar proceso de onboarding
- Agregar tutoriales in-app
- Ofrecer acompañamiento personalizado

### Si % Inactivos es alto:
- Investigar razones de churn (surveys)
- Identificar patrones comunes
- Implementar early warning system

---

## 📊 Fórmulas de Cálculo

### Fecha de Corte
```javascript
const hoy = new Date();
const haceNDias = new Date(hoy.getTime() - N * 24 * 60 * 60 * 1000);
```

### ACTIVOS
```javascript
activos = empresas.filter(empresa => {
  return (empresa.ultima_venta >= haceNDias) ||
         (empresa.ultima_factura >= haceNDias) ||
         (empresa.ultima_cotizacion >= haceNDias);
}).length;
```

### EXPLORADORES
```javascript
exploradores = empresas.filter(empresa => {
  const sinActividadComercial = 
    (!empresa.ultima_venta || empresa.ultima_venta < haceNDias) &&
    (!empresa.ultima_factura || empresa.ultima_factura < haceNDias) &&
    (!empresa.ultima_cotizacion || empresa.ultima_cotizacion < haceNDias);
  
  const conActividadExploratoria =
    (empresa.ultimo_cliente_nuevo >= haceNDias) ||
    (empresa.ultimo_registro_proveedor >= haceNDias) ||
    (empresa.ultimo_articulo_agregado >= haceNDias);
  
  return sinActividadComercial && conActividadExploratoria;
}).length;
```

### INACTIVOS
```javascript
inactivos = empresas.filter(empresa => {
  // Tiene alguna actividad histórica
  const tieneHistoria = empresa.ultima_venta || 
                        empresa.ultima_factura || 
                        empresa.ultima_cotizacion || 
                        empresa.ultimo_cliente_nuevo || 
                        empresa.ultimo_registro_proveedor || 
                        empresa.ultimo_articulo_agregado;
  
  if (!tieneHistoria) return false;
  
  // Pero NO tiene actividad reciente
  const ningunActividadReciente =
    (!empresa.ultima_venta || empresa.ultima_venta < haceNDias) &&
    (!empresa.ultima_factura || empresa.ultima_factura < haceNDias) &&
    (!empresa.ultima_cotizacion || empresa.ultima_cotizacion < haceNDias) &&
    (!empresa.ultimo_cliente_nuevo || empresa.ultimo_cliente_nuevo < haceNDias) &&
    (!empresa.ultimo_registro_proveedor || empresa.ultimo_registro_proveedor < haceNDias) &&
    (!empresa.ultimo_articulo_agregado || empresa.ultimo_articulo_agregado < haceNDias);
  
  return ningunActividadReciente;
}).length;
```

---

## 🚀 Ejemplos de Interpretación

### Escenario 1: Producto Saludable
```
Total Empresas: 100
Activos: 65 (65%)
Exploradores: 20 (20%)
Inactivos: 15 (15%)
```
**Interpretación:** Gran producto, onboarding funciona, baja tasa de churn.

---

### Escenario 2: Problema de Activación
```
Total Empresas: 100
Activos: 30 (30%)
Exploradores: 50 (50%)
Inactivos: 20 (20%)
```
**Interpretación:** Las empresas se registran pero no llegan a actividad comercial. **Acción:** Mejorar onboarding.

---

### Escenario 3: Crisis de Retención
```
Total Empresas: 100
Activos: 25 (25%)
Exploradores: 10 (10%)
Inactivos: 65 (65%)
```
**Interpretación:** Alto churn, producto no retiene. **Acción:** Investigar causas, programa urgente de reactivación.

---

## 📝 Notas Técnicas

### Manejo de Fechas Nulas
- Si una empresa NO tiene una fecha en ninguna columna `ultima_*`, NO entra en "Inactivos"
- Solo empresas con al menos 1 actividad histórica pueden ser "Inactivos"

### Exclusividad de Categorías
- Una empresa solo puede estar en **UNA** categoría
- Prioridad: Activos > Exploradores > Inactivos
- Si tiene actividad comercial → siempre es Activo (aunque también tenga exploratoria)

### Actualización en Tiempo Real
- El semáforo se recalcula cada vez que cambias el slider
- Los datos provienen de Google Sheets (actualización según frecuencia de sincronización)

---

## 🎨 Visualización

### Colores del Semáforo
- 🟢 **Verde (Activos):** `#10B981` - Color principal, pulso suave
- 🟡 **Amarillo (Exploradores):** `#F59E0B` - Alerta moderada
- 🔴 **Rojo (Inactivos):** `#EF4444` - Urgencia

### Iconografía
- ✅ **Activos:** Check mark (actividad confirmada)
- 📋 **Exploradores:** Clipboard (en configuración)
- 🚫 **Inactivos:** Prohibido (sin actividad)

---

## ✅ Checklist de Análisis Semanal

Como PM, revisa cada semana:

- [ ] ¿El % de Activos aumentó respecto a la semana pasada?
- [ ] ¿Hay empresas que pasaron de Exploradores a Activos? (conversión)
- [ ] ¿Hay empresas que pasaron de Activos a Inactivos? (churn)
- [ ] ¿El tiempo promedio de Exploradores a Activos disminuyó?
- [ ] ¿Alguna cohorte tiene % Inactivos anormalmente alto?
- [ ] ¿El slider en 7 días muestra tendencias diferentes vs 30 días?

---

**Dashboard:** `localhost:3001`  
**Componente:** `app/components/DashboardReal.tsx`  
**Actualizado:** Octubre 2025

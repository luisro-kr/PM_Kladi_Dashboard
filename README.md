# PM Kladi Dashboard - Product Manager Analytics (Datos Reales)

Dashboard de métricas para Product Management construido con Next.js 14, integrado con Google Sheets usando **datos reales de empresas**.

## 🎯 Descripción

Dashboard profesional que analiza métricas de 24 empresas en la plataforma Kladi. Los datos se obtienen de Google Sheets (hoja "Metricas Empresas") y se visualizan mediante gráficas interactivas con descripciones detalladas de cada métrica.

---

## ✨ Características Principales

### 📊 **9 Métricas Clave de Product Management**
1. ✅ **Crecimiento de Empresas** - Nuevas registros por mes + acumulado
2. ✅ **Ventas Totales** - Revenue y volumen de tickets por período
3. ✅ **Tasa de Facturación** - Conversión de tickets a facturas
4. ✅ **Top 10 por Ventas** - High-value customers
5. ✅ **Adopción de Features** - % uso de cada funcionalidad
6. ✅ **Estado de Empresas** - Activas/Moderadas/Inactivas (semáforo)
7. ✅ **Clientes y Proveedores** - Expansión de uso
8. ✅ **Ticket Promedio** - Segmentación por valor
9. ✅ **Conversión de Cotizaciones** - Sales funnel

### 🎨 **Diseño y UX**
- ✅ **Botón "Descripción"** en cada gráfica (qué, para qué, datos, fuente)
- ✅ **Semáforo visual** para estado de empresas
- ✅ **9 visualizaciones diferentes** (bars, lines, composed charts)
- ✅ **Diseño responsive** para desktop y móvil
- ✅ **Colores categorizados** por tipo de métrica

### 🔧 **Tecnología**
- ✅ **Next.js 14** con App Router y TypeScript
- ✅ **Google Sheets API** para datos en tiempo real
- ✅ **Recharts** para visualizaciones
- ✅ **Tailwind CSS** para diseño
- ✅ **Datos mock incluidos** con estructura real

---

## 📋 Datos de Google Sheets

### Estructura: "Metricas Empresas" (25 columnas)

Columnas principales:
- `fecha_creacion_empresa` - Registro de la empresa
- `nombre_empresa` - Identificación
- `tickets_generados` / `tickets_facturados` - Actividad
- `total_ventas` / `ticket_promedio` - Revenue
- `facturas_emitidas` / `cotizaciones_generadas` - Engagement
- `articulos_nuevos` / `clientes_nuevos` / `proveedores_nuevos` - Expansión
- `ultima_venta` / `ultima_factura` / `ultima_cotizacion` - **Actividad reciente**

**Ver [METRICAS_REALES.md](./METRICAS_REALES.md) para documentación completa de columnas.**

---

## 🚀 Getting Started

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/TechyLR/PM_Kladi_Dashboard.git

# Instalar dependencias
cd PM_Kladi_Dashboard
npm install

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### Configuración de Google Sheets

**Ver [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) para guía completa**

Resumen rápido:
1. Crea/abre tu Google Sheet "Metricas Empresas"
2. Asegúrate de tener las 25 columnas (A-Y)
3. Obtén SPREADSHEET_ID y API_KEY
4. Edita `app/api/data/route.ts`:

```typescript
const SPREADSHEET_ID = 'TU_ID_AQUI';
const API_KEY = 'TU_API_KEY_AQUI';
const RANGE = 'Metricas Empresas!A1:Y';
```

5. Reinicia el servidor

---

## 📁 Estructura del Proyecto

```
PM_Kladi_Dashboard/
├── app/
│   ├── api/
│   │   └── data/
│   │       └── route.ts              # API + datos mock reales
│   ├── components/
│   │   ├── DashboardReal.tsx         # Dashboard principal (NUEVO)
│   │   ├── ChartCard.tsx             # Card reutilizable
│   │   └── ChartDescriptionModal.tsx # Modal de descripciones
│   ├── page.tsx                      # Página principal
│   └── globals.css                   # Estilos
├── METRICAS_REALES.md               # Documentación de métricas (NUEVO)
├── GOOGLE_SHEETS_SETUP.md           # Guía de configuración
└── README.md                         # Este archivo
```

---

## 📊 Métricas Implementadas

### 1. Crecimiento de Empresas 📈
- **Qué**: Nuevas empresas por mes + total acumulado
- **Para qué**: Medir adquisición, identificar tendencias
- **Datos**: `fecha_creacion_empresa`

### 2. Ventas Totales 💰
- **Qué**: Revenue y tickets por mes
- **Para qué**: Evaluar revenue, proyectar ingresos
- **Datos**: `total_ventas`, `tickets_generados`

### 3. Tasa de Facturación 📋
- **Qué**: % de tickets que se facturan
- **Para qué**: Medir eficiencia del proceso
- **Datos**: `tickets_generados`, `tickets_facturados`

### 4. Top 10 por Ventas 🏆
- **Qué**: Empresas con mayores ventas
- **Para qué**: Identificar high-value customers
- **Datos**: `nombre_empresa`, `total_ventas`

### 5. Adopción de Features 🎯
- **Qué**: % empresas usando cada feature
- **Para qué**: Priorizar mejoras, detectar subutilización
- **Datos**: Uso de tickets, facturas, cotizaciones, clientes, proveedores, artículos

### 6. Estado de Empresas 🚦
- **Qué**: Activas (30d), Moderadas (30-60d), Inactivas (>60d)
- **Para qué**: Identificar churn risk, activar reactivación
- **Datos**: `ultima_venta`

### 7. Clientes y Proveedores Nuevos 👥
- **Qué**: Expansión de red por mes
- **Para qué**: Medir sticky, network effects
- **Datos**: `clientes_nuevos`, `proveedores_nuevos`

### 8. Ticket Promedio Top 10 💎
- **Qué**: Empresas con mayor ticket promedio
- **Para qué**: Segmentar por valor, optimizar pricing
- **Datos**: `ticket_promedio`, `total_ventas`

### 9. Conversión de Cotizaciones 🔄
- **Qué**: % cotizaciones que se facturan
- **Para qué**: Optimizar sales funnel
- **Datos**: `cotizaciones_generadas`, `tickets_facturados`

---

## 🎓 Casos de Uso para Product Managers

### 📈 Monitoreo de Crecimiento
- Tasa de adquisición mensual
- Proyección de empresas futuras
- Estacionalidad en registros

### 💰 Análisis de Revenue
- Revenue por cohorte
- Identificar high-value segments
- Optimizar pricing strategy

### 🔍 Salud del Producto
- Tasa de activación (primera venta)
- Retención efectiva
- Empresas en riesgo de churn

### 🚀 Optimización de Features
- Features más adoptadas
- Oportunidades de onboarding
- Candidates para deprecación

### 📊 Conversión y Funnel
- Tasa de facturación
- Conversión de cotizaciones
- Fricciones en el proceso

---

## 🛠️ Tecnologías Utilizadas

- **[Next.js 14](https://nextjs.org/)** - Framework React
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Recharts](https://recharts.org/)** - Visualizaciones
- **[Tailwind CSS](https://tailwindcss.com/)** - Diseño moderno
- **[Google Sheets API](https://developers.google.com/sheets/api)** - Datos en tiempo real

---

## 📡 API Endpoint

### GET /api/data

Obtiene datos de "Metricas Empresas" con fallback a mock data.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    ["fecha_creacion_empresa", "nombre_empresa", ...],
    ["2024-01-15", "TechCorp Solutions", ...],
    ...
  ],
  "range": "Metricas Empresas!A1:Y"
}
```

---

## 💡 Insights que Puedes Obtener

### Preguntas que Responde el Dashboard:

**Adquisición:**
- ¿Cuántas empresas nuevas por mes?
- ¿Cuál es la tendencia de crecimiento?

**Activación:**
- ¿Qué % completan su primera venta?
- ¿Qué features se adoptan primero?

**Revenue:**
- ¿Quiénes son los high-value customers?
- ¿Cuál es el ticket promedio?

**Retención:**
- ¿Cuántas empresas están activas?
- ¿Cuál es la tasa de inactividad?

**Expansión:**
- ¿Las empresas agregan más clientes?
- ¿Están expandiendo su catálogo?

**Conversión:**
- ¿Qué % de cotizaciones se facturan?
- ¿Dónde hay fricciones en el funnel?

---

## 🚀 Deploy en Vercel

```bash
# Build de producción
npm run build

# Deploy en Vercel
vercel deploy
```

O conecta tu repositorio en [Vercel](https://vercel.com/).

---

## 📚 Documentación Adicional

- **[METRICAS_REALES.md](./METRICAS_REALES.md)** - Documentación completa de métricas y cálculos
- **[GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)** - Guía de configuración de Google Sheets
- **[IMPLEMENTACION_COMPLETADA.md](./IMPLEMENTACION_COMPLETADA.md)** - Log de implementación

---

## 📝 Licencia

Ver archivo [LICENSE](./LICENSE).

---

## 👨‍💻 Autor

**TechyLR**
- GitHub: [@TechyLR](https://github.com/TechyLR)
- Repositorio: [PM_Kladi_Dashboard](https://github.com/TechyLR/PM_Kladi_Dashboard)

---

**✨ Dashboard optimizado para análisis real de Product Management ✨**

## ✨ Características Principales

### 📊 **15+ Métricas de Product Management**
- ✅ **Métricas de Crecimiento**: MRR/ARR, CAC vs LTV, NRR
- ✅ **Métricas de Usuario**: DAU/MAU, Feature Adoption, Stickiness
- ✅ **Métricas Financieras**: Churn Rate, Revenue by Plan, LTV
- ✅ **Métricas de Satisfacción**: NPS Score, Conversion Funnel
- ✅ **Ventas y Conversión**: Ventas mensuales, Cotizaciones, Empresas Activas

### 🎨 **UI/UX Avanzada**
- ✅ **Botón "Descripción"** en cada gráfica con modal informativo
- ✅ **Semáforo de Conversión** interactivo con slider de 1-30 días
- ✅ **Visualización de usuarios**: Activos, Exploración, Inactivos
- ✅ **Diseño responsive** optimizado para desktop y móvil
- ✅ **Animaciones suaves** y transiciones profesionales
- ✅ **Badges de categoría** para organización visual

### 🔧 **Tecnología**
- ✅ **Next.js 14** con App Router y TypeScript
- ✅ **Integración con Google Sheets API** para datos en tiempo real
- ✅ **Recharts** para visualizaciones interactivas
- ✅ **Tailwind CSS** para diseño moderno
- ✅ **Componentes modulares** reutilizables

## 📋 Métricas Implementadas

### 1. Semáforo de Conversión
- **Usuarios Activos**: Engagement regular
- **Usuarios en Exploración**: Onboarding/evaluación
- **Usuarios Inactivos**: Requieren reactivación
- Slider ajustable de 1-30 días para análisis temporal

### 2. Métricas de Crecimiento
- **MRR (Monthly Recurring Revenue)**: Ingresos recurrentes mensuales
- **CAC vs LTV**: Eficiencia de adquisición de clientes
- **NRR (Net Revenue Retention)**: Retención y expansión de ingresos

### 3. Métricas de Ventas
- **Ventas Mensuales**: Performance vs objetivo
- **Embudo de Cotizaciones**: Conversión de leads a clientes

### 4. Métricas de Usuario
- **DAU/MAU**: Usuarios activos diarios vs mensuales
- **Feature Adoption**: Uso de funcionalidades principales
- **Empresas Activas**: Segmentación por categoría

### 5. Métricas Financieras
- **Churn Rate**: Tasa de cancelación de clientes
- **Revenue by Plan**: Distribución de ingresos por tier

### 6. Métricas de Satisfacción
- **NPS Score**: Net Promoter Score
- **Conversion Funnel**: Análisis completo del embudo

## 🚀 Getting Started

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TechyLR/PM_Kladi_Dashboard.git

# Instalar dependencias
cd PM_Kladi_Dashboard
npm install

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Configuración de Google Sheets

**📖 Ver [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) para guía completa**

Resumen rápido:
1. Crea un Google Sheet con las 25 columnas requeridas
2. Obtén tu SPREADSHEET_ID y API_KEY de Google Cloud
3. Actualiza `app/api/data/route.ts` con tus credenciales
4. Reinicia el servidor

## 📁 Estructura del Proyecto

```
PM_Kladi_Dashboard/
├── app/
│   ├── api/
│   │   └── data/
│   │       └── route.ts              # API route con datos mock incluidos
│   ├── components/
│   │   ├── Dashboard.tsx             # Dashboard principal con todas las gráficas
│   │   ├── ChartCard.tsx             # Card reutilizable con botón descripción
│   │   ├── ChartDescriptionModal.tsx # Modal informativo de métricas
│   │   └── ConversionSemaphore.tsx   # Semáforo de conversión interactivo
│   ├── layout.tsx                    # Layout principal
│   ├── page.tsx                      # Página principal
│   └── globals.css                   # Estilos globales + animaciones
├── GOOGLE_SHEETS_SETUP.md           # Guía de configuración detallada
├── package.json                      # Dependencias y scripts
└── README.md                         # Este archivo
```

## 🎨 Componentes Principales

### ChartCard
Componente reutilizable que envuelve cada gráfica con:
- Título y badge de categoría
- Botón "Descripción" interactivo
- Modal con información detallada

### ChartDescriptionModal
Modal que explica cada métrica:
- **¿Qué estás observando?**: Descripción de la visualización
- **¿Para qué sirve?**: Utilidad para Product Management
- **Datos utilizados**: Columnas específicas del dataset
- **Fuente de datos**: Origen de la información

### ConversionSemaphore
Visualización interactiva de estado de usuarios:
- Semáforo visual con tres estados
- Slider de 1-30 días para análisis temporal
- Porcentajes y conteos en tiempo real
- Animaciones suaves

## 📊 Descripción de Cada Gráfica

Cada gráfica incluye un botón **"Descripción"** que muestra:

1. **Descripción**: Qué datos se están mostrando
2. **Propósito**: Para qué sirve esta métrica en PM
3. **Datos utilizados**: Columnas específicas de Google Sheets
4. **Fuente de datos**: De dónde provienen los datos

Esto hace que el dashboard sea **educativo y auto-documentado**.

## 🔑 Casos de Uso para Product Managers

### 📈 Monitoreo de Crecimiento
- Evaluar MRR vs objetivos
- Optimizar CAC vs LTV ratio
- Analizar NRR para evaluar expansión

### 👥 Análisis de Usuarios
- Medir engagement con DAU/MAU
- Identificar features más valiosas
- Segmentar por tipo de empresa

### 💰 Salud Financiera
- Monitorear churn y retención
- Optimizar pricing por plan
- Proyectar ingresos futuros

### 🎯 Toma de Decisiones
- Priorizar features basado en adopción
- Identificar segmentos de alto valor
- Detectar problemas en el funnel

## 🛠️ Tecnologías Utilizadas

- **[Next.js 14](https://nextjs.org/)** - Framework React con App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Recharts](https://recharts.org/)** - Visualizaciones de datos
- **[Tailwind CSS](https://tailwindcss.com/)** - Diseño moderno
- **[Google Sheets API](https://developers.google.com/sheets/api)** - Integración de datos

## 📡 API Endpoint

### GET /api/data

Obtiene datos de Google Sheets con fallback a datos mock.

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": [
    ["Mes", "Ventas", "Objetivo", "MRR", "CAC", "LTV", ...],
    ["Enero", "45000", "50000", "12000", "850", "3600", ...],
    ...
  ],
  "range": "2025!A1:Y",
  "isMockData": false
}
```

## 🎓 Recursos de Aprendizaje

- [Product Metrics 101](https://www.productplan.com/glossary/)
- [SaaS Metrics Guide](https://www.forentrepreneurs.com/saas-metrics-2/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Recharts Examples](https://recharts.org/en-US/examples)

## 🚀 Deploy en Vercel

```bash
# Build de producción
npm run build

# Deploy en Vercel
vercel deploy
```

O conecta tu repositorio directamente en [Vercel](https://vercel.com/).

## 📝 Licencia

Ver archivo [LICENSE](./LICENSE) para detalles.

## 👨‍💻 Autor

**TechyLR**
- GitHub: [@TechyLR](https://github.com/TechyLR)

---

**¿Necesitas ayuda?** Revisa [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) para configuración detallada.


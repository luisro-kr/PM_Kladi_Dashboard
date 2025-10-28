# PM_Kladi_Dashboard

Dashboard de métricas de producto Kladi construido con Next.js 14, integrado con Google Sheets.

## Descripción

El propósito de esta web es mostrar un dashboard con las métricas más importantes para el análisis de Kladi como producto. Los datos se obtienen de una hoja de cálculo de Google Sheets y se visualizan mediante gráficas interactivas.

## Características

- ✅ **Next.js 14** con App Router y TypeScript
- ✅ **Integración con Google Sheets API** para obtener datos en tiempo real
- ✅ **API Route** `/api/data` que obtiene datos del rango `2025!A1:Y`
- ✅ **Dashboard interactivo** con tres tipos de gráficas usando Recharts:
  - Gráfica de líneas para **Ventas** (comparación con objetivo)
  - Gráfica de pastel para **Empresas Activas**
  - Gráfica de barras para **Cotizaciones** (cotizaciones vs convertidas)
- ✅ **Vista de tabla** de datos con scroll horizontal
- ✅ **Diseño responsive** con Tailwind CSS
- ✅ **Estados de carga y error** para mejor UX
- ✅ **Datos de demostración** como fallback cuando la API no está disponible

## Configuración de Google Sheets

El dashboard está configurado para leer datos de:
- **Spreadsheet ID**: `1zFdHighR8eKFeiCM_8RjGKNoCtuL2VxAdeIJ-283XWY`
- **API Key**: `AIzaSyCBTSvJ6FaP1olBYpWOwGaMdKokE3XXXXX`
- **Rango**: `2025!A1:Y`

### Requisitos de la hoja de cálculo

La hoja debe tener las siguientes columnas (fila 1):
- Mes
- Ventas
- Objetivo
- Empresas Activas
- Cotizaciones
- Convertidas
- Tasa Conversión
- Clientes Nuevos
- MRR
- Churn

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Estructura del Proyecto

```
PM_Kladi_Dashboard/
├── app/
│   ├── api/
│   │   └── data/
│   │       └── route.ts          # API route para obtener datos de Google Sheets
│   ├── components/
│   │   └── Dashboard.tsx         # Componente principal del dashboard
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página principal
│   └── globals.css               # Estilos globales
├── public/                       # Archivos estáticos
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración de TypeScript
├── tailwind.config.ts            # Configuración de Tailwind CSS
└── next.config.mjs              # Configuración de Next.js
```

## Tecnologías Utilizadas

- **[Next.js 14](https://nextjs.org/)** - Framework de React con App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Recharts](https://recharts.org/)** - Biblioteca de gráficas para React
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de CSS utility-first
- **[Google Sheets API](https://developers.google.com/sheets/api)** - Integración con hojas de cálculo

## API Endpoint

### GET /api/data

Obtiene los datos de la hoja de cálculo de Google Sheets.

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": [
    ["Mes", "Ventas", "Objetivo", ...],
    ["Enero", "45000", "50000", ...],
    ...
  ],
  "range": "2025!A1:Y"
}
```

**Respuesta con error:**
En caso de que la API de Google Sheets no esté disponible, se devuelven datos de demostración.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


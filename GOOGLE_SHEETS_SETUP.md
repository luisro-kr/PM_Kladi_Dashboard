# Guía de Configuración de Google Sheets para Dashboard PM Kladi

## 📋 Estructura de Columnas Requerida

Para que el dashboard funcione correctamente, tu Google Sheet debe tener las siguientes columnas en este orden exacto:

### Columnas (A-Y):

| # | Columna | Nombre | Tipo | Descripción |
|---|---------|--------|------|-------------|
| A | 1 | Mes | Texto | Nombre del mes (Enero, Febrero, etc.) |
| B | 2 | Ventas | Número | Ventas mensuales en $ |
| C | 3 | Objetivo | Número | Objetivo de ventas mensual en $ |
| D | 4 | Empresas Activas | Número | Cantidad de empresas activas |
| E | 5 | Cotizaciones | Número | Número de cotizaciones generadas |
| F | 6 | Convertidas | Número | Cotizaciones convertidas en ventas |
| G | 7 | Tasa Conversión | Número | Porcentaje de conversión |
| H | 8 | Clientes Nuevos | Número | Nuevos clientes adquiridos |
| I | 9 | MRR | Número | Monthly Recurring Revenue en $ |
| J | 10 | Churn | Número | Tasa de churn en % |
| K | 11 | CAC | Número | Customer Acquisition Cost en $ |
| L | 12 | LTV | Número | Lifetime Value en $ |
| M | 13 | NRR | Número | Net Revenue Retention en % |
| N | 14 | DAU | Número | Daily Active Users |
| O | 15 | MAU | Número | Monthly Active Users |
| P | 16 | Feature1_Usage | Número | Usuarios usando Feature 1 |
| Q | 17 | Feature2_Usage | Número | Usuarios usando Feature 2 |
| R | 18 | Feature3_Usage | Número | Usuarios usando Feature 3 |
| S | 19 | NPS | Número | Net Promoter Score (0-100) |
| T | 20 | Plan_Basic | Número | Ingresos Plan Basic en $k |
| U | 21 | Plan_Pro | Número | Ingresos Plan Pro en $k |
| V | 22 | Plan_Enterprise | Número | Ingresos Plan Enterprise en $k |
| W | 23 | Usuarios_Activos | Número | Usuarios activos (últimos 7 días) |
| X | 24 | Usuarios_Exploracion | Número | Usuarios en exploración |
| Y | 25 | Usuarios_Inactivos | Número | Usuarios inactivos |

## 🎯 Ejemplo de Datos

Aquí está un ejemplo de cómo deberían verse tus datos:

```
Mes       | Ventas | Objetivo | Empresas Activas | Cotizaciones | Convertidas | ... | Usuarios_Activos | Usuarios_Exploracion | Usuarios_Inactivos
----------|--------|----------|------------------|--------------|-------------|-----|------------------|---------------------|-------------------
Enero     | 45000  | 50000    | 120              | 85           | 42          | ... | 2800             | 1200                | 800
Febrero   | 52000  | 50000    | 135              | 92           | 48          | ... | 3100             | 1300                | 700
Marzo     | 48000  | 50000    | 140              | 88           | 45          | ... | 3250             | 1400                | 650
```

## 🔧 Pasos para Configurar tu Google Sheet

### 1. Crear una copia de la plantilla

1. Abre Google Sheets
2. Crea un nuevo spreadsheet
3. Nombra la primera pestaña como **"2025"** (o el año que desees)
4. Copia los encabezados de la tabla de arriba en la fila 1

### 2. Agregar datos de muestra

Puedes usar los datos de muestra incluidos en `app/api/data/route.ts` o agregar tus propios datos.

### 3. Configurar permisos

1. Click en **Compartir** en la esquina superior derecha
2. En "Acceso general", selecciona **"Cualquier persona con el enlace"**
3. Asegúrate de que el permiso sea **"Visor"**
4. Copia el SPREADSHEET_ID de la URL

La URL de Google Sheets tiene este formato:
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
```

### 4. Obtener API Key de Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Sheets API**
4. Ve a **Credenciales** > **Crear credenciales** > **Clave de API**
5. Copia tu API Key

### 5. Actualizar variables en el código

Edita el archivo `app/api/data/route.ts`:

```typescript
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';
const API_KEY = 'TU_API_KEY_AQUI';
const RANGE = '2025!A1:Y';  // Ajusta el nombre de la pestaña si es diferente
```

## 📊 Métricas Explicadas para Product Managers

### Métricas de Crecimiento
- **MRR**: Ingresos mensuales recurrentes
- **CAC**: Costo de adquirir un cliente nuevo
- **LTV**: Valor total que genera un cliente
- **NRR**: Retención neta de ingresos (ideal >100%)

### Métricas de Usuario
- **DAU/MAU**: Usuarios activos diarios/mensuales
- **Stickiness**: Ratio DAU/MAU (ideal >20%)
- **Feature Adoption**: % usuarios usando cada feature

### Métricas Financieras
- **Churn**: % clientes que cancelan (ideal <2%)
- **Revenue by Plan**: Distribución de ingresos por plan

### Métricas de Satisfacción
- **NPS**: Net Promoter Score (ideal >50)
- **Conversión**: Tasa de conversión del embudo

## 🔄 Actualización de Datos

El dashboard se actualiza automáticamente cada vez que se recarga la página. Para datos en tiempo real, considera:

1. Actualizar el Google Sheet con scripts automáticos
2. Usar webhooks para actualizar datos
3. Implementar polling cada X minutos

## ⚠️ Troubleshooting

### El dashboard muestra datos de muestra (Mock Data)
- Verifica que el SPREADSHEET_ID sea correcto
- Confirma que el sheet sea público
- Revisa que la API Key esté activa
- Checa que el nombre de la pestaña coincida (e.g., "2025")

### Las gráficas no muestran datos
- Verifica que todas las columnas existan
- Asegúrate de que los datos sean numéricos (sin símbolos $, %, etc.)
- Confirma que haya al menos 2 filas (header + 1 fila de datos)

### Error 429 (Demasiadas solicitudes)
- Google Sheets API tiene límites de tasa
- Considera implementar caché
- Reduce la frecuencia de actualización

## 📈 Mejores Prácticas

1. **Actualiza datos regularmente**: Mantén tus métricas al día
2. **Usa fórmulas en Google Sheets**: Calcula automáticamente tasas, porcentajes, etc.
3. **Valida datos**: Asegúrate de que los números sean realistas
4. **Documenta cambios**: Mantén un registro de cambios importantes
5. **Backup**: Haz copias de seguridad de tu sheet regularmente

## 🚀 Próximos Pasos

1. Configura tu Google Sheet con datos reales
2. Actualiza las credenciales en `route.ts`
3. Reinicia el servidor de desarrollo (`npm run dev`)
4. Explora las descripciones de cada gráfica
5. Usa el semáforo de conversión para analizar engagement

## 📞 Soporte

Si tienes problemas, revisa:
- La consola del navegador (F12)
- Los logs del servidor
- La configuración de permisos en Google Sheets
- La activación de la API en Google Cloud Console

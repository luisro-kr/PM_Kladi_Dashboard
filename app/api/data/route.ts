import { NextResponse } from 'next/server';

// Forzar que la API sea dinámica y no se cachee en Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SPREADSHEET_ID = '1zFdHighR8eKFeiCM_8RjGKNoCtuL2VxAdeIJ-283XWY';
const API_KEY = 'AIzaSyCBTSvJ6FaP1olBYpWOwGaMdKokE3Ph1J4';
const RANGE = "'2025'!A1:Y3000"; // Nombre de hoja en comillas simples

// Mock data for demonstration when API is unavailable
// Estructura real de Google Sheets: Metricas Empresas
const MOCK_DATA = [
  ['fecha_creacion_empresa', 'nombre_empresa', 'empresa_id', 'correo_empresa', 'tickets_generados', 'tickets_facturados', 'total_ventas', 'ticket_promedio', 'facturas_emitidas', 'cotizaciones_generadas', 'articulos_nuevos', 'clientes_nuevos', 'proveedores_nuevos', 'primera_venta', 'ultima_venta', 'primera_factura', 'ultima_factura', 'primera_cotizacion', 'ultima_cotizacion', 'primer_cliente_nuevo', 'ultimo_cliente_nuevo', 'primer_registro_proveedor', 'ultimo_registro_proveedor', 'primer_articulo_agregado', 'ultimo_articulo_agregado'],
  ['2024-01-15', 'TechCorp Solutions', 'EMP001', 'contacto@techcorp.com', '245', '198', '485000', '2450', '85', '120', '450', '35', '12', '2024-01-20', '2025-10-25', '2024-01-22', '2025-10-24', '2024-01-18', '2025-10-26', '2024-01-20', '2025-10-20', '2024-01-25', '2025-09-15', '2024-01-17', '2025-10-22'],
  ['2024-02-10', 'InnovaRetail', 'EMP002', 'info@innovaretail.com', '189', '165', '395000', '2394', '72', '95', '380', '28', '8', '2024-02-15', '2025-10-28', '2024-02-18', '2025-10-27', '2024-02-12', '2025-10-28', '2024-02-15', '2025-10-15', '2024-02-20', '2025-08-20', '2024-02-13', '2025-10-25'],
  ['2024-03-05', 'GlobalServices Inc', 'EMP003', 'admin@globalservices.com', '312', '275', '680000', '2473', '98', '145', '520', '42', '15', '2024-03-10', '2025-10-27', '2024-03-12', '2025-10-26', '2024-03-08', '2025-10-27', '2024-03-10', '2025-10-18', '2024-03-15', '2025-09-10', '2024-03-07', '2025-10-24'],
  ['2024-04-20', 'MegaDistribuidora', 'EMP004', 'ventas@megadist.com', '425', '398', '925000', '2324', '142', '185', '680', '55', '22', '2024-04-25', '2025-10-28', '2024-04-27', '2025-10-28', '2024-04-22', '2025-10-28', '2024-04-25', '2025-10-22', '2024-04-28', '2025-10-05', '2024-04-23', '2025-10-27'],
  ['2024-05-12', 'SmartLogistics', 'EMP005', 'ops@smartlog.com', '178', '142', '325000', '2289', '65', '88', '340', '25', '9', '2024-05-18', '2025-10-26', '2024-05-20', '2025-10-25', '2024-05-15', '2025-10-26', '2024-05-18', '2025-09-28', '2024-05-22', '2025-07-30', '2024-05-16', '2025-10-20'],
  ['2024-06-08', 'EcoProducts SA', 'EMP006', 'contacto@ecoproducts.com', '156', '134', '298000', '2224', '58', '75', '310', '22', '7', '2024-06-15', '2025-10-28', '2024-06-17', '2025-10-27', '2024-06-12', '2025-10-28', '2024-06-15', '2025-10-12', '2024-06-20', '2025-08-15', '2024-06-13', '2025-10-26'],
  ['2024-07-15', 'UrbanStyle', 'EMP007', 'info@urbanstyle.com', '92', '78', '175000', '2244', '35', '48', '185', '15', '5', '2024-07-22', '2025-10-15', '2024-07-25', '2025-10-12', '2024-07-18', '2025-10-10', '2024-07-22', '2025-09-05', '2024-07-28', '2025-06-20', '2024-07-20', '2025-09-28'],
  ['2024-08-20', 'TechStartup Hub', 'EMP008', 'team@techstartup.com', '68', '45', '98000', '2178', '22', '35', '145', '12', '4', '2024-08-28', '2025-09-18', '2024-08-30', '2025-09-15', '2024-08-25', '2025-09-10', '2024-08-28', '2025-08-20', '2024-09-02', '2025-05-15', '2024-08-26', '2025-08-25'],
  ['2024-09-10', 'Constructora XYZ', 'EMP009', 'proyectos@constructora.com', '134', '112', '265000', '2366', '48', '68', '280', '18', '8', '2024-09-18', '2025-10-20', '2024-09-20', '2025-10-18', '2024-09-15', '2025-10-22', '2024-09-18', '2025-09-30', '2024-09-22', '2025-07-10', '2024-09-16', '2025-10-15'],
  ['2024-10-05', 'FoodChain Co', 'EMP010', 'admin@foodchain.com', '203', '185', '445000', '2405', '78', '102', '420', '32', '11', '2024-10-12', '2025-10-27', '2024-10-15', '2025-10-26', '2024-10-08', '2025-10-27', '2024-10-12', '2025-10-08', '2024-10-18', '2025-08-25', '2024-10-10', '2025-10-23'],
  ['2024-11-18', 'CloudSoft Solutions', 'EMP011', 'info@cloudsoft.com', '87', '68', '152000', '2235', '32', '45', '175', '14', '6', '2024-11-25', '2025-10-28', '2024-11-28', '2025-10-28', '2024-11-22', '2025-10-28', '2024-11-25', '2025-10-05', '2024-11-30', '2025-06-30', '2024-11-23', '2025-10-20'],
  ['2024-12-01', 'AutoParts Express', 'EMP012', 'ventas@autoparts.com', '267', '238', '565000', '2374', '95', '128', '490', '38', '14', '2024-12-08', '2025-10-26', '2024-12-10', '2025-10-25', '2024-12-05', '2025-10-26', '2024-12-08', '2025-09-22', '2024-12-12', '2025-07-18', '2024-12-06', '2025-10-21'],
  ['2025-01-10', 'HealthCare Plus', 'EMP013', 'contacto@healthcare.com', '145', '128', '305000', '2383', '55', '72', '325', '24', '9', '2025-01-18', '2025-10-27', '2025-01-20', '2025-10-26', '2025-01-15', '2025-10-27', '2025-01-18', '2025-10-10', '2025-01-22', '2025-08-05', '2025-01-16', '2025-10-22'],
  ['2025-02-14', 'MediaGroup Digital', 'EMP014', 'team@mediagroup.com', '98', '82', '185000', '2256', '38', '52', '210', '16', '6', '2025-02-20', '2025-10-24', '2025-02-22', '2025-10-22', '2025-02-18', '2025-10-25', '2025-02-20', '2025-09-18', '2025-02-25', '2025-06-12', '2025-02-19', '2025-10-18'],
  ['2025-03-08', 'FinanceConsult Pro', 'EMP015', 'info@financeconsult.com', '112', '95', '225000', '2368', '42', '58', '245', '19', '7', '2025-03-15', '2025-10-28', '2025-03-18', '2025-10-28', '2025-03-12', '2025-10-28', '2025-03-15', '2025-10-15', '2025-03-20', '2025-07-22', '2025-03-13', '2025-10-25'],
  ['2025-04-22', 'EduTech Academy', 'EMP016', 'admin@edutech.com', '76', '58', '132000', '2276', '28', '38', '165', '13', '5', '2025-04-28', '2025-10-10', '2025-05-02', '2025-10-08', '2025-04-25', '2025-10-05', '2025-04-28', '2025-08-30', '2025-05-05', '2025-05-28', '2025-04-26', '2025-09-15'],
  ['2025-05-15', 'GreenEnergy Solutions', 'EMP017', 'ops@greenenergy.com', '156', '142', '338000', '2380', '62', '78', '315', '26', '10', '2025-05-22', '2025-10-28', '2025-05-25', '2025-10-27', '2025-05-18', '2025-10-28', '2025-05-22', '2025-10-20', '2025-05-28', '2025-08-18', '2025-05-20', '2025-10-26'],
  ['2025-06-10', 'SportGear Pro', 'EMP018', 'ventas@sportgear.com', '124', '105', '248000', '2362', '48', '65', '285', '21', '8', '2025-06-18', '2025-10-25', '2025-06-20', '2025-10-24', '2025-06-15', '2025-10-26', '2025-06-18', '2025-09-25', '2025-06-22', '2025-07-28', '2025-06-16', '2025-10-20'],
  ['2025-07-05', 'FashionTrends', 'EMP019', 'info@fashiontrends.com', '89', '72', '168000', '2333', '35', '46', '195', '15', '6', '2025-07-12', '2025-10-22', '2025-07-15', '2025-10-20', '2025-07-08', '2025-10-23', '2025-07-12', '2025-09-12', '2025-07-18', '2025-06-25', '2025-07-10', '2025-10-16'],
  ['2025-08-20', 'TravelExperts', 'EMP020', 'bookings@travelexperts.com', '65', '48', '112000', '2333', '24', '32', '148', '11', '4', '2025-08-28', '2025-10-15', '2025-08-30', '2025-10-12', '2025-08-25', '2025-10-10', '2025-08-28', '2025-09-05', '2025-09-02', '2025-05-18', '2025-08-26', '2025-09-20'],
  ['2025-09-12', 'PetCare Services', 'EMP021', 'contacto@petcare.com', '95', '82', '192000', '2341', '38', '50', '220', '17', '7', '2025-09-20', '2025-10-28', '2025-09-22', '2025-10-27', '2025-09-18', '2025-10-28', '2025-09-20', '2025-10-18', '2025-09-25', '2025-07-15', '2025-09-19', '2025-10-25'],
  ['2025-10-01', 'HomeDeco Store', 'EMP022', 'ventas@homedeco.com', '78', '65', '148000', '2277', '30', '40', '185', '14', '5', '2025-10-08', '2025-10-27', '2025-10-10', '2025-10-26', '2025-10-05', '2025-10-28', '2025-10-08', '2025-10-22', '2025-10-12', '2025-06-08', '2025-10-06', '2025-10-24'],
  ['2025-10-15', 'PrintMasters', 'EMP023', 'admin@printmasters.com', '45', '32', '72000', '2250', '18', '24', '125', '9', '3', '2025-10-22', '2025-10-28', '2025-10-25', '2025-10-28', '2025-10-20', '2025-10-28', '2025-10-22', '2025-10-26', '2025-10-28', '2025-04-15', '2025-10-21', '2025-10-27'],
  ['2025-10-20', 'SecureTech IT', 'EMP024', 'info@securetech.com', '38', '28', '65000', '2321', '15', '20', '105', '8', '3', '2025-10-26', '2025-10-28', '2025-10-28', '2025-10-28', '2025-10-24', '2025-10-28', '2025-10-26', '2025-10-28', '2025-10-27', '2025-03-20', '2025-10-25', '2025-10-28'],
];

// Función para limpiar y deduplicar datos
function cleanAndDeduplicateData(rawData: any[][]) {
  if (!rawData || rawData.length === 0) return rawData;
  
  const headers = rawData[0];
  const rows = rawData.slice(1);
  
  console.log(`Datos originales: ${rows.length} empresas`);
  
  // Índices de columnas relevantes
  const nombreIdx = 1; // nombre_empresa (columna B)
  const correoIdx = 3; // correo_empresa (columna D)
  
  // 1. Filtrar empresas de prueba (@kladi.mx y @djkux.com)
  const sinPruebas = rows.filter(row => {
    const correo = row[correoIdx] || '';
    const correoLower = correo.toLowerCase();
    const esKladi = correoLower.includes('@kladi.mx');
    const esDjkux = correoLower.includes('@djkux.com');
    
    if (esKladi) {
      console.log(`❌ Filtrado correo @kladi.mx: ${row[nombreIdx]} (${correo})`);
    }
    if (esDjkux) {
      console.log(`❌ Filtrado correo @djkux.com: ${row[nombreIdx]} (${correo})`);
    }
    
    return !esKladi && !esDjkux;
  });
  
  console.log(`Después de filtrar @kladi.mx y @djkux.com: ${sinPruebas.length} empresas`);
  
  // 2. Deduplicar por nombre_empresa o correo_empresa
  const empresasMap = new Map<string, any[]>();
  
  sinPruebas.forEach((row, index) => {
    const nombre = (row[nombreIdx] || '').toString().trim().toLowerCase();
    const correo = (row[correoIdx] || '').toString().trim().toLowerCase();
    
    // Usar nombre o correo como clave (el que exista)
    const clave = nombre || correo || `row_${index}`;
    
    if (!empresasMap.has(clave)) {
      empresasMap.set(clave, []);
    }
    empresasMap.get(clave)!.push(row);
  });
  
  // 3. Para cada grupo de duplicados, elegir la mejor versión
  const empresasLimpias: any[][] = [];
  
  empresasMap.forEach((duplicados, clave) => {
    if (duplicados.length === 1) {
      // No hay duplicados, agregar directamente
      empresasLimpias.push(duplicados[0]);
    } else {
      // Hay duplicados, elegir el mejor
      console.log(`🔄 Encontrados ${duplicados.length} duplicados para: ${clave}`);
      
      // Calcular "score" de actividad para cada duplicado
      const duplicadosConScore = duplicados.map(row => {
        let score = 0;
        
        // Índices de columnas de actividad
        const activityColumns = [
          4,  // tickets_generados
          5,  // tickets_facturados
          6,  // total_ventas
          8,  // facturas_emitidas
          9,  // cotizaciones_generadas
          10, // articulos_nuevos
          11, // clientes_nuevos
          12, // proveedores_nuevos
          14, // ultima_venta
          16, // ultima_factura
          18, // ultima_cotizacion
          20, // ultimo_cliente_nuevo
          22, // ultimo_registro_proveedor
          24, // ultimo_articulo_agregado
        ];
        
        activityColumns.forEach(idx => {
          const val = row[idx];
          if (val && val !== '' && val !== '0') {
            score++;
          }
        });
        
        return { row, score };
      });
      
      // Ordenar por score (más actividad primero), luego por fecha más reciente
      duplicadosConScore.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score; // Mayor score primero
        }
        // Si tienen el mismo score, usar la más reciente (fecha_creacion_empresa)
        const fechaA = a.row[0] || '';
        const fechaB = b.row[0] || '';
        return fechaB.localeCompare(fechaA);
      });
      
      const mejor = duplicadosConScore[0];
      console.log(`  ✅ Elegida con score ${mejor.score}: ${mejor.row[nombreIdx]} (fecha: ${mejor.row[0]})`);
      duplicadosConScore.slice(1).forEach(d => {
        console.log(`  ❌ Descartada con score ${d.score}: ${d.row[nombreIdx]} (fecha: ${d.row[0]})`);
      });
      
      empresasLimpias.push(mejor.row);
    }
  });
  
  console.log(`✨ Datos finales después de limpieza: ${empresasLimpias.length} empresas`);
  console.log(`📊 Resumen: ${rows.length} → ${sinPruebas.length} (sin @kladi.mx) → ${empresasLimpias.length} (sin duplicados)`);
  
  return [headers, ...empresasLimpias];
}

export async function GET() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url, {
      cache: 'no-store', // No cachear la petición a Google Sheets
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Sheets API Error Details:', errorData);
      throw new Error(`Google Sheets API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    console.log(`Successfully fetched ${data.values?.length || 0} rows from Google Sheets`);
    
    // Limpiar y deduplicar datos antes de enviar
    const cleanedData = cleanAndDeduplicateData(data.values || []);
    
    return NextResponse.json({
      success: true,
      data: cleanedData,
      range: data.range,
      timestamp: new Date().toISOString(), // Agregar timestamp para verificar frescura
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    console.log('Using mock data for demonstration...');
    
    // También limpiar mock data
    const cleanedMockData = cleanAndDeduplicateData(MOCK_DATA);
    
    return NextResponse.json({
      success: true,
      data: cleanedMockData,
      range: '2025!A1:Y',
      isMockData: true,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

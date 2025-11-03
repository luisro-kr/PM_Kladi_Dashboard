'use client';

import { useEffect, useState } from 'react';
import {
  Line,
  LineChart,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  LabelList,
} from 'recharts';
import ChartCard from './ChartCard';

// Helper function global para formatear mes YYYY-MM a "mes año"
const formatMonth = (mesKey: string) => {
  const [year, month] = mesKey.split('-');
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

interface SheetData {
  success: boolean;
  data: string[][];
  range?: string;
  error?: string;
}

export default function DashboardReal() {
  const [data, setData] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diasInactividad, setDiasInactividad] = useState(7); // Slider de 1-60 días (default: 7)
  const [vistaAdopcion, setVistaAdopcion] = useState<'historica' | 'reciente'>('historica'); // Toggle para vista de adopción
  const [showSemaforoModal, setShowSemaforoModal] = useState(false); // Modal para descripción del semáforo
  const [categoriaAcumulativa, setCategoriaAcumulativa] = useState<'todos' | 'activos' | 'exploradores' | 'inactivos' | 'sinActividad'>('activos'); // Filtro para gráfica acumulativa (default: activos)
  const [categoriaEvolucion, setCategoriaEvolucion] = useState<'todos' | 'activos' | 'exploradores' | 'inactivos' | 'sinActividad'>('activos'); // Filtro para gráfica de evolución por mes (default: activos)
  const [filtroAnio, setFiltroAnio] = useState<'2024' | '2025' | 'todos'>('2025'); // Filtro por año (default: 2025)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const result: SheetData = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Error al cargar los datos');
        }
      } catch (err) {
        setError('Error al conectar con la API');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data for charts - ESTRUCTURA REAL DE GOOGLE SHEETS
  const processDataForCharts = () => {
    if (!data || data.length < 2) {
      return {
        adopcionFeatures: [],
        empresasActivas: { activos: 0, exploradores: 0, inactivos: 0, totalEmpresas: 0 },
        estadoPorMes: [],
        churnPorMes: [],
        churnPorCohorte: [],
      };
    }

    let rows = data.slice(1);
    
    // Filtrar por año si no es "todos"
    if (filtroAnio !== 'todos') {
      rows = rows.filter(row => {
        if (!row[0]) return false; // Saltar filas sin fecha
        const fechaParts = row[0].split('-');
        if (fechaParts.length !== 3) return false;
        const year = parseInt(fechaParts[0]);
        return year.toString() === filtroAnio;
      });
    }
    
    // Helper function para formatear mes YYYY-MM a "mes año"
    const formatMonth = (mesKey: string) => {
      const [year, month] = mesKey.split('-');
      const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    };
    
    // Helper function para agrupar por mes
    const groupByMonth = (rows: string[][]) => {
      const grouped: { [key: string]: any[] } = {};
      rows.forEach(row => {
        if (!row[0]) return; // Saltar filas sin fecha
        
        // Parsear fecha en formato YYYY-MM-DD sin problemas de timezone
        const fechaParts = row[0].split('-');
        if (fechaParts.length !== 3) return; // Saltar si no tiene formato válido
        
        const year = parseInt(fechaParts[0]);
        const month = parseInt(fechaParts[1]);
        
        if (isNaN(year) || isNaN(month)) return; // Saltar si no son números válidos
        
        const mesAnio = `${year}-${String(month).padStart(2, '0')}`;
        if (!grouped[mesAnio]) grouped[mesAnio] = [];
        grouped[mesAnio].push(row);
      });
      
      // Debug: mostrar los meses agrupados
      console.log('Meses agrupados:', Object.keys(grouped).sort());
      
      return grouped;
    };

    const byMonth = groupByMonth(rows);

    // 5. Adopción de Features
    // Vista histórica: todas las empresas que alguna vez usaron la funcionalidad
    // Vista reciente: empresas que usaron la funcionalidad en los últimos N días
    const hoy = new Date();
    const haceNDias = new Date(hoy.getTime() - diasInactividad * 24 * 60 * 60 * 1000);
    
    const adopcionFeatures = vistaAdopcion === 'historica' 
      ? [
          {
            feature: 'Tickets',
            empresas: rows.filter(r => parseFloat(r[4]) > 0).length,
            porcentaje: (rows.filter(r => parseFloat(r[4]) > 0).length / rows.length) * 100,
            total: rows.length,
          },
          {
            feature: 'Facturas',
            empresas: rows.filter(r => parseFloat(r[8]) > 0).length,
            porcentaje: (rows.filter(r => parseFloat(r[8]) > 0).length / rows.length) * 100,
            total: rows.length,
          },
          {
            feature: 'Cotizaciones',
            empresas: rows.filter(r => parseFloat(r[9]) > 0).length,
            porcentaje: (rows.filter(r => parseFloat(r[9]) > 0).length / rows.length) * 100,
            total: rows.length,
          },
          {
            feature: 'Clientes',
            empresas: rows.filter(r => parseFloat(r[11]) > 0).length,
            porcentaje: (rows.filter(r => parseFloat(r[11]) > 0).length / rows.length) * 100,
            total: rows.length,
          },
          {
            feature: 'Proveedores',
            empresas: rows.filter(r => parseFloat(r[12]) > 0).length,
            porcentaje: (rows.filter(r => parseFloat(r[12]) > 0).length / rows.length) * 100,
            total: rows.length,
          },
          {
            feature: 'Artículos',
            empresas: rows.filter(r => parseFloat(r[10]) > 0).length,
            porcentaje: (rows.filter(r => parseFloat(r[10]) > 0).length / rows.length) * 100,
            total: rows.length,
          },
        ].sort((a, b) => b.porcentaje - a.porcentaje)
      : [
          {
            feature: 'Tickets',
            empresas: rows.filter(r => {
              const ultimaVenta = r[14] ? new Date(r[14]) : null;
              return ultimaVenta && ultimaVenta >= haceNDias;
            }).length,
            porcentaje: (rows.filter(r => {
              const ultimaVenta = r[14] ? new Date(r[14]) : null;
              return ultimaVenta && ultimaVenta >= haceNDias;
            }).length / rows.length) * 100,
            total: rows.length,
          },
          {
            feature: 'Facturas',
            empresas: rows.filter(r => {
              const ultimaFactura = r[16] ? new Date(r[16]) : null;
              return ultimaFactura && ultimaFactura >= haceNDias;
            }).length,
            porcentaje: (rows.filter(r => {
              const ultimaFactura = r[16] ? new Date(r[16]) : null;
              return ultimaFactura && ultimaFactura >= haceNDias;
            }).length / rows.length) * 100,
            total: rows.length,
          },
          {
            feature: 'Cotizaciones',
            empresas: rows.filter(r => {
              const ultimaCotizacion = r[18] ? new Date(r[18]) : null;
              return ultimaCotizacion && ultimaCotizacion >= haceNDias;
            }).length,
            porcentaje: (rows.filter(r => {
              const ultimaCotizacion = r[18] ? new Date(r[18]) : null;
              return ultimaCotizacion && ultimaCotizacion >= haceNDias;
            }).length / rows.length) * 100,
            total: rows.length,
          },
          {
            feature: 'Clientes',
            empresas: rows.filter(r => {
              const ultimoCliente = r[20] ? new Date(r[20]) : null;
              return ultimoCliente && ultimoCliente >= haceNDias;
            }).length,
            porcentaje: (rows.filter(r => {
              const ultimoCliente = r[20] ? new Date(r[20]) : null;
              return ultimoCliente && ultimoCliente >= haceNDias;
            }).length / rows.length) * 100,
            total: rows.length,
          },
          {
            feature: 'Proveedores',
            empresas: rows.filter(r => {
              const ultimoProveedor = r[22] ? new Date(r[22]) : null;
              return ultimoProveedor && ultimoProveedor >= haceNDias;
            }).length,
            porcentaje: (rows.filter(r => {
              const ultimoProveedor = r[22] ? new Date(r[22]) : null;
              return ultimoProveedor && ultimoProveedor >= haceNDias;
            }).length / rows.length) * 100,
            total: rows.length,
          },
          {
            feature: 'Artículos',
            empresas: rows.filter(r => {
              const ultimoArticulo = r[24] ? new Date(r[24]) : null;
              return ultimoArticulo && ultimoArticulo >= haceNDias;
            }).length,
            porcentaje: (rows.filter(r => {
              const ultimoArticulo = r[24] ? new Date(r[24]) : null;
              return ultimoArticulo && ultimoArticulo >= haceNDias;
            }).length / rows.length) * 100,
            total: rows.length,
          },
        ].sort((a, b) => b.porcentaje - a.porcentaje); // Ordenar de mayor a menor adopción

    // 6. Semáforo: Empresas Activas vs Exploradores vs Inactivos
    const haceNDiasParaSemaforo = new Date(hoy.getTime() - diasInactividad * 24 * 60 * 60 * 1000);
    
    // ACTIVOS: Empresas con actividad comercial en últimos N días
    const activos = rows.filter(row => {
      const ultimaVenta = row[14] ? new Date(row[14]) : null;
      const ultimaFactura = row[16] ? new Date(row[16]) : null;
      const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
      
      return (ultimaVenta && ultimaVenta >= haceNDiasParaSemaforo) ||
             (ultimaFactura && ultimaFactura >= haceNDiasParaSemaforo) ||
             (ultimaCotizacion && ultimaCotizacion >= haceNDiasParaSemaforo);
    }).length;
    
    // EXPLORADORES: Empresas con actividad exploratoria PERO SIN actividad comercial en últimos N días
    const exploradores = rows.filter(row => {
      const ultimaVenta = row[14] ? new Date(row[14]) : null;
      const ultimaFactura = row[16] ? new Date(row[16]) : null;
      const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
      
      const ultimoClienteNuevo = row[20] ? new Date(row[20]) : null;
      const ultimoProveedor = row[22] ? new Date(row[22]) : null;
      const ultimoArticulo = row[24] ? new Date(row[24]) : null;
      
      // NO tienen actividad comercial en N días
      const sinActividadComercial = 
        (!ultimaVenta || ultimaVenta < haceNDiasParaSemaforo) &&
        (!ultimaFactura || ultimaFactura < haceNDiasParaSemaforo) &&
        (!ultimaCotizacion || ultimaCotizacion < haceNDiasParaSemaforo);
      
      // PERO SÍ tienen actividad exploratoria en N días
      const conActividadExploratoria =
        (ultimoClienteNuevo && ultimoClienteNuevo >= haceNDiasParaSemaforo) ||
        (ultimoProveedor && ultimoProveedor >= haceNDiasParaSemaforo) ||
        (ultimoArticulo && ultimoArticulo >= haceNDiasParaSemaforo);
      
      return sinActividadComercial && conActividadExploratoria;
    }).length;
    
    // INACTIVOS: Empresas que tenían actividad pero NO en los últimos N días
    const inactivos = rows.filter(row => {
      // Verificar si tienen alguna actividad histórica
      const tieneActividadHistorica = row[14] || row[16] || row[18] || row[20] || row[22] || row[24];
      
      if (!tieneActividadHistorica) return false; // Nunca han tenido actividad
      
      // Verificar si NO tienen actividad en los últimos N días
      const ultimaVenta = row[14] ? new Date(row[14]) : null;
      const ultimaFactura = row[16] ? new Date(row[16]) : null;
      const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
      const ultimoClienteNuevo = row[20] ? new Date(row[20]) : null;
      const ultimoProveedor = row[22] ? new Date(row[22]) : null;
      const ultimoArticulo = row[24] ? new Date(row[24]) : null;
      
      const ningunActividadReciente =
        (!ultimaVenta || ultimaVenta < haceNDiasParaSemaforo) &&
        (!ultimaFactura || ultimaFactura < haceNDiasParaSemaforo) &&
        (!ultimaCotizacion || ultimaCotizacion < haceNDiasParaSemaforo) &&
        (!ultimoClienteNuevo || ultimoClienteNuevo < haceNDiasParaSemaforo) &&
        (!ultimoProveedor || ultimoProveedor < haceNDiasParaSemaforo) &&
        (!ultimoArticulo || ultimoArticulo < haceNDiasParaSemaforo);
      
      return ningunActividadReciente;
    }).length;
    
    // NUNCA ACTIVOS: Empresas registradas que NUNCA han tenido actividad
    const nuncaActivos = rows.filter(row => {
      const tieneActividadHistorica = row[14] || row[16] || row[18] || row[20] || row[22] || row[24];
      return !tieneActividadHistorica;
    }).length;
    
    const empresasActivas = {
      activos,
      exploradores,
      inactivos,
      nuncaActivos,
      totalEmpresas: rows.length,
    };

    // 7. Estado de Empresas por Mes (NUEVA MÉTRICA)
    const estadoPorMes = Object.entries(byMonth).map(([mes, empresasDelMes]) => {
      const haceNDias = new Date(hoy.getTime() - diasInactividad * 24 * 60 * 60 * 1000);
      
      // Calcular activos del mes
      const activosDelMes = empresasDelMes.filter(row => {
        const ultimaVenta = row[14] ? new Date(row[14]) : null;
        const ultimaFactura = row[16] ? new Date(row[16]) : null;
        const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
        
        return (ultimaVenta && ultimaVenta >= haceNDias) ||
               (ultimaFactura && ultimaFactura >= haceNDias) ||
               (ultimaCotizacion && ultimaCotizacion >= haceNDias);
      }).length;
      
      // Calcular exploradores del mes
      const exploradoresDelMes = empresasDelMes.filter(row => {
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
      
      // Calcular inactivos del mes
      const inactivosDelMes = empresasDelMes.filter(row => {
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
      
      // Calcular sin actividad del mes (nunca han usado la plataforma)
      const sinActividadDelMes = empresasDelMes.filter(row => {
        const tieneActividadHistorica = row[14] || row[16] || row[18] || row[20] || row[22] || row[24];
        return !tieneActividadHistorica;
      }).length;
      
      const totalDelMes = empresasDelMes.length;
      const porcentajeActivos = totalDelMes > 0 ? (activosDelMes / totalDelMes) * 100 : 0;
      
      return {
        mesKey: mes, // Guardamos la clave original para ordenar
        mes: formatMonth(mes), // Usar la función helper
        activos: activosDelMes,
        exploradores: exploradoresDelMes,
        inactivos: inactivosDelMes,
        sinActividad: sinActividadDelMes,
        total: totalDelMes,
        porcentajeActivos: parseFloat(porcentajeActivos.toFixed(1)),
      };
    }).sort((a, b) => {
      // Ordenar por la clave del mes (YYYY-MM) en lugar de parsear la fecha formateada
      return a.mesKey.localeCompare(b.mesKey);
    });

    // 8. Churn Mensual
    // Calculamos churn basado en empresas que NO tienen actividad en últimos 30 días desde cada mes
    const churnPorMes = Object.entries(byMonth).map(([mes, empresasDelMes]) => {
      const fechaFinMes = new Date(mes + '-28'); // Usamos día 28 para evitar problemas con meses cortos
      const hace30DiasDesdeFinMes = new Date(fechaFinMes.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Total de empresas registradas hasta este mes
      const totalEmpresasHastaEsteMes = rows.filter(r => {
        if (!r[0]) return false;
        const fechaCreacion = new Date(r[0]);
        return fechaCreacion <= fechaFinMes;
      }).length;
      
      // Empresas que tienen actividad dentro de los 30 días previos al fin del mes
      const empresasActivasEnMes = rows.filter(row => {
        if (!row[0]) return false;
        const fechaCreacion = new Date(row[0]);
        if (fechaCreacion > fechaFinMes) return false; // No existía aún
        
        const ultimaVenta = row[14] ? new Date(row[14]) : null;
        const ultimaFactura = row[16] ? new Date(row[16]) : null;
        const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
        const ultimoClienteNuevo = row[20] ? new Date(row[20]) : null;
        const ultimoProveedor = row[22] ? new Date(row[22]) : null;
        const ultimoArticulo = row[24] ? new Date(row[24]) : null;
        
        // Tiene actividad en los 30 días previos al fin del mes
        return (ultimaVenta && ultimaVenta >= hace30DiasDesdeFinMes && ultimaVenta <= fechaFinMes) ||
               (ultimaFactura && ultimaFactura >= hace30DiasDesdeFinMes && ultimaFactura <= fechaFinMes) ||
               (ultimaCotizacion && ultimaCotizacion >= hace30DiasDesdeFinMes && ultimaCotizacion <= fechaFinMes) ||
               (ultimoClienteNuevo && ultimoClienteNuevo >= hace30DiasDesdeFinMes && ultimoClienteNuevo <= fechaFinMes) ||
               (ultimoProveedor && ultimoProveedor >= hace30DiasDesdeFinMes && ultimoProveedor <= fechaFinMes) ||
               (ultimoArticulo && ultimoArticulo >= hace30DiasDesdeFinMes && ultimoArticulo <= fechaFinMes);
      }).length;
      
      // Empresas inactivas = Total - Activas
      const empresasInactivasEnMes = totalEmpresasHastaEsteMes - empresasActivasEnMes;
      
      // Tasa de churn y retención
      const tasaChurn = totalEmpresasHastaEsteMes > 0 
        ? (empresasInactivasEnMes / totalEmpresasHastaEsteMes) * 100 
        : 0;
      const tasaRetencion = 100 - tasaChurn;
      
      return {
        mesKey: mes,
        mes: formatMonth(mes),
        totalEmpresas: totalEmpresasHastaEsteMes,
        activas: empresasActivasEnMes,
        inactivas: empresasInactivasEnMes,
        tasaChurn: parseFloat(tasaChurn.toFixed(1)),
        tasaRetencion: parseFloat(tasaRetencion.toFixed(1)),
      };
    }).sort((a, b) => a.mesKey.localeCompare(b.mesKey));

    // 9. Churn por Cohorte Mensual (empresas nuevas de cada mes)
    const churnPorCohorte = Object.entries(byMonth).map(([mes, empresasDelMes]) => {
      // Total de empresas NUEVAS en este mes (registradas en este mes)
      const empresasNuevasDelMes = empresasDelMes.length;
      
      // De las empresas nuevas del mes, cuántas siguen activas HOY
      const hoy = new Date();
      const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const empresasActivasHoy = empresasDelMes.filter(row => {
        const ultimaVenta = row[14] ? new Date(row[14]) : null;
        const ultimaFactura = row[16] ? new Date(row[16]) : null;
        const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
        const ultimoClienteNuevo = row[20] ? new Date(row[20]) : null;
        const ultimoProveedor = row[22] ? new Date(row[22]) : null;
        const ultimoArticulo = row[24] ? new Date(row[24]) : null;
        
        // Tiene actividad en los últimos 30 días (desde HOY)
        return (ultimaVenta && ultimaVenta >= hace30Dias) ||
               (ultimaFactura && ultimaFactura >= hace30Dias) ||
               (ultimaCotizacion && ultimaCotizacion >= hace30Dias) ||
               (ultimoClienteNuevo && ultimoClienteNuevo >= hace30Dias) ||
               (ultimoProveedor && ultimoProveedor >= hace30Dias) ||
               (ultimoArticulo && ultimoArticulo >= hace30Dias);
      }).length;
      
      // Empresas que hicieron churn (se registraron pero ya no están activas)
      const empresasChurn = empresasNuevasDelMes - empresasActivasHoy;
      
      // Tasas de retención y churn de la cohorte
      const tasaRetencionCohorte = empresasNuevasDelMes > 0 
        ? (empresasActivasHoy / empresasNuevasDelMes) * 100 
        : 0;
      const tasaChurnCohorte = 100 - tasaRetencionCohorte;
      
      return {
        mesKey: mes,
        mes: formatMonth(mes),
        nuevas: empresasNuevasDelMes,
        retenidas: empresasActivasHoy,
        churn: empresasChurn,
        tasaRetencion: parseFloat(tasaRetencionCohorte.toFixed(1)),
        tasaChurn: parseFloat(tasaChurnCohorte.toFixed(1)),
      };
    }).sort((a, b) => a.mesKey.localeCompare(b.mesKey));

    return {
      adopcionFeatures,
      empresasActivas,
      estadoPorMes,
      churnPorMes,
      churnPorCohorte,
    };
  };

  const chartData = processDataForCharts();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A78BFA', '#F59E0B'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos de empresas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 md:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        <header className="mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Métricas de Producto - Kladi
          </h1>
        </header>

        <div className="space-y-4 md:space-y-6">
          {/* Semáforo de Empresas: Activos / Exploradores / Inactivos */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 md:mb-6 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Estado de Empresas</h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Total de empresas registradas: <span className="font-bold text-blue-600">{chartData.empresasActivas.totalEmpresas}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowSemaforoModal(true)}
                  className="flex-shrink-0 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1.5"
                  title="Ver descripción del semáforo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Descripción
                </button>
              </div>
              
              {/* Filtro por año */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 w-full lg:w-auto">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Año a analizar
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFiltroAnio('2024')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      filtroAnio === '2024'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    2024
                  </button>
                  <button
                    onClick={() => setFiltroAnio('2025')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      filtroAnio === '2025'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    2025
                  </button>
                  <button
                    onClick={() => setFiltroAnio('todos')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      filtroAnio === 'todos'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    Todos
                  </button>
                </div>
              </div>
              
              {/* Slider de días */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 w-full lg:min-w-[280px] lg:w-auto">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Período de análisis: <span className="text-blue-600 font-bold">{diasInactividad} días</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={diasInactividad}
                  onChange={(e) => setDiasInactividad(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 día</span>
                  <span>60 días</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
              {/* Activos (actividad comercial) */}
              <div className="text-center">
                <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-3">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse-soft"></div>
                  <div className="absolute inset-2 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">Activos</h3>
                <p className="text-2xl md:text-3xl font-bold text-green-600 mb-1">
                  {chartData.empresasActivas.activos}
                  <span className="text-base md:text-lg ml-2 text-green-500">
                    ({((chartData.empresasActivas.activos / chartData.empresasActivas.totalEmpresas) * 100).toFixed(1)}%)
                  </span>
                </p>
                <p className="text-xs text-gray-500 px-2">Tickets, facturas o cotizaciones en últimos {diasInactividad} días</p>
              </div>

              {/* Exploradores (actividad exploratoria) */}
              <div className="text-center">
                <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-3">
                  <div className="absolute inset-0 bg-yellow-500 rounded-full animate-pulse-soft"></div>
                  <div className="absolute inset-2 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">Exploradores</h3>
                <p className="text-2xl md:text-3xl font-bold text-yellow-600 mb-1">
                  {chartData.empresasActivas.exploradores}
                  <span className="text-base md:text-lg ml-2 text-yellow-500">
                    ({((chartData.empresasActivas.exploradores / chartData.empresasActivas.totalEmpresas) * 100).toFixed(1)}%)
                  </span>
                </p>
                <p className="text-xs text-gray-500 px-2">Artículos, clientes o proveedores (sin actividad comercial)</p>
              </div>

              {/* Inactivos (sin actividad reciente) */}
              <div className="text-center">
                <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-3">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse-soft"></div>
                  <div className="absolute inset-2 bg-red-400 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">Inactivos</h3>
                <p className="text-2xl md:text-3xl font-bold text-red-600 mb-1">
                  {chartData.empresasActivas.inactivos}
                  <span className="text-base md:text-lg ml-2 text-red-500">
                    ({((chartData.empresasActivas.inactivos / chartData.empresasActivas.totalEmpresas) * 100).toFixed(1)}%)
                  </span>
                </p>
                <p className="text-xs text-gray-500 px-2">Tenían actividad pero no en últimos {diasInactividad} días</p>
              </div>

              {/* Nunca Activos (sin actividad histórica) */}
              <div className="text-center">
                <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-3">
                  <div className="absolute inset-0 bg-gray-400 rounded-full animate-pulse-soft"></div>
                  <div className="absolute inset-2 bg-gray-300 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">Sin Actividad</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-600 mb-1">
                  {chartData.empresasActivas.nuncaActivos}
                  <span className="text-base md:text-lg ml-2 text-gray-500">
                    ({((chartData.empresasActivas.nuncaActivos / chartData.empresasActivas.totalEmpresas) * 100).toFixed(1)}%)
                  </span>
                </p>
                <p className="text-xs text-gray-500 px-2">Registrados pero nunca han usado la plataforma</p>
              </div>
            </div>
          </div>

          {/* Modal de Descripción del Semáforo */}
          {showSemaforoModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowSemaforoModal(false)}>
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Estado de Empresas - Explicación</h3>
                      <p className="text-blue-100 text-sm">Cómo se clasifican las {chartData.empresasActivas.totalEmpresas} empresas registradas</p>
                    </div>
                    <button
                      onClick={() => setShowSemaforoModal(false)}
                      className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Explicación general */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Propósito
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Este semáforo clasifica a las {chartData.empresasActivas.totalEmpresas} empresas registradas según su nivel de actividad en los últimos <strong>{diasInactividad} días</strong> (ajustable con el slider).
                    </p>
                  </div>

                  {/* Desglose detallado */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-lg">Clasificación Detallada:</h4>
                    
                    {/* Activos */}
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h5 className="font-bold text-green-700">Activos: {chartData.empresasActivas.activos} ({((chartData.empresasActivas.activos / chartData.empresasActivas.totalEmpresas) * 100).toFixed(1)}%)</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Empresas con <strong>actividad comercial</strong> en los últimos {diasInactividad} días:<br/>
                        • Han generado tickets de venta<br/>
                        • Han emitido facturas, o<br/>
                        • Han creado cotizaciones
                      </p>
                    </div>

                    {/* Exploradores */}
                    <div className="border-l-4 border-yellow-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <h5 className="font-bold text-yellow-700">Exploradores: {chartData.empresasActivas.exploradores} ({((chartData.empresasActivas.exploradores / chartData.empresasActivas.totalEmpresas) * 100).toFixed(1)}%)</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Empresas <strong>configurando la plataforma</strong> en los últimos {diasInactividad} días:<br/>
                        • Han agregado artículos al catálogo<br/>
                        • Han registrado clientes, o<br/>
                        • Han dado de alta proveedores<br/>
                        <span className="text-yellow-700 font-medium">Pero AÚN NO tienen actividad comercial</span>
                      </p>
                    </div>

                    {/* Inactivos */}
                    <div className="border-l-4 border-red-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <h5 className="font-bold text-red-700">Inactivos: {chartData.empresasActivas.inactivos} ({((chartData.empresasActivas.inactivos / chartData.empresasActivas.totalEmpresas) * 100).toFixed(1)}%)</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Empresas que <strong>antes tenían actividad</strong> pero NO en los últimos {diasInactividad} días:<br/>
                        • Solían usar la plataforma<br/>
                        • Dejaron de generar actividad recientemente<br/>
                        <span className="text-red-700 font-medium">Posible riesgo de churn - requieren atención</span>
                      </p>
                    </div>

                    {/* Sin Actividad */}
                    <div className="border-l-4 border-gray-400 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <h5 className="font-bold text-gray-700">Sin Actividad: {chartData.empresasActivas.nuncaActivos} ({((chartData.empresasActivas.nuncaActivos / chartData.empresasActivas.totalEmpresas) * 100).toFixed(1)}%)</h5>
                      </div>
                      <p className="text-sm text-gray-600">
                        Empresas registradas que <strong>NUNCA han usado la plataforma</strong>:<br/>
                        • Se registraron pero no han hecho nada<br/>
                        • Sin actividad comercial ni exploratoria<br/>
                        <span className="text-gray-700 font-medium">Oportunidad de onboarding - contactar para activación</span>
                      </p>
                    </div>
                  </div>

                  {/* Verificación de suma */}
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-3">Verificación de Totales:</h4>
                    <div className="space-y-1 text-sm text-gray-700 font-mono">
                      <div className="flex justify-between">
                        <span>Activos:</span>
                        <span className="text-green-600">{chartData.empresasActivas.activos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exploradores:</span>
                        <span className="text-yellow-600">{chartData.empresasActivas.exploradores}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inactivos:</span>
                        <span className="text-red-600">{chartData.empresasActivas.inactivos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sin Actividad:</span>
                        <span className="text-gray-600">{chartData.empresasActivas.nuncaActivos}</span>
                      </div>
                      <div className="border-t border-gray-400 mt-2 pt-2 flex justify-between font-bold">
                        <span>TOTAL:</span>
                        <span className="text-blue-600">
                          {chartData.empresasActivas.activos + chartData.empresasActivas.exploradores + chartData.empresasActivas.inactivos + chartData.empresasActivas.nuncaActivos} 
                          {chartData.empresasActivas.activos + chartData.empresasActivas.exploradores + chartData.empresasActivas.inactivos + chartData.empresasActivas.nuncaActivos === chartData.empresasActivas.totalEmpresas ? ' ✓' : ' ⚠️'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Porcentajes */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      Sobre los porcentajes
                    </h4>
                    <p className="text-sm text-gray-700">
                      Todos los porcentajes están calculados sobre el total de <strong>{chartData.empresasActivas.totalEmpresas} empresas registradas</strong>. Por ejemplo, {chartData.empresasActivas.activos} activos representa el {((chartData.empresasActivas.activos / chartData.empresasActivas.totalEmpresas) * 100).toFixed(1)}% del total.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Evolución Acumulativa de Usuarios Activos */}
          <ChartCard
            title="Evolución Acumulativa de Usuarios Activos"
            badge="Acumulado"
            badgeColor="blue"
            description="Muestra el crecimiento acumulativo de usuarios activos a lo largo del tiempo. A diferencia de la gráfica de estado mensual (que muestra una 'fotografía' de cada mes), esta gráfica suma usuarios que se activaron mes a mes. Si en enero se activaron 7 usuarios y en febrero 2 más, febrero mostrará 9 usuarios activos acumulados."
            purpose="Visualizar si la base de usuarios activos crece o decrece con el tiempo. Permite identificar tendencias de crecimiento sostenido, estancamiento o pérdida neta de usuarios. Útil para evaluar el impacto de estrategias de activación y retención."
            dataUsed={['ultima_venta', 'ultima_factura', 'ultima_cotizacion', 'ultimo_cliente_nuevo', 'ultimo_registro_proveedor', 'ultimo_articulo_agregado']}
            dataSource="Google Sheets - Hoja '2025'. Calcula totales acumulativos de usuarios en cada categoría (Activos, Exploradores, Inactivos, Sin Actividad) desde el inicio hasta cada mes."
          >
            {/* Botones de filtro */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setCategoriaAcumulativa('activos')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  categoriaAcumulativa === 'activos'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => setCategoriaAcumulativa('exploradores')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  categoriaAcumulativa === 'exploradores'
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                Exploradores
              </button>
              <button
                onClick={() => setCategoriaAcumulativa('inactivos')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  categoriaAcumulativa === 'inactivos'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                Inactivos
              </button>
              <button
                onClick={() => setCategoriaAcumulativa('sinActividad')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  categoriaAcumulativa === 'sinActividad'
                    ? 'bg-gray-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sin Actividad
              </button>
              <button
                onClick={() => setCategoriaAcumulativa('todos')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  categoriaAcumulativa === 'todos'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Todos
              </button>
            </div>

            <ResponsiveContainer width="100%" height={350} className="md:!h-[400px] lg:!h-[430px]">
              <ComposedChart 
                data={(() => {
                  // Calcular totales acumulativos
                  let cumulativeActivos = 0;
                  let cumulativeExploradores = 0;
                  let cumulativeInactivos = 0;
                  let cumulativeSinActividad = 0;
                  
                  return chartData.estadoPorMes.map(mes => {
                    cumulativeActivos += mes.activos;
                    cumulativeExploradores += mes.exploradores;
                    cumulativeInactivos += mes.inactivos;
                    cumulativeSinActividad += mes.sinActividad;
                    
                    const total = cumulativeActivos + cumulativeExploradores + cumulativeInactivos + cumulativeSinActividad;
                    const porcentajeActivos = total > 0 ? (cumulativeActivos / total) * 100 : 0;
                    
                    return {
                      mes: mes.mes,
                      activos: cumulativeActivos,
                      exploradores: cumulativeExploradores,
                      inactivos: cumulativeInactivos,
                      sinActividad: cumulativeSinActividad,
                      total: total,
                      porcentajeActivos: parseFloat(porcentajeActivos.toFixed(1))
                    };
                  });
                })()}
                margin={{ top: 20, right: 20, bottom: 5, left: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  yAxisId="left"
                  label={{ value: 'Empresas Acumuladas', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ value: '% Activos', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                          <p className="font-semibold text-gray-900 mb-2">{data.mes}</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-green-700">
                              <span className="font-medium">Activos:</span> {data.activos.toLocaleString('es-MX')}
                            </p>
                            <p className="text-yellow-700">
                              <span className="font-medium">Exploradores:</span> {data.exploradores.toLocaleString('es-MX')}
                            </p>
                            <p className="text-red-700">
                              <span className="font-medium">Inactivos:</span> {data.inactivos.toLocaleString('es-MX')}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Sin Actividad:</span> {data.sinActividad.toLocaleString('es-MX')}
                            </p>
                            <p className="font-semibold text-gray-900 pt-2 border-t border-gray-200">
                              Total Acumulado: {data.total.toLocaleString('es-MX')}
                            </p>
                            <p className="text-blue-700 font-medium">
                              % Activos: {data.porcentajeActivos}%
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                  formatter={(value) => <span style={{ color: '#374151', fontWeight: '600' }}>{value}</span>}
                />
                {(categoriaAcumulativa === 'todos' || categoriaAcumulativa === 'activos') && (
                  <Bar yAxisId="left" dataKey="activos" stackId={categoriaAcumulativa === 'todos' ? 'a' : undefined} fill="#10B981" name="Activos Acumulados">
                    {categoriaAcumulativa === 'activos' && (
                      <LabelList 
                        dataKey="activos" 
                        position="top" 
                        style={{ fontSize: '11px', fontWeight: 'bold', fill: '#059669' }}
                      />
                    )}
                  </Bar>
                )}
                {(categoriaAcumulativa === 'todos' || categoriaAcumulativa === 'exploradores') && (
                  <Bar yAxisId="left" dataKey="exploradores" stackId={categoriaAcumulativa === 'todos' ? 'a' : undefined} fill="#FBBF24" name="Exploradores Acumulados">
                    {categoriaAcumulativa === 'exploradores' && (
                      <LabelList 
                        dataKey="exploradores" 
                        position="top" 
                        style={{ fontSize: '11px', fontWeight: 'bold', fill: '#D97706' }}
                      />
                    )}
                  </Bar>
                )}
                {(categoriaAcumulativa === 'todos' || categoriaAcumulativa === 'inactivos') && (
                  <Bar yAxisId="left" dataKey="inactivos" stackId={categoriaAcumulativa === 'todos' ? 'a' : undefined} fill="#EF4444" name="Inactivos Acumulados">
                    {categoriaAcumulativa === 'inactivos' && (
                      <LabelList 
                        dataKey="inactivos" 
                        position="top" 
                        style={{ fontSize: '11px', fontWeight: 'bold', fill: '#DC2626' }}
                      />
                    )}
                  </Bar>
                )}
                {(categoriaAcumulativa === 'todos' || categoriaAcumulativa === 'sinActividad') && (
                  <Bar yAxisId="left" dataKey="sinActividad" stackId={categoriaAcumulativa === 'todos' ? 'a' : undefined} fill="#9CA3AF" name="Sin Actividad Acumulados">
                    <LabelList 
                      dataKey={categoriaAcumulativa === 'todos' ? 'total' : 'sinActividad'} 
                      position="top" 
                      style={{ fontSize: '11px', fontWeight: 'bold', fill: categoriaAcumulativa === 'todos' ? '#374151' : '#6B7280' }}
                    />
                  </Bar>
                )}
                {categoriaAcumulativa === 'todos' && (
                  <Line yAxisId="right" type="monotone" dataKey="porcentajeActivos" stroke="#3B82F6" strokeWidth={3} name="% Activos Acumulados" dot={{ r: 5, fill: '#3B82F6' }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Evolución de Estado por Mes (Full Width) */}
          <ChartCard
            title="Evolución de Estado de Empresas por Mes"
            badge="Tendencias"
            badgeColor="purple"
            description="Muestra cómo ha evolucionado el estado de las empresas mes a mes: Activos (actividad comercial), Exploradores (configurando plataforma) e Inactivos (sin actividad reciente)."
            purpose="Identificar tendencias de activación y retención. Detectar meses con problemas de churn o baja activación. Medir el impacto de mejoras en el producto y onboarding."
            dataUsed={['fecha_creacion_empresa', 'ultima_venta', 'ultima_factura', 'ultima_cotizacion', 'ultimo_cliente_nuevo', 'ultimo_registro_proveedor', 'ultimo_articulo_agregado']}
            dataSource="Google Sheets - Hoja '2025', análisis basado en últimos N días (ajustable con slider)"
          >
              {/* Botones de filtro */}
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoriaEvolucion('activos')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    categoriaEvolucion === 'activos'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  Activos
                </button>
                <button
                  onClick={() => setCategoriaEvolucion('exploradores')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    categoriaEvolucion === 'exploradores'
                      ? 'bg-yellow-500 text-white shadow-lg'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  Exploradores
                </button>
                <button
                  onClick={() => setCategoriaEvolucion('inactivos')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    categoriaEvolucion === 'inactivos'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  Inactivos
                </button>
                <button
                  onClick={() => setCategoriaEvolucion('sinActividad')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    categoriaEvolucion === 'sinActividad'
                      ? 'bg-gray-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Sin Actividad
                </button>
                <button
                  onClick={() => setCategoriaEvolucion('todos')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    categoriaEvolucion === 'todos'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Todos
                </button>
              </div>

              <ResponsiveContainer width="100%" height={350} className="md:!h-[400px] lg:!h-[430px]">
                <ComposedChart data={chartData.estadoPorMes} margin={{ top: 20, right: 20, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" label={{ value: 'Empresas', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: '% Activos', angle: 90, position: 'insideRight' }} domain={[0, 100]} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-bold text-gray-800 mb-2">{payload[0].payload.mes}</p>
                          <p className="text-sm text-gray-600 mb-3">Total del mes: <span className="font-bold">{payload[0].payload.total}</span></p>
                          <div className="space-y-1">
                            <p className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                              <span className="text-gray-700">Activos: <span className="font-bold text-green-600">{payload[0].payload.activos}</span></span>
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                              <span className="text-gray-700">Exploradores: <span className="font-bold text-yellow-600">{payload[0].payload.exploradores}</span></span>
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                              <span className="text-gray-700">Inactivos: <span className="font-bold text-red-600">{payload[0].payload.inactivos}</span></span>
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                              <span className="text-gray-700">Sin Actividad: <span className="font-bold text-gray-600">{payload[0].payload.sinActividad}</span></span>
                            </p>
                            <p className="text-sm font-bold text-blue-600 mt-2 pt-2 border-t">
                              % Activos: {payload[0].payload.porcentajeActivos}%
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {(categoriaEvolucion === 'todos' || categoriaEvolucion === 'activos') && (
                  <Bar yAxisId="left" dataKey="activos" stackId={categoriaEvolucion === 'todos' ? 'a' : undefined} fill="#10B981" name="Activos">
                    {categoriaEvolucion === 'activos' && (
                      <LabelList 
                        dataKey="activos" 
                        position="top" 
                        style={{ fontSize: '11px', fontWeight: 'bold', fill: '#059669' }}
                      />
                    )}
                  </Bar>
                )}
                {(categoriaEvolucion === 'todos' || categoriaEvolucion === 'exploradores') && (
                  <Bar yAxisId="left" dataKey="exploradores" stackId={categoriaEvolucion === 'todos' ? 'a' : undefined} fill="#F59E0B" name="Exploradores">
                    {categoriaEvolucion === 'exploradores' && (
                      <LabelList 
                        dataKey="exploradores" 
                        position="top" 
                        style={{ fontSize: '11px', fontWeight: 'bold', fill: '#D97706' }}
                      />
                    )}
                  </Bar>
                )}
                {(categoriaEvolucion === 'todos' || categoriaEvolucion === 'inactivos') && (
                  <Bar yAxisId="left" dataKey="inactivos" stackId={categoriaEvolucion === 'todos' ? 'a' : undefined} fill="#EF4444" name="Inactivos">
                    {categoriaEvolucion === 'inactivos' && (
                      <LabelList 
                        dataKey="inactivos" 
                        position="top" 
                        style={{ fontSize: '11px', fontWeight: 'bold', fill: '#DC2626' }}
                      />
                    )}
                  </Bar>
                )}
                {(categoriaEvolucion === 'todos' || categoriaEvolucion === 'sinActividad') && (
                  <Bar yAxisId="left" dataKey="sinActividad" stackId={categoriaEvolucion === 'todos' ? 'a' : undefined} fill="#9CA3AF" name="Sin Actividad">
                    <LabelList 
                      dataKey={categoriaEvolucion === 'todos' ? 'total' : 'sinActividad'} 
                      position="top" 
                      style={{ fontSize: '11px', fontWeight: 'bold', fill: categoriaEvolucion === 'todos' ? '#374151' : '#6B7280' }}
                    />
                  </Bar>
                )}
                {categoriaEvolucion === 'todos' && (
                  <Line yAxisId="right" type="monotone" dataKey="porcentajeActivos" stroke="#3B82F6" strokeWidth={3} name="% Activos" dot={{ r: 5 }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Grid de 1 columna para gráfica de Churn (full width) */}
          <div className="grid grid-cols-1 gap-4 md:gap-6">
          {/* Churn y Retención Mensual */}
          <ChartCard
            title="Evolución de Churn y Retención por Mes"
            badge="Retención"
            badgeColor="red"
            description="Análisis mensual de churn (empresas inactivas) vs retención (empresas activas). Basado en empresas que tuvieron actividad en los últimos 30 días de cada mes."
            purpose="Medir la capacidad de retener clientes mes a mes. Identificar meses críticos con alta pérdida de clientes. Evaluar efectividad de iniciativas de retención y detectar patrones estacionales de abandono."
            dataUsed={['fecha_creacion_empresa', 'ultima_venta', 'ultima_factura', 'ultima_cotizacion', 'ultimo_cliente_nuevo', 'ultimo_registro_proveedor', 'ultimo_articulo_agregado']}
            dataSource="Google Sheets - Hoja '2025'. Churn = empresas sin actividad en últimos 30 días del mes. Retención = 100% - Churn%."
          >
            {/* Etiqueta de Pendiente de Revisión */}
            <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-amber-800">⏳ Pendiente de Revisión</p>
                  <p className="text-xs text-amber-700">Esta gráfica requiere datos mensuales de actividad de ingeniería para mayor precisión. Actualmente usa aproximación con datos disponibles.</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Overlay de "Trabajando en esta gráfica" */}
              <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4 text-center border-2 border-amber-400">
                  <div className="flex justify-center mb-3">
                    <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    🚧 Se está trabajando en esta gráfica
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Temporalmente Inactiva</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    Requiere datos mensuales de actividad para mayor precisión
                  </p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300} className="md:!h-[350px] lg:!h-[380px]">
                <ComposedChart data={chartData.churnPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" label={{ value: 'Empresas', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Porcentaje (%)', angle: 90, position: 'insideRight' }} domain={[0, 100]} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-bold text-gray-800 mb-2">{data.mes}</p>
                          <p className="text-sm text-gray-600 mb-2">Total empresas: <span className="font-bold">{data.totalEmpresas}</span></p>
                          <div className="space-y-1">
                            <p className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                              <span>Activas: <span className="font-bold text-green-600">{data.activas}</span></span>
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                              <span>Inactivas: <span className="font-bold text-red-600">{data.inactivas}</span></span>
                            </p>
                            <div className="pt-2 mt-2 border-t border-gray-200">
                              <p className="text-sm font-bold text-green-600">
                                📈 Retención: {data.tasaRetencion}%
                              </p>
                              <p className="text-sm font-bold text-red-600">
                                📉 Churn: {data.tasaChurn}%
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                  formatter={(value) => <span style={{ color: '#374151', fontWeight: '600' }}>{value}</span>}
                />
                <Bar yAxisId="left" dataKey="activas" stackId="a" fill="#10B981" name="Empresas Activas" />
                <Bar yAxisId="left" dataKey="inactivas" stackId="a" fill="#EF4444" name="Empresas Inactivas (Churn)" />
                <Line yAxisId="right" type="monotone" dataKey="tasaRetencion" stroke="#059669" strokeWidth={3} name="% Retención" dot={{ r: 5, fill: '#059669' }} />
                <Line yAxisId="right" type="monotone" dataKey="tasaChurn" stroke="#DC2626" strokeWidth={3} name="% Churn" dot={{ r: 5, fill: '#DC2626' }} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          </ChartCard>
          </div>

          {/* Grid de 2 columnas para churn por cohorte y adopción */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Churn por Cohorte Mensual */}
          <ChartCard
            title="Retención por Cohorte Mensual"
            badge="Cohortes"
            badgeColor="orange"
            description="Análisis de retención de empresas nuevas por mes. Muestra cuántas empresas de cada mes siguen activas hoy (últimos 30 días) vs cuántas hicieron churn."
            purpose="Identificar qué meses tuvieron mejor retención de nuevos clientes. Evaluar efectividad de onboarding y primeras experiencias. Detectar si ciertos períodos tienen mayor abandono de clientes nuevos."
            dataUsed={['fecha_creacion_empresa', 'ultima_venta', 'ultima_factura', 'ultima_cotizacion', 'ultimo_cliente_nuevo', 'ultimo_registro_proveedor', 'ultimo_articulo_agregado']}
            dataSource="Google Sheets - Hoja '2025'. Cohorte = empresas registradas en cada mes. Retención = empresas de la cohorte activas HOY (últimos 30 días)."
          >
            {/* Etiqueta de Pendiente de Revisión */}
            <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-amber-800">⏳ Pendiente de Revisión</p>
                  <p className="text-xs text-amber-700">Esta gráfica requiere datos mensuales de actividad de ingeniería para detectar reactivaciones. Actualmente muestra retención aproximada basada en última actividad.</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Overlay de "Trabajando en esta gráfica" */}
              <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4 text-center border-2 border-amber-400">
                  <div className="flex justify-center mb-3">
                    <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    🚧 Se está trabajando en esta gráfica
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Temporalmente Inactiva</strong>
                  </p>
                  <p className="text-xs text-gray-500">
                    Requiere datos de reactivaciones para mayor precisión
                  </p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300} className="md:!h-[350px] lg:!h-[380px]">
                <ComposedChart data={chartData.churnPorCohorte}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" label={{ value: 'Empresas', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Porcentaje (%)', angle: 90, position: 'insideRight' }} domain={[0, 100]} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-bold text-gray-800 mb-2">Cohorte: {data.mes}</p>
                          <p className="text-sm text-gray-600 mb-2">Empresas nuevas: <span className="font-bold">{data.nuevas}</span></p>
                          <div className="space-y-1">
                            <p className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                              <span>Retenidas (activas hoy): <span className="font-bold text-blue-600">{data.retenidas}</span></span>
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                              <span>Con churn: <span className="font-bold text-orange-600">{data.churn}</span></span>
                            </p>
                            <div className="pt-2 mt-2 border-t border-gray-200">
                              <p className="text-sm font-bold text-blue-600">
                                📈 Retención: {data.tasaRetencion}%
                              </p>
                              <p className="text-sm font-bold text-orange-600">
                                📉 Churn: {data.tasaChurn}%
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                  formatter={(value) => <span style={{ color: '#374151', fontWeight: '600' }}>{value}</span>}
                />
                <Bar yAxisId="left" dataKey="retenidas" stackId="a" fill="#3B82F6" name="Empresas Retenidas (activas hoy)" />
                <Bar yAxisId="left" dataKey="churn" stackId="a" fill="#F97316" name="Empresas con Churn" />
                <Line yAxisId="right" type="monotone" dataKey="tasaRetencion" stroke="#2563EB" strokeWidth={3} name="% Retención" dot={{ r: 5, fill: '#2563EB' }} />
                <Line yAxisId="right" type="monotone" dataKey="tasaChurn" stroke="#EA580C" strokeWidth={3} name="% Churn" dot={{ r: 5, fill: '#EA580C' }} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Adopción de Features */}
          <ChartCard
            title="Adopción de Funcionalidades"
            badge="Product Adoption"
            badgeColor="blue"
            description="Porcentaje de empresas que utilizan cada funcionalidad principal de la plataforma. Ordenado de mayor a menor adopción."
            purpose="Evaluar qué features tienen mejor adopción y cuáles necesitan mejor onboarding o marketing. Identifica features candidatas a deprecar y prioriza desarrollo de mejoras."
            dataUsed={['tickets_generados', 'facturas_emitidas', 'cotizaciones_generadas', 'clientes_nuevos', 'proveedores_nuevos', 'articulos_nuevos']}
            dataSource="Google Sheets - Hoja 'Metricas Empresas', múltiples columnas de actividad"
          >
            {/* Toggle para vista histórica vs reciente */}
            <div className="mb-4 flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-xs md:text-sm font-medium text-gray-600">Período:</span>
                <div className="flex bg-white rounded-md border border-gray-300 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setVistaAdopcion('historica')}
                    className={`px-2 md:px-3 py-1.5 text-xs font-medium transition-colors ${
                        vistaAdopcion === 'historica'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Histórico
                    </button>
                    <button
                      onClick={() => setVistaAdopcion('reciente')}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-300 ${
                        vistaAdopcion === 'reciente'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Últimos {diasInactividad} días
                    </button>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 italic max-w-[200px] text-right leading-tight">
                  {vistaAdopcion === 'historica' 
                    ? 'Empresas que alguna vez usaron la funcionalidad'
                    : `Empresas que usaron la funcionalidad en los últimos ${diasInactividad} días`
                  }
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300} className="md:!h-[350px] lg:!h-[380px]">
                <BarChart data={chartData.adopcionFeatures} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="feature" type="category" width={100} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                            <p className="font-semibold text-gray-900">{data.feature}</p>
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-medium">{data.porcentaje.toFixed(1)}%</span> de adopción
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">{data.empresas.toLocaleString('es-MX')}</span> de <span className="font-medium">{data.total.toLocaleString('es-MX')}</span> empresas
                            </p>
                            <p className="text-xs text-gray-500 mt-1 italic">
                              {vistaAdopcion === 'historica' 
                                ? `${data.empresas === 1 ? 'ha usado' : 'han usado'} esta funcionalidad`
                                : `${data.empresas === 1 ? 'usó' : 'usaron'} en últimos ${diasInactividad} días`
                              }
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="porcentaje" fill="#3B82F6" name="Adopción (%)">
                    {chartData.adopcionFeatures.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Grid de 2 columnas para las tablas Top 15 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          
          {/* Top 15 Empresas por Actividad */}
          {data && (() => {
            const rows = data.slice(1);
            
            // Calcular actividad histórica total para cada empresa
            const empresasConActividad = rows.map((row, idx) => {
              // Parsear todos los valores numéricos
              const ticketsGenerados = parseFloat(row[4]) || 0;
              const totalVentas = parseFloat(row[6]) || 0;
              const facturas = parseFloat(row[8]) || 0;
              const cotizaciones = parseFloat(row[9]) || 0;
              const articulos = parseFloat(row[10]) || 0;
              const clientes = parseFloat(row[11]) || 0;
              
              // Calcular score combinado (clientes y facturas tienen el mayor peso)
              const scoreActividad = 
                (totalVentas * 0.001) +        // Las ventas cuentan muy poco (reducido drásticamente)
                (ticketsGenerados * 50) +      // Tickets cuentan 50x cada uno
                (facturas * 10000) +           // Facturas cuentan 10,000x cada una (muy alto peso)
                (clientes * 5000) +            // Clientes cuentan 5,000x cada uno (máximo peso)
                (cotizaciones * 100) +         // Cotizaciones cuentan 100x cada una
                (articulos * 1);               // Artículos cuentan 1x cada uno
              
              // Determinar estado actual (Activo/Explorador/Inactivo) según slider
              const hoy = new Date();
              const diasAtras = diasInactividad * 24 * 60 * 60 * 1000;
              
              const ultimaVenta = row[14] ? new Date(row[14]) : null;
              const ultimaFactura = row[16] ? new Date(row[16]) : null;
              const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
              
              const ultimoClienteNuevo = row[20] ? new Date(row[20]) : null;
              const ultimoRegistroProveedor = row[22] ? new Date(row[22]) : null;
              const ultimoArticuloAgregado = row[24] ? new Date(row[24]) : null;
              
              const tieneActividadComercial = 
                (ultimaVenta && (hoy.getTime() - ultimaVenta.getTime()) < diasAtras) ||
                (ultimaFactura && (hoy.getTime() - ultimaFactura.getTime()) < diasAtras) ||
                (ultimaCotizacion && (hoy.getTime() - ultimaCotizacion.getTime()) < diasAtras);
              
              const tieneActividadExploratoria = 
                (ultimoArticuloAgregado && (hoy.getTime() - ultimoArticuloAgregado.getTime()) < diasAtras) ||
                (ultimoClienteNuevo && (hoy.getTime() - ultimoClienteNuevo.getTime()) < diasAtras) ||
                (ultimoRegistroProveedor && (hoy.getTime() - ultimoRegistroProveedor.getTime()) < diasAtras);
              
              let estado: 'activo' | 'explorador' | 'inactivo' = 'inactivo';
              if (tieneActividadComercial) {
                estado = 'activo';
              } else if (tieneActividadExploratoria) {
                estado = 'explorador';
              }
              
              return {
                nombre: row[1] || 'Sin nombre',
                correo: row[3] || '',
                ticketsGenerados,
                totalVentas,
                facturas,
                clientes,
                scoreActividad,
                estado,
                fechaCreacion: row[0] || '',
              };
            });
            
            // Ordenar por SCORE DE ACTIVIDAD (descendente) y tomar top 15
            const top15 = empresasConActividad
              .sort((a, b) => b.scoreActividad - a.scoreActividad)
              .slice(0, 15);
            
            // Log del top 5 después del sort
            console.log('TOP 5 después de ordenar:');
            top15.slice(0, 5).forEach((emp, idx) => {
              console.log(`${idx + 1}. ${emp.nombre}: Score ${emp.scoreActividad.toLocaleString()}, Ventas: ${emp.totalVentas}, Clientes: ${emp.clientes}`);
            });
            
            return (
              <ChartCard
                title="Top 15 Empresas con Mayor Actividad"
                badge="Ranking"
                badgeColor="orange"
                description="Ranking de las 15 empresas con mayor actividad global basado en un score ponderado que prioriza: clientes nuevos (5,000x), facturas emitidas (10,000x), tickets generados (50x), cotizaciones (100x), artículos (1x) y ventas totales (0.001x). El indicador de estado refleja actividad reciente según el slider."
                purpose="Identificar a los clientes más valiosos considerando tanto volumen de ventas como nivel de uso de la plataforma. Detectar empresas con alta actividad que podrían ser casos de éxito. Priorizar retención de clientes top activos."
                dataUsed={['total_ventas', 'tickets_generados', 'facturas_emitidas', 'clientes_nuevos', 'cotizaciones_generadas', 'articulos_nuevos', 'ultima_venta', 'ultima_factura']}
                dataSource="Google Sheets - Hoja '2025', ordenado por score ponderado de actividad histórica. Estado calculado según slider de días de inactividad."
              >
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-1 md:px-2 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-6 md:w-8">
                          #
                        </th>
                        <th className="px-1 md:px-2 py-3 text-center text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-8 md:w-10">
                          
                        </th>
                        <th className="px-1 md:px-2 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-[28%] md:w-[35%]">
                          Empresa
                        </th>
                        <th className="px-1 md:px-2 py-3 text-right text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-[14%]">
                          Tickets
                        </th>
                        <th className="px-1 md:px-2 py-3 text-right text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-[24%] md:w-[20%]">
                          Ventas ($)
                        </th>
                        <th className="px-1 md:px-2 py-3 text-right text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                          Facturas
                        </th>
                        <th className="px-1 md:px-2 py-3 text-right text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                          Clientes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {top15.map((empresa, index) => {
                        const estadoConfig = {
                          activo: { color: 'bg-green-500', label: 'Activo', textColor: 'text-green-700' },
                          explorador: { color: 'bg-yellow-500', label: 'Explorador', textColor: 'text-yellow-700' },
                          inactivo: { color: 'bg-red-500', label: 'Inactivo', textColor: 'text-red-700' },
                        };
                        
                        const config = estadoConfig[empresa.estado];
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-1 md:px-2 py-2 whitespace-nowrap text-[10px] md:text-xs font-bold text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-1 md:px-2 py-2 whitespace-nowrap">
                              <div className="flex items-center justify-center">
                                <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${config.color}`} title={config.label}></div>
                              </div>
                            </td>
                            <td className="px-1 md:px-2 py-2 overflow-hidden">
                              <div className="font-medium text-[10px] md:text-xs text-gray-900 truncate" title={empresa.nombre}>
                                {empresa.nombre}
                              </div>
                              {empresa.correo && (
                                <div className="text-[8px] md:text-[10px] text-gray-500 truncate" title={empresa.correo}>
                                  {empresa.correo}
                                </div>
                              )}
                            </td>
                            <td className="px-1 md:px-2 py-2 whitespace-nowrap text-[10px] md:text-xs text-right text-gray-900">
                              {empresa.ticketsGenerados.toLocaleString('es-MX')}
                            </td>
                            <td className="px-1 md:px-2 py-2 whitespace-nowrap text-[9px] md:text-xs text-right font-semibold text-green-600">
                              ${empresa.totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-1 md:px-2 py-2 whitespace-nowrap text-[10px] md:text-xs text-right text-gray-900">
                              {empresa.facturas.toLocaleString('es-MX')}
                            </td>
                            <td className="px-1 md:px-2 py-2 whitespace-nowrap text-[10px] md:text-xs text-right text-gray-900">
                              {empresa.clientes.toLocaleString('es-MX')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Activo (últimos {diasInactividad} días)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Explorador</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Inactivo</span>
                    </div>
                  </div>
                  <div className="font-medium text-right">
                    <div>Score = (Ventas×0.001) + (Tickets×50) + (Facturas×10,000) + (Clientes×5,000) + (Cotizaciones×100)</div>
                  </div>
                </div>
              </ChartCard>
            );
          })()}

          {/* Top 15 Empresas por Ventas Totales */}
          {(() => {
            if (!data) return null;
            
            const empresasConVentas = data
              .filter((row) => row[1] && row[1].trim() !== '')
              .map((row, idx) => {
                const totalVentas = parseFloat(String(row[6] || 0).replace(/[^0-9.-]/g, '')) || 0;
                const ticketsGenerados = parseFloat(row[4]) || 0;
                const facturas = parseFloat(row[8]) || 0;
                const clientes = parseFloat(row[11]) || 0;

                // Determinar estado actual (Activo/Explorador/Inactivo) según slider
                const hoy = new Date();
                const diasAtras = diasInactividad * 24 * 60 * 60 * 1000;
                
                const ultimaVenta = row[14] ? new Date(row[14]) : null;
                const ultimaFactura = row[16] ? new Date(row[16]) : null;
                const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
                
                const ultimoClienteNuevo = row[20] ? new Date(row[20]) : null;
                const ultimoRegistroProveedor = row[22] ? new Date(row[22]) : null;
                const ultimoArticuloAgregado = row[24] ? new Date(row[24]) : null;

                // Actividad comercial: ventas, facturas o cotizaciones recientes
                const tieneActividadComercial = 
                  (ultimaVenta && (hoy.getTime() - ultimaVenta.getTime()) <= diasAtras) ||
                  (ultimaFactura && (hoy.getTime() - ultimaFactura.getTime()) <= diasAtras) ||
                  (ultimaCotizacion && (hoy.getTime() - ultimaCotizacion.getTime()) <= diasAtras);

                // Actividad exploratoria: clientes, proveedores o artículos recientes
                const tieneActividadExploratoria = 
                  (ultimoClienteNuevo && (hoy.getTime() - ultimoClienteNuevo.getTime()) <= diasAtras) ||
                  (ultimoRegistroProveedor && (hoy.getTime() - ultimoRegistroProveedor.getTime()) <= diasAtras) ||
                  (ultimoArticuloAgregado && (hoy.getTime() - ultimoArticuloAgregado.getTime()) <= diasAtras);

                let status: 'activo' | 'explorador' | 'inactivo';
                if (tieneActividadComercial) {
                  status = 'activo';
                } else if (tieneActividadExploratoria) {
                  status = 'explorador';
                } else {
                  status = 'inactivo';
                }

                return {
                  nombre: row[1],
                  email: row[3],
                  totalVentas,
                  ticketsGenerados,
                  facturas,
                  clientes,
                  status
                };
              })
              .sort((a, b) => b.totalVentas - a.totalVentas)
              .slice(0, 15);

            // Debug: Ver el top 15 por ventas
            console.log('TOP 15 por VENTAS TOTALES:');
            empresasConVentas.forEach((emp, idx) => {
              console.log(`${idx + 1}. ${emp.nombre}: $${emp.totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
            });

            const statusColors = {
              activo: 'bg-green-500',
              explorador: 'bg-yellow-500',
              inactivo: 'bg-red-500'
            };

            const statusLabels = {
              activo: 'A',
              explorador: 'E',
              inactivo: 'I'
            };

            return (
              <ChartCard 
                title="Top 15 Empresas por Ventas Totales" 
                badgeColor="green"
                description={`Esta tabla muestra las 15 empresas con mayores ventas totales acumuladas desde su registro en la plataforma. El ordenamiento es por volumen de facturación total, independientemente de la actividad reciente.`}
                purpose="Identificar las empresas con mayor volumen de ventas históricas para análisis de facturación y potencial comercial."
                dataUsed={['total_ventas', 'tickets_generados', 'facturas_emitidas', 'clientes_nuevos', 'ultima_venta', 'ultima_factura', 'ultima_cotizacion']}
                dataSource="Google Sheets - Hoja '2025', ordenado por ventas totales de mayor a menor. Estado calculado según slider de días de inactividad."
              >
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-1 md:px-2 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-6 md:w-8">
                          #
                        </th>
                        <th className="px-1 md:px-2 py-3 text-center text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-8 md:w-10">
                          
                        </th>
                        <th className="px-1 md:px-2 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-[28%] md:w-[35%]">
                          Empresa
                        </th>
                        <th className="px-1 md:px-2 py-3 text-right text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-[24%] md:w-[20%]">
                          Ventas ($)
                        </th>
                        <th className="px-1 md:px-2 py-3 text-right text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-[14%]">
                          Tickets
                        </th>
                        <th className="px-1 md:px-2 py-3 text-right text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                          Facturas
                        </th>
                        <th className="px-1 md:px-2 py-3 text-right text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                          Clientes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {empresasConVentas.map((empresa, index) => {
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-1 md:px-2 py-2 whitespace-nowrap text-[10px] md:text-xs font-bold text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-1 md:px-2 py-2 whitespace-nowrap">
                              <div className="flex items-center justify-center">
                                <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${statusColors[empresa.status]}`} title={statusLabels[empresa.status]}></div>
                              </div>
                            </td>
                            <td className="px-1 md:px-2 py-2 overflow-hidden">
                              <div className="font-medium text-[10px] md:text-xs text-gray-900 truncate" title={empresa.nombre}>
                                {empresa.nombre}
                              </div>
                              <div className="text-[8px] md:text-[10px] text-gray-500 truncate" title={empresa.email}>
                                {empresa.email}
                              </div>
                            </td>
                            <td className="px-1 md:px-2 py-2 whitespace-nowrap text-[9px] md:text-xs text-right font-semibold text-green-600">
                              ${empresa.totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-1 md:px-2 py-2 whitespace-nowrap text-[10px] md:text-xs text-right text-gray-900">
                              {empresa.ticketsGenerados.toLocaleString('es-MX')}
                            </td>
                            <td className="px-1 md:px-2 py-2 whitespace-nowrap text-[10px] md:text-xs text-right text-gray-900">
                              {empresa.facturas.toLocaleString('es-MX')}
                            </td>
                            <td className="px-1 md:px-2 py-2 whitespace-nowrap text-[10px] md:text-xs text-right text-gray-900">
                              {empresa.clientes.toLocaleString('es-MX')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Activo (últimos {diasInactividad} días)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Explorador</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Inactivo</span>
                    </div>
                  </div>
                  <div className="font-medium text-right">
                    <div>Ordenado por: Ventas Totales (mayor a menor)</div>
                  </div>
                </div>
              </ChartCard>
            );
          })()}
          </div>
          {/* Fin del grid de tablas Top 15 */}

          {/* ============================================ */}
          {/* SECCIÓN DE ANÁLISIS DE RETENCIÓN (EXPERIMENTAL) */}
          {/* Esta sección puede eliminarse completamente sin afectar el resto */}
          {/* ============================================ */}
          <div className="mt-8 pt-8 border-t-4 border-purple-500">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  🔬
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-900">Análisis de Retención (Experimental)</h2>
                  <p className="text-sm text-purple-700">Diagnóstico profundo para entender por qué tenemos bajo engagement</p>
                </div>
              </div>
              <div className="mt-3 bg-white/50 rounded-lg p-3 border border-purple-200">
                <p className="text-xs text-purple-800">
                  <strong>Objetivo:</strong> Identificar si el problema es onboarding (nunca arrancan), retención (arrancan pero se van), o timing (cuándo se van exactamente).
                </p>
              </div>
            </div>

            {/* Grid de 3 gráficas de análisis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              
              {/* 1. COHORTES POR MES DE REGISTRO */}
              {chartData && data && (() => {
                const rows = data.slice(1);
                
                // Agrupar por mes de registro
                const cohortesPorMes = rows.reduce((acc: any, row) => {
                  const fechaRegistro = row[0] ? new Date(row[0]) : null;
                  if (!fechaRegistro) return acc;
                  
                  const mesRegistro = `${fechaRegistro.getFullYear()}-${String(fechaRegistro.getMonth() + 1).padStart(2, '0')}`;
                  
                  if (!acc[mesRegistro]) {
                    acc[mesRegistro] = { activos: 0, exploradores: 0, inactivos: 0, sinActividad: 0, total: 0 };
                  }
                  
                  // Determinar estado actual
                  const hoy = new Date();
                  const haceNDias = new Date(hoy.getTime() - diasInactividad * 24 * 60 * 60 * 1000);
                  
                  const ultimaVenta = row[14] ? new Date(row[14]) : null;
                  const ultimaFactura = row[16] ? new Date(row[16]) : null;
                  const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
                  const ultimoCliente = row[20] ? new Date(row[20]) : null;
                  const ultimoProveedor = row[22] ? new Date(row[22]) : null;
                  const ultimoArticulo = row[24] ? new Date(row[24]) : null;
                  
                  const tieneActividadComercial = 
                    (ultimaVenta && ultimaVenta >= haceNDias) ||
                    (ultimaFactura && ultimaFactura >= haceNDias) ||
                    (ultimaCotizacion && ultimaCotizacion >= haceNDias);
                  
                  const tieneActividadExploratoria = 
                    (ultimoCliente && ultimoCliente >= haceNDias) ||
                    (ultimoProveedor && ultimoProveedor >= haceNDias) ||
                    (ultimoArticulo && ultimoArticulo >= haceNDias);
                  
                  const tieneActividadHistorica = row[14] || row[16] || row[18] || row[20] || row[22] || row[24];
                  
                  if (tieneActividadComercial) {
                    acc[mesRegistro].activos++;
                  } else if (tieneActividadExploratoria) {
                    acc[mesRegistro].exploradores++;
                  } else if (tieneActividadHistorica) {
                    acc[mesRegistro].inactivos++;
                  } else {
                    acc[mesRegistro].sinActividad++;
                  }
                  
                  acc[mesRegistro].total++;
                  return acc;
                }, {});
                
                const cohortesData = Object.entries(cohortesPorMes)
                  .map(([mes, stats]: [string, any]) => ({
                    mes: formatMonth(mes),
                    mesKey: mes,
                    activos: stats.activos,
                    exploradores: stats.exploradores,
                    inactivos: stats.inactivos,
                    sinActividad: stats.sinActividad,
                    total: stats.total,
                    pctActivos: ((stats.activos / stats.total) * 100).toFixed(1),
                  }))
                  .sort((a, b) => a.mesKey.localeCompare(b.mesKey));
                
                return (
                  <ChartCard
                    title="Cohortes por Mes de Registro"
                    badge="Retención"
                    badgeColor="purple"
                    description="Muestra el estado actual de las empresas agrupadas por su mes de registro. Si las cohortes antiguas tienen más inactivos, el problema es retención. Si las nuevas ya están inactivas, el problema es onboarding."
                    purpose="Identificar si perdemos usuarios con el tiempo (retención) o si nunca los activamos (onboarding)."
                    dataUsed={['fecha_creacion_empresa', 'ultima_venta', 'ultima_factura', 'ultima_cotizacion']}
                    dataSource="Google Sheets - Agrupado por mes de fecha_creacion_empresa"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={cohortesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-bold text-gray-800 mb-1">{payload[0].payload.mes}</p>
                                  <p className="text-xs text-gray-600 mb-2">Total: {payload[0].payload.total}</p>
                                  <div className="space-y-1 text-xs">
                                    <p className="flex items-center gap-2">
                                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                      Activos: {payload[0].payload.activos} ({payload[0].payload.pctActivos}%)
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                                      Exploradores: {payload[0].payload.exploradores}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                      Inactivos: {payload[0].payload.inactivos}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                                      Sin Actividad: {payload[0].payload.sinActividad}
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="activos" stackId="a" fill="#10B981" name="Activos" />
                        <Bar dataKey="exploradores" stackId="a" fill="#F59E0B" name="Exploradores" />
                        <Bar dataKey="inactivos" stackId="a" fill="#EF4444" name="Inactivos" />
                        <Bar dataKey="sinActividad" stackId="a" fill="#9CA3AF" name="Sin Actividad" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                );
              })()}

              {/* 2. TIME TO FIRST ACTION */}
              {chartData && data && (() => {
                const rows = data.slice(1);
                
                const empresasConTTFA = rows
                  .map((row) => {
                    const fechaRegistro = row[0] ? new Date(row[0]) : null;
                    const primeraVenta = row[13] ? new Date(row[13]) : null;
                    
                    if (!fechaRegistro) return null;
                    
                    // Calcular días hasta primera venta
                    let diasHastaPrimeraVenta = null;
                    if (primeraVenta && primeraVenta >= fechaRegistro) {
                      diasHastaPrimeraVenta = Math.floor((primeraVenta.getTime() - fechaRegistro.getTime()) / (1000 * 60 * 60 * 24));
                    }
                    
                    // Determinar estado actual
                    const hoy = new Date();
                    const haceNDias = new Date(hoy.getTime() - diasInactividad * 24 * 60 * 60 * 1000);
                    const ultimaVenta = row[14] ? new Date(row[14]) : null;
                    const ultimaFactura = row[16] ? new Date(row[16]) : null;
                    const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
                    
                    const esActivo = 
                      (ultimaVenta && ultimaVenta >= haceNDias) ||
                      (ultimaFactura && ultimaFactura >= haceNDias) ||
                      (ultimaCotizacion && ultimaCotizacion >= haceNDias);
                    
                    return {
                      diasHastaPrimeraVenta,
                      esActivo,
                      nombre: row[1],
                    };
                  })
                  .filter((item) => item !== null);
                
                // Agrupar en rangos
                const rangos = [
                  { label: 'Nunca', min: null, max: null, activos: 0, inactivos: 0 },
                  { label: '0-7 días', min: 0, max: 7, activos: 0, inactivos: 0 },
                  { label: '8-14 días', min: 8, max: 14, activos: 0, inactivos: 0 },
                  { label: '15-30 días', min: 15, max: 30, activos: 0, inactivos: 0 },
                  { label: '31-60 días', min: 31, max: 60, activos: 0, inactivos: 0 },
                  { label: '60+ días', min: 61, max: Infinity, activos: 0, inactivos: 0 },
                ];
                
                empresasConTTFA.forEach((emp: any) => {
                  if (emp.diasHastaPrimeraVenta === null) {
                    if (emp.esActivo) rangos[0].activos++;
                    else rangos[0].inactivos++;
                  } else {
                    const rango = rangos.find(r => 
                      r.min !== null && emp.diasHastaPrimeraVenta >= r.min && emp.diasHastaPrimeraVenta <= r.max
                    );
                    if (rango) {
                      if (emp.esActivo) rango.activos++;
                      else rango.inactivos++;
                    }
                  }
                });
                
                return (
                  <ChartCard
                    title="Time to First Action"
                    badge="Activación"
                    badgeColor="purple"
                    description="Días que tardaron las empresas en realizar su primera venta. Si las inactivas tardaron mucho o nunca la hicieron, el problema es onboarding deficiente."
                    purpose="Identificar si las empresas inactivas nunca vieron valor (nunca hicieron primera venta) o si tardaron demasiado en arrancar."
                    dataUsed={['fecha_creacion_empresa', 'primera_venta', 'ultima_venta']}
                    dataSource="Google Sheets - Cálculo: primera_venta - fecha_creacion_empresa"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={rangos}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const total = payload[0].payload.activos + payload[0].payload.inactivos;
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-bold text-gray-800 mb-2">{payload[0].payload.label}</p>
                                  <p className="text-xs text-gray-600 mb-2">Total: {total} empresas</p>
                                  <div className="space-y-1 text-xs">
                                    <p className="text-green-600">Activos: {payload[0].payload.activos}</p>
                                    <p className="text-red-600">Inactivos: {payload[0].payload.inactivos}</p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="activos" stackId="a" fill="#10B981" name="Activos Hoy" />
                        <Bar dataKey="inactivos" stackId="a" fill="#EF4444" name="Inactivos Hoy" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                );
              })()}

              {/* 3. CURVA DE RETENCIÓN */}
              {chartData && data && (() => {
                const rows = data.slice(1);
                const hoy = new Date();
                
                // Calcular retención en diferentes puntos temporales
                const puntosRetencion = [
                  { dias: 7, label: 'Día 7' },
                  { dias: 14, label: 'Día 14' },
                  { dias: 30, label: 'Día 30' },
                  { dias: 60, label: 'Día 60' },
                  { dias: 90, label: 'Día 90' },
                  { dias: 180, label: 'Día 180' },
                ];
                
                const curvaRetencion = puntosRetencion.map(punto => {
                  // Filtrar empresas registradas hace al menos N días
                  const empresasElegibles = rows.filter(row => {
                    const fechaRegistro = row[0] ? new Date(row[0]) : null;
                    if (!fechaRegistro) return false;
                    
                    const diasDesdeRegistro = Math.floor((hoy.getTime() - fechaRegistro.getTime()) / (1000 * 60 * 60 * 24));
                    return diasDesdeRegistro >= punto.dias;
                  });
                  
                  if (empresasElegibles.length === 0) {
                    return {
                      label: punto.label,
                      dias: punto.dias,
                      retencion: 0,
                      activos: 0,
                      total: 0,
                    };
                  }
                  
                  // Calcular cuántas estaban activas en ese momento
                  // Asumimos "activas" = tuvieron actividad después del día N
                  const activasEnPuntoN = empresasElegibles.filter(row => {
                    const fechaRegistro = new Date(row[0]);
                    const fechaPuntoN = new Date(fechaRegistro.getTime() + punto.dias * 24 * 60 * 60 * 1000);
                    
                    const ultimaVenta = row[14] ? new Date(row[14]) : null;
                    const ultimaFactura = row[16] ? new Date(row[16]) : null;
                    const ultimaCotizacion = row[18] ? new Date(row[18]) : null;
                    
                    // Tuvo actividad después del día N?
                    return (
                      (ultimaVenta && ultimaVenta >= fechaPuntoN) ||
                      (ultimaFactura && ultimaFactura >= fechaPuntoN) ||
                      (ultimaCotizacion && ultimaCotizacion >= fechaPuntoN)
                    );
                  }).length;
                  
                  const retencion = (activasEnPuntoN / empresasElegibles.length) * 100;
                  
                  return {
                    label: punto.label,
                    dias: punto.dias,
                    retencion: parseFloat(retencion.toFixed(1)),
                    activos: activasEnPuntoN,
                    total: empresasElegibles.length,
                  };
                });
                
                return (
                  <ChartCard
                    title="Curva de Retención"
                    badge="Lifecycle"
                    badgeColor="purple"
                    description="Porcentaje de empresas que siguen activas N días después de registrarse. Identifica el momento exacto donde pierdes usuarios (ej: caída fuerte en día 30 = crisis de onboarding)."
                    purpose="Detectar el 'día crítico' donde se produce la mayor pérdida de usuarios para intervenir a tiempo."
                    dataUsed={['fecha_creacion_empresa', 'ultima_venta', 'ultima_factura', 'ultima_cotizacion']}
                    dataSource="Google Sheets - Análisis longitudinal de actividad post-registro"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={curvaRetencion}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis domain={[0, 100]} label={{ value: '% Retención', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-bold text-gray-800 mb-2">{payload[0].payload.label}</p>
                                  <div className="space-y-1 text-xs">
                                    <p className="text-purple-700 font-bold text-lg">
                                      {payload[0].payload.retencion}% retenidos
                                    </p>
                                    <p className="text-gray-600">
                                      {payload[0].payload.activos} de {payload[0].payload.total} empresas
                                    </p>
                                    <p className="text-red-600">
                                      Churn: {(100 - payload[0].payload.retencion).toFixed(1)}%
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="retencion" 
                          stroke="#8B5CF6" 
                          strokeWidth={3} 
                          name="% Retención" 
                          dot={{ r: 6, fill: '#8B5CF6' }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>
                );
              })()}

            </div>

            {/* Footer de la sección experimental */}
            <div className="mt-6 bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg p-4 text-center">
              <p className="text-sm text-purple-700">
                💡 <strong>Análisis Experimental:</strong> Esta sección está separada del dashboard principal. 
                Si no aporta valor, puede eliminarse fácilmente sin afectar las demás métricas.
              </p>
            </div>
          </div>
          {/* FIN SECCIÓN DE ANÁLISIS DE RETENCIÓN */}

        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import ChartCard from './ChartCard';
import ConversionSemaphore from './ConversionSemaphore';

interface SheetData {
  success: boolean;
  data: string[][];
  range?: string;
  error?: string;
}

export default function Dashboard() {
  const [data, setData] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        crecimientoEmpresas: [],
        ventasTotales: [],
        conversionCotizaciones: [],
        ticketPromedio: [],
        adopcionFeatures: [],
        empresasActivas: [],
        tasaFacturacion: [],
        nuevosClientes: [],
        actividadReciente: [],
        distribucionVentas: [],
      };
    }

    const rows = data.slice(1);
    
    // Helper function para agrupar por mes
    const groupByMonth = (rows: string[][]) => {
      const grouped: { [key: string]: any[] } = {};
      rows.forEach(row => {
        const fecha = new Date(row[0]);
        const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        if (!grouped[mesAnio]) grouped[mesAnio] = [];
        grouped[mesAnio].push(row);
      });
      return grouped;
    };

    const byMonth = groupByMonth(rows);

    // 1. Crecimiento de Empresas por Mes
    const crecimientoEmpresas = Object.entries(byMonth).map(([mes, empresas]) => ({
      mes: new Date(mes + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      nuevas: empresas.length,
      acumuladas: rows.filter(r => new Date(r[0]) <= new Date(mes + '-01')).length,
    }));

    // 2. Ventas Totales por Mes
    const ventasTotales = Object.entries(byMonth).map(([mes, empresas]) => ({
      mes: new Date(mes + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      ventas: empresas.reduce((sum, row) => sum + (parseFloat(row[6]) || 0), 0),
      tickets: empresas.reduce((sum, row) => sum + (parseFloat(row[4]) || 0), 0),
    }));

    // 3. Conversión: Cotizaciones → Tickets Facturados
    const conversionCotizaciones = rows.map(row => ({
      empresa: row[1].substring(0, 20),
      cotizaciones: parseFloat(row[9]) || 0,
      facturados: parseFloat(row[5]) || 0,
      tasa: ((parseFloat(row[5]) / parseFloat(row[9])) * 100) || 0,
    })).filter(d => d.cotizaciones > 0).slice(0, 12);

    // 4. Ticket Promedio por Empresa
    const ticketPromedio = rows.map(row => ({
      empresa: row[1].substring(0, 20),
      ticket_promedio: parseFloat(row[7]) || 0,
      total_ventas: parseFloat(row[6]) || 0,
    })).sort((a, b) => b.total_ventas - a.total_ventas).slice(0, 10);

    // 5. Adopción de Features (Tickets, Facturas, Cotizaciones, Clientes, Proveedores, Artículos)
    const adopcionFeatures = [
      {
        feature: 'Tickets',
        empresas_usan: rows.filter(r => parseFloat(r[4]) > 0).length,
        total_empresas: rows.length,
        porcentaje: (rows.filter(r => parseFloat(r[4]) > 0).length / rows.length) * 100,
      },
      {
        feature: 'Facturas',
        empresas_usan: rows.filter(r => parseFloat(r[8]) > 0).length,
        total_empresas: rows.length,
        porcentaje: (rows.filter(r => parseFloat(r[8]) > 0).length / rows.length) * 100,
      },
      {
        feature: 'Cotizaciones',
        empresas_usan: rows.filter(r => parseFloat(r[9]) > 0).length,
        total_empresas: rows.length,
        porcentaje: (rows.filter(r => parseFloat(r[9]) > 0).length / rows.length) * 100,
      },
      {
        feature: 'Clientes',
        empresas_usan: rows.filter(r => parseFloat(r[11]) > 0).length,
        total_empresas: rows.length,
        porcentaje: (rows.filter(r => parseFloat(r[11]) > 0).length / rows.length) * 100,
      },
      {
        feature: 'Proveedores',
        empresas_usan: rows.filter(r => parseFloat(r[12]) > 0).length,
        total_empresas: rows.length,
        porcentaje: (rows.filter(r => parseFloat(r[12]) > 0).length / rows.length) * 100,
      },
      {
        feature: 'Artículos',
        empresas_usan: rows.filter(r => parseFloat(r[10]) > 0).length,
        total_empresas: rows.length,
        porcentaje: (rows.filter(r => parseFloat(r[10]) > 0).length / rows.length) * 100,
      },
    ];

    // 6. Empresas Activas vs Inactivas (basado en última_venta en últimos 30 días)
    const hoy = new Date();
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    const hace60Dias = new Date(hoy.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const empresasActivas = {
      activas: rows.filter(r => r[14] && new Date(r[14]) >= hace30Dias).length,
      moderadas: rows.filter(r => r[14] && new Date(r[14]) >= hace60Dias && new Date(r[14]) < hace30Dias).length,
      inactivas: rows.filter(r => !r[14] || new Date(r[14]) < hace60Dias).length,
    };

    // 7. Tasa de Facturación (Tickets Facturados / Tickets Generados)
    const tasaFacturacion = Object.entries(byMonth).map(([mes, empresas]) => ({
      mes: new Date(mes + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      tickets_generados: empresas.reduce((sum, row) => sum + (parseFloat(row[4]) || 0), 0),
      tickets_facturados: empresas.reduce((sum, row) => sum + (parseFloat(row[5]) || 0), 0),
      tasa: (empresas.reduce((sum, row) => sum + (parseFloat(row[5]) || 0), 0) / 
             empresas.reduce((sum, row) => sum + (parseFloat(row[4]) || 0), 0) * 100) || 0,
    }));

    // 8. Nuevos Clientes por Mes
    const nuevosClientes = Object.entries(byMonth).map(([mes, empresas]) => ({
      mes: new Date(mes + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      clientes: empresas.reduce((sum, row) => sum + (parseFloat(row[11]) || 0), 0),
      proveedores: empresas.reduce((sum, row) => sum + (parseFloat(row[12]) || 0), 0),
    }));

    // 9. Actividad Reciente (últimos 7 días basado en última_venta, ultima_factura, ultima_cotizacion)
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const actividadReciente = {
      con_ventas: rows.filter(r => r[14] && new Date(r[14]) >= hace7Dias).length,
      con_facturas: rows.filter(r => r[16] && new Date(r[16]) >= hace7Dias).length,
      con_cotizaciones: rows.filter(r => r[18] && new Date(r[18]) >= hace7Dias).length,
      con_clientes: rows.filter(r => r[20] && new Date(r[20]) >= hace7Dias).length,
    };

    // 10. Distribución de Ventas (Top 10 empresas)
    const distribucionVentas = rows
      .map(row => ({
        empresa: row[1].substring(0, 25),
        ventas: parseFloat(row[6]) || 0,
      }))
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 10);

    return {
      crecimientoEmpresas,
      ventasTotales,
      conversionCotizaciones,
      ticketPromedio,
      adopcionFeatures,
      empresasActivas,
      tasaFacturacion,
      nuevosClientes,
      actividadReciente,
      distribucionVentas,
    };
  };

  const chartData = processDataForCharts();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-[1800px] mx-auto">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Kladi PM
          </h1>
          <p className="text-gray-600 text-lg">Métricas comprehensivas para Product Management</p>
        </header>

        <div className="space-y-6">
          {/* Semáforo de Conversión */}
          <ConversionSemaphore data={data || []} />

          {/* KPIs Principales - Grid de 3 columnas */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* MRR Chart */}
            <ChartCard
              title="MRR - Ingresos Recurrentes"
              badge="Métricas de Crecimiento"
              badgeColor="green"
              description="Gráfica que muestra la evolución mensual del MRR (Monthly Recurring Revenue) comparado con el objetivo establecido."
              purpose="Monitorear el crecimiento de ingresos predecibles y recurrentes del producto. Permite identificar tendencias de crecimiento, estancamiento o caída en la generación de ingresos mensuales."
              dataUsed={['MRR (Monthly Recurring Revenue)', 'Objetivo de MRR']}
              dataSource="Google Sheets - Columna 'MRR' del dashboard de métricas PM"
            >
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData.mrr}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="mrr" 
                    stroke="#10B981" 
                    fillOpacity={1}
                    fill="url(#colorMrr)"
                    name="MRR ($)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="objetivo" 
                    stroke="#EF4444" 
                    strokeDasharray="5 5"
                    name="Objetivo"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* CAC vs LTV */}
            <ChartCard
              title="CAC vs LTV"
              badge="Eficiencia de Adquisición"
              badgeColor="purple"
              description="Comparación entre el Costo de Adquisición de Cliente (CAC) y el Valor del Tiempo de Vida del Cliente (LTV)."
              purpose="Evaluar la rentabilidad y eficiencia de las estrategias de adquisición. Un LTV/CAC ratio > 3:1 indica un modelo de negocio saludable. Ayuda a optimizar el gasto en marketing y ventas."
              dataUsed={['CAC (Customer Acquisition Cost)', 'LTV (Lifetime Value)']}
              dataSource="Google Sheets - Columnas 'CAC' y 'LTV' del dashboard de métricas PM"
            >
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.cacVsLtv}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cac" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    name="CAC ($)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ltv" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="LTV ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* NRR */}
            <ChartCard
              title="NRR - Retención Neta"
              badge="Expansión de Ingresos"
              badgeColor="blue"
              description="Net Revenue Retention (NRR) mide la capacidad de retener y expandir ingresos de clientes existentes."
              purpose="Evaluar la salud del negocio y capacidad de expansión. NRR > 100% indica que los ingresos de upsells superan el churn. Es clave para empresas SaaS y suscripción."
              dataUsed={['NRR (Net Revenue Retention)', 'Baseline 100%']}
              dataSource="Google Sheets - Columna 'NRR' del dashboard de métricas PM"
            >
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={chartData.nrr}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="nrr" 
                    fill="#3B82F6" 
                    stroke="#3B82F6"
                    name="NRR (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="baseline" 
                    stroke="#EF4444" 
                    strokeDasharray="5 5"
                    name="Baseline 100%"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Métricas de Ventas y Conversión */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Ventas Chart */}
            <ChartCard
              title="Ventas Mensuales"
              badge="Performance de Ventas"
              badgeColor="blue"
              description="Evolución de ventas mensuales comparadas con el objetivo establecido para cada período."
              purpose="Monitorear el desempeño comercial del producto, identificar tendencias de crecimiento, estacionalidad y evaluar el cumplimiento de metas. Fundamenta decisiones sobre pricing, promociones y estrategias de go-to-market."
              dataUsed={['Ventas mensuales ($)', 'Objetivo de ventas ($)']}
              dataSource="Google Sheets - Columnas 'Ventas' y 'Objetivo' del dashboard de métricas PM"
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.ventas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ventas" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                    name="Ventas ($)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="objetivo" 
                    stroke="#FF8042" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Objetivo ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Cotizaciones */}
            <ChartCard
              title="Embudo de Cotizaciones"
              badge="Conversión"
              badgeColor="green"
              description="Número de cotizaciones generadas vs convertidas en ventas por período."
              purpose="Monitorear la efectividad del embudo de ventas, calcular tasas de conversión y detectar cuellos de botella en el proceso comercial. Evalúa el impacto de mejoras en onboarding y propuesta de valor."
              dataUsed={['Cotizaciones totales', 'Cotizaciones convertidas']}
              dataSource="Google Sheets - Columnas 'Cotizaciones' y 'Convertidas' del dashboard de métricas PM"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.cotizaciones}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semana" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cotizaciones" fill="#00C49F" name="Cotizaciones" />
                  <Bar dataKey="convertidas" fill="#FFBB28" name="Convertidas" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Métricas de Usuario */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* DAU/MAU */}
            <ChartCard
              title="DAU/MAU & Stickiness"
              badge="Engagement"
              badgeColor="purple"
              description="Daily Active Users vs Monthly Active Users, incluyendo el ratio de stickiness (DAU/MAU)."
              purpose="Medir el engagement y la frecuencia de uso del producto. Un stickiness alto (>20%) indica que el producto es parte de la rutina diaria de los usuarios. Clave para productos B2C y herramientas de productividad."
              dataUsed={['DAU (Daily Active Users)', 'MAU (Monthly Active Users)', 'Stickiness Ratio']}
              dataSource="Google Sheets - Columnas 'DAU' y 'MAU' del dashboard de métricas PM"
            >
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={chartData.dauMau}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="dau" fill="#8B5CF6" name="DAU" />
                  <Bar yAxisId="left" dataKey="mau" fill="#A78BFA" name="MAU" />
                  <Line yAxisId="right" type="monotone" dataKey="stickiness" stroke="#EF4444" strokeWidth={2} name="Stickiness (%)" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Feature Adoption */}
            <ChartCard
              title="Adopción de Features"
              badge="Uso de Producto"
              badgeColor="orange"
              description="Porcentaje de usuarios que utilizan cada funcionalidad principal del producto."
              purpose="Identificar features más valiosas, detectar features subutilizadas que necesitan mejora o marketing, y priorizar desarrollo futuro basado en uso real. Ayuda a decidir qué features deprecar."
              dataUsed={['Feature 1 Usage (%)', 'Feature 2 Usage (%)', 'Feature 3 Usage (%)']}
              dataSource="Google Sheets - Columnas de uso de features del dashboard de métricas PM"
            >
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData.featureAdoption} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="feature" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="adopcion" fill="#F59E0B" name="Adopción (%)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Empresas Activas */}
            <ChartCard
              title="Empresas Activas por Segmento"
              badge="Segmentación"
              badgeColor="green"
              description="Distribución de empresas activas segmentadas por categoría o vertical de negocio."
              purpose="Entender qué segmentos adoptan más el producto para priorizar features, definir estrategias de go-to-market específicas y analizar Product-Market Fit por vertical. Identifica oportunidades en segmentos sub-representados."
              dataUsed={['Empresas Activas por Categoría']}
              dataSource="Google Sheets - Columna 'Empresas Activas' del dashboard de métricas PM"
            >
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.empresas}
                    dataKey="activas"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {chartData.empresas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Métricas Financieras */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Churn Rate */}
            <ChartCard
              title="Churn Rate"
              badge="Retención"
              badgeColor="red"
              description="Porcentaje mensual de clientes que cancelan o dejan de usar el producto."
              purpose="Monitorear la salud del negocio y retención de clientes. Un churn bajo (<2%) indica product-market fit fuerte. Permite identificar problemas en la experiencia del usuario y calcular la viabilidad del modelo de negocio."
              dataUsed={['Churn Rate (%)', 'Objetivo de Churn (<2%)']}
              dataSource="Google Sheets - Columna 'Churn' del dashboard de métricas PM"
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.churn}>
                  <defs>
                    <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="churn" 
                    stroke="#EF4444" 
                    fillOpacity={1}
                    fill="url(#colorChurn)"
                    name="Churn (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="objetivo" 
                    stroke="#10B981" 
                    strokeDasharray="5 5"
                    name="Objetivo (<2%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Revenue by Plan */}
            <ChartCard
              title="Ingresos por Plan"
              badge="Monetización"
              badgeColor="blue"
              description="Distribución de ingresos entre los diferentes planes de suscripción (Basic, Pro, Enterprise)."
              purpose="Analizar qué planes generan más ingresos, identificar oportunidades de upsell, optimizar pricing y entender el mix de clientes. Ayuda a decidir dónde invertir en features específicas por plan."
              dataUsed={['Revenue Plan Basic', 'Revenue Plan Pro', 'Revenue Plan Enterprise']}
              dataSource="Google Sheets - Columnas de revenue por plan del dashboard de métricas PM"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.revenueByPlan}
                    dataKey="revenue"
                    nameKey="plan"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.plan}: $${entry.revenue}k`}
                  >
                    {chartData.revenueByPlan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Métricas de Satisfacción y Embudo */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* NPS Score */}
            <ChartCard
              title="NPS Score - Net Promoter Score"
              badge="Satisfacción"
              badgeColor="green"
              description="Evolución del Net Promoter Score que mide la lealtad y satisfacción de los clientes."
              purpose="Evaluar la satisfacción general y probabilidad de recomendación del producto. NPS > 50 es excelente. Permite correlacionar mejoras del producto con satisfacción del usuario y predecir crecimiento orgánico."
              dataUsed={['NPS Score']}
              dataSource="Google Sheets - Columna 'NPS' del dashboard de métricas PM"
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.nps}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="nps" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="NPS Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Conversion Funnel */}
            <ChartCard
              title="Embudo de Conversión"
              badge="Funnel Analysis"
              badgeColor="purple"
              description="Visualización del embudo completo desde visitantes hasta usuarios activos."
              purpose="Identificar puntos de fuga en el customer journey, optimizar cada etapa del embudo y maximizar la conversión end-to-end. Permite calcular ROI de iniciativas de optimización."
              dataUsed={['Visitantes', 'Cotizaciones', 'Convertidos', 'Usuarios Activos']}
              dataSource="Google Sheets - Datos calculados del dashboard de métricas PM"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.conversionFunnel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="valor" fill="#8B5CF6" name="Cantidad">
                    {chartData.conversionFunnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Data Preview */}
          {data && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Vista de Datos Raw
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {data[0]?.map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.slice(1, 11).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 11 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Mostrando 10 de {data.length - 1} filas
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
} from 'recharts';

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

  // Process data for charts
  const processDataForCharts = () => {
    if (!data || data.length < 2) return { ventas: [], empresas: [], cotizaciones: [] };

    const rows = data.slice(1);

    // Example: Process sales data (ventas)
    const ventasData = rows.slice(0, 12).map((row, index) => ({
      mes: row[0] || `Mes ${index + 1}`,
      ventas: parseFloat(row[1]) || 0,
      objetivo: parseFloat(row[2]) || 0,
    }));

    // Example: Process active companies (empresas activas)
    const empresasData = rows.slice(0, 6).map((row, index) => ({
      categoria: row[0] || `Categoría ${index + 1}`,
      activas: parseFloat(row[3]) || 0,
    }));

    // Example: Process quotes (cotizaciones)
    const cotizacionesData = rows.slice(0, 8).map((row, index) => ({
      semana: row[0] || `Semana ${index + 1}`,
      cotizaciones: parseFloat(row[4]) || 0,
      convertidas: parseFloat(row[5]) || 0,
    }));

    return { ventas: ventasData, empresas: empresasData, cotizaciones: cotizacionesData };
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Kladi</h1>
          <p className="text-gray-600">Métricas y análisis de producto</p>
        </header>

        <div className="grid gap-6">
          {/* Ventas Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ventas</h2>
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
                  name="Ventas"
                />
                <Line 
                  type="monotone" 
                  dataKey="objetivo" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Objetivo"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Grid for Empresas Activas and Cotizaciones */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Empresas Activas Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Empresas Activas</h2>
              <ResponsiveContainer width="100%" height={300}>
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
            </div>

            {/* Cotizaciones Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cotizaciones</h2>
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
            </div>
          </div>

          {/* Data Preview */}
          {data && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Vista de Datos</h2>
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

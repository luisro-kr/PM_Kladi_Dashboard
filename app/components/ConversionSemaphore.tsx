'use client';

import { useState } from 'react';

interface ConversionSemaphoreProps {
  data: string[][];
}

export default function ConversionSemaphore({ data }: ConversionSemaphoreProps) {
  const [days, setDays] = useState(7);

  // Calcular promedios basados en los últimos N días (simulado con los últimos N meses)
  const calculateAverages = () => {
    if (!data || data.length < 2) {
      return { activos: 0, exploracion: 0, inactivos: 0 };
    }

    const monthsToConsider = Math.min(days, data.length - 1);
    const rows = data.slice(-monthsToConsider);

    let totalActivos = 0;
    let totalExploracion = 0;
    let totalInactivos = 0;

    rows.forEach((row) => {
      totalActivos += parseFloat(row[22]) || 0; // Columna Usuarios_Activos
      totalExploracion += parseFloat(row[23]) || 0; // Columna Usuarios_Exploracion
      totalInactivos += parseFloat(row[24]) || 0; // Columna Usuarios_Inactivos
    });

    const count = rows.length || 1;
    return {
      activos: Math.round(totalActivos / count),
      exploracion: Math.round(totalExploracion / count),
      inactivos: Math.round(totalInactivos / count),
    };
  };

  const averages = calculateAverages();
  const total = averages.activos + averages.exploracion + averages.inactivos || 1;

  const percentActivos = ((averages.activos / total) * 100).toFixed(1);
  const percentExploracion = ((averages.exploracion / total) * 100).toFixed(1);
  const percentInactivos = ((averages.inactivos / total) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Semáforo de Conversión</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Últimos {days} días
        </span>
      </div>

      {/* Slider */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">Período de análisis</label>
          <span className="text-lg font-bold text-blue-600">{days} días</span>
        </div>
        <input
          type="range"
          min="1"
          max="30"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((days - 1) / 29) * 100}%, #E5E7EB ${((days - 1) / 29) * 100}%, #E5E7EB 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 día</span>
          <span>15 días</span>
          <span>30 días</span>
        </div>
      </div>

      {/* Semáforo Visual */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Activos */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse-soft"></div>
            <div className="absolute inset-2 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-1">Activos</h3>
          <p className="text-3xl font-bold text-green-600 mb-1">{averages.activos.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{percentActivos}% del total</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentActivos}%` }}
            ></div>
          </div>
        </div>

        {/* Exploración */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <div className="absolute inset-0 bg-yellow-500 rounded-full animate-pulse-soft"></div>
            <div className="absolute inset-2 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-1">Exploración</h3>
          <p className="text-3xl font-bold text-yellow-600 mb-1">{averages.exploracion.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{percentExploracion}% del total</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentExploracion}%` }}
            ></div>
          </div>
        </div>

        {/* Inactivos */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse-soft"></div>
            <div className="absolute inset-2 bg-red-400 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-1">Inactivos</h3>
          <p className="text-3xl font-bold text-red-600 mb-1">{averages.inactivos.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{percentInactivos}% del total</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentInactivos}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Total de usuarios</h4>
            <p className="text-2xl font-bold text-blue-600">{total.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">
              {percentActivos}% en uso activo • {percentExploracion}% explorando • {percentInactivos}% inactivos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

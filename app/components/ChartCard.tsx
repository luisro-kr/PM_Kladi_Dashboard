'use client';

import { useState, ReactNode } from 'react';
import ChartDescriptionModal from './ChartDescriptionModal';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  description: string;
  purpose: string;
  dataUsed: string[];
  dataSource: string;
  badge?: string;
  badgeColor?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export default function ChartCard({
  title,
  children,
  description,
  purpose,
  dataUsed,
  dataSource,
  badge,
  badgeColor = 'blue',
}: ChartCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const badgeColors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
            {badge && (
              <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${badgeColors[badgeColor]}`}>
                {badge}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-blue-200"
            title="Ver descripción de esta métrica"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Descripción
          </button>
        </div>
        <div>{children}</div>
      </div>

      <ChartDescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        description={description}
        purpose={purpose}
        dataUsed={dataUsed}
        dataSource={dataSource}
      />
    </>
  );
}

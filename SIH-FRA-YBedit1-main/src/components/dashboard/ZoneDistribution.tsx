import React from 'react';
import { Wheat, Trees, Droplets, Home, Building2 } from 'lucide-react';

const zoneData = [
  {
    type: 'Agricultural',
    count: 1456,
    percentage: 51.2,
    icon: Wheat,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  {
    type: 'Forest',
    count: 743,
    percentage: 26.1,
    icon: Trees,
    color: 'bg-emerald-600',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-700'
  },
  {
    type: 'Water Bodies',
    count: 298,
    percentage: 10.5,
    icon: Droplets,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    type: 'Residential',
    count: 234,
    percentage: 8.2,
    icon: Home,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  },
  {
    type: 'Commercial',
    count: 116,
    percentage: 4.0,
    icon: Building2,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  }
];

export const ZoneDistribution: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Zone Distribution</h3>
        <div className="text-sm text-gray-500">Total: 2,847 plots</div>
      </div>

      <div className="space-y-4">
        {zoneData.map((zone) => {
          const Icon = zone.icon;
          
          return (
            <div key={zone.type} className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${zone.lightColor}`}>
                <Icon className={`h-5 w-5 ${zone.textColor}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{zone.type}</span>
                  <span className="text-sm text-gray-600">{zone.count} plots</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className={`${zone.color} rounded-full h-2 transition-all duration-500`}
                      style={{ width: `${zone.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{zone.percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
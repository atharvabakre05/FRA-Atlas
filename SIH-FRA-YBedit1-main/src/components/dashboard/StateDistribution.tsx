import React from 'react';

const stateData = [
  { name: 'Maharashtra', count: 847, color: 'bg-blue-500' },
  { name: 'Uttar Pradesh', count: 623, color: 'bg-green-500' },
  { name: 'Karnataka', count: 489, color: 'bg-purple-500' },
  { name: 'Tamil Nadu', count: 356, color: 'bg-orange-500' },
  { name: 'Gujarat', count: 298, color: 'bg-red-500' },
  { name: 'Other States', count: 234, color: 'bg-gray-400' }
];

export const StateDistribution: React.FC = () => {
  const total = stateData.reduce((sum, state) => sum + state.count, 0);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">State-wise Distribution</h3>
        <div className="text-sm text-gray-500">6 states covered</div>
      </div>

      <div className="space-y-3">
        {stateData.map((state, index) => {
          const percentage = (state.count / total * 100).toFixed(1);
          
          return (
            <div key={state.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${state.color}`}></div>
                <span className="text-sm font-medium text-gray-900">{state.name}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{state.count}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
                
                <div className="w-16 bg-gray-100 rounded-full h-2">
                  <div
                    className={`${state.color} rounded-full h-2 transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-900">Total Plots</span>
          <span className="font-bold text-gray-900">{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { MapPin, TrendingUp } from 'lucide-react';

const stateData = [
  { 
    name: 'Madhya Pradesh', 
    total: 18456, 
    granted: 12234, 
    pending: 4892, 
    rejected: 1330,
    villages: 1247,
    tribalPop: 89234,
    color: 'bg-forest-dark',
    progress: 66.3
  },
  { 
    name: 'Odisha', 
    total: 14623, 
    granted: 9456, 
    pending: 3834, 
    rejected: 1333,
    villages: 987,
    tribalPop: 67890,
    color: 'bg-forest-medium',
    progress: 64.7
  },
  { 
    name: 'Telangana', 
    total: 8947, 
    granted: 5234, 
    pending: 2890, 
    rejected: 823,
    villages: 634,
    tribalPop: 45123,
    color: 'bg-forest-moss',
    progress: 58.5
  },
  { 
    name: 'Tripura', 
    total: 5806, 
    granted: 3532, 
    pending: 1890, 
    rejected: 384,
    villages: 379,
    tribalPop: 28987,
    color: 'bg-forest-accent',
    progress: 60.8
  }
];

export const StateWiseProgress: React.FC = () => {
  const totalClaims = stateData.reduce((sum, state) => sum + state.total, 0);
  const totalGranted = stateData.reduce((sum, state) => sum + state.granted, 0);
  const overallProgress = (totalGranted / totalClaims * 100).toFixed(1);
  
  return (
    <div className="forest-chart">
      <div className="forest-chart-header">
        <h3 className="forest-chart-title">State-wise FRA Progress</h3>
        <div className="forest-badge-success">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>Overall: {overallProgress}%</span>
        </div>
      </div>

      <div className="space-y-4">
        {stateData.map((state, index) => {
          return (
            <div key={state.name} className="forest-card border-forest-sage/20 hover:border-forest-medium/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${state.color} shadow-forest`}></div>
                  <div>
                    <h4 className="font-semibold text-forest-dark">{state.name}</h4>
                    <p className="text-xs text-forest-medium">{state.villages} villages • {state.tribalPop.toLocaleString()} tribal population</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-forest-dark">{state.progress}%</div>
                  <div className="text-xs text-forest-medium">{state.granted.toLocaleString()}/{state.total.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="forest-progress">
                  <div
                    className={`${state.color} rounded-l-full h-2 transition-all duration-500`}
                    style={{ width: `${(state.granted / state.total) * 100}%` }}
                  ></div>
                  <div
                    className="bg-forest-accent h-2"
                    style={{ width: `${(state.pending / state.total) * 100}%` }}
                  ></div>
                  <div
                    className="bg-red-400 rounded-r-full h-2"
                    style={{ width: `${(state.rejected / state.total) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-forest-medium font-medium">
                  <span>Granted: {state.granted.toLocaleString()}</span>
                  <span>Pending: {state.pending.toLocaleString()}</span>
                  <span>Rejected: {state.rejected.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-forest-sage/20">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-4 bg-forest-sage/5 rounded-lg">
            <div className="text-2xl font-bold text-forest-dark">{totalClaims.toLocaleString()}</div>
            <div className="text-sm text-forest-medium font-medium">Total Claims</div>
          </div>
          <div className="text-center p-4 bg-forest-medium/5 rounded-lg">
            <div className="text-2xl font-bold text-forest-medium">{totalGranted.toLocaleString()}</div>
            <div className="text-sm text-forest-medium font-medium">Successfully Granted</div>
          </div>
        </div>
      </div>
    </div>
  );
};
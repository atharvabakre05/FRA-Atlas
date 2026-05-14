import React from 'react';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

const fraData = [
  {
    type: 'Individual Forest Rights (IFR)',
    total: 28456,
    granted: 18234,
    pending: 7892,
    rejected: 2330,
    percentage: 64.1,
    icon: FileText,
    color: 'bg-forest-dark',
    lightColor: 'bg-forest-sky',
    textColor: 'text-forest-dark'
  },
  {
    type: 'Community Rights (CR)',
    total: 12847,
    granted: 8456,
    pending: 3234,
    rejected: 1157,
    percentage: 65.8,
    icon: CheckCircle,
    color: 'bg-forest-medium',
    lightColor: 'bg-forest-sage/10',
    textColor: 'text-forest-medium'
  },
  {
    type: 'Community Forest Resource Rights (CFR)',
    total: 6529,
    granted: 3766,
    pending: 1890,
    rejected: 873,
    percentage: 57.7,
    icon: Clock,
    color: 'bg-forest-accent',
    lightColor: 'bg-forest-earth/10',
    textColor: 'text-forest-accent'
  }
];

export const FRAProgress: React.FC = () => {
  const totalClaims = fraData.reduce((sum, item) => sum + item.total, 0);
  const totalGranted = fraData.reduce((sum, item) => sum + item.granted, 0);
  const overallPercentage = (totalGranted / totalClaims * 100).toFixed(1);

  return (
    <div className="forest-chart">
      <div className="forest-chart-header">
        <h3 className="forest-chart-title">FRA Claims Progress</h3>
        <div className="forest-badge-success">
          Overall Success: <span className="font-bold">{overallPercentage}%</span>
        </div>
      </div>

      <div className="space-y-6">
        {fraData.map((item) => {
          const Icon = item.icon;
          
          return (
            <div key={item.type} className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${item.lightColor} shadow-forest`}>
                  <Icon className={`h-5 w-5 ${item.textColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-forest-dark">{item.type}</h4>
                    <span className="text-sm font-bold text-forest-dark">{item.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="ml-11">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-forest-medium rounded-full"></div>
                      <span className="text-forest-medium font-medium">Granted: {item.granted.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-forest-accent rounded-full"></div>
                      <span className="text-forest-medium font-medium">Pending: {item.pending.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-forest-medium font-medium">Rejected: {item.rejected.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-forest-dark">{item.percentage}%</span>
                </div>
                
                <div className="forest-progress">
                  <div
                    className="bg-forest-medium rounded-l-full h-2"
                    style={{ width: `${(item.granted / item.total) * 100}%` }}
                  ></div>
                  <div
                    className="bg-forest-accent h-2"
                    style={{ width: `${(item.pending / item.total) * 100}%` }}
                  ></div>
                  <div
                    className="bg-red-500 rounded-r-full h-2"
                    style={{ width: `${(item.rejected / item.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-forest-sage/20">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="p-4 bg-forest-sage/5 rounded-lg">
            <div className="text-2xl font-bold text-forest-medium">{totalGranted.toLocaleString()}</div>
            <div className="text-sm text-forest-medium font-medium">Total Granted</div>
          </div>
          <div className="p-4 bg-forest-earth/5 rounded-lg">
            <div className="text-2xl font-bold text-forest-accent">
              {fraData.reduce((sum, item) => sum + item.pending, 0).toLocaleString()}
            </div>
            <div className="text-sm text-forest-medium font-medium">Pending Review</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {fraData.reduce((sum, item) => sum + item.rejected, 0).toLocaleString()}
            </div>
            <div className="text-sm text-forest-medium font-medium">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Database, Satellite, Brain, CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';

const systems = [
  {
    id: 1,
    name: 'State Database Sync',
    type: 'Data Integration',
    status: 'active' as const,
    icon: Database,
    lastSync: '2 minutes ago',
    coverage: '4 states connected',
    uptime: '99.8%'
  },
  {
    id: 2,
    name: 'Document OCR Engine',
    type: 'AI Processing',
    status: 'active' as const,
    icon: Brain,
    lastSync: '1 minute ago',
    coverage: '12,847 documents processed',
    uptime: '99.2%'
  },
  {
    id: 3,
    name: 'Satellite Data Feed',
    type: 'Remote Sensing',
    status: 'active' as const,
    icon: Satellite,
    lastSync: '15 minutes ago',
    coverage: '3,247 villages mapped',
    uptime: '98.9%'
  },
  {
    id: 4,
    name: 'CSS Scheme Integration',
    type: 'Government APIs',
    status: 'maintenance' as const,
    icon: Shield,
    lastSync: '1 hour ago',
    coverage: '127 schemes active',
    uptime: '97.5%'
  }
];

const statusConfig = {
  active: {
    icon: CheckCircle,
    color: 'text-forest-medium',
    bgColor: 'bg-forest-sage/10',
    label: 'Operational'
  },
  maintenance: {
    icon: Clock,
    color: 'text-forest-accent',
    bgColor: 'bg-forest-earth/10',
    label: 'Maintenance'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Error'
  }
};

export const SystemStatus: React.FC = () => {
  const activeCount = systems.filter(s => s.status === 'active').length;
  const totalSystems = systems.length;
  
  return (
    <div className="forest-chart">
      <div className="forest-chart-header">
        <h3 className="forest-chart-title">System Status</h3>
        <div className="forest-badge-success">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span>{activeCount}/{totalSystems} systems operational</span>
        </div>
      </div>

      <div className="space-y-4">
        {systems.map((system) => {
          const SystemIcon = system.icon;
          const statusInfo = statusConfig[system.status];
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={system.id} className="forest-card border-forest-sage/20 hover:border-forest-medium/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-forest-sage/10 rounded-xl shadow-forest">
                    <SystemIcon className="h-5 w-5 text-forest-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-forest-dark">{system.name}</h4>
                    <p className="text-sm text-forest-medium">{system.type}</p>
                  </div>
                </div>
                
                <div className={`forest-badge ${statusInfo.bgColor} ${statusInfo.color} border-forest-sage/20`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  <span>{statusInfo.label}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-forest-sage/5 rounded-lg">
                  <span className="text-forest-medium font-medium">Last Update:</span>
                  <p className="font-semibold text-forest-dark mt-1">{system.lastSync}</p>
                </div>
                
                <div className="p-3 bg-forest-sage/5 rounded-lg">
                  <span className="text-forest-medium font-medium">Coverage:</span>
                  <p className="font-semibold text-forest-dark mt-1">{system.coverage}</p>
                </div>
                
                <div className="p-3 bg-forest-sage/5 rounded-lg">
                  <span className="text-forest-medium font-medium">Uptime:</span>
                  <p className="font-semibold text-forest-dark mt-1">{system.uptime}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-forest-sage/20">
        <div className="grid grid-cols-2 gap-6 text-center">
          <div className="p-4 bg-forest-sage/5 rounded-lg">
            <div className="text-2xl font-bold text-forest-medium">99.4%</div>
            <div className="text-sm text-forest-medium font-medium">Overall Uptime</div>
          </div>
          <div className="p-4 bg-forest-medium/5 rounded-lg">
            <div className="text-2xl font-bold text-forest-dark">24/7</div>
            <div className="text-sm text-forest-medium font-medium">Monitoring Active</div>
          </div>
        </div>
      </div>
    </div>
  );
};
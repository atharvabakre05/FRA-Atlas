import React from 'react';
import { Brain, Eye, Satellite, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const models = [
  {
    id: 1,
    name: 'Document OCR',
    type: 'OCR Processing',
    version: 'v2.3.1',
    accuracy: 94.8,
    status: 'active' as const,
    icon: Eye,
    lastTrained: '2 days ago',
    processed: '1,247 documents'
  },
  {
    id: 2,
    name: 'Land Use Classification',
    type: 'Land Classification',
    version: 'v3.2.1',
    accuracy: 94.7,
    status: 'active' as const,
    icon: Brain,
    lastTrained: '3 days ago',
    processed: '15,420 images'
  },
  {
    id: 3,
    name: 'Water Body Detection',
    type: 'Water Detection',
    version: 'v2.1.3',
    accuracy: 96.3,
    status: 'active' as const,
    icon: Satellite,
    lastTrained: '1 day ago',
    processed: '8,930 images'
  },
  {
    id: 4,
    name: 'Forest Analysis',
    type: 'Forest Analysis',
    version: 'v4.0.2',
    accuracy: 92.8,
    status: 'active' as const,
    icon: Brain,
    lastTrained: '2 days ago',
    processed: '12,350 images'
  },
  {
    id: 5,
    name: 'Infrastructure Mapping',
    type: 'Infrastructure Detection',
    version: 'v1.5.0',
    accuracy: 89.4,
    status: 'active' as const,
    icon: Satellite,
    lastTrained: '4 days ago',
    processed: '6,780 images'
  },
  {
    id: 6,
    name: 'Soil Analysis',
    type: 'Soil Classification',
    version: 'v2.0.1',
    accuracy: 87.6,
    status: 'training' as const,
    icon: Brain,
    lastTrained: '1 hour ago',
    processed: '4,560 samples'
  }
];

const statusConfig = {
  active: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Active'
  },
  training: {
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    label: 'Training'
  },
  deprecated: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Deprecated'
  }
};

export const AIModelStatus: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">AI Model Status</h3>
        <div className="flex items-center space-x-1 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>All systems operational</span>
        </div>
      </div>

      <div className="space-y-4">
        {models.map((model) => {
          const ModelIcon = model.icon;
          const statusInfo = statusConfig[model.status];
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={model.id} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <ModelIcon className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{model.name}</h4>
                    <p className="text-sm text-gray-500">{model.type} • {model.version}</p>
                  </div>
                </div>
                
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  <span>{statusInfo.label}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Accuracy:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-green-500 rounded-full h-1.5 transition-all duration-500"
                        style={{ width: `${model.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900">{model.accuracy}%</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500">Last Training:</span>
                  <p className="font-medium text-gray-900 mt-1">{model.lastTrained}</p>
                </div>
                
                <div className="col-span-2">
                  <span className="text-gray-500">Processed:</span>
                  <p className="font-medium text-gray-900 mt-1">{model.processed}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
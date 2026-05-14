import React from 'react';
import { FileText, CheckCircle, AlertTriangle, Upload } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'claim_granted',
    message: 'IFR claim granted for Ramesh Gond in Balaghat district',
    time: '5 minutes ago',
    icon: CheckCircle,
    iconColor: 'text-forest-medium',
    bgColor: 'bg-forest-sage/10'
  },
  {
    id: 2,
    type: 'asset_mapping',
    message: 'AI asset mapping completed for 47 villages in Dindori block',
    time: '12 minutes ago',
    icon: FileText,
    iconColor: 'text-forest-dark',
    bgColor: 'bg-forest-sky'
  },
  {
    id: 3,
    type: 'document_processed',
    message: 'Legacy FRA documents digitized for Mandla district',
    time: '1 hour ago',
    icon: Upload,
    iconColor: 'text-forest-accent',
    bgColor: 'bg-forest-earth/10'
  },
  {
    id: 4,
    type: 'scheme_matched',
    message: 'PM-KISAN eligibility verified for 234 CFR holders',
    time: '2 hours ago',
    icon: CheckCircle,
    iconColor: 'text-forest-medium',
    bgColor: 'bg-forest-sage/10'
  },
  {
    id: 5,
    type: 'verification_pending',
    message: 'CR verification pending for 89 claims in Tripura',
    time: '4 hours ago',
    icon: AlertTriangle,
    iconColor: 'text-forest-accent',
    bgColor: 'bg-forest-earth/10'
  }
];

export const RecentActivity: React.FC = () => {
  return (
    <div className="forest-chart">
      <div className="forest-chart-header">
        <h3 className="forest-chart-title">Recent FRA Activity</h3>
        <button className="forest-button-secondary text-sm">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          
          return (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-forest-sage/5 transition-colors duration-200">
              <div className={`p-2 rounded-xl ${activity.bgColor} flex-shrink-0 shadow-forest`}>
                <Icon className={`h-4 w-4 ${activity.iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-forest-dark leading-5 font-medium">{activity.message}</p>
                <p className="text-xs text-forest-medium mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-forest-sage/20">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 text-xs text-forest-medium">
            <div className="w-2 h-2 bg-forest-medium rounded-full animate-forest-pulse"></div>
            <span>Real-time updates from state databases</span>
          </div>
        </div>
      </div>
    </div>
  );
};
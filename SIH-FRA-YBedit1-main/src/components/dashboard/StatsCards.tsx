import React from 'react';
import { FileText, CheckCircle, Clock, Users, TreePine, Database, LucideIcon } from 'lucide-react';

type StatColor = 'blue' | 'green' | 'amber' | 'purple' | 'indigo' | 'emerald';
type ChangeType = 'positive' | 'negative' | 'neutral';

interface Stat {
  label: string;
  value: string;
  change: string;
  changeType: ChangeType;
  icon: LucideIcon;
  color: StatColor;
  subtitle: string;
}

const stats: Stat[] = [
  {
    label: 'Total FRA Claims',
    value: '4',
    change: '+2',
    changeType: 'positive' as const,
    icon: FileText,
    color: 'blue',
    subtitle: 'Poduchunapadar village'
  },
  {
    label: 'Claims Granted',
    value: '2',
    change: '+1',
    changeType: 'positive' as const,
    icon: CheckCircle,
    color: 'green',
    subtitle: '50% success rate'
  },
  {
    label: 'Pending Verification',
    value: '1',
    change: '0',
    changeType: 'neutral' as const,
    icon: Clock,
    color: 'amber',
    subtitle: 'Under review'
  },
  {
    label: 'Village Mapped',
    value: '1',
    change: '+1',
    changeType: 'positive' as const,
    icon: TreePine,
    color: 'purple',
    subtitle: 'Asset mapping complete'
  },
  {
    label: 'Beneficiaries',
    value: '12',
    change: '+3',
    changeType: 'positive' as const,
    icon: Users,
    color: 'indigo',
    subtitle: 'Tribal families covered'
  },
  {
    label: 'CSS Schemes Active',
    value: '3',
    change: '+1',
    changeType: 'positive' as const,
    icon: Database,
    color: 'emerald',
    subtitle: 'DAJGUA & others'
  }
];

const colorClasses: Record<StatColor, {
  bg: string;
  icon: string;
  accent: string;
  gradient: string;
}> = {
  blue: {
    bg: 'bg-forest-sky',
    icon: 'text-forest-dark',
    accent: 'bg-forest-dark',
    gradient: 'from-forest-sky to-forest-sage/20'
  },
  green: {
    bg: 'bg-forest-sage/10',
    icon: 'text-forest-medium',
    accent: 'bg-forest-medium',
    gradient: 'from-forest-sage/10 to-forest-medium/20'
  },
  amber: {
    bg: 'bg-forest-earth/10',
    icon: 'text-forest-accent',
    accent: 'bg-forest-accent',
    gradient: 'from-forest-earth/10 to-forest-accent/20'
  },
  purple: {
    bg: 'bg-forest-moss/10',
    icon: 'text-forest-moss',
    accent: 'bg-forest-moss',
    gradient: 'from-forest-moss/10 to-forest-medium/20'
  },
  indigo: {
    bg: 'bg-forest-leaf/10',
    icon: 'text-forest-leaf',
    accent: 'bg-forest-leaf',
    gradient: 'from-forest-leaf/10 to-forest-dark/20'
  },
  emerald: {
    bg: 'bg-forest-cream',
    icon: 'text-forest-dark',
    accent: 'bg-forest-dark',
    gradient: 'from-forest-cream to-forest-sage/20'
  },
};

export const StatsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];
        
        return (
          <div
            key={stat.label}
            className={`forest-stat-card bg-gradient-to-br ${colors.gradient} hover:shadow-forest-lg transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${colors.bg} shadow-forest`}>
                <Icon className={`h-6 w-6 ${colors.icon}`} />
              </div>
              <div className="text-right">
                <div className="forest-stat-value">{stat.value}</div>
                <div className={`forest-stat-change ${
                  stat.changeType === 'positive' ? 'forest-stat-change-positive' : 'forest-stat-change-negative'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
            <div>
              <h3 className="forest-stat-label">{stat.label}</h3>
              <p className="text-xs text-forest-medium mt-1">{stat.subtitle}</p>
              <div className="mt-3">
                <div className="forest-progress">
                  <div className="forest-progress-bar" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
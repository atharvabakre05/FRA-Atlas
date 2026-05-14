import React from 'react';
import { Map, Brain, BarChart3, FileText, TreePine, Droplets, Mountain, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  
  const navigationCards = [
    {
      id: 'interactive-map',
      title: t('dashboard.interactiveMap.title'),
      description: t('dashboard.interactiveMap.description'),
      icon: Map,
      color: 'forest-dark',
      gradient: 'from-forest-dark to-forest-medium',
      stats: t('dashboard.interactiveMap.stats', { count: 47832 }),
      features: [
        t('dashboard.interactiveMap.features.layers'),
        t('dashboard.interactiveMap.features.forestCover'),
        t('dashboard.interactiveMap.features.waterBodies'),
        t('dashboard.interactiveMap.features.farmland')
      ]
    },
    {
      id: 'asset-mapping',
      title: t('dashboard.assetMapping.title'),
      description: t('dashboard.assetMapping.description'),
      icon: Brain,
      color: 'forest-moss',
      gradient: 'from-forest-moss to-forest-medium',
      stats: t('dashboard.assetMapping.stats', { count: 3247 }),
      features: [
        t('dashboard.assetMapping.features.satellite'),
        t('dashboard.assetMapping.features.terrain'),
        t('dashboard.assetMapping.features.soil'),
        t('dashboard.assetMapping.features.ai')
      ]
    },
    {
      id: 'dss-recommendations',
      title: 'DSS Recommendations',
      description: 'Decision support system for FRA implementation and scheme eligibility',
      icon: BarChart3,
      color: 'forest-accent',
      gradient: 'from-forest-accent to-forest-earth',
      stats: '127 Schemes',
      features: ['Scheme Matching', 'Eligibility Analysis', 'Priority Ranking', 'Implementation Guide']
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      description: 'Comprehensive reports and analytics for FRA implementation monitoring',
      icon: FileText,
      color: 'forest-leaf',
      gradient: 'from-forest-leaf to-forest-dark',
      stats: '28,456 Granted',
      features: ['Progress Reports', 'State-wise Analytics', 'Performance Metrics', 'Export Data']
    }
  ];

  return (
    <div className="min-h-screen bg-forest-sky">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-sage/5 to-forest-medium/10"></div>
        <div className="relative px-6 py-16">
          <div className="max-w-7xl mx-auto text-center">
            {/* FRA Atlas Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="p-4 bg-forest-gradient rounded-2xl shadow-forest-xl mr-6">
                <TreePine className="h-12 w-12 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold text-forest-dark mb-2">FRA Atlas</h1>
                <p className="text-xl text-forest-medium">AI-Powered WebGIS Decision Support System</p>
              </div>
            </div>

            {/* Hero Description */}
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-lg text-forest-medium leading-relaxed">
                Empowering Forest Rights Act implementation through advanced geospatial analysis, 
                AI-driven insights, and comprehensive decision support tools for government officials 
                and tribal communities across India.
              </p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <div className="forest-stat-card text-center">
                <div className="flex items-center justify-center mb-3">
                  <Users className="h-8 w-8 text-forest-dark" />
                </div>
                <div className="forest-stat-value text-2xl">1,89,234</div>
                <div className="forest-stat-label">Beneficiaries</div>
              </div>
              <div className="forest-stat-card text-center">
                <div className="flex items-center justify-center mb-3">
                  <Mountain className="h-8 w-8 text-forest-dark" />
                </div>
                <div className="forest-stat-value text-2xl">3,247</div>
                <div className="forest-stat-label">Villages Mapped</div>
              </div>
              <div className="forest-stat-card text-center">
                <div className="flex items-center justify-center mb-3">
                  <Droplets className="h-8 w-8 text-forest-dark" />
                </div>
                <div className="forest-stat-value text-2xl">4</div>
                <div className="forest-stat-label">States Active</div>
              </div>
              <div className="forest-stat-card text-center">
                <div className="flex items-center justify-center mb-3">
                  <TreePine className="h-8 w-8 text-forest-dark" />
                </div>
                <div className="forest-stat-value text-2xl">59.5%</div>
                <div className="forest-stat-label">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Cards */}
      <div className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-forest-dark mb-4">Explore FRA Atlas</h2>
            <p className="text-forest-medium text-lg">Choose your area of focus to begin analysis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {navigationCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="group forest-card hover:shadow-forest-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                >
                  {/* Card Header */}
                  <div className={`p-6 bg-gradient-to-br ${card.gradient} rounded-xl mb-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-white/90 text-sm font-medium">Total</div>
                        <div className="text-white text-lg font-bold">{card.stats}</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                    <p className="text-white/90 text-sm leading-relaxed">{card.description}</p>
                  </div>

                  {/* Features List */}
                  <div className="px-6 pb-6">
                    <h4 className="text-sm font-semibold text-forest-dark mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {card.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-forest-medium">
                          <div className="w-1.5 h-1.5 bg-forest-medium rounded-full mr-3 flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-forest-gradient opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Access Footer */}
      <div className="bg-forest-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Ready to Get Started?</h3>
            <p className="text-forest-sage mb-6">
              Access real-time data, AI-powered insights, and comprehensive tools for FRA implementation
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2 text-forest-sage">
                <div className="w-2 h-2 bg-forest-medium rounded-full animate-forest-pulse"></div>
                <span className="text-sm">Live data from 4 states</span>
              </div>
              <div className="w-px h-4 bg-forest-sage/30"></div>
              <div className="flex items-center space-x-2 text-forest-sage">
                <div className="w-2 h-2 bg-forest-medium rounded-full animate-forest-pulse"></div>
                <span className="text-sm">AI-powered analysis</span>
              </div>
              <div className="w-px h-4 bg-forest-sage/30"></div>
              <div className="flex items-center space-x-2 text-forest-sage">
                <div className="w-2 h-2 bg-forest-medium rounded-full animate-forest-pulse"></div>
                <span className="text-sm">24/7 monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
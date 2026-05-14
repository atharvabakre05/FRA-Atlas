import React, { useState } from 'react';
import { Brain, Satellite, Mountain, Droplets, Loader2 } from 'lucide-react';

const mockPlotData = {
  plotId: 'PL-2847',
  coordinates: { lat: 15.3173, lng: 75.7139 },
  elevation: 545,
  soilType: 'Red Sandy Loam',
  waterProximity: 0.8,
  rockFormations: ['Granite', 'Quartzite'],
  vegetation: 'Mixed Deciduous Forest',
  slope: 12.5,
  drainage: 'Good',
  lastAnalyzed: '2024-01-15T10:30:00Z'
};

export const TerrainAnalysis: React.FC = () => {
  const [selectedPlot, setSelectedPlot] = useState('PL-2847');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="space-y-8">
      <div className="forest-card bg-gradient-to-r from-forest-sage/10 to-forest-medium/10 border-forest-medium/30">
        <h1 className="text-3xl font-bold text-forest-dark mb-2">AI Terrain Analysis</h1>
        <p className="text-forest-medium text-lg">Advanced satellite data analysis and machine learning terrain mapping</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Controls */}
        <div className="forest-chart">
          <h3 className="forest-chart-title mb-6">Analysis Controls</h3>
          
          <div className="space-y-4">
            <div>
              <label className="forest-form-label">Select Plot</label>
              <select 
                value={selectedPlot}
                onChange={(e) => setSelectedPlot(e.target.value)}
                className="forest-select"
              >
                <option value="PL-2847">PL-2847 - Karnataka</option>
                <option value="PL-2848">PL-2848 - Maharashtra</option>
                <option value="PL-2849">PL-2849 - Tamil Nadu</option>
              </select>
            </div>

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="w-full forest-button-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-forest-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  <span>Run AI Analysis</span>
                </>
              )}
            </button>

            <div className="border-t border-forest-sage/20 pt-4">
              <div className="flex items-center space-x-2 text-sm text-forest-medium mb-2">
                <div className="w-2 h-2 bg-forest-medium rounded-full animate-forest-pulse"></div>
                <span>Satellite Data: Active</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-forest-medium mb-2">
                <div className="w-2 h-2 bg-forest-medium rounded-full animate-forest-pulse"></div>
                <span>ML Models: Verified</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-forest-medium">
                <div className="w-2 h-2 bg-forest-medium rounded-full animate-forest-pulse"></div>
                <span>Weather Data: Updated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Satellite View */}
        <div className="forest-chart">
          <div className="forest-chart-header">
            <div className="flex items-center space-x-2">
              <Satellite className="h-5 w-5 text-forest-dark" />
              <h3 className="forest-chart-title">Satellite View</h3>
            </div>
          </div>
          
          <div className="forest-map relative bg-gradient-to-br from-forest-sage/20 to-forest-earth/20 h-64 mb-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-forest-sage/30 to-forest-earth/30"></div>
            <div className="forest-map-controls">
              Plot {selectedPlot}
            </div>
            <div className="absolute bottom-4 right-4 bg-forest-dark/80 text-white px-2 py-1 rounded text-xs">
              Resolution: 0.5m/pixel
            </div>
            
            {/* Mock terrain features */}
            <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-forest-medium rounded-full opacity-60"></div>
            <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-forest-sage rounded-full opacity-70"></div>
            <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-forest-earth rounded-sm opacity-80"></div>
          </div>
          
          <div className="text-sm text-forest-medium">
            <p>Last updated: 2 hours ago</p>
            <p>Cloud coverage: 5%</p>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="forest-chart">
          <h3 className="forest-chart-title mb-6">Analysis Results</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-forest-sky rounded-lg">
              <div className="flex items-center space-x-2">
                <Mountain className="h-5 w-5 text-forest-dark" />
                <span className="font-semibold text-forest-dark">Elevation</span>
              </div>
              <span className="text-forest-dark font-bold">{mockPlotData.elevation}m</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-forest-sage/10 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-forest-medium rounded"></div>
                <span className="font-semibold text-forest-dark">Soil Type</span>
              </div>
              <span className="text-forest-medium font-bold text-sm">{mockPlotData.soilType}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-forest-sky rounded-lg">
              <div className="flex items-center space-x-2">
                <Droplets className="h-5 w-5 text-forest-dark" />
                <span className="font-semibold text-forest-dark">Water Distance</span>
              </div>
              <span className="text-forest-dark font-bold">{mockPlotData.waterProximity} km</span>
            </div>

            <div className="p-4 bg-forest-sage/5 rounded-lg">
              <div className="font-semibold text-forest-dark mb-2">Rock Formations</div>
              <div className="flex flex-wrap gap-2">
                {mockPlotData.rockFormations.map((rock, index) => (
                  <span key={index} className="forest-badge-secondary text-xs">
                    {rock}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-forest-moss/10 rounded-lg">
              <div className="font-semibold text-forest-dark">Drainage Quality</div>
              <div className="text-forest-moss font-bold">{mockPlotData.drainage}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="forest-stat-card text-center">
          <div className="forest-stat-value text-forest-dark mb-2">{mockPlotData.slope}°</div>
          <div className="forest-stat-label">Slope Angle</div>
          <div className="text-xs text-forest-medium mt-1">Moderate gradient</div>
        </div>

        <div className="forest-stat-card text-center">
          <div className="forest-stat-value text-forest-medium mb-2">78%</div>
          <div className="forest-stat-label">Vegetation Cover</div>
          <div className="text-xs text-forest-medium mt-1">Dense forest</div>
        </div>

        <div className="forest-stat-card text-center">
          <div className="forest-stat-value text-forest-moss mb-2">94.2%</div>
          <div className="forest-stat-label">Analysis Accuracy</div>
          <div className="text-xs text-forest-medium mt-1">High confidence</div>
        </div>

        <div className="forest-stat-card text-center">
          <div className="forest-stat-value text-forest-accent mb-2">A+</div>
          <div className="forest-stat-label">Suitability Score</div>
          <div className="text-xs text-forest-medium mt-1">Excellent for agriculture</div>
        </div>
      </div>
    </div>
  );
};
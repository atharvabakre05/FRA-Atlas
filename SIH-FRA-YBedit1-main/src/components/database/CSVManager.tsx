import React, { useState } from 'react';
import { Upload, Download, Database, FileText, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { useCSVData } from '../../hooks/useCSVData';
import { csvDB } from '../../utils/csvDatabase';

export const CSVManager: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState('plots');
  const [showUpload, setShowUpload] = useState(false);
  
  const { 
    data, 
    loading, 
    error, 
    loadFromFile, 
    loadFromURL, 
    exportCSV, 
    getStats 
  } = useCSVData(selectedTable);

  const tables = [
    { name: 'plots', label: 'Land Plots', description: 'Plot information and metadata' },
    { name: 'documents', label: 'Documents', description: 'Uploaded documents and OCR results' },
    { name: 'schemes', label: 'Government Schemes', description: 'Available schemes and eligibility' },
    { name: 'terrain', label: 'Terrain Analysis', description: 'AI terrain mapping results' },
    { name: 'users', label: 'Users', description: 'User accounts and permissions' }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await loadFromFile(file);
      setShowUpload(false);
    }
  };

  const handleURLLoad = async (url: string) => {
    if (url.trim()) {
      await loadFromURL(url);
    }
  };

  const stats = getStats();
  const allTables = csvDB.getTableNames();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CSV Database Manager</h1>
          <p className="text-gray-600 mt-1">Import, export, and manage CSV data files</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={exportCSV}
            disabled={data.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Data Table</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tables.map((table) => (
            <button
              key={table.name}
              onClick={() => setSelectedTable(table.name)}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                selectedTable === table.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">{table.label}</span>
              </div>
              <p className="text-sm text-gray-600">{table.description}</p>
              {allTables.includes(table.name) && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Loaded</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Import CSV Data</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="text-center text-gray-500">or</div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Load from URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="https://example.com/data.csv"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleURLLoad((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                      handleURLLoad(input.value);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Load
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Total Records</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalRecords}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="h-5 w-5 text-green-600" />
            <span className="font-medium text-gray-900">Columns</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.columns.length}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-gray-900">Tables Loaded</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{allTables.length}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-2">
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
            ) : error ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            <span className="font-medium text-gray-900">Status</span>
          </div>
          <div className={`text-sm font-medium ${
            loading ? 'text-amber-600' : error ? 'text-red-600' : 'text-green-600'
          }`}>
            {loading ? 'Loading...' : error ? 'Error' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Data Preview */}
      {data.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Data Preview - {selectedTable} ({data.length} records)
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => csvDB.data.delete(selectedTable)}
                className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Table</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {stats.columns.slice(0, 8).map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(0, 10).map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {stats.columns.slice(0, 8).map((column) => (
                      <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {String(record[column] || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {data.length > 10 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing first 10 of {data.length} records
            </div>
          )}
        </div>
      )}

      {/* Sample CSV Templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample CSV Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'plots.csv',
              description: 'Land plot data with coordinates and metadata',
              headers: ['plot_id', 'state', 'district', 'village', 'area_hectares', 'zone_type', 'coordinates_lat', 'coordinates_lng']
            },
            {
              name: 'documents.csv',
              description: 'Document records with OCR results',
              headers: ['doc_id', 'plot_id', 'document_type', 'file_name', 'ocr_status', 'extracted_text']
            },
            {
              name: 'terrain.csv',
              description: 'AI terrain analysis results',
              headers: ['plot_id', 'elevation', 'soil_type', 'rock_formations', 'water_proximity', 'slope_angle']
            }
          ].map((template) => (
            <div key={template.name} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="text-xs text-gray-500 mb-3">
                Headers: {template.headers.join(', ')}
              </div>
              <button
                onClick={() => {
                  const csv = template.headers.join(',') + '\n';
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = template.name;
                  a.click();
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Download Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
import Papa from 'papaparse';

export interface CSVRecord {
  [key: string]: string | number | boolean;
}

export class CSVDatabase {
  private static instance: CSVDatabase;
  private data: Map<string, CSVRecord[]> = new Map();

  static getInstance(): CSVDatabase {
    if (!CSVDatabase.instance) {
      CSVDatabase.instance = new CSVDatabase();
    }
    return CSVDatabase.instance;
  }

  // Load CSV data from file
  async loadCSV(tableName: string, file: File): Promise<CSVRecord[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          // Auto-convert numeric strings to numbers
          if (!isNaN(Number(value)) && value !== '') {
            return Number(value);
          }
          // Convert boolean strings
          if (value.toLowerCase() === 'true') return true;
          if (value.toLowerCase() === 'false') return false;
          return value;
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(results.errors);
            return;
          }
          this.data.set(tableName, results.data as CSVRecord[]);
          resolve(results.data as CSVRecord[]);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  // Load CSV from URL or local path
  async loadCSVFromURL(tableName: string, url: string): Promise<CSVRecord[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          if (!isNaN(Number(value)) && value !== '') {
            return Number(value);
          }
          if (value.toLowerCase() === 'true') return true;
          if (value.toLowerCase() === 'false') return false;
          return value;
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(results.errors);
            return;
          }
          this.data.set(tableName, results.data as CSVRecord[]);
          resolve(results.data as CSVRecord[]);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  // Get all records from a table
  getTable(tableName: string): CSVRecord[] {
    return this.data.get(tableName) || [];
  }

  // Find records by criteria
  find(tableName: string, criteria: Partial<CSVRecord>): CSVRecord[] {
    const table = this.getTable(tableName);
    return table.filter(record => {
      return Object.entries(criteria).every(([key, value]) => {
        return record[key] === value;
      });
    });
  }

  // Find single record by ID
  findById(tableName: string, id: string | number): CSVRecord | undefined {
    const table = this.getTable(tableName);
    return table.find(record => record.id === id || record.plot_id === id);
  }

  // Insert new record
  insert(tableName: string, record: CSVRecord): CSVRecord {
    const table = this.getTable(tableName);
    const newRecord = {
      ...record,
      id: record.id || this.generateId(),
      created_at: new Date().toISOString()
    };
    table.push(newRecord);
    this.data.set(tableName, table);
    return newRecord;
  }

  // Update record by ID
  update(tableName: string, id: string | number, updates: Partial<CSVRecord>): CSVRecord | null {
    const table = this.getTable(tableName);
    const index = table.findIndex(record => record.id === id || record.plot_id === id);
    
    if (index === -1) return null;
    
    const updatedRecord = {
      ...table[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    table[index] = updatedRecord;
    this.data.set(tableName, table);
    return updatedRecord;
  }

  // Delete record by ID
  delete(tableName: string, id: string | number): boolean {
    const table = this.getTable(tableName);
    const index = table.findIndex(record => record.id === id || record.plot_id === id);
    
    if (index === -1) return false;
    
    table.splice(index, 1);
    this.data.set(tableName, table);
    return true;
  }

  // Export table to CSV
  exportToCSV(tableName: string): string {
    const table = this.getTable(tableName);
    return Papa.unparse(table);
  }

  // Download CSV file
  downloadCSV(tableName: string, filename?: string): void {
    const csv = this.exportToCSV(tableName);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename || `${tableName}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Get table statistics
  getStats(tableName: string): {
    totalRecords: number;
    columns: string[];
    lastUpdated: string;
  } {
    const table = this.getTable(tableName);
    const columns = table.length > 0 ? Object.keys(table[0]) : [];
    
    return {
      totalRecords: table.length,
      columns,
      lastUpdated: new Date().toISOString()
    };
  }

  // Generate unique ID
  private generateId(): string {
    return 'ID_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Clear all data
  clearAll(): void {
    this.data.clear();
  }

  // Get all table names
  getTableNames(): string[] {
    return Array.from(this.data.keys());
  }
}

export const csvDB = CSVDatabase.getInstance();
import { useState, useEffect, useCallback } from 'react';
import { csvDB, CSVRecord } from '../utils/csvDatabase';

export const useCSVData = (tableName: string) => {
  const [data, setData] = useState<CSVRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(() => {
    const tableData = csvDB.getTable(tableName);
    setData(tableData);
  }, [tableName]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const loadFromFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      await csvDB.loadCSV(tableName, file);
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CSV');
    } finally {
      setLoading(false);
    }
  }, [tableName, refreshData]);

  const loadFromURL = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      await csvDB.loadCSVFromURL(tableName, url);
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CSV from URL');
    } finally {
      setLoading(false);
    }
  }, [tableName, refreshData]);

  const insert = useCallback((record: Omit<CSVRecord, 'id' | 'created_at'>) => {
    const newRecord = csvDB.insert(tableName, record);
    refreshData();
    return newRecord;
  }, [tableName, refreshData]);

  const update = useCallback((id: string | number, updates: Partial<CSVRecord>) => {
    const updatedRecord = csvDB.update(tableName, id, updates);
    refreshData();
    return updatedRecord;
  }, [tableName, refreshData]);

  const remove = useCallback((id: string | number) => {
    const success = csvDB.delete(tableName, id);
    refreshData();
    return success;
  }, [tableName, refreshData]);

  const find = useCallback((criteria: Partial<CSVRecord>) => {
    return csvDB.find(tableName, criteria);
  }, [tableName]);

  const findById = useCallback((id: string | number) => {
    return csvDB.findById(tableName, id);
  }, [tableName]);

  const exportCSV = useCallback(() => {
    csvDB.downloadCSV(tableName);
  }, [tableName]);

  const getStats = useCallback(() => {
    return csvDB.getStats(tableName);
  }, [tableName]);

  return {
    data,
    loading,
    error,
    loadFromFile,
    loadFromURL,
    insert,
    update,
    remove,
    find,
    findById,
    exportCSV,
    getStats,
    refreshData
  };
};
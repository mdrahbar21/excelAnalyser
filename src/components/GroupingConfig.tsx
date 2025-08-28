'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, BarChart3 } from 'lucide-react';
import { GroupingConfig } from '@/lib/excel-utils';

interface GroupingConfigProps {
  availableColumns: string[];
  onConfigChange: (config: GroupingConfig) => void;
}

export function GroupingConfigComponent({ availableColumns, onConfigChange }: GroupingConfigProps) {
  const [config, setConfig] = useState<GroupingConfig>({
    groupBy: [],
    aggregations: []
  });

  useEffect(() => {
    onConfigChange(config);
  }, [config, onConfigChange]);

  const addGroupByColumn = (column: string) => {
    if (!config.groupBy.includes(column)) {
      setConfig(prev => ({
        ...prev,
        groupBy: [...prev.groupBy, column]
      }));
    }
  };

  const removeGroupByColumn = (column: string) => {
    setConfig(prev => ({
      ...prev,
      groupBy: prev.groupBy.filter(col => col !== column)
    }));
  };

  const addAggregation = () => {
    setConfig(prev => ({
      ...prev,
      aggregations: [...prev.aggregations, { column: '', operation: 'sum' }]
    }));
  };

  const removeAggregation = (index: number) => {
    setConfig(prev => ({
      ...prev,
      aggregations: prev.aggregations.filter((_, i) => i !== index)
    }));
  };

  const updateAggregation = (index: number, field: 'column' | 'operation', value: string) => {
    setConfig(prev => ({
      ...prev,
      aggregations: prev.aggregations.map((agg, i) => 
        i === index ? { ...agg, [field]: value } : agg
      )
    }));
  };

  const getUnusedColumns = () => {
    const usedColumns = new Set([
      ...config.groupBy,
      ...config.aggregations.map(agg => agg.column).filter(Boolean)
    ]);
    return availableColumns.filter(col => !usedColumns.has(col));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Grouping Configuration
        </h3>
      </div>

      {/* Group By Columns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
            Group By Columns
          </h4>
        </div>
        
        {config.groupBy.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {config.groupBy.map(column => (
              <div
                key={column}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full"
              >
                <span className="text-sm">{column}</span>
                <button
                  onClick={() => removeGroupByColumn(column)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No grouping columns selected. Select columns from the available list below.
          </p>
        )}

        {/* Available Columns for Grouping */}
        {availableColumns.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Columns for Grouping
            </h5>
            <div className="flex flex-wrap gap-2">
              {getUnusedColumns().map(column => (
                <button
                  key={column}
                  onClick={() => addGroupByColumn(column)}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {column}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Aggregations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
            Aggregations
          </h4>
          <button
            onClick={addAggregation}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Aggregation</span>
          </button>
        </div>

        {config.aggregations.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No aggregations defined. Click "Add Aggregation" to start.
          </p>
        ) : (
          <div className="space-y-3">
            {config.aggregations.map((agg, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Column
                  </label>
                  <select
                    value={agg.column}
                    onChange={(e) => updateAggregation(index, 'column', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select a column</option>
                    {availableColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Operation
                  </label>
                  <select
                    value={agg.operation}
                    onChange={(e) => updateAggregation(index, 'operation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="sum">Sum</option>
                    <option value="average">Average</option>
                    <option value="count">Count</option>
                    <option value="min">Minimum</option>
                    <option value="max">Maximum</option>
                  </select>
                </div>

                <button
                  onClick={() => removeAggregation(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {config.groupBy.length > 0 || config.aggregations.length > 0 ? (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Configuration Summary
          </h4>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            {config.groupBy.length > 0 && (
              <p>Group by: {config.groupBy.join(', ')}</p>
            )}
            {config.aggregations.length > 0 && (
              <p>Aggregations: {config.aggregations.map(agg => 
                `${agg.column} (${agg.operation})`
              ).join(', ')}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

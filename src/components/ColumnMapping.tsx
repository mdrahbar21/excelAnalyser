'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { ColumnMapping, ExcelData } from '@/lib/excel-utils';

interface ColumnMappingProps {
  data: ExcelData[];
  onMappingChange: (mapping: ColumnMapping[]) => void;
  onValidationChange: (isValid: boolean) => void;
}

export function ColumnMappingComponent({ data, onMappingChange, onValidationChange }: ColumnMappingProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      try {
        // Get all unique headers from all sheets and convert to strings
        const allHeaders = new Set<string>();
        data.forEach(sheet => {
          if (sheet && sheet.headers && Array.isArray(sheet.headers)) {
            sheet.headers.forEach(header => {
              // Convert any non-string headers to strings, handling Date objects
              let headerString: string;
              if ((header as any) instanceof Date) {
                headerString = (header as any).toISOString();
              } else if (typeof header === 'string') {
                headerString = header;
              } else {
                headerString = String(header || '');
              }
              allHeaders.add(headerString);
            });
          }
        });
        const headersArray = Array.from(allHeaders).sort();
        setAvailableColumns(headersArray);
      } catch (error) {
        console.error('Error processing column headers:', error);
        setAvailableColumns([]);
      }
    } else {
      setAvailableColumns([]);
    }
  }, [data]);

  useEffect(() => {
    onMappingChange(mappings);
    
    // Validate mappings
    const isValid = mappings.length > 0 && mappings.every(mapping => 
      mapping.sourceColumn && mapping.targetColumn
    );
    onValidationChange(isValid);
  }, [mappings, onMappingChange, onValidationChange]);

  const addMapping = () => {
    setMappings(prev => [...prev, { sourceColumn: '', targetColumn: '', required: false }]);
  };

  const removeMapping = (index: number) => {
    setMappings(prev => prev.filter((_, i) => i !== index));
  };

  const updateMapping = (index: number, field: keyof ColumnMapping, value: string | boolean) => {
    setMappings(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, [field]: value } : mapping
    ));
  };

  const getUnusedColumns = () => {
    const usedColumns = new Set(mappings.map(m => m.sourceColumn).filter(Boolean));
    return availableColumns.filter(col => !usedColumns.has(col));
  };

  const formatColumnName = (col: string) => {
    // Handle date-like strings and other special cases
    if (col && typeof col === 'string') {
      if (col.includes('GMT') || col.includes('Date')) {
        try {
          const date = new Date(col);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
        } catch {
          // If parsing fails, return the original string
        }
      }
      return col;
    }
    // If col is not a string or is null/undefined, convert to string
    return String(col || '');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Column Mapping
        </h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Found {availableColumns.length} columns
          </span>
          <button
            onClick={addMapping}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Mapping</span>
          </button>
        </div>
      </div>

      {mappings.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No column mappings defined. Click "Add Mapping" to start.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mappings.map((mapping, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Source Column
                </label>
                <select
                  value={mapping.sourceColumn}
                  onChange={(e) => updateMapping(index, 'sourceColumn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a column</option>
                  {availableColumns.map(col => (
                    <option key={col} value={col}>{formatColumnName(col)}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Column
                </label>
                <input
                  type="text"
                  value={mapping.targetColumn}
                  onChange={(e) => updateMapping(index, 'targetColumn', e.target.value)}
                  placeholder="Enter target column name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`required-${index}`}
                  checked={mapping.required}
                  onChange={(e) => updateMapping(index, 'required', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor={`required-${index}`} className="text-sm text-gray-700 dark:text-gray-300">
                  Required
                </label>
              </div>

              <button
                onClick={() => removeMapping(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {availableColumns.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Available Columns ({availableColumns.length})
            </h4>
            {availableColumns.length > 20 && (
              <span className="text-xs text-blue-700 dark:text-blue-300">
                Scroll to see all columns
              </span>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableColumns.map(col => (
                <span
                  key={col}
                  className={`px-2 py-1 text-xs rounded-full truncate ${
                    getUnusedColumns().includes(col)
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                  title={col}
                >
                  {formatColumnName(col)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

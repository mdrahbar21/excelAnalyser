'use client';

import { useState, useEffect } from 'react';
import { FileText, CheckSquare, Square } from 'lucide-react';
import { ExcelData } from '@/lib/excel-utils';

interface SheetSelectorProps {
  data: ExcelData[];
  onSheetsSelected: (selectedData: ExcelData[]) => void;
}

export function SheetSelector({ data, onSheetsSelected }: SheetSelectorProps) {
  const [selectedSheets, setSelectedSheets] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Group sheets by file
  const sheetsByFile = data.reduce((acc, sheet) => {
    if (!acc[sheet.fileName]) {
      acc[sheet.fileName] = [];
    }
    acc[sheet.fileName].push(sheet);
    return acc;
  }, {} as Record<string, ExcelData[]>);

  console.log('SheetSelector: Received data:', data);
  console.log('SheetSelector: Data length:', data.length);

  useEffect(() => {
    // Initially select all sheets
    const allSheetKeys = data.map(sheet => `${sheet.fileName}:${sheet.sheetName}`);
    setSelectedSheets(new Set(allSheetKeys));
    setSelectAll(true);
  }, [data]);

  useEffect(() => {
    // Update selected data when selection changes
    const selectedData = data.filter(sheet =>
      selectedSheets.has(`${sheet.fileName}:${sheet.sheetName}`)
    );
    console.log('SheetSelector: Calling onSheetsSelected with:', selectedData);
    console.log('SheetSelector: Selected data count:', selectedData.length);
    if (selectedData.length > 0) {
      console.log('SheetSelector: First selected sheet headers:', selectedData[0]?.headers);
    }
    onSheetsSelected(selectedData);
  }, [selectedSheets, data, onSheetsSelected]);

  const toggleSheet = (fileName: string, sheetName: string) => {
    const key = `${fileName}:${sheetName}`;
    const newSelected = new Set(selectedSheets);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }

    setSelectedSheets(newSelected);
    setSelectAll(newSelected.size === data.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedSheets(new Set());
      setSelectAll(false);
    } else {
      const allKeys = data.map(sheet => `${sheet.fileName}:${sheet.sheetName}`);
      setSelectedSheets(new Set(allKeys));
      setSelectAll(true);
    }
  };

  const getSelectedCount = () => {
    return selectedSheets.size;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Select Sheets to Process
        </h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getSelectedCount()} of {data.length} sheets selected
          </span>
          <button
            onClick={toggleSelectAll}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {selectAll ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            <span>{selectAll ? 'Deselect All' : 'Select All'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(sheetsByFile).map(([fileName, sheets]) => (
          <div key={fileName} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {fileName}
              </h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({sheets.length} sheet{sheets.length !== 1 ? 's' : ''})
              </span>
            </div>

            <div className="space-y-2">
              {sheets.map(sheet => {
                const key = `${sheet.fileName}:${sheet.sheetName}`;
                const isSelected = selectedSheets.has(key);

                return (
                  <div
                    key={key}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => toggleSheet(sheet.fileName, sheet.sheetName)}
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {sheet.sheetName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {sheet.data.length} rows, {sheet.headers.length} columns
                      </span>
                      {sheet.headers.length > 12 && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 ml-2">
                          (Large sheet with {sheet.headers.length} columns)
                        </span>
                      )}
                      {sheet.sheetName.toLowerCase().includes('agent wise') && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                          (Headers from row 2)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {getSelectedCount() === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No sheets selected. Please select at least one sheet to continue.</p>
        </div>
      )}
    </div>
  );
}

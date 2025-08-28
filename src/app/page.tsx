'use client';

import React, { useState, useCallback } from 'react';
import { FileText, Settings, BarChart3, Download, Layers } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { SheetSelector } from '@/components/SheetSelector';
import { ColumnMappingComponent } from '@/components/ColumnMapping';
import { GroupingConfigComponent } from '@/components/GroupingConfig';
import { DataPreview } from '@/components/DataPreview';
import { ToastContainer, ToastProps } from '@/components/Toast';
import { ExcelData, ColumnMapping, GroupingConfig, extractColumns, groupData } from '@/lib/excel-utils';

export default function Home() {
  const [excelData, setExcelData] = useState<ExcelData[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<ExcelData[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [groupingConfig, setGroupingConfig] = useState<GroupingConfig>({ groupBy: [], aggregations: [] });
  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [groupedData, setGroupedData] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'sheets' | 'mapping' | 'grouping' | 'results'>('upload');
  const [isMappingValid, setIsMappingValid] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);



  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const handleFilesProcessed = useCallback((data: ExcelData[]) => {
    setExcelData(data);
    addToast({
      type: 'success',
      title: 'Files processed successfully',
      message: `Processed ${data.length} sheets from uploaded files`
    });
    setCurrentStep('sheets');
  }, [addToast]);

  const handleSheetsSelected = useCallback((selectedData: ExcelData[]) => {
    setSelectedSheets(selectedData);
    if (selectedData.length > 0) {
      addToast({
        type: 'info',
        title: 'Sheets selected',
        message: `Selected ${selectedData.length} sheet(s) for processing`
      });
    }
  }, [addToast]);

  const handleError = useCallback((error: string) => {
    addToast({
      type: 'error',
      title: 'Error',
      message: error
    });
  }, [addToast]);

  const handleMappingChange = useCallback((mapping: ColumnMapping[]) => {
    setColumnMapping(mapping);
  }, []);

  const handleMappingValidation = useCallback((isValid: boolean) => {
    setIsMappingValid(isValid);
  }, []);

  const handleGroupingConfigChange = useCallback((config: GroupingConfig) => {
    setGroupingConfig(config);
  }, []);

  const processData = useCallback(() => {
    try {
      // Extract columns based on mapping
      const extracted = extractColumns(selectedSheets, columnMapping);
      setExtractedData(extracted);

      // Group data if grouping is configured
      let grouped: any[] = [];
      if (groupingConfig.groupBy.length > 0 || groupingConfig.aggregations.length > 0) {
        grouped = groupData(extracted, groupingConfig);
        setGroupedData(grouped);
      }

      setCurrentStep('results');
      addToast({
        type: 'success',
        title: 'Data processed successfully',
        message: `Extracted ${extracted.length} rows${grouped.length > 0 ? `, grouped into ${grouped.length} groups` : ''}`
      });
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }, [selectedSheets, columnMapping, groupingConfig, addToast, handleError]);

  const getAvailableColumns = () => {
    if (!selectedSheets || selectedSheets.length === 0) return [];
    const allHeaders = new Set<string>();
    selectedSheets.forEach(sheet => {
      if (sheet && sheet.headers && Array.isArray(sheet.headers)) {
        sheet.headers.forEach(header => {
          const headerString = typeof header === 'string' ? header : String(header || '');
          allHeaders.add(headerString);
        });
      }
    });
    return Array.from(allHeaders).sort();
  };

  const resetData = useCallback(() => {
    setExcelData([]);
    setSelectedSheets([]);
    setColumnMapping([]);
    setGroupingConfig({ groupBy: [], aggregations: [] });
    setExtractedData([]);
    setGroupedData([]);
    setCurrentStep('upload');
    setIsMappingValid(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Excel Data Analyzer
              </h1>
            </div>
            
            {currentStep !== 'upload' && (
              <button
                onClick={resetData}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-4">
            {[
              { key: 'upload', label: 'Upload Files', icon: FileText },
              { key: 'sheets', label: 'Select Sheets', icon: Layers },
              { key: 'mapping', label: 'Column Mapping', icon: Settings },
              { key: 'grouping', label: 'Grouping', icon: BarChart3 },
              { key: 'results', label: 'Results', icon: Download }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = ['upload', 'sheets', 'mapping', 'grouping', 'results'].indexOf(currentStep) > index;
              
              return (
                <div key={step.key} className="flex items-center space-x-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isActive 
                      ? 'bg-blue-500 text-white' 
                      : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : isCompleted 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'upload' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Upload Excel Files
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Upload multiple Excel files with the same format. The application will help you extract specific columns 
                and group the data based on your requirements.
              </p>
            </div>
            <FileUpload onFilesProcessed={handleFilesProcessed} onError={handleError} />
          </div>
        )}

        {currentStep === 'sheets' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Select Sheets to Process
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose which sheets from your uploaded files you want to process. You can select multiple sheets or just specific ones.
              </p>
            </div>
            
            <SheetSelector
              data={excelData}
              onSheetsSelected={handleSheetsSelected}
            />
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setCurrentStep('upload')}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('mapping')}
                disabled={selectedSheets.length === 0}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === 'mapping' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Configure Column Mapping
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Map the columns from your selected sheets to the desired output format.
              </p>
            </div>
            
            <ColumnMappingComponent
              data={selectedSheets || []}
              onMappingChange={handleMappingChange}
              onValidationChange={handleMappingValidation}
            />
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setCurrentStep('sheets')}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('grouping')}
                disabled={!isMappingValid}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === 'grouping' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Configure Grouping & Aggregation
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Optionally configure how to group and aggregate your data.
              </p>
        </div>
            
            <GroupingConfigComponent
              availableColumns={getAvailableColumns() || []}
              onConfigChange={handleGroupingConfigChange}
            />
            
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('mapping')}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={processData}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Process Data
              </button>
            </div>
          </div>
        )}

        {currentStep === 'results' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Analysis Results
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Review and export your processed data.
              </p>
            </div>
            
            <div className="space-y-8">
              <DataPreview
                data={extractedData}
                title="Extracted Data"
                showExport={true}
              />
              
              {groupedData.length > 0 && (
                <DataPreview
                  data={groupedData}
                  title="Grouped Data"
                  showExport={true}
                />
              )}
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => setCurrentStep('grouping')}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Modify Configuration
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

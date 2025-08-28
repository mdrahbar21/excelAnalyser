'use client';

import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExcelData, readExcelFile } from '@/lib/excel-utils';

interface FileUploadProps {
  onFilesProcessed: (data: ExcelData[]) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onFilesProcessed, onError }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    const excelFiles = Array.from(files).filter(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.ms-excel.sheet.binary.macroEnabled.12' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.xlsb')
    );

    if (excelFiles.length === 0) {
      onError('No valid Excel files found. Please upload .xlsx, .xls, or .xlsb files.');
      setIsProcessing(false);
      return;
    }

    try {
      const allData: ExcelData[] = [];
      
      for (const file of excelFiles) {
        const fileData = await readExcelFile(file);
        allData.push(...fileData);
      }

      setUploadedFiles(excelFiles);
      onFilesProcessed(allData);
    } catch (error) {
      onError(`Error processing files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [onFilesProcessed, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
            : "border-gray-300 dark:border-gray-600",
          isProcessing && "opacity-50 pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept=".xlsx,.xls,.xlsb"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={isProcessing}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-4">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {isProcessing ? 'Processing files...' : 'Upload Excel Files'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drag and drop Excel files here, or click to select files
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Supports .xlsx, .xls, and .xlsb files
              </p>
            </div>
          </div>
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

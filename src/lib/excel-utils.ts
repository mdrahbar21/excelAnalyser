import * as XLSX from 'xlsx';

export interface ExcelData {
  fileName: string;
  sheetName: string;
  data: any[];
  headers: string[];
}

export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  required: boolean;
}

export interface GroupingConfig {
  groupBy: string[];
  aggregations: {
    column: string;
    operation: 'sum' | 'average' | 'count' | 'min' | 'max';
  }[];
}

export function readExcelFile(file: File): Promise<ExcelData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        // Handle different Excel file types including .xlsb
        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: true,
          cellNF: false,
          cellText: false
        });

        const excelData: ExcelData[] = [];

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          // Use better options to read all columns including empty ones
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            blankrows: false
          });

          if (jsonData.length >= 2) { // Need at least 2 rows (header row + data)
            // Check if this sheet has column names in row 2 (index 1)
            // For "Agent Wise" sheet, skip first row and use second row as headers
            const actualHeadersRow = sheetName.toLowerCase().includes('agent wise') ? 1 : 0;
            const dataStartRow = sheetName.toLowerCase().includes('agent wise') ? 2 : 1;

            console.log(`Processing sheet "${sheetName}": using row ${actualHeadersRow + 1} as headers, data starts from row ${dataStartRow + 1}`);

            // Find the maximum number of columns by checking all rows
            const maxColumns = Math.max(...jsonData.map((row: any) => Array.isArray(row) ? row.length : 0));

            // Create headers array with proper column names from the correct row
            const headers: string[] = [];
            const headerRow = jsonData[actualHeadersRow] as any[];
            for (let i = 0; i < maxColumns; i++) {
              const headerValue = headerRow ? headerRow[i] : undefined;
              if (headerValue !== undefined && headerValue !== null && headerValue !== '') {
                headers[i] = typeof headerValue === 'string' ? headerValue : String(headerValue);
              } else {
                headers[i] = `Column ${i + 1}`;
              }
            }

            // Process data rows starting from the correct row
            const dataRows = jsonData.slice(dataStartRow).map((row: any) => {
              const obj: any = {};
              headers.forEach((header, index) => {
                // Handle Date objects and other special types
                let value = row ? row[index] : undefined;
                if (value instanceof Date) {
                  value = value.toISOString();
                } else if (value !== null && value !== undefined && value !== '') {
                  value = String(value);
                } else {
                  value = null;
                }
                obj[header] = value;
              });
              return obj;
            });

            console.log(`Sheet "${sheetName}": Found ${headers.length} columns:`, headers.slice(0, 10), headers.length > 10 ? `...and ${headers.length - 10} more` : '');

            excelData.push({
              fileName: file.name,
              sheetName,
              headers,
              data: dataRows
            });
          } else {
            console.warn(`Sheet "${sheetName}" has insufficient data (${jsonData.length} rows)`);
          }
        });

        resolve(excelData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function extractColumns(data: ExcelData[], columnMapping: ColumnMapping[]): any[] {
  const extractedData: any[] = [];
  
  data.forEach(sheetData => {
    sheetData.data.forEach(row => {
      const extractedRow: any = {};
      
      columnMapping.forEach(mapping => {
        const value = row[mapping.sourceColumn];
        
        if (mapping.required && (value === undefined || value === null || value === '')) {
          throw new Error(`Required column '${mapping.sourceColumn}' is missing or empty in ${sheetData.fileName}`);
        }
        
        extractedRow[mapping.targetColumn] = value;
      });
      
      extractedData.push(extractedRow);
    });
  });
  
  return extractedData;
}

export function groupData(data: any[], config: GroupingConfig): any[] {
  const groups = new Map<string, any[]>();
  
  data.forEach(row => {
    const groupKey = config.groupBy.map(col => row[col]).join('|');
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    
    groups.get(groupKey)!.push(row);
  });
  
  return Array.from(groups.entries()).map(([groupKey, groupData]) => {
    const groupValues = groupKey.split('|');
    const result: any = {};
    
    // Add grouping columns
    config.groupBy.forEach((col, index) => {
      result[col] = groupValues[index];
    });
    
    // Add aggregations
    config.aggregations.forEach(agg => {
      const values = groupData.map(row => row[agg.column]).filter(val => val !== null && val !== undefined);
      
      switch (agg.operation) {
        case 'sum':
          result[`${agg.column}_sum`] = values.reduce((sum, val) => sum + (Number(val) || 0), 0);
          break;
        case 'average':
          result[`${agg.column}_avg`] = values.length > 0 ? values.reduce((sum, val) => sum + (Number(val) || 0), 0) / values.length : 0;
          break;
        case 'count':
          result[`${agg.column}_count`] = values.length;
          break;
        case 'min':
          result[`${agg.column}_min`] = values.length > 0 ? Math.min(...values.map(val => Number(val) || 0)) : 0;
          break;
        case 'max':
          result[`${agg.column}_max`] = values.length > 0 ? Math.max(...values.map(val => Number(val) || 0)) : 0;
          break;
      }
    });
    
    return result;
  });
}

export function exportToExcel(data: any[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function validateExcelFormat(data: ExcelData[], expectedColumns: string[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  data.forEach(sheetData => {
    const missingColumns = expectedColumns.filter(col => !sheetData.headers.includes(col));
    
    if (missingColumns.length > 0) {
      errors.push(`File ${sheetData.fileName}, Sheet ${sheetData.sheetName}: Missing columns: ${missingColumns.join(', ')}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

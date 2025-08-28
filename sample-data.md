# Sample Excel Data Format

This document provides examples of the expected Excel file format for the Excel Data Analyzer.

## Expected Format

Your Excel files should have consistent column headers across all sheets and files. Here's an example structure:

| Product | Category | Region | Sales | Quantity | Date |
|---------|----------|--------|-------|----------|------|
| Laptop  | Electronics | North | 1200 | 5 | 2024-01-15 |
| Mouse   | Electronics | South | 50   | 10 | 2024-01-16 |
| Desk    | Furniture  | East  | 300  | 2 | 2024-01-17 |

## Column Mapping Example

When configuring column mapping, you might map:
- Source: "Product" → Target: "Item"
- Source: "Sales" → Target: "Revenue" (Required)
- Source: "Region" → Target: "Territory"

## Grouping Example

You could group by:
- "Category" and "Region"
- With aggregations:
  - Sum of "Sales"
  - Average of "Quantity"
  - Count of records

## Creating Sample Files

You can create sample Excel files with the following data:

### File 1: sales_january.xlsx
- Sheet: "Sales"
- Columns: Product, Category, Region, Sales, Quantity, Date

### File 2: sales_february.xlsx  
- Sheet: "Sales"
- Same columns as above

## Tips

1. **Consistent Headers**: Ensure all files have the same column names
2. **Data Types**:
   - Text columns: Product, Category, Region
   - Numeric columns: Sales, Quantity
   - Date columns: Date
3. **Header Row Position**: The application automatically detects headers in different positions:
   - **Standard sheets**: Headers in row 1 (first row)
   - **Agent Wise sheets**: Headers in row 2 (skips titles in row 1)
4. **No Empty Required Fields**: If a column is marked as required, ensure all rows have values
5. **File Size**: The application can handle multiple files, but very large files (>10MB) may take longer to process

## Supported File Formats

- .xlsx (Excel 2007+)
- .xls (Excel 97-2003)
- .xlsb (Excel Binary Workbook)

## Example Use Cases

1. **Sales Analysis**: Group sales by region and product category
2. **Inventory Management**: Track quantities across multiple warehouses
3. **Financial Reports**: Aggregate financial data by department and period
4. **Survey Data**: Analyze responses grouped by demographics

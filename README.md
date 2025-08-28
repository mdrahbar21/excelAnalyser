# Excel Data Analyzer

A modern web application for reading, writing, and analyzing data from Excel sheets. Built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chhapri
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.


## Features

- **Multi-file Upload**: Upload multiple Excel files (.xlsx, .xls, .xlsb) with drag-and-drop support
- **Sheet Selection**: Choose specific sheets from your Excel files for processing
- **Intelligent Header Detection**: Automatically detects headers in different row positions (e.g., "Agent Wise" sheets with headers in row 2)
- **Column Mapping**: Map source columns to target columns with validation
- **Data Grouping**: Group data by specific columns and apply aggregations
- **Data Preview**: Interactive table view with pagination and export functionality
- **Export Results**: Export processed data back to Excel format
- **Modern UI**: Responsive design with dark mode support
- **Real-time Validation**: Validate data format and required fields


## Usage

### Step 1: Upload Excel Files
- Drag and drop Excel files or click to select them
- Supports multiple files with the same format
- Files are processed automatically

### Step 2: Select Sheets
- Choose which sheets from your uploaded files to process
- Select multiple sheets or just specific ones (e.g., only 'Agent Wise' sheet)
- View sheet information including row and column counts
- **Smart Header Detection**: Sheets like "Agent Wise" automatically use row 2 as headers

### Step 3: Configure Column Mapping
- Map source columns from your Excel files to desired output columns
- Mark columns as required for validation
- Preview available columns from all uploaded files

### Step 4: Configure Grouping (Optional)
- Select columns to group by
- Add aggregations (sum, average, count, min, max)
- Configure multiple aggregation operations

### Step 5: Review Results
- View extracted data in a paginated table
- View grouped data if grouping was configured
- Export results to Excel format

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main application page
├── components/
│   ├── FileUpload.tsx       # File upload component
│   ├── ColumnMapping.tsx    # Column mapping interface
│   ├── GroupingConfig.tsx   # Grouping configuration
│   ├── DataPreview.tsx      # Data preview table
│   └── Toast.tsx            # Toast notifications
└── lib/
    ├── excel-utils.ts       # Excel processing utilities
    └── utils.ts             # General utilities
```

## Key Components

### Excel Utilities (`lib/excel-utils.ts`)
- `readExcelFile()`: Read and parse Excel files
- `extractColumns()`: Extract specific columns based on mapping
- `groupData()`: Group and aggregate data
- `exportToExcel()`: Export data to Excel format
- `validateExcelFormat()`: Validate file format and required columns

### File Upload Component
- Drag and drop interface
- Multiple file support
- File type validation
- Progress indicators

### Column Mapping Component
- Dynamic column selection
- Required field validation
- Visual feedback for used/unused columns

### Grouping Configuration
- Flexible grouping by multiple columns
- Multiple aggregation types
- Real-time configuration preview

### Data Preview
- Paginated table view
- Column visibility controls
- Export functionality
- Responsive design

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **XLSX**: Excel file processing library
- **Lucide React**: Icon library
- **React Hooks**: State management

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Adding New Features

1. **New Excel Operations**: Add functions to `lib/excel-utils.ts`
2. **New Components**: Create in `src/components/`
3. **New Pages**: Add to `src/app/` following Next.js App Router conventions

### Styling

The project uses Tailwind CSS with custom utilities. Global styles are in `src/app/globals.css`.

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
1. Build the project: `npm run build`
2. Deploy the `.next` folder to your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## Roadmap

- [ ] Data visualization charts
- [ ] Advanced filtering options
- [ ] Template-based processing
- [ ] Batch processing for large files
- [ ] API endpoints for server-side processing
- [ ] User authentication and saved configurations

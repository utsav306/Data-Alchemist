# Data Alchemist 🧪

A powerful data management and validation application built with Next.js, React, and AI integration. Data Alchemist transforms raw data into structured, validated, and actionable insights through an intuitive interface and intelligent automation.

## 🌟 Features

### 📊 **Data Management**

- **Multi-format Support**: Upload Excel (.xlsx) and CSV files with automatic parsing
- **Multi-sheet Processing**: Handle complex workbooks with multiple data sheets
- **Real-time Validation**: Instant data validation with detailed error reporting
- **Inline Editing**: Edit data directly in interactive tables with live validation

### 🤖 **AI-Powered Features**

- **Natural Language Queries**: Query your data using plain English
- **AI Error Correction**: Automatically detect and suggest fixes for data issues
- **Smart Rule Generation**: AI suggests business rules based on your data patterns
- **Intelligent Data Modification**: Modify data using natural language commands

### 🔧 **Business Rules Engine**

- **Visual Rule Builder**: Create complex validation rules through an intuitive interface
- **Natural Language Rules**: Define rules using simple English descriptions
- **Rule Export/Import**: Save and share business rules as JSON files
- **AI Rule Suggestions**: Get intelligent rule recommendations based on data analysis

### 📈 **Advanced Filtering & Export**

- **Complex Filtering**: Filter data using multiple criteria and operators
- **Error Highlighting**: Visual indicators for data validation issues
- **CSV Export**: Export validated data to CSV format
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🎨 **User Experience**

- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Real-time Feedback**: Instant validation and error reporting
- **Drag & Drop Upload**: Intuitive file upload with visual feedback
- **Responsive Tables**: Interactive data tables with sorting and editing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Google Gemini API key (for AI features)

### Sample Test Data
- Sample Data are provided in the Samples folder. 

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/utsav306/Data-Alchemist.git
   cd dataalchemist
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   # Create .env.local file
   cp .env.example .env.local

   # Add your Gemini API key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 1. **Uploading Data**

- Drag and drop Excel or CSV files onto the upload area
- Supported formats: `.xlsx`, `.xls`, `.csv`
- Automatic sheet detection for clients, workers, and tasks
- Real-time validation feedback

### 2. **Data Validation**

- View validation errors highlighted in tables
- Edit data inline to fix issues
- Automatic re-validation on changes
- Export only validated data

### 3. **Natural Language Queries**

- Ask questions like "Show me all clients with priority 5"
- Filter data using natural language
- Complex queries supported: "Workers with skills containing 'Python' and max load > 3"

### 4. **AI Features**

- **Error Correction**: Click "Fix with AI" to automatically correct data issues
- **Rule Suggestions**: Get AI-powered business rule recommendations
- **Data Modification**: Use natural language to modify data: "Increase all task durations by 10%"

### 5. **Business Rules**

- Create validation rules using the visual builder
- Define rules in natural language
- Export rules for backup or sharing
- AI suggests rules based on data patterns

## 🏗️ Project Structure

```
dataalchemist/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Main application component
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── FileUploader.tsx   # File upload interface
│   │   ├── DataTablesSection.tsx # Data table management
│   │   ├── EditableTable.tsx  # Interactive data tables
│   │   ├── ExportButtons.tsx  # Data export functionality
│   │   ├── RuleSection.tsx    # Business rules management
│   │   ├── AIErrorCorrection.tsx # AI-powered error fixing
│   │   ├── AIValidator.tsx    # AI validation features
│   │   └── ...                # Other components
│   └── lib/                   # Utility functions
│       ├── parseFile.ts       # File parsing utilities
│       ├── validate.ts        # Data validation logic
│       ├── gemini.ts          # AI API integration
│       └── exportToCSV.ts     # Export functionality
├── public/                    # Static assets
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🛠️ Technology Stack

### **Frontend**

- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI** - React component library

### **Data Processing**

- **XLSX.js** - Excel file parsing and manipulation
- **Custom Validation Engine** - Business rule validation
- **CSV Export** - Data export functionality

### **AI Integration**

- **Google Gemini API** - Natural language processing
- **Custom AI Prompts** - Specialized data analysis
- **Error Correction** - Intelligent data fixing

### **Development Tools**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

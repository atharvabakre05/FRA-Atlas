# 🌲 FRA Atlas - AI-Powered WebGIS Decision Support System

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)

## 📋 Overview

**FRA Atlas** is an advanced AI-powered WebGIS Decision Support System designed to streamline and enhance the implementation of the Forest Rights Act (FRA) across India. The system provides comprehensive tools for government officials, tribal communities, and stakeholders to manage forest rights claims, analyze terrain data, and access government schemes.

### 🎯 Key Features

- **Interactive WebGIS Mapping** - Real-time visualization of FRA claims and forest cover
- **AI-Powered Terrain Analysis** - Advanced satellite imagery processing and land classification
- **Document Management** - OCR-enabled document processing and verification
- **Decision Support System** - Scheme eligibility analysis and recommendations
- **Multi-User Authentication** - Separate portals for public users and government employees
- **Real-time Analytics** - Comprehensive dashboards and progress tracking

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SIH-FRA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔐 Login Credentials

### Admin/Employee Access
- **Email:** `atharva.bakre05@gmail.com`
- **Password:** `1234`
- **PassKey:** `FRA2024`

### Public User Access
- **Email:** Any email address (e.g., `test@example.com`)
- **Password:** Any password (e.g., `123`, `password`)
- **Note:** Public users can login with any credentials for demo purposes

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── admin/           # Admin panel components
│   ├── auth/            # Authentication components
│   ├── common/          # Shared UI components
│   ├── dashboard/       # Dashboard and analytics
│   ├── database/        # Data management
│   ├── documents/       # Document processing
│   ├── fra-atlas/       # WebGIS mapping
│   ├── layout/          # Layout components
│   ├── public/          # Public user components
│   ├── schemes/         # Government schemes
│   └── terrain/         # Terrain analysis
├── contexts/            # React contexts
├── data/               # Sample data files
├── hooks/              # Custom React hooks
├── services/           # API and data services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript 5.5.3** - Type-safe JavaScript development
- **Vite 5.4.2** - Fast build tool and development server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework

### Key Libraries
- **Lucide React** - Beautiful icon library
- **Papa Parse** - CSV parsing and processing
- **Tesseract.js** - OCR (Optical Character Recognition)
- **Leaflet & React-Leaflet** - Interactive maps and WebGIS

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🎨 Features Overview

### 1. Interactive WebGIS Atlas
- Real-time mapping of FRA claims across 4 states
- Layer-based visualization (IFR, CR, CFR claims)
- Forest cover and terrain analysis
- Village-level progress tracking

### 2. AI-Powered Terrain Analysis
- Satellite imagery processing
- Land asset classification
- Soil and terrain analysis
- AI-driven recommendations

### 3. Document Management System
- OCR-enabled document processing
- Automated entity extraction
- Document verification workflow
- Support for multiple file formats

### 4. Decision Support System
- Government scheme eligibility analysis
- Priority-based recommendations
- Implementation timeline planning
- Success probability assessment

### 5. Multi-User Dashboard
- **Public Users:** Claim submission and tracking
- **Government Employees:** Full administrative access
- Real-time analytics and reporting
- State-wise progress monitoring

## 📊 Data Coverage

- **States:** Madhya Pradesh, Tripura, Odisha, Telangana
- **Villages:** 3,247 mapped villages
- **Claims:** 47,832+ FRA claims processed
- **Schemes:** 127+ government schemes integrated
- **Beneficiaries:** 1,89,234+ tribal community members

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Data Management
# The app includes sample CSV files for testing
```

## 📁 Sample Data

The project includes sample data files for testing:
- `sample-documents.csv` - Document processing examples
- `sample-plots.csv` - Land plot data
- `sample-schemes.csv` - Government schemes
- `sample-terrain.csv` - Terrain analysis data

## 🌐 WebGIS Integration

The system integrates with external mapping services:
- **Village Maps:** Direct integration with villagemap.in
- **Satellite Imagery:** Real-time terrain visualization
- **Geospatial Analysis:** Coordinate-based claim mapping

## 🎯 Use Cases

### For Government Officials
- Monitor FRA implementation progress
- Analyze claim patterns and trends
- Generate comprehensive reports
- Manage document verification workflow

### For Tribal Communities
- Submit forest rights claims
- Track claim status and progress
- Access government scheme information
- View village-level analytics

### For Researchers & NGOs
- Access anonymized FRA data
- Analyze implementation patterns
- Generate research reports
- Monitor policy effectiveness

## 🚀 Deployment

### Production Build
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Environment Variables
Currently, the application uses mock data and doesn't require external API keys. For production deployment, configure:
- Database connection strings
- API endpoints
- Authentication services
- File storage services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is developed for the Smart India Hackathon (SIH) and is intended for educational and demonstration purposes.

## 🆘 Support

For support and questions:
- Check the `LOGIN_INSTRUCTIONS.md` file for detailed login procedures
- Review the component documentation in the `src/components/` directory
- Examine the type definitions in `src/types/index.ts`

## 🎉 Acknowledgments

- **Smart India Hackathon (SIH)** - Platform for innovation
- **Forest Rights Act (FRA)** - Policy framework
- **Tribal Communities** - End users and beneficiaries
- **Government of India** - Policy implementation support

---

**Built with ❤️ for the Smart India Hackathon 2024**

*Empowering Forest Rights through Technology*

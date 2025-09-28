## User Interface

### Analytics Overview
![Analytics Overview](../assets/Image-analytics%202.PNG)

### Dashboard
![Dashboard](../assets/Image-dashbord.PNG)

### Report History
![Report History](../assets/Image-report%20history.PNG)

### Analytics (Alternative View)
![Analytics Alternative](../assets/Image-analytics.PNG)
# Feyti Medical Report Assistant – Frontend

A modern, responsive web application for processing, translating, and analyzing medical reports using AI. This is the frontend for the Feyti Medical Report Assistant project.

## Features
- Clean, responsive UI built with Next.js and Tailwind CSS
- Submit medical reports for AI-powered processing
- View report results and analytics in real time
- Translation support (French & Swahili)
- Report history and search
- Data visualization with charts

## Project Architecture

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React UI components
│   ├── pages/           # Next.js pages (routing)
│   ├── services/        # API service layer
│   ├── styles/          # Global and component styles
│   └── App.css, index.css
├── package.json         # Project dependencies
├── tailwind.config.js   # Tailwind CSS config
├── postcss.config.js    # PostCSS config
└── README.md            # This file
```

## Prerequisites
- Node.js v16 or higher
- npm (comes with Node.js)
- Backend API running (see backend/README.md)

## Getting Started

1. **Install dependencies**
	```bash
	npm install
	```

2. **Configure environment**
	- If needed, create a `.env.local` file for custom API URLs (defaults to http://localhost:8000)

3. **Run the development server**
	```bash
	npm run dev
	```
	The app will be available at [http://localhost:3000](http://localhost:3000)

4. **Build for production**
	```bash
	npm run build
	npm start
	```

## Usage
- Fill out the report form and submit to process a medical report
- View results, analytics, and translation in real time
- Browse report history and use search/filter features

## API Integration
- The frontend communicates with the FastAPI backend (see backend/README.md)
- API endpoints are configured in `src/services/api.js`

## Customization
- Update Tailwind styles in `tailwind.config.js` and `src/styles/`
- Add or modify UI components in `src/components/`
- Adjust API logic in `src/services/api.js`

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes and commit (`git commit -m 'Add feature'`)
4. Push to your fork and open a Pull Request

For backend setup and API documentation, see `../backend/README.md`.
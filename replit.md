# Photography Portfolio Website - Vane Andrade

## Overview

This is a modern, responsive photography portfolio website for Vane Andrade, a professional photographer specializing in weddings, portraits, and artistic photography. The application is built as a full-stack web application with a React frontend and Express.js backend, featuring a contact form system and image gallery functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Styling**: Custom CSS variables with dark/light mode support
- **Image Handling**: Custom lightbox component for gallery viewing
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints
- **Request Handling**: JSON and URL-encoded form data support
- **Static Assets**: Express static file serving for attached assets
- **Development**: Vite integration for hot module replacement

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Neon Database serverless connection
- **Fallback**: In-memory storage implementation for development
- **Tables**: Users and contact submissions

## Key Components

### Frontend Components
1. **Navigation**: Fixed header with smooth scrolling navigation
2. **Hero Section**: Full-screen landing with call-to-action buttons
3. **Featured Work**: Showcase of best photography work
4. **About Section**: Photographer biography and statistics
5. **Portfolio Gallery**: Filterable image gallery with lightbox
6. **Services Section**: Photography service offerings and pricing
7. **Contact Section**: Form with validation and social media links
8. **Lightbox**: Custom image viewer with navigation controls

### Backend Services
1. **Contact API**: Handles form submissions with validation
2. **Static Assets**: Serves photography images and media files
3. **Request Logging**: Middleware for API request monitoring
4. **Error Handling**: Centralized error handling and responses

### Database Schema
- **Users Table**: Authentication system (future expansion)
  - id (serial primary key)
  - username (unique text)
  - password (text)
- **Contact Submissions Table**: Form data storage
  - id (serial primary key)
  - name, email, phone, service, eventDate, message (text fields)
  - createdAt (timestamp with default)

## Data Flow

1. **Client Request**: User interacts with frontend components
2. **Form Submission**: Contact form data validated client-side with Zod
3. **API Call**: TanStack Query sends validated data to Express endpoints
4. **Server Processing**: Express routes handle requests with validation
5. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
6. **Response Handling**: JSON responses sent back to client
7. **UI Updates**: React Query updates UI state based on responses

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm & drizzle-zod**: Database ORM and validation
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server code
- **@replit/vite-plugin-***: Replit-specific development tools

### UI Components
Complete shadcn/ui component library including:
- Form controls (Input, Textarea, Select, Checkbox)
- Layout components (Card, Dialog, Sheet, Tabs)
- Feedback components (Toast, Alert, Progress)
- Navigation components (Dropdown, Context Menu, Navigation Menu)

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Port**: 5000 (mapped to external port 80)
- **Features**: Hot module replacement, error overlay, source maps
- **Database**: Environment variable DATABASE_URL required

### Production Build
- **Build Process**: 
  1. `vite build` - Compiles React frontend
  2. `esbuild` - Bundles Express server with external packages
- **Output**: `dist/` directory with client and server bundles
- **Start Command**: `npm start` runs production server

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Deployment**: Autoscale deployment target
- **Build Commands**: Automated build pipeline configured
- **Port Mapping**: Internal 5000 → External 80

## Changelog

```
Changelog:
- June 15, 2025. Initial setup
- January 12, 2025. Updated services section with complete "Paquetes para eventos" package details
- January 12, 2025. Removed duplicate prenatal images from portfolio gallery
- January 12, 2025. Streamlined portfolio navigation to direct category access
- January 12, 2025. Enhanced all service descriptions:
  * Paquetes para eventos: Complete 6-item package with invitations, session, coverage, book, video, and easel service
  * Sesiones de Retratos: Added express sessions from 30 minutes with simplified features
  * Sesiones a productos: Renamed from "Fotografía de Moda" with product-focused description
- January 12, 2025. Added new "Fotografía Escolar" category with 8 school graduation images
- January 12, 2025. Cleaned up Comuniones category by removing wedding images
- January 12, 2025. Removed image titles overlay from portfolio gallery for cleaner interface
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
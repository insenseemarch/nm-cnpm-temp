## 📋 Prerequisites

- Docker and Docker Compose
- Node.js (v14.x or higher) - if running without Docker
- npm or yarn - if running without Docker

## 🚀 Quick Start with Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd family-tree
   ```

2. **Development mode** (with hot reload):
   ```bash
   sudo docker compose -f docker-compose.dev.yml up -d
   ```

3. **Production mode** (no hot reload):
   ```bash
   sudo docker compose up -d
   ```

4. Access the application:
   - Backend API: http://localhost:3001
   - API Documentation (Swagger): http://localhost:3001/api-docs
   - Health Check: http://localhost:3001/health

5. Stop services:
   ```bash
   sudo docker compose down
   # or for dev mode
   sudo docker compose -f docker-compose.dev.yml down
   ```

## 🐳 Docker Commands

### Development workflow (with hot reload):
```bash
# Start development mode with auto-reload
sudo docker compose -f docker-compose.dev.yml up -d

# View logs (will show nodemon restarts)
sudo docker compose -f docker-compose.dev.yml logs backend -f

# Stop development mode
sudo docker compose -f docker-compose.dev.yml down
```

### Production workflow:
```bash
# Start production mode
sudo docker compose up -d

# View logs
sudo docker compose logs backend        # Backend logs only
sudo docker compose logs -f             # All logs with follow

# Restart services
sudo docker compose restart backend     # Restart backend only
sudo docker compose restart             # Restart all services

# Rebuild and restart (after dependency changes)
sudo docker compose up -d --build

# Stop services
sudo docker compose down

# Check status
sudo docker compose ps
```

## 🛠️ Local Development (Without Docker)
## 🛠️ Local Development (Without Docker)

### Backend Setup:
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup:
```bash
git clone <repository-url>
cd frontend
```

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
   
2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## 📚 Backend Development Workflow

For detailed instructions on implementing new backend features, see:
**[Backend Implementation Guide](./backend/README_IMPLEMENTATION.md)**

This guide covers:
- Step-by-step workflow for new features
- Service → Controller → Route pattern
- Testing with Swagger UI
- Database operations with Prisma
- Best practices and examples


## 📁 Project Structure

```
family-tree/
├── backend/            # Node.js + TypeScript + Prisma API
│   ├── src/           # Source code
│   ├── prisma/        # Database schema
│   ├── Dockerfile     # Docker configuration
│   └── package.json   # Dependencies
├── frontend/          # React + Vite application
│   ├── public/        # Static assets
│   ├── src/          
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # Global styles and Tailwind configuration
│   │   ├── App.jsx        # Main application component
│   │   ├── Routes.jsx     # Application routes
│   │   └── index.jsx      # Application entry point
│   ├── index.html         # HTML template
│   ├── package.json       # Project dependencies and scripts
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── vite.config.js     # Vite configuration
└── docker-compose.yml     # Multi-service Docker setup
```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```


## 📦 Key Dependencies

### Family Tree Visualization
- **family-chart** (v0.9.0) - D3.js-based family tree library
  - GitHub: https://github.com/SanichKotikov/react-family-tree
  - Documentation: https://sanichkotikov.github.io/react-family-tree/
  - Features: Interactive family trees with custom HTML cards, SVG connections, pan/zoom functionality

## 📦 Deployment

### Docker Production Build:
```bash
# Build and start production containers
sudo docker compose -f docker-compose.yml up -d --build

# Or build specific service
sudo docker compose build backend
```

### Manual Build:
```bash
# Backend
cd backend
npm run build

# Frontend  
cd frontend
npm run build
```

## 🔧 Environment Configuration

### Backend Environment Variables:
Create `/backend/.env.docker` for Docker or `/backend/.env` for local development:
```env
PORT=3001
NODE_ENV=production
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
FRONTEND_URL=http://localhost:4028
```

## 🚨 Troubleshooting

### Docker Issues:
```bash
# Check container status
sudo docker compose ps

# View container logs
sudo docker compose logs backend

# Restart services
sudo docker compose restart

# Clean rebuild
sudo docker compose down
sudo docker compose up -d --build
```

### Permission Issues:
If you get permission denied errors, add your user to docker group:
```bash
sudo usermod -aG docker $USER
# Then logout and login again
```



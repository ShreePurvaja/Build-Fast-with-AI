# AI Workforce Platform - Frontend (Next.js & Claude Light Theme)

This is the Next.js frontend application for **AI Workforce Platform** featuring an n8n-style visual workflow editor, MongoDB node integration, project management, authentication, and execution session logs.

---

## 🚀 Execution Commands

### 1. Start the Frontend (Next.js)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

### 2. Start the Backend API (FastAPI & MongoDB)

In a separate terminal:

```bash
# Navigate to the backend directory
cd backend

# Install / sync dependencies using uv
uv sync

# Start Uvicorn backend server using uv
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- **Backend API**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`

---

## 🛠️ Build for Production

To create an optimized production build of the frontend:

```bash
npm run build
npm run start
```

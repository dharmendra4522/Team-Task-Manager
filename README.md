# Team Task Manager

Team Task Manager is a full-stack project management application designed for teams to collaborate effectively. It features a robust project-level role-based access control system, real-time dashboard statistics, and a sleek, premium user interface.

## Features
- **Project-Level Roles**: The user who creates a project automatically becomes the **Project Admin**. Other members join as **Members**.
- **Join Projects**: Users can browse all projects and join them to start collaborating.
- **Dynamic Dashboard**: 
    - Overview of total projects, tasks, and completion rates.
    - **Tasks per Team Member**: Visual breakdown of each member's productivity and progress.
    - Status distribution charts.
- **Task Management**:
    - Project Admins can create, assign, and manage all tasks.
    - Members can update the status of their assigned tasks.
    - Color-coded priority and status indicators.
- **Responsive UI**: Premium, mobile-first design using Tailwind CSS.
- **Secure Auth**: JWT-based authentication with protected routes.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (JSON Web Tokens), Bcryptjs
- **Deployment**: Railway (Backend + Frontend)

## Local Setup
```bash
git clone <repo-url>
cd "Team Task Manager"
# Setup Backend
cd server
npm install
cp .env.example .env   # Fill in values from table below
npm run dev
# Setup Frontend
cd ../client
npm install
# Ensure .env has VITE_API_URL=http://localhost:5000/api
npm run dev
```

## Environment Variables
| Variable | Description |
|----------|-------------|
| MONGO_URI | MongoDB connection string (Local or Atlas) |
| JWT_SECRET | Secret key for signing JWT tokens |
| PORT | Backend port (default: 5000) |
| CLIENT_URL | Frontend URL for CORS (e.g., http://localhost:5173) |

## API Documentation

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate and get token
- `GET /api/auth/users` - Get all users (Admin only)

### Projects
- `GET /api/projects` - List user's projects
- `GET /api/projects?all=true` - List all projects (for discovery)
- `POST /api/projects` - Create new project (Creator becomes Project Admin)
- `PUT /api/projects/:id` - Update project (Project Admin only)
- `DELETE /api/projects/:id` - Delete project (Project Admin only)
- `POST /api/projects/:id/join` - Join a project as a member
- `POST /api/projects/:id/members` - Add member manually (Project Admin only)
- `DELETE /api/projects/:id/members/:userId` - Remove member (Project Admin only)

### Tasks
- `GET /api/tasks?projectId=...` - List tasks for a project
- `POST /api/tasks` - Create task (Project Admin only)
- `PUT /api/tasks/:id` - Update task (Admin: full, Member: status only)
- `DELETE /api/tasks/:id` - Delete task (Project Admin only)

### Dashboard
- `GET /api/dashboard` - Get summary stats and per-member productivity

## Deployment (Railway)
1. **Push code to GitHub**: Ensure both `client` and `server` folders are in the root.
2. **Create new Railway project**.
3. **Add backend service**: 
    - Connect GitHub repo.
    - Set Root Directory to `server`.
    - Set Env Vars: `MONGO_URI`, `JWT_SECRET`, `PORT`, `CLIENT_URL`.
4. **Add frontend service**:
    - Connect GitHub repo.
    - Set Root Directory to `client`.
    - Set Env Var: `VITE_API_URL` (point to deployed backend URL).
5. **Deploy both** and link the frontend domain to the backend's `CLIENT_URL`.

## Live URL
[Deployed Link Here]

## Demo Video
[Demo Video Link Here]

## License
Distributed under the MIT License.

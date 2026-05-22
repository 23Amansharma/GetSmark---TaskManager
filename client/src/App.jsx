import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'   // ✅ NEW
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Tasks from './pages/Tasks'
import AcceptInvite from './pages/AcceptInvite'

const PrivateRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                element={<Home />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/signup"          element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />   {/* ✅ NEW */}
      <Route path="/dashboard"       element={<PrivateRoute><Dashboard /></PrivateRoute>} />
<Route path="/accept-invite" element={<AcceptInvite />} />
      <Route path="/projects"        element={<PrivateRoute><Projects /></PrivateRoute>} />
      <Route path="/projects/:id"    element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
      <Route path="/tasks"           element={<PrivateRoute><Tasks /></PrivateRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
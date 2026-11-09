import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedLayout, PublicLayout } from './components/Layout'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Discover from './pages/Discover'
import Matches from './pages/Matches'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          <Route element={<ProtectedLayout />}>
            <Route path="/discover" element={<Discover />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(26,26,60,0.95)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              color: 'white',
              borderRadius: '16px',
              fontSize: '0.9rem',
            },
            success: {
              iconTheme: { primary: '#39FF14', secondary: '#000' },
            },
            error: {
              iconTheme: { primary: '#FF1493', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

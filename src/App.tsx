import { createRoot } from 'react-dom/client'
import './assets/globals.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Index from './pages'
import Dashboard from './pages/dashboard'
import Monitoring from './pages/monitoring'
import ServerPage from './pages/server'
import Terminal from './pages/terminal'
import HomePage from './pages/home'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react'
import { ThemeProvider } from './components/theme-provider'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><Navigate to="/home" replace /></SignedOut>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system" storageKey="servermon-theme">
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          {/* Landing route: if not signed in, show Index (login); if signed in, go to dashboard */}
          <Route path='/' element={
            <>
              <SignedOut>
                <Navigate to="/home" replace />
              </SignedOut>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
            </>
          } />
          {/* Home page: always accessible */}
          <Route path='/home' element={<HomePage />} />
          {/* Login page: only for unauthenticated users */}
          <Route path='/login' element={<Index />} />
          {/* Protected routes */}
          <Route path='/dashboard' element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path='/monitoring' element={
            <ProtectedRoute><Monitoring /></ProtectedRoute>
          } />
          <Route path='/server' element={
            <ProtectedRoute><ServerPage /></ProtectedRoute>
          } />
          <Route path='/terminal' element={
            <ProtectedRoute><Terminal /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </ThemeProvider>
)

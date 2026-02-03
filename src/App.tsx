import { createRoot } from 'react-dom/client'
import './assets/globals.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Index from './pages'
import Dashboard from './pages/dashboard'
import Monitoring from './pages/monitoring'
import ServerPage from './pages/server'
import Terminal from './pages/terminal'
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
      <SignedOut><Navigate to="/" replace /></SignedOut>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system" storageKey="servermon-theme">
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={
            <>
              <SignedOut>
                <Index />
              </SignedOut>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
            </>
          } />
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

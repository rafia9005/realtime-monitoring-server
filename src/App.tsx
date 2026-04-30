import { createRoot } from 'react-dom/client'
import './assets/globals.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Index from './pages'
import Dashboard from './pages/dashboard'
import Monitoring from './pages/monitoring'
import ServerPage from './pages/server'
import Terminal from './pages/terminal'
import AgentsPage from './pages/agents'
import HomePage from './pages/home'
import AboutPage from './pages/about'
import ContactPage from './pages/contact'
import { ClerkProvider, SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import { ThemeProvider } from './components/theme-provider'
import ChatWidget from './components/ChatWidget'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

// Daftar email yang diizinkan untuk mengakses dashboard pemantauan dari environment variables (.env)
const envEmails = import.meta.env.VITE_ALLOWED_EMAILS || '';
const ALLOWED_EMAILS = envEmails
  .split(',')
  .map((email: string) => email.replace(/['"]/g, '').trim().toLowerCase())
  .filter(Boolean);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/home" replace />;
  }

  const primaryEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAllowed = primaryEmail && ALLOWED_EMAILS.includes(primaryEmail);

  if (!isAllowed) {
    // Redirect pengguna yang tidak diizinkan atau tampilkan pesan error
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-destructive mb-2">Akses Ditolak</h1>
        <p className="text-muted-foreground mb-4">Akun Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <button onClick={() => window.location.href = '/home'} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system" storageKey="watchtower-theme">
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
          <Route path='/about' element={<AboutPage />} />
          <Route path='/contact' element={<ContactPage />} />
          {/* Login page: only for unauthenticated users */}
          <Route path='/login' element={<Index />} />
          {/* Protected routes */}
          <Route path='/dashboard' element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path='/monitoring' element={
            <ProtectedRoute><Monitoring /></ProtectedRoute>
          } />
          <Route path='/server/:id' element={
            <ProtectedRoute><Monitoring /></ProtectedRoute>
          } />
          <Route path='/server' element={
            <ProtectedRoute><ServerPage /></ProtectedRoute>
          } />
          <Route path='/terminal' element={
            <ProtectedRoute><Terminal /></ProtectedRoute>
          } />
          <Route path='/agents' element={
            <ProtectedRoute><AgentsPage /></ProtectedRoute>
          } />
        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </ClerkProvider>
  </ThemeProvider>
)

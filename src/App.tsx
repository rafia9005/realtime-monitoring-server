import { createRoot } from 'react-dom/client'
import './assets/globals.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Index from './pages'
import Dashboard from './pages/dashboard'
import Monitoring from './pages/monitoring'
import ServerPage from './pages/server'
import Terminal from './pages/terminal'
import AgentsPage from './pages/agents'
import McuSensorsPage from './pages/mcu-sensors'
import HomePage from './pages/home'
import AboutPage from './pages/about'
import ContactPage from './pages/contact'
import { ClerkProvider, SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import { ThemeProvider } from './components/theme-provider'
import ChatWidget from './components/ChatWidget'
import { LanguageProvider } from './lib/LanguageContext'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { Lock } from 'lucide-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

const envEmails = import.meta.env.VITE_ALLOWED_EMAILS || '';
const ALLOWED_EMAILS = envEmails
  .split(',')
  .map((email: string) => email.replace(/['"]/g, '').trim().toLowerCase())
  .filter(Boolean);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black tracking-widest text-muted-foreground uppercase">Authorizing...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  const primaryEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAllowed = primaryEmail && ALLOWED_EMAILS.includes(primaryEmail);

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.05)_0%,transparent_50%)]" />
        <div className="relative z-10 text-center space-y-8 max-w-md p-12 bg-card/40 backdrop-blur-3xl border border-red-500/20 rounded-[2.5rem] shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
             <Lock className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter uppercase text-red-500">Access Denied</h1>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">Your credentials are valid but your identity is not authorized for this specific secure sector.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/home'} 
            className="w-full h-14 bg-foreground text-background rounded-2xl font-black tracking-widest uppercase hover:bg-foreground/90 transition-all active:scale-95 shadow-xl"
          >
            Evacuate to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system" storageKey="watchtower-theme">
    <LanguageProvider>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <BrowserRouter>
          <Routes>
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
            <Route path='/home' element={<HomePage />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/contact' element={<ContactPage />} />
            <Route path='/login' element={<Index />} />
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
            <Route path='/mcu-sensors' element={
              <ProtectedRoute><McuSensorsPage /></ProtectedRoute>
            } />
            <Route path='*' element={<Navigate to="/home" replace />} />
          </Routes>
          <ChatWidget />
          <LanguageSwitcher />
        </BrowserRouter>
      </ClerkProvider>
    </LanguageProvider>
  </ThemeProvider>
)

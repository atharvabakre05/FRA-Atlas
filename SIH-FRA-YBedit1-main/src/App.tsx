import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LandingPage } from './components/auth/LandingPage';
import { EmployeeLogin } from './components/auth/EmployeeLogin';
import { PublicLogin } from './components/auth/PublicLogin';
import { ModernAuthForm } from './components/auth/ModernAuthForm';
import { UserAuthForm } from './components/auth/UserAuthForm';
import { AuthCallback } from './components/auth/AuthCallback';
import { PasswordReset } from './components/auth/PasswordReset';
import { UserProfile } from './components/auth/UserProfile';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
// Lazy load heavy components for better performance
const FRAAtlas = lazy(() => import('./components/fra-atlas/FRAAtlas').then(m => ({ default: m.FRAAtlas })));
const DocumentUpload = lazy(() => import('./components/documents/DocumentUpload').then(m => ({ default: m.DocumentUpload })));
const TerrainAnalysis = lazy(() => import('./components/terrain/TerrainAnalysis').then(m => ({ default: m.TerrainAnalysis })));
const GovernmentSchemes = lazy(() => import('./components/schemes/GovernmentSchemes').then(m => ({ default: m.GovernmentSchemes })));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const SDLCAdminPanel = lazy(() => import('./components/admin/SDLCAdminPanel').then(m => ({ default: m.SDLCAdminPanel })));
const DLCAdminPanel = lazy(() => import('./components/admin/DLCAdminPanel').then(m => ({ default: m.DLCAdminPanel })));
const SLMCAdminPanel = lazy(() => import('./components/admin/SLMCAdminPanel').then(m => ({ default: m.SLMCAdminPanel })));
const ClaimReview = lazy(() => import('./components/admin/ClaimReview').then(m => ({ default: m.ClaimReview })));
const AIAssetMapping = lazy(() => import('./components/ai-asset-mapping/AIAssetMapping').then(m => ({ default: m.AIAssetMapping })));
const MyClaims = lazy(() => import('./components/public/MyClaims').then(m => ({ default: m.MyClaims })));
const ClaimSubmission = lazy(() => import('./components/public/ClaimSubmission').then(m => ({ default: m.ClaimSubmission })));
const ClaimDetails = lazy(() => import('./components/public/ClaimDetails').then(m => ({ default: m.ClaimDetails })));

const MainApp: React.FC = () => {
  const { user, loading, userType, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showEmployeeLogin, setShowEmployeeLogin] = useState(false);
  const [adminLoginRole, setAdminLoginRole] = useState<'gp_admin' | 'sdlc_admin' | 'dlc_admin' | 'slmc_admin'>('gp_admin');
  const [showPublicLogin, setShowPublicLogin] = useState(false);
  const [showModernAuth, setShowModernAuth] = useState(false);
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isAuthCallback, setIsAuthCallback] = useState(false);

  // Check for auth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isCallback = urlParams.get('code') || window.location.pathname.includes('/auth/callback');
    setIsAuthCallback(isCallback);
  }, []);

  // Reset login states when user logs in
  useEffect(() => {
    if (user) {
      setShowEmployeeLogin(false);
      setShowPublicLogin(false);
      setShowModernAuth(false);
      setShowUserAuth(false);
      setShowPasswordReset(false);
    } else {
      // When user logs out, reset to landing page
      setShowEmployeeLogin(false);
      setShowPublicLogin(false);
      setShowModernAuth(false);
      setShowUserAuth(false);
      setShowPasswordReset(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-forest-sky flex items-center justify-center">
        <div className="text-center">
          <div className="forest-spinner mx-auto"></div>
          <p className="text-forest-medium mt-4 text-lg font-medium">Loading Forest Atlas...</p>
        </div>
      </div>
    );
  }

  // Show auth callback
  if (isAuthCallback) {
    return (
      <AuthCallback 
        onSuccess={() => setIsAuthCallback(false)}
        onError={() => setIsAuthCallback(false)}
      />
    );
  }

  // Show password reset
  if (showPasswordReset) {
    return (
      <PasswordReset 
        onBack={() => setShowPasswordReset(false)}
        onSuccess={() => setShowPasswordReset(false)}
      />
    );
  }

  // Show modern auth form
  if (showModernAuth && !user) {
    return (
      <ModernAuthForm 
        onSuccess={() => setShowModernAuth(false)}
        onError={() => {}}
      />
    );
  }

  // Show user auth form (Google OAuth + OTP)
  if (showUserAuth && !user) {
    return (
      <UserAuthForm 
        onSuccess={() => setShowUserAuth(false)}
      />
    );
  }

  // Show landing page if no user and not in login flow
  if (!user && !showEmployeeLogin && !showPublicLogin && !showModernAuth && !showUserAuth) {
    return (
      <LandingPage 
        onEmployeeLogin={(role) => { setAdminLoginRole(role); setShowEmployeeLogin(true); }} 
        onPublicLogin={() => setShowPublicLogin(true)}
        onModernAuth={() => setShowModernAuth(true)}
        onUserAuth={() => setShowUserAuth(true)}
        onPasswordReset={() => setShowPasswordReset(true)}
      />
    );
  }

  // Show employee login
  if (showEmployeeLogin && !user) {
    return <EmployeeLogin role={adminLoginRole} onBack={() => setShowEmployeeLogin(false)} />;
  }

  // Show public login
  if (showPublicLogin && !user) {
    return <UserAuthForm onSuccess={() => setShowPublicLogin(false)} />;
  }

  const renderContent = () => {
    const LoadingSpinner = () => (
      <div className="flex items-center justify-center h-64">
        <div className="forest-spinner"></div>
      </div>
    );

    // Lightweight URL routing for claim details
    const path = window.location.pathname;
    if (/^\/(dashboard\/)?claims\//.test(path)) {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <ClaimDetails />
        </Suspense>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            {userType === 'gp_admin' ? <AdminPanel /> : userType === 'sdlc_admin' ? <SDLCAdminPanel /> : userType === 'dlc_admin' ? <DLCAdminPanel /> : userType === 'slmc_admin' ? <SLMCAdminPanel /> : <MyClaims />}
          </Suspense>
        );
      case 'profile':
        return <UserProfile onLogout={() => {}} />;
      case 'claim-review':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ClaimReview />
          </Suspense>
        );
      case 'submit-claim':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ClaimSubmission />
          </Suspense>
        );
      case 'fra-atlas':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <FRAAtlas />
          </Suspense>
        );
      case 'documents':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <DocumentUpload />
          </Suspense>
        );
      case 'asset-mapping':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AIAssetMapping />
          </Suspense>
        );
      case 'schemes':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <GovernmentSchemes />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            {userType === 'gp_admin' ? <AdminPanel /> : userType === 'sdlc_admin' ? <SDLCAdminPanel /> : userType === 'dlc_admin' ? <DLCAdminPanel /> : userType === 'slmc_admin' ? <SLMCAdminPanel /> : <MyClaims />}
          </Suspense>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Navbar onSectionChange={setActiveSection} activeSection={activeSection} />
      <div className="pt-16"> {/* Add top padding to account for fixed navbar */}
        <div className="relative min-h-[calc(100vh-64px)]">
          {(() => {
            const path = window.location.pathname;
            if (/^\/(dashboard\/)?claims\//.test(path)) {
              return null; // Hide sidebar on claim details view
            }
            return (
              <Sidebar 
                activeSection={activeSection} 
                onSectionChange={setActiveSection} 
                userType={(userType as any) || 'public'} 
                isMinimized={isSidebarMinimized}
                onMinimizeToggle={() => setIsSidebarMinimized(!isSidebarMinimized)}
              />
            );
          })()}
          <main 
            className={`transition-all duration-300 ease-in-out ${
              (() => {
                const path = window.location.pathname;
                if (/^\/(dashboard\/)?claims\//.test(path)) {
                  return 'ml-0';
                }
                return isSidebarMinimized ? 'ml-20' : 'ml-72';
              })()
            }`}
          >
            <div className="p-6">
              <div className="animate-forest-fade-in transition-all duration-500 ease-in-out">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
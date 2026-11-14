import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SparkGuard } from './components/SparkGuard';
import { Login } from './components/Login';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminHub } from './components/AdminHub';
import { AutomotiveLoader } from './components/AutomotiveLoader';

const MainLayout: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const [viewMode] = useState<'sparkguard' | 'standard'>('sparkguard');

  if (isLoading) {
    return (
      <AutomotiveLoader
        headline="PREPARING YOUR SITE"
        punchlines={[
          'AUTHENTICATING SECURE VEHICLE GATEWAY...',
          'CALIBRATING NEURAL CANNY EDGE SENSORS...',
          'SYNCHRONIZING TELEMETRY STREAMS...',
          'LAUNCHING SPARKGUARD CONTROL CENTER...'
        ]}
      />
    );
  }

  // Not logged in -> Show the SparkGuard cinematic intro and automotive login
  if (!user) {
    if (viewMode === 'sparkguard') {
      return <SparkGuard onLoginSuccess={() => {}} />;
    }
    return (
      <div className="min-h-screen bg-[#454C83] flex flex-col font-sans w-full max-w-full overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <Login />
        </main>
      </div>
    );
  }

  // Logged in -> Portal with #454C83 static background and floating dark boxes
  return (
    <div className="min-h-screen bg-[#454C83] flex flex-col font-sans text-[#E7EAF5] w-full max-w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pb-16 w-full max-w-full overflow-x-hidden">
        {role === 'ADJUSTER' ? <AdminHub /> : <CustomerDashboard />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

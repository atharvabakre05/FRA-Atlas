import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { AuthService } from '../../services/authService';

export const AuthRouteHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/?error=auth_failed');
          return;
        }

        if (data.session?.user) {
          // Check if user is admin
          const isAdmin = AuthService.isAdminEmail(data.session.user.email);
          
          if (isAdmin) {
            navigate('/?success=admin_login');
          } else {
            navigate('/?success=user_login');
          }
        } else {
          navigate('/?error=no_session');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        navigate('/?error=auth_failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-forest-sky flex items-center justify-center">
      <div className="text-center">
        <div className="forest-spinner mx-auto"></div>
        <p className="text-forest-medium mt-4 text-lg font-medium">Processing authentication...</p>
      </div>
    </div>
  );
};

"use client";

import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchCurrentUser } from '../auth/auth.api'; 
import { UserRole } from '@server/users'; 

interface ProtectedRoleRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[]; 
}

export function ProtectedRoleRoute({ children, allowedRoles }: ProtectedRoleRouteProps) {
  const token = localStorage.getItem('access_token');
  const location = useLocation(); // <-- Monitora i cambi di rotta reali
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true); // Resetta il caricamento al cambio di rotta
    fetchCurrentUser()
      .then((data) => {
        if (!data || Object.keys(data).length === 0 || (!data.email && !data.username && !data.id && !data.role)) {
          setUser(null);
        } else {
          setUser(data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setUser(null);
        setIsLoading(false);
      });
  }, [token, location.key]); // <-- Riesegue il controllo se l'utente naviga in una nuova pagina

  // 1. Se non c'è il token nel localStorage, dritto al login senza passare dal via
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Mentre il server risponde, mostriamo il loader
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--unibs-blue)] border-t-transparent" />
      </div>
    );
  }

  // 3. Se la chiamata fallisce o l'utente non è valido, rimanda al login
  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  // 4. Se l'utente è loggato MA il suo ruolo non è tra quelli autorizzati, scatta il 403 (Forbidden)
  // Il cast 'as any' o un controllo sul tipo previene discrepanze se user.ruolo arriva come stringa dal backend
  if (!allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/403" replace />; 
  }

  // 5. Tutto ok? Mostra la pagina protetta
  return <>{children}</>;
}
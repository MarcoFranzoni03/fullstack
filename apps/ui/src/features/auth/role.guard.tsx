import { UserRole } from '@server/users';
import { ReactNode } from 'react';

interface RoleGuardProps {
  user: any;
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ user, allowedRoles, children }: RoleGuardProps) {
  // Se l'utente non è loggato o il suo ruolo non è tra quelli permessi, sparisce tutto
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
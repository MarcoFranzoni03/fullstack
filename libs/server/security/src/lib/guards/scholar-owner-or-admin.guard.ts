import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@server/users';

@Injectable()
export class ScholarOwnerOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Recuperiamo l'ID passato nell'URL (es. /scholar/:id)
    const paramId = request.params.id;

    // 1. Controllo di sicurezza: l'utente deve essere autenticato (JwtAuthGuard deve stare prima!)
    if (!user) {
      throw new ForbiddenException('Utente non autenticato o non trovato nella richiesta.');
    }

    // 2. Se l'utente è un ADMIN, ha il passaporto per fare tutto
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // 3. Se non è admin, controlliamo se è uno SCHOLAR e se sta toccando il PROPRIO profilo
    if (user.role === UserRole.SCHOLAR && paramId) {
      // Trasformiamo paramId in numero per sicurezza, dato che i parametri dell'URL sono stringhe
      if (user.id === parseInt(paramId, 10)) {
        return true;
      }
    }

    // 4. In tutti gli altri casi, blocchiamo la richiesta
    throw new ForbiddenException('Non hai i permessi per modificare o visualizzare questo profilo.');
  }
}
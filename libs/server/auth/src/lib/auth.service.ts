import { NotFoundException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ServerUsersService } from '@server/users';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { AuthResponse } from './interfaces/auth-response.interface';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class ServerAuthService {
    // Injecting the used services
    constructor(private readonly usersService: ServerUsersService,
        private readonly jwtService: JwtService) {}

    async validateUser(email: string, password: string): Promise<AuthenticatedUser> {
        const user = await this.usersService.findByEmail(email);

        if(!user) throw new NotFoundException("Credentials not valid");

        const passwordMatches = await bcrypt.compare(password,user.passwordHash);
        if(!passwordMatches) {
            throw new UnauthorizedException("Credentials not valid!");
        }

        const { passwordHash, ...result } = user;
        return result;
    }

    async login(user: AuthenticatedUser): Promise<AuthResponse> {
        const payload = {sub: user.id, name: user.name, email: user.email, role: user.role};
        return {access_token: await this.jwtService.signAsync(payload), user}
    }

    async register(dto: RegisterDto): Promise<AuthResponse> {
        const user = await this.usersService.create(dto);

        const { passwordHash, ...result } = user;
        return this.login(result);
    }

    async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ message: string }> {
        // 1. Recuperiamo l'utente sfruttando il metodo già esistente nel tuo UsersService
        const user = await this.usersService.getOneUser(userId);

        // 2. Confrontiamo la vecchia password inserita con il "passwordHash" dell'entità
        const passwordMatches = await bcrypt.compare(dto.oldPassword, user.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedException("Current password is not valid!");
        }

        // 3. Controllo opzionale di sicurezza: evitiamo che rimetta la stessa password
        const isSamePassword = await bcrypt.compare(dto.newPassword, user.passwordHash);
        if (isSamePassword) {
            throw new UnauthorizedException("The new password cannot be identical to the current one!");
        }

        // 4. Deleghiamo l'hashing e il salvataggio a UsersService
        await this.usersService.updatePassword(userId, dto.newPassword);

        return { message: "Password updated successfully" };
    }
}


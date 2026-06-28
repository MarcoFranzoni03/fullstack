import { Injectable, NotFoundException } from '@nestjs/common';
import { ScholarEntity } from './scholar.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ServerUsersService, UserRole } from '@server/users';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { ScholarListItem } from './interfaces/scholar-list-item.interface';
import { UpdateScholarDto } from './dto/update-scholar.dto';
import { ResearchMacroAreaEntity } from './research-macro-area.entity';

@Injectable()
export class ScholarService {
    constructor(
        @InjectRepository(ScholarEntity)
        private readonly scholarRepository: Repository<ScholarEntity>,

        @InjectRepository(ResearchMacroAreaEntity)
        private readonly macroAreaRepository: Repository<ResearchMacroAreaEntity>,

        private readonly usersService: ServerUsersService
    ) {}

    // 1. RECUPERA TUTTI I RICERCATORI
    async findAllScholars(): Promise<ScholarListItem[]> {
        return this.scholarRepository.find({
        // Carichiamo l'utente base e l'array delle macro aree associate
        relations: ['user', 'research_macro_areas', 'research_projects'],
        // Opzionale: puoi ordinare i risultati per ID o per nome dell'utente
        order: {
            id: 'ASC'
        }
        });
    }

    // 2. RECUPERA UN SINGOLO RICERCATORE PER ID
    async findScholarById(id: number): Promise<ScholarListItem> {
        const scholar = await this.scholarRepository.findOne({
        where: { id },
        relations: ['user', 'research_macro_areas', 'research_projects']
        });

        // Se non lo trova, lanciamo un'eccezione standard di NestJS che si traduce in un 404 HTTP
        if (!scholar) {
        throw new NotFoundException(`Profilo ricercatore con ID ${id} non trovato.`);
        }

        return scholar;
    }

    async createScholar(userPayload: any, scholarPayload: CreateScholarDto): Promise<ScholarListItem> {
        // 1. Crei l'utente base assicurandoti che sia uno SCHOLAR
        const userToCreate = {
            ...userPayload,
            role: UserRole.SCHOLAR
        };
        const newUser = await this.usersService.create(userToCreate);

        // 2. Inizializziamo le macro aree se fornite
        let areas: ResearchMacroAreaEntity[] = [];
        if (scholarPayload.researchMacroAreaIds && scholarPayload.researchMacroAreaIds.length > 0) {
            areas = await this.macroAreaRepository.findBy({
                id: In(scholarPayload.researchMacroAreaIds)
            });
        }

        // 3. Crei l'istanza dello Scholar
        const scholar = this.scholarRepository.create({
            id: newUser.id,
            universityDepartment: scholarPayload.universityDepartment,
            user: newUser,
            research_macro_areas: areas
        });

        // 4. Salvi lo scholar
        await this.scholarRepository.save(scholar);

        // 5. Ritorna lo scholar completo
        return this.findScholarById(scholar.id);
    }

    async updateScholar(id: number, dto: UpdateScholarDto): Promise<ScholarListItem> {
        const scholar = await this.scholarRepository.findOne({
            where: { id },
            relations: ['user', 'research_macro_areas']
        });

        if (!scholar) throw new NotFoundException('Scholar non trovato');

        if (dto.universityDepartment !== undefined) {
            scholar.universityDepartment = dto.universityDepartment;
        }

        // Sfruttiamo l'array che ereditiamo dal CreateScholarDto!
        if (dto.researchMacroAreaIds !== undefined) {
            if (dto.researchMacroAreaIds.length > 0) {
            const newAreas = await this.macroAreaRepository.findBy({
                id: In(dto.researchMacroAreaIds)
            });
            scholar.research_macro_areas = newAreas;
            } else {
            scholar.research_macro_areas = [];
            }
        }

        return this.scholarRepository.save(scholar);
    }

    async delete(id: number): Promise<void> {
        // Verifichiamo prima che esista
        const scholar = await this.scholarRepository.findOne({ where: { id } });
        if (!scholar) {
            throw new NotFoundException(`Scholar con ID ${id} non trovato.`);
        }

        // Chiamiamo il delete degli utenti: il Cascade del DB farà pulizia totale da solo!
        await this.usersService.removeUser(id); 
    }
}



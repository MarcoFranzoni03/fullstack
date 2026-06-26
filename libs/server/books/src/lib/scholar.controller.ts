import { Controller, Get, UseGuards, Param, ParseIntPipe, Post, Body, ValidationPipe, Patch, Delete } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { ScholarService } from "./scholar.service"; // adatta il path del tuo service
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { ScholarListItem } from "./interfaces/scholar-list-item.interface"; // adatta il path
import { CreateScholarDto } from "./dto/create-scholar.dto";
import { UpdateScholarDto } from "./dto/update-scholar.dto";
import { ScholarOwnerOrAdminGuard } from '@server/security';

@ApiTags('Scholar APIs')
@Controller('scholar')
export class ScholarController {
    // Iniettiamo il servizio specifico degli Scholar
    constructor(private readonly scholarService: ScholarService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SCHOLAR)
    @ApiBearerAuth()
    findAll(): Promise<ScholarListItem[]> {
        return this.scholarService.findAllScholars();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SCHOLAR)
    @ApiBearerAuth()
    findOne(@Param('id', ParseIntPipe) id: number): Promise<ScholarListItem> {
        return this.scholarService.findScholarById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                // Per la creazione, il controller accetta i dati utente generici e i dati scholar specifici
                user: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Mario Rossi' },
                        email: { type: 'string', example: 'mario.rossi@unibs.it' },
                        password: { type: 'string', example: 'PasswordSicura123!' }
                    },
                    required: ['name', 'email', 'password']
                },
                scholar: {
                    type: 'object',
                    properties: {
                        universityDepartment: { type: 'string', example: 'Dipartimento di Ingegneria dell\'Informazione' },
                        researchMacroAreaIds: { 
                            type: 'array', 
                            items: { type: 'integer' }, 
                            example: [1, 2] 
                        }
                    }
                }
            },
            required: ['user', 'scholar']
        }
    })
    create(
        @Body('user') userPayload: any, 
        @Body('scholar', ValidationPipe) scholarDto: CreateScholarDto
    ): Promise<ScholarListItem> {
        return this.scholarService.createScholar(userPayload, scholarDto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard, ScholarOwnerOrAdminGuard)
    @Roles(UserRole.ADMIN, UserRole.SCHOLAR)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                universityDepartment: { type: 'string', example: 'Dipartimento di Filologia' },
                researchMacroAreaIds: { 
                    type: 'array', 
                    items: { type: 'integer' }, 
                    example: [3] 
                }
            }
        }
    })
    update(
        @Param('id', ParseIntPipe) id: number, 
        @Body(ValidationPipe) dto: UpdateScholarDto
    ): Promise<ScholarListItem> {
        return this.scholarService.updateScholar(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard, ScholarOwnerOrAdminGuard)
    @Roles(UserRole.ADMIN, UserRole.SCHOLAR)
    @ApiBearerAuth()
    delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        // Puoi scegliere se usare la cancellazione solo profilo o totale (qui usiamo solo profilo)
        return this.scholarService.delete(id);
    }
}
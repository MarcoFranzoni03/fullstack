import { 
    Controller, 
    Get, 
    UseGuards, 
    Param, 
    ParseIntPipe, 
    Post, 
    Body, 
    ValidationPipe, 
    Patch, 
    Delete, 
    Query 
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody, ApiQuery } from "@nestjs/swagger";
import { OrgBooksService } from "./books.service"; // adatta il path del tuo service
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { ResearchProjectListItem } from "./interfaces/research-project-list-item.interface"; // adatta il path
import { CreateResearchProjectDto } from "./dto/create-research-project.dto";
import { UpdateResearchProjectDto } from "./dto/update-research-project.dto";

@ApiTags('Research Project APIs')
@Controller('research-project')
export class ResearchProjectController {
    
    constructor(private readonly projectService: OrgBooksService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SCHOLAR)
    @ApiBearerAuth()
    @Get()
    // Swagger query params per documentare i filtri dinamici
    @ApiQuery({ name: 'title', required: false, type: String, description: 'Filtra per titolo parziale' })
    @ApiQuery({ name: 'acronym', required: false, type: String, description: 'Filtra per acronimo parziale' })
    @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filtra per anno di attività' })
    @ApiQuery({ name: 'scholarId', required: false, type: Number, description: 'Filtra per ID del ricercatore' })
    findAll(
        @Query('title') title?: string,
        @Query('acronym') acronym?: string,
        @Query('year') year?: string, // Arriva come stringa dalla query http, lo parsiamo sotto
        @Query('scholarId') scholarId?: string
    ): Promise<ResearchProjectListItem[]> {
        return this.projectService.findAllResearchProjects({
            title,
            acronym,
            year: year ? parseInt(year, 10) : undefined,
            scholarId: scholarId ? parseInt(scholarId, 10) : undefined
        });
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SCHOLAR)
    @ApiBearerAuth()
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<ResearchProjectListItem> {
        return this.projectService.findResearchProjectById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Solo l'admin può creare nuovi progetti
    @ApiBearerAuth()
    @Post()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Intelligenza Artificiale per la Salute' },
                acronym: { type: 'string', example: 'AI4HEALTH' },
                budget: { type: 'number', example: 150000.00 },
                startDate: { type: 'string', example: '2026-01-01' },
                endDate: { type: 'string', example: '2028-12-31' },
                scholarIds: { type: 'array', items: { type: 'integer' }, example: [1, 3] }
            },
            required: ['title', 'acronym', 'startDate', 'endDate', 'scholarIds']
        }
    })
    create(@Body(ValidationPipe) dto: CreateResearchProjectDto): Promise<ResearchProjectListItem> {
        return this.projectService.createResearchProject(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Solo l'admin può modificare i progetti
    @ApiBearerAuth()
    @Patch(':id')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'IA applicata alla diagnostica medica' },
                budget: { type: 'number', example: 180000.00 },
                scholarIds: { type: 'array', items: { type: 'integer' }, example: [1, 3, 5] }
            }
        }
    })
    update(
        @Param('id', ParseIntPipe) id: number, 
        @Body(ValidationPipe) dto: UpdateResearchProjectDto
    ): Promise<ResearchProjectListItem> {
        return this.projectService.updateResearchProject(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Solo l'admin può eliminare i progetti
    @ApiBearerAuth()
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.projectService.deleteResearchProject(id);
    }
}
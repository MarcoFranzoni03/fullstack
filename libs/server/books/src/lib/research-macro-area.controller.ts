import { Controller, Get, UseGuards, Param, ParseIntPipe, Post, Body, ValidationPipe, Patch, Delete } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { OrgBooksService } from "./books.service"; // adatta il path del tuo service
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { ResearchMacroAreaListItem } from "./interfaces/research-macro-area-list-item.interface"; // adatta il path
import { CreateResearchMacroAreaDto } from "./dto/create-research-macro-area.dto";
import { UpdateResearchMacroAreaDto } from "./dto/update-research-macro-area.dto";

@ApiTags('Research Macro Area APIs')
@Controller('research-macro-area')
export class ResearchMacroAreaController {
    
    constructor(private readonly macroAreaService: OrgBooksService) {}

    @UseGuards(JwtAuthGuard, RolesGuard) // Applichiamo le guardie a tutto il controller per sicurezza
    @Roles(UserRole.ADMIN, UserRole.SCHOLAR) // Blindiamo l'intero controller: SOLO gli admin possono entrare
    @ApiBearerAuth()
    @Get()
    findAll(): Promise<ResearchMacroAreaListItem[]> {
        return this.macroAreaService.findAllResearchMacroAreas();
    }

    @UseGuards(JwtAuthGuard, RolesGuard) // Applichiamo le guardie a tutto il controller per sicurezza
    @Roles(UserRole.ADMIN, UserRole.SCHOLAR) // Blindiamo l'intero controller: SOLO gli admin possono entrare
    @ApiBearerAuth()
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<ResearchMacroAreaListItem> {
        return this.macroAreaService.findResearchMacroAreaById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard) // Applichiamo le guardie a tutto il controller per sicurezza
    @Roles(UserRole.ADMIN) // Blindiamo l'intero controller: SOLO gli admin possono entrare
    @ApiBearerAuth()
    @Post()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Crittografia Avanzata' }
            },
            required: ['name']
        }
    })
    create(@Body(ValidationPipe) dto: CreateResearchMacroAreaDto): Promise<ResearchMacroAreaListItem> {
        return this.macroAreaService.createResearchMacroArea(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard) // Applichiamo le guardie a tutto il controller per sicurezza
    @Roles(UserRole.ADMIN) // Blindiamo l'intero controller: SOLO gli admin possono entrare
    @ApiBearerAuth()
    @Patch(':id')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Fisica Quantistica Applicata' }
            }
        }
    })
    update(
        @Param('id', ParseIntPipe) id: number, 
        @Body(ValidationPipe) dto: UpdateResearchMacroAreaDto
    ): Promise<ResearchMacroAreaListItem> {
        return this.macroAreaService.updateResearchMacroArea(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard) // Applichiamo le guardie a tutto il controller per sicurezza
    @Roles(UserRole.ADMIN) // Blindiamo l'intero controller: SOLO gli admin possono entrare
    @ApiBearerAuth()
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.macroAreaService.deleteResearchMacroArea(id);
    }
}
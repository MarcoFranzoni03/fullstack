import { Controller, Get, UseGuards, ParseIntPipe, Param, Post, Body, ValidationPipe, Patch, Delete } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { OrgBooksService } from "./books.service";
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { AuthorListItem } from "./interfaces/author-list-item.interface";
import { CreateAuthorDto } from "./dto/create-author.dto";
import { UpdateAuthorDto } from "./dto/update-author.dto";

@ApiTags('Library APIs')
@Controller('authors')
export class AuthorController {
    constructor(private orgBooksService: OrgBooksService) {}

    @Get()
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    findAll(): Promise<AuthorListItem[]> {
        return this.orgBooksService.findAllAuthors();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    findOne(@Param('id', ParseIntPipe) id:number): Promise<AuthorListItem> {
        return this.orgBooksService.findAuthorById(id);
    }
    
    @Post()
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                firstName: { type: 'string', example: 'Alessandro' },
                lastName: { type: 'string', example: 'Manzoni' },
                address: {
                    type: 'object',
                    properties: {
                        street: { type: 'string', example: 'Via Morone 1' },
                        city: { type: 'string', example: 'Milano' },
                        zipCode: { type: 'string', example: '20121' },
                        country: { type: 'string', example: 'Italia' },
                    },
                    required: ['street', 'city', 'zipCode', 'country'],
                },
            },
            required: ['firstName', 'lastName'],
        },
    })
    create(@Body(ValidationPipe) dto:CreateAuthorDto): Promise<AuthorListItem> {
        return this.orgBooksService.createAuthor(dto);
    }
    
    @Patch(':id')
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                firstName: { type: 'string', example: 'Alessandro' },
                lastName: { type: 'string', example: 'Manzoni' },
                address: {
                    type: 'object',
                    properties: {
                        street: { type: 'string', example: 'Via Morone 1' },
                        city: { type: 'string', example: 'Milano' },
                        zipCode: { type: 'string', example: '20121' },
                        country: { type: 'string', example: 'Italia' },
                    },
                },
            },
        },
    })
    update(@Param('id',ParseIntPipe) id: number,@Body(ValidationPipe) dto: UpdateAuthorDto): Promise<AuthorListItem> {
        return this.orgBooksService.updateAuthor(id,dto);
    }
    
    @Delete(':id')
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    delete(@Param('id',ParseIntPipe) id: number): Promise<void> {
        return this.orgBooksService.deleteAuthor(id);
    }
}
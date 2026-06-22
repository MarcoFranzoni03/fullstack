import { Controller, Get, UseGuards, Param, ParseIntPipe, Post, Body, ValidationPipe, Patch, Delete } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { OrgBooksService } from "./books.service";
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { CategoryListItem } from "./interfaces/category-list-item.interface";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiTags('Library APIs')
@Controller('categories')
export class CategoryController {
    constructor(private orgBooksService: OrgBooksService) {}

    @Get()
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    findAll(): Promise<CategoryListItem[]> {
        return this.orgBooksService.findAllCategories();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.orgBooksService.findCategoryById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Fantascienza' },
            },
            required: ['name'],
        },
    })
    create(@Body(ValidationPipe) dto: CreateCategoryDto) {
        return this.orgBooksService.createCategory(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Romanzo storico' },
            },
        },
    })
    update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) dto: UpdateCategoryDto) {
        return this.orgBooksService.updateCategory(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.orgBooksService.deleteCategory(id);
    }
}
import { Controller, Get, ParseIntPipe, Post, UseGuards, Param, Body, ValidationPipe, Patch, Delete } from '@nestjs/common';
import { OrgBooksService } from './books.service';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@server/security';
import { UserRole } from '@server/users';
import { BookListItem } from './interfaces/book-list-item.interface';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@ApiTags('Library APIs')
@Controller('books')
export class OrgBooksController {
  constructor(private orgBooksService: OrgBooksService) {}

  @Post('populate')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  populateDB() {
    return this.orgBooksService.seed();
  }

  @Get()
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAll(): Promise<BookListItem[]> {
    return this.orgBooksService.findAllBooks();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id:number): Promise<BookListItem> {
    return this.orgBooksService.findBookById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiBody({
          schema: {
              type: 'object',
              properties: {
                  title: { type: 'string', example: 'I Promessi Sposi' },
                  publishedYear: { type: 'integer', example: 1827 },
                  categoryId: {type: 'integer', example: '1'},
                  authorIds: { type: 'array', items: {type: 'integer'}, example: [1,2]}
              },
              required: ['title', 'publishedYear', 'categoryId', 'authorIds'],
          },
      })
  create(@Body(ValidationPipe) dto:CreateBookDto): Promise<BookListItem> {
    return this.orgBooksService.createBook(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiBody({
          schema: {
              type: 'object',
              properties: {
                  title: { type: 'string', example: 'I Promessi Sposi' },
                  publishedYear: { type: 'integer', example: 1827 },
                  categoryId: {type: 'integer', example: '1'},
                  authorIds: { type: 'array', items: {type: 'integer'}, example: [1,2]}
              },
          },
      })
  update(@Param('id',ParseIntPipe) id: number,@Body(ValidationPipe) dto: UpdateBookDto): Promise<BookListItem> {
    return this.orgBooksService.updateBook(id,dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  delete(@Param('id',ParseIntPipe) id: number): Promise<void> {
    return this.orgBooksService.deleteBook(id);
  }
}



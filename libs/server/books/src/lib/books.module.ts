import { Module } from '@nestjs/common';
import { OrgBooksController } from './books.controller';
import { CategoryController } from './category.controller';
import { OrgBooksService } from './books.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './address.entity';
import { Author } from './author.entity';
import { Book } from './book.entity';
import { Category } from './category.entity';
import { AuthorController } from './author.controller';
import { ReviewEntity } from './review.entity';
import { ReviewController } from './review.controller';
import { ScholarController } from './scholar.controller';
import { ResearchMacroAreaController } from './research-macro-area.controller';
import { ScholarService } from './scholar.service';
import { ScholarEntity } from './scholar.entity';
import { ResearchMacroAreaEntity } from './research-macro-area.entity';
import { ServerUsersModule } from '@server/users';
import { ResearchProjectController } from './research-project.controller';
import { ResearchProjectEntity } from './research-project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Address,
      Author,
      Book,
      Category,
      ReviewEntity,
      ScholarEntity,
      ResearchMacroAreaEntity,
      ResearchProjectEntity
    ]),
    ServerUsersModule,
  ],
  controllers: [
    OrgBooksController,
    CategoryController,
    AuthorController,
    ReviewController,
    ScholarController,
    ResearchMacroAreaController,
    ResearchProjectController,
  ],
  providers: [OrgBooksService, ScholarService],
  exports: [OrgBooksService],
})
export class OrgBooksModule {}

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

@Module({
  imports: [TypeOrmModule.forFeature([Address,Author,Book,Category,ReviewEntity])],
  controllers: [OrgBooksController,CategoryController,AuthorController,ReviewController],
  providers: [OrgBooksService],
  exports: [OrgBooksService],
})
export class OrgBooksModule {}

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { CurrentUser, JwtAuthGuard } from "@server/security";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UserEntity } from "@server/users";
import { OrgBooksService } from "./books.service";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";

@ApiTags('Reviews APIs')
@Controller('reviews')
export class ReviewController {
    constructor(private orgBooksService: OrgBooksService) {}

    @Get('book/:bookId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    findOne(@Param('bookId', ParseIntPipe) id: number) {
        return this.orgBooksService.findReviewsByBookId(id);
    }

    // 1. Modificato l'URL in ':bookId' e aggiunto ParseIntPipe
    @Post(':bookId')
    @UseGuards(JwtAuthGuard) 
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                rating: { 
                    type: 'integer', 
                    minimum: 1, 
                    maximum: 5, 
                    example: 5, 
                    description: 'Il voto del libro da 1 a 5' 
                },
                comment: { 
                    type: 'string', 
                    example: 'Un libro assolutamente fantastico, consigliatissimo!', 
                    maxLength: 255,
                    description: 'Il testo della recensione' 
                }
            },
            required: ['rating', 'comment'],
        },
    })
    async createReview(
        @Param('bookId', ParseIntPipe) bookId: number,
        @Body(ValidationPipe) dto: CreateReviewDto, 
        @CurrentUser() user: UserEntity 
    ) {
        return this.orgBooksService.createReview(bookId, user, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    delete(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: UserEntity 
    ): Promise<void> {
        return this.orgBooksService.deleteReview(id, user);
    }
}

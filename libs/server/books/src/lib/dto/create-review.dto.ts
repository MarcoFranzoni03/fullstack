import { IsInt, IsNotEmpty, IsPositive, IsString, Length, Max, Min } from "class-validator";

export class CreateReviewDto {

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number

    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    comment: string

}

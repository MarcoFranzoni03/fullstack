import { IsInt, IsNotEmpty, IsString, Min, Max, IsPositive, IsArray, ArrayNotEmpty } from "class-validator";

export class CreateBookDto {
    @IsString()
    @IsNotEmpty()  
    title: string;
  
    @IsInt()
    @Min(1453)
    @Max(new Date().getFullYear())
    publishedYear: number;

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    categoryId: number;
    
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({each: true})
    @IsPositive({each: true})
    authorIds: number[];
}
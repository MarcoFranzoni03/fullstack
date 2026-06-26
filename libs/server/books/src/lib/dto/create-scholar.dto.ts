import { IsOptional, IsString, MaxLength, IsArray, IsInt } from 'class-validator';

export class CreateScholarDto {
  
  @IsInt({ message: "L'ID utente deve essere un numero intero." })
  @IsOptional()
  userId?: number;

  @IsString({ message: "Il dipartimento deve essere una stringa." })
  @IsOptional() 
  @MaxLength(255, { message: "Il nome del dipartimento non può superare i 255 caratteri." })
  universityDepartment?: string;

  @IsArray({ message: "Le macro aree devono essere un array di ID." })
  @IsOptional()
  @IsInt({ each: true, message: "Ogni ID della macro area deve essere un numero intero." })
  researchMacroAreaIds?: number[];
  
}

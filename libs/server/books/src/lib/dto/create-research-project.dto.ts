import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsDateString, 
  IsArray, 
  ArrayMinSize, 
  IsInt,
  Min
} from 'class-validator';

export class CreateResearchProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Il titolo del progetto è obbligatorio.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: "L'acronimo del progetto è obbligatorio." })
  acronym: string;

  @IsNumber({}, { message: 'Il budget deve essere un valore numerico.' })
  @Min(0, { message: 'Il budget non può essere negativo.' })
  @IsOptional()
  budget?: number;

  @IsDateString({}, { message: 'La data di inizio deve essere una stringa di data valida (ISO 8601).' })
  @IsNotEmpty()
  startDate: string;

  @IsDateString({}, { message: 'La data di fine deve essere una stringa di data valida (ISO 8601).' })
  @IsNotEmpty()
  endDate: string;

  @IsArray({ message: 'I ricercatori associati devono essere forniti come elenco (array).' })
  @ArrayMinSize(1, { message: 'Il progetto deve essere assegnato ad almeno un ricercatore.' })
  @IsInt({ each: true, message: 'Ogni ID ricercatore deve essere un numero intero.' })
  scholarIds: number[];
}
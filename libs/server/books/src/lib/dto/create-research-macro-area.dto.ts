import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateResearchMacroAreaDto {
  @IsString({ message: 'Il nome dell\'area deve essere una stringa.' })
  @IsNotEmpty({ message: 'Il nome dell\'area è obbligatorio.' })
  @MaxLength(255, { message: 'Il nome dell\'area non può superare i 255 caratteri.' })
  name: string;
}

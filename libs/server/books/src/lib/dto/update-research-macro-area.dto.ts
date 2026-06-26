import { CreateResearchMacroAreaDto } from "./create-research-macro-area.dto";
import { PartialType } from '@nestjs/mapped-types';

export class UpdateResearchMacroAreaDto extends PartialType(CreateResearchMacroAreaDto) {}

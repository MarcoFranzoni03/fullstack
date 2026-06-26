import { CreateScholarDto } from "./create-scholar.dto";
import { PartialType } from '@nestjs/mapped-types';

export class UpdateScholarDto extends PartialType(CreateScholarDto) {}

import { IsNotEmpty, IsOptional, IsString, Matches, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';

class AddressDto {
    @IsString()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    zipCode: string;

    @IsString()
    @IsNotEmpty()
    country: string;
}

export class CreateAuthorDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[^\d]+$/, {
        message: 'firstName must not contain digits',
    })
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[^\d]+$/, {
        message: 'lastName must not contain digits',
    })
    lastName: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    address?: AddressDto;
}
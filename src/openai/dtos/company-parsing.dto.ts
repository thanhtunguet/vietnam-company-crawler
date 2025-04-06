import { ApiProperty } from '@nestjs/swagger';

export class CompanyParsingDto {
  @ApiProperty({
    type: String,
  })
  link: string;
}

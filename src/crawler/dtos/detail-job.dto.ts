import { ApiProperty } from '@nestjs/swagger';

export class DetailJobDto {
  @ApiProperty({
    type: 'string',
  })
  companyUrl: string;
}

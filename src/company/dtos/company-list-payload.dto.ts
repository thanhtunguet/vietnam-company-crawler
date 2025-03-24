import { ApiProperty } from '@nestjs/swagger';
import { QueryDto } from 'src/_dtos/query.dto';

export class CompanyListPayloadDto extends QueryDto {
  @ApiProperty({
    type: 'number',
    required: false,
  })
  public provinceId?: number;
}

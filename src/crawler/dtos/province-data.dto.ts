import { ApiProperty } from '@nestjs/swagger';

export class ProvinceData {
  @ApiProperty({
    type: Number,
  })
  name: string;

  @ApiProperty({
    type: Number,
  })
  link: string;

  @ApiProperty({
    type: Number,
  })
  numberOfPages: number;

  @ApiProperty({
    type: Number,
  })
  totalCompanies: number;
}

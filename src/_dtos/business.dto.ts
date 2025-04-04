import { ApiProperty } from '@nestjs/swagger';

export class BusinessDto {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
  })
  code: string;

  @ApiProperty({
    type: String,
  })
  name: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class HttpErrorDto {
  @ApiProperty({
    type: String,
  })
  message: string;

  @ApiProperty({
    type: String,
  })
  status: string;

  @ApiProperty({
    type: String,
  })
  code: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class ParseAddressDto {
  @ApiProperty({
    type: String,
  })
  public address: string;
}

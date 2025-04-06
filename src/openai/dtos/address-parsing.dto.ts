import { ApiProperty } from '@nestjs/swagger';

export class AddressParsingDto {
  /**
   * The address to be parsed
   */
  @ApiProperty({
    type: String,
    description: 'The address to be parsed',
  })
  address: string;
}

export class AddressParsingResponseDto {
  /**
   * The parsed address
   */
  @ApiProperty({
    type: String,
    description: 'The parsed province name',
  })
  province: string;

  /**
   * The parsed district name
   */
  @ApiProperty({
    type: String,
    description: 'The parsed district name',
  })
  district: string;

  /**
   * The parsed ward name
   */
  @ApiProperty({
    type: String,
    description: 'The parsed ward name',
  })
  ward: string;

  /**
   * The full address
   */
  @ApiProperty({
    type: String,
    description: 'The full address',
  })
  address: string;
}

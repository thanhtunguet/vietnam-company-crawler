import { ApiProperty } from '@nestjs/swagger';

export class DetailedAddressDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  public province?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  public provinceId?: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  public district?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  public districtId?: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  public ward?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  public wardId?: number;

  @ApiProperty({
    type: String,
  })
  public address?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Province } from 'src/_entities';

export class ProvinceDto implements Partial<Province> {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  code: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  deletedAt: Date;

  @ApiProperty({ type: String })
  englishName: string;

  @ApiProperty({ type: String })
  slug: string;
}

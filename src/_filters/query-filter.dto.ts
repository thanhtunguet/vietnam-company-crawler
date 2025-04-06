import { ApiProperty } from '@nestjs/swagger';

export class QueryFilterDto {
  @ApiProperty({
    description: 'Number of records to skip',
    default: 0,
    required: false,
  })
  public skip?: number = 0;

  @ApiProperty({
    description: 'Number of records to take',
    default: 10,
    required: false,
  })
  public take?: number = 10;

  @ApiProperty({
    description: 'Search term for filtering records',
    default: '',
    required: false,
  })
  public search?: string;

  @ApiProperty({
    description: 'Field to sort by',
    default: '',
    required: false,
  })
  public orderBy?: string;

  @ApiProperty({
    description: 'Sort order, either ASC or DESC',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
    required: false,
  })
  public order?: 'ASC' | 'DESC';
}

import { IsOptional, IsString } from 'class-validator';
import { QueryFilterDto } from '../../common/dto/query-filter.dto';

export class SearchBusinessDto extends QueryFilterDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

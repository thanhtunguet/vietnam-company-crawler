import { ApiProperty } from '@nestjs/swagger';

export class CrawlerTriggerResponseDto {
  @ApiProperty({
    type: String,
  })
  public message?: string;

  @ApiProperty({
    type: String,
  })
  public jobId?: number;

  type?: string;

  status?: string;

  progress?: number;

  startedAt?: Date | null;

  finishedAt?: Date | null;

  log?: string | null;
}

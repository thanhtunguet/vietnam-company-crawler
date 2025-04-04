import { ApiProperty } from '@nestjs/swagger';
import { Model } from 'openai/resources';

export class OpenAiModelDto implements Model {
  @ApiProperty({
    type: String,
    description: 'The ID of the model',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'The owner of the model',
  })
  created: number;

  @ApiProperty({
    type: String,
    description: 'The type of the model',
  })
  object: 'model';

  @ApiProperty({
    type: String,
    description: 'The owner of the model',
  })
  owned_by: string;
}

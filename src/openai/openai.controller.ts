import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DetailedAddressDto } from './dtos/detailed_address.dto';
import { OpenAiModelDto } from './dtos/openai_model.dto';
import { OpenaiService } from './openai.service';

@ApiTags('OpenAI')
@Controller('/api/openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Get('/models')
  @ApiResponse({
    status: 200,
    description: 'List of available models',
    type: [OpenAiModelDto],
  })
  public async listModels(): Promise<OpenAiModelDto[]> {
    return this.openaiService.listModels();
  }

  @Post('/parse-address')
  @ApiBody({
    description: 'Address to parse',
    type: DetailedAddressDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Parsed address',
    type: DetailedAddressDto,
  })
  public async parseAddress(@Body('address') address: string): Promise<{
    province?: string;
    district?: string;
    ward?: string;
    address?: string;
  }> {
    try {
      return this.openaiService.parseAddress(address);
    } catch (error) {
      console.error(error);
      return {};
    }
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import axios from 'axios';
import { load } from 'cheerio';
import {
  AddressParsingDto,
  AddressParsingResponseDto,
} from './dtos/address-parsing.dto';
import { CompanyParsingDto } from './dtos/company-parsing.dto';
import { OpenaiService } from './openai.service';

@ApiTags('OpenAI')
@Controller('/api/openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('/test-parsing-company')
  @ApiBody({
    description: 'Link to the company page',
    type: CompanyParsingDto,
  })
  public async testParsingCompany(@Body('link') link: string): Promise<string> {
    const html = await axios.get(link).then((response) => response.data);
    const $ = load(html);
    const text = $('.m-panel').text().trim();
    return this.openaiService.parseCompany(text);
  }

  @Post('/test-parsing-address')
  @ApiBody({
    description: 'Address to parse',
    type: AddressParsingDto,
  })
  @ApiResponse({
    type: AddressParsingResponseDto,
  })
  public async testParsingAddress(
    @Body('address') address: string,
  ): Promise<any> {
    return this.openaiService.parseAddress(address);
  }
}

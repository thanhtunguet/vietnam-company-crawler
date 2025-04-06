import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/_types/EnvironmentVariables';
import { OpenAI } from 'openai';
import companyPrompt from './prompts/company.md';
import addressPrompt from './prompts/address.md';
import HandleBars from 'handlebars';
import addressSchema from './schemas/address.json';
import companySchema from './schemas/company.json';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.openai = new OpenAI({
      baseURL: configService.get<string>('OPENAI_BASE_URL'),
      apiKey: configService.get<string>('OPENAI_API_KEY'),
      maxRetries: 3,
    });

    console.log(companySchema);
  }

  public async parseAddress(address: string) {
    const prompt = HandleBars.compile(addressPrompt)({
      address,
    });
    const response = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'address',
          schema: addressSchema,
        },
      },
      model: this.configService.get<string>('OPENAI_MODEL'),
      temperature: 0,
      max_tokens: 2048,
      presence_penalty: 0,
      frequency_penalty: 0,
      top_p: 1,
      stop: ['}'],
    });

    return response.choices[0].message.content;
  }

  public async parseCompany(text: string) {
    const prompt = HandleBars.compile(companyPrompt)({
      text,
    });
    const response = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'company',
          schema: companySchema,
        },
      },
      model: this.configService.get<string>('OPENAI_MODEL'),
      temperature: 0,
    });

    return response.choices[0].message.content;
  }
}

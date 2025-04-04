import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Handlebars from 'handlebars';
import { OpenAI } from 'openai';
import { Model } from 'openai/resources/models';
import { District, Province, Ward } from 'src/_entities';
import { vietnameseSlugify } from 'src/_helpers/slugify';
import { Repository } from 'typeorm';
import { DetailedAddressDto } from './dtos/detailed_address.dto';
import adderssParsingPrompt from './prompts/address_parsing_prompt.md';
import addressParsingSystemPrompt from './prompts/address_parsing_system_prompt.md';

@Injectable()
export class OpenaiService implements OnModuleInit {
  private get openaiConfig() {
    return {
      baseUrl: this.configService.get<string>('OPENAI_BASE_URL'),
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      model: this.configService.get<string>('OPENAI_MODEL'),
    };
  }

  private provinces: Province[] = [];

  async onModuleInit() {
    this.provinces = await this.provinceRepository.find({
      relations: ['districts', 'districts.wards'],
    });

    console.log('Administrative addresses loaded');
  }

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
  ) {}

  public async listModels(): Promise<Model[]> {
    const openai = new OpenAI(this.openaiConfig);

    const response = await openai.models.list();

    return response.data;
  }

  private createOpenAIClient() {
    const openai = new OpenAI(this.openaiConfig);
    return openai;
  }

  private compilePrompt(template: string, args?: Record<string, any>) {
    return Handlebars.compile(template)(args ?? {});
  }

  public async parseAddress(address: string): Promise<DetailedAddressDto> {
    const openai = this.createOpenAIClient();

    const prompt = this.compilePrompt(adderssParsingPrompt, {
      address,
    });

    const response = await openai.chat.completions.create({
      model: this.openaiConfig.model,
      messages: [
        { role: 'system', content: addressParsingSystemPrompt },
        { role: 'user', content: prompt },
        // { role: 'user', content: `${addressParsingSystemPrompt}\n${prompt}` },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'parsed_address',
          description: 'Parsed address',
          schema: {
            type: 'object',
            properties: {
              province: { type: 'string' },
              district: { type: 'string' },
              ward: { type: 'string' },
              address: { type: 'string' },
            },
          },
        },
      },
    });

    const detailedAddress = JSON.parse(
      response.choices[0].message.content,
    ) as DetailedAddressDto;
    const provinceSlug = vietnameseSlugify(
      detailedAddress.province?.replace(/Tỉnh|Thành phố|TP\./i, '').trim(),
    );
    const districtSlug = vietnameseSlugify(
      detailedAddress.district?.replace(/Quận|Huyện|Thị Xã/i, '').trim(),
    );
    const wardSlug = vietnameseSlugify(
      detailedAddress.ward?.replace(/Xã|Phường|Thị Trấn/i, '').trim(),
    );
    const province = this.provinces.find((province) =>
      province.slug.includes(provinceSlug),
    );
    if (province) {
      detailedAddress.provinceId = province.id;
      const district = province.districts.find((district) =>
        district.slug.includes(districtSlug),
      );
      if (district) {
        detailedAddress.districtId = district.id;
        const ward = district.wards.find((ward) =>
          ward.slug.includes(wardSlug),
        );
        if (ward) {
          detailedAddress.wardId = ward.id;
        }
      }
    }
    return detailedAddress;
  }
}

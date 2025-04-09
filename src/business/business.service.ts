import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from 'src/_entities';
import { Repository } from 'typeorm';
import { CreateBusinessDto } from './dto/create-business.dto';
import { SearchBusinessDto } from './dto/search-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    const business = this.businessRepository.create(createBusinessDto);
    return this.businessRepository.save(business);
  }

  async findAll(): Promise<Business[]> {
    return this.businessRepository.find();
  }

  async search(searchDto: SearchBusinessDto): Promise<[Business[], number]> {
    const { skip, take, code, name } = searchDto;

    const queryBuilder = this.businessRepository.createQueryBuilder('business');

    if (code) {
      queryBuilder.andWhere('business.code LIKE :code', { code: `%${code}%` });
    }

    if (name) {
      queryBuilder.andWhere('business.name LIKE :name', { name: `%${name}%` });
    }

    return queryBuilder.skip(skip).take(take).getManyAndCount();
  }

  async findOne(id: number): Promise<Business> {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }
    return business;
  }

  async update(
    id: number,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    const business = await this.findOne(id);
    this.businessRepository.merge(business, updateBusinessDto);
    return this.businessRepository.save(business);
  }

  async remove(id: number): Promise<void> {
    const business = await this.findOne(id);
    await this.businessRepository.remove(business);
  }
}

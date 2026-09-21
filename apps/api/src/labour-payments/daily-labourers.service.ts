import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateDailyLabourerInput } from '@azentisfieldos/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DailyLabourersService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateDailyLabourerInput) {
    return this.prisma.dailyLabourer.create({ data: input });
  }

  list() {
    return this.prisma.dailyLabourer.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const labourer = await this.prisma.dailyLabourer.findUnique({
      where: { id },
    });
    if (!labourer) {
      throw new NotFoundException(`Labourer ${id} not found`);
    }
    return labourer;
  }
}

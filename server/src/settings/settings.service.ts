import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async findByKey(key: string) {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting "${key}" không tồn tại`);
    }

    return setting;
  }

  async getValueByKey(key: string, defaultValue: string = ''): Promise<string> {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key },
    });

    return setting?.value || defaultValue;
  }

  async upsert(key: string, value: string, description?: string) {
    return this.prisma.siteSetting.upsert({
      where: { key },
      update: { value, ...(description && { description }) },
      create: { key, value, description },
    });
  }

  async upsertMany(settings: Array<{ key: string; value: string; description?: string }>) {
    const results = await Promise.all(
      settings.map((s) => this.upsert(s.key, s.value, s.description)),
    );
    return results;
  }

  async remove(key: string) {
    await this.findByKey(key);
    return this.prisma.siteSetting.delete({ where: { key } });
  }
}

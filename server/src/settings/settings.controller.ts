import {
  Controller, Get, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /** Public: get all settings */
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  /** Public: get setting by key */
  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  /** Admin: upsert a setting */
  @UseGuards(JwtAuthGuard)
  @Put(':key')
  upsert(
    @Param('key') key: string,
    @Body() body: { value: string; description?: string },
  ) {
    return this.settingsService.upsert(key, body.value, body.description);
  }

  /** Admin: bulk upsert settings */
  @UseGuards(JwtAuthGuard)
  @Put()
  upsertMany(
    @Body() body: Array<{ key: string; value: string; description?: string }>,
  ) {
    return this.settingsService.upsertMany(body);
  }

  /** Admin: delete setting */
  @UseGuards(JwtAuthGuard)
  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.settingsService.remove(key);
  }
}

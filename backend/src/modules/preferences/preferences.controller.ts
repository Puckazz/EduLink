import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PreferencesService } from './preferences.service';
import { UpsertPreferencesDto } from './dto/upsert-preference.dto';

@ApiTags('Preferences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me/preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  /**
   * GET /me/preferences
   * Lấy tất cả preferences của người dùng hiện tại
   */
  @ApiOperation({ summary: 'Lấy tất cả preferences của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Object key-value preferences.' })
  @Get()
  getPreferences(@Request() req: { user: { userId: number; role: string } }) {
    return this.preferencesService.getPreferences(
      req.user.role,
      req.user.userId,
    );
  }

  /**
   * PATCH /me/preferences
   * Upsert nhiều preferences cùng lúc
   */
  @ApiOperation({ summary: 'Cập nhật preferences của người dùng hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Object key-value preferences sau khi cập nhật.',
  })
  @Patch()
  upsertPreferences(
    @Request() req: { user: { userId: number; role: string } },
    @Body() dto: UpsertPreferencesDto,
  ) {
    return this.preferencesService.upsertPreferences(
      req.user.role,
      req.user.userId,
      dto,
    );
  }
}

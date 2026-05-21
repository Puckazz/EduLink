import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('FAQ')
@ApiBearerAuth()
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  // ── [Authenticated] Lấy danh sách FAQ active ────────────────────────────────
  @ApiOperation({
    summary: '[All] Lấy danh sách câu hỏi thường gặp đang hiển thị',
  })
  @ApiResponse({ status: 200, description: 'Danh sách FAQ active.' })
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAllPublic() {
    return this.faqService.findAllPublic();
  }

  // ── [Admin] Lấy tất cả FAQ (kể cả inactive) ────────────────────────────────
  @ApiOperation({ summary: '[Admin] Lấy toàn bộ FAQ để quản lý' })
  @ApiResponse({ status: 200, description: 'Danh sách tất cả FAQ.' })
  @SkipThrottle()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin')
  findAll() {
    return this.faqService.findAll();
  }

  // ── [Admin] Tạo FAQ mới ─────────────────────────────────────────────────────
  @ApiOperation({ summary: '[Admin] Tạo câu hỏi thường gặp mới' })
  @ApiResponse({ status: 201, description: 'FAQ đã được tạo.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateFaqDto) {
    return this.faqService.create(dto);
  }

  // ── [Admin] Cập nhật FAQ ────────────────────────────────────────────────────
  @ApiOperation({ summary: '[Admin] Cập nhật nội dung FAQ' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'FAQ đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy FAQ.' })
  @SkipThrottle()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFaqDto) {
    return this.faqService.update(id, dto);
  }

  // ── [Admin] Xóa FAQ ─────────────────────────────────────────────────────────
  @ApiOperation({ summary: '[Admin] Xóa câu hỏi thường gặp' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Đã xóa.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy.' })
  @SkipThrottle()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.faqService.remove(id);
  }
}

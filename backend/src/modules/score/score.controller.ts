import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ScoreService } from './score.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { ScoreListQueryDto } from './dto/score-list-query.dto';
import {
  BulkPublishDto,
  BulkUpdateScoreDto,
  ScorebookQueryDto,
} from './dto/scorebook.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Scores')
@ApiBearerAuth()
@Controller()
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  // ─── SCOREBOOK (Admin UI main table) ──────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Lấy bảng điểm theo lớp/ngành/môn/kỳ' })
  @ApiResponse({ status: 200, description: 'Danh sách sinh viên kèm điểm.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('scores/scorebook')
  getScorebook(@Query() query: ScorebookQueryDto) {
    return this.scoreService.getScorebook(query);
  }

  // ─── BULK OPERATIONS ─────────────────────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Bulk cập nhật điểm (import Excel)' })
  @ApiBody({ type: BulkUpdateScoreDto })
  @ApiResponse({ status: 200, description: 'Số bản ghi đã cập nhật.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('scores/bulk-update')
  bulkUpdate(
    @Body() dto: BulkUpdateScoreDto,
    @Request() req: { user: { full_name?: string; username?: string } },
  ) {
    const actorName = dto.actor ?? req.user?.full_name ?? req.user?.username ?? 'Admin';
    return this.scoreService.bulkUpdate(dto, actorName);
  }

  @ApiOperation({ summary: '[Admin] Công bố / hủy công bố điểm hàng loạt' })
  @ApiBody({ type: BulkPublishDto })
  @ApiResponse({ status: 200, description: 'Số bản ghi đã cập nhật trạng thái.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('scores/bulk-publish')
  bulkPublish(
    @Body() dto: BulkPublishDto,
    @Request() req: { user: { full_name?: string; username?: string } },
  ) {
    const actorName = dto.actor ?? req.user?.full_name ?? req.user?.username ?? 'Admin';
    return this.scoreService.bulkPublish(dto, actorName);
  }

  // ─── AUDIT LOGS ───────────────────────────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Lấy nhật ký chỉnh sửa điểm' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách log.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('scores/logs')
  getLogs(@Query('limit') limit?: string) {
    return this.scoreService.getLogs(limit ? Number(limit) : 50);
  }

  // ─── STUDENT SCORES ───────────────────────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Tạo điểm cho sinh viên' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiBody({ type: CreateScoreDto })
  @ApiResponse({ status: 201, description: 'Điểm đã được tạo.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('students/:id/scores')
  createForStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() createScoreDto: CreateScoreDto,
  ) {
    return this.scoreService.createForStudent(id, createScoreDto);
  }

  @ApiOperation({ summary: '[Admin] Lấy danh sách điểm của sinh viên' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiResponse({ status: 200, description: 'Danh sách điểm.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('students/:id/scores')
  findByStudent(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ScoreListQueryDto,
  ) {
    return this.scoreService.findByStudent(id, query);
  }

  // ─── PARENT SCORES ────────────────────────────────────────────────────────

  @ApiOperation({ summary: '[Parent] Xem điểm sinh viên (phụ huynh)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID của sinh viên' })
  @ApiResponse({ status: 200, description: 'Danh sách điểm của sinh viên.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @Roles('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me/students/:id/scores')
  findByStudentForParent(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ScoreListQueryDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.scoreService.findByStudentForParent(id, req.user.userId, query);
  }

  // ─── SCORE CRUD ───────────────────────────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Lấy chi tiết một bản ghi điểm' })
  @ApiParam({ name: 'id', type: Number, description: 'ID bản ghi điểm' })
  @ApiResponse({ status: 200, description: 'Chi tiết điểm.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản ghi điểm.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('scores/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scoreService.findOne(id);
  }

  @ApiOperation({ summary: '[Admin] Cập nhật điểm' })
  @ApiParam({ name: 'id', type: Number, description: 'ID bản ghi điểm' })
  @ApiBody({ type: UpdateScoreDto })
  @ApiResponse({ status: 200, description: 'Điểm đã được cập nhật.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('scores/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScoreDto: UpdateScoreDto,
  ) {
    return this.scoreService.update(id, updateScoreDto);
  }

  @ApiOperation({ summary: '[Admin] Xoá bản ghi điểm' })
  @ApiParam({ name: 'id', type: Number, description: 'ID bản ghi điểm' })
  @ApiResponse({ status: 200, description: 'Điểm đã được xoá.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('scores/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scoreService.remove(id);
  }
}

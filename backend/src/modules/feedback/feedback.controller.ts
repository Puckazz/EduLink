import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Feedback')
@ApiBearerAuth()
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @ApiOperation({ summary: '[Parent] Gửi phản hồi / góp ý' })
  @ApiBody({ type: CreateFeedbackDto })
  @ApiResponse({ status: 201, description: 'Phản hồi đã được gửi.' })
  @Roles('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(createFeedbackDto);
  }

  @ApiOperation({ summary: '[Admin] Lấy toàn bộ danh sách phản hồi' })
  @ApiResponse({ status: 200, description: 'Danh sách phản hồi.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.feedbackService.findAll();
  }

  @ApiOperation({ summary: '[Admin] Lấy chi tiết phản hồi theo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID phản hồi' })
  @ApiResponse({ status: 200, description: 'Chi tiết phản hồi.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phản hồi.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.findOne(id);
  }

  @ApiOperation({ summary: '[Admin] Phản hồi / trả lời góp ý từ phụ huynh' })
  @ApiParam({ name: 'id', type: Number, description: 'ID phản hồi' })
  @ApiBody({ type: UpdateFeedbackDto })
  @ApiResponse({ status: 200, description: 'Phản hồi đã được cập nhật.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phản hồi.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.update(id, updateFeedbackDto);
  }

  @ApiOperation({ summary: '[Admin] Xoá phản hồi' })
  @ApiParam({ name: 'id', type: Number, description: 'ID phản hồi' })
  @ApiResponse({ status: 200, description: 'Phản hồi đã được xoá.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phản hồi.' })
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.remove(id);
  }
}

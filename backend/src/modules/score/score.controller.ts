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
import { ScoreService } from './score.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { ScoreListQueryDto } from './dto/score-list-query.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller()
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('students/:id/scores')
  createForStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() createScoreDto: CreateScoreDto,
  ) {
    return this.scoreService.createForStudent(id, createScoreDto);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('students/:id/scores')
  findByStudent(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ScoreListQueryDto,
  ) {
    return this.scoreService.findByStudent(id, query);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('scores/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scoreService.findOne(id);
  }

  @Roles('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me/students/:id/scores')
  findByStudentForParent(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ScoreListQueryDto,
    @Request()
    req: {
      user: {
        userId: number;
      };
    },
  ) {
    return this.scoreService.findByStudentForParent(id, req.user.userId, query);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('scores/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScoreDto: UpdateScoreDto,
  ) {
    return this.scoreService.update(id, updateScoreDto);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('scores/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scoreService.remove(id);
  }
}

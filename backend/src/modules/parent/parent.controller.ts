import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Request,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ParentService } from './parent.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post()
  create(@Body() createParentDto: CreateParentDto) {
    return this.parentService.create(createParentDto);
  }

  @Get()
  findAll() {
    return this.parentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parentService.findOne(+id);
  }

  @Roles('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/students')
  getStudentsByParentId(
    @Param('id', ParseIntPipe) id: number,
    @Request()
    req: {
      user: {
        userId: number;
      };
    },
  ) {
    if (req.user.userId !== id) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập danh sách học sinh của phụ huynh này',
      );
    }

    return this.parentService.getStudentsByParentId(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParentDto: UpdateParentDto) {
    return this.parentService.update(+id, updateParentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parentService.remove(+id);
  }
}

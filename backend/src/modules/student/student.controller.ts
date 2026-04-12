import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentListQueryDto } from './dto/student-list-query.dto';
import { AssignParentDto } from './dto/assign-parent.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // ─── PARENT routes (must come before :id to avoid conflict) ───────────────

  @Roles('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me/students')
  getMyStudents(
    @Query() query: StudentListQueryDto,
    @Request()
    req: {
      user: {
        userId: number;
      };
    },
  ) {
    return this.studentService.getStudentsForCurrentParent(
      req.user.userId,
      query,
    );
  }

  @Roles('parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me/students/:id')
  getMyStudentById(
    @Param('id', ParseIntPipe) id: number,
    @Request()
    req: {
      user: {
        userId: number;
      };
    },
  ) {
    return this.studentService.findOneForParent(id, req.user.userId);
  }

  // ─── ADMIN CRUD ────────────────────────────────────────────────────────────

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(@Query() query: StudentListQueryDto) {
    return this.studentService.findAll(query);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.remove(id);
  }

  // ─── STUDENT - PARENT linkage ──────────────────────────────────────────────

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/parents')
  assignParent(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignParentDto: AssignParentDto,
  ) {
    return this.studentService.assignParentToStudent(
      id,
      assignParentDto.parent_id,
    );
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/parents')
  getParents(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.getParentsOfStudent(id);
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/parents/:pid')
  removeParent(
    @Param('id', ParseIntPipe) id: number,
    @Param('pid', ParseIntPipe) pid: number,
  ) {
    return this.studentService.removeParentFromStudent(id, pid);
  }
}

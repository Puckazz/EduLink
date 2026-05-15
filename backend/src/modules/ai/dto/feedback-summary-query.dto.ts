import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class FeedbackSummaryQueryDto {
  @ApiPropertyOptional({ enum: ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] })
  @IsOptional()
  @IsIn(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'])
  status?: string;

  @ApiPropertyOptional({
    enum: [
      'ALL',
      'HOC_TAP',
      'TAI_CHINH',
      'THOI_KHOA_BIEU',
      'KY_LUAT',
      'KY_TUC_XA',
      'SUC_KHOE',
      'HOAT_DONG',
      'KHAC',
    ],
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}

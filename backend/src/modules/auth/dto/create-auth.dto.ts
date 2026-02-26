import { IsNotEmpty, IsString } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã học sinh không được để trống' })
  student_code: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  otp: string;
}

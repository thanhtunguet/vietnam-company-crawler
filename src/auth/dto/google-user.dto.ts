import { IsEmail, IsNotEmpty } from 'class-validator';

export class GoogleUserDto {
  @IsNotEmpty()
  googleId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  firstName?: string;
  lastName?: string;
  picture?: string;
}

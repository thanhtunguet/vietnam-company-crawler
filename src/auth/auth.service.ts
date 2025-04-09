import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/_entities';
import { UserRole } from 'src/_entities/UserRole.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import type { GoogleUserDto } from './dto/google-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      /// Return user without password
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };

    // Update last login time
    await this.usersRepository.update(
      { id: user.id },
      { lastLogin: new Date() },
    );

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async registerUser(createUserDto: CreateUserDto) {
    const { username, password, email } = createUserDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = this.usersRepository.create({
      username,
      password: hashedPassword,
      email,
      roles: [UserRole.USER],
    });

    await this.usersRepository.save(newUser);

    const { password: _, ...result } = newUser;
    return result;
  }

  async findOrCreateGoogleUser(googleUser: GoogleUserDto) {
    let user = await this.usersRepository.findOne({
      where: { googleId: googleUser.googleId },
    });

    if (!user) {
      // Check if user exists with the same email
      user = await this.usersRepository.findOne({
        where: { email: googleUser.email },
      });

      if (user) {
        // Update existing user with Google ID
        user.googleId = googleUser.googleId;
        await this.usersRepository.save(user);
      } else {
        // Create new user
        const newUser = this.usersRepository.create({
          username: googleUser.email,
          email: googleUser.email,
          googleId: googleUser.googleId,
          roles: [UserRole.USER],
        });
        user = await this.usersRepository.save(newUser);
      }
    }

    return this.login(user);
  }

  async getUserById(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }
}

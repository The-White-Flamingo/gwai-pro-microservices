import { Controller, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from '@app/users';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.findAll')
  findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern('users.findOne')
  findOne(@Payload() id: string) {
    return this.usersService.findOne(id);
  }

  @MessagePattern('users.update')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @MessagePattern('users.delete')
  remove(@Payload() id: string) {
    return this.usersService.remove(id);
  }

  @MessagePattern('users.me')
  me(@Payload() userId: string) {
    return this.usersService.me(userId);
  }
}

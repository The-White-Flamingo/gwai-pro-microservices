import {
  ActiveUser,
  ActiveUserData,
  Roles,
} from '@app/iam';
import { SignUpDto } from '@app/iam';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private static readonly adminRole = 'Admin' as any;
  private static readonly allUserRoles = [
    'Client',
    'Musician',
    'Studio',
    'Admin',
  ] as any;

  @Get('me')
  @Roles(...UsersController.allUserRoles)
  me(@ActiveUser() activeUser: ActiveUserData) {
    return this.usersService.me(activeUser.sub);
  }

  @Get()
  @Roles(UsersController.adminRole)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UsersController.adminRole)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UsersController.adminRole)
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: SignUpDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // updateUserDto.avatar = file?.buffer.toString('base64');
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UsersController.adminRole)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

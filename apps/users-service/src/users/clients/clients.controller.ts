import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @MessagePattern('createClient')
  create(@Payload() payload: CreateClientDto & { userId: string }) {
    return this.clientsService.create(payload);
  }

  @MessagePattern('findAllClients')
  findAll() {
    return this.clientsService.findAll();
  }

  @MessagePattern('findOneClient')
  findOne(@Payload() id: number) {
    return this.clientsService.findOne(id);
  }

  @MessagePattern('updateClient')
  update(@Payload() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(updateClientDto.id, updateClientDto);
  }

  @MessagePattern('updateClientProfile')
  updateProfile(@Payload() payload: Partial<UpdateClientDto> & { userId: string }) {
    return this.clientsService.updateProfile(payload);
  }

  @MessagePattern('removeClient')
  remove(@Payload() id: number) {
    return this.clientsService.remove(id);
  }
}

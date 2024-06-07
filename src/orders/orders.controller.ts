import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  ParseUUIDPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto';
import { PaginationDto } from 'src/common';
import { catchError } from 'rxjs';

@Controller('orders')
export class OrdersController {
  constructor(@Inject(NATS_SERVICE) private readonly Client: ClientProxy) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.Client.send({ cmd: 'create_order' }, createOrderDto);
  }

  @Get()
  findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    return this.Client.send({ cmd: 'find_all_orders' }, orderPaginationDto);
  }

  @Get('id/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.Client.send({ cmd: 'find_order' }, { id }).pipe(
      catchError((err) => {
        throw new RpcException(err);
      }),
    );
  }

  @Get(':status')
  async findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto,
  ) {
    try {
      return this.Client.send(
        { cmd: 'find_all_orders' },
        {
          ...paginationDto,
          status: statusDto.status,
        },
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: StatusDto,
  ) {
    try {
      return this.Client.send(
        { cmd: 'change_order_status' },
        {
          id,
          status: statusDto.status,
        },
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class ProxyAddressDto {
  @ApiProperty({
    type: String,
    description: 'Proxy address',
  })
  proxy: string;

  @ApiProperty({
    type: String,
    description: 'Public address',
  })
  publicAddress: string;

  constructor(proxy: string, publicAddress: string) {
    this.proxy = proxy;
    this.publicAddress = publicAddress;
  }
}

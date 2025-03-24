import {ApiProperty} from '@nestjs/swagger';

export class PartialJobDto {
    @ApiProperty({
        type: 'number',
    })
    pages: number;
}
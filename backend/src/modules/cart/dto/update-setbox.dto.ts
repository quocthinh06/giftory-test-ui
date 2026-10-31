import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateSetboxDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsMongoId({ each: true })
  itemIds: string[];

  @IsOptional()
  setbox: any;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

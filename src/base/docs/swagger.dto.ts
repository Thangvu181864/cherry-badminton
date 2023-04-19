import { IsPositive } from 'class-validator';

/* params */
export class IdParam {
  @IsPositive()
  id: number;
}

/* queries */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { IJwtPayload } from '@modules/auth/interfaces/jwt.interface';
import { JwtAuthService } from '@modules/auth/services/jwt.service';
import { ConfigService } from '@config';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private config: ConfigService, private jwtAuthService: JwtAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.ACCESS_SECRET,
    });
  }

  async validate(payload: IJwtPayload) {
    return this.jwtAuthService.authentication(payload);
  }
}

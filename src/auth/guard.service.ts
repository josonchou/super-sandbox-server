import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/admin.entity';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { verify, sign } from 'jsonwebtoken';
import { LoginErrorException } from 'src/common/BadReqException';

const JWTSecret = 'shared.srv.sign.key.release';

function genJWTIssuer() {
  return `ITS.${new Date().getFullYear()}`;
}

interface WechatLoginOption {
  nickname: string;
  openID: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  unionid: string;
}

@Injectable()
export class GuardService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async verifyAdmin(token: string) {
    // console.log(token, '...token...');
    const verifyJWT = () =>
      new Promise((resolve, reject) => {
        verify(
          token.trim(),
          JWTSecret,
          {
            issuer: genJWTIssuer(),
          },
          (err, decoded) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(decoded);
            // resolve({ err, decoded });
          },
        );
      });
    try {
      const decoded = await verifyJWT();
      const { uid = 0 } = decoded as any;
      const foundAdmin = await this.adminRepository.findOne(uid);

      if (!foundAdmin) {
        return false;
      }

      return foundAdmin;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  /**
   * 认证管理员
   * @param username 用户名
   * @param password 密码
   * @returns
   */
  async authAdmin(
    username: string,
    password: string,
  ): Promise<[string, Admin]> {
    const foundAdmin = await this.adminRepository.findOne({
      where: {
        username,
        isBan: false,
      },
      relations: ['password'],
    });
    if (!foundAdmin) {
      throw new LoginErrorException();
    }

    const isCompared = await compare(password, foundAdmin.password.password);
    if (!isCompared) {
      // return ['', null];
      throw new LoginErrorException();
    }
    const token = sign(
      {
        uid: foundAdmin.id,
        isAdmin: true,
      },
      JWTSecret,
      {
        expiresIn: '7d',
        jwtid: `${Date.now()}-${foundAdmin.id}`,
        issuer: genJWTIssuer(),
      },
    );
    delete foundAdmin.password;
    return [token, foundAdmin];
  }
}

import { InjectRepository } from '@nestjs/typeorm';
import { getManager, In, Repository } from 'typeorm';
import { compare, genSalt, hash as hashBcrypt } from 'bcrypt';
import { Admin } from './admin.entity';
import { Injectable } from '@nestjs/common';
import { AdminPassword } from './adminPassword.entity';
import { Setting } from './setting.entity';
import { BadReqException } from 'src/common/BadReqException';
import { CommonQuery } from 'src/common/CommonQuery';
import { genPaginationParams } from 'src/common/utils';

/*
 * @description: 管理员
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(AdminPassword)
    private readonly adminPasswordRepository: Repository<AdminPassword>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  /**
   * 获取管理员信息
   */
  findAdminInfo(uid: number) {
    return this.adminRepository.findOne(uid);
  }

  async genPassword(plainPwd: string) {
    // 生成salt的迭代次数
    const saltRounds = 10;
    const salt: string = await genSalt(saltRounds);
    const hash: string = await hashBcrypt(plainPwd, salt);

    return hash;
  }

  // @OnEvent('admin.init', { async: true })
  async initAdmin() {
    const foundOne = await this.settingRepository.findOne({
      name: 'isInitial',
    });

    if (foundOne && foundOne.value === 'true') {
      return true;
    }
    const setting = new Setting();
    setting.name = 'isInitial';
    setting.value = 'true';
    await this.createSuperAdmin();
    await this.settingRepository.save(setting);
    return true;
  }

  /**
   * 生成超级管理员
   */
  async createSuperAdmin() {
    const plainPassword = 'root';
    const admin = new Admin();
    admin.username = 'root';
    admin.nickname = '超级管理员';
    admin.role = 1;
    const adminPassword = new AdminPassword();
    const hash = await this.genPassword(plainPassword);

    adminPassword.password = hash;
    const savedAdmin = await getManager().transaction(async (entityManager) => {
      const savedAdmin = await entityManager.save(admin);
      adminPassword.admin = savedAdmin;
      await entityManager.save(adminPassword);
      return savedAdmin;
    });
    return savedAdmin;
  }

  async getAdminInfo(uid: number) {
    const foundAdmin = await this.adminRepository.findOne(uid);

    return foundAdmin;
  }

  // 修改管理员密码
  async updateAdminPassword(
    uid: number,
    oldPassword: string,
    newPassword: string,
  ) {
    // const foundAdmin = await this.adminRepository.findOne(uid);
    const foundAdminPass = await this.adminPasswordRepository
      .createQueryBuilder('adp')
      .where('adp.adminId = :uid', { uid })
      .getOne();

    if (!foundAdminPass) {
      throw new BadReqException('身份验证失败，您无法修改密码');
    }

    const isCompared = await compare(oldPassword, foundAdminPass.password);
    if (!isCompared) {
      throw new BadReqException('身份验证失败，您无法修改密码');
    }

    foundAdminPass.password = await this.genPassword(newPassword);

    await this.adminPasswordRepository.save(foundAdminPass);
  }

  // 创建管理员
  async createAdmin(username: string, role: number) {
    const user = await this.adminRepository.findOne({
      username: username,
    });

    if (user && user.id) {
      throw new BadReqException('该用户已存在');
    }
    const plainPassword = '123456';
    const admin = new Admin();
    admin.username = username;
    admin.nickname = username;
    const adminPassword = new AdminPassword();
    const hash = await this.genPassword(plainPassword);

    adminPassword.password = hash;
    admin.role = role;
    const savedAdmin = await getManager().transaction(async (entityManager) => {
      const savedAdmin = await entityManager.save(admin);
      adminPassword.admin = savedAdmin;
      await entityManager.save(adminPassword);
      return savedAdmin;
    });
    return savedAdmin;
  }

  // 分页获取用户列表
  async getUsers(query?: CommonQuery) {
    const { offset, limit, page, pageSize } = genPaginationParams(query as any);

    let queryBuilder = this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.delete_at IS NULL')
      .andWhere('admin.username <> :name', {
        name: 'root',
      });

    if (query.username) {
      queryBuilder.andWhere('admin.username LIKE :keywords', {
        keywords: `%${query.username}%`,
      });
    }

    const total = await queryBuilder.getCount();
    queryBuilder = queryBuilder
      .offset(offset)
      .limit(limit)
      .orderBy('admin.createAt', 'DESC');
    const users = await queryBuilder.getMany();

    return {
      list: users,
      total,
      page,
      pageSize,
    };
  }

  async batchRemoveUsers(uidsList: number[]) {
    // await getManager().transaction(async (entityManager) => {
    //   // await entityManager.createQueryBuilder()
    //   //     .delete()
    //   //     .from(AdminPassword)
    //   //     .where({
    //   //       adminId: In(uidsList),
    //   //     });
    //   await entityManager.createQueryBuilder()
    //       .delete()
    //       .from(Admin)
    //       .where({
    //         id: In(uidsList),
    //       })
    // });
    await this.adminRepository.delete(uidsList);
  }
}

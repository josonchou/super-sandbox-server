import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BadReqException } from 'src/common/BadReqException';
import Ability from 'src/constanst/ability';
import TrainingCategory from 'src/constanst/trainingCategory';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * 获取分类列表
   * @returns {Promise<Array<Category>>} 分类列表
   */
  async listCategoryByType(cateType: Category['cateType']) {
    const categorys = await this.categoryRepository.find({
      cateType,
    });

    return categorys;
  }

  list2Dict(categorys: Array<Category>, dataType: 'ability' | 'training') {
    return categorys.reduce((pre, item) => {
      const { parentCid } = item;
      const prettyItem =
        dataType === 'training'
          ? {
              children: [],
              ...(pre[item.cid] || {}),
              ...item,
              key: item.cid,
              id: item.cid,
              name: item.name,
              isRoot: !parentCid,
            }
          : {
              children: [],
              ...(pre[item.cid] || {}),
              ...item,
              id: item.cid,
              key: item.cid,
              isRoot: !parentCid,
            };

      if (!pre[parentCid || -1]) {
        pre[parentCid || -1] = {
          children: [],
        };
      }

      pre[parentCid || -1].children.push(prettyItem);

      return {
        ...pre,
        [item.cid]: prettyItem,
      };
    }, {});
  }

  async getAbility() {
    const categorys = await this.listCategoryByType('ability');

    return (this.list2Dict(categorys, 'ability')[-1] || {}).children || [];
  }

  async getTrainingCategory() {
    const categorys = await this.listCategoryByType('training');

    return (this.list2Dict(categorys, 'training')[-1] || {}).children || [];
  }

  async getAllSecondTrainingItems(keywords: string) {
    const categorys = await this.listCategoryByType('training');

    if (!keywords) {
      const result =
        (this.list2Dict(categorys, 'training')[-1] || {}).children || [];

      return result.reduce((prev, item) => {
        return [...prev, ...(item.children || [])];
      }, []);
    }

    const dict = categorys.reduce((prev, item) => {
      return {
        ...prev,
        [item.cid]: item,
      };
    }, {});

    const queryBuilder = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.delete_at IS NULL AND category.cate_type = :t', {
        t: 'training',
      })
      .andWhere('category.name LIKE :keywords', {
        keywords: `%${keywords}%`,
      });

    const searched = await queryBuilder.getMany();

    const resultIds = new Set<number>();

    searched.forEach((item) => {
      resultIds.add(item.cid);
    });

    const findAndSetParents = (
      inputList: Array<Category>,
      outputList: Set<number>,
    ) => {
      const parentSet = new Set();
      inputList.forEach((item) => {
        parentSet.add(item.parentCid);
      });

      const parentIds = Array.from(parentSet);

      const parents = parentIds
        .map((cid: any) => dict[cid] || null)
        .filter(Boolean);

      parents.forEach((parent) => {
        outputList.add(parent.cid);
      });
      if (parents.length) {
        findAndSetParents(parents, outputList);
      }
    };

    findAndSetParents(searched, resultIds);

    const list = Array.from(resultIds)
      .map((cid) => dict[cid])
      .filter(Boolean);

    const result = (this.list2Dict(list, 'training')[-1] || {}).children || [];

    return result.reduce((prev, item) => {
      return [...prev, ...(item.children || [])];
    }, []);
  }

  /**
   * 修改分类
   * @param name 分类名
   * @param cid 分类ID
   * @returns {Promise<Category>} 保存成功的分类
   */
  async editCategory(
    name: string,
    code: string,
    cid: number,
    cateType: Category['cateType'],
  ) {
    const foundOne = await this.categoryRepository.findOne({
      cid,
      cateType,
    });

    if (!foundOne) {
      throw new BadReqException('未找到该分类');
    }

    foundOne.name = name;
    foundOne.code = code;

    return await this.categoryRepository.update(
      {
        cid,
        cateType,
      },
      {
        name,
        code,
      },
    );
  }

  async createCategory(category: Category) {
    const result = await this.categoryRepository.save(category);

    return result;
  }

  async initCategory() {
    const categorys: Array<Category> = [];

    const recursionPush = (list: Array<any>, item: any, pid?: any) => {
      const { children = [] } = item;
      const cate = new Category();
      cate.cateType = 'ability';
      cate.cid = item.id;
      cate.code = item.code;
      cate.name = item.name;
      cate.sort = item.sort;
      if (pid) {
        cate.parentCid = pid;
      }
      list.push(cate);
      if (children.length > 0) {
        children.map((child) => {
          recursionPush(list, child, item.id);
        });
      }
    };

    const recursionPushTraining = (list: Array<any>, item: any, pid?: any) => {
      const { children = [] } = item;
      const cate = new Category();
      cate.cateType = 'training';
      cate.cid = item.key;
      cate.code = item.code || '';
      cate.name = item.name;
      cate.sort = item.sort || 0;
      cate.kind = item.kind || '';
      if (pid) {
        cate.parentCid = pid;
      }
      list.push(cate);
      if (children.length > 0) {
        children.map((child) => {
          recursionPushTraining(list, child, item.key);
        });
      }
    };

    Ability.forEach((item) => {
      recursionPush(categorys, item, null);
    });

    TrainingCategory.forEach((item) => {
      recursionPushTraining(categorys, item, null);
    });

    console.log('dlog ==> cates', categorys);

    this.categoryRepository.save(categorys);
  }
}

/*
 * @description: 通用工具类库
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

interface AnyDict {
  [key: string]: unknown;
}

export const genPaginationParams = (val: AnyDict = {}) => {
  let { page, pageSize } = val || {};
  console.log(val, 'val');
  if (page <= 0 || !page) {
    page = 1;
  }
  if (!pageSize) {
    pageSize = 15;
  }
  const offset = ((page as number) - 1) * (pageSize as number);

  return {
    offset,
    limit: +pageSize as number,
    page: +page as number,
    pageSize: +pageSize as number,
  };
};

export interface ListWithPagination<T> {
  [key: string]: any;
  list: Array<T>;
  total: number;
  page: number;
  pageSize: number;
}

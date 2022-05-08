/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

export interface IFile {
  fieldname: string;
  originalname: string;
  size: number;
  encoding: string;
  buffer: Buffer;
  mimetype: string;
}

// 文件切片参数
export interface FileSnippetExtParams {
  hash?: string;
  index?: number;
}

export interface MergeFileInfo {
  hash: string;
  total: number;
  originFilename: string;
}

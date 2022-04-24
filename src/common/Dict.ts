/*
 * @description: 枚举字典类
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

interface IDict<K = number, V = string> {
  key: K;
  value: V;
}

export class EnumOne<K = number, V = string> {
  key: K;
  value: V;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }

  static of<K = number, V = string>(key: K, value: V) {
    return new EnumOne<K, V>(key, value);
  }
}

export default class Dict<K = number, V = string> {
  dict: Set<EnumOne<K, V>> = new Set<EnumOne<K, V>>();
  keys: Set<K> = new Set<K>();
  values: Set<V> = new Set<V>();
  map: Map<K, EnumOne<K, V>>;
  constructor(...enumOneList: Array<EnumOne<K, V>>) {
    enumOneList.forEach((enumOne) => {
      this.dict.add(enumOne);
      this.keys.add(enumOne.key);
      this.values.add(enumOne.value);
    });
    this.map = new Map<K, EnumOne<K, V>>();
  }

  contain = (key: K) => {
    return this.keys.has(key);
  };

  containValue = (value: V) => {
    return this.values.has(value);
  };

  getValueByKey = (key: K) => {
    if (!this.contain(key)) {
      return '未知';
    }
    let foundEnum: EnumOne<K, V>;
    if (this.map.has(key)) {
      foundEnum = this.map.get(key);
    }
    this.dict.forEach((val) => {
      if (val.key === key) {
        foundEnum = val;
        this.map.set(val.key, foundEnum);
      }
    });

    return foundEnum.value;
  };

  toList = (): Array<IDict<K, V>> => {
    return Array.from(this.dict).map((item) => ({
      key: item.key,
      value: item.value,
    }));
  };

  static of<K = number, V = string>(...enumOneList: Array<EnumOne<K, V>>) {
    return new Dict<K, V>(...enumOneList);
  }

  static One<K = number, V = string>(key: K, value: V) {
    return EnumOne.of<K, V>(key, value);
  }
}

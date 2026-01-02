// This file is auto-generated, don't edit it
/**
 * This is a map module
 */
import * as $tea from '@alicloud/tea-typescript';


export default class Client {

  // 返回对象长度
  static size(raw: { [key: string]: any }): number {
    if (null === raw || typeof (raw) === 'undefined') {
      throw new Error('not a valid value for parameter')
    }
    return Object.keys(raw).length
  }

  // 返回由对象key组成的数组
  static keySet(raw: { [key: string]: any }): string[] {
    if (null === raw || typeof (raw) === 'undefined') {
      throw new Error('not a valid value for parameter')
    }
    return Object.keys(raw);
  }
}

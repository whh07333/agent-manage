/**
 * 生成指定长度的随机字符串
 * @param length 生成字符串的长度，必须大于0
 * @param charset 可选，自定义字符集，默认包含大小写字母和数字
 * @returns 生成的随机字符串
 * @throws {Error} 当length小于等于0时抛出错误
 * @example
 * // 生成8位长度的随机字符串
 * const str = generateRandomString(8); // 返回类似 "aB3kLm9P"
 * 
 * // 生成6位纯数字验证码
 * const code = generateRandomString(6, '0123456789'); // 返回类似 "123456"
 */
export function generateRandomString(
  length: number,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  if (length <= 0) {
    throw new Error('Length must be greater than 0');
  }

  const charsetLength = charset.length;
  let result = '';

  // 使用crypto模块生成更安全的随机数
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % charsetLength;
    result += charset[randomIndex];
  }

  return result;
}

/**
 * 预定义字符集常量
 */
export const CHARSETS = {
  /** 纯数字 */
  NUMERIC: '0123456789',
  /** 小写字母 */
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  /** 大写字母 */
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  /** 字母 + 数字 */
  ALPHANUMERIC: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  /** 字母 + 数字 + 特殊字符 */
  COMPLEX: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
} as const;

export default generateRandomString;

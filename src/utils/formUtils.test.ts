import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
  validateNumber,
  validateRange
} from './formUtils';

describe('表单验证工具测试', () => {
  describe('邮箱验证', () => {
    it('应该验证有效的邮箱地址', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('应该拒绝无效的邮箱地址', () => {
      const cases = [
        'test',
        'test@',
        'test@example',
        'test@.com',
        '@example.com'
      ];

      cases.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.message).toBeDefined();
      });
    });

    it('应该处理空的邮箱地址', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('手机号验证', () => {
    it('应该验证有效的手机号', () => {
      const cases = [
        '13800138000',
        '13912345678',
        '15987654321',
        '18812345678'
      ];

      cases.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('');
      });
    });

    it('应该拒绝无效的手机号', () => {
      const cases = [
        '1234567890',
        '123456789012',
        'abc12345678',
        '1380013800',
        '138001380000'
      ];

      cases.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(false);
        expect(result.message).toBeDefined();
      });
    });
  });

  describe('密码强度验证', () => {
    it('应该验证强密码', () => {
      const strongPasswords = [
        'Password123!',
        'StrongP@ssw0rd',
        'Secure123#456'
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.strength).toBe('strong');
        expect(result.message).toBe('');
      });
    });

    it('应该识别中等强度密码', () => {
      const mediumPasswords = [
        'Password123',
        'password123!',
        'PASS123!'
      ];

      mediumPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.strength).toBe('medium');
      });
    });

    it('应该拒绝弱密码', () => {
      const weakPasswords = [
        'password',
        '123456',
        'abc123',
        'PASS'
      ];

      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.strength).toBe('weak');
        expect(result.message).toBeDefined();
      });
    });

    it('应该处理过短的密码', () => {
      const result = validatePassword('12345');
      expect(result.isValid).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('必填项验证', () => {
    it('应该验证非空值', () => {
      const cases = ['test', '123', ' ', '  test  '];
      
      cases.forEach(value => {
        const result = validateRequired(value);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('');
      });
    });

    it('应该拒绝空值', () => {
      const cases = [null, undefined, '', NaN];
      
      cases.forEach(value => {
        const result = validateRequired(value as any);
        expect(result.isValid).toBe(false);
        expect(result.message).toBeDefined();
      });
    });
  });

  describe('数字验证', () => {
    it('应该验证有效的数字', () => {
      const cases = ['123', '0.5', '-10', '1000000'];
      
      cases.forEach(value => {
        const result = validateNumber(value);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('');
      });
    });

    it('应该拒绝无效的数字', () => {
      const cases = ['abc', '123abc', '12.3.4', '', ' '];
      
      cases.forEach(value => {
        const result = validateNumber(value);
        expect(result.isValid).toBe(false);
        expect(result.message).toBeDefined();
      });
    });
  });

  describe('范围验证', () => {
    it('应该验证在范围内的值', () => {
      const cases = [
        { value: '5', min: 1, max: 10 },
        { value: '10', min: 1, max: 10 },
        { value: '1', min: 1, max: 10 },
        { value: '7.5', min: 0, max: 10 }
      ];
      
      cases.forEach(({ value, min, max }) => {
        const result = validateRange(value, min, max);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('');
      });
    });

    it('应该拒绝超出范围的值', () => {
      const cases = [
        { value: '0', min: 1, max: 10 },
        { value: '11', min: 1, max: 10 },
        { value: '-5', min: 0, max: 10 },
        { value: '15', min: 5, max: 10 }
      ];
      
      cases.forEach(({ value, min, max }) => {
        const result = validateRange(value, min, max);
        expect(result.isValid).toBe(false);
        expect(result.message).toBeDefined();
      });
    });

    it('应该处理非数字值', () => {
      const result = validateRange('abc', 1, 10);
      expect(result.isValid).toBe(false);
      expect(result.message).toBeDefined();
    });
  });
});
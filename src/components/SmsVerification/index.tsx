import React, { useState, useEffect } from 'react';
import { Input, Button, message, Form, Card, Typography, Divider } from 'antd';
import { PhoneOutlined, SendOutlined } from '@ant-design/icons';
import AuthService from '../../services/auth/AuthService';
import '../../styles/components/SmsVerification.css';

const { Title, Text } = Typography;

// 定义接口
interface SmsConfig {
  codeLength?: number;
  codeType?: number;
  validTime?: number;
  [key: string]: any;
}

interface SmsVerificationProps {
  onVerifySuccess?: (result: any) => void;
  onVerifyFail?: (result: any) => void;
  config?: SmsConfig;
  showAdvancedOptions?: boolean;
  initialPhoneNumber?: string;
}

interface AdvancedConfig {
  codeLength: number;
  codeType: number;
  validTime: number;
}

interface FormValues {
  phoneNumber: string;
  verificationCode: string;
  codeLength?: number;
  codeType?: number;
  validTime?: number;
}

/**
 * 短信验证码组件
 * 提供手机号输入、验证码发送和验证功能
 */
const SmsVerification: React.FC<SmsVerificationProps> = ({
  onVerifySuccess,
  onVerifyFail,
  config = {},
  showAdvancedOptions = false,
  initialPhoneNumber = '',
}) => {
  const [form] = Form.useForm<FormValues>();
  const [phoneNumber, setPhoneNumber] = useState<string>(initialPhoneNumber);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [sending, setSending] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedConfig>({
    codeLength: 6, // 默认6位验证码
    codeType: 1, // 纯数字
    validTime: 5, // 5分钟有效期
    ...config,
  });

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [countdown]);

  /**
   * 发送验证码
   */
  const handleSendCode = async () => {
    // 简单的手机号验证
    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
      message.error('请输入正确的手机号码');
      return;
    }

    setSending(true);
    try {
      const result = await AuthService.sendPhoneVerificationCode(phoneNumber);

      if (result) {
        // 开始倒计时
        setCountdown(60);
        message.success('验证码发送成功');
        
        // 更新用户手机号（标记为未验证状态）
        AuthService.updatePhoneNumber(phoneNumber);
      } else {
        message.error('发送失败，请稍后重试');
      }
    } catch (error) {
      message.error(`发送失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSending(false);
    }
  };

  /**
   * 验证验证码
   */
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      message.error('请输入验证码');
      return;
    }

    setVerifying(true);
    try {
      const result = await AuthService.verifyPhoneCode(phoneNumber, verificationCode);

      if (result) {
        message.success('验证成功');
        if (onVerifySuccess) {
          onVerifySuccess({ message: '验证成功', phoneNumber });
        }
      } else {
        message.error('验证码错误或已过期');
        if (onVerifyFail) {
          onVerifyFail({ message: '验证码错误或已过期' });
        }
      }
    } catch (error) {
      message.error(`验证失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setVerifying(false);
    }
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: FormValues) => {
    setPhoneNumber(values.phoneNumber);
    setVerificationCode(values.verificationCode);

    if (!values.verificationCode) {
      await handleSendCode();
    } else {
      await handleVerifyCode();
    }
  };

  return (
    <Card
      title={<Title level={4}>短信验证码服务</Title>}
      className='sms-verification-card'
      style={{ maxWidth: 600, margin: '0 auto' }}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
        initialValues={{
          phoneNumber: '',
          verificationCode: '',
        }}
      >
        <Form.Item
          name='phoneNumber'
          label='手机号码'
          rules={[
            { required: true, message: '请输入手机号码' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
          ]}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder='请输入手机号码'
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={countdown > 0}
          />
        </Form.Item>

        <Form.Item
          name='verificationCode'
          label='验证码'
          rules={[{ required: true, message: '请输入验证码' }]}
        >
          <Input.Group compact>
            <Input
              placeholder='请输入验证码'
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              style={{ width: 'calc(100% - 120px)' }}
            />
            <Button
              type='primary'
              icon={<SendOutlined />}
              onClick={handleSendCode}
              disabled={countdown > 0 || sending || !phoneNumber}
              loading={sending}
              style={{ width: 110 }}
            >
              {countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
            </Button>
          </Input.Group>
        </Form.Item>

        {showAdvancedOptions && (
          <div className='advanced-options'>
            <Divider orientation='left'>高级选项</Divider>
            <div className='config-grid'>
              <div className='config-item'>
                <Text strong>验证码长度:</Text>
                <Form.Item name='codeLength' noStyle>
                  <Input.Number
                    min={4}
                    max={8}
                    value={advancedConfig.codeLength}
                    onChange={(value) =>
                      setAdvancedConfig({
                        ...advancedConfig,
                        codeLength: value as number,
                      })
                    }
                    style={{ width: 100 }}
                  />
                </Form.Item>
              </div>

              <div className='config-item'>
                <Text strong>验证码类型:</Text>
                <Form.Item name='codeType' noStyle>
                  <Input.Select
                    value={advancedConfig.codeType}
                    onChange={(value) =>
                      setAdvancedConfig({ ...advancedConfig, codeType: value as number })
                    }
                    style={{ width: 150 }}
                  >
                    <Input.Select.Option value={1}>纯数字</Input.Select.Option>
                    <Input.Select.Option value={2}>
                      纯大写字母
                    </Input.Select.Option>
                    <Input.Select.Option value={3}>
                      纯小写字母
                    </Input.Select.Option>
                    <Input.Select.Option value={4}>
                      大小写字母混合
                    </Input.Select.Option>
                    <Input.Select.Option value={5}>
                      数字+大写字母
                    </Input.Select.Option>
                    <Input.Select.Option value={6}>
                      数字+小写字母
                    </Input.Select.Option>
                    <Input.Select.Option value={7}>
                      数字+大小写字母
                    </Input.Select.Option>
                  </Input.Select>
                </Form.Item>
              </div>

              <div className='config-item'>
                <Text strong>有效期(分钟):</Text>
                <Form.Item name='validTime' noStyle>
                  <Input.Number
                    min={1}
                    max={60}
                    value={advancedConfig.validTime}
                    onChange={(value) =>
                      setAdvancedConfig({
                        ...advancedConfig,
                        validTime: value as number,
                      })
                    }
                    style={{ width: 100 }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        )}

        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            loading={verifying}
            disabled={!phoneNumber || !verificationCode}
            block
          >
            验证
          </Button>
        </Form.Item>
      </Form>

      <div className='service-info'>
        <Divider orientation='left'>服务说明</Divider>
        <ul>
          <li>支持国内手机号（+86）发送短信验证码</li>
          <li>验证码默认有效期为5分钟，可在高级选项中调整</li>
          <li>两次发送间隔至少60秒，请勿频繁发送</li>
          <li>请确保已配置正确的签名和模板信息</li>
        </ul>
      </div>
    </Card>
  );
};

// 样式已移至 SmsVerification.css 文件

export default SmsVerification;
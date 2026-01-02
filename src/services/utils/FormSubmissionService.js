/**
 * 表单提交服务
 * 处理表单数据的验证、归档和邮件发送
 */
import formUtils from '../utils/formUtils';

class FormSubmissionService {
  constructor() {
    this.archivedData = [];
    this.loadArchivedData();
  }

  /**
   * 加载归档数据
   */
  loadArchivedData() {
    try {
      const saved = localStorage.getItem('formSubmissionArchive');
      if (saved) {
        this.archivedData = JSON.parse(saved);
      }
    } catch (error) {
      console.error('加载归档数据失败:', error);
      this.archivedData = [];
    }
  }

  /**
   * 保存归档数据
   */
  saveArchivedData() {
    try {
      localStorage.setItem(
        'formSubmissionArchive',
        JSON.stringify(this.archivedData)
      );
    } catch (error) {
      console.error('保存归档数据失败:', error);
      throw new Error('数据归档失败');
    }
  }

  /**
   * 验证表单数据
   * @param {object} formData - 表单数据
   * @param {object} rules - 验证规则
   * @returns {object} - 验证结果
   */
  validateForm(formData, rules) {
    return formUtils.validateForm(formData, rules);
  }

  /**
   * 规范化表单数据
   * @param {object} formData - 原始表单数据
   * @returns {object} - 规范化后的表单数据
   */
  normalizeFormData(formData) {
    // 格式化基础数据
    const normalizedData = formUtils.formatFormData(formData);

    // 添加元数据
    const now = new Date();
    return {
      ...normalizedData,
      submissionId: formUtils.generateId('submission'),
      submissionDate: now.toISOString(),
      formattedDate: now.toLocaleString('zh-CN'),
      status: 'pending',
      emailSent: false,
    };
  }

  /**
   * 生成标准样本格式
   * @param {object} normalizedData - 规范化后的表单数据
   * @returns {string} - 标准样本格式字符串
   */
  generateStandardSample(normalizedData) {
    const sampleTemplate =
      `--- 客户表单提交样本 ---\n` +
      `提交ID: ${normalizedData.submissionId}\n` +
      `提交时间: ${normalizedData.formattedDate}\n` +
      `--- 基本信息 ---\n` +
      `建筑类型: ${normalizedData.buildingType || '未填写'}\n` +
      `地理位置: ${normalizedData.location || '未填写'}\n` +
      `估价方法: ${normalizedData.valuationMethod || '未填写'}\n` +
      `建筑面积: ${normalizedData.area || '未填写'} ㎡\n` +
      `--- 建筑信息 ---\n` +
      `建成年份: ${normalizedData.constructionYear || '未填写'}\n` +
      `装修等级: ${normalizedData.decorationLevel || '未填写'}\n` +
      `所在楼层: ${normalizedData.floor || '未填写'}\n` +
      `总楼层: ${normalizedData.totalFloors || '未填写'}\n` +
      `朝向: ${normalizedData.orientation || '未填写'}\n` +
      `--- 小区信息 ---\n` +
      `容积率: ${normalizedData.lotRatio || '未填写'}\n` +
      `绿化率: ${normalizedData.greenRatio || '未填写'}%\n` +
      `--- 周边配套设施 ---\n` +
      `配套设施: ${normalizedData.nearbyFacilities ? normalizedData.nearbyFacilities.join(', ') : '未填写'}\n` +
      `--- 附加信息 ---\n` +
      `状态: ${normalizedData.status}\n` +
      `邮件发送状态: ${normalizedData.emailSent ? '已发送' : '未发送'}\n` +
      `--- 样本结束 ---`;

    return sampleTemplate;
  }

  /**
   * 归档表单数据
   * @param {object} normalizedData - 规范化后的表单数据
   * @returns {object} - 包含样本格式的归档数据
   */
  archiveFormData(normalizedData) {
    try {
      // 生成标准样本
      const standardSample = this.generateStandardSample(normalizedData);

      // 添加样本到数据中
      const archivedItem = {
        ...normalizedData,
        standardSample,
      };

      // 保存到归档列表
      this.archivedData.unshift(archivedItem);
      this.saveArchivedData();

      return archivedItem;
    } catch (error) {
      console.error('归档表单数据失败:', error);
      throw new Error('数据归档失败');
    }
  }

  /**
   * 发送邮件（模拟实现）
   * @param {object} archivedItem - 归档后的表单数据
   * @param {string} recipient - 收件人邮箱
   * @returns {Promise<boolean>} - 发送结果
   */
  async sendEmail(archivedItem, recipient) {
    try {
      // 模拟邮件发送延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 构建邮件内容
      const emailContent = {
        to: recipient,
        subject: `客户表单提交 - ${archivedItem.submissionId}`,
        body: `尊敬的收件人：

您收到了一份新的客户表单提交，详情如下：

${archivedItem.standardSample}

请及时处理。

此致，
表单系统`,
      };

      // 模拟发送成功
      console.log('[邮件发送模拟] 邮件已发送:', {
        recipient: emailContent.to,
        subject: emailContent.subject,
        content: emailContent.body,
      });

      // 更新归档数据状态
      archivedItem.emailSent = true;
      archivedItem.status = 'completed';
      this.saveArchivedData();

      return true;
    } catch (error) {
      console.error('发送邮件失败:', error);
      // 更新归档数据状态
      archivedItem.status = 'failed';
      this.saveArchivedData();
      throw new Error('邮件发送失败');
    }
  }

  /**
   * 获取所有归档数据
   * @returns {array} - 归档数据列表
   */
  getAllArchivedData() {
    return [...this.archivedData];
  }

  /**
   * 获取单个归档数据
   * @param {string} submissionId - 提交ID
   * @returns {object|null} - 归档数据
   */
  getArchivedDataById(submissionId) {
    return (
      this.archivedData.find((item) => item.submissionId === submissionId) ||
      null
    );
  }

  /**
   * 完整的表单提交流程
   * @param {object} formData - 原始表单数据
   * @param {object} rules - 验证规则
   * @param {string} recipient - 收件人邮箱
   * @returns {Promise<object>} - 处理结果
   */
  async submitForm(formData, rules, recipient) {
    try {
      // 1. 验证表单数据
      const validationResult = this.validateForm(formData, rules);
      if (!validationResult.isValid) {
        throw new Error(
          '表单验证失败: ' + Object.values(validationResult.errors).join(', ')
        );
      }

      // 2. 规范化表单数据
      const normalizedData = this.normalizeFormData(formData);

      // 3. 归档表单数据
      const archivedItem = this.archiveFormData(normalizedData);

      // 4. 发送邮件
      await this.sendEmail(archivedItem, recipient);

      return {
        success: true,
        message: '表单提交成功，邮件已发送',
        data: archivedItem,
      };
    } catch (error) {
      console.error('表单提交流程失败:', error);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }
}

export default new FormSubmissionService();

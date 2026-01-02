import React, { useState } from 'react';

const ActivityRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    verificationCode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 处理表单提交
    console.log('表单提交:', formData);
    // 跳转活动提醒页面
    window.location.href = '/activities/reminder';
  };

  return (
    <div className='p-6 bg-[#1a0d08] min-h-screen'>
      <h1 className='text-2xl font-bold text-orange-400 mb-6'>活动报名页</h1>
      <p className='text-white opacity-70 mb-8'>
        填写信息提交报名，支持短信验证，报名后跳转活动提醒页面。
      </p>

      {/* 报名表单 */}
      <div className='max-w-2xl mx-auto'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                姓名
              </label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-orange-400 border-opacity-20 rounded-lg text-white focus:outline-none focus:border-orange-400 focus:shadow-[0_0_10px_rgba(255,160,70,0.2)] transition-all duration-200'
                placeholder='请输入您的姓名'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                邮箱
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-orange-400 border-opacity-20 rounded-lg text-white focus:outline-none focus:border-orange-400 focus:shadow-[0_0_10px_rgba(255,160,70,0.2)] transition-all duration-200'
                placeholder='请输入您的邮箱'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                手机号码
              </label>
              <div className='flex gap-2'>
                <input
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className='flex-1 px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-orange-400 border-opacity-20 rounded-lg text-white focus:outline-none focus:border-orange-400 focus:shadow-[0_0_10px_rgba(255,160,70,0.2)] transition-all duration-200'
                  placeholder='请输入您的手机号码'
                />
                <button
                  type='button'
                  className='px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-all duration-200 whitespace-nowrap'
                >
                  获取验证码
                </button>
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                验证码
              </label>
              <input
                type='text'
                name='verificationCode'
                value={formData.verificationCode}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-orange-400 border-opacity-20 rounded-lg text-white focus:outline-none focus:border-orange-400 focus:shadow-[0_0_10px_rgba(255,160,70,0.2)] transition-all duration-200'
                placeholder='请输入验证码'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                公司
              </label>
              <input
                type='text'
                name='company'
                value={formData.company}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-orange-400 border-opacity-20 rounded-lg text-white focus:outline-none focus:border-orange-400 focus:shadow-[0_0_10px_rgba(255,160,70,0.2)] transition-all duration-200'
                placeholder='请输入您的公司名称'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-white mb-2'>
                职位
              </label>
              <input
                type='text'
                name='position'
                value={formData.position}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-orange-400 border-opacity-20 rounded-lg text-white focus:outline-none focus:border-orange-400 focus:shadow-[0_0_10px_rgba(255,160,70,0.2)] transition-all duration-200'
                placeholder='请输入您的职位'
              />
            </div>
          </div>

          <div className='flex items-center'>
            <input
              type='checkbox'
              id='agreement'
              required
              className='mr-2 text-orange-400'
            />
            <label
              htmlFor='agreement'
              className='text-sm text-white opacity-80'
            >
              我已阅读并同意
              <a href='#' className='text-orange-400 hover:underline'>
                活动条款
              </a>
            </label>
          </div>

          <button
            type='submit'
            className='w-full px-6 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-all duration-300 shadow-lg shadow-orange-400/20 hover:shadow-orange-400/40'
          >
            提交报名
          </button>
        </form>
      </div>
    </div>
  );
};

export default ActivityRegistration;

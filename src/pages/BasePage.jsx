import React from 'react';

const BasePage = ({ title, description, children }) => {
  return (
    <div className='p-6 bg-[#1a0d08] min-h-screen'>
      <h1 className='text-2xl font-bold text-orange-400 mb-6'>{title}</h1>
      <p className='text-white opacity-70 mb-8'>{description}</p>

      {/* 页面内容 */}
      <div className='space-y-6'>{children}</div>

      {/* 示例内容 - 可以根据需要替换 */}
      <div className='glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20'>
        <h2 className='text-xl font-semibold text-white mb-4'>页面内容</h2>
        <p className='text-white opacity-80'>
          这是页面的核心内容区域。根据具体页面需求，可以替换为表单、列表、图表、详情等不同类型的内容。
        </p>
      </div>
    </div>
  );
};

export default BasePage;

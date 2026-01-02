import React from 'react';

const ActivitiesList = () => {
  return (
    <div className='p-6 bg-[#1a0d08] min-h-screen'>
      <h1 className='text-2xl font-bold text-orange-400 mb-6'>活动列表页</h1>
      <p className='text-white opacity-70 mb-8'>
        展示限时折扣、试用福利、行业沙龙等活动，支持筛选/搜索，显示活动时间、规则、参与方式。
      </p>

      {/* 活动列表内容 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* 活动卡片示例 */}
        <div className='glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20 hover:-translate-y-2 transition-all duration-300'>
          <h3 className='text-xl font-semibold text-white mb-3'>
            2025年行业沙龙
          </h3>
          <p className='text-white opacity-70 mb-4'>
            邀请行业专家分享最新趋势和技术
          </p>
          <div className='flex justify-between items-center text-sm text-gray-400 mb-4'>
            <span>时间：2025-01-15 14:00</span>
            <span>地点：线上直播</span>
          </div>
          <button className='w-full py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-all duration-300'>
            查看详情
          </button>
        </div>

        {/* 更多活动卡片... */}
      </div>
    </div>
  );
};

export default ActivitiesList;

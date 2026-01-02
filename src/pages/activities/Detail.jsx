import React from 'react';

const ActivityDetail = () => {
  return (
    <div className='p-6 bg-[#1a0d08] min-h-screen'>
      <h1 className='text-2xl font-bold text-orange-400 mb-6'>活动详情页</h1>
      <p className='text-white opacity-70 mb-8'>
        展示单场活动的具体内容、报名入口、奖品说明，关联用户报名状态。
      </p>

      {/* 活动详情内容 */}
      <div className='glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20 mb-6'>
        <h2 className='text-xl font-semibold text-white mb-4'>
          2025年行业沙龙
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
          <div className='bg-[rgba(255,255,255,0.05)] p-4 rounded-lg'>
            <h3 className='text-sm text-orange-400 mb-2'>活动时间</h3>
            <p className='text-white'>2025-01-15 14:00 - 16:00</p>
          </div>
          <div className='bg-[rgba(255,255,255,0.05)] p-4 rounded-lg'>
            <h3 className='text-sm text-orange-400 mb-2'>活动地点</h3>
            <p className='text-white'>线上直播</p>
          </div>
          <div className='bg-[rgba(255,255,255,0.05)] p-4 rounded-lg'>
            <h3 className='text-sm text-orange-400 mb-2'>活动状态</h3>
            <p className='text-green-400'>报名进行中</p>
          </div>
        </div>

        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-white mb-3'>活动内容</h3>
          <p className='text-white opacity-80 leading-relaxed'>
            本次行业沙龙将邀请多位行业专家，分享房地产估价行业的最新趋势和技术发展。
            包括AI估价技术、大数据分析、GIS应用等热门话题，为参会者提供宝贵的行业见解和交流机会。
          </p>
        </div>

        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-white mb-3'>报名入口</h3>
          <button className='px-6 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-lg transition-all duration-300'>
            立即报名
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;

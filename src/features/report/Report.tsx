import { useState } from 'react';

const Report = () => {
  const [reportType, setReportType] = useState('valuation');
  const [propertyInfo, setPropertyInfo] = useState({
    address: '湘潭市雨湖区建设北路1号',
    area: '120',
    rooms: '3',
    valuationPrice: '980000',
    valuationDate: new Date().toLocaleDateString(),
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setPropertyInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleReportTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReportType(e.target.value);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // 模拟报告生成过程
    setTimeout(() => {
      // 实际项目中会调用后端API生成真实报告
      setReportUrl('#');
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className='max-w-3xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6 text-primary-600'>报告生成</h1>

      <div className='bg-white shadow-lg rounded-lg p-6 mb-8'>
        <h2 className='text-xl font-semibold mb-4'>选择报告类型</h2>

        <div className='flex space-x-6 mb-6'>
          <label className='flex items-center'>
            <input
              type='radio'
              name='reportType'
              value='valuation'
              checked={reportType === 'valuation'}
              onChange={handleReportTypeChange}
              className='mr-2'
            />
            <span>估价报告</span>
          </label>
          <label className='flex items-center'>
            <input
              type='radio'
              name='reportType'
              value='comparison'
              checked={reportType === 'comparison'}
              onChange={handleReportTypeChange}
              className='mr-2'
            />
            <span>比较分析报告</span>
          </label>
          <label className='flex items-center'>
            <input
              type='radio'
              name='reportType'
              value='investment'
              checked={reportType === 'investment'}
              onChange={handleReportTypeChange}
              className='mr-2'
            />
            <span>投资分析报告</span>
          </label>
        </div>

        <h2 className='text-xl font-semibold mb-4'>房产信息</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              房产地址
            </label>
            <textarea
              name='address'
              value={propertyInfo.address}
              onChange={handleChange}
              rows={2}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            ></textarea>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              建筑面积 (㎡)
            </label>
            <input
              type='text'
              name='area'
              value={propertyInfo.area}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              房间数量
            </label>
            <input
              type='text'
              name='rooms'
              value={propertyInfo.rooms}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              估价结果 (元)
            </label>
            <input
              type='text'
              name='valuationPrice'
              value={propertyInfo.valuationPrice}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>

          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              估价日期
            </label>
            <input
              type='text'
              name='valuationDate'
              value={propertyInfo.valuationDate}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>
        </div>

        <div className='mt-6'>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className='bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors font-medium mr-4'
          >
            {isGenerating ? '生成中...' : '生成报告'}
          </button>

          {reportUrl && (
            <a
              href={reportUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium'
            >
              查看报告
            </a>
          )}
        </div>
      </div>

      {isGenerating && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <div className='flex items-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-4'></div>
            <div>
              <h3 className='font-semibold text-blue-700'>正在生成报告...</h3>
              <p className='text-sm text-blue-600'>
                报告生成过程可能需要几分钟，请耐心等待
              </p>
            </div>
          </div>
        </div>
      )}

      {reportUrl && !isGenerating && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
          <h3 className='font-semibold text-green-700 mb-2'>报告生成成功！</h3>
          <p className='text-green-600 mb-4'>
            您的
            {reportType === 'valuation'
              ? '估价报告'
              : reportType === 'comparison'
                ? '比较分析报告'
                : '投资分析报告'}
            已成功生成
          </p>
          <div className='flex space-x-4'>
            <a
              href={reportUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium'
            >
              <i className='fas fa-file-pdf mr-2'></i> 查看PDF报告
            </a>
            <a
              href={reportUrl}
              download
              className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium'
            >
              <i className='fas fa-download mr-2'></i> 下载报告
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;

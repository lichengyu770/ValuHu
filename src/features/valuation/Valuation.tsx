import { useState } from 'react';

const Valuation = () => {
  const [formData, setFormData] = useState({
    city: '湘潭',
    district: '雨湖',
    area: '',
    rooms: '3',
    bathrooms: '2',
    year: '',
    buildingType: 'apartment',
  });

  const [valuationResult, setValuationResult] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 模拟估价算法，实际项目中会调用后端API
    const basePrice = 8000; // 基础单价
    const area = parseFloat(formData.area) || 0;
    const year = parseInt(formData.year) || 0;
    const yearFactor =
      year > 0
        ? Math.max(0.7, 1 - (new Date().getFullYear() - year) * 0.01)
        : 1;

    const result = Math.round(basePrice * area * yearFactor);
    setValuationResult(result);
  };

  return (
    <div className='max-w-2xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6 text-primary-600'>房产估价</h1>

      <form
        onSubmit={handleSubmit}
        className='bg-white shadow-lg rounded-lg p-6 mb-8'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              城市
            </label>
            <select
              name='city'
              value={formData.city}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            >
              <option value='湘潭'>湘潭</option>
              <option value='长沙'>长沙</option>
              <option value='株洲'>株洲</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              区域
            </label>
            <select
              name='district'
              value={formData.district}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            >
              <option value='雨湖'>雨湖</option>
              <option value='岳塘'>岳塘</option>
              <option value='湘潭县'>湘潭县</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              建筑面积 (㎡)
            </label>
            <input
              type='number'
              name='area'
              value={formData.area}
              onChange={handleChange}
              placeholder='请输入建筑面积'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              建造年份
            </label>
            <input
              type='number'
              name='year'
              value={formData.year}
              onChange={handleChange}
              placeholder='请输入建造年份'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              房间数量
            </label>
            <select
              name='rooms'
              value={formData.rooms}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            >
              <option value='1'>1室</option>
              <option value='2'>2室</option>
              <option value='3'>3室</option>
              <option value='4'>4室</option>
              <option value='5+'>5室及以上</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              卫生间数量
            </label>
            <select
              name='bathrooms'
              value={formData.bathrooms}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            >
              <option value='1'>1卫</option>
              <option value='2'>2卫</option>
              <option value='3+'>3卫及以上</option>
            </select>
          </div>

          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              建筑类型
            </label>
            <select
              name='buildingType'
              value={formData.buildingType}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            >
              <option value='apartment'>公寓</option>
              <option value='villa'>别墅</option>
              <option value='townhouse'>联排别墅</option>
              <option value='commercial'>商业地产</option>
            </select>
          </div>
        </div>

        <div className='mt-6'>
          <button
            type='submit'
            className='w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 transition-colors font-medium'
          >
            开始估价
          </button>
        </div>
      </form>

      {valuationResult && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
          <h2 className='text-2xl font-bold mb-2 text-green-700'>估价结果</h2>
          <p className='text-3xl font-bold text-green-600'>
            ¥{valuationResult.toLocaleString()}
          </p>
          <p className='text-sm text-green-600 mt-2'>
            估价范围：¥{Math.round(valuationResult * 0.95).toLocaleString()} - ¥
            {Math.round(valuationResult * 1.05).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default Valuation;

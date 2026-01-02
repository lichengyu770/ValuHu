import { useState } from 'react';

interface Property {
  id: string;
  city: string;
  district: string;
  area: number;
  price: number;
  rooms: string;
  year: number;
}

const Search = () => {
  const [searchParams, setSearchParams] = useState({
    city: '湘潭',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    rooms: '',
  });

  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 模拟数据
  const mockProperties: Property[] = [
    {
      id: '1',
      city: '湘潭',
      district: '雨湖',
      area: 120,
      price: 980000,
      rooms: '3',
      year: 2018,
    },
    {
      id: '2',
      city: '湘潭',
      district: '岳塘',
      area: 95,
      price: 760000,
      rooms: '2',
      year: 2020,
    },
    {
      id: '3',
      city: '湘潭',
      district: '雨湖',
      area: 145,
      price: 1280000,
      rooms: '4',
      year: 2016,
    },
    {
      id: '4',
      city: '湘潭',
      district: '湘潭县',
      area: 88,
      price: 680000,
      rooms: '2',
      year: 2019,
    },
    {
      id: '5',
      city: '湘潭',
      district: '岳塘',
      area: 110,
      price: 890000,
      rooms: '3',
      year: 2021,
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    // 模拟搜索延迟
    setTimeout(() => {
      const results = mockProperties.filter((property) => {
        const matchesPrice =
          (!searchParams.minPrice ||
            property.price >= parseInt(searchParams.minPrice)) &&
          (!searchParams.maxPrice ||
            property.price <= parseInt(searchParams.maxPrice));

        const matchesArea =
          (!searchParams.minArea ||
            property.area >= parseInt(searchParams.minArea)) &&
          (!searchParams.maxArea ||
            property.area <= parseInt(searchParams.maxArea));

        const matchesRooms =
          !searchParams.rooms || property.rooms === searchParams.rooms;

        return matchesPrice && matchesArea && matchesRooms;
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6 text-primary-600'>高级搜索</h1>

      <form
        onSubmit={handleSearch}
        className='bg-white shadow-lg rounded-lg p-6 mb-8'
      >
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              城市
            </label>
            <select
              name='city'
              value={searchParams.city}
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
              最低价格 (万元)
            </label>
            <input
              type='number'
              name='minPrice'
              value={searchParams.minPrice}
              onChange={handleChange}
              placeholder='最低价格'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              最高价格 (万元)
            </label>
            <input
              type='number'
              name='maxPrice'
              value={searchParams.maxPrice}
              onChange={handleChange}
              placeholder='最高价格'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              最小面积 (㎡)
            </label>
            <input
              type='number'
              name='minArea'
              value={searchParams.minArea}
              onChange={handleChange}
              placeholder='最小面积'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              最大面积 (㎡)
            </label>
            <input
              type='number'
              name='maxArea'
              value={searchParams.maxArea}
              onChange={handleChange}
              placeholder='最大面积'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              房间数量
            </label>
            <select
              name='rooms'
              value={searchParams.rooms}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
            >
              <option value=''>全部</option>
              <option value='1'>1室</option>
              <option value='2'>2室</option>
              <option value='3'>3室</option>
              <option value='4'>4室</option>
              <option value='5+'>5室及以上</option>
            </select>
          </div>
        </div>

        <div className='mt-6'>
          <button
            type='submit'
            className='bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors font-medium'
            disabled={isSearching}
          >
            {isSearching ? '搜索中...' : '开始搜索'}
          </button>
        </div>
      </form>

      <div className='bg-white shadow-lg rounded-lg p-6'>
        <h2 className='text-2xl font-bold mb-4'>搜索结果</h2>

        {isSearching ? (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>正在搜索中...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className='text-center py-12 text-gray-600'>
            暂无符合条件的房产
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='border border-gray-300 px-4 py-2 text-left'>
                    区域
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left'>
                    面积 (㎡)
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left'>
                    价格 (万元)
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left'>
                    房间数量
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left'>
                    建造年份
                  </th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((property) => (
                  <tr
                    key={property.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='border border-gray-300 px-4 py-2'>
                      {property.district}
                    </td>
                    <td className='border border-gray-300 px-4 py-2'>
                      {property.area}
                    </td>
                    <td className='border border-gray-300 px-4 py-2'>
                      {property.price.toLocaleString()}
                    </td>
                    <td className='border border-gray-300 px-4 py-2'>
                      {property.rooms}
                    </td>
                    <td className='border border-gray-300 px-4 py-2'>
                      {property.year}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

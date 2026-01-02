const Contact = () => {
  return (
    <div className='max-w-3xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6 text-primary-600'>联系我们</h1>

      <div className='bg-white shadow-lg rounded-lg p-6 mb-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div>
            <h2 className='text-xl font-semibold mb-4'>联系方式</h2>

            <div className='space-y-4'>
              <div className='flex items-start'>
                <div className='bg-primary-100 text-primary-600 rounded-full p-3 mr-4'>
                  <i className='fas fa-map-marker-alt'></i>
                </div>
                <div>
                  <h3 className='font-semibold mb-1'>公司地址</h3>
                  <p className='text-gray-600'>湖南省湘潭市雨湖区建设北路1号</p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='bg-primary-100 text-primary-600 rounded-full p-3 mr-4'>
                  <i className='fas fa-phone'></i>
                </div>
                <div>
                  <h3 className='font-semibold mb-1'>联系电话</h3>
                  <p className='text-gray-600'>16680508457</p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='bg-primary-100 text-primary-600 rounded-full p-3 mr-4'>
                  <i className='fas fa-envelope'></i>
                </div>
                <div>
                  <h3 className='font-semibold mb-1'>电子邮箱</h3>
                  <p className='text-gray-600'>1558691995@qq.com</p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='bg-primary-100 text-primary-600 rounded-full p-3 mr-4'>
                  <i className='fas fa-clock'></i>
                </div>
                <div>
                  <h3 className='font-semibold mb-1'>营业时间</h3>
                  <p className='text-gray-600'>周一至周五：9:00 - 18:00</p>
                  <p className='text-gray-600'>周六至周日：10:00 - 16:00</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className='text-xl font-semibold mb-4'>在线留言</h2>

            <form className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  姓名
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
                  placeholder='请输入您的姓名'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  联系电话
                </label>
                <input
                  type='tel'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
                  placeholder='请输入您的联系电话'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  电子邮箱
                </label>
                <input
                  type='email'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
                  placeholder='请输入您的电子邮箱'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  留言内容
                </label>
                <textarea
                  rows={4}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
                  placeholder='请输入您的留言内容'
                ></textarea>
              </div>

              <div>
                <button
                  type='submit'
                  className='w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 transition-colors font-medium'
                >
                  提交留言
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className='bg-white shadow-lg rounded-lg p-6'>
        <h2 className='text-xl font-semibold mb-4'>关注我们</h2>

        <div className='flex justify-center space-x-8 py-4'>
          <a
            href='#'
            className='text-primary-600 hover:text-primary-700 transition-colors'
          >
            <i className='fab fa-weixin text-4xl'></i>
            <p className='text-sm mt-1'>微信公众号</p>
          </a>

          <a
            href='#'
            className='text-primary-600 hover:text-primary-700 transition-colors'
          >
            <i className='fab fa-weibo text-4xl'></i>
            <p className='text-sm mt-1'>新浪微博</p>
          </a>

          <a
            href='#'
            className='text-primary-600 hover:text-primary-700 transition-colors'
          >
            <i className='fab fa-qq text-4xl'></i>
            <p className='text-sm mt-1'>QQ咨询</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;

const About = () => {
  return (
    <div className='max-w-3xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6 text-primary-600'>关于我们</h1>

      <div className='bg-white shadow-lg rounded-lg p-6 mb-8'>
        <h2 className='text-xl font-semibold mb-4'>公司简介</h2>
        <p className='text-gray-600 mb-4'>
          湘潭市房算云互联网科技有限公司成立于2018年，是一家专注于房产估价技术研发和应用的高科技企业。公司依托先进的大数据分析和人工智能技术，为客户提供准确、高效、专业的房产估价服务。
        </p>
        <p className='text-gray-600 mb-4'>
          我们的核心团队由来自房地产、金融、计算机等领域的专业人士组成，具有丰富的行业经验和技术积累。公司始终坚持以客户为中心，不断创新和完善产品服务，致力于成为房产估价领域的领先企业。
        </p>
      </div>

      <div className='bg-white shadow-lg rounded-lg p-6 mb-8'>
        <h2 className='text-xl font-semibold mb-4'>核心优势</h2>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='border border-gray-200 rounded-lg p-4'>
            <h3 className='font-semibold text-primary-600 mb-2'>技术优势</h3>
            <p className='text-sm text-gray-600'>
              采用先进的大数据分析和人工智能技术，确保估价结果的准确性和可靠性
            </p>
          </div>

          <div className='border border-gray-200 rounded-lg p-4'>
            <h3 className='font-semibold text-primary-600 mb-2'>团队优势</h3>
            <p className='text-sm text-gray-600'>
              核心团队具有丰富的行业经验和技术积累，能够为客户提供专业的服务
            </p>
          </div>

          <div className='border border-gray-200 rounded-lg p-4'>
            <h3 className='font-semibold text-primary-600 mb-2'>服务优势</h3>
            <p className='text-sm text-gray-600'>
              以客户为中心，提供个性化、定制化的服务，满足不同客户的需求
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white shadow-lg rounded-lg p-6'>
        <h2 className='text-xl font-semibold mb-4'>联系我们</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h3 className='font-semibold mb-2'>公司地址</h3>
            <p className='text-gray-600 mb-4'>湖南省湘潭市雨湖区建设北路1号</p>

            <h3 className='font-semibold mb-2'>联系方式</h3>
            <p className='text-gray-600 mb-2'>电话：16680508457</p>
            <p className='text-gray-600'>邮箱：1558691995@qq.com</p>
          </div>

          <div>
            <h3 className='font-semibold mb-2'>营业时间</h3>
            <p className='text-gray-600 mb-2'>周一至周五：9:00 - 18:00</p>
            <p className='text-gray-600 mb-4'>周六至周日：10:00 - 16:00</p>

            <h3 className='font-semibold mb-2'>关注我们</h3>
            <div className='flex space-x-4'>
              <a
                href='#'
                className='text-primary-600 hover:text-primary-700 transition-colors'
              >
                <i className='fab fa-weixin text-2xl'></i>
              </a>
              <a
                href='#'
                className='text-primary-600 hover:text-primary-700 transition-colors'
              >
                <i className='fab fa-weibo text-2xl'></i>
              </a>
              <a
                href='#'
                className='text-primary-600 hover:text-primary-700 transition-colors'
              >
                <i className='fab fa-qq text-2xl'></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

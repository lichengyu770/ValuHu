// 城市选择器组件
class CitySelector {
  constructor(
    citySelectId,
    districtSelectId,
    subdistrictSelectId,
    communitySelectId
  ) {
    this.citySelect = document.getElementById(citySelectId);
    this.districtSelect = document.getElementById(districtSelectId);
    this.subdistrictSelect = document.getElementById(subdistrictSelectId);
    this.communitySelect = document.getElementById(communitySelectId);

    // 初始化数据
    this.initData();
    // 绑定事件
    this.bindEvents();
    // 初始化城市选择框
    this.initCitySelect();
  }

  // 初始化城市选择框
  initCitySelect() {
    // 清空城市选择框
    this.citySelect.innerHTML = '<option value="">选择城市</option>';

    // 定义城市名称映射
    const cityNameMap = {
      // 直辖市
      shanghai: '上海',
      tianjin: '天津',
      beijing: '北京',
      chongqing: '重庆',

      // 山西省
      taiyuan: '太原',
      datong: '大同',
      jincheng: '晋城',

      // 辽宁省
      shenyang: '沈阳',
      dalian: '大连',
      anshan: '鞍山',

      // 吉林省
      changchun: '长春',
      jilin: '吉林',
      tonghua: '通化',

      // 黑龙江省
      harbin: '哈尔滨',
      daqing: '大庆',
      mudanjiang: '牡丹江',

      // 江苏省
      nanjing: '南京',
      suzhou: '苏州',
      wuxi: '无锡',

      // 浙江省
      hangzhou: '杭州',
      ningbo: '宁波',
      jinhua: '金华',

      // 安徽省
      hefei: '合肥',
      wuhu: '芜湖',
      huangshan: '黄山',

      // 福建省
      fuzhou: '福州',
      xiamen: '厦门',
      quanzhou: '泉州',

      // 江西省
      nanchang: '南昌',
      ganzhou: '赣州',
      jiujiang: '九江',

      // 山东省
      jinan: '济南',
      qingdao: '青岛',
      weifang: '潍坊',

      // 河南省
      zhengzhou: '郑州',
      luoyang: '洛阳',
      nanyang: '南阳',

      // 湖北省
      wuhan: '武汉',
      xiangyang: '襄阳',
      yichang: '宜昌',

      // 湖南省
      changsha: '长沙',
      zhuzhou: '株洲',
      xiangtan: '湘潭',
      hengyang: '衡阳',
      shaoyang: '邵阳',
      yueyang: '岳阳',
      changde: '常德',
      zhangjiajie: '张家界',
      yiyang: '益阳',
      chenzhou: '郴州',
      yongzhou: '永州',
      huaihua: '怀化',
      loudi: '娄底',
      xiangxi: '湘西土家族苗族自治州',

      // 广东省
      guangzhou: '广州',
      shenzhen: '深圳',
      foshan: '佛山',

      // 海南省
      haikou: '海口',
      sanya: '三亚',
      danzhou: '儋州',

      // 四川省
      chengdu: '成都',

      // 贵州省
      guiyang: '贵阳',

      // 云南省
      kunming: '昆明',

      // 陕西省
      xian: '西安',

      // 甘肃省
      lanzhou: '兰州',

      // 青海省
      xining: '西宁',

      // 内蒙古自治区
      huhehaote: '呼和浩特',

      // 广西壮族自治区
      nanning: '南宁',

      // 西藏自治区
      lhasa: '拉萨',

      // 宁夏回族自治区
      yinchuan: '银川',

      // 新疆维吾尔自治区
      urumqi: '乌鲁木齐',

      // 河北省
      shijiazhuang: '石家庄',
      tangshan: '唐山',
      handan: '邯郸',
      xingtai: '邢台',
    };

    // 遍历districtData，填充城市选择框
    for (const cityKey in this.districtData) {
      if (this.districtData.hasOwnProperty(cityKey)) {
        const option = document.createElement('option');
        option.value = cityKey;
        option.textContent = cityNameMap[cityKey] || cityKey;
        this.citySelect.appendChild(option);
      }
    }
  }

  // 初始化城市选择数据
  initData() {
    // 区域数据，包含32个城市相关区域
    this.districtData = {
      // 直辖市
      shanghai: [
        { value: '黄浦区', text: '黄浦区' },
        { value: '静安区', text: '静安区' },
        { value: '长宁区', text: '长宁区' },
        { value: '浦东新区', text: '浦东新区' },
        { value: '徐汇区', text: '徐汇区' },
        { value: '普陀区', text: '普陀区' },
        { value: '虹口区', text: '虹口区' },
        { value: '杨浦区', text: '杨浦区' },
        { value: '闵行区', text: '闵行区' },
        { value: '宝山区', text: '宝山区' },
        { value: '嘉定区', text: '嘉定区' },
        { value: '金山区', text: '金山区' },
        { value: '松江区', text: '松江区' },
        { value: '青浦区', text: '青浦区' },
        { value: '奉贤区', text: '奉贤区' },
        { value: '崇明区', text: '崇明区' },
      ],
      tianjin: [
        { value: '和平区', text: '和平区' },
        { value: '滨海新区', text: '滨海新区' },
        { value: '南开区', text: '南开区' },
        { value: '北辰区', text: '北辰区' },
        { value: '河西区', text: '河西区' },
        { value: '河东区', text: '河东区' },
        { value: '河北区', text: '河北区' },
        { value: '红桥区', text: '红桥区' },
        { value: '东丽区', text: '东丽区' },
        { value: '西青区', text: '西青区' },
        { value: '津南区', text: '津南区' },
        { value: '武清区', text: '武清区' },
        { value: '宝坻区', text: '宝坻区' },
        { value: '蓟州区', text: '蓟州区' },
        { value: '宁河区', text: '宁河区' },
        { value: '静海区', text: '静海区' },
      ],
      beijing: [
        { value: '东城区', text: '东城区' },
        { value: '西城区', text: '西城区' },
        { value: '朝阳区', text: '朝阳区' },
        { value: '海淀区', text: '海淀区' },
        { value: '丰台区', text: '丰台区' },
      ],
      chongqing: [
        { value: '渝中区', text: '渝中区' },
        { value: '两江新区', text: '两江新区' },
        { value: '九龙坡区', text: '九龙坡区' },
        { value: '渝北区', text: '渝北区' },
        { value: '江北区', text: '江北区' },
        { value: '南岸区', text: '南岸区' },
        { value: '沙坪坝区', text: '沙坪坝区' },
        { value: '大渡口区', text: '大渡口区' },
        { value: '北碚区', text: '北碚区' },
        { value: '巴南区', text: '巴南区' },
        { value: '万州区', text: '万州区' },
        { value: '涪陵区', text: '涪陵区' },
        { value: '长寿区', text: '长寿区' },
        { value: '合川区', text: '合川区' },
        { value: '永川区', text: '永川区' },
        { value: '南川区', text: '南川区' },
      ],
      // 河北省
      shijiazhuang: [
        { value: '长安区', text: '长安区' },
        { value: '桥西区', text: '桥西区' },
        { value: '新华区', text: '新华区' },
        { value: '裕华区', text: '裕华区' },
        { value: '鹿泉区', text: '鹿泉区' },
        { value: '栾城区', text: '栾城区' },
        { value: '藁城区', text: '藁城区' },
      ],
      tangshan: [
        { value: '路北区', text: '路北区' },
        { value: '路南区', text: '路南区' },
        { value: '古冶区', text: '古冶区' },
        { value: '开平区', text: '开平区' },
        { value: '丰南区', text: '丰南区' },
        { value: '丰润区', text: '丰润区' },
        { value: '曹妃甸区', text: '曹妃甸区' },
      ],
      handan: [
        { value: '丛台区', text: '丛台区' },
        { value: '邯山区', text: '邯山区' },
        { value: '复兴区', text: '复兴区' },
        { value: '峰峰矿区', text: '峰峰矿区' },
        { value: '肥乡区', text: '肥乡区' },
        { value: '永年区', text: '永年区' },
        { value: '临漳县', text: '临漳县' },
      ],
      xingtai: [
        { value: '信都区', text: '信都区' },
        { value: '襄都区', text: '襄都区' },
        { value: '任泽区', text: '任泽区' },
        { value: '南和区', text: '南和区' },
        { value: '巨鹿县', text: '巨鹿县' },
        { value: '临城县', text: '临城县' },
        { value: '内丘县', text: '内丘县' },
      ],

      // 湖南省内城市
      changsha: [
        { value: '芙蓉区', text: '芙蓉区' },
        { value: '天心区', text: '天心区' },
        { value: '岳麓区', text: '岳麓区' },
        { value: '开福区', text: '开福区' },
        { value: '雨花区', text: '雨花区' },
        { value: '望城区', text: '望城区' },
        { value: '长沙县', text: '长沙县' },
        { value: '浏阳市', text: '浏阳市' },
        { value: '宁乡市', text: '宁乡市' },
      ],
      zhuzhou: [
        { value: '荷塘区', text: '荷塘区' },
        { value: '石峰区', text: '石峰区' },
        { value: '芦淞区', text: '芦淞区' },
        { value: '天元区', text: '天元区' },
        { value: '渌口区', text: '渌口区' },
        { value: '攸县', text: '攸县' },
        { value: '茶陵县', text: '茶陵县' },
        { value: '炎陵县', text: '炎陵县' },
        { value: '醴陵市', text: '醴陵市' },
      ],
      xiangtan: [
        { value: '雨湖区', text: '雨湖区' },
        { value: '岳塘区', text: '岳塘区' },
        { value: '湘潭县', text: '湘潭县' },
        { value: '湘乡市', text: '湘乡市' },
        { value: '韶山市', text: '韶山市' },
      ],
      hengyang: [
        { value: '珠晖区', text: '珠晖区' },
        { value: '雁峰区', text: '雁峰区' },
        { value: '石鼓区', text: '石鼓区' },
        { value: '蒸湘区', text: '蒸湘区' },
        { value: '南岳区', text: '南岳区' },
        { value: '衡阳县', text: '衡阳县' },
        { value: '衡南县', text: '衡南县' },
        { value: '衡山县', text: '衡山县' },
        { value: '衡东县', text: '衡东县' },
        { value: '祁东县', text: '祁东县' },
        { value: '耒阳市', text: '耒阳市' },
        { value: '常宁市', text: '常宁市' },
      ],
      shaoyang: [
        { value: '双清区', text: '双清区' },
        { value: '大祥区', text: '大祥区' },
        { value: '北塔区', text: '北塔区' },
        { value: '新邵县', text: '新邵县' },
        { value: '邵阳县', text: '邵阳县' },
        { value: '隆回县', text: '隆回县' },
        { value: '洞口县', text: '洞口县' },
        { value: '新宁县', text: '新宁县' },
        { value: '绥宁县', text: '绥宁县' },
        { value: '城步苗族自治县', text: '城步苗族自治县' },
        { value: '武冈市', text: '武冈市' },
        { value: '邵东市', text: '邵东市' },
      ],
      yueyang: [
        { value: '岳阳楼区', text: '岳阳楼区' },
        { value: '云溪区', text: '云溪区' },
        { value: '君山区', text: '君山区' },
        { value: '岳阳县', text: '岳阳县' },
        { value: '平江县', text: '平江县' },
        { value: '湘阴县', text: '湘阴县' },
        { value: '华容县', text: '华容县' },
        { value: '汨罗市', text: '汨罗市' },
        { value: '临湘市', text: '临湘市' },
      ],
      changde: [
        { value: '武陵区', text: '武陵区' },
        { value: '鼎城区', text: '鼎城区' },
        { value: '安乡县', text: '安乡县' },
        { value: '汉寿县', text: '汉寿县' },
        { value: '澧县', text: '澧县' },
        { value: '临澧县', text: '临澧县' },
        { value: '桃源县', text: '桃源县' },
        { value: '石门县', text: '石门县' },
        { value: '津市市', text: '津市市' },
      ],
      zhangjiajie: [
        { value: '永定区', text: '永定区' },
        { value: '武陵源区', text: '武陵源区' },
        { value: '慈利县', text: '慈利县' },
        { value: '桑植县', text: '桑植县' },
      ],
      yiyang: [
        { value: '资阳区', text: '资阳区' },
        { value: '赫山区', text: '赫山区' },
        { value: '南县', text: '南县' },
        { value: '桃江县', text: '桃江县' },
        { value: '安化县', text: '安化县' },
        { value: '沅江市', text: '沅江市' },
      ],
      chenzhou: [
        { value: '北湖区', text: '北湖区' },
        { value: '苏仙区', text: '苏仙区' },
        { value: '桂阳县', text: '桂阳县' },
        { value: '永兴县', text: '永兴县' },
        { value: '宜章县', text: '宜章县' },
        { value: '嘉禾县', text: '嘉禾县' },
        { value: '临武县', text: '临武县' },
        { value: '汝城县', text: '汝城县' },
        { value: '桂东县', text: '桂东县' },
        { value: '安仁县', text: '安仁县' },
        { value: '资兴市', text: '资兴市' },
      ],
      yongzhou: [
        { value: '零陵区', text: '零陵区' },
        { value: '冷水滩区', text: '冷水滩区' },
        { value: '东安县', text: '东安县' },
        { value: '道县', text: '道县' },
        { value: '宁远县', text: '宁远县' },
        { value: '江永县', text: '江永县' },
        { value: '江华瑶族自治县', text: '江华瑶族自治县' },
        { value: '蓝山县', text: '蓝山县' },
        { value: '新田县', text: '新田县' },
        { value: '双牌县', text: '双牌县' },
        { value: '祁阳市', text: '祁阳市' },
      ],
      huaihua: [
        { value: '鹤城区', text: '鹤城区' },
        { value: '中方县', text: '中方县' },
        { value: '沅陵县', text: '沅陵县' },
        { value: '辰溪县', text: '辰溪县' },
        { value: '溆浦县', text: '溆浦县' },
        { value: '麻阳苗族自治县', text: '麻阳苗族自治县' },
        { value: '会同县', text: '会同县' },
        { value: '新晃侗族自治县', text: '新晃侗族自治县' },
        { value: '芷江侗族自治县', text: '芷江侗族自治县' },
        { value: '靖州苗族侗族自治县', text: '靖州苗族侗族自治县' },
        { value: '通道侗族自治县', text: '通道侗族自治县' },
        { value: '洪江市', text: '洪江市' },
      ],
      loudi: [
        { value: '娄星区', text: '娄星区' },
        { value: '双峰县', text: '双峰县' },
        { value: '新化县', text: '新化县' },
        { value: '冷水江市', text: '冷水江市' },
        { value: '涟源市', text: '涟源市' },
      ],
      xiangxi: [
        { value: '吉首市', text: '吉首市' },
        { value: '泸溪县', text: '泸溪县' },
        { value: '凤凰县', text: '凤凰县' },
        { value: '花垣县', text: '花垣县' },
        { value: '保靖县', text: '保靖县' },
        { value: '古丈县', text: '古丈县' },
        { value: '永顺县', text: '永顺县' },
        { value: '龙山县', text: '龙山县' },
      ],

      // 其他省份城市
      guangzhou: [
        { value: '天河区', text: '天河区' },
        { value: '越秀区', text: '越秀区' },
        { value: '海珠区', text: '海珠区' },
        { value: '荔湾区', text: '荔湾区' },
        { value: '白云区', text: '白云区' },
      ],
      shenzhen: [
        { value: '福田区', text: '福田区' },
        { value: '罗湖区', text: '罗湖区' },
        { value: '南山区', text: '南山区' },
        { value: '宝安区', text: '宝安区' },
        { value: '龙岗区', text: '龙岗区' },
      ],
      hangzhou: [
        { value: '上城区', text: '上城区' },
        { value: '拱墅区', text: '拱墅区' },
        { value: '西湖区', text: '西湖区' },
        { value: '滨江区', text: '滨江区' },
        { value: '萧山区', text: '萧山区' },
      ],
      wuhan: [
        { value: '武昌区', text: '武昌区' },
        { value: '汉口区', text: '汉口区' },
        { value: '汉阳区', text: '汉阳区' },
        { value: '洪山区', text: '洪山区' },
      ],
      yichang: [
        { value: '西陵区', text: '西陵区' },
        { value: '伍家岗区', text: '伍家岗区' },
        { value: '点军区', text: '点军区' },
      ],
      nanchang: [
        { value: '东湖区', text: '东湖区' },
        { value: '西湖区', text: '西湖区' },
        { value: '青云谱区', text: '青云谱区' },
      ],
      jiujiang: [
        { value: '浔阳区', text: '浔阳区' },
        { value: '濂溪区', text: '濂溪区' },
      ],
      ganzhou: [
        { value: '章贡区', text: '章贡区' },
        { value: '南康区', text: '南康区' },
      ],
      shaoguan: [
        { value: '武江区', text: '武江区' },
        { value: '浈江区', text: '浈江区' },
      ],
      nanning: [
        { value: '青秀区', text: '青秀区' },
        { value: '兴宁区', text: '兴宁区' },
        { value: '江南区', text: '江南区' },
      ],
      guilin: [
        { value: '秀峰区', text: '秀峰区' },
        { value: '叠彩区', text: '叠彩区' },
        { value: '象山区', text: '象山区' },
      ],
      guiyang: [
        { value: '云岩区', text: '云岩区' },
        { value: '南明区', text: '南明区' },
      ],
      zunyi: [
        { value: '红花岗区', text: '红花岗区' },
        { value: '汇川区', text: '汇川区' },
      ],
      chengdu: [
        { value: '锦江区', text: '锦江区' },
        { value: '青羊区', text: '青羊区' },
        { value: '金牛区', text: '金牛区' },
      ],
      xiamen: [
        { value: '思明区', text: '思明区' },
        { value: '湖里区', text: '湖里区' },
        { value: '集美区', text: '集美区' },
      ],
    };

    // 遍历districtData，填充城市选择框
    for (const cityKey in this.districtData) {
      if (this.districtData.hasOwnProperty(cityKey)) {
        const option = document.createElement('option');
        option.value = cityKey;
        option.textContent = cityNameMap[cityKey] || cityKey;
        this.citySelect.appendChild(option);
      }
    }
  }

  // 街道/乡镇数据
  subdistrictData = {
    // 上海市
    黄浦区: [
      { value: '豫园街道', text: '豫园街道' },
      { value: '南京东路街道', text: '南京东路街道' },
      { value: '外滩街道', text: '外滩街道' },
      { value: '小东门街道', text: '小东门街道' },
      { value: '老西门街道', text: '老西门街道' },
      { value: '瑞金二路街道', text: '瑞金二路街道' },
      { value: '淮海中路街道', text: '淮海中路街道' },
      { value: '打浦桥街道', text: '打浦桥街道' },
      { value: '五里桥街道', text: '五里桥街道' },
      { value: '半淞园路街道', text: '半淞园路街道' },
    ],
    静安区: [
      { value: '宝山路街道', text: '宝山路街道' },
      { value: '静安寺街道', text: '静安寺街道' },
      { value: '南京西路街道', text: '南京西路街道' },
      { value: '江宁路街道', text: '江宁路街道' },
      { value: '石门二路街道', text: '石门二路街道' },
      { value: '天目西路街道', text: '天目西路街道' },
      { value: '北站街道', text: '北站街道' },
      { value: '共和新路街道', text: '共和新路街道' },
      { value: '大宁路街道', text: '大宁路街道' },
      { value: '彭浦新村街道', text: '彭浦新村街道' },
      { value: '彭浦镇', text: '彭浦镇' },
    ],
    长宁区: [
      { value: '周家桥街道', text: '周家桥街道' },
      { value: '新华路街道', text: '新华路街道' },
      { value: '虹桥街道', text: '虹桥街道' },
      { value: '江苏路街道', text: '江苏路街道' },
      { value: '华阳路街道', text: '华阳路街道' },
      { value: '天山路街道', text: '天山路街道' },
      { value: '仙霞新村街道', text: '仙霞新村街道' },
      { value: '程家桥街道', text: '程家桥街道' },
      { value: '北新泾街道', text: '北新泾街道' },
      { value: '新泾镇', text: '新泾镇' },
    ],
    浦东新区: [
      { value: '塘桥街道', text: '塘桥街道' },
      { value: '陆家嘴街道', text: '陆家嘴街道' },
      { value: '潍坊新村街道', text: '潍坊新村街道' },
      { value: '花木街道', text: '花木街道' },
      { value: '洋泾街道', text: '洋泾街道' },
      { value: '张江镇', text: '张江镇' },
      { value: '金桥镇', text: '金桥镇' },
      { value: '唐镇', text: '唐镇' },
      { value: '川沙新镇', text: '川沙新镇' },
      { value: '北蔡镇', text: '北蔡镇' },
    ],

    // 重庆市
    渝中区: [
      { value: '朝天门街道', text: '朝天门街道' },
      { value: '七星岗街道', text: '七星岗街道' },
      { value: '大溪沟街道', text: '大溪沟街道' },
      { value: '解放碑街道', text: '解放碑街道' },
      { value: '上清寺街道', text: '上清寺街道' },
      { value: '菜园坝街道', text: '菜园坝街道' },
    ],
    两江新区: [
      { value: '金山街道', text: '金山街道' },
      { value: '人和街道', text: '人和街道' },
      { value: '翠云街道', text: '翠云街道' },
      { value: '鸳鸯街道', text: '鸳鸯街道' },
      { value: '天宫殿街道', text: '天宫殿街道' },
      { value: '大竹林街道', text: '大竹林街道' },
    ],
    九龙坡区: [
      { value: '渝州路街道', text: '渝州路街道' },
      { value: '谢家湾街道', text: '谢家湾街道' },
      { value: '石桥铺街道', text: '石桥铺街道' },
      { value: '杨家坪街道', text: '杨家坪街道' },
      { value: '中梁山街道', text: '中梁山街道' },
      { value: '二郎街道', text: '二郎街道' },
    ],
    渝北区: [
      { value: '龙溪街道', text: '龙溪街道' },
      { value: '两路街道', text: '两路街道' },
      { value: '宝圣湖街道', text: '宝圣湖街道' },
      { value: '回兴街道', text: '回兴街道' },
      { value: '悦来街道', text: '悦来街道' },
      { value: '双凤桥街道', text: '双凤桥街道' },
    ],

    // 天津市
    和平区: [
      { value: '南营门街', text: '南营门街' },
      { value: '劝业场街', text: '劝业场街' },
      { value: '五大道街', text: '五大道街' },
      { value: '小白楼街', text: '小白楼街' },
      { value: '新兴街', text: '新兴街' },
      { value: '南市街', text: '南市街' },
    ],
    // 河北省
    // 石家庄市
    长安区: [
      { value: '育才街道', text: '育才街道' },
      { value: '建北街道', text: '建北街道' },
      { value: '河东街道', text: '河东街道' },
      { value: '西兆通镇', text: '西兆通镇' },
      { value: '高营镇', text: '高营镇' },
    ],
    桥西区: [
      { value: '东里街道', text: '东里街道' },
      { value: '中山街道', text: '中山街道' },
      { value: '友谊街道', text: '友谊街道' },
    ],
    // 唐山市
    路北区: [
      { value: '乔屯街道', text: '乔屯街道' },
      { value: '钓鱼台街道', text: '钓鱼台街道' },
      { value: '东新村街道', text: '东新村街道' },
      { value: '文化路街道', text: '文化路街道' },
    ],
    // 邯郸市
    丛台区: [
      { value: '柳林桥街道', text: '柳林桥街道' },
      { value: '联纺东街道', text: '联纺东街道' },
      { value: '联纺西街道', text: '联纺西街道' },
      { value: '光明桥街道', text: '光明桥街道' },
    ],
    // 邢台市
    信都区: [
      { value: '中华大街街道', text: '中华大街街道' },
      { value: '钢铁路街道', text: '钢铁路街道' },
      { value: '达活泉街道', text: '达活泉街道' },
    ],
    襄都区: [
      { value: '南长街街道', text: '南长街街道' },
      { value: '北大街街道', text: '北大街街道' },
      { value: '西大街街道', text: '西大街街道' },
    ],
    滨海新区: [
      { value: '新北街', text: '新北街' },
      { value: '泰达街', text: '泰达街' },
      { value: '塘沽街', text: '塘沽街' },
      { value: '汉沽街', text: '汉沽街' },
      { value: '大港街', text: '大港街' },
      { value: '新河街', text: '新河街' },
    ],
    南开区: [
      { value: '华苑街', text: '华苑街' },
      { value: '体育中心街', text: '体育中心街' },
      { value: '学府街', text: '学府街' },
      { value: '万兴街', text: '万兴街' },
      { value: '长虹街', text: '长虹街' },
      { value: '嘉陵道街', text: '嘉陵道街' },
    ],
    北辰区: [
      { value: '瑞景街', text: '瑞景街' },
      { value: '天穆镇', text: '天穆镇' },
      { value: '普东街', text: '普东街' },
      { value: '集贤里街', text: '集贤里街' },
      { value: '果园新村街', text: '果园新村街' },
      { value: '小淀镇', text: '小淀镇' },
    ],

    // 湖南省内城市
    // 长沙
    芙蓉区: [
      { value: '文艺路街道', text: '文艺路街道' },
      { value: '朝阳街街道', text: '朝阳街街道' },
      { value: '韭菜园街道', text: '韭菜园街道' },
      { value: '五里牌街道', text: '五里牌街道' },
      { value: '火星街道', text: '火星街道' },
      { value: '马王堆街道', text: '马王堆街道' },
      { value: '东屯渡街道', text: '东屯渡街道' },
      { value: '湘湖街道', text: '湘湖街道' },
      { value: '东岸街道', text: '东岸街道' },
      { value: '荷花园街道', text: '荷花园街道' },
      { value: '马坡岭街道', text: '马坡岭街道' },
      { value: '东湖街道', text: '东湖街道' },
      { value: '定王台街道', text: '定王台街道' },
    ],
    天心区: [
      { value: '坡子街街道', text: '坡子街街道' },
      { value: '城南路街道', text: '城南路街道' },
      { value: '裕南街街道', text: '裕南街街道' },
      { value: '金盆岭街道', text: '金盆岭街道' },
      { value: '新开铺街道', text: '新开铺街道' },
      { value: '青园街道', text: '青园街道' },
      { value: '桂花坪街道', text: '桂花坪街道' },
      { value: '先锋街道', text: '先锋街道' },
      { value: '赤岭路街道', text: '赤岭路街道' },
      { value: '文源街道', text: '文源街道' },
      { value: '黑石铺街道', text: '黑石铺街道' },
      { value: '大托铺街道', text: '大托铺街道' },
      { value: '暮云街道', text: '暮云街道' },
      { value: '南托街道', text: '南托街道' },
    ],
    岳麓区: [
      { value: '望月湖街道', text: '望月湖街道' },
      { value: '岳麓街道', text: '岳麓街道' },
      { value: '桔子洲街道', text: '桔子洲街道' },
      { value: '银盆岭街道', text: '银盆岭街道' },
      { value: '观沙岭街道', text: '观沙岭街道' },
      { value: '西湖街道', text: '西湖街道' },
      { value: '咸嘉湖街道', text: '咸嘉湖街道' },
      { value: '望岳街道', text: '望岳街道' },
      { value: '梅溪湖街道', text: '梅溪湖街道' },
      { value: '麓谷街道', text: '麓谷街道' },
      { value: '天顶街道', text: '天顶街道' },
      { value: '坪塘街道', text: '坪塘街道' },
      { value: '含浦街道', text: '含浦街道' },
      { value: '莲花镇', text: '莲花镇' },
      { value: '雨敞坪镇', text: '雨敞坪镇' },
    ],
    // 湘潭
    雨湖区: [
      { value: '雨湖路街道', text: '雨湖路街道' },
      { value: '城正街街道', text: '城正街街道' },
      { value: '平政路街道', text: '平政路街道' },
      { value: '云塘街道', text: '云塘街道' },
      { value: '广场街道', text: '广场街道' },
      { value: '窑湾街道', text: '窑湾街道' },
      { value: '昭潭街道', text: '昭潭街道' },
      { value: '先锋街道', text: '先锋街道' },
      { value: '长城乡', text: '长城乡' },
      { value: '响水乡', text: '响水乡' },
      { value: '姜畲镇', text: '姜畲镇' },
    ],
    岳塘区: [
      { value: '五里堆街道', text: '五里堆街道' },
      { value: '社建村街道', text: '社建村街道' },
      { value: '书院路街道', text: '书院路街道' },
      { value: '下摄司街道', text: '下摄司街道' },
      { value: '建设路街道', text: '建设路街道' },
      { value: '宝塔街道', text: '宝塔街道' },
      { value: '霞城街道', text: '霞城街道' },
      { value: '板塘街道', text: '板塘街道' },
      { value: '昭山街道', text: '昭山街道' },
      { value: '易家湾街道', text: '易家湾街道' },
      { value: '双马街道', text: '双马街道' },
    ],

    // 株洲
    荷塘区: [
      { value: '月塘街道', text: '月塘街道' },
      { value: '茨菇塘街道', text: '茨菇塘街道' },
      { value: '宋家桥街道', text: '宋家桥街道' },
      { value: '桂花街道', text: '桂花街道' },
      { value: '金山街道', text: '金山街道' },
      { value: '合泰街道', text: '合泰街道' },
      { value: '明照乡', text: '明照乡' },
      { value: '仙庾镇', text: '仙庾镇' },
    ],

    // 衡阳
    珠晖区: [
      { value: '广东路街道', text: '广东路街道' },
      { value: '东风路街道', text: '东风路街道' },
      { value: '冶金街道', text: '冶金街道' },
      { value: '苗圃街道', text: '苗圃街道' },
      { value: '粤汉街道', text: '粤汉街道' },
      { value: '衡州路街道', text: '衡州路街道' },
      { value: '东阳渡街道', text: '东阳渡街道' },
      { value: '茶山坳镇', text: '茶山坳镇' },
    ],

    // 邵阳
    双清区: [
      { value: '兴隆街道', text: '兴隆街道' },
      { value: '龙须塘街道', text: '龙须塘街道' },
      { value: '汽车站街道', text: '汽车站街道' },
      { value: '东风路街道', text: '东风路街道' },
      { value: '桥头街道', text: '桥头街道' },
      { value: '小江湖街道', text: '小江湖街道' },
      { value: '火车站乡', text: '火车站乡' },
      { value: '高崇山镇', text: '高崇山镇' },
    ],

    // 岳阳
    岳阳楼区: [
      { value: '岳阳楼街道', text: '岳阳楼街道' },
      { value: '三眼桥街道', text: '三眼桥街道' },
      { value: '枫桥湖街道', text: '枫桥湖街道' },
      { value: '吕仙亭街道', text: '吕仙亭街道' },
      { value: '金鹗山街道', text: '金鹗山街道' },
      { value: '东茅岭街道', text: '东茅岭街道' },
      { value: '望岳路街道', text: '望岳路街道' },
      { value: '冷水铺街道', text: '冷水铺街道' },
      { value: '奇家岭街道', text: '奇家岭街道' },
      { value: '郭镇乡', text: '郭镇乡' },
    ],

    // 常德
    武陵区: [
      { value: '丹阳街道', text: '丹阳街道' },
      { value: '东江街道', text: '东江街道' },
      { value: '白马湖街道', text: '白马湖街道' },
      { value: '穿紫河街道', text: '穿紫河街道' },
      { value: '南坪街道', text: '南坪街道' },
      { value: '芷兰街道', text: '芷兰街道' },
      { value: '芙蓉街道', text: '芙蓉街道' },
      { value: '河洑镇', text: '河洑镇' },
      { value: '丹洲乡', text: '丹洲乡' },
    ],

    // 张家界
    永定区: [
      { value: '永定街道', text: '永定街道' },
      { value: '大庸桥街道', text: '大庸桥街道' },
      { value: '西溪坪街道', text: '西溪坪街道' },
      { value: '官黎坪街道', text: '官黎坪街道' },
      { value: '崇文街道', text: '崇文街道' },
      { value: '南庄坪街道', text: '南庄坪街道' },
      { value: '新桥镇', text: '新桥镇' },
      { value: '尹家溪镇', text: '尹家溪镇' },
    ],

    // 益阳
    赫山区: [
      { value: '赫山街道', text: '赫山街道' },
      { value: '桃花仑街道', text: '桃花仑街道' },
      { value: '金银山街道', text: '金银山街道' },
      { value: '会龙山街道', text: '会龙山街道' },
      { value: '鱼形山街道', text: '鱼形山街道' },
      { value: '八字哨镇', text: '八字哨镇' },
      { value: '泉交河镇', text: '泉交河镇' },
      { value: '兰溪镇', text: '兰溪镇' },
    ],

    // 郴州
    北湖区: [
      { value: '人民路街道', text: '人民路街道' },
      { value: '北湖街道', text: '北湖街道' },
      { value: '燕泉街道', text: '燕泉街道' },
      { value: '下湄桥街道', text: '下湄桥街道' },
      { value: '骆仙街道', text: '骆仙街道' },
      { value: '增福街道', text: '增福街道' },
      { value: '石盖塘街道', text: '石盖塘街道' },
      { value: '鲁塘镇', text: '鲁塘镇' },
    ],

    // 永州
    冷水滩区: [
      { value: '梧桐街道', text: '梧桐街道' },
      { value: '梅湾街道', text: '梅湾街道' },
      { value: '菱角山街道', text: '菱角山街道' },
      { value: '肖家园街道', text: '肖家园街道' },
      { value: '杨家桥街道', text: '杨家桥街道' },
      { value: '凤凰街道', text: '凤凰街道' },
      { value: '珊瑚街道', text: '珊瑚街道' },
      { value: '曲河街道', text: '曲河街道' },
      { value: '岚角山镇', text: '岚角山镇' },
    ],

    // 怀化
    鹤城区: [
      { value: '城中街道', text: '城中街道' },
      { value: '城北街道', text: '城北街道' },
      { value: '红星街道', text: '红星街道' },
      { value: '迎丰街道', text: '迎丰街道' },
      { value: '坨院街道', text: '坨院街道' },
      { value: '河西街道', text: '河西街道' },
      { value: '黄金坳镇', text: '黄金坳镇' },
      { value: '凉亭坳乡', text: '凉亭坳乡' },
    ],

    // 娄底
    娄星区: [
      { value: '乐坪街道', text: '乐坪街道' },
      { value: '花山街道', text: '花山街道' },
      { value: '黄泥塘街道', text: '黄泥塘街道' },
      { value: '长青街道', text: '长青街道' },
      { value: '大科街道', text: '大科街道' },
      { value: '涟滨街道', text: '涟滨街道' },
      { value: '大埠桥街道', text: '大埠桥街道' },
      { value: '杉山镇', text: '杉山镇' },
    ],

    // 湘西
    吉首市: [
      { value: '峒河街道', text: '峒河街道' },
      { value: '红旗门街道', text: '红旗门街道' },
      { value: '石家冲街道', text: '石家冲街道' },
      { value: '乾州街道', text: '乾州街道' },
      { value: '双塘街道', text: '双塘街道' },
      { value: '河溪镇', text: '河溪镇' },
      { value: '马颈坳镇', text: '马颈坳镇' },
      { value: '矮寨镇', text: '矮寨镇' },
    ],
  };

  // 小区数据
  communityData = {
    // 上海市
    豫园街道: [
      { value: '恒安坊', text: '恒安坊' },
      { value: '豫园小区', text: '豫园小区' },
      { value: '黄浦众鑫城', text: '黄浦众鑫城' },
      { value: '豫园雅园', text: '豫园雅园' },
      { value: '豫园华苑', text: '豫园华苑' },
    ],
    南京东路街道: [
      { value: '新昌小区', text: '新昌小区' },
      { value: '长江公寓小区', text: '长江公寓小区' },
      { value: '南京东路小区', text: '南京东路小区' },
      { value: '外滩花园', text: '外滩花园' },
      { value: '人民广场小区', text: '人民广场小区' },
    ],
    外滩街道: [
      { value: '永胜小区', text: '永胜小区' },
      { value: '昭通路小区', text: '昭通路小区' },
      { value: '外滩小区', text: '外滩小区' },
      { value: '福州路小区', text: '福州路小区' },
      { value: '广东路小区', text: '广东路小区' },
    ],
    静安寺街道: [
      { value: '静安丽舍小区', text: '静安丽舍小区' },
      { value: '静安新城小区', text: '静安新城小区' },
      { value: '静安寺小区', text: '静安寺小区' },
      { value: '南京西路小区', text: '南京西路小区' },
      { value: '华山路小区', text: '华山路小区' },
    ],
    南京西路街道: [
      { value: '静安四季苑小区', text: '静安四季苑小区' },
      { value: '静安丽舍公寓', text: '静安丽舍公寓' },
      { value: '南京西路公寓', text: '南京西路公寓' },
      { value: '静安花园', text: '静安花园' },
      { value: '静安别墅', text: '静安别墅' },
    ],
    周家桥街道: [
      { value: '天山河畔花园', text: '天山河畔花园' },
      { value: '虹桥新城', text: '虹桥新城' },
      { value: '仁恒河滨花园', text: '仁恒河滨花园' },
      { value: '天山华庭', text: '天山华庭' },
      { value: '天山二村', text: '天山二村' },
    ],
    新华路街道: [
      { value: '新华小区', text: '新华小区' },
      { value: '左家宅小区', text: '左家宅小区' },
      { value: '新华路公房', text: '新华路公房' },
      { value: '淮海西路小区', text: '淮海西路小区' },
      { value: '番禺路小区', text: '番禺路小区' },
    ],
    虹桥街道: [
      { value: '虹桥花园小区', text: '虹桥花园小区' },
      { value: '古北国际花园小区', text: '古北国际花园小区' },
      { value: '虹桥怡景苑', text: '虹桥怡景苑' },
      { value: '古北名都城', text: '古北名都城' },
      { value: '虹桥城市花园', text: '虹桥城市花园' },
    ],
    塘桥街道: [
      { value: '峨海小区', text: '峨海小区' },
      { value: '澳丽花苑', text: '澳丽花苑' },
      { value: '东方汇景苑', text: '东方汇景苑' },
      { value: '塘桥小区', text: '塘桥小区' },
      { value: '蓝村小区', text: '蓝村小区' },
    ],
    陆家嘴街道: [
      { value: '梅园新村小区', text: '梅园新村小区' },
      { value: '福山小区', text: '福山小区' },
      { value: '陆家嘴花园', text: '陆家嘴花园' },
      { value: '仁恒滨江园', text: '仁恒滨江园' },
      { value: '世茂滨江花园', text: '世茂滨江花园' },
    ],
    潍坊新村街道: [
      { value: '潍坊一村小区', text: '潍坊一村小区' },
      { value: '竹园新村小区', text: '竹园新村小区' },
      { value: '潍坊二村', text: '潍坊二村' },
      { value: '潍坊三村', text: '潍坊三村' },
      { value: '潍坊四村', text: '潍坊四村' },
    ],

    // 重庆市
    朝天门街道: [
      { value: '棉花街社区南国丽景小区', text: '棉花街社区南国丽景小区' },
      { value: '朝天门小区', text: '朝天门小区' },
      { value: '朝天门花园', text: '朝天门花园' },
      { value: '棉花街小区', text: '棉花街小区' },
      { value: '朝千路小区', text: '朝千路小区' },
    ],
    七星岗街道: [
      { value: '和信大厦相关小区', text: '和信大厦相关小区' },
      { value: '七星岗小区', text: '七星岗小区' },
      { value: '通远门小区', text: '通远门小区' },
      { value: '较场口小区', text: '较场口小区' },
      { value: '民生路小区', text: '民生路小区' },
    ],
    大溪沟街道: [
      {
        value: '戴家巷老街区内相关居住小区',
        text: '戴家巷老街区内相关居住小区',
      },
      { value: '大溪沟小区', text: '大溪沟小区' },
      { value: '黄花园小区', text: '黄花园小区' },
      { value: '华一路小区', text: '华一路小区' },
      { value: '嘉陵新村小区', text: '嘉陵新村小区' },
    ],
    金山街道: [
      { value: '民心佳园小区', text: '民心佳园小区' },
      { value: '奥园社区相关小区', text: '奥园社区相关小区' },
      { value: '金山街道小区', text: '金山街道小区' },
      { value: '鸳鸯小区', text: '鸳鸯小区' },
      { value: '翠云小区', text: '翠云小区' },
    ],
    人和街道: [
      { value: '人和家园小区', text: '人和家园小区' },
      { value: '人和街道小区', text: '人和街道小区' },
      { value: '天湖美镇', text: '天湖美镇' },
      { value: '棕榈泉国际花园', text: '棕榈泉国际花园' },
      { value: '蓝湖郡', text: '蓝湖郡' },
    ],
    翠云街道: [
      { value: '云卉路社区周边居住小区', text: '云卉路社区周边居住小区' },
      { value: '翠云街道小区', text: '翠云街道小区' },
      { value: '翠云花园', text: '翠云花园' },
      { value: '云竹苑', text: '云竹苑' },
      { value: '云柏苑', text: '云柏苑' },
    ],
    渝州路街道: [
      { value: '红育坡片区内各老旧小区', text: '红育坡片区内各老旧小区' },
      { value: '渝州路小区', text: '渝州路小区' },
      { value: '彩电中心小区', text: '彩电中心小区' },
      { value: '南方花园', text: '南方花园' },
      { value: '科园四路小区', text: '科园四路小区' },
    ],
    谢家湾街道: [
      { value: '民主村片区相关居住小区', text: '民主村片区相关居住小区' },
      { value: '谢家湾小区', text: '谢家湾小区' },
      { value: '万象城周边小区', text: '万象城周边小区' },
      { value: '杨家坪小区', text: '杨家坪小区' },
      { value: '直港大道小区', text: '直港大道小区' },
    ],
    石桥铺街道: [
      { value: '朝阳路社区所辖各类小区', text: '朝阳路社区所辖各类小区' },
      { value: '石桥铺小区', text: '石桥铺小区' },
      { value: '石新路小区', text: '石新路小区' },
      { value: '兰花小区', text: '兰花小区' },
      { value: '陈家坪小区', text: '陈家坪小区' },
    ],
    龙溪街道: [
      { value: '龙湖水晶郦城小区', text: '龙湖水晶郦城小区' },
      { value: '加州花园小区', text: '加州花园小区' },
      { value: '龙溪街道小区', text: '龙溪街道小区' },
      { value: '新牌坊小区', text: '新牌坊小区' },
      { value: '黄泥磅小区', text: '黄泥磅小区' },
    ],
    两路街道: [
      { value: '水木青华小区', text: '水木青华小区' },
      { value: '空港新城相关居住小区', text: '空港新城相关居住小区' },
      { value: '两路街道小区', text: '两路街道小区' },
      { value: '双龙湖小区', text: '双龙湖小区' },
      { value: '龙顺街小区', text: '龙顺街小区' },
    ],
    宝圣湖街道: [
      { value: '在水一方小区', text: '在水一方小区' },
      { value: '金石小区', text: '金石小区' },
      { value: '宝圣湖街道小区', text: '宝圣湖街道小区' },
      { value: '回兴小区', text: '回兴小区' },
      { value: '宝圣西路小区', text: '宝圣西路小区' },
    ],

    // 河北省
    // 石家庄市
    育才街道: [
      { value: '化肥一区', text: '化肥一区' },
      { value: '和平园', text: '和平园' },
      { value: '荣盛华府A区', text: '荣盛华府A区' },
      { value: '育才小区', text: '育才小区' },
      { value: '长安花园', text: '长安花园' },
    ],
    建北街道: [
      { value: '和平路舒心家园', text: '和平路舒心家园' },
      { value: '谈北社区周边小区', text: '谈北社区周边小区' },
      { value: '建北小区', text: '建北小区' },
      { value: '棉一小区', text: '棉一小区' },
      { value: '棉二小区', text: '棉二小区' },
    ],
    // 唐山市
    乔屯街道: [
      { value: '城发杏林苑', text: '城发杏林苑' },
      { value: '文旅颐唐健康城', text: '文旅颐唐健康城' },
      { value: '乔屯小区', text: '乔屯小区' },
      { value: '草场街小区', text: '草场街小区' },
      { value: '解放路小区', text: '解放路小区' },
    ],
    文化路街道: [
      { value: '凤栖华府', text: '凤栖华府' },
      {
        value: '高顺新发展广场周边居住小区',
        text: '高顺新发展广场周边居住小区',
      },
      { value: '文化路小区', text: '文化路小区' },
      { value: '凤凰园小区', text: '凤凰园小区' },
      { value: '祥富里小区', text: '祥富里小区' },
    ],
    // 邯郸市
    柳林桥街道: [
      { value: '星城国际', text: '星城国际' },
      { value: '连城别苑', text: '连城别苑' },
      { value: '柳林桥小区', text: '柳林桥小区' },
      { value: '广泰小区', text: '广泰小区' },
      { value: '恒富天地', text: '恒富天地' },
    ],
    联纺东街道: [
      { value: '仁达嘉苑', text: '仁达嘉苑' },
      { value: '春晖小区', text: '春晖小区' },
      { value: '联纺东小区', text: '联纺东小区' },
      { value: '新兴小区', text: '新兴小区' },
      { value: '家和小区', text: '家和小区' },
    ],
    // 邢台市
    中华大街街道: [
      { value: '北大郭小区西区', text: '北大郭小区西区' },
      { value: '中华小区', text: '中华小区' },
      { value: '金盾小区', text: '金盾小区' },
      { value: '阳光小区', text: '阳光小区' },
      { value: '天厦嘉园', text: '天厦嘉园' },
    ],
    南长街街道: [
      { value: '东大街社区周边老旧小区', text: '东大街社区周边老旧小区' },
      { value: '顺德北社区周边老旧小区', text: '顺德北社区周边老旧小区' },
      { value: '南长街小区', text: '南长街小区' },
      { value: '中兴东大街小区', text: '中兴东大街小区' },
      { value: '东关小区', text: '东关小区' },
    ],

    // 天津市
    南营门街: [
      { value: '天兴里社区', text: '天兴里社区' },
      { value: '竞业里社区', text: '竞业里社区' },
      { value: '昆明路社区', text: '昆明路社区' },
      { value: '香榭里社区', text: '香榭里社区' },
      { value: '文化村社区', text: '文化村社区' },
    ],
    劝业场街: [
      { value: '林泉社区', text: '林泉社区' },
      { value: '兆丰路社区', text: '兆丰路社区' },
      { value: '蒙古路社区', text: '蒙古路社区' },
      { value: '花园路社区', text: '花园路社区' },
      { value: '滨西社区', text: '滨西社区' },
    ],
    五大道街: [
      { value: '文化里社区', text: '文化里社区' },
      { value: '三盛里社区', text: '三盛里社区' },
      { value: '育文坊社区', text: '育文坊社区' },
      { value: '安乐村社区', text: '安乐村社区' },
      { value: '福林里社区', text: '福林里社区' },
    ],
    新北街: [
      { value: '欧美小镇社区', text: '欧美小镇社区' },
      { value: '晓镇家园社区', text: '晓镇家园社区' },
      { value: '贻成尚北社区', text: '贻成尚北社区' },
      { value: '蓝卡社区', text: '蓝卡社区' },
      { value: '迎宾园社区', text: '迎宾园社区' },
    ],
    泰达街: [
      { value: '华纳社区', text: '华纳社区' },
      { value: '福瑞社区', text: '福瑞社区' },
      { value: '翠亨社区', text: '翠亨社区' },
      { value: '紫云社区', text: '紫云社区' },
      { value: '芳林社区', text: '芳林社区' },
    ],
    塘沽街: [
      { value: '贻芳嘉园社区', text: '贻芳嘉园社区' },
      { value: '馨苑社区', text: '馨苑社区' },
      { value: '祥和家园社区', text: '祥和家园社区' },
      { value: '紫云园社区', text: '紫云园社区' },
      { value: '迎春里社区', text: '迎春里社区' },
    ],
    华苑街: [
      { value: '碧华里社区', text: '碧华里社区' },
      { value: '天华里社区', text: '天华里社区' },
      { value: '地华里社区', text: '地华里社区' },
      { value: '日华里社区', text: '日华里社区' },
      { value: '安华里社区', text: '安华里社区' },
    ],
    体育中心街: [
      { value: '时代奥城社区', text: '时代奥城社区' },
      { value: '阳光壹佰社区', text: '阳光壹佰社区' },
      { value: '凌庄子社区', text: '凌庄子社区' },
      { value: '金谷园社区', text: '金谷园社区' },
      { value: '仁爱濠景社区', text: '仁爱濠景社区' },
    ],
    学府街: [
      { value: '学湖里社区', text: '学湖里社区' },
      { value: '荣迁西里社区', text: '荣迁西里社区' },
      { value: '航天北里社区', text: '航天北里社区' },
      { value: '月环里社区', text: '月环里社区' },
      { value: '风湖里社区', text: '风湖里社区' },
    ],
    瑞景街: [
      { value: '江南春色社区', text: '江南春色社区' },
      { value: '宝翠花都社区', text: '宝翠花都社区' },
      { value: '奥林匹克花园社区', text: '奥林匹克花园社区' },
      { value: '瑞达里社区', text: '瑞达里社区' },
      { value: '佳安里社区', text: '佳安里社区' },
    ],
    天穆镇: [
      { value: '悦林名邸社区', text: '悦林名邸社区' },
      { value: '恒逸华庭社区', text: '恒逸华庭社区' },
      { value: '天穆东苑社区', text: '天穆东苑社区' },
      { value: '方舟社区', text: '方舟社区' },
      { value: '佳宁里社区', text: '佳宁里社区' },
    ],
    普东街: [
      { value: '万达新城社区', text: '万达新城社区' },
      { value: '金宜里社区', text: '金宜里社区' },
      { value: '普东新苑社区', text: '普东新苑社区' },
      { value: '田园小区社区', text: '田园小区社区' },
      { value: '秋怡家园社区', text: '秋怡家园社区' },
    ],

    // 湖南省内城市
    // 长沙
    文艺路街道: [
      { value: '碧桂园·文艺路小区', text: '碧桂园·文艺路小区' },
      { value: '东方名苑', text: '东方名苑' },
      { value: '长房上层国际', text: '长房上层国际' },
      { value: '福星中路小区', text: '福星中路小区' },
      { value: '宝塔路小区', text: '宝塔路小区' },
    ],
    朝阳街街道: [
      { value: '朝阳小区', text: '朝阳小区' },
      { value: '东郡小区', text: '东郡小区' },
      { value: '恒大雅苑', text: '恒大雅苑' },
    ],
    // 湘潭
    宝塔街道: [
      { value: '碧桂园·潭州府', text: '碧桂园·潭州府' },
      { value: '东方名苑', text: '东方名苑' },
      { value: '长房上层国际', text: '长房上层国际' },
      { value: '福星国际金融中心', text: '福星国际金融中心' },
      { value: '中地·凯旋城', text: '中地·凯旋城' },
      { value: '金侨·中央花园', text: '金侨·中央花园' },
      { value: '中央一品', text: '中央一品' },
      { value: '莱茵城', text: '莱茵城' },
      { value: '华宇·蓝山郡', text: '华宇·蓝山郡' },
      { value: '美的·国宾府', text: '美的·国宾府' },
    ],
    中洲路街道: [
      { value: '中洲小区', text: '中洲小区' },
      { value: '华雅花园', text: '华雅花园' },
      { value: '锦园小区', text: '锦园小区' },
    ],
    // 株洲
    月塘街道: [
      { value: '月塘小区', text: '月塘小区' },
      { value: '荷塘星城', text: '荷塘星城' },
      { value: '美的时代广场', text: '美的时代广场' },
    ],
    // 其他主要街道小区数据
    五里牌街道: [
      { value: '五里牌小区', text: '五里牌小区' },
      { value: '尚东紫郡', text: '尚东紫郡' },
    ],
    火星街道: [
      { value: '火星小区', text: '火星小区' },
      { value: '金科东方大院', text: '金科东方大院' },
    ],
    马王堆街道: [
      { value: '马王堆小区', text: '马王堆小区' },
      { value: '世嘉国际华城', text: '世嘉国际华城' },
    ],
    东屯渡街道: [
      { value: '东屯渡小区', text: '东屯渡小区' },
      { value: '万科金域蓝湾', text: '万科金域蓝湾' },
    ],
    湘湖街道: [
      { value: '湘湖小区', text: '湘湖小区' },
      { value: '保利国际广场', text: '保利国际广场' },
    ],
    坡子街街道: [
      { value: '坡子街小区', text: '坡子街小区' },
      { value: '太平街小区', text: '太平街小区' },
    ],
    城南路街道: [
      { value: '城南路小区', text: '城南路小区' },
      { value: '天心阁小区', text: '天心阁小区' },
    ],
    裕南街街道: [
      { value: '裕南街小区', text: '裕南街小区' },
      { value: '南湖路小区', text: '南湖路小区' },
    ],
    金盆岭街道: [
      { value: '金盆岭小区', text: '金盆岭小区' },
      { value: '涂家冲小区', text: '涂家冲小区' },
    ],
  };

  // 绑定事件
  bindEvents() {
    // 城市选择事件
    this.citySelect.addEventListener('change', () => {
      this.onCityChange();
    });

    // 区域选择事件
    this.districtSelect.addEventListener('change', () => {
      this.onDistrictChange();
    });

    // 街道选择事件
    this.subdistrictSelect.addEventListener('change', () => {
      this.onSubdistrictChange();
    });
  }

  // 城市变化处理
  onCityChange() {
    const selectedCity = this.citySelect.value;

    // 清空后续选择
    this.districtSelect.innerHTML = '<option value="">选择区域</option>';
    this.subdistrictSelect.innerHTML =
      '<option value="">选择街道/乡镇</option>';
    this.communitySelect.innerHTML =
      '<option value="">选择小区（可选）</option><option value="other">其他</option>';

    // 填充区域数据
    if (selectedCity && this.districtData[selectedCity]) {
      this.districtData[selectedCity].forEach((district) => {
        const option = document.createElement('option');
        option.value = district.value;
        option.textContent = district.text;
        this.districtSelect.appendChild(option);
      });
    }
  }

  // 区域变化处理
  onDistrictChange() {
    const districtValue = this.districtSelect.value;

    // 清空后续选择
    this.subdistrictSelect.innerHTML =
      '<option value="">选择街道/乡镇</option>';
    this.communitySelect.innerHTML =
      '<option value="">选择小区（可选）</option><option value="other">其他</option>';

    // 填充街道数据
    if (districtValue && this.subdistrictData[districtValue]) {
      this.subdistrictData[districtValue].forEach((subdistrict) => {
        const option = document.createElement('option');
        option.value = subdistrict.value;
        option.textContent = subdistrict.text;
        this.subdistrictSelect.appendChild(option);
      });
    }
  }

  // 街道变化处理
  onSubdistrictChange() {
    const subdistrictValue = this.subdistrictSelect.value;

    // 清空小区选择
    this.communitySelect.innerHTML =
      '<option value="">选择小区（可选）</option><option value="other">其他</option>';

    // 填充小区数据
    if (subdistrictValue && this.communityData[subdistrictValue]) {
      this.communityData[subdistrictValue].forEach((community) => {
        const option = document.createElement('option');
        option.value = community.value;
        option.textContent = community.text;
        this.communitySelect.appendChild(option);
      });
    }
  }

  // 获取当前选择的城市数据
  getSelectedData() {
    return {
      city: this.citySelect.options[this.citySelect.selectedIndex]
        ? this.citySelect.options[this.citySelect.selectedIndex].text
        : '',
      district: this.districtSelect.options[this.districtSelect.selectedIndex]
        ? this.districtSelect.options[this.districtSelect.selectedIndex].text
        : '',
      subdistrict: this.subdistrictSelect.options[
        this.subdistrictSelect.selectedIndex
      ]
        ? this.subdistrictSelect.options[this.subdistrictSelect.selectedIndex]
            .text
        : '',
      community: this.communitySelect.options[
        this.communitySelect.selectedIndex
      ]
        ? this.communitySelect.options[this.communitySelect.selectedIndex].text
        : '',
    };
  }

  // 重置选择
  reset() {
    this.citySelect.value = '';
    this.districtSelect.innerHTML = '<option value="">选择区域</option>';
    this.subdistrictSelect.innerHTML =
      '<option value="">选择街道/乡镇</option>';
    this.communitySelect.innerHTML =
      '<option value="">选择小区（可选）</option><option value="other">其他</option>';
  }
}

// 初始化函数，供页面调用
function initCitySelector(
  citySelectId,
  districtSelectId,
  subdistrictSelectId,
  communitySelectId
) {
  return new CitySelector(
    citySelectId,
    districtSelectId,
    subdistrictSelectId,
    communitySelectId
  );
}

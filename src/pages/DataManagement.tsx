import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Modal, Form, Select, Space, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDataService } from '../services/data/DataService';
import { XiangtanDistrictData } from '../types';

const { Option } = Select;
const { Search } = Input;

const DataManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<XiangtanDistrictData[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState<XiangtanDistrictData | null>(null);

  // 使用数据服务
  const dataService = useDataService();

  // 获取数据列表
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await dataService.getDataList({
        page: currentPage,
        pageSize,
        search: searchText
      });
      setDataSource(result.data);
      setTotal(result.total);
    } catch (error) {
      message.error('获取数据失败');
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchText]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  // 处理添加/编辑
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: XiangtanDistrictData) => {
    setEditingRecord(record);
    form.setFieldsValue({
      projectName: record.projectName,
      buildingArea: record.buildingArea,
      houseType: record.houseType,
      district: record.district,
      decoration: record.decoration,
      averagePrice: record.averagePrice
    });
    setModalVisible(true);
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await dataService.deleteData(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
      console.error('Failed to delete data:', error);
    }
  };

  // 保存数据
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      const data = {
        projectName: values.projectName,
        buildingArea: values.buildingArea,
        houseType: values.houseType,
        district: values.district,
        decoration: values.decoration,
        averagePrice: values.averagePrice
      };

      if (editingRecord) {
        // 更新数据
        await dataService.updateData(editingRecord.id, data);
        message.success('更新成功');
      } else {
        // 添加数据
        await dataService.createData(data);
        message.success('添加成功');
      }

      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('保存失败');
      console.error('Failed to save data:', error);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
      width: 200
    },
    {
      title: '建筑面积(㎡)',
      dataIndex: 'buildingArea',
      key: 'buildingArea',
      width: 120,
      align: 'right'
    },
    {
      title: '户型',
      dataIndex: 'houseType',
      key: 'houseType',
      width: 100
    },
    {
      title: '所在区域',
      dataIndex: 'district',
      key: 'district',
      width: 150
    },
    {
      title: '装修情况',
      dataIndex: 'decoration',
      key: 'decoration',
      width: 100
    },
    {
      title: '成交单价(元/㎡)',
      dataIndex: 'averagePrice',
      key: 'averagePrice',
      width: 150,
      align: 'right'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record: XiangtanDistrictData) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="danger" 
              icon={<DeleteOutlined />} 
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="content-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="section-title">数据管理</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          <Search
            placeholder="搜索项目名称"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            size="large"
          >
            添加数据
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        rowKey="id"
        dataSource={dataSource}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        bordered
      />

      <Modal
        title={editingRecord ? '编辑数据' : '添加数据'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            保存
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="data_management_form"
        >
          <Form.Item
            name="projectName"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            name="buildingArea"
            label="建筑面积(㎡)"
            rules={[{ required: true, message: '请输入建筑面积' }]}
          >
            <Input type="number" placeholder="请输入建筑面积" />
          </Form.Item>

          <Form.Item
            name="houseType"
            label="户型"
            rules={[{ required: true, message: '请选择户型' }]}
          >
            <Select placeholder="请选择户型">
              <Option value="2室2厅">2室2厅</Option>
              <Option value="3室2厅">3室2厅</Option>
              <Option value="4室2厅">4室2厅</Option>
              <Option value="5室及以上">5室及以上</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="district"
            label="所在区域"
            rules={[{ required: true, message: '请输入所在区域' }]}
          >
            <Input placeholder="请输入所在区域" />
          </Form.Item>

          <Form.Item
            name="decoration"
            label="装修情况"
            rules={[{ required: true, message: '请选择装修情况' }]}
          >
            <Select placeholder="请选择装修情况">
              <Option value="毛坯">毛坯</Option>
              <Option value="简装">简装</Option>
              <Option value="精装">精装</Option>
              <Option value="豪装">豪装</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="averagePrice"
            label="成交单价(元/㎡)"
            rules={[{ required: true, message: '请输入成交单价' }]}
          >
            <Input type="number" placeholder="请输入成交单价" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataManagement;

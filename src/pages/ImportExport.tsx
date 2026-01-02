import React, { useState } from 'react';
import { Upload, Button, Card, Row, Col, message, Select, Space, Progress, Result } from 'antd';
import { UploadOutlined, DownloadOutlined, FileTextOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useDataService } from '../services/data/DataService';
import { ImportResult } from '../types';

const { Option } = Select;
const { Dragger } = Upload;

const ImportExport: React.FC = () => {
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [exportType, setExportType] = useState<string>('all');

  // 使用数据服务
  const dataService = useDataService();

  // 处理文件上传前的验证
  const handleBeforeUpload = (file: File) => {
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    if (!isCSV) {
      message.error('请仅上传CSV格式的文件！');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  // 处理文件上传
  const handleUpload = async (file: File) => {
    setImportLoading(true);
    setImportProgress(0);
    setImportResult(null);

    // 模拟进度更新
    const progressInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await dataService.importCSV(file);
      clearInterval(progressInterval);
      setImportProgress(100);
      setImportResult(result);
      message.success('CSV文件导入成功');
    } catch (error) {
      clearInterval(progressInterval);
      setImportProgress(0);
      message.error('CSV文件导入失败');
      console.error('Failed to import CSV:', error);
    } finally {
      setImportLoading(false);
      setTimeout(() => {
        setImportProgress(0);
      }, 1000);
    }

    return false; // 阻止自动上传
  };

  // 处理数据导出
  const handleExport = async () => {
    setExportLoading(true);
    try {
      await dataService.exportData({
        format: exportFormat,
        type: exportType
      });
      message.success('数据导出成功');
    } catch (error) {
      message.error('数据导出失败');
      console.error('Failed to export data:', error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="content-card">
      <h2 className="section-title">数据导入导出</h2>
      
      <Row gutter={[24, 24]}>
        {/* 导入功能 */}
        <Col xs={24} lg={12}>
          <Card 
            title="CSV文件导入" 
            className="content-card"
            icon={<UploadOutlined />}
          >
            <p style={{ marginBottom: 24, color: '#8c8c8c' }}>
              支持将CSV格式的房产数据导入到系统中，请确保文件格式符合要求。
              <br />
              <a href="/data_template.csv" target="_blank" download className="text-orange-400 hover:text-orange-300">
                下载模板文件
              </a>
            </p>

            {importProgress > 0 && importProgress < 100 && (
              <div style={{ marginBottom: 24 }}>
                <Progress percent={importProgress} status="active" />
                <p style={{ textAlign: 'center', marginTop: 8, color: '#8c8c8c' }}>
                  正在导入数据...
                </p>
              </div>
            )}

            {importResult && (
              <Result
                status="success"
                title="导入成功"
                subTitle={`共 ${importResult.total} 条记录，成功导入 ${importResult.imported} 条，失败 ${importResult.failed} 条`}
                style={{ marginBottom: 24 }}
              />
            )}

            <Dragger
              name="file"
              multiple={false}
              beforeUpload={handleBeforeUpload}
              customRequest={({ file }) => handleUpload(file as File)}
              showUploadList={false}
              disabled={importLoading}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: 48, color: '#ffa046' }} />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持上传CSV格式文件，单个文件不超过10MB
              </p>
            </Dragger>
          </Card>
        </Col>

        {/* 导出功能 */}
        <Col xs={24} lg={12}>
          <Card 
            title="数据导出" 
            className="content-card"
            icon={<DownloadOutlined />}
          >
            <p style={{ marginBottom: 24, color: '#8c8c8c' }}>
              将系统中的房产数据导出为CSV或Excel格式，支持选择导出范围和数据类型。
            </p>

            <div style={{ marginBottom: 24 }}>
              <p style={{ marginBottom: 8, fontWeight: 'bold' }}>导出格式：</p>
              <Select
                value={exportFormat}
                onChange={setExportFormat}
                style={{ width: '100%', marginBottom: 16 }}
              >
                <Option value="csv">
                  <FileTextOutlined /> CSV格式
                </Option>
                <Option value="excel">
                  <FileTextOutlined /> Excel格式
                </Option>
              </Select>

              <p style={{ marginBottom: 8, fontWeight: 'bold' }}>导出数据范围：</p>
              <Select
                value={exportType}
                onChange={setExportType}
                style={{ width: '100%' }}
              >
                <Option value="all">
                  <DatabaseOutlined /> 全部数据
                </Option>
                <Option value="current-month">
                  <DatabaseOutlined /> 当月数据
                </Option>
                <Option value="custom">
                  <DatabaseOutlined /> 自定义范围
                </Option>
              </Select>
            </div>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={exportLoading}
                onClick={handleExport}
                size="large"
                block
              >
                导出数据
              </Button>
              <Button
                icon={<DownloadOutlined />}
                loading={exportLoading}
                onClick={() => {
                  setExportFormat('csv');
                  setExportType('all');
                  handleExport();
                }}
                size="large"
                block
              >
                快速导出全部数据（CSV）
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 导入指南 */}
      <Card 
        title="导入指南" 
        className="content-card"
        style={{ marginTop: 24 }}
      >
        <div style={{ fontSize: 14, lineHeight: 1.8 }}>
          <h4 style={{ marginBottom: 12, color: '#ffa046' }}>CSV文件格式要求：</h4>
          <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
            <li>文件编码格式：UTF-8</li>
            <li>分隔符：逗号(,)</li>
            <li>必填字段：小区名称、建筑面积(㎡)、所在区域、成交单价(元/㎡)</li>
            <li>可选字段：户型、装修情况</li>
          </ul>

          <h4 style={{ marginBottom: 12, color: '#ffa046' }}>字段说明：</h4>
          <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
            <li><strong>小区名称</strong>：项目或小区的名称</li>
            <li><strong>建筑面积(㎡)</strong>：房屋的建筑面积，数值类型</li>
            <li><strong>户型</strong>：如"2室2厅"、"3室1厅"等</li>
            <li><strong>所在区域</strong>：房屋所在的具体区域</li>
            <li><strong>装修情况</strong>：如"毛坯"、"简装"、"精装"等</li>
            <li><strong>成交单价(元/㎡)</strong>：房屋的成交单价，数值类型</li>
          </ul>

          <h4 style={{ marginBottom: 12, color: '#ffa046' }}>示例数据：</h4>
          <pre style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.2)', 
            padding: 16, 
            borderRadius: 8, 
            overflowX: 'auto',
            margin: 0
          }}>
            小区名称,建筑面积(㎡),户型,所在区域,装修情况,成交单价(元/㎡)
            步步高九华新天地,92.3,3室2厅,九华-管委会,简装,6300
            步步高新天地,118.7,4室2厅,岳塘区,精装,7000
            昭山新城,81.5,2室2厅,昭山示范区,毛坯,5500
          </pre>
        </div>
      </Card>
    </div>
  );
};

export default ImportExport;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ModelTraining.css';

const ModelTraining = () => {
  // 状态管理
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [filename, setFilename] = useState('');
  const [columns, setColumns] = useState([]);
  const [preview, setPreview] = useState([]);
  const [targetColumn, setTargetColumn] = useState('');
  const [featureColumns, setFeatureColumns] = useState([]);
  const [modelType, setModelType] = useState('linear_regression');
  const [parameters, setParameters] = useState({});
  const [supportedModels, setSupportedModels] = useState([]);
  const [trainingResult, setTrainingResult] = useState(null);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取支持的模型列表
  useEffect(() => {
    const fetchSupportedModels = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v2/model-training/supported-models');
        setSupportedModels(response.data.models);
      } catch (err) {
        setError('获取支持的模型列表失败');
      }
    };

    fetchSupportedModels();
  }, []);

  // 获取训练历史
  useEffect(() => {
    const fetchTrainingHistory = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v2/model-training/training-history');
        setTrainingHistory(response.data);
      } catch (err) {
        setError('获取训练历史失败');
      }
    };

    fetchTrainingHistory();
  }, []);

  // 处理文件上传
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setFilename(selectedFile.name);
      setError('');
    } else {
      setError('只支持CSV文件');
      setFile(null);
      setFilename('');
    }
  };

  // 上传文件
  const handleUpload = async () => {
    if (!file) {
      setError('请选择一个CSV文件');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/v2/model-training/upload-dataset', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFileId(response.data.file_id);
      setColumns(response.data.columns);
      setPreview(response.data.preview);
      setTargetColumn('');
      setFeatureColumns([]);
    } catch (err) {
      setError('文件上传失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理特征列选择
  const handleFeatureColumnChange = (column) => {
    if (featureColumns.includes(column)) {
      setFeatureColumns(featureColumns.filter(col => col !== column));
    } else {
      setFeatureColumns([...featureColumns, column]);
    }
  };

  // 处理模型参数变化
  const handleParameterChange = (param, value) => {
    setParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };

  // 训练模型
  const handleTrainModel = async () => {
    if (!fileId || !targetColumn || featureColumns.length === 0) {
      setError('请选择目标列和特征列');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file_id', fileId);
    formData.append('model_type', modelType);
    formData.append('target_column', targetColumn);
    formData.append('feature_columns', JSON.stringify(featureColumns));
    formData.append('parameters', JSON.stringify(parameters));

    try {
      const response = await axios.post('http://localhost:8000/api/v2/model-training/train-model', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setTrainingResult(response.data);
      
      // 更新训练历史
      const historyResponse = await axios.get('http://localhost:8000/api/v2/model-training/training-history');
      setTrainingHistory(historyResponse.data);
    } catch (err) {
      setError('模型训练失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="model-training-container">
      <h1>模型训练平台</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="section">
        <h2>1. 上传数据集</h2>
        <div className="upload-section">
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            className="file-input"
          />
          <span className="file-name">{filename || '未选择文件'}</span>
          <button 
            onClick={handleUpload} 
            disabled={!file || loading}
            className="upload-btn"
          >
            {loading ? '上传中...' : '上传文件'}
          </button>
        </div>
        
        {preview.length > 0 && (
          <div className="data-preview">
            <h3>数据预览</h3>
            <table>
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, index) => (
                  <tr key={index}>
                    {columns.map(col => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {fileId && (
        <div className="section">
          <h2>2. 选择模型和参数</h2>
          
          <div className="model-selection">
            <h3>选择模型类型</h3>
            <select 
              value={modelType} 
              onChange={(e) => setModelType(e.target.value)}
              className="model-select"
            >
              {supportedModels.map(model => (
                <option key={model.model_type} value={model.model_type}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
          </div>
          
          <div className="column-selection">
            <h3>选择目标列</h3>
            <select 
              value={targetColumn} 
              onChange={(e) => setTargetColumn(e.target.value)}
              className="column-select"
            >
              <option value="">请选择目标列</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div className="column-selection">
            <h3>选择特征列</h3>
            <div className="feature-columns">
              {columns.map(col => (
                <label key={col} className="feature-column-checkbox">
                  <input 
                    type="checkbox" 
                    checked={featureColumns.includes(col)}
                    onChange={() => handleFeatureColumnChange(col)}
                    disabled={col === targetColumn}
                  />
                  <span>{col}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="parameters-section">
            <h3>模型参数</h3>
            <div className="parameters">
              {modelType === 'random_forest' && (
                <>
                  <div className="parameter-item">
                    <label>n_estimators:</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={parameters.n_estimators || 100}
                      onChange={(e) => handleParameterChange('n_estimators', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="parameter-item">
                    <label>max_depth:</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={parameters.max_depth || 10}
                      onChange={(e) => handleParameterChange('max_depth', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="parameter-item">
                    <label>min_samples_split:</label>
                    <input 
                      type="number" 
                      min="2" 
                      value={parameters.min_samples_split || 2}
                      onChange={(e) => handleParameterChange('min_samples_split', parseInt(e.target.value))}
                    />
                  </div>
                </>
              )}
              
              {modelType === 'linear_regression' && (
                <div className="parameter-item">
                  <label>fit_intercept:</label>
                  <input 
                    type="checkbox" 
                    checked={parameters.fit_intercept !== false}
                    onChange={(e) => handleParameterChange('fit_intercept', e.target.checked)}
                  />
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleTrainModel} 
            disabled={loading || !targetColumn || featureColumns.length === 0}
            className="train-btn"
          >
            {loading ? '训练中...' : '训练模型'}
          </button>
        </div>
      )}
      
      {trainingResult && (
        <div className="section">
          <h2>3. 训练结果</h2>
          <div className="training-result">
            <h3>模型ID: {trainingResult.model_id}</h3>
            
            <div className="performance-metrics">
              <h4>性能指标</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <label>训练集MSE:</label>
                  <span>{trainingResult.performance.train.mse.toFixed(4)}</span>
                </div>
                <div className="metric-item">
                  <label>训练集R²:</label>
                  <span>{trainingResult.performance.train.r2.toFixed(4)}</span>
                </div>
                <div className="metric-item">
                  <label>测试集MSE:</label>
                  <span>{trainingResult.performance.test.mse.toFixed(4)}</span>
                </div>
                <div className="metric-item">
                  <label>测试集R²:</label>
                  <span>{trainingResult.performance.test.r2.toFixed(4)}</span>
                </div>
              </div>
            </div>
            
            <div className="visualization">
              <h4>可视化结果</h4>
              <img 
                src={`data:image/png;base64,${trainingResult.visualization}`} 
                alt="训练结果可视化" 
                className="visualization-img"
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="section">
        <h2>4. 训练历史</h2>
        <div className="training-history">
          {trainingHistory.length === 0 ? (
            <p>暂无训练历史</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>模型ID</th>
                  <th>模型类型</th>
                  <th>目标列</th>
                  <th>特征列数量</th>
                  <th>训练时间</th>
                  <th>测试集R²</th>
                </tr>
              </thead>
              <tbody>
                {trainingHistory.map((record, index) => (
                  <tr key={index}>
                    <td>{record.model_id}</td>
                    <td>{record.model_type}</td>
                    <td>{record.target_column}</td>
                    <td>{record.feature_columns.length}</td>
                    <td>{new Date(record.timestamp).toLocaleString()}</td>
                    <td>{record.performance.test.r2.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelTraining;

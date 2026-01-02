import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataLab.css';

const DataLab = () => {
  // 状态管理
  const [notebooks, setNotebooks] = useState([]);
  const [currentNotebook, setCurrentNotebook] = useState(null);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 获取所有笔记本
  useEffect(() => {
    fetchNotebooks();
  }, []);

  // 获取笔记本列表
  const fetchNotebooks = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:8000/api/v2/data-lab/notebooks');
      setNotebooks(response.data.notebooks);
    } catch (err) {
      setError('获取笔记本列表失败');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 创建新笔记本
  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim()) {
      setError('请输入笔记本名称');
      return;
    }

    setIsCreating(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/api/v2/data-lab/notebooks', {
        name: newNotebookName.trim(),
        description: ''
      });
      
      setNotebooks([...notebooks, response.data.notebook]);
      setNewNotebookName('');
      fetchNotebooks(); // 刷新笔记本列表
    } catch (err) {
      setError('创建笔记本失败');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // 打开笔记本
  const handleOpenNotebook = (notebook) => {
    setCurrentNotebook(notebook);
  };

  // 关闭笔记本
  const handleCloseNotebook = () => {
    setCurrentNotebook(null);
  };

  // 删除笔记本
  const handleDeleteNotebook = async (notebookId) => {
    if (!window.confirm('确定要删除这个笔记本吗？')) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await axios.delete(`http://localhost:8000/api/v2/data-lab/notebooks/${notebookId}`);
      setNotebooks(notebooks.filter(nb => nb.id !== notebookId));
      if (currentNotebook && currentNotebook.id === notebookId) {
        setCurrentNotebook(null);
      }
    } catch (err) {
      setError('删除笔记本失败');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存笔记本
  const handleSaveNotebook = async () => {
    if (!currentNotebook) return;

    setIsLoading(true);
    setError('');
    
    try {
      await axios.put(`http://localhost:8000/api/v2/data-lab/notebooks/${currentNotebook.id}`, {
        name: currentNotebook.name,
        content: currentNotebook.content
      });
      fetchNotebooks(); // 刷新笔记本列表
    } catch (err) {
      setError('保存笔记本失败');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="data-lab-container">
      <h1>数据实验室</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="data-lab-content">
        {/* 左侧笔记本列表 */}
        <div className="notebook-sidebar">
          <div className="sidebar-header">
            <h2>我的笔记本</h2>
            <div className="create-notebook">
              <input 
                type="text" 
                placeholder="笔记本名称" 
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                className="notebook-name-input"
              />
              <button 
                onClick={handleCreateNotebook}
                disabled={isCreating || !newNotebookName.trim()}
                className="create-btn"
              >
                {isCreating ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
          
          <div className="notebook-list">
            {isLoading ? (
              <div className="loading">加载中...</div>
            ) : notebooks.length === 0 ? (
              <div className="empty-state">
                <p>暂无笔记本</p>
                <p>点击上方按钮创建第一个笔记本</p>
              </div>
            ) : (
              notebooks.map(notebook => (
                <div 
                  key={notebook.id} 
                  className={`notebook-item ${currentNotebook?.id === notebook.id ? 'active' : ''}`}
                  onClick={() => handleOpenNotebook(notebook)}
                >
                  <div className="notebook-info">
                    <div className="notebook-name">{notebook.name}</div>
                    <div className="notebook-meta">
                      <span>{new Date(notebook.createdAt).toLocaleString()}</span>
                      <span>{notebook.updatedAt !== notebook.createdAt ? '已修改' : '未修改'}</span>
                    </div>
                  </div>
                  <div className="notebook-actions">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotebook(notebook.id);
                      }}
                      className="delete-btn"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* 预装数据集 */}
          <div className="datasets-section">
            <h3>预装数据集</h3>
            <div className="dataset-list">
              <div className="dataset-item">
                <div className="dataset-name">长沙房价数据集</div>
                <div className="dataset-desc">2020-2025年长沙各区域房价数据</div>
                <button className="import-btn">导入</button>
              </div>
              <div className="dataset-item">
                <div className="dataset-name">全国房价指数</div>
                <div className="dataset-desc">全国31个省市房价指数月度数据</div>
                <button className="import-btn">导入</button>
              </div>
              <div className="dataset-item">
                <div className="dataset-name">房地产政策数据集</div>
                <div className="dataset-desc">2015-2025年全国及各省市房地产政策</div>
                <button className="import-btn">导入</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 右侧笔记本编辑区域 */}
        <div className="notebook-editor">
          {currentNotebook ? (
            <>
              <div className="editor-header">
                <h2>{currentNotebook.name}</h2>
                <div className="editor-actions">
                  <button 
                    onClick={handleSaveNotebook}
                    disabled={isLoading}
                    className="save-btn"
                  >
                    {isLoading ? '保存中...' : '保存'}
                  </button>
                  <button onClick={handleCloseNotebook} className="close-btn">
                    关闭
                  </button>
                </div>
              </div>
              
              <div className="editor-content">
                {/* Jupyter Notebook 集成区域 */}
                <div className="jupyter-container">
                  <iframe 
                    src={`http://localhost:8888/notebooks/${currentNotebook.id}.ipynb?token=test-token`}
                    title={currentNotebook.name}
                    className="jupyter-frame"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="empty-editor">
              <h2>欢迎使用数据实验室</h2>
              <p>从左侧选择一个笔记本开始编辑，或创建一个新笔记本</p>
              <div className="feature-list">
                <div className="feature-item">
                  <i className="fas fa-code"></i>
                  <span>支持Python、R等多种编程语言</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-database"></i>
                  <span>预装丰富的房地产数据集</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-chart-line"></i>
                  <span>内置多种数据分析库</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-share-alt"></i>
                  <span>支持代码共享和协作</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataLab;

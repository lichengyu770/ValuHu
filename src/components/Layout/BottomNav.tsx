import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeOutlined, DatabaseOutlined, BarChartOutlined, UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './BottomNav.css';

const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
      >
        <HomeOutlined className="nav-icon" />
        <span className="nav-text">首页</span>
      </NavLink>
      <NavLink
        to="/data-management"
        className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
      >
        <DatabaseOutlined className="nav-icon" />
        <span className="nav-text">数据管理</span>
      </NavLink>
      <NavLink
        to="/data-analysis"
        className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
      >
        <BarChartOutlined className="nav-icon" />
        <span className="nav-text">数据分析</span>
      </NavLink>
      <NavLink
        to="/import-export"
        className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
      >
        <UploadOutlined className="nav-icon" />
        <span className="nav-text">导入导出</span>
      </NavLink>
      <NavLink
        to="/about"
        className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
      >
        <InfoCircleOutlined className="nav-icon" />
        <span className="nav-text">关于我们</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;

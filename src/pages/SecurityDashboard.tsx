import React, { useEffect, useState } from 'react';
import { PageContainer, Typography, Tabs, Card, List, Empty, Tag, Button } from 'antd';
import { 
  ShieldOutlined, 
  AuditOutlined, 
  LogoutOutlined, 
  LockOutlined,
  EyeOutlined,
  KeyOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import securityService from '../services/security/SecurityService';
import { AuditEvent, LogEntry } from '../services/security/SecurityService';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const SecurityDashboard: React.FC = () => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // 获取审计事件
    fetchAuditEvents();
    
    // 定期更新审计事件
    const intervalId = setInterval(() => {
      fetchAuditEvents();
    }, 30000); // 每30秒更新一次
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  const fetchAuditEvents = () => {
    setLoading(true);
    
    // 模拟异步获取审计事件
    setTimeout(() => {
      const events = securityService.getLocalAuditEvents();
      setAuditEvents(events);
      setLoading(false);
    }, 500);
  };
  
  const downloadAuditLogs = () => {
    // 导出审计日志为CSV
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Timestamp,EventType,UserId,Resource,Action,IpAddress,UserAgent,Result,Details\n" +
      auditEvents.map(e => 
        `${e.id},${e.timestamp.toISOString()},${e.eventType},${e.userId},${e.resource},${e.action},${e.ipAddress},${e.userAgent},${e.result},${JSON.stringify(e.details)}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <PageContainer title="安全仪表板">
      <div className="security-dashboard-container">
        <div className="security-dashboard-header">
          <Title level={3}>安全监控与审计</Title>
          <Paragraph>
            查看系统安全状态、审计日志和访问记录，确保系统安全运行。
          </Paragraph>
        </div>
        
        <Tabs defaultActiveKey="audit">
          {/* 审计日志 */}
          <TabPane 
            tab={
              <span>
                <AuditOutlined />
                审计日志
              </span>
            } 
            key="audit"
          >
            <div className="audit-logs-header">
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                onClick={downloadAuditLogs}
                disabled={auditEvents.length === 0}
              >
                导出审计日志
              </Button>
            </div>
            
            {loading ? (
              <div className="loading">加载审计日志中...</div>
            ) : auditEvents.length > 0 ? (
              <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={auditEvents}
                renderItem={(event) => (
                  <List.Item>
                    <Card 
                      hoverable 
                      className="audit-event-card"
                      title={
                        <div className="audit-event-title">
                          <span>{event.eventType}</span>
                          <Tag color={event.result === 'success' ? 'green' : 'red'}>
                            {event.result === 'success' ? '成功' : '失败'}
                          </Tag>
                        </div>
                      }
                    >
                      <div className="audit-event-content">
                        <p><strong>用户ID:</strong> {event.userId}</p>
                        <p><strong>资源:</strong> {event.resource}</p>
                        <p><strong>操作:</strong> {event.action}</p>
                        <p><strong>IP地址:</strong> {event.ipAddress}</p>
                        <p><strong>用户代理:</strong> {event.userAgent}</p>
                        <p><strong>时间:</strong> {new Date(event.timestamp).toLocaleString()}</p>
                        {event.details && (
                          <div className="audit-event-details">
                            <strong>详情:</strong> {JSON.stringify(event.details)}
                          </div>
                        )}
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无审计日志" />
            )}
          </TabPane>
          
          {/* 安全状态 */}
          <TabPane 
            tab={
              <span>
                <ShieldOutlined />
                安全状态
              </span>
            } 
            key="status"
          >
            <div className="security-status-container">
              <Card hoverable className="security-status-card">
                <div className="security-status-item">
                  <LockOutlined className="security-status-icon" />
                  <div className="security-status-content">
                    <h4>数据加密</h4>
                    <p>所有敏感数据均已加密存储和传输</p>
                  </div>
                </div>
              </Card>
              
              <Card hoverable className="security-status-card">
                <div className="security-status-item">
                  <EyeOutlined className="security-status-icon" />
                  <div className="security-status-content">
                    <h4>访问控制</h4>
                    <p>基于角色的访问控制已启用</p>
                  </div>
                </div>
              </Card>
              
              <Card hoverable className="security-status-card">
                <div className="security-status-item">
                  <KeyOutlined className="security-status-icon" />
                  <div className="security-status-content">
                    <h4>身份验证</h4>
                    <p>支持双因素认证</p>
                  </div>
                </div>
              </Card>
              
              <Card hoverable className="security-status-card">
                <div className="security-status-item">
                  <LogoutOutlined className="security-status-icon" />
                  <div className="security-status-content">
                    <h4>会话管理</h4>
                    <p>会话超时和自动注销已启用</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </div>
      
      <style jsx>{`
        .security-dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }
        
        .security-dashboard-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .audit-logs-header {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 16px;
        }
        
        .audit-event-card {
          margin-bottom: 16px;
        }
        
        .audit-event-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .audit-event-content {
          margin-top: 16px;
        }
        
        .audit-event-details {
          margin-top: 12px;
          padding: 8px;
          background-color: #f0f2f5;
          border-radius: 4px;
          overflow-x: auto;
        }
        
        .security-status-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }
        
        .security-status-card {
          text-align: center;
          padding: 24px;
        }
        
        .security-status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .security-status-icon {
          font-size: 48px;
          color: #1890ff;
          margin-bottom: 16px;
        }
        
        .security-status-content h4 {
          margin: 0 0 8px 0;
          color: #1890ff;
        }
        
        .security-status-content p {
          margin: 0;
          color: #8c8c8c;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #8c8c8c;
        }
      `}</style>
    </PageContainer>
  );
};

export default SecurityDashboard;

import React from 'react';

interface StepNavigationProps {
  steps: { title: string; description: string }[];
  currentStep: number;
  onStepChange: (stepNumber: number) => void;
}

/**
 * 步骤导航组件
 * 负责多步骤流程的显示和交互
 */
const StepNavigation: React.FC<StepNavigationProps> = ({ steps, currentStep, onStepChange }) => {
  return (
    <div className="step-navigation glass-effect" style={{ margin: '20px 0', padding: '20px', borderRadius: '12px', position: 'relative' }}>
      {/* 步骤进度条 - 底部背景 */}
      <div style={{ 
        position: 'absolute', 
        top: '44px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2px'
      }}></div>
      {/* 步骤进度条 - 填充 */}
      <div style={{ 
        position: 'absolute', 
        top: '44px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: `${((currentStep - 1) / (steps.length - 1)) * (100 - 20)}%`,
        maxWidth: 'calc(100% - 40px)',
        height: '4px',
        background: 'linear-gradient(90deg, #52c41a, #ffa046)',
        borderRadius: '2px',
        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1
      }}></div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          
          return (
            <div 
              key={stepNumber} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                flex: 1, 
                maxWidth: '350px', 
                margin: '0 10px',
                position: 'relative'
              }}
            >
              {/* 步骤圆圈 */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: isActive ? '#ffa046' : (isCompleted ? '#52c41a' : 'rgba(255, 255, 255, 0.1)'),
                color: isActive || isCompleted ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '20px',
                marginBottom: '12px',
                border: `3px solid ${isActive ? '#ffa046' : (isCompleted ? '#52c41a' : 'rgba(255, 160, 70, 0.3)')}`,
                boxShadow: isActive ? '0 6px 20px rgba(255, 160, 70, 0.5)' : (isCompleted ? '0 4px 16px rgba(82, 196, 26, 0.4)' : 'none'),
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: `scale(${isActive ? 1.1 : 1})`,
                cursor: 'pointer',
                zIndex: 3
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isCompleted) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 160, 70, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !isCompleted) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              onClick={() => {
                if (isCompleted || isActive) {
                  onStepChange(stepNumber);
                }
              }}
              >
                {isCompleted ? (
                  <span style={{ fontSize: '24px', animation: 'bounce 0.5s ease' }}>✓</span>
                ) : (
                  stepNumber
                )}
              </div>
              
              {/* 步骤内容 */}
              <div style={{ 
                textAlign: 'center', 
                opacity: isActive ? 1 : isCompleted ? 0.8 : 0.5,
                transform: isActive ? 'translateY(0)' : 'translateY(4px)',
                transition: 'all 0.4s ease',
                maxWidth: '200px'
              }}>
                <div style={{
                  fontSize: '16px', 
                  fontWeight: isActive ? 'bold' : 'normal', 
                  color: isActive ? '#ffa046' : (isCompleted ? '#52c41a' : '#fff'),
                  marginBottom: '4px'
                }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 当前步骤提示 */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '18px', 
        fontWeight: 'bold', 
        color: '#ffa046',
        background: 'linear-gradient(135deg, #ffa046, #ff7e35)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginTop: '20px',
        animation: 'fadeInUp 0.5s ease'
      }}>
        <span style={{ fontSize: '14px', opacity: 0.8, marginRight: '8px' }}>当前步骤</span>
        {steps[currentStep - 1].title}
      </div>
      
      {/* 动画样式 */}
      <style jsx>{`
        @keyframes bounce {
          0% { transform: scale(0.7); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default StepNavigation;
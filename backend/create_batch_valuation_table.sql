-- 创建批量估价任务表
CREATE TABLE IF NOT EXISTS batch_valuation_tasks (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    enterprise_id VARCHAR(255),
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    result_file_path VARCHAR(500),
    status VARCHAR(50) NOT NULL,
    total_records INTEGER NOT NULL DEFAULT 0,
    processed_records INTEGER NOT NULL DEFAULT 0,
    success_records INTEGER NOT NULL DEFAULT 0,
    failed_records INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_batch_valuation_tasks_user_id ON batch_valuation_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_valuation_tasks_enterprise_id ON batch_valuation_tasks(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_batch_valuation_tasks_status ON batch_valuation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_batch_valuation_tasks_created_at ON batch_valuation_tasks(created_at DESC);

-- 添加外键约束
ALTER TABLE batch_valuation_tasks ADD CONSTRAINT fk_batch_valuation_tasks_user_id FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE batch_valuation_tasks ADD CONSTRAINT fk_batch_valuation_tasks_enterprise_id FOREIGN KEY (enterprise_id) REFERENCES enterprises(id);

-- 注释表
COMMENT ON TABLE batch_valuation_tasks IS '批量估价任务表';
COMMENT ON COLUMN batch_valuation_tasks.id IS '任务ID';
COMMENT ON COLUMN batch_valuation_tasks.user_id IS '用户ID';
COMMENT ON COLUMN batch_valuation_tasks.enterprise_id IS '企业ID';
COMMENT ON COLUMN batch_valuation_tasks.filename IS '上传文件名';
COMMENT ON COLUMN batch_valuation_tasks.file_path IS '文件存储路径';
COMMENT ON COLUMN batch_valuation_tasks.result_file_path IS '结果文件存储路径';
COMMENT ON COLUMN batch_valuation_tasks.status IS '任务状态：pending/processing/completed/failed/cancelled';
COMMENT ON COLUMN batch_valuation_tasks.total_records IS '总记录数';
COMMENT ON COLUMN batch_valuation_tasks.processed_records IS '已处理记录数';
COMMENT ON COLUMN batch_valuation_tasks.success_records IS '成功记录数';
COMMENT ON COLUMN batch_valuation_tasks.failed_records IS '失败记录数';
COMMENT ON COLUMN batch_valuation_tasks.created_at IS '创建时间';
COMMENT ON COLUMN batch_valuation_tasks.updated_at IS '更新时间';

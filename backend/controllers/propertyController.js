const { query } = require('../config/db');
const webhookService = require('../services/webhookService');

// 内存存储作为备用
let inMemoryProperties = [
  { id: 1, name: '测试房产1', price: 150, type: '住宅', area: 120, longitude: 112.9388, latitude: 28.2278, address: '长沙市岳麓区', description: '这是一个测试房产', created_at: new Date(), updated_at: new Date() },
  { id: 2, name: '测试房产2', price: 200, type: '写字楼', area: 200, longitude: 112.9488, latitude: 28.2378, address: '长沙市天心区', description: '这是一个测试房产', created_at: new Date(), updated_at: new Date() },
  { id: 3, name: '测试房产3', price: 180, type: '住宅', area: 150, longitude: 112.9288, latitude: 28.2178, address: '长沙市开福区', description: '这是一个测试房产', created_at: new Date(), updated_at: new Date() }
];

const getProperties = async (req, res) => {
  try {
    const result = await query('SELECT * FROM properties ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.log('使用内存存储返回房产数据');
    res.json(inMemoryProperties);
  }
};

const getPropertyById = async (req, res) => {
  try {
    const result = await query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '房产未找到' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    const property = inMemoryProperties.find(p => p.id === parseInt(req.params.id));
    if (!property) {
      return res.status(404).json({ message: '房产未找到' });
    }
    res.json(property);
  }
};

const createProperty = async (req, res) => {
  const { name, price, type, longitude, latitude, address, description, area } = req.body;
  
  try {
    const result = await query(
      'INSERT INTO properties (name, price, type, longitude, latitude, address, description, area, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *',
      [name, price, type, longitude, latitude, address, description, area]
    );
    const createdProperty = result.rows[0];
    // 发送Webhook通知
    await webhookService.handlePropertyCreated(createdProperty);
    res.status(201).json(createdProperty);
  } catch (error) {
    const newProperty = {
      id: inMemoryProperties.length + 1,
      name,
      price,
      type,
      longitude,
      latitude,
      address,
      description,
      area,
      created_at: new Date(),
      updated_at: new Date()
    };
    inMemoryProperties.push(newProperty);
    // 发送Webhook通知
    await webhookService.handlePropertyCreated(newProperty);
    res.status(201).json(newProperty);
  }
};

const updateProperty = async (req, res) => {
  const { name, price, type, longitude, latitude, address, description, area } = req.body;
  
  try {
    const result = await query(
      'UPDATE properties SET name = $1, price = $2, type = $3, longitude = $4, latitude = $5, address = $6, description = $7, area = $8, updated_at = NOW() WHERE id = $9 RETURNING *',
      [name, price, type, longitude, latitude, address, description, area, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '房产未找到' });
    }
    
    const updatedProperty = result.rows[0];
    // 发送Webhook通知
    await webhookService.handlePropertyUpdated(updatedProperty);
    res.json(updatedProperty);
  } catch (error) {
    const index = inMemoryProperties.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: '房产未找到' });
    }
    inMemoryProperties[index] = { ...inMemoryProperties[index], name, price, type, longitude, latitude, address, description, area, updated_at: new Date() };
    // 发送Webhook通知
    await webhookService.handlePropertyUpdated(inMemoryProperties[index]);
    res.json(inMemoryProperties[index]);
  }
};

const deleteProperty = async (req, res) => {
  try {
    const result = await query('DELETE FROM properties WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '房产未找到' });
    }
    
    res.json({ message: '房产已删除' });
  } catch (error) {
    const index = inMemoryProperties.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ message: '房产未找到' });
    }
    inMemoryProperties.splice(index, 1);
    res.json({ message: '房产已删除' });
  }
};

const batchUpdateProperty = async (req, res) => {
  const { property_updates } = req.body;
  
  try {
    if (!property_updates || !Array.isArray(property_updates) || property_updates.length === 0) {
      return res.status(400).json({ success: false, message: '请提供有效的房产更新数据数组' });
    }
    
    // 限制批量更新数量
    if (property_updates.length > 50) {
      return res.status(400).json({ success: false, message: '单次批量更新房产数量不能超过50个' });
    }
    
    const updatedProperties = [];
    const failedUpdates = [];
    
    // 批量更新房产信息
    for (const update of property_updates) {
      const { id, ...updateData } = update;
      
      if (!id) {
        failedUpdates.push({ id: null, message: '房产ID不能为空' });
        continue;
      }
      
      try {
        // 构建更新语句
        const updateFields = Object.keys(updateData).filter(field => updateData[field] !== undefined);
        
        if (updateFields.length === 0) {
          failedUpdates.push({ id, message: '没有要更新的字段' });
          continue;
        }
        
        // 构建SET子句
        const setClause = updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        // 构建参数数组
        const params = [...updateFields.map(field => updateData[field]), id];
        // 构建完整的SQL语句
        const sql = `UPDATE properties SET ${setClause}, updated_at = NOW() WHERE id = $${updateFields.length + 1} RETURNING *`;
        
        const result = await query(sql, params);
        
        if (result.rows.length === 0) {
          failedUpdates.push({ id, message: '房产未找到' });
        } else {
          updatedProperties.push(result.rows[0]);
        }
      } catch (error) {
        console.error(`更新房产 ${id} 错误:`, error);
        failedUpdates.push({ id, message: '更新失败' });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `成功更新${updatedProperties.length}个房产，失败${failedUpdates.length}个`,
      data: {
        updatedProperties,
        failedUpdates
      }
    });
  } catch (error) {
    console.error('批量更新房产错误:', error);
    
    // 内存存储作为备用
    if (!property_updates || !Array.isArray(property_updates) || property_updates.length === 0) {
      return res.status(400).json({ success: false, message: '请提供有效的房产更新数据数组' });
    }
    
    const updatedProperties = [];
    const failedUpdates = [];
    
    for (const update of property_updates) {
      const { id, ...updateData } = update;
      
      if (!id) {
        failedUpdates.push({ id: null, message: '房产ID不能为空' });
        continue;
      }
      
      const index = inMemoryProperties.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        failedUpdates.push({ id, message: '房产未找到' });
      } else {
        inMemoryProperties[index] = { ...inMemoryProperties[index], ...updateData, updated_at: new Date() };
        updatedProperties.push(inMemoryProperties[index]);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `成功更新${updatedProperties.length}个房产，失败${failedUpdates.length}个`,
      data: {
        updatedProperties,
        failedUpdates
      }
    });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  batchUpdateProperty
};
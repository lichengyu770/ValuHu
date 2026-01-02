const express = require('express');
const { query, pool } = require('../config/db');
const { protect } = require('../middleware/auth');
const webhookService = require('../services/webhookService');

// 引入AI估价算法
const valuationModel = require('../../algorithms/valuation_model.cjs');
const dataCleaner = require('../../algorithms/data_cleaner.cjs');

// 获取估价列表
exports.getValuations = async (req, res) => {
    try {
        // 记录API调用开始时间
        const startTime = Date.now();
        
        // 增强筛选参数
        const {
            property_id, user_id, property_type, city, district, status,
            min_price, max_price, min_confidence, model_type,
            sort_by = 'created_at', sort_order = 'desc',
            limit = 20, offset = 0
        } = req.query;
        
        let sql = `
            SELECT v.*, p.address, p.city, p.district, p.property_type
            FROM valuations v
            LEFT JOIN properties p ON v.property_id = p.id
            WHERE 1=1
        `;
        const params = [];
        
        // 构建筛选条件
        if (property_id) {
            sql += ' AND v.property_id = $' + (params.length + 1);
            params.push(property_id);
        }
        
        if (user_id) {
            sql += ' AND v.user_id = $' + (params.length + 1);
            params.push(user_id);
        }
        
        if (property_type) {
            sql += ' AND p.property_type = $' + (params.length + 1);
            params.push(property_type);
        }
        
        if (city) {
            sql += ' AND p.city = $' + (params.length + 1);
            params.push(city);
        }
        
        if (district) {
            sql += ' AND p.district = $' + (params.length + 1);
            params.push(district);
        }
        
        if (status) {
            sql += ' AND v.status = $' + (params.length + 1);
            params.push(status);
        }
        
        if (min_price) {
            sql += ' AND v.estimated_price >= $' + (params.length + 1);
            params.push(parseInt(min_price));
        }
        
        if (max_price) {
            sql += ' AND v.estimated_price <= $' + (params.length + 1);
            params.push(parseInt(max_price));
        }
        
        if (min_confidence) {
            sql += ' AND v.confidence_level >= $' + (params.length + 1);
            params.push(parseFloat(min_confidence));
        }
        
        if (model_type) {
            sql += ' AND v.model_type = $' + (params.length + 1);
            params.push(model_type);
        }
        
        // 构建排序条件
        const allowedSortFields = ['created_at', 'estimated_price', 'price_per_sqm', 'confidence_level'];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
        const sortDirection = sort_order === 'asc' ? 'ASC' : 'DESC';
        sql += ` ORDER BY ${sortField} ${sortDirection}`;
        
        // 分页处理
        sql += ' LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(parseInt(limit), parseInt(offset));
        
        const { rows } = await query(sql, params);
        
        // 获取总数，使用相同的筛选条件
        const countSql = sql.replace(/SELECT v\.\*.*FROM/, 'SELECT COUNT(*) as total FROM')
                           .replace(/ORDER BY.*$/, '')
                           .replace(/LIMIT.*$/, '');
        const countParams = params.slice(0, -2); // 移除分页参数
        const countResult = await query(countSql, countParams);
        
        // 计算API响应时间
        const responseTime = Date.now() - startTime;
        
        // 记录API使用统计
        await query(
            'INSERT INTO api_usage_logs (endpoint, method, user_id, response_time, status_code, params) VALUES ($1, $2, $3, $4, $5, $6)',
            ['/valuations', 'GET', req.user?.id || null, responseTime, 200, JSON.stringify(req.query)]
        );
        
        res.status(200).json({
            success: true,
            data: rows,
            total: parseInt(countResult.rows[0].total),
            limit: parseInt(limit),
            offset: parseInt(offset),
            sort_by: sort_field,
            sort_order: sortDirection,
            response_time: responseTime
        });
    } catch (error) {
        console.error('获取估价列表错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 获取单个估价详情
exports.getValuationById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await query('SELECT * FROM valuations WHERE id = $1', [id]);
        
        if (!rows.length) {
            return res.status(404).json({ success: false, message: '估价不存在' });
        }
        
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('获取估价详情错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 创建新估价
exports.createValuation = async (req, res) => {
    try {
        // 记录API调用开始时间
        const startTime = Date.now();
        
        const { property_id, model_type = 'ensemble' } = req.body;
        const user_id = req.user.id;
        
        // 1. 验证参数
        if (!property_id) {
            return res.status(400).json({ success: false, message: '请提供房产ID' });
        }
        
        // 2. 获取房产信息，包括新增的字段
        const propertyResult = await query(
            `SELECT * FROM properties WHERE id = $1 AND user_id = $2`,
            [property_id, user_id]
        );
        if (!propertyResult.rows.length) {
            return res.status(404).json({ success: false, message: '房产不存在或无权限' });
        }
        
        const property = propertyResult.rows[0];
        
        // 3. 准备估价数据，包括新增的字段
        const valuationData = {
            area: property.area,
            floor_level: property.floor_level,
            total_floors: property.total_floors,
            elevator: property.elevator,
            building_year: property.building_year,
            property_type: property.property_type,
            property_rights_years: property.property_rights_years,
            plot_ratio: property.plot_ratio,
            greening_rate: property.greening_rate,
            rooms: property.rooms,
            bathrooms: property.bathrooms,
            orientation: property.orientation,
            decoration_status: property.decoration_status
        };
        
        // 4. 数据清洗
        const cleanedData = dataCleaner.cleanData(valuationData);
        
        // 5. 调用AI估价模型
        const valuationResult = valuationModel.estimatePrice(cleanedData, model_type);
        
        // 6. 保存估价结果到数据库
        const sql = `
            INSERT INTO valuations (
                property_id, user_id, estimated_price, price_per_sqm, 
                confidence_level, model_version, model_type, features, result_details, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        
        const params = [
            property_id,
            user_id,
            valuationResult.estimated_price,
            valuationResult.price_per_sqm,
            valuationResult.confidence_level,
            valuationResult.model_version,
            model_type,
            JSON.stringify(valuationResult.features),
            JSON.stringify(valuationResult.result_details),
            'completed'
        ];
        
        const { rows } = await query(sql, params);
        const createdValuation = rows[0];
        
        // 计算API响应时间
        const responseTime = Date.now() - startTime;
        
        // 记录API使用统计
        await query(
            'INSERT INTO api_usage_logs (endpoint, method, user_id, response_time, status_code, params) VALUES ($1, $2, $3, $4, $5, $6)',
            ['/valuations', 'POST', user_id, responseTime, 201, JSON.stringify({ property_id, model_type })]
        );
        
        // 发送Webhook通知
        await webhookService.handleValuationCreated(createdValuation);
        
        res.status(201).json({ 
            success: true, 
            data: createdValuation,
            response_time: responseTime,
            message: '估价成功' 
        });
    } catch (error) {
        console.error('创建估价错误:', error);
        
        // 记录错误日志
        await query(
            'INSERT INTO api_usage_logs (endpoint, method, user_id, response_time, status_code, params, error) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            ['/valuations', 'POST', req.user?.id || null, Date.now() - startTime, 500, JSON.stringify(req.body), error.message]
        );
        
        res.status(500).json({ 
            success: false, 
            message: '服务器错误',
            error: error.message 
        });
    }
};

// 批量估价
exports.batchValuation = async (req, res) => {
    try {
        const { property_ids, model_type = 'ensemble' } = req.body;
        const user_id = req.user.id;
        
        if (!property_ids || !Array.isArray(property_ids) || property_ids.length === 0) {
            return res.status(400).json({ success: false, message: '请提供有效的房产ID列表' });
        }
        
        const createdValuations = [];
        
        for (const property_id of property_ids) {
            try {
                // 获取房产信息
                const propertyResult = await query('SELECT * FROM properties WHERE id = $1 AND user_id = $2', [property_id, user_id]);
                if (!propertyResult.rows.length) {
                    continue;
                }
                
                const property = propertyResult.rows[0];
                
                // 准备估价数据
                const valuationData = {
                    area: property.area,
                    floor_level: property.floor_level,
                    building_year: property.building_year,
                    property_type: property.property_type,
                    rooms: property.rooms,
                    bathrooms: property.bathrooms,
                    orientation: property.orientation,
                    decoration_status: property.decoration_status
                };
                
                // 数据清洗
                const cleanedData = dataCleaner.cleanData(valuationData);
                
                // 调用AI估价模型
                const valuationResult = valuationModel.estimatePrice(cleanedData, model_type);
                
                // 保存估价结果
                const sql = `
                    INSERT INTO valuations (
                        property_id, user_id, estimated_price, price_per_sqm, 
                        confidence_level, model_version, model_type, features, result_details
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING *
                `;
                
                const params = [
                    property_id,
                    user_id,
                    valuationResult.estimated_price,
                    valuationResult.price_per_sqm,
                    valuationResult.confidence_level,
                    valuationResult.model_version,
                    model_type,
                    JSON.stringify(valuationResult.features),
                    JSON.stringify(valuationResult.result_details)
                ];
                
                const result = await query(sql, params);
                const createdValuation = result.rows[0];
                createdValuations.push(createdValuation);
                // 发送Webhook通知
                await webhookService.handleValuationCreated(createdValuation);
            } catch (error) {
                console.error(`批量估价房产ID ${property_id} 错误:`, error);
                continue;
            }
        }
        
        res.status(201).json({
            success: true,
            message: `成功创建 ${createdValuations.length} 个估价`,
            data: createdValuations,
            failed_count: property_ids.length - createdValuations.length
        });
    } catch (error) {
        console.error('批量估价错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 获取市场趋势分析
exports.getMarketTrend = async (req, res) => {
    try {
        const { city, district, property_type, start_date, end_date } = req.query;
        
        // 这里可以扩展为更复杂的市场趋势分析
        // 暂时返回模拟数据
        const trendData = {
            city: city || '全国',
            district: district,
            property_type: property_type || 'residential',
            start_date: start_date || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: end_date || new Date().toISOString().split('T')[0],
            data: [
                { date: '2025-01', avg_price: 14000, count: 120 },
                { date: '2025-02', avg_price: 14200, count: 135 },
                { date: '2025-03', avg_price: 14500, count: 150 },
                { date: '2025-04', avg_price: 14300, count: 148 },
                { date: '2025-05', avg_price: 14800, count: 155 },
                { date: '2025-06', avg_price: 15000, count: 160 },
                { date: '2025-07', avg_price: 15200, count: 165 },
                { date: '2025-08', avg_price: 15300, count: 170 },
                { date: '2025-09', avg_price: 15500, count: 175 },
                { date: '2025-10', avg_price: 15600, count: 180 },
                { date: '2025-11', avg_price: 15800, count: 185 },
                { date: '2025-12', avg_price: 16000, count: 190 }
            ],
            summary: {
                avg_price: 14958.33,
                trend: '上升',
                growth_rate: '14.29%',
                market_sentiment: '积极'
            }
        };
        
        res.status(200).json({ success: true, data: trendData });
    } catch (error) {
        console.error('获取市场趋势错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 删除估价记录
exports.deleteValuation = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        const result = await query('DELETE FROM valuations WHERE id = $1 AND user_id = $2 RETURNING *', [id, user_id]);
        
        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: '估价记录不存在或无权限' });
        }
        
        res.status(200).json({ success: true, message: '估价记录已删除' });
    } catch (error) {
        console.error('删除估价错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 获取用户估价历史
exports.getValuationHistory = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { limit = 10, offset = 0 } = req.query;
        
        const sql = `
            SELECT v.*, p.address, p.city 
            FROM valuations v 
            LEFT JOIN properties p ON v.property_id = p.id
            WHERE v.user_id = $1 
            ORDER BY v.created_at DESC 
            LIMIT $2 OFFSET $3
        `;
        
        const { rows } = await query(sql, [user_id, limit, offset]);
        
        // 获取总数
        const countSql = 'SELECT COUNT(*) as total FROM valuations WHERE user_id = $1';
        const countResult = await query(countSql, [user_id]);
        
        res.status(200).json({
            success: true,
            data: rows,
            total: parseInt(countResult.rows[0].total),
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('获取估价历史错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 获取房产估价历史
exports.getPropertyValuationHistory = async (req, res) => {
    try {
        const { property_id } = req.params;
        const { limit = 5 } = req.query;
        
        const sql = `
            SELECT * FROM valuations 
            WHERE property_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2
        `;
        
        const { rows } = await query(sql, [property_id, limit]);
        
        if (!rows.length) {
            return res.status(404).json({ success: false, message: '没有找到估价记录' });
        }
        
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('获取房产估价历史错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

// 获取估价结果对比
exports.getValuationComparison = async (req, res) => {
    try {
        const { property_ids, limit = 5 } = req.query;
        
        if (!property_ids) {
            return res.status(400).json({ success: false, message: '请提供房产ID' });
        }
        
        const propertyIdArray = Array.isArray(property_ids) ? property_ids : [property_ids];
        const comparisonResults = [];
        
        for (const property_id of propertyIdArray) {
            const sql = `
                SELECT * FROM valuations 
                WHERE property_id = $1 
                ORDER BY created_at DESC 
                LIMIT $2
            `;
            
            const { rows } = await query(sql, [property_id, limit]);
            
            if (rows.length > 0) {
                // 计算对比数据
                const comparisonData = {
                    property_id: property_id,
                    valuations: rows,
                    avg_price: rows.reduce((sum, val) => sum + val.estimated_price, 0) / rows.length,
                    min_price: Math.min(...rows.map(val => val.estimated_price)),
                    max_price: Math.max(...rows.map(val => val.estimated_price)),
                    latest_price: rows[0].estimated_price
                };
                comparisonResults.push(comparisonData);
            }
        }
        
        if (comparisonResults.length === 0) {
            return res.status(404).json({ success: false, message: '没有找到估价记录' });
        }
        
        res.status(200).json({ success: true, data: comparisonResults });
    } catch (error) {
        console.error('获取估价对比错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

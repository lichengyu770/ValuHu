// API配置文件

const API_CONFIG = {
    public: {
        url: 'https://api.example.com/real-estate/public',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_PUBLIC_API_KEY' // 实际应用中应从环境变量获取
        },
        params: {
            limit: 100,
            offset: 0,
            sort_by: 'created_at',
            sort_order: 'desc'
        },
        maxRetries: 3
    },
    government: {
        url: 'https://api.gov.example.com/real-estate/data',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_GOVERNMENT_API_KEY' // 实际应用中应从环境变量获取
        },
        params: {
            year: new Date().getFullYear(),
            quarter: Math.ceil(new Date().getMonth() / 3),
            region: 'national'
        },
        maxRetries: 3
    },
    partner: {
        url: 'https://api.partner.example.com/real-estate/listings',
        headers: {
            'Content-Type': 'application/json',
            'X-Partner-Key': 'YOUR_PARTNER_KEY' // 实际应用中应从环境变量获取
        },
        params: {
            active: true,
            limit: 100,
            fields: 'id,address,city,district,area,price,price_per_sqm,rooms,bathrooms,floor_level,total_floors,building_year,property_type,orientation,decoration_status,transaction_date'
        },
        maxRetries: 3
    }
};

module.exports = { API_CONFIG };
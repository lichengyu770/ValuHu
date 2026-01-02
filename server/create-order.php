<?php
// server/create-order.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// 接收前端数据
$data = json_decode(file_get_contents('php://input'), true);
$price = $data['price'];
$service = $data['service'];
$payType = $data['payType'];

// 生成唯一订单号
$orderNo = 'PAY' . date('YmdHis') . rand(1000, 9999);

// 确保orders目录存在
if (!is_dir('orders')) {
    mkdir('orders', 0777, true);
}

// 模拟对接支付宝（真实场景需接入支付宝SDK）
if ($payType === 'alipay') {
    // 沙箱环境支付链接（测试用）
    $payUrl = "https://openapi.alipaydev.com/gateway.do?app_id=YOUR_SANDBOX_APPID&biz_content=%7B%22out_trade_no%22%3A%22{$orderNo}%22%2C%22total_amount%22%3A%22{$price}%22%2C%22subject%22%3A%22{$service}%22%2C%22product_code%22%3A%22FAST_INSTANT_TRADE_PAY%22%7D&format=json&method=alipay.trade.page.pay&sign=YOUR_SIGN&timestamp=" . urlencode(date('Y-m-d H:i:s')) . "&version=1.0";
    
    // 保存订单到本地文件（替代数据库，简化操作）
    $order = [
        'order_no' => $orderNo,
        'price' => $price,
        'service' => $service,
        'status' => 'unpaid',
        'create_time' => date('Y-m-d H:i:s')
    ];
    file_put_contents("orders/{$orderNo}.json", json_encode($order));
    
    echo json_encode(['code' => 200, 'payUrl' => $payUrl, 'orderNo' => $orderNo]);
} else if ($payType === 'wechat') {
    // 这里简化处理，实际需要接入微信支付API
    echo json_encode(['code' => 400, 'msg' => '微信支付暂未开通']);
} else {
    echo json_encode(['code' => 400, 'msg' => '不支持的支付方式']);
}
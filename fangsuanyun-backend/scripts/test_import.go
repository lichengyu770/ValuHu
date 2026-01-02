package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
)

// TestDataGenerator 生成测试数据
func TestDataGenerator(count int) []XiangtanDistrictData {
	var data []XiangtanDistrictData
	
	// 模拟生成count条湘潭区数据
	for i := 1; i <= count; i++ {
		item := XiangtanDistrictData{
			DistrictName:  fmt.Sprintf("湘潭区%d", i),
			Area:          100.5 + float64(i)*0.5,
			Population:    10000 + i*100,
			PropertyCount: 500 + i*10,
			AveragePrice:  8000.0 + float64(i)*50.0,
			YearBuilt:     2000 + i%25,
			Latitude:      27.8219 + float64(i)*0.001,
			Longitude:     112.9413 + float64(i)*0.001,
			Description:   fmt.Sprintf("这是湘潭区%d的详细描述，包含面积、人口、房产数量等信息。", i),
		}
		data = append(data, item)
	}
	
	return data
}

// ImportTestData 导入测试数据
func ImportTestData(data []XiangtanDistrictData) error {
	// 将数据转换为JSON
	requestBody, err := json.Marshal(map[string]interface{}{
		"data": data,
	})
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	// 创建HTTP请求
	client := &http.Client{}
	req, err := http.NewRequest("POST", "http://localhost:8080/api/district/data/import", strings.NewReader(string(requestBody)))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// 设置请求头
	req.Header.Set("Content-Type", "application/json")

	// 发送请求
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// 解析响应
	var response ImportDataResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}

	// 检查响应
	if !response.Success {
		return fmt.Errorf("import failed: %s", response.Message)
	}

	// 输出结果
	fmt.Printf("Import completed:\n")
	fmt.Printf("- Total records: %d\n", len(data))
	fmt.Printf("- Imported: %d\n", response.Imported)
	fmt.Printf("- Failed: %d\n", response.Failed)
	if response.Failed > 0 {
		fmt.Printf("- Failed items: %v\n", response.FailedItems)
	}

	return nil
}

// main 函数，用于测试数据导入
func main() {
	// 生成350条测试数据
	fmt.Println("Generating 350 test records...")
	testData := TestDataGenerator(350)
	
	// 导入数据
	fmt.Println("\nImporting data to server...")
	if err := ImportTestData(testData); err != nil {
		log.Fatalf("Import failed: %v", err)
	}
	
	fmt.Println("\nData import completed successfully!")
}

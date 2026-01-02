package main

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// SetupImportRoutes 设置导入相关路由
func SetupImportRoutes(r *gin.Engine) {
	// 导入路由组
	importGroup := r.Group("/api/import")
	{
		// 通过文件名导入CSV（适合服务器本地文件）
		importGroup.POST("/csv-file", ImportCSVFile)
		// 通过上传文件导入CSV
		importGroup.POST("/csv-upload", ImportCSVUpload)
	}
}

// ImportResult 导入结果结构
type ImportResult struct {
	Total    int `json:"total"`
	Imported int `json:"imported"`
	Failed   int `json:"failed"`
}

// ImportCSVFile 通过文件名导入CSV数据
func ImportCSVFile(c *gin.Context) {
	// 获取文件名参数
	var req struct {
		Filename string `json:"filename" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
		})
		return
	}

	// 验证文件是否存在
	if _, err := os.Stat(req.Filename); os.IsNotExist(err) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": fmt.Sprintf("File '%s' does not exist", req.Filename),
		})
		return
	}

	// 执行导入
	result, err := ImportFromCSV(req.Filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": fmt.Sprintf("Failed to import CSV: %v", err),
		})
		return
	}

	// 返回结果
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "CSV imported successfully",
		"result":  result,
	})
}

// ImportCSVUpload 通过上传文件导入CSV数据
func ImportCSVUpload(c *gin.Context) {
	// 从请求中获取上传的文件
	file, _, err := c.Request.FormFile("csv_file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Failed to get uploaded file",
		})
		return
	}
	defer file.Close()

	// 创建临时文件
	tempFile, err := os.CreateTemp("", "csv_import_*.csv")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create temp file",
		})
		return
	}
	defer os.Remove(tempFile.Name())
	defer tempFile.Close()

	// 将上传的文件内容复制到临时文件
	if _, err := io.Copy(tempFile, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to save uploaded file",
		})
		return
	}

	// 执行导入
	result, err := ImportFromCSV(tempFile.Name())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": fmt.Sprintf("Failed to import CSV: %v", err),
		})
		return
	}

	// 返回结果
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "CSV uploaded and imported successfully",
		"result":  result,
	})
}

// ImportFromCSV 从CSV文件导入数据到数据库
func ImportFromCSV(filePath string) (*ImportResult, error) {
	// 打开CSV文件
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// 创建CSV读取器
	reader := csv.NewReader(file)
	reader.TrimLeadingSpace = true

	// 读取表头
	header, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("failed to read header: %w", err)
	}

	// 验证表头 - 检查实际CSV的关键列
	requiredColumns := map[string]bool{
		"小区名称":         true,
		"建筑面积(㎡)":       true,
		"所在区域":         true,
		"成交单价(元/㎡)":     true,
	}

	// 创建表头映射，方便后续访问
	headerMap := make(map[string]int)
	for i, col := range header {
		headerMap[col] = i
		if _, exists := requiredColumns[col]; exists {
			requiredColumns[col] = false
		}
	}

	// 检查是否缺少必需的列
	for col, required := range requiredColumns {
		if required {
			return nil, fmt.Errorf("missing required column: %s", col)
		}
	}

	// 批量导入数据
	imported := 0
	failed := 0

	// 开启事务
	tx, err := db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}

	// 准备插入语句
	stmt, err := tx.Prepare(`INSERT INTO xiangtan_district_data (project_name, building_area, house_type, district, decoration, average_price) VALUES (?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to prepare insert statement: %w", err)
	}
	defer stmt.Close()

	// 读取并导入数据
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			failed++
			continue
		}

		// 确保记录长度足够
		if len(record) < len(header) {
			failed++
			continue
		}

		// 解析数值字段
		buildingArea, _ := strconv.ParseFloat(record[headerMap["建筑面积(㎡)"]], 64)
		averagePriceStr := strings.TrimSpace(record[headerMap["成交单价(元/㎡)"]])
		averagePrice, _ := strconv.ParseFloat(averagePriceStr, 64)

		// 获取文本字段
		projectName := record[headerMap["小区名称"]]
		houseType := record[headerMap["户型"]]
		district := record[headerMap["所在区域"]]
		decoration := record[headerMap["装修情况"]]

		// 执行插入
		_, err = stmt.Exec(
			projectName,
			buildingArea,
			houseType,
			district,
			decoration,
			averagePrice,
		)
		if err != nil {
			failed++
			log.Printf("Failed to insert record: %v", err)
			continue
		}

		imported++
	}

	// 提交事务
	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// 返回结果
	return &ImportResult{
		Total:    imported + failed,
		Imported: imported,
		Failed:   failed,
	}, nil
}

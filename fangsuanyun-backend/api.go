package main

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// SetupRouter 设置路由
func SetupRouter() *gin.Engine {
	// 创建默认路由引擎
	r := gin.Default()

	// 设置CORS中间件
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API路由组
	api := r.Group("/api")
	{
		// 湘潭区数据相关路由
		district := api.Group("/district")
		{
			district.GET("/data", GetAllDistrictData)      // 获取所有湘潭区数据
			district.GET("/data/:id", GetDistrictDataByID)  // 根据ID获取湘潭区数据
			district.POST("/data", CreateDistrictData)       // 创建湘潭区数据
			district.PUT("/data/:id", UpdateDistrictData)    // 更新湘潭区数据
			district.DELETE("/data/:id", DeleteDistrictData) // 删除湘潭区数据
			district.GET("/data/count", GetDistrictDataCount) // 获取数据总数
		}
	}

	// 设置导入相关路由
	SetupImportRoutes(r)

	// 健康检查路由
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "FangSuanYun backend is running",
		})
	})

	return r
}

// GetAllDistrictData 获取所有湘潭区数据
func GetAllDistrictData(c *gin.Context) {
	// 获取查询参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	search := c.Query("search")

	// 计算偏移量
	offset := (page - 1) * pageSize

	// 构建查询语句
	query := `SELECT id, project_name, building_area, house_type, district, decoration, average_price, created_at FROM xiangtan_district_data`
	countQuery := `SELECT COUNT(*) FROM xiangtan_district_data`

	// 如果有搜索条件
	args := []interface{}{}
	if search != "" {
		query += ` WHERE project_name LIKE ? OR district LIKE ?`
		countQuery += ` WHERE project_name LIKE ? OR district LIKE ?`
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern, searchPattern)
	}

	// 添加分页
	query += ` LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	// 执行查询获取数据
	rows, err := db.Query(query, args...)
	if err != nil {
		log.Printf("Failed to query district data: %v", err)
		c.JSON(http.StatusInternalServerError, DistrictDataResponse{
			Success: false,
			Message: "Failed to get district data",
		})
		return
	}
	defer rows.Close()

	// 解析结果
	var data []XiangtanDistrictData
	for rows.Next() {
		var item XiangtanDistrictData
		if err := rows.Scan(&item.ID, &item.ProjectName, &item.BuildingArea, &item.HouseType, &item.District, &item.Decoration, &item.AveragePrice, &item.CreatedAt); err != nil {
			log.Printf("Failed to scan district data: %v", err)
			c.JSON(http.StatusInternalServerError, DistrictDataResponse{
				Success: false,
				Message: "Failed to parse district data",
			})
			return
		}
		data = append(data, item)
	}

	// 执行查询获取总数
	countArgs := args[:len(args)-2] // 移除LIMIT和OFFSET参数
	var total int64
	if err := db.QueryRow(countQuery, countArgs...).Scan(&total); err != nil {
		log.Printf("Failed to count district data: %v", err)
		c.JSON(http.StatusInternalServerError, DistrictDataResponse{
			Success: false,
			Message: "Failed to get total count",
		})
		return
	}

	// 返回响应
	c.JSON(http.StatusOK, DistrictDataResponse{
		Success: true,
		Data:    data,
		Total:   total,
	})
}

// GetDistrictDataByID 根据ID获取湘潭区数据
func GetDistrictDataByID(c *gin.Context) {
	// 获取ID参数
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, SingleDataResponse{
			Success: false,
			Message: "Invalid ID format",
		})
		return
	}

	// 查询数据
	query := `SELECT id, project_name, building_area, house_type, district, decoration, average_price, created_at FROM xiangtan_district_data WHERE id = ?`
	var item XiangtanDistrictData
	err = db.QueryRow(query, id).Scan(&item.ID, &item.ProjectName, &item.BuildingArea, &item.HouseType, &item.District, &item.Decoration, &item.AveragePrice, &item.CreatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, SingleDataResponse{
			Success: false,
			Message: "District data not found",
		})
		return
	} else if err != nil {
		log.Printf("Failed to get district data by ID: %v", err)
		c.JSON(http.StatusInternalServerError, SingleDataResponse{
			Success: false,
			Message: "Failed to get district data",
		})
		return
	}

	// 返回响应
	c.JSON(http.StatusOK, SingleDataResponse{
		Success: true,
		Data:    item,
	})
}

// CreateDistrictData 创建湘潭区数据
func CreateDistrictData(c *gin.Context) {
	// 解析请求体
	var newData XiangtanDistrictData
	if err := c.ShouldBindJSON(&newData); err != nil {
		c.JSON(http.StatusBadRequest, SingleDataResponse{
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	// 验证必填字段
	if newData.ProjectName == "" {
		c.JSON(http.StatusBadRequest, SingleDataResponse{
			Success: false,
			Message: "Project name is required",
		})
		return
	}

	// 插入数据
	query := `INSERT INTO xiangtan_district_data (project_name, building_area, house_type, district, decoration, average_price) VALUES (?, ?, ?, ?, ?, ?)`
	result, err := db.Exec(query, newData.ProjectName, newData.BuildingArea, newData.HouseType, newData.District, newData.Decoration, newData.AveragePrice)
	if err != nil {
		log.Printf("Failed to create district data: %v", err)
		c.JSON(http.StatusInternalServerError, SingleDataResponse{
			Success: false,
			Message: "Failed to create district data",
		})
		return
	}

	// 获取插入的ID
	id, err := result.LastInsertId()
	if err != nil {
		log.Printf("Failed to get last insert ID: %v", err)
		c.JSON(http.StatusInternalServerError, SingleDataResponse{
			Success: false,
			Message: "Failed to get created data ID",
		})
		return
	}

	// 查询创建的数据
	newData.ID = int(id)
	c.JSON(http.StatusCreated, SingleDataResponse{
		Success: true,
		Message: "District data created successfully",
		Data:    newData,
	})
}

// UpdateDistrictData 更新湘潭区数据
func UpdateDistrictData(c *gin.Context) {
	// 获取ID参数
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, SingleDataResponse{
			Success: false,
			Message: "Invalid ID format",
		})
		return
	}

	// 解析请求体
	var updateData XiangtanDistrictData
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, SingleDataResponse{
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	// 验证必填字段
	if updateData.ProjectName == "" {
		c.JSON(http.StatusBadRequest, SingleDataResponse{
			Success: false,
			Message: "Project name is required",
		})
		return
	}

	// 更新数据
	query := `UPDATE xiangtan_district_data SET project_name = ?, building_area = ?, house_type = ?, district = ?, decoration = ?, average_price = ? WHERE id = ?`
	result, err := db.Exec(query, updateData.ProjectName, updateData.BuildingArea, updateData.HouseType, updateData.District, updateData.Decoration, updateData.AveragePrice, id)
	if err != nil {
		log.Printf("Failed to update district data: %v", err)
		c.JSON(http.StatusInternalServerError, SingleDataResponse{
			Success: false,
			Message: "Failed to update district data",
		})
		return
	}

	// 检查是否有数据被更新
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Failed to get rows affected: %v", err)
		c.JSON(http.StatusInternalServerError, SingleDataResponse{
			Success: false,
			Message: "Failed to check update result",
		})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, SingleDataResponse{
			Success: false,
			Message: "District data not found",
		})
		return
	}

	// 设置更新后的ID并返回响应
	updateData.ID = id
	c.JSON(http.StatusOK, SingleDataResponse{
		Success: true,
		Message: "District data updated successfully",
		Data:    updateData,
	})
}

// DeleteDistrictData 删除湘潭区数据
func DeleteDistrictData(c *gin.Context) {
	// 获取ID参数
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid ID format",
		})
		return
	}

	// 删除数据
	query := `DELETE FROM xiangtan_district_data WHERE id = ?`
	result, err := db.Exec(query, id)
	if err != nil {
		log.Printf("Failed to delete district data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete district data",
		})
		return
	}

	// 检查是否有数据被删除
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Failed to get rows affected: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to check delete result",
		})
		return
	}

	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "District data not found",
		})
		return
	}

	// 返回响应
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "District data deleted successfully",
	})
}

// GetDistrictDataCount 获取湘潭区数据总数
func GetDistrictDataCount(c *gin.Context) {
	// 查询总数
	query := `SELECT COUNT(*) FROM xiangtan_district_data`
	var count int64
	err := db.QueryRow(query).Scan(&count)
	if err != nil {
		log.Printf("Failed to count district data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get data count",
		})
		return
	}

	// 返回响应
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   count,
	})
}

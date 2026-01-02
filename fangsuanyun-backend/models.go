package main

import (
	"time"
)

// XiangtanDistrictData 湘潭区数据模型
type XiangtanDistrictData struct {
	ID            int       `json:"id"`
	ProjectName   string    `json:"project_name"`
	BuildingArea  float64   `json:"building_area,omitempty"`
	HouseType     string    `json:"house_type,omitempty"`
	District      string    `json:"district,omitempty"`
	Decoration    string    `json:"decoration,omitempty"`
	AveragePrice  float64   `json:"average_price,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

// DistrictDataResponse 响应结构
type DistrictDataResponse struct {
	Success bool                `json:"success"`
	Message string              `json:"message,omitempty"`
	Data    []XiangtanDistrictData `json:"data,omitempty"`
	Total   int64               `json:"total,omitempty"`
}

// SingleDataResponse 单条数据响应结构
type SingleDataResponse struct {
	Success bool                `json:"success"`
	Message string              `json:"message,omitempty"`
	Data    XiangtanDistrictData `json:"data,omitempty"`
}

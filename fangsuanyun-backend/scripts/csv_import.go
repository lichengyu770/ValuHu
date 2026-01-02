package main

import (
	"fmt"
	"log"
	"os"
)

// main 函数，用于从CSV文件导入数据
func main() {
	// 检查命令行参数
	if len(os.Args) != 2 {
		fmt.Printf("Usage: %s <csv_file_path>\n", os.Args[0])
		fmt.Println("Example: go run csv_import.go data.csv")
		os.Exit(1)
	}

	// 获取CSV文件路径
	filePath := os.Args[1]
	
	// 验证文件是否存在
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		fmt.Printf("Error: File '%s' does not exist\n", filePath)
		os.Exit(1)
	}

	// 初始化数据库连接
	if err := InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer CloseDB()

	// 从CSV导入数据
	fmt.Printf("Importing data from '%s'...\n", filePath)
	imported, failed, err := ImportFromCSV(filePath)
	if err != nil {
		fmt.Printf("Error importing data: %v\n", err)
		os.Exit(1)
	}

	// 输出导入结果
	fmt.Printf("Import completed:\n")
	fmt.Printf("- Total records: %d\n", imported+failed)
	fmt.Printf("- Imported successfully: %d\n", imported)
	fmt.Printf("- Failed: %d\n", failed)
	fmt.Println("\nData import completed successfully!")
}

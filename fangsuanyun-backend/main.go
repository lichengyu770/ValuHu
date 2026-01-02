package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	fmt.Println("=== FangSuanYun Backend Server ===")
	fmt.Println("Starting server initialization...")

	// 初始化数据库
	fmt.Println("Step 1: Initializing database...")
	if err := InitDB(); err != nil {
		fmt.Printf("ERROR: Failed to initialize database: %v\n", err)
		log.Fatalf("Failed to initialize database: %v", err)
	}
	fmt.Println("✓ Database initialized successfully")
	defer CloseDB()

	// 设置路由
	fmt.Println("Step 2: Setting up router...")
	r := SetupRouter()
	fmt.Println("✓ Router setup completed")

	// 启动服务器
	fmt.Println("Step 3: Starting HTTP server...")
	port := 8080
	addr := fmt.Sprintf(":%d", port)

	fmt.Printf("✓ Server is running on http://localhost%s\n", addr)
	fmt.Printf("✓ API documentation available at http://localhost%s/api\n", addr)
	fmt.Printf("✓ Health check at http://localhost%s/health\n", addr)
	fmt.Println("\nServer started successfully! Press Ctrl+C to stop.")

	if err := http.ListenAndServe(addr, r); err != nil {
		fmt.Printf("ERROR: Failed to start server: %v\n", err)
		log.Fatalf("Failed to start server: %v", err)
	}
}



module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',  // 确保目标地址正确
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''  // 将 /api 前缀重写为空
                }
            },
            '/images': {  // 代理 /images 开头的请求（用于图片访问）
                target: 'http://localhost:8080',
                changeOrigin: true
            },
            '/files': {  // 代理 /files 开头的请求（用于文件访问）
                target: 'http://localhost:8080',
                changeOrigin: true
            }
        }
    }
}



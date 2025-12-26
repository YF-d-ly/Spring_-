

module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',  // 确保目标地址正确
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''  // 将 /api 前缀重写为空
                }
            }
        }
    }
}



import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        host: '127.0.0.1',
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5001',
                changeOrigin: true,
                configure: function (proxy) {
                    proxy.on('error', function (err) {
                        console.log('Proxy error:', err);
                    });
                    proxy.on('proxyReq', function (proxyReq, req) {
                        console.log('Proxying:', req.method, req.url, '-> http://127.0.0.1:5001');
                    });
                    proxy.on('proxyRes', function (proxyRes, req) {
                        console.log('Response:', proxyRes.statusCode, req.url);
                    });
                },
            },
        },
    },
});

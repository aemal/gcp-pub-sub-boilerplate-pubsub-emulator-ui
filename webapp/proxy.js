const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Proxy middleware configuration
const proxyMiddleware = createProxyMiddleware({
  target: 'http://localhost:8790',
  changeOrigin: true,
  pathRewrite: (path) => {
    // Remove /proxy prefix and ensure clean path
    const cleanPath = path.replace(/^\/proxy\//, '');
    // Log the path transformation
    console.log('Path rewrite:', {
      original: path,
      rewritten: cleanPath,
      target: 'http://localhost:8790' + cleanPath
    });
    return cleanPath;
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log the final request details
    console.log('Proxying request:', {
      method: req.method,
      originalUrl: req.url,
      finalPath: proxyReq.path
    });
  }
});

// Use the proxy middleware for all routes under /proxy
app.use('/proxy', proxyMiddleware);

const PORT = 8010;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Forwarding requests to http://localhost:8790`);
}); 
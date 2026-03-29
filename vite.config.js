import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import os from 'os'

const systemBridgePlugin = () => ({
  name: 'system-bridge',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url.startsWith('/api-internal/resolve-path')) {
        try {
          // More robust query parameter extraction for Vite/Node middleware
          const folderName = req.url.split('name=')[1]?.split('&')[0];
          
          if (!folderName) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing name parameter' }));
            return;
          }

          const decodedFolderName = decodeURIComponent(folderName);
          const home = os.homedir();
          const username = os.userInfo().username;
          
          // Logic to find absolute path matching the picker's folder name
          const candidates = [
            path.join(home, decodedFolderName),
            path.join(home, 'Downloads', decodedFolderName),
            path.join(home, 'Documents', decodedFolderName),
            path.join(home, 'Desktop', decodedFolderName),
            path.join('C:\\Users', username, decodedFolderName),
            path.join('C:\\Users', username, 'Downloads', decodedFolderName),
            path.join('C:\\Users', username, 'Documents', decodedFolderName)
          ];
          
          let resolved = decodedFolderName;
          for (const c of candidates) {
            try {
              if (fs.existsSync(c)) {
                resolved = c;
                break;
              }
            } catch (e) {}
          }
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ path: resolved }));
        } catch (err) {
          console.error("[System Bridge Error]:", err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }
      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), systemBridgePlugin()],
  server: {
    host: true, // Allow external access and better localhost resolution
    proxy: {
      '/api/ollama': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ollama/, '/api'),
      },
    },
  },
})

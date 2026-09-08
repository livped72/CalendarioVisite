import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

// Plugin server per gestione account e sincronizzazione dati 100% privata e locale
function accountStoragePlugin() {
  const dataDir = path.resolve(__dirname, './.data');
  const accountsFile = path.join(dataDir, 'accounts.json');

  const readAccounts = (): Record<string, any> => {
    try {
      if (fs.existsSync(accountsFile)) {
        return JSON.parse(fs.readFileSync(accountsFile, 'utf-8'));
      }
    } catch (e) {
      console.error('Errore lettura accounts.json:', e);
    }
    return {};
  };

  const writeAccounts = (data: Record<string, any>) => {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(accountsFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Errore scrittura accounts.json:', e);
    }
  };

  return {
    name: 'account-storage-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/api/account/')) {
          const subpath = req.url.replace('/api/account/', '').split('?')[0];

          // Abilita CORS per supportare accessi da smartphone/tablet sulla rete locale
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }

          if (req.method === 'GET') {
            const accounts = readAccounts();
            if (accounts[subpath]) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(accounts[subpath]));
            } else {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Account non trovato' }));
            }
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                const accounts = readAccounts();
                accounts[subpath] = parsed;
                writeAccounts(accounts);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'JSON non valido' }));
              }
            });
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), accountStoragePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true, // accessibile da qualsiasi dispositivo (es. smartphone sulla rete Wi-Fi)
  },
});

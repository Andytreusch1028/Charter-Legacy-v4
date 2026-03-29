import { Service } from 'node-windows';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Install Axonix Agent as a Windows Service
 * 
 * Run with Administrator privileges:
 *   node install-service.js
 * 
 * Once installed, the agent will:
 *   - Start automatically on boot
 *   - Restart if it crashes
 *   - Run in the background (no terminal window needed)
 *   - Be manageable via Windows Services panel (services.msc)
 */

const svc = new Service({
    name: 'Axonix Agent',
    description: 'CharterLegacy autonomous developer agent — Telegram task queue and approval workflow',
    script: path.join(__dirname, 'index.js'),
    nodeOptions: [],
    workingDirectory: __dirname,
    env: [
        { name: 'NODE_ENV', value: 'production' },
        { name: 'DOTENV_CONFIG_PATH', value: path.join(__dirname, '.env') }
    ],
    // Restart config
    wait: 2,               // 2 seconds between restarts
    grow: 0.5,             // Restart delay grows by 50% each time
    maxRestarts: 10         // Max 10 restarts before giving up
});

svc.on('install', () => {
    console.log('✅ Axonix Agent installed as Windows Service!');
    console.log('🚀 Starting service...');
    svc.start();
});

svc.on('start', () => {
    console.log('🟢 Axonix Agent service is now running.');
    console.log('');
    console.log('📋 Management:');
    console.log('   View:    Open "Services" (Win+R → services.msc) → find "Axonix Agent"');
    console.log('   Stop:    node uninstall-service.js  OR  stop via Services panel');
    console.log('   Logs:    Check Windows Event Viewer → Application logs');
    console.log('');
    console.log('📱 Send /status on Telegram to verify the connection.');
});

svc.on('alreadyinstalled', () => {
    console.log('⚠️  Axonix Agent service is already installed.');
    console.log('   To reinstall, run: node uninstall-service.js  THEN  node install-service.js');
});

svc.on('error', (err) => {
    console.error('❌ Error:', err);
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 Installing Axonix Agent as Windows Service...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('⚠️  This requires Administrator privileges.');
console.log('   If you get a permissions error, right-click your terminal');
console.log('   and choose "Run as Administrator".');
console.log('');

svc.install();

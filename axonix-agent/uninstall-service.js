import { Service } from 'node-windows';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Uninstall the Axonix Agent Windows Service
 * 
 * Run with Administrator privileges:
 *   node uninstall-service.js
 */

const svc = new Service({
    name: 'Axonix Agent',
    script: path.join(__dirname, 'index.js')
});

svc.on('uninstall', () => {
    console.log('✅ Axonix Agent service has been removed.');
    console.log('   The agent is no longer running in the background.');
});

svc.on('error', (err) => {
    console.error('❌ Error:', err);
});

console.log('🔧 Removing Axonix Agent Windows Service...');
svc.uninstall();

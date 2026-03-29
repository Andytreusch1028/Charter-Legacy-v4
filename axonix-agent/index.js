import 'dotenv/config';
import cron from 'node-cron';
import AxonixBot from './src/bot.js';
import TaskQueue from './src/taskQueue.js';
import Agent from './src/agent.js';

/**
 * Axonix Agent — Entry Point
 * 
 * Starts the Telegram bot, loads the task queue, and begins
 * the autonomous agent loop.
 * 
 * Usage:
 *   1. Copy .env.example to .env and fill in your values
 *   2. npm install
 *   3. npm start
 */

// Validate required env vars
const REQUIRED_ENV = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'REPO_PATH'];
const missing = REQUIRED_ENV.filter(key => !process.env[key]);
if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('   Copy .env.example to .env and fill in your values.');
    process.exit(1);
}

// Configuration
const config = {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
    repoPath: process.env.REPO_PATH,
    geminiApiKey: process.env.GEMINI_API_KEY || null,
    autoMode: process.env.AUTO_MODE === 'true',
    pollInterval: parseInt(process.env.POLL_INTERVAL_MINUTES || '30'),
    maxFilesPerTask: parseInt(process.env.MAX_FILES_PER_TASK || '3'),
    branchPrefix: process.env.BRANCH_PREFIX || 'axonix',
    targetBranch: process.env.TARGET_BRANCH || 'dev'
};

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 AXONIX AGENT — CharterLegacy');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📂 Repo: ${config.repoPath}`);
console.log(`🌿 Target Branch: ${config.targetBranch}`);
console.log(`⏱️  Poll Interval: ${config.pollInterval} minutes`);
console.log(`🤖 Auto Mode: ${config.autoMode ? 'ON' : 'OFF'}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Initialize components
const queue = new TaskQueue();
const bot = new AxonixBot(config.botToken, config.chatId);
const agent = new Agent(queue, bot, config);

// Wire up references
bot.setAgent(agent);
bot.setQueue(queue);

// Send startup notification
bot.sendStartup().then(() => {
    console.log('✅ Telegram bot connected. Listening for commands...');
}).catch(err => {
    console.error('⚠️  Failed to send startup message:', err.message);
    console.error('   Check your TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env');
});

// Schedule the agent tick
if (config.autoMode) {
    console.log(`🕐 Scheduling agent tick every ${config.pollInterval} minutes...`);
    cron.schedule(`*/${config.pollInterval} * * * *`, async () => {
        console.log('[TICK] Agent scanning for tasks...');
        await agent.tick();
    });
} else {
    console.log('⏸️  Auto mode is OFF. Agent will only respond to Telegram commands.');
    console.log('   Send /resume in Telegram to enable autonomous task processing.');
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down Axonix Agent...');
    await bot.sendNotification('🔴 *Axonix Agent Offline*\n\nAgent was shut down manually.');
    process.exit(0);
});

process.on('uncaughtException', async (err) => {
    console.error('💥 Uncaught Exception:', err.message);
    try {
        await bot.sendNotification(`⚠️ *Agent Crash*\n\n\`${err.message}\`\n\nRestarting...`);
    } catch { /* can't send if bot is down */ }
});

console.log('\n🟢 Axonix Agent is now running. Press Ctrl+C to stop.\n');

import TelegramBot from 'node-telegram-bot-api';
import Guardrails from './guardrails.js';

/**
 * AxonixBot — Telegram interface for the Axonix Agent.
 * 
 * Commands:
 *   /status  — Current agent status
 *   /backlog — View all queued tasks
 *   /addtask — Add a new task
 *   /pause   — Pause autonomous mode
 *   /resume  — Resume autonomous mode
 *   /help    — Show available commands
 * 
 * Inline Keyboards:
 *   [✅ Approve] [❌ Reject] [📋 Details] — On approval requests
 */
class AxonixBot {
    constructor(token, chatId) {
        this.chatId = chatId;
        this.agent = null; // Set after initialization
        this.queue = null; // Set after initialization

        // Initialize bot with polling
        this.bot = new TelegramBot(token, { polling: true });
        this.setupCommands();
        this.setupCallbacks();
    }

    /** Wire up the agent and queue references */
    setAgent(agent) {
        this.agent = agent;
    }

    setQueue(queue) {
        this.queue = queue;
    }

    /** Register all command handlers */
    setupCommands() {
        // /start & /help
        this.bot.onText(/\/start|\/help/, (msg) => {
            if (msg.chat.id.toString() !== this.chatId) return;
            this.bot.sendMessage(msg.chat.id, 
                '🤖 *Axonix Agent — CharterLegacy*\n\n' +
                'Your autonomous developer assistant.\n\n' +
                '*Commands:*\n' +
                '`/status` — Current agent status\n' +
                '`/backlog` — View task queue\n' +
                '`/addtask [desc]` — Add a new task\n' +
                '`/priority [id] [level]` — Set priority (critical/high/medium/low)\n' +
                '`/pause` — Pause autonomous work\n' +
                '`/resume` — Resume autonomous work\n' +
                '`/stats` — Queue statistics\n' +
                '`/help` — Show this message',
                { parse_mode: 'Markdown' }
            );
        });

        // /status
        this.bot.onText(/\/status/, (msg) => {
            if (msg.chat.id.toString() !== this.chatId) return;
            const status = this.agent?.getStatus() || '❓ Agent not connected';
            this.bot.sendMessage(msg.chat.id, 
                '🛰️ *Axonix Status*\n\n' + status,
                { parse_mode: 'Markdown' }
            );
        });

        // /backlog
        this.bot.onText(/\/backlog/, (msg) => {
            if (msg.chat.id.toString() !== this.chatId) return;
            const backlog = this.queue?.formatBacklog() || '❓ Queue not connected';
            this.bot.sendMessage(msg.chat.id, 
                '📋 *Task Backlog*\n\n' + backlog,
                { parse_mode: 'Markdown' }
            );
        });

        // /addtask [description]
        this.bot.onText(/\/addtask (.+)/, (msg, match) => {
            if (msg.chat.id.toString() !== this.chatId) return;
            const description = match[1].trim();
            if (!description) {
                this.bot.sendMessage(msg.chat.id, '❌ Usage: `/addtask [description]`', { parse_mode: 'Markdown' });
                return;
            }

            const task = this.queue.addTask(description);
            this.bot.sendMessage(msg.chat.id,
                `✅ *Task Added*\n\n` +
                `📝 ${task.description}\n` +
                `🆔 \`${task.id}\`\n` +
                `📊 Priority: ${task.priority}\n` +
                `⏳ Status: pending`,
                { parse_mode: 'Markdown' }
            );
        });

        // /priority [id] [level]
        this.bot.onText(/\/priority (\S+) (\S+)/, (msg, match) => {
            if (msg.chat.id.toString() !== this.chatId) return;
            const taskId = match[1];
            const level = match[2].toLowerCase();
            
            if (!['critical', 'high', 'medium', 'low'].includes(level)) {
                this.bot.sendMessage(msg.chat.id, '❌ Valid levels: `critical`, `high`, `medium`, `low`', { parse_mode: 'Markdown' });
                return;
            }

            const task = this.queue.getTask(taskId);
            if (!task) {
                this.bot.sendMessage(msg.chat.id, `❌ Task \`${taskId}\` not found`, { parse_mode: 'Markdown' });
                return;
            }

            task.priority = level;
            this.queue.save();
            this.bot.sendMessage(msg.chat.id, `✅ Task \`${taskId}\` priority set to *${level}*`, { parse_mode: 'Markdown' });
        });

        // /pause
        this.bot.onText(/\/pause/, (msg) => {
            if (msg.chat.id.toString() !== this.chatId) return;
            const result = this.agent?.pause() || '❓ Agent not connected';
            this.bot.sendMessage(msg.chat.id, result);
        });

        // /resume
        this.bot.onText(/\/resume/, (msg) => {
            if (msg.chat.id.toString() !== this.chatId) return;
            const result = this.agent?.resume() || '❓ Agent not connected';
            this.bot.sendMessage(msg.chat.id, result);
        });

        // /stats
        this.bot.onText(/\/stats/, (msg) => {
            if (msg.chat.id.toString() !== this.chatId) return;
            const stats = this.queue?.getStats() || {};
            this.bot.sendMessage(msg.chat.id,
                '📊 *Queue Statistics*\n\n' +
                `Total: ${stats.total || 0}\n` +
                `⏳ Pending: ${stats.pending || 0}\n` +
                `🔨 In Progress: ${stats.in_progress || 0}\n` +
                `👀 Awaiting: ${stats.awaiting_approval || 0}\n` +
                `✅ Completed: ${stats.completed || 0}\n` +
                `❌ Rejected: ${stats.rejected || 0}`,
                { parse_mode: 'Markdown' }
            );
        });
    }

    /** Handle inline keyboard button presses */
    setupCallbacks() {
        this.bot.on('callback_query', async (query) => {
            const data = query.data;
            const chatId = query.message.chat.id;

            if (chatId.toString() !== this.chatId) return;

            const [action, taskId] = data.split(':');

            try {
                if (action === 'approve') {
                    const task = await this.agent.handleApproval(taskId);
                    if (task) {
                        await this.bot.answerCallbackQuery(query.id, { text: '✅ Approved & Merged!' });
                        await this.bot.sendMessage(chatId,
                            `🏁 *Task Completed*\n\n` +
                            `✅ \`${task.id}\` — ${task.description}\n` +
                            `🌿 Branch \`${task.branch}\` merged into \`${this.agent.config.targetBranch}\``,
                            { parse_mode: 'Markdown' }
                        );
                    }

                } else if (action === 'reject') {
                    const task = await this.agent.handleRejection(taskId, 'Rejected via Telegram');
                    if (task) {
                        await this.bot.answerCallbackQuery(query.id, { text: '❌ Rejected — branch deleted' });
                        await this.bot.sendMessage(chatId,
                            `❌ *Task Rejected*\n\n` +
                            `\`${task.id}\` — ${task.description}\n` +
                            `🗑️ Branch cleaned up`,
                            { parse_mode: 'Markdown' }
                        );
                    }

                } else if (action === 'details') {
                    const task = this.queue.getTask(taskId);
                    if (task) {
                        await this.bot.answerCallbackQuery(query.id);
                        await this.bot.sendMessage(chatId,
                            `📋 *Task Details*\n\n` +
                            `🆔 ID: \`${task.id}\`\n` +
                            `📝 ${task.description}\n` +
                            `📊 Priority: ${task.priority}\n` +
                            `⏳ Status: ${task.status}\n` +
                            `🌿 Branch: \`${task.branch || 'none'}\`\n` +
                            `📁 Files: ${task.filesChanged?.length || 0}\n` +
                            `📅 Created: ${task.createdAt}\n` +
                            `📅 Updated: ${task.updatedAt}`,
                            { parse_mode: 'Markdown' }
                        );
                    }
                }
            } catch (err) {
                await this.bot.answerCallbackQuery(query.id, { text: `Error: ${err.message}` });
                await this.bot.sendMessage(chatId, `⚠️ Error: ${err.message}`);
            }
        });
    }

    /** Send a task-started notification */
    async sendTaskStarted(task, branchName) {
        await this.bot.sendMessage(this.chatId,
            `🔨 *Task Started*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📋 Task #${task.id}: ${task.description}\n` +
            `📊 Priority: ${task.priority.toUpperCase()}\n` +
            `🌿 Branch: \`${branchName}\`\n` +
            `━━━━━━━━━━━━━━━━━━━━`,
            { parse_mode: 'Markdown' }
        );
    }

    /** Send an approval request with inline buttons */
    async sendApprovalRequest(task, branchName, guardrailResults, changesDescription = '') {
        const guardrailText = Guardrails.formatResults(guardrailResults);
        const changesBlock = changesDescription ? `\n*Changes:*\n${changesDescription}\n` : '';
        
        await this.bot.sendMessage(this.chatId,
            `🤖 *Axonix Agent — Approval Request*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📋 Task #${task.id}: ${task.description}\n` +
            `📊 Priority: ${task.priority.toUpperCase()}\n` +
            `🌿 Branch: \`${branchName}\`\n` +
            `${changesBlock}\n` +
            `*Guardrail Check:*\n${guardrailText}\n` +
            `━━━━━━━━━━━━━━━━━━━━`,
            { 
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '✅ Approve', callback_data: `approve:${task.id}` },
                            { text: '❌ Reject', callback_data: `reject:${task.id}` },
                            { text: '📋 Details', callback_data: `details:${task.id}` }
                        ]
                    ]
                }
            }
        );
    }

    /** Send an error notification */
    async sendError(task, errorMessage) {
        await this.bot.sendMessage(this.chatId,
            `⚠️ *Error on Task #${task.id}*\n\n` +
            `${errorMessage}\n\n` +
            `Task returned to queue.`,
            { parse_mode: 'Markdown' }
        );
    }

    /** Send a general notification */
    async sendNotification(message) {
        await this.bot.sendMessage(this.chatId, message, { parse_mode: 'Markdown' });
    }

    /** Send startup message */
    async sendStartup() {
        const stats = this.queue.getStats();
        await this.bot.sendMessage(this.chatId,
            `🟢 *Axonix Agent Online*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📋 ${stats.total} tasks in queue\n` +
            `⏳ ${stats.pending || 0} pending\n` +
            `👀 ${stats.awaiting_approval || 0} awaiting approval\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Send /help for available commands.`,
            { parse_mode: 'Markdown' }
        );
    }
}

export default AxonixBot;

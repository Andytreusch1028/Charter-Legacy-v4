import simpleGit from 'simple-git';
import Guardrails from './guardrails.js';
import CodeGenerator from './codeGenerator.js';

/**
 * Agent Runner — The orchestration layer for the Axonix Agent.
 * 
 * Picks tasks from the queue, creates git branches, generates code via Gemini,
 * runs guardrail checks, and submits work for approval via Telegram.
 */
class Agent {
    constructor(taskQueue, bot, config) {
        this.queue = taskQueue;
        this.bot = bot;
        this.config = config;
        this.git = simpleGit(config.repoPath);
        this.isWorking = false;
        this.currentTask = null;
        this.isPaused = !config.autoMode;
        
        // Initialize code generator if API key is available
        this.codeGen = config.geminiApiKey 
            ? new CodeGenerator(config.geminiApiKey, config.repoPath)
            : null;
    }

    /** Get current status */
    getStatus() {
        if (this.isPaused) return '⏸️ Paused — waiting for `/resume` command';
        if (this.isWorking) return `🔨 Working on task \`${this.currentTask?.id}\``;
        
        const pending = this.queue.getPending().length;
        const awaiting = this.queue.getAwaiting().length;
        const hasAI = this.codeGen ? '🧠 Gemini connected' : '⚠️ No AI key';
        
        if (awaiting > 0) return `👀 ${awaiting} task(s) awaiting your approval | ${hasAI}`;
        if (pending > 0) return `⏳ ${pending} task(s) in queue — ready to work | ${hasAI}`;
        return `💤 Idle — no tasks in queue | ${hasAI}`;
    }

    /** Pause autonomous work */
    pause() {
        this.isPaused = true;
        return '⏸️ Agent paused. Send `/resume` to continue.';
    }

    /** Resume autonomous work */
    resume() {
        this.isPaused = false;
        return '▶️ Agent resumed. Will pick up next task shortly.';
    }

    /**
     * Process the next available task
     */
    async processNextTask() {
        if (this.isPaused || this.isWorking) return null;

        const task = this.queue.getNextTask();
        if (!task) return null;

        this.isWorking = true;
        this.currentTask = task;

        try {
            // 1. Create feature branch
            const branchName = `${this.config.branchPrefix}/task-${task.id}`;
            
            await this.git.checkout(this.config.targetBranch);
            await this.git.pull('origin', this.config.targetBranch).catch(() => {});
            await this.git.checkoutLocalBranch(branchName);

            // 2. Update task status
            this.queue.startTask(task.id, branchName);

            // 3. Notify via Telegram that work has started
            await this.bot.sendTaskStarted(task, branchName);

            // 4. Generate code with Gemini (or skip if no API key)
            let filesChanged = [];
            let changesDescription = '';

            if (this.codeGen) {
                await this.bot.sendNotification(`🧠 *Generating code for task* \`${task.id}\`...`);
                
                try {
                    const changes = await this.codeGen.generateForTask(task);
                    filesChanged = this.codeGen.applyChanges(changes);
                    changesDescription = this.codeGen.formatChangesForTelegram(changes);
                    
                    // 5. Git add and commit
                    await this.git.add('.');
                    await this.git.commit(`[Axonix] ${task.description}\n\nTask: ${task.id}\nPriority: ${task.priority}`);
                    
                } catch (genErr) {
                    await this.bot.sendNotification(
                        `⚠️ *Code generation failed for task* \`${task.id}\`\n\n` +
                        `Error: ${genErr.message}\n\n` +
                        `Task will be submitted for manual implementation.`
                    );
                    changesDescription = '⚠️ Code generation failed — needs manual implementation';
                }
            } else {
                changesDescription = '⚙️ No Gemini API key — task queued for manual implementation';
            }

            // 6. Submit for approval
            this.queue.submitForApproval(task.id, filesChanged);

            // 7. Run guardrail checks
            const guardrailResults = Guardrails.runFullCheck(
                branchName, 
                filesChanged, 
                this.config.repoPath
            );

            // 8. Send approval request with file change details
            await this.bot.sendApprovalRequest(task, branchName, guardrailResults, changesDescription);

        } catch (err) {
            await this.bot.sendError(task, err.message);
            this.queue.updateStatus(task.id, 'pending'); // Return to queue
        } finally {
            this.isWorking = false;
            this.currentTask = null;
        }

        return task;
    }

    /**
     * Handle approval — merge the branch
     */
    async handleApproval(taskId) {
        const task = this.queue.getTask(taskId);
        if (!task || task.status !== 'awaiting_approval') return null;

        try {
            // Merge the branch
            await this.git.checkout(this.config.targetBranch);
            await this.git.merge([task.branch, '--no-ff', '-m', `[Axonix] Merge task ${task.id}: ${task.description}`]);
            
            // Delete the feature branch
            await this.git.deleteLocalBranch(task.branch, true);

            // Update status
            this.queue.approve(taskId);
            this.queue.complete(taskId);

            return task;
        } catch (err) {
            throw new Error(`Merge failed: ${err.message}`);
        }
    }

    /**
     * Handle rejection — clean up the branch
     */
    async handleRejection(taskId, reason = '') {
        const task = this.queue.getTask(taskId);
        if (!task || task.status !== 'awaiting_approval') return null;

        try {
            // Switch away from the branch and delete it
            await this.git.checkout(this.config.targetBranch);
            if (task.branch) {
                await this.git.deleteLocalBranch(task.branch, true).catch(() => {});
            }

            // Update status
            this.queue.reject(taskId, reason);
            return task;
        } catch (err) {
            throw new Error(`Cleanup failed: ${err.message}`);
        }
    }

    /**
     * Agent tick — called periodically by the scheduler
     */
    async tick() {
        if (this.isPaused) return;
        
        // Check for awaiting tasks first (don't start new work if approvals are pending)
        const awaiting = this.queue.getAwaiting();
        if (awaiting.length > 0) return;

        // Otherwise, pick up the next task
        await this.processNextTask();
    }
}

export default Agent;

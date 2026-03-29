import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKLOG_PATH = path.join(__dirname, '..', 'backlog.json');

/**
 * TaskQueue — JSON-based task manager for the Axonix Agent.
 * 
 * States: pending → in_progress → awaiting_approval → approved/rejected → completed
 */
class TaskQueue {
    constructor() {
        this.tasks = [];
        this.load();
    }

    /** Load tasks from disk */
    load() {
        try {
            const data = fs.readFileSync(BACKLOG_PATH, 'utf-8');
            this.tasks = JSON.parse(data);
        } catch {
            this.tasks = [];
            this.save();
        }
    }

    /** Persist tasks to disk */
    save() {
        fs.writeFileSync(BACKLOG_PATH, JSON.stringify(this.tasks, null, 2));
    }

    /** Add a new task */
    addTask(description, priority = 'medium', category = 'general') {
        const task = {
            id: Date.now().toString(36),
            description,
            priority,
            category,
            status: 'pending',
            branch: null,
            filesChanged: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            approvedAt: null,
            rejectedReason: null
        };
        this.tasks.push(task);
        this.save();
        return task;
    }

    /** Get the next pending task (highest priority first) */
    getNextTask() {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const pending = this.tasks
            .filter(t => t.status === 'pending')
            .sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));
        return pending[0] || null;
    }

    /** Get a task by ID */
    getTask(id) {
        return this.tasks.find(t => t.id === id) || null;
    }

    /** Update task status */
    updateStatus(id, status, extra = {}) {
        const task = this.getTask(id);
        if (!task) return null;
        task.status = status;
        task.updatedAt = new Date().toISOString();
        Object.assign(task, extra);
        this.save();
        return task;
    }

    /** Mark task as in-progress with a branch */
    startTask(id, branch) {
        return this.updateStatus(id, 'in_progress', { branch });
    }

    /** Move task to awaiting approval */
    submitForApproval(id, filesChanged = []) {
        return this.updateStatus(id, 'awaiting_approval', { filesChanged });
    }

    /** Approve a task */
    approve(id) {
        return this.updateStatus(id, 'approved', { approvedAt: new Date().toISOString() });
    }

    /** Reject a task */
    reject(id, reason = '') {
        return this.updateStatus(id, 'rejected', { rejectedReason: reason });
    }

    /** Mark as completed (post-merge) */
    complete(id) {
        return this.updateStatus(id, 'completed');
    }

    /** Get all tasks awaiting approval */
    getAwaiting() {
        return this.tasks.filter(t => t.status === 'awaiting_approval');
    }

    /** Get all pending tasks */
    getPending() {
        return this.tasks.filter(t => t.status === 'pending');
    }

    /** Get task stats */
    getStats() {
        const statuses = {};
        this.tasks.forEach(t => {
            statuses[t.status] = (statuses[t.status] || 0) + 1;
        });
        return {
            total: this.tasks.length,
            ...statuses
        };
    }

    /** Get formatted backlog for display */
    formatBacklog() {
        if (this.tasks.length === 0) return '📭 Backlog is empty.';
        
        const priorityEmoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
        const statusEmoji = { 
            pending: '⏳', in_progress: '🔨', awaiting_approval: '👀', 
            approved: '✅', rejected: '❌', completed: '🏁' 
        };

        return this.tasks.map(t => {
            const p = priorityEmoji[t.priority] || '⚪';
            const s = statusEmoji[t.status] || '❓';
            return `${s} ${p} \`${t.id}\` — ${t.description}`;
        }).join('\n');
    }
}

export default TaskQueue;

/**
 * Logger 工具 - 统一的日志管理
 */

const DEBUG_MODE = false; // 可以通过配置控制

class Logger {
    private static prefix = '[FlashcardAssistant]';

    /**
     * 普通日志
     */
    static log(...args: any[]): void {
        if (DEBUG_MODE) {
            console.log(this.prefix, ...args);
        }
    }

    /**
     * 警告日志
     */
    static warn(...args: any[]): void {
        console.warn(this.prefix, ...args);
    }

    /**
     * 错误日志
     */
    static error(...args: any[]): void {
        console.error(this.prefix, ...args);
    }

    /**
     * 信息日志
     */
    static info(...args: any[]): void {
        if (DEBUG_MODE) {
            console.info(this.prefix, ...args);
        }
    }

    /**
     * 调试日志
     */
    static debug(...args: any[]): void {
        if (DEBUG_MODE) {
            console.debug(this.prefix, ...args);
        }
    }

    /**
     * 分组开始
     */
    static group(label: string): void {
        if (DEBUG_MODE) {
            console.group(this.prefix + ' ' + label);
        }
    }

    /**
     * 分组结束
     */
    static groupEnd(): void {
        if (DEBUG_MODE) {
            console.groupEnd();
        }
    }
}

export default Logger;


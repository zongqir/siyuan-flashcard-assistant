import {
    Plugin,
    ICard,
    ICardData
} from "siyuan";
import "./index.scss";

// 引入闪卡快切功能
import { FlashcardQuickSwitchManager } from "./flashcard";

export default class PluginSample extends Plugin {
    
    // 闪卡快切管理器
    private flashcardManager: FlashcardQuickSwitchManager;

    async onload() {
        // 初始化闪卡快切功能
        await this.initFlashcardQuickSwitch();
    }

    onLayoutReady() {
        // 插件布局就绪
    }

    async onunload() {
        // 销毁闪卡快切管理器
        if (this.flashcardManager) {
            await this.flashcardManager.destroy();
        }
    }

    async uninstall() {
        // 卸载时清理资源
        if (this.flashcardManager) {
            await this.flashcardManager.destroy();
        }
    }

    async updateCards(options: ICardData) {
        options.cards.sort((a: ICard, b: ICard) => {
            if (a.blockID < b.blockID) {
                return -1;
            }
            if (a.blockID > b.blockID) {
                return 1;
            }
            return 0;
        });
        return options;
    }
    
    /**
     * 初始化闪卡快切功能
     */
    private async initFlashcardQuickSwitch() {
        try {
            // 创建闪卡管理器实例
            this.flashcardManager = new FlashcardQuickSwitchManager({
                enabled: true,
                maxHistory: 10,
                ballPosition: { x: 20, y: 100 },
                autoHide: false,
                showUsageCount: true,
                enableDrag: true
            });
            
            // 初始化管理器
            await this.flashcardManager.initialize();
            
        } catch (error) {
            console.error('闪卡快切功能初始化失败:', error);
        }
    }
}

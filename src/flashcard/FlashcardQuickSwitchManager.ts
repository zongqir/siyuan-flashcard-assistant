import Logger from '../utils/logger';
/**
 * 闪卡快切主管理器 - 整个功能的核心控制器
 */

import { HistoryManager } from './HistoryManager';
import { UIManager } from './UIManager';
import { FlashcardMonitor } from './FlashcardMonitor';
import { 
    FlashcardFilter, 
    QuickSwitchConfig, 
    DEFAULT_CONFIG, 
    ErrorCode,
    FilterEvent,
    FlashcardPanelInfo 
} from './types';

export class FlashcardQuickSwitchManager {
    private historyManager: HistoryManager;
    private uiManager: UIManager;
    private monitor: FlashcardMonitor;
    private config: QuickSwitchConfig;
    private isInitialized: boolean = false;
    private isEnabled: boolean = false;
    constructor(config: Partial<QuickSwitchConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        
        // 初始化子模块
        this.historyManager = new HistoryManager();
        this.uiManager = new UIManager(this.historyManager, this.config);
        this.monitor = new FlashcardMonitor();

        Logger.log('主管理器已创建');
    }

    /**
     * 初始化管理器
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            Logger.warn('管理器已经初始化');
            return;
        }

        try {
            Logger.log('正在初始化...');

            // 初始化历史管理器
            await this.historyManager.initialize();
            
            // 设置UI管理器回调
            this.uiManager.setFilterSwitchCallback(this.handleFilterSwitch.bind(this));
            this.uiManager.setOpenFlashcardCallback(this.openFlashcardReview.bind(this));
            
            // 设置监听器回调
            this.monitor.setFilterCallback(this.handleFilterEvent.bind(this));
            this.monitor.setPanelCallback(this.handlePanelDetected.bind(this));

            this.isInitialized = true;
            
            // 如果配置启用，则开始运行
            if (this.config.enabled) {
                await this.enable();
            }

            Logger.log('初始化完成');

        } catch (error) {
            Logger.error('初始化失败:', error);
            throw new Error(`${ErrorCode.INIT_FAILED}: ${error.message}`);
        }
    }

    /**
     * 启用功能
     */
    async enable(): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('管理器未初始化');
        }

        if (this.isEnabled) {
            Logger.warn('功能已经启用');
            return;
        }

        try {
            // 开始监听闪卡面板
            this.monitor.startMonitoring();
            this.isEnabled = true;
            
            // 立即显示小圆球（无论是否有闪卡面板）
            this.showQuickSwitchBallAlways();
            
            Logger.log('功能已启用，小圆球已显示');

        } catch (error) {
            Logger.error('启用功能失败:', error);
            throw error;
        }
    }

    /**
     * 禁用功能
     */
    disable(): void {
        if (!this.isEnabled) return;

        try {
            // 停止监听
            this.monitor.stopMonitoring();
            
            // 隐藏UI
            this.uiManager.hideQuickSwitchBall();
            
            this.isEnabled = false;
            Logger.log('功能已禁用');

        } catch (error) {
            Logger.error('禁用功能失败:', error);
        }
    }

    /**
     * 更新配置
     */
    async updateConfig(newConfig: Partial<QuickSwitchConfig>): Promise<void> {
        try {
            this.config = { ...this.config, ...newConfig };
            
            // 更新UI配置
            this.uiManager.updateConfig(newConfig);
            
            // 如果启用状态发生变化
            if ('enabled' in newConfig) {
                if (newConfig.enabled && !this.isEnabled) {
                    await this.enable();
                } else if (!newConfig.enabled && this.isEnabled) {
                    this.disable();
                }
            }

            // 如果最大记录数发生变化
            if ('maxHistory' in newConfig && newConfig.maxHistory) {
                await this.historyManager.setMaxCount(newConfig.maxHistory);
            }

            Logger.log('配置已更新');

        } catch (error) {
            Logger.error('更新配置失败:', error);
            throw error;
        }
    }

    /**
     * 获取当前配置
     */
    getConfig(): QuickSwitchConfig {
        return { ...this.config };
    }

    /**
     * 获取历史记录统计
     */
    getHistoryStats() {
        return this.historyManager.getStats();
    }

    /**
     * 获取所有筛选记录
     */
    getFilters(): FlashcardFilter[] {
        return this.historyManager.getFilters();
    }

    /**
     * 手动添加筛选记录
     */
    async addFilter(filterInfo: {
        id: string;
        name: string;
        type: 'doc' | 'notebook';
    }): Promise<boolean> {
        try {
            const success = await this.historyManager.addFilter(filterInfo);
            if (success) {
                // 更新UI
                this.uiManager.updateHistoryPanel();
            }
            return success;

        } catch (error) {
            Logger.error('添加筛选记录失败:', error);
            return false;
        }
    }

    /**
     * 删除筛选记录
     */
    async removeFilter(filterId: string): Promise<boolean> {
        try {
            const success = await this.historyManager.removeFilter(filterId);
            if (success) {
                // 更新UI
                this.uiManager.updateHistoryPanel();
            }
            return success;

        } catch (error) {
            Logger.error('删除筛选记录失败:', error);
            return false;
        }
    }

    /**
     * 切换筛选记录固定状态
     */
    async togglePinFilter(filterId: string): Promise<boolean> {
        try {
            const success = await this.historyManager.togglePin(filterId);
            if (success) {
                // 更新UI
                this.uiManager.updateHistoryPanel();
            }
            return success;

        } catch (error) {
            Logger.error('切换固定状态失败:', error);
            return false;
        }
    }

    /**
     * 清空历史记录
     */
    async clearHistory(keepPinned: boolean = true): Promise<void> {
        try {
            await this.historyManager.clearHistory(keepPinned);
            
            // 更新UI
            this.uiManager.updateHistoryPanel();
            
            Logger.log('历史记录已清空');

        } catch (error) {
            Logger.error('清空历史记录失败:', error);
            throw error;
        }
    }

    /**
     * 导出数据
     */
    async exportData(): Promise<string> {
        try {
            return await this.historyManager.exportData();
        } catch (error) {
            Logger.error('导出数据失败:', error);
            throw error;
        }
    }

    /**
     * 导入数据
     */
    async importData(jsonString: string): Promise<void> {
        try {
            await this.historyManager.importData(jsonString);
            
            // 更新UI
            this.uiManager.updateHistoryPanel();
            
            Logger.log('数据导入完成');

        } catch (error) {
            Logger.error('导入数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取状态信息
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            enabled: this.isEnabled,
            config: this.config,
            historyStats: this.historyManager.getStats(),
            monitorStatus: this.monitor.getStatus(),
            uiState: this.uiManager.getState()
        };
    }

    /**
     * 手动触发筛选检测
     */
    manualTriggerCheck(): void {
        if (this.isEnabled) {
            this.monitor.manualTriggerCheck();
        }
    }

    /**
     * 销毁管理器
     */
    async destroy(): Promise<void> {
        try {
            Logger.log('正在销毁管理器...');

            // 禁用功能
            this.disable();

            // 清理子模块
            this.monitor.destroy();
            this.uiManager.destroy();
            await this.historyManager.cleanup();

            this.isInitialized = false;
            this.isEnabled = false;

            Logger.log('管理器已销毁');

        } catch (error) {
            Logger.error('销毁管理器失败:', error);
        }
    }

    /**
     * 处理筛选事件
     */
    private async handleFilterEvent(event: FilterEvent): Promise<void> {
        try {
            Logger.log(`处理筛选事件:`, event);

            // 添加到历史记录
            const success = await this.historyManager.addFilter({
                id: event.filterId,
                name: event.filterName,
                type: event.filterType
            });

            if (success) {
                // 更新UI
                this.uiManager.updateHistoryPanel();
                Logger.log(`已记录筛选: ${event.filterName}`);
            }

        } catch (error) {
            Logger.error('处理筛选事件失败:', error);
        }
    }

    /**
     * 始终显示小圆球（无论是否有闪卡面板）
     */
    private showQuickSwitchBallAlways(): void {
        try {
            Logger.log('显示小圆球（智能交互模式）');
            
            // 创建一个虚拟的面板引用用于位置定位，如果没有真实面板的话
            let referenceElement: Element = document.body;
            
            // 尝试找到现有的闪卡面板作为参考
            const existingPanel = document.querySelector('[data-key="dialog-opencard"], [data-key="dialog-viewcards"], .card__main');
            if (existingPanel) {
                referenceElement = existingPanel;
                Logger.log('找到现有闪卡面板作为参考位置');
            } else {
                Logger.log('未找到闪卡面板，将小圆球定位到页面右侧');
            }
            
            this.uiManager.showQuickSwitchBall(referenceElement);
            
        } catch (error) {
            Logger.error('显示小圆球失败:', error);
        }
    }

    /**
     * 处理面板检测
     */
    private handlePanelDetected(panelInfo: FlashcardPanelInfo): void {
        try {
            Logger.log(`检测到闪卡面板: ${panelInfo.type}`);

            // 如果小圆球还没显示，则显示它
            // 注意：由于我们现在在启用时就显示小圆球，这里主要是确保位置更新
            if (this.config.enabled && this.isEnabled) {
                // 更新小圆球的位置参考
                this.uiManager.showQuickSwitchBall(panelInfo.panel);
            }

        } catch (error) {
            Logger.error('处理面板检测失败:', error);
        }
    }

    /**
     * 处理筛选切换
     */
    private async handleFilterSwitch(filter: FlashcardFilter): Promise<void> {
        try {
            Logger.log(`切换筛选: ${filter.name}`);

            // 先让monitor重新检查面板状态
            this.monitor.manualTriggerCheck();
            
            // 等待一下让检查完成
            await new Promise(resolve => setTimeout(resolve, 100));

            // 查找当前的闪卡面板
            const panels = this.monitor.getCurrentPanels();
            Logger.log(`当前检测到 ${panels.length} 个闪卡面板`);
            
            let activePanel = panels.find(p => p.filterButton);

            // 如果没找到活动面板，尝试重新查找
            if (!activePanel || !activePanel.filterButton) {
                Logger.warn('未找到活动面板，尝试重新检测...');
                
                // 强制重新检测页面上的所有闪卡面板
                this.monitor.manualTriggerCheck();
                await new Promise(resolve => setTimeout(resolve, 200));
                
                const retryPanels = this.monitor.getCurrentPanels();
                activePanel = retryPanels.find(p => p.filterButton);
                
                Logger.log(`重新检测后找到 ${retryPanels.length} 个面板`);
            }

            if (!activePanel || !activePanel.filterButton) {
                Logger.error('仍未找到活动的闪卡面板，显示提示通知');
                
                // 显示友好的提示而不是抛出错误
                this.showSwitchNotification(filter, false);
                return;
            }

            Logger.log(`找到活动面板，开始执行切换`);

            // 执行筛选切换
            const success = await this.executeFilterSwitch(activePanel.filterButton, filter);
            
            if (success) {
                Logger.log(`筛选切换成功: ${filter.name}`);
            } else {
                Logger.error('筛选切换失败');
            }

        } catch (error) {
            Logger.error('处理筛选切换失败:', error);
            
            // 不抛出错误，而是显示友好的通知
            this.showSwitchNotification(filter, false);
        }
    }

    /**
     * 执行筛选切换 - 模拟原生筛选流程（不重新打开面板）
     */
    private async executeFilterSwitch(filterButton: Element, filter: FlashcardFilter): Promise<boolean> {
        try {
            Logger.log(`开始执行筛选切换: ${filter.name}（模拟原生流程）`);
            
            // 1. 更新筛选按钮属性（与原生流程一致）
            filterButton.setAttribute('data-id', filter.id);
            filterButton.setAttribute('data-cardtype', filter.type);
            Logger.log(`已更新筛选属性: data-id="${filter.id}", data-cardtype="${filter.type}"`);
            
            // 2. 模拟原生筛选菜单选择流程
            // 基于思源源码分析：用户选择筛选后会调用 fetchNewRound() 函数直接刷新面板内容
            let success = false;
            
            Logger.log('尝试模拟原生筛选选择流程');
            
            try {
                // 不要弹出菜单！直接触发刷新
                Logger.log('直接触发筛选刷新（不弹出菜单）');
                success = await this.triggerDirectRefresh(filterButton, filter);
                
                if (!success) {
                    Logger.log('直接刷新失败，尝试DOM事件触发');
                    success = this.triggerFilterChangeEvents(filterButton, filter);
                }
                
            } catch (error) {
                Logger.warn('触发刷新出错:', error);
                success = false;
            }
            
            Logger.log(`筛选切换${success ? '成功' : '可能需要手动刷新'}`);
            this.showSwitchNotification(filter, success);
            
            return success;
            
        } catch (error) {
            Logger.error('执行筛选切换失败:', error);
            this.showSwitchNotification(filter, false);
            return false;
        }
    }

    /**
     * 直接触发筛选刷新（不弹出菜单）
     */
    private async triggerDirectRefresh(filterButton: Element, filter: FlashcardFilter): Promise<boolean> {
        try {
            Logger.log('尝试直接触发思源刷新机制');
            
            // 查找闪卡面板容器
            const cardContainer = filterButton.closest('[data-key="dialog-opencard"], .card__main');
            if (!cardContainer) {
                Logger.warn('未找到闪卡容器');
                return false;
            }
            
            // 直接调用思源API获取新的闪卡数据，但不弹出任何菜单
            const apiEndpoint = filter.type === 'doc' 
                ? '/api/riff/getTreeRiffDueCards'
                : '/api/riff/getNotebookRiffDueCards';
                
            const requestBody = filter.type === 'doc' 
                ? { rootID: filter.id }
                : { notebook: filter.id };

            Logger.log(`静默调用API获取新数据: ${apiEndpoint}`, requestBody);

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API调用失败: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.code !== 0) {
                throw new Error(`API返回错误: ${result.msg || 'Unknown error'}`);
            }

            Logger.log(`静默获取到 ${result.data?.cards?.length || 0} 张闪卡数据`);
            
            // 关键：直接更新面板显示，模拟 nextCard 函数的效果
            if (result.data?.cards?.length > 0) {
                Logger.log('直接更新面板显示内容');
                return this.updateFlashcardDisplay(cardContainer, result.data, filter);
            } else {
                Logger.log('筛选结果为空，显示无卡片状态');
                return this.showNoDueCards(cardContainer);
            }
            
        } catch (error) {
            Logger.error('直接刷新失败:', error);
            return false;
        }
    }

    /**
     * 直接更新闪卡面板显示（模拟思源的nextCard函数）
     */
    private updateFlashcardDisplay(cardContainer: Element, cardsData: any, filter: FlashcardFilter): boolean {
        try {
            Logger.log('开始更新闪卡显示');
            
            // 1. 更新计数显示
            const countElement = cardContainer.querySelector('[data-type="count"]');
            if (countElement) {
                const totalCards = cardsData.cards?.length || 0;
                countElement.innerHTML = `<span>1/${totalCards}</span>`;
                countElement.classList.remove('fn__none');
                Logger.log(`更新计数显示: 1/${totalCards}`);
            }
            
            // 2. 寻找并更新编辑器内容区域
            const editorElement = cardContainer.querySelector('.protyle-content, [data-type="render"]');
            if (editorElement && cardsData.cards?.length > 0) {
                const firstCard = cardsData.cards[0];
                Logger.log(`更新编辑器内容: ${firstCard.blockID}`);
                
                // 直接调用思源的内部函数来加载卡片内容（如果可能的话）
                // 这里我们尝试触发卡片加载
                this.loadCardContent(editorElement, firstCard);
                
                // 确保编辑器显示
                editorElement.classList.remove('fn__none');
                
                // 隐藏空状态
                const emptyElement = editorElement.nextElementSibling;
                if (emptyElement) {
                    emptyElement.classList.add('fn__none');
                }
            }
            
            // 3. 更新筛选按钮显示（确保用户看到筛选已生效）
            const filterButton = cardContainer.querySelector('[data-type="filter"]');
            if (filterButton) {
                // 可以在这里更新筛选按钮的视觉状态表示筛选已应用
                filterButton.setAttribute('title', `筛选: ${filter.name}`);
            }
            
            Logger.log('面板显示更新完成');
            return true;
            
        } catch (error) {
            Logger.error('更新面板显示失败:', error);
            return false;
        }
    }

    /**
     * 加载卡片内容
     */
    private loadCardContent(editorElement: Element, card: any): void {
        try {
            Logger.log(`加载卡片内容: ${card.blockID}`);
            
            // 使用正确的API获取渲染后的HTML内容，而不是Kramdown原始格式
            fetch('/api/block/getBlockDOM', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: card.blockID })
            }).then(response => response.json())
            .then(result => {
                if (result.code === 0 && result.data) {
                    Logger.log('成功获取卡片HTML内容');
                    
                    // 设置渲染后的HTML内容
                    const contentDiv = editorElement.querySelector('.protyle-wysiwyg') || editorElement;
                    if (contentDiv) {
                        // 使用渲染后的HTML而不是Kramdown
                        contentDiv.innerHTML = result.data.dom || result.data;
                    }
                } else {
                    Logger.warn('获取DOM内容失败，尝试备选方案');
                    // 备选方案：尝试获取块的基本信息
                    this.loadCardContentFallback(editorElement, card);
                }
            }).catch(error => {
                Logger.error('加载卡片内容失败:', error);
                // 失败时的备选方案
                this.loadCardContentFallback(editorElement, card);
            });
            
        } catch (error) {
            Logger.error('加载卡片内容出错:', error);
        }
    }

    /**
     * 备选方案加载卡片内容
     */
    private loadCardContentFallback(editorElement: Element, card: any): void {
        try {
            Logger.log('使用备选方案加载卡片内容');
            
            // 备选方案：尝试获取块的基本信息并简单显示
            fetch('/api/block/getBlockInfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: card.blockID })
            }).then(response => response.json())
            .then(result => {
                if (result.code === 0 && result.data) {
                    const contentDiv = editorElement.querySelector('.protyle-wysiwyg') || editorElement;
                    if (contentDiv) {
                        // 显示基本的卡片信息
                        contentDiv.innerHTML = `
                            <div data-node-id="${card.blockID}" class="protyle-wysiwyg--select">
                                <div data-node-id="${card.blockID}" data-type="NodeParagraph" class="p">
                                    <div contenteditable="true" spellcheck="false">
                                        ${result.data.content || '正在加载卡片内容...'}
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                }
            }).catch(error => {
                Logger.error('备选方案也失败:', error);
                // 最后的备选方案：显示占位符
                const contentDiv = editorElement.querySelector('.protyle-wysiwyg') || editorElement;
                if (contentDiv) {
                    contentDiv.innerHTML = `
                        <div data-node-id="${card.blockID}" class="protyle-wysiwyg--select">
                            <div data-node-id="${card.blockID}" data-type="NodeParagraph" class="p">
                                <div contenteditable="true" spellcheck="false">
                                    📄 正在加载闪卡内容 (ID: ${card.blockID})
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
            
        } catch (error) {
            Logger.error('备选方案出错:', error);
        }
    }

    /**
     * 显示无卡片状态
     */
    private showNoDueCards(cardContainer: Element): boolean {
        try {
            Logger.log('显示无卡片状态');
            
            // 隐藏编辑器
            const editorElement = cardContainer.querySelector('.protyle-content, [data-type="render"]');
            if (editorElement) {
                editorElement.classList.add('fn__none');
            }
            
            // 显示空状态
            const emptyElement = editorElement?.nextElementSibling;
            if (emptyElement) {
                emptyElement.innerHTML = `<div>🔮</div>当前筛选没有到期的闪卡`;
                emptyElement.classList.remove('fn__none');
            }
            
            // 隐藏计数
            const countElement = cardContainer.querySelector('[data-type="count"]');
            if (countElement) {
                countElement.classList.add('fn__none');
            }

            return true;

        } catch (error) {
            Logger.error('显示无卡片状态失败:', error);
            return false;
        }
    }

    /**
     * 触发筛选变更事件
     */
    private triggerFilterChangeEvents(filterButton: Element, filter: FlashcardFilter): boolean {
        try {
            Logger.log('触发筛选变更事件');
            
            // 触发各种可能让思源识别筛选变更的DOM事件
            const events = [
                'change', 'input', 'blur', 'focus', 'click', 'mouseup',
                'DOMSubtreeModified', 'propertychange'
            ];
            
            events.forEach(eventType => {
                filterButton.dispatchEvent(new Event(eventType, { bubbles: true }));
            });
            
            // 触发自定义事件
            filterButton.dispatchEvent(new CustomEvent('filterChanged', {
                bubbles: true,
                detail: { id: filter.id, type: filter.type, name: filter.name }
            }));
            
            // 尝试触发面板内容的刷新事件
            const cardContainer = filterButton.closest('[data-key="dialog-opencard"], .card__main');
            if (cardContainer) {
                cardContainer.dispatchEvent(new CustomEvent('refresh', { bubbles: true }));
                cardContainer.dispatchEvent(new Event('update', { bubbles: true }));
            }
            
            Logger.log('已触发筛选变更事件');
            return true;

        } catch (error) {
            Logger.error('触发筛选事件失败:', error);
            return false;
        }
    }

    /**
     * 打开闪卡复习
     */
    private openFlashcardReview(): void {
        try {
            Logger.log('打开闪卡复习');
            
            // 使用正确的Alt+0快捷键（基于思源源码分析）
            const altZeroEvent = new KeyboardEvent('keydown', {
                key: '0',
                code: 'Digit0',
                keyCode: 48,
                altKey: true,
                bubbles: true,
                cancelable: true
            });
            
            document.dispatchEvent(altZeroEvent);
            Logger.log('Alt+0快捷键已发送，正在打开闪卡复习');
            
            // 备选方案：如果Alt+0没有效果，才尝试菜单点击
            setTimeout(() => {
                // 检查是否已经有闪卡面板打开了
                const hasPanel = document.querySelector('[data-key="dialog-opencard"], [data-key="dialog-viewcards"], .card__main');
                
                if (!hasPanel) {
                    Logger.log('Alt+0未生效，尝试菜单点击');
                    
                    const menuItems = document.querySelectorAll('.b3-menu__item');
                    for (const menuItem of menuItems) {
                        const text = menuItem.textContent?.trim() || '';
                        const menuId = menuItem.getAttribute('id');
                        
                        if (menuId === 'spaceRepetition' || 
                            text.includes('间隔重复') || 
                            text.includes('Space Repetition') ||
                            text.includes('复习')) {
                            
                            Logger.log(`找到间隔重复菜单: "${text}"`);
                            menuItem.dispatchEvent(new MouseEvent('click', { 
                                bubbles: true,
                                cancelable: true,
                                view: window
                            }));
                            break;
                        }
                    }
                } else {
                    Logger.log('Alt+0成功，闪卡面板已打开');
                }
            }, 500); // 增加延迟，确保Alt+0有足够时间生效
            
        } catch (error) {
            Logger.error('打开闪卡复习失败:', error);
        }
    }

    /**
     * 显示切换通知 - 只在失败时记录日志，不弹窗
     */
    private showSwitchNotification(filter: FlashcardFilter, autoRefreshSuccess: boolean = false): void {
        // 成功时不显示任何消息
        if (autoRefreshSuccess) {
            return;
        }
        
        // 失败时只记录到控制台，不弹窗
        Logger.warn(`筛选切换可能需要手动刷新: ${filter.name}`);
    }

    /**
     * 重置为默认状态
     */
    async reset(): Promise<void> {
        try {
            // 重置历史记录
            await this.historyManager.reset();
            
            // 重置配置
            this.config = { ...DEFAULT_CONFIG };
            this.uiManager.updateConfig(this.config);
            
            // 更新UI
            this.uiManager.updateHistoryPanel();
            
            Logger.log('已重置为默认状态');

        } catch (error) {
            Logger.error('重置失败:', error);
            throw error;
        }
    }
}



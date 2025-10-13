# 思源闪卡小助手

[English](./README.md)

一个专为思源笔记设计的闪卡小助手插件，让复习更高效、更便捷。

## ✨ 功能特点

本插件致力于提升思源笔记的闪卡使用体验，解决两大核心场景：

### 🚀 闪卡快速调用
- 一键快速访问闪卡功能
- 便捷的闪卡管理入口
- 提高闪卡使用效率

### 📚 闪卡快速回顾
- 快速进入复习模式
- 高效的闪卡复习体验
- 帮助用户更好地巩固知识

## 📦 安装

### 从集市安装（推荐）
1. 打开思源笔记
2. 进入 `集市` - `插件`
3. 搜索 `思源闪卡小助手`
4. 点击下载并启用

### 手动安装
1. 下载最新的 release 版本
2. 解压到思源笔记的 `data/plugins/` 目录
3. 重启思源笔记
4. 在 `设置` - `集市` - `已下载` 中启用插件

## 🎯 使用场景

### 场景一：学习新知识时
在学习过程中，快速创建和调用闪卡，将重要知识点即时转化为复习材料。

### 场景二：定期复习时
通过快速回顾功能，高效地进行闪卡复习，巩固已学知识。

## 🛠️ 开发

### 准备工作

1. 克隆仓库到本地
   ```bash
   git clone https://github.com/Administrator/siyuan-flashcard-assistant.git
   cd siyuan-flashcard-assistant
   ```

2. 安装依赖
   ```bash
   pnpm install
   ```

3. 创建开发符号链接
   ```bash
   pnpm run make-link
   ```
   
   > Windows 用户可能需要管理员权限，或在开发者模式下运行

4. 启动开发模式
   ```bash
   pnpm run dev
   ```

### 构建发布

```bash
pnpm run build
```

这将生成 `package.zip` 文件，可用于发布。

## 📝 技术栈

- 构建工具：Vite
- 前端框架：Svelte 4
- 语言：TypeScript
- 包管理：pnpm

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

MIT License

## 🙏 致谢

- 感谢思源笔记团队提供的优秀插件开发框架
- 基于 [plugin-sample-vite-svelte](https://github.com/siyuan-note/plugin-sample-vite-svelte) 模板开发

## 📮 反馈

如果你在使用过程中遇到问题或有任何建议，欢迎通过以下方式反馈：

- 提交 [GitHub Issue](https://github.com/Administrator/siyuan-flashcard-assistant/issues)
- 在思源笔记社区发帖讨论

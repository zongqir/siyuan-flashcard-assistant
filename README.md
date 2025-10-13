# Flashcard Assistant for SiYuan

[中文版](./README_zh_CN.md)

A powerful flashcard assistant plugin for SiYuan Note, making review more efficient and convenient.

## ✨ Features

This plugin is dedicated to enhancing the flashcard experience in SiYuan Note, addressing two core scenarios:

### 🚀 Quick Flashcard Invocation
- One-click quick access to flashcard features
- Convenient flashcard management portal
- Improved flashcard usage efficiency

### 📚 Quick Flashcard Review
- Fast entry into review mode
- Efficient flashcard review experience
- Helps users better consolidate knowledge

## 📦 Installation

### Install from Marketplace (Recommended)
1. Open SiYuan Note
2. Go to `Marketplace` - `Plugins`
3. Search for `Flashcard Assistant`
4. Click to download and enable

### Manual Installation
1. Download the latest release version
2. Extract to the `data/plugins/` directory of SiYuan Note
3. Restart SiYuan Note
4. Enable the plugin in `Settings` - `Marketplace` - `Downloaded`

## 🎯 Use Cases

### Scenario 1: Learning New Knowledge
While learning, quickly create and invoke flashcards to instantly transform important knowledge points into review materials.

### Scenario 2: Regular Review
Through the quick review feature, efficiently review flashcards to consolidate learned knowledge.

## 🛠️ Development

### Prerequisites

1. Clone the repository
   ```bash
   git clone https://github.com/Administrator/siyuan-flashcard-assistant.git
   cd siyuan-flashcard-assistant
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Create development symbolic link
   ```bash
   pnpm run make-link
   ```
   
   > Windows users may need administrator privileges or run in developer mode

4. Start development mode
   ```bash
   pnpm run dev
   ```

### Build for Release

```bash
pnpm run build
```

This will generate a `package.zip` file for release.

## 📝 Tech Stack

- Build Tool: Vite
- Frontend Framework: Svelte 4
- Language: TypeScript
- Package Manager: pnpm

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License

## 🙏 Acknowledgments

- Thanks to the SiYuan Note team for the excellent plugin development framework
- Based on the [plugin-sample-vite-svelte](https://github.com/siyuan-note/plugin-sample-vite-svelte) template

## 📮 Feedback

If you encounter any issues or have suggestions, please feel free to:

- Submit a [GitHub Issue](https://github.com/Administrator/siyuan-flashcard-assistant/issues)
- Post in the SiYuan Note community

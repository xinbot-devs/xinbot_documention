# Xinbot Documentation

Welcome to the official documentation repository for **Xinbot**, a lightweight and extensible Minecraft bot client designed for Anarchy servers.

This documentation is built with [VitePress](https://vitepress.dev/) and provides comprehensive guides, tutorials, and API references for both users and developers.

## 📖 Access the Documentation

The live documentation is available at: [https://huangdihd.github.io/xinbot_documention/](https://huangdihd.github.io/xinbot_documention/)

## 🛠 Project Structure

- `docs/`: Main documentation source files.
  - `guide/`: User guides, setup instructions, and the Meta-Plugin list.
  - `reference/`: Technical documentation for plugin development and advanced APIs.
  - `zh/`: Simplified Chinese translation of the documentation.
- `.github/`:
  - `ISSUE_TEMPLATE/`: Templates for bug reports and Meta-Plugin submissions.
  - `workflows/`: CI/CD pipelines for automated documentation updates and deployment.

## 🚀 Local Development

To run the documentation locally, ensure you have [Node.js](https://nodejs.org/) installed, then follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/huangdihd/xinbot_documention.git
   cd xinbot_documention
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run docs:dev
   ```
   The site will be available at `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run docs:build
   ```

## 🤝 Contributing

We welcome contributions! Whether you're fixing a typo, improving a guide, or submitting a new Meta-Plugin, your help is appreciated.

### Submitting a Meta-Plugin
If you've developed a Meta-Plugin, you can add it to our official list by [opening a Meta-Plugin Submission issue](https://github.com/huangdihd/xinbot_documention/issues/new?template=meta_plugin_submission.yml). Our automated workflow will process your request and create a Pull Request.

### General Improvements
For other changes, please fork the repository and submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This documentation is released under the **GPL-3.0 License**. See the `LICENSE` file for more details.

---
Maintained by [huangdihd](https://github.com/huangdihd).

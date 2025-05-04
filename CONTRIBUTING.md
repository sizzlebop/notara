# 🤝 Contributing to Notara

First of all, thank you for considering contributing to Notara! Your help is essential for making this cosmic note-taking app even better. This document provides guidelines and instructions for contributing.

## 🌟 Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Be respectful and inclusive
- Be patient and welcoming
- Be thoughtful
- Be collaborative
- Ask for help when unsure

## 🚀 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues as you might find that the bug has already been reported. When you are creating a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed and why it's a problem
- Include screenshots if possible
- Include details about your browser, OS, and Notara version

### 💡 Suggesting Enhancements

Enhancement suggestions are also welcome! When suggesting an enhancement:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Explain why this enhancement would be useful to Notara users
- List some examples of other applications that have similar features, if applicable
- Include mockups or designs if you have them

### 📝 Pull Requests

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/notara.git`
3. Create a new branch for your feature or bugfix: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Run the tests and linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add some amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Submit a pull request to the `main` branch of the Notara repository

## 💻 Development Environment Setup

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm, Yarn, or Bun

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/notara.git
   cd notara
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   # or
   bun install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

## 🎨 Coding Guidelines

### General Guidelines

- Use TypeScript for all JavaScript files
- Use functional components with hooks instead of class components
- Keep components small and focused on a single responsibility
- Use the existing folder structure

### Styling

- Use TailwindCSS for styling
- Follow the cosmic theme aesthetic
- Use the predefined color palette in the tailwind configuration
- Use shadcn/ui components or create custom components based on Radix UI primitives

### Testing

- Write tests for your code whenever possible
- Aim for good test coverage

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Example: `feat: add constellation view filtering`

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

✨ Made with ❤️ by Pink Pixel 
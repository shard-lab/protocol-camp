# 🚀 Contribution Guide  

Thank you for your interest in contributing to our project! We focus on **learning through hands-on implementation of core concepts**. Instead of simply providing explanations, we create structured exercises that guide learners to actively write and test code, deepening their understanding through experience.  

This guide explains how to contribute by designing and improving hands-on learning materials.  

<br>

## 🛠 How to Contribute  

Our contribution process is structured around **designing learning experiences**, not just writing code. Learners engage with exercises by filling in missing implementations, passing tests, and interacting with structured challenges.

There are two ways to contribute:  
1. **Implementing an existing learning module** (An issue already exists for the topic.)  
2. **Proposing a new learning module** (You have an idea for a new learning experience.)  

### 🏗 1. Implement an Existing Learning Module  

If an issue is already registered, you can contribute by designing the hands-on learning experience for it.  
Follow the **Standard Contribution Process** below.  

### 📝 2. Propose a New Learning Module  

If you want to introduce a new hands-on learning experience, follow these steps:  

#### 1️⃣ Open an Issue  
Before writing any code, create an issue to propose your idea.  
- Clearly define the **learning objective** and **key concepts** covered.  
- Outline how learners will interact with the material (e.g., filling in missing functions, debugging test cases, or designing a solution).  
- Use the [Educational Module Proposal Template](.github/ISSUE_TEMPLATE/educational-module-proposal.md).  

#### 2️⃣ Discuss & Refine the Idea  
- Engage in discussion with maintainers and contributors.  
- Ensure the topic aligns with our **hands-on implementation** approach.  
- Iterate on the proposal before starting development.  

#### 3️⃣ Implement the Learning Module  
- Once the proposal is approved, create a new branch and start developing the exercise.  
- Structure the module so that learners actively **write and test code** (e.g., providing failing tests that they must fix, or function stubs they must complete).  

#### 4️⃣ Submit a Pull Request (PR)  
- When your module is ready, submit a **Pull Request (PR)** following the process below.  
- Provide a clear explanation of the educational goals.  
- Ensure the module is well-documented and includes the necessary test cases.  

<br>

## 🔧 Standard Contribution Process  

Follow these steps when contributing new learning materials or improvements: 

### 1️⃣ Fork the Repository  
Click on the **Fork** button in the top-right corner of this repository to create your own copy on GitHub.

### 2️⃣ Clone Your Fork  
Clone the forked repository to your local machine:
```bash
git clone https://github.com/<your-username>/<repo-name>.git
```

### 3️⃣ Create a New Branch  
Create a new branch for your changes:
```bash
git checkout -b feature/your-feature-name
```

### 4️⃣ Make Your Changes  
Develop your feature or fix the bug. If necessary, update related tests 🧪 and documentation 📖.

### 5️⃣ Write Meaningful Commit Messages  
Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) guidelines. Example:
```bash
git commit -m "feat: add user authentication feature"
git commit -m "fix: resolve API endpoint issue"
git commit -m "docs: update contribution guide"
```

### 6️⃣ Push Your Branch  
Push your branch to your forked repository:
```bash
git push origin feature/your-feature-name
```

### 7️⃣ Open a Pull Request (PR)  
Open a pull request from your fork to the `main` branch of the upstream repository.

- **PR Title:** Follow the commit message convention (e.g., `feat: add user authentication feature`).  
- **PR Description:** Provide a clear description of your changes and reference any related issues.

<br>

## 🔀 Merge Strategy

We use **Squash & Merge** as the default merge strategy.  
This keeps the commit history clean by squashing all commits in a pull request into a single commit when merging.

<br>

## Additional Guidelines

- **Code Review:** PRs will be reviewed by maintainers. Please address any feedback provided.  
- **Testing:** Ensure your changes do not break existing functionality. Add or update tests if necessary.  
- **Documentation:** Update any relevant documentation if your changes impact the project.  

<br>

## ❓ Questions and Support

If you have any questions, feel free to open an issue or reach out to the maintainers.

Thank you for your contributions! 🚀

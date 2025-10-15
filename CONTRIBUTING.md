# Contributing to SDEverse

Thank you for your interest in contributing to SDEverse! This document provides guidelines and instructions for contributing.

## 🔄 Contribution Workflow

1.  **Fork and Clone**

    First, fork the repository on GitHub, then clone your fork to your local machine.

    ```bash
    # Clone your forked repository
    git clone https://github.com/YOUR-USERNAME/SDEverse.git

    # Navigate into the project directory
    cd SDEverse

    # Add the original repository as an upstream remote
    git remote add upstream https://github.com/Harshdev625/SDEverse
    ```

2. **Create an Issue**

    Before you start working, please **create a new issue** on GitHub.
    * **Describe the Problem:** Clearly explain the bug you've found or the feature you want to add.
    * **Propose a Solution:** Briefly outline how you plan to resolve the issue.
    * **Add Screenshots:** Include relevant screenshots to help illustrate the problem.
    * **Ask Questions:** If you have any doubts, ask them in the issue *before* you begin coding. This helps save time for everyone.


3.  **Create a Branch**

    Create a new branch for your changes. Use a descriptive name that reflects the feature or fix you are working on.

    ```bash
    # Create and switch to a new branch
    git checkout -b feature/user-profile-page
    ```

    **Branch Naming Conventions:**
    * `feature/add-new-component`
    * `fix/login-api-bug`
    * `docs/update-readme`

4.  **Make Your Changes**

    * Navigate to the appropriate directory (`client` or `server`).
    * Follow the **Development Setup** instructions below to install dependencies and configure your environment.
    * Write your code, adhering to the project's existing code style and patterns.
    * Update documentation or add tests as needed for your changes.

5.  **Commit Your Changes**

    Stage your changes and commit them with a clear, descriptive message.

    ```bash
    # Stage all your changes
    git add .

    # Commit with a meaningful message
    git commit -m "feat: Add user profile page with avatar upload"
    ```

    **Commit Message Format:**
    * `feat: Describe the new feature`
    * `fix: Explain the bug you fixed`
    * `docs: Detail the documentation changes`

6.  **Keep Your Fork Updated**

    Before pushing your changes, pull the latest changes from the upstream `main` branch to avoid merge conflicts.

    ```bash
    # Fetch the latest changes from the upstream repository
    git fetch upstream

    # Merge the upstream main branch into your feature branch
    git merge upstream/main
    ```

7.  **Push and Create a Pull Request**

    Push your branch to your forked repository on GitHub.

    ```bash
    # Push your feature branch to your fork
    git push origin feature/user-profile-page
    ```

    After pushing, go to the SDEverse repository on GitHub and you will see a prompt to create a **Pull Request**. Fill out the PR template with details about your changes.


8. **Fill Out Your Pull Request (PR) Description**

    A clear and complete PR description helps maintainers review your work faster. After you create your pull request, you must fill out the description template.

    1.  **Start Editing**
        To begin, find the description box of your PR. Click the **three-dots menu (`...`)** in its top-right corner and select **Edit**.
        

    2.  **Link Your Issue**
        In the description text, link the issue you are solving. Use keywords like `fix`, `resolve`, or `closes` followed by the issue number.
        * **Example**: `fix #217`

    3.  **Complete the Checklists**
        Go through the template and check the relevant boxes `[ ]` by **manually typing an `x`** inside the brackets to make it look like `[x]`.

    4.  **Attach Screenshots**
        Under the `## Screenshots` section, you can easily **drag and drop** your image files directly into the text box. GitHub will upload them and automatically add the necessary links.

    5.  **Save Your Changes**
        Finally, review your entire description to make sure everything is correct and click the **"Update comment"** button to save and submit your changes.

    ### Example of a Completed Description
    ```markdown
    ## Description
    This PR introduces a new user profile page where users can view and update their information, including uploading a new avatar.

    fix #217

    ## Type of Change
    - [ ] Bug fix
    - [x] New feature  
    - [ ] Documentation update
    - [ ] Code refactoring
    - [ ] Other

    ## Testing
    - [x] Manual testing on my local machine confirmed the page renders correctly and the form submission works.
    - [ ] Added/updated tests
    - [x] Tested on Chrome and Firefox.

    ## Screenshots (if applicable)
    *Screenshot of the new user profile page.*
    ![profile-page.png](https://...)


    ## Checklist
    - [x] Code follows project style guidelines
    - [x] Self-reviewed my code  
    - [x] Updated documentation if needed
    - [x] No new warnings or errors
    - [x] Tested changes locally

    ## Hacktoberfest (if applicable)
    - [x] This is a meaningful contribution (not spam/low-effort)
    - [x] I have read the contribution guidelines
    ```
    The changes will be reflected in the PR. Once everything is mentioned correctly submit the changes.
---

## Development Setup

**Prerequisites:** Node.js (v18+), MongoDB, Git

**Backend:**
```bash
cd server
npm install
cp .env.example .env  # Configure MONGO_URI, JWT_SECRET, PORT
npm run dev
```

**Frontend:**
```bash
cd client
npm install  
cp .env.example .env  # Configure VITE_API_BASE_URL
npm run dev
```

## Hacktoberfest

We participate in Hacktoberfest 2025! Look for issues labeled:
- `hacktoberfest` - Valid for Hacktoberfest  
- `good first issue` - Perfect for beginners
- `help wanted` - Extra attention needed

**Guidelines:** Focus on meaningful contributions, avoid spam/low-effort PRs.

## Contribution Types

**Bug Reports:** Use GitHub issues with clear reproduction steps.

**Features:** Submit feature requests via issues with detailed descriptions.

**Code:** Follow existing patterns, add tests, update docs as needed.

## Standards

- Use ESLint and Prettier for code formatting
- Follow existing component and API patterns  
- Write clear commit messages
- Test changes locally before submitting
- Thoroughly complete the Pull Request description template upon submission.

## Contact

- **Issues**: [GitHub Issues](https://github.com/Harshdev625/SDEverse/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Harshdev625/SDEverse/discussions)

Thank you for contributing to SDEverse!
# Aptos Move Project Initialization Guide

## 1. Running `aptos move init`

The `aptos move init` command sets up a basic project structure for developing Move modules on Aptos. This command is essential for initializing a development environment, allowing you to write, test, and deploy Move modules seamlessly.

### Example:

```bash
aptos move init --name MyMoveProject
```

Executing this command will create a directory named `MyMoveProject` containing all necessary folders and configuration files for Move development.

## 2. Generated Folder Structure and Layout

After running `aptos move init`, your project folder will have the following structure:

```plaintext
MyMoveProject/
├── Move.toml
├── sources/
│   └── <Move module files>
├── scripts/
│   └── <Move script files>
└── tests/
    └── <Move test files>
```

### Description of Each Folder and File

1. **Move.toml**

   - The configuration file for your Move project, required for project management and dependency tracking.
   - Defines project details such as dependencies, network configurations, and compilation settings.
   - Example:

     ```toml
     [package]
     name = "MyMoveProject"
     version = "0.0.1"

     [dependencies]
     AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework" }
     ```

2. **sources/**

   - Contains the Move module files where you define your main functionality and state management.
   - Each module file here has a `.move` extension.
   - Example: `SimpleStorage.move` for a simple storage module.

3. **scripts/**

   - Stores Move script files, which are transaction scripts designed to perform specific tasks on the blockchain.
   - Unlike module functions that internally manage state, scripts here can be submitted as transactions to interact with the blockchain.

4. **tests/**
   - Contains test code for the Move modules, enabling you to validate the functionality and logic of each module.
   - Test files, also in `.move` format, allow you to verify behaviors using `#[test]` attributes, ensuring that modules work as expected under various scenarios.

## 3. Workflow in a Project

- **Module Development**: Write and organize your core Move modules in the `sources/` folder. Here, you define functions, state management, and any operations required for your project.
- **Script Writing**: Create transaction scripts in the `scripts/` folder. These scripts can be submitted to perform specific functions on the blockchain by invoking operations from your modules.
- **Testing**: Write and manage test cases in the `tests/` folder to verify module behavior and logic before deployment. Testing helps simulate scenarios, catching bugs and ensuring reliability.

## Summary

The `aptos move init` command structures your project for effective Move development on Aptos. With a clear separation of concerns—modules in `sources/`, transaction scripts in `scripts/`, and tests in `tests/`—this setup enables organized and efficient project management. The `Move.toml` file provides essential configuration, including dependency management and network information, allowing easy customization for Aptos Move development.

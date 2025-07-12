# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IC Dev Kit is a Node.js library and CLI tool that streamlines development workflows for the Internet Computer (IC). It provides utilities to interact with `dfx`, manage identities, deploy canisters, generate TypeScript bindings, and handle canister lifecycle management.

## Repository Architecture

This is a TypeScript/Node.js project with the following key architectural components:

### CLI Interface (`src/icdev.ts`)
- Command-line interface built with Commander.js
- Provides commands for canister management, identity handling, and code generation
- Executable via `icdev` command when installed

### Core Modules (`src/src/`)
- **`canister.ts`** - Core canister lifecycle operations (create, build, install, upgrade)
- **`identity.ts`** - Identity management with PEM file handling and dfx integration
- **`dfxJson.ts`** - dfx.json parsing and canister configuration management
- **`utils.ts`** - Utility functions for IC operations and data conversion
- **`ICDevKitConfiguration.ts`** - Configuration file handling for `ic-dev-kit.json`

### Binary Scripts (`src/bin_scripts/`)
- Executable tasks that can be run programmatically or via CLI
- Each script handles a specific workflow (build, generate, pack, etc.)

### Library Entry Point (`src/src/index.ts`)
- Exports all modules for programmatic use
- Allows the package to be used as both CLI tool and library

## Common Development Commands

### Building and Testing
```bash
# Build the project
npm run build

# Format code
npm run format

# Run tests (lint-staged)
npm test

# Generate documentation
npm run pack-docs

# Build and view docs locally
npm start
```

### CLI Usage (via icdev command)
```bash
# Initialize ic-dev-kit in a project
icdev init

# Build all canisters
icdev build-all

# Generate TypeScript bindings from Candid files
icdev generate

# Initialize identities from PEM files
icdev init-identity

# Show principal from PEM file
icdev show-principal -n <identity-name>

# Pack canisters for distribution
icdev pack --package-version 1.0.0 --publish

# Install canister from package
icdev install-canister -n <canister-name>

# Update DID files
icdev update-did

# Get account ID from principal
icdev get-account-id <principal>
```

## Configuration Files

### `ic-dev-kit.json`
Project-specific configuration file that defines:
- Identity settings (PEM file directories, default identity)
- Canister installation parameters for third-party packages
- Used by CLI commands for automated setup

### `dfx.json`
Standard dfx configuration file that ic-dev-kit reads to:
- Discover available canisters
- Determine build requirements
- Generate TypeScript bindings

## Key Patterns

### Identity Management
- PEM files stored in `./ic-dev-kit/pem/` by default
- Identities automatically loaded into dfx for canister operations
- Supports multiple identities with configurable default

### Canister Lifecycle
- **Create** → **Build** → **Install** → **Upgrade** workflow
- Environment-specific builds via environment variables
- Automated WASM path detection and management

### Package Distribution
- Supports packaging canisters as npm modules
- Generates TypeScript declarations from Candid interfaces
- Can publish to npm registry with version management

### Third-party Canister Integration
- Install pre-built canisters from npm packages (e.g., `@deland-labs/ic_ledger_server`)
- Configure installation parameters in `ic-dev-kit.json`
- Supports both custom command and parameter-based installation

## Development Workflow

1. **Project Setup**: Run `icdev init` to create basic configuration
2. **Identity Setup**: Place PEM files in `./ic-dev-kit/pem/` and run `icdev init-identity`
3. **Development**: 
   - Build canisters with `icdev build-all`
   - Generate TypeScript bindings with `icdev generate`
   - Install third-party canisters with `icdev install-canister`
4. **Distribution**: Package with `icdev pack` for npm distribution

## TypeScript Configuration

- ES modules with ESNext target
- Vite-based build system for library distribution
- External dependencies marked to avoid bundling
- TypeDoc integration for documentation generation

## Development Guidelines

### Pull Request Requirements
- **Never commit directly to main branch** - Always create a feature branch and submit a PR
- Use conventional commit messages (e.g., `fix:`, `feat:`, `chore:`, `ci:`)
- Ensure all CI checks pass before merging
- Update yarn.lock when dependencies change
- Test changes locally before submitting PR

### ES Module Compatibility
When working with CommonJS dependencies in this ES module project:
- Use default imports for CommonJS modules: `import pkg from 'package'; const { method } = pkg;`
- Replace `require()` with dynamic `import()`
- Add Node.js built-ins to Vite externals if needed

### CI/CD
- GitHub Actions runs on Node.js 18 (required for shelljs@0.10.0+)
- Build workflow triggers on push to main and PR events
- Public repository - CI is free and should remain enabled
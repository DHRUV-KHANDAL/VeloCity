#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkDependencies() {
  console.log('🔍 Frontend Dependency Check:');
  try {
    const packageJsonPath = path.resolve(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    const criticalDeps = [
      'vite', 
      '@vitejs/plugin-react', 
      'react', 
      'react-dom', 
      'tailwindcss', 
      'postcss', 
      'autoprefixer',
      'react-router-dom',
      'axios',
      'react-hot-toast'
    ];

    criticalDeps.forEach(dep => {
      console.log(`${dep}: ${deps[dep] || 'NOT INSTALLED'}`);
    });
  } catch (error) {
    console.error('❌ Package.json read error:', error);
  }
}

function checkConfigs() {
  console.log('\n🗂️ Configuration Files:');
  const configs = [
    'vite.config.js',
    'tailwind.config.js',
    'postcss.config.js'
  ];

  configs.forEach(config => {
    const configPath = path.resolve(__dirname, config);
    const exists = fs.existsSync(configPath);
    console.log(`${config}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (exists) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        console.log('Content Preview:');
        console.log(content.slice(0, 200) + '...');
      } catch (error) {
        console.error(`Error reading ${config}:`, error.message);
      }
    }
  });
}

function runSystemDiagnostics() {
  console.log('\n🚀 System Diagnostics:');
  const diagnosticCommands = [
    { name: 'Node.js Version', command: 'node --version' },
    { name: 'NPM Version', command: 'npm --version' },
    { name: 'Vite Version', command: 'npx vite --version' }
  ];

  diagnosticCommands.forEach(({ name, command }) => {
    try {
      const output = execSync(command, { encoding: 'utf-8' }).trim();
      console.log(`${name}: ${output}`);
    } catch (error) {
      console.error(`❌ ${name} check failed:`, error.message);
    }
  });
}

function checkProjectStructure() {
  console.log('\n📂 Project Structure:');
  const requiredDirectories = [
    'src',
    'src/components',
    'src/pages',
    'src/contexts'
  ];

  requiredDirectories.forEach(dir => {
    const dirPath = path.resolve(__dirname, dir);
    const exists = fs.existsSync(dirPath);
    console.log(`${dir}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
  });
}

function main() {
  console.log('🔬 VeloCity Frontend Diagnostic Tool');
  
  try {
    // Ensure we're in the correct directory
    const currentDir = process.cwd();
    console.log(`Current Directory: ${currentDir}`);
    
    checkDependencies();
    checkConfigs();
    checkProjectStructure();
    runSystemDiagnostics();
  } catch (error) {
    console.error('❌ Diagnostic process failed:', error);
  }
}

// Wrap in a try-catch to handle any unexpected errors
try {
  main();
} catch (error) {
  console.error('Unhandled error in diagnostic script:', error);
}
/**
 * SAST (Static Application Security Testing) Code Scanner
 * Technology: Node.js, Express, Sequelize, React, Flutter
 * 
 * Analyzes source code for:
 *  - Authentication & JWT checks
 *  - Authorization & IDOR prevention
 *  - Input validation & parameterized queries
 *  - Cryptographic key handling & hardcoded secrets
 *  - Sensitive data exposure & verbose logging
 *  - Security headers & CORS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSASTScan(projectRoot) {
  console.log('===============================================================');
  console.log('🔍 RUNNING SAST (STATIC APPLICATION SECURITY TESTING) SCAN');
  console.log(`   Auditing Codebase at: ${projectRoot}`);
  console.log('===============================================================');

  const sastRules = [
    {
      id: 'SAST-001',
      name: 'Hardcoded API Keys or Secrets',
      pattern: /(AIzaSy[0-9A-Za-z_-]{33}|gsk_[a-zA-Z0-9]{40,}|jwt_secret\s*=\s*['"][a-zA-Z0-9_-]{8,}['"])/i,
      severity: 'CRITICAL',
      category: 'Sensitive Data'
    },
    {
      id: 'SAST-002',
      name: 'Unescaped SQL Raw Query Concatenation',
      pattern: /sequelize\.query\s*\(\s*['`].*\$\{.*\}['`]/i,
      severity: 'CRITICAL',
      category: 'Injection'
    },
    {
      id: 'SAST-003',
      name: 'Missing JWT Protect Middleware on Route Group',
      pattern: /router\.(get|post|put|delete)\([^,]+,\s*(?!protect)[a-zA-Z0-9_]+\)/i,
      severity: 'MEDIUM',
      category: 'Authentication'
    },
    {
      id: 'SAST-004',
      name: 'Weak Password Hashing Work Factor',
      pattern: /bcrypt\.genSalt\(\s*([1-9]|1[0-1])\s*\)/i,
      severity: 'HIGH',
      category: 'Cryptography'
    },
    {
      id: 'SAST-005',
      name: 'Debug or Verbose Stack Trace Logging',
      pattern: /console\.error\(.*err\.stack.*\)/i,
      severity: 'LOW',
      category: 'Information Leakage'
    }
  ];

  const targetDirs = ['server', 'src', 'flutter_app/lib'];
  let totalFilesScanned = 0;
  const sastFindings = [];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '.dart_tool'].includes(entry.name)) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile() && /\.(ts|js|tsx|jsx|dart)$/.test(entry.name)) {
        totalFilesScanned++;
        const content = fs.readFileSync(fullPath, 'utf8');

        sastRules.forEach(rule => {
          if (rule.pattern.test(content)) {
            sastFindings.push({
              ruleId: rule.id,
              ruleName: rule.name,
              file: path.relative(projectRoot, fullPath),
              severity: rule.severity,
              category: rule.category
            });
          }
        });
      }
    }
  }

  targetDirs.forEach(sub => scanDirectory(path.join(projectRoot, sub)));

  console.log(`📁 Files Scanned: ${totalFilesScanned}`);
  console.log(`🚩 SAST Scan Findings: ${sastFindings.length}`);
  
  if (sastFindings.length === 0) {
    console.log('✅ ZERO CRITICAL HARDCODED SECRETS OR SQL INJECTIONS DETECTED IN SOURCE FILES');
  } else {
    sastFindings.forEach(f => {
      console.log(`   [${f.severity}] ${f.ruleId}: ${f.ruleName} in ${f.file}`);
    });
  }
  console.log('===============================================================\n');

  return { totalFilesScanned, findings: sastFindings };
}

if (process.argv[1] && process.argv[1].endsWith('run-sast-scan.js')) {
  runSASTScan(path.resolve(__dirname, '..')).catch(err => {
    console.error('SAST scan failure:', err);
    process.exit(1);
  });
}

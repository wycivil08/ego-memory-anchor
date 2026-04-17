#!/usr/bin/env node
/**
 * Verify All Subsystems
 *
 * Orchestrates all verify scripts and reports results.
 * Each script verifies a specific subsystem:
 * 1. verify-auth.mjs - Authentication
 * 2. verify-profile-crud.mjs - Profile CRUD
 * 3. verify-memory-upload.mjs - Memory upload
 * 4. verify-reminder.mjs - Reminders
 * 5. verify-family-collaboration.mjs - Family collaboration
 * 6. verify-export.mjs - Data export
 *
 * Usage:
 *   node scripts/verify-all.mjs
 *   node scripts/verify-all.mjs auth profile-crud  # Run specific checks
 */

import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SCRIPTS = {
  auth: 'verify-auth.mjs',
  'profile-crud': 'verify-profile-crud.mjs',
  'memory-upload': 'verify-memory-upload.mjs',
  reminder: 'verify-reminder.mjs',
  'family-collaboration': 'verify-family-collaboration.mjs',
  export: 'verify-export.mjs'
}

const green = (t) => `\x1b[32m${t}\x1b[0m`
const red = (t) => `\x1b[31m${t}\x1b[0m`
const cyan = (t) => `\x1b[36m${t}\x1b[0m`

function runScript(scriptName) {
  return new Promise((resolve) => {
    const scriptPath = join(__dirname, scriptName)
    console.log(cyan(`\n Running ${scriptName}...\n`))

    const proc = spawn('node', [scriptPath], {
      cwd: __dirname,
      stdio: 'inherit'
    })

    proc.on('close', (code) => {
      resolve(code === 0)
    })

    proc.on('error', (err) => {
      console.error(red(`Failed to run ${scriptName}:`, err.message))
      resolve(false)
    })
  })
}

async function main() {
  const args = process.argv.slice(2)
  const scriptsToRun = args.length > 0
    ? args.filter(arg => SCRIPTS[arg])
    : Object.keys(SCRIPTS)

  console.log(cyan('═══════════════════════════════════════════════════════'))
  console.log(cyan('  🔍 System Verification Suite'))
  console.log(cyan('═══════════════════════════════════════════════════════'))
  console.log(cyan(`\n  Running ${scriptsToRun.length} verification(s):`))
  for (const s of scriptsToRun) {
    console.log(cyan(`    - ${s}`))
  }
  console.log(cyan('\n═══════════════════════════════════════════════════════\n'))

  const results = {}
  let allPassed = true

  for (const scriptKey of scriptsToRun) {
    const scriptName = SCRIPTS[scriptKey]
    const passed = await runScript(scriptName)
    results[scriptKey] = passed
    if (!passed) {
      allPassed = false
    }
  }

  console.log(cyan('\n═══════════════════════════════════════════════════════'))
  console.log(cyan('  📊 Verification Results'))
  console.log(cyan('═══════════════════════════════════════════════════════\n'))

  for (const [key, passed] of Object.entries(results)) {
    const status = passed ? green('✓ PASS') : red('✗ FAIL')
    console.log(`  ${status}  ${key}`)
  }

  console.log(cyan('\n═══════════════════════════════════════════════════════'))

  if (allPassed) {
    console.log(green('\n✅ ALL VERIFICATIONS PASSED'))
    console.log(cyan('═══════════════════════════════════════════════════════\n'))
    process.exit(0)
  } else {
    console.log(red('\n❌ SOME VERIFICATIONS FAILED'))
    console.log(cyan('═══════════════════════════════════════════════════════\n'))
    process.exit(1)
  }
}

main()

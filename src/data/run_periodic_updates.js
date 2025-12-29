/**
 * Run periodic updates based on the configuration file.
 * This script reads `needUpdatePeriodAPI.config.json` and executes each script listed there.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, 'needUpdatePeriodAPI.config.json');

async function runUpdates() {
  try {
    // Read the configuration file
    const configContent = await fs.readFile(configPath, 'utf-8');
    const scriptsToRun = JSON.parse(configContent);

    if (!Array.isArray(scriptsToRun)) {
      throw new Error('Config file must contain an array of script paths.');
    }

    console.log(`Found ${scriptsToRun.length} scripts to run.`);

    for (const scriptPath of scriptsToRun) {
      console.log(`\n--- Running ${scriptPath} ---`);

      // Resolve absolute path to the script
      // Assuming script paths in config are relative to the project root
      // We need to resolve them relative to the project root.
      // Since __dirname is src/data, and project root is ../../
      const projectRoot = path.resolve(__dirname, '../../');
      const absoluteScriptPath = path.resolve(projectRoot, scriptPath);

      await runScript(absoluteScriptPath);
    }

    console.log('\nAll updates completed successfully.');

  } catch (error) {
    console.error('Error running updates:', error);
    process.exit(1);
  }
}

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    // Spawn a new node process for the script
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit', // Pipe output to parent
      cwd: path.dirname(scriptPath) // Run script in its own directory (optional, but good for relative paths if any remain)
      // Actually, since we fixed fetchNewestItemData.js to use absolute paths, CWD matters less,
      // but keeping it consistent is good.
      // However, if the config paths are relative to root, maybe we should run from root?
      // Let's run from project root to be safe, as usually scripts are run from root.
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`Script ${scriptPath} finished successfully.`);
        resolve();
      } else {
        console.error(`Script ${scriptPath} failed with exit code ${code}.`);
        reject(new Error(`Script failed: ${scriptPath}`));
      }
    });

    child.on('error', (err) => {
      console.error(`Failed to start script ${scriptPath}:`, err);
      reject(err);
    });
  });
}

runUpdates();

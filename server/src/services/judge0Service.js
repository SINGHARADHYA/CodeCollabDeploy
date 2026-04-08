const { exec } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Map frontend language values to local command runners
const LANGUAGE_MAP = {
  javascript: 'javascript',
  python: 'python',
  cpp: 'cpp',
  java: 'java',
};

async function executeCode(sourceCode, language, stdin = '') {
  const fileId = crypto.randomUUID();
  const tmpDir = os.tmpdir();
  
  let sourceFileName, runCmd, compileCmd;
  
  // Decide extension and commands
  if (language === 'javascript') {
    sourceFileName = `${fileId}.js`;
    runCmd = `node ${sourceFileName}`;
  } else if (language === 'python') {
    sourceFileName = `${fileId}.py`;
    runCmd = `python3 ${sourceFileName}`;
  } else if (language === 'cpp') {
    sourceFileName = `${fileId}.cpp`;
    const outFileName = `${fileId}.out`;
    compileCmd = `g++ ${sourceFileName} -o ${outFileName}`;
    runCmd = `./${outFileName}`;
  } else if (language === 'java') {
    // Java needs class name to match file name. We'll find public class name
    const match = sourceCode.match(/public\s+class\s+([A-Za-z0-9_]+)/);
    const className = match ? match[1] : 'Main';
    sourceFileName = `${className}.java`;
    compileCmd = `javac ${sourceFileName}`;
    runCmd = `java ${className}`;
  } else {
    sourceFileName = `${fileId}.txt`;
    runCmd = `cat ${sourceFileName}`;
  }

  const sourcePath = path.join(tmpDir, sourceFileName);
  const stdinPath = path.join(tmpDir, `${fileId}_stdin.txt`);

  try {
    // Write source code and stdin to temp files
    await fs.writeFile(sourcePath, sourceCode);
    if (stdin) {
      await fs.writeFile(stdinPath, stdin);
      runCmd = `${runCmd} < ${fileId}_stdin.txt`; // Run input via stdin
    }

    // Helper to execute commands with timeout
    const runCommand = (cmd) => {
      return new Promise((resolve) => {
        exec(cmd, { cwd: tmpDir, timeout: 5000 }, (error, stdout, stderr) => {
          resolve({ error, stdout, stderr });
        });
      });
    };

    let compile_output = null;
    let statusId = 3; // 3 = Accepted
    let statusDesc = "Accepted";

    // Compilation phase (if needed)
    if (compileCmd) {
      const compileResult = await runCommand(compileCmd);
      if (compileResult.error) {
        return {
          stdout: null,
          stderr: null,
          compile_output: compileResult.stderr || compileResult.stdout,
          status: { id: 6, description: "Compilation Error" },
          time: null,
          memory: null,
        };
      }
    }

    // Execution phase
    const runResult = await runCommand(runCmd);
    let stdout = runResult.stdout;
    let stderr = runResult.stderr;

    if (runResult.error) {
      if (runResult.error.killed) {
        statusId = 13; // Time Limit Exceeded
        statusDesc = "Time Limit Exceeded";
      } else {
        statusId = 11; // Runtime Error
        statusDesc = "Runtime Error";
      }
    }

    return {
      stdout: stdout,
      stderr: stderr,
      compile_output: compile_output,
      status: {
        id: statusId,
        description: statusDesc
      },
      time: null,
      memory: null,
    };
  } catch (error) {
    console.error('Local execution error:', error);
    throw new Error('Failed to execute code locally');
  } finally {
    // Cleanup temporary files
    const cleanupCmd = `rm -f ${sourcePath} ${stdinPath} ${path.join(tmpDir, `${fileId}.out`)} ${language === 'java' ? path.join(tmpDir, '*.class') : ''}`;
    exec(cleanupCmd).unref();
  }
}

module.exports = {
  executeCode,
  LANGUAGE_MAP,
};

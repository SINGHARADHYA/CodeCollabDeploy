const judge0Service = require('../services/judge0Service');

async function runCode(req, res) {
  try {
    const { code, language, stdin } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const result = await judge0Service.executeCode(code, language, stdin);

    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      status: result.status,
      time: result.time,
      memory: result.memory,
    });
  } catch (error) {
    console.error('Code execution error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { runCode };

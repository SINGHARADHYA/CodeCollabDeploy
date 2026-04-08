const openaiService = require('../services/openaiService');

async function debugCode(req, res) {
  try {
    const { code, language, error } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const result = await openaiService.debugCode(code, language, error);

    res.json(result);
  } catch (error) {
    console.error('Debug error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { debugCode };

const db = require('../config/db');

async function saveWorkspace(req, res) {
  try {
    const { name, files, activeFileId, workspaceId } = req.body;
    const userId = req.user.userId;

    if (!name || !files || files.length === 0) {
      return res.status(400).json({ error: 'Workspace must have a name and at least one file.' });
    }

    let workspace;

    if (workspaceId) {
      // Update existing workspace
      const result = await db.query(
        'UPDATE workspaces SET name = $1, files = $2, active_file_id = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *',
        [name, JSON.stringify(files), activeFileId, workspaceId, userId]
      );
      
      if (result.rows.length === 0) return res.status(404).json({ error: 'Workspace not found or unauthorized' });
      workspace = result.rows[0];
    } else {
      // Create new workspace
      const result = await db.query(
        'INSERT INTO workspaces (user_id, name, files, active_file_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, name, JSON.stringify(files), activeFileId]
      );
      workspace = result.rows[0];
    }

    res.json({ message: 'Workspace saved successfully', workspace });
  } catch (error) {
    console.error('Save workspace error:', error);
    res.status(500).json({ error: 'Failed to save workspace' });
  }
}

async function getWorkspaces(req, res) {
  try {
    const result = await db.query(
      'SELECT id, name, files, active_file_id, created_at, updated_at FROM workspaces WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ error: 'Failed to retrieve workspaces' });
  }
}

async function deleteWorkspace(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM workspaces WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Workspace not found' });
    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
}

module.exports = { saveWorkspace, getWorkspaces, deleteWorkspace };

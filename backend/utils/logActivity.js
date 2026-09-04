const ActivityLog = require('../models/ActivityLog');

// Small helper so controllers don't repeat the same 5 lines everywhere.
// Failures here should never break the main request, so we just log to console.
const logActivity = async ({ user, action, module, recordId, description }) => {
  try {
    await ActivityLog.create({ user, action, module, recordId, description });
  } catch (error) {
    console.error('Failed to write activity log:', error.message);
  }
};

module.exports = logActivity;

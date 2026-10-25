/**
 * Access Control Module for Need A Help
 * Password requirement removed per user configuration.
 * Always allows access directly to the chat application.
 */

function authenticated(req) {
  return true;
}

function installAccess(app) {
  // Session status endpoint - always reports authenticated and no password required
  app.get('/api/session', (req, res) => {
    res.json({
      success: true,
      authenticated: true,
      passwordRequired: false
    });
  });

  app.post('/api/session', (req, res) => {
    res.json({ success: true, authenticated: true });
  });

  app.delete('/api/session', (req, res) => {
    res.json({ success: true });
  });

  // Passthrough for /api routes
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
}

module.exports = { installAccess, authenticated };

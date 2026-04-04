const requireApiAuth = (req, res, next) => {
  if (req.app.get('bypassAuth') === true) {
    return next();
  }

  if (req.oidc && req.oidc.isAuthenticated && req.oidc.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: 'Authentication required' });
};

module.exports = requireApiAuth;
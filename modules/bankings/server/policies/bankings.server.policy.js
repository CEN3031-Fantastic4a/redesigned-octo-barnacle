'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Bankings Permissions'/api/bankings-clienttoken'
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/bankings',
      permissions: '*'
    }, {
      resources: '/api/bankings/:bankingId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/bankings',
      permissions: ['get', 'post']
    }, {
      resources: '/api/bankings/:bankingId',
      permissions: ['get']
    }, {
      resources: '/api/bankings-clienttoken',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/bankings',
      permissions: ['get']
    }, {
      resources: '/api/bankings/:bankingId',
      permissions: ['get']
    }, {
      resources: '/api/bankings-clienttoken',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Bankings Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Banking is being processed and the current user created it then allow any manipulation
  if (req.banking && req.user && req.banking.user && req.banking.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};

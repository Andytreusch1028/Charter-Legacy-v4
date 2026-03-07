/**
 * RBAC (Role-Based Access Control) Gatekeeper Configuration
 * 
 * This file serves as the Single Source of Truth for the entire
 * application's access perimeter. Modifying these matrices will 
 * instantly update the security boundaries of both the front-end
 * routers and component visual feature flags.
 */

// 1. Defined System Roles
export const ROLES = {
  UNAUTHENTICATED: 'unauthenticated',
  CUSTOMER: 'customer',
  FULFILLMENT: 'fulfillment',
  AUDITOR: 'auditor',
  EXECUTIVE: 'executive',
};

// 2. The Master Access Matrix
export const RBAC_MATRIX = {
  // Public users (Not logged in)
  [ROLES.UNAUTHENTICATED]: {
    allowedRoutes: ['/', '/staff'],
    components: [] // Public doesn't access any authenticated modules
  },
  
  // Standard Business Owners
  [ROLES.CUSTOMER]: {
    allowedRoutes: ['/', '/app', '/app/*'],
    components: [
      'FoundersBlueprint', 
      'RegisteredAgentConsole', 
      'AnnualReportWizard', 
      'SuccessionSuite'
    ]
  },
  
  // Fulfillment Node Operators
  [ROLES.FULFILLMENT]: {
    allowedRoutes: ['/staff', '/admin/fulfillment'], // They log in at staff, then go to fulfillment
    components: ['RASentry', 'AuditLedgerReadWrite']
  },

  // Third-Party Compliance/Security Auditors
  [ROLES.AUDITOR]: {
    allowedRoutes: ['/staff', '/admin/growth', '/app', '/app/*'], // Restricted growth view, mocked zenith view
    components: ['AuditLedgerReadOnly', 'MockedZenithDashboard']
  },

  // Ultimate Administrators
  [ROLES.EXECUTIVE]: {
    allowedRoutes: ['*'], // Wilcard: Full access everywhere
    components: ['*'] 
  }
};

/**
 * Gatekeeper Utility: Checks if a given role has access to a specific route.
 * @param {string} role - The user's role claim from Supabase (e.g. 'executive')
 * @param {string} path - The current window.location.pathname
 * @returns {boolean} - True if access is permitted, False otherwise
 */
export const canAccessRoute = (role, path) => {
    // Treat invalid or missing roles as unauthenticated public users
    const activeRole = role || ROLES.UNAUTHENTICATED;
    const permissions = RBAC_MATRIX[activeRole];

    if (!permissions) return false;

    // God mode bypass
    if (permissions.allowedRoutes.includes('*')) return true;

    // Check strict matching or partial matching (for trailing slashes and asterisks in config)
    return permissions.allowedRoutes.some(allowedPath => {
        // Exact match (e.g., '/')
        if (allowedPath === path) return true;
        
        // Glob match (e.g., '/app/*') - if allowed is '/app/*' and path is '/app/settings', this passes
        if (allowedPath.endsWith('/*')) {
            const baseRoute = allowedPath.replace('/*', '');
            // If path is precisely the base route, or starts with the base route + slash
            return path === baseRoute || path.startsWith(`${baseRoute}/`);
        }
        
        return false;
    });
};

/**
 * Gatekeeper Utility: Checks if a role is authorized to view/use a specific component or module.
 * @param {string} role - The user's role claim from Supabase.
 * @param {string} componentName - The standard name of the module.
 * @returns {boolean}
 */
export const canAccessComponent = (role, componentName) => {
    const activeRole = role || ROLES.UNAUTHENTICATED;
    const permissions = RBAC_MATRIX[activeRole];

    if (!permissions) return false;
    if (permissions.components.includes('*')) return true;

    return permissions.components.includes(componentName);
};

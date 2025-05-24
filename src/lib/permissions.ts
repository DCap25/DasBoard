import { User } from './supabase';

// Define role hierarchy (higher level includes permissions of lower levels)
export const ROLE_HIERARCHY = {
  admin: 5,
  general_manager: 4,
  sales_manager: 3,
  finance_manager: 2,
  salesperson: 1
};

// Define role-specific actions
export const ROLE_PERMISSIONS = {
  salesperson: [
    'view_own_sales',
    'create_sale',
    'view_own_dealership',
    'view_own_metrics'
  ],
  finance_manager: [
    'view_dealership_sales',
    'view_fni_details',
    'create_fni_detail',
    'view_dealership_metrics'
  ],
  sales_manager: [
    'view_dealership_sales',
    'update_sale_status',
    'create_sale',
    'delete_sale',
    'view_all_salespeople',
    'view_dealership_metrics',
    'create_metric'
  ],
  general_manager: [
    'view_all_dealership_data',
    'update_dealership',
    'view_all_metrics',
    'create_user',
    'update_user'
  ],
  admin: [
    'view_all_data',
    'manage_dealerships',
    'manage_users',
    'manage_roles',
    'manage_system'
  ]
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  
  const userRole = user.role as keyof typeof ROLE_HIERARCHY;
  const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
  
  // Check all roles that the user implicitly has based on hierarchy
  for (const [role, level] of Object.entries(ROLE_HIERARCHY)) {
    if (level <= userRoleLevel) {
      const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
      if (rolePermissions.includes(permission)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if a user has access to a specific entity based on dealership constraints
 */
export function hasAccessToEntity(
  user: User | null, 
  entityDealershipId: string | null,
  entityUserId?: string | null,
): boolean {
  if (!user) return false;
  
  // Admin can access everything
  if (user.role === 'admin') return true;
  
  // Users can always access their own data
  if (entityUserId && entityUserId === user.id) return true;
  
  // General manager and below are constrained by dealership
  if (user.dealership_id && entityDealershipId) {
    return user.dealership_id === entityDealershipId;
  }
  
  return false;
}

/**
 * Filter a list of entities based on user permissions
 */
export function filterEntitiesByAccess<T extends { dealership_id?: string | null, user_id?: string | null }>(
  user: User | null,
  entities: T[]
): T[] {
  if (!user) return [];
  
  // Admin can see everything
  if (user.role === 'admin') return entities;
  
  return entities.filter(entity => 
    hasAccessToEntity(user, entity.dealership_id || null, entity.user_id || null)
  );
}

/**
 * Get available actions for a user on a specific page
 */
export function getAvailableActions(user: User | null, page: string): string[] {
  if (!user) return [];
  
  const actions: string[] = [];
  
  switch (page) {
    case 'sales':
      if (hasPermission(user, 'create_sale')) actions.push('create');
      if (hasPermission(user, 'update_sale_status')) actions.push('update');
      if (hasPermission(user, 'delete_sale')) actions.push('delete');
      break;
      
    case 'metrics':
      if (hasPermission(user, 'create_metric')) actions.push('create');
      break;
      
    case 'fni_details':
      if (hasPermission(user, 'create_fni_detail')) actions.push('create');
      break;
      
    case 'users':
      if (hasPermission(user, 'create_user')) actions.push('create');
      if (hasPermission(user, 'update_user')) actions.push('update');
      break;
      
    case 'dealerships':
      if (hasPermission(user, 'manage_dealerships')) {
        actions.push('create', 'update', 'delete');
      }
      break;
  }
  
  return actions;
} 
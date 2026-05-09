import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, rolesApi, companiesApi } from '../lib/api';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName?: string;
  companyId?: string;
  companyName?: string;
  status: string;
  permissions?: string[];
  isCustomer?: boolean;
}

interface UserContextType {
  currentUser: User | null;
  currentRole: Role | null;
  hasPermission: (permission: string) => boolean;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isCompanyRestricted: boolean;
  userCompany: string | null;
  userCompanyName: string | null;
  isCustomer: boolean;
  isKiosk: boolean;
  isCashier: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompanyRestricted, setIsCompanyRestricted] = useState(false);
  const [userCompany, setUserCompany] = useState<string | null>(null);
  const [userCompanyName, setUserCompanyName] = useState<string | null>(null);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isKiosk, setIsKiosk] = useState(false);
  const [isCashier, setIsCashier] = useState(false);

  // On mount: check for existing token and restore session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('openpark_token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Validate token with server
        const response = await authApi.me();
        if (response.success && response.data) {
          const userData = response.data;
          setCurrentUser(userData);
          localStorage.setItem('openpark_current_user', JSON.stringify(userData));

          // Determine role type
          const roleName = userData.roleName || '';
          setIsCustomer(roleName === 'Customer' || userData.isCustomer === true);
          setIsKiosk(roleName === 'Kiosk');
          setIsCashier(roleName === 'Cashier');

          // Set role from permissions in user data
          if (userData.permissions) {
            setCurrentRole({
              id: userData.roleId,
              name: roleName,
              description: '',
              permissions: userData.permissions,
            });
          } else if (userData.roleId) {
            try {
              const roleResponse = await rolesApi.getById(userData.roleId);
              if (roleResponse.success) {
                setCurrentRole(roleResponse.data);
              }
            } catch (e) {
              console.warn('Could not load role details');
            }
          }

          // Company restriction
          if (userData.companyId) {
            setIsCompanyRestricted(true);
            setUserCompany(userData.companyId);
            setUserCompanyName(userData.companyName || null);
          }
        } else {
          // Invalid token
          localStorage.removeItem('openpark_token');
          localStorage.removeItem('openpark_current_user');
        }
      } catch (error) {
        console.warn('Session restore failed, clearing auth state');
        localStorage.removeItem('openpark_token');
        localStorage.removeItem('openpark_current_user');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!currentRole) return false;
    return currentRole.permissions.includes(permission);
  };

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('openpark_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('openpark_current_user');
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login(email, password);

      if (!response.success) {
        return { success: false, error: response.error || 'Login failed' };
      }

      const { token, user } = response.data;

      // Store JWT token
      localStorage.setItem('openpark_token', token);
      localStorage.setItem('openpark_current_user', JSON.stringify(user));

      setCurrentUser(user);

      // Set role info
      const roleName = user.roleName || '';
      const isCustomerUser = roleName === 'Customer' || user.isCustomer === true;
      const isKioskUser = roleName === 'Kiosk';
      const isCashierUser = roleName === 'Cashier';

      setIsCustomer(isCustomerUser);
      setIsKiosk(isKioskUser);
      setIsCashier(isCashierUser);

      // Set role with permissions from token response
      if (user.permissions) {
        setCurrentRole({
          id: user.roleId,
          name: roleName,
          description: '',
          permissions: user.permissions,
        });
      }

      // Company restriction
      if (user.companyId) {
        setIsCompanyRestricted(true);
        setUserCompany(user.companyId);
        setUserCompanyName(user.companyName || null);
      } else {
        setIsCompanyRestricted(false);
        setUserCompany(null);
        setUserCompanyName(null);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setIsCustomer(false);
    setIsKiosk(false);
    setIsCashier(false);
    setIsCompanyRestricted(false);
    setUserCompany(null);
    setUserCompanyName(null);
    localStorage.removeItem('openpark_token');
    localStorage.removeItem('openpark_current_user');
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        currentRole,
        hasPermission,
        setCurrentUser: handleSetCurrentUser,
        login,
        logout,
        loading,
        isAuthenticated: !!currentUser,
        isCompanyRestricted,
        userCompany,
        userCompanyName,
        isCustomer,
        isKiosk,
        isCashier,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
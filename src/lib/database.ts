import { BookingRequest, User, Notification, AuthUser } from '@/types';
import { Facility } from '@/types/facility';

// Local storage keys
const STORAGE_KEYS = {
  BOOKINGS: 'nrc9_bookings',
  USERS: 'nrc9_users',
  NOTIFICATIONS: 'nrc9_notifications',
  FACILITIES: 'nrc9_facilities',
  CURRENT_USER: 'nrc9_current_user',
} as const;

// Initialize default data
const initializeDefaultData = () => {
  // Default users
  const defaultUsers: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@nrc9.com',
      role: 'admin',
      department: 'Administration',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: '2',
      name: 'Help Desk Staff',
      email: 'helpdesk@nrc9.com',
      role: 'helpdesk',
      department: 'Reception',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: '3',
      name: 'Soft Service Manager',
      email: 'manager@nrc9.com',
      role: 'manager',
      department: 'Recreation Department',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: '4',
      name: 'John Resident',
      email: 'john@resident.com',
      role: 'resident',
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ];

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.FACILITIES)) {
    localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify([]));
  }
};

// Generic storage functions
const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from storage key ${key}:`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to storage key ${key}:`, error);
  }
};

// Booking operations
export const bookingDB = {
  getAll: (): BookingRequest[] => {
    return getFromStorage<BookingRequest>(STORAGE_KEYS.BOOKINGS);
  },

  getById: (id: string): BookingRequest | null => {
    const bookings = getFromStorage<BookingRequest>(STORAGE_KEYS.BOOKINGS);
    return bookings.find(booking => booking.id === id) || null;
  },

  create: (booking: Omit<BookingRequest, 'id' | 'createdAt' | 'updatedAt'>): BookingRequest => {
    const bookings = getFromStorage<BookingRequest>(STORAGE_KEYS.BOOKINGS);
    const newBooking: BookingRequest = {
      ...booking,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    bookings.push(newBooking);
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);
    return newBooking;
  },

  update: (id: string, updates: Partial<BookingRequest>): BookingRequest | null => {
    const bookings = getFromStorage<BookingRequest>(STORAGE_KEYS.BOOKINGS);
    const index = bookings.findIndex(booking => booking.id === id);
    if (index === -1) return null;

    bookings[index] = {
      ...bookings[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);
    return bookings[index];
  },

  delete: (id: string): boolean => {
    const bookings = getFromStorage<BookingRequest>(STORAGE_KEYS.BOOKINGS);
    const filteredBookings = bookings.filter(booking => booking.id !== id);
    if (filteredBookings.length === bookings.length) return false;
    saveToStorage(STORAGE_KEYS.BOOKINGS, filteredBookings);
    return true;
  },

  getByStatus: (status: BookingRequest['status']): BookingRequest[] => {
    const bookings = getFromStorage<BookingRequest>(STORAGE_KEYS.BOOKINGS);
    return bookings.filter(booking => booking.status === status);
  },

  getByRequester: (email: string): BookingRequest[] => {
    const bookings = getFromStorage<BookingRequest>(STORAGE_KEYS.BOOKINGS);
    return bookings.filter(booking => booking.requesterInfo.email === email);
  },
};

// User operations
export const userDB = {
  getAll: (): User[] => {
    return getFromStorage<User>(STORAGE_KEYS.USERS);
  },

  getById: (id: string): User | null => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    return users.find(user => user.id === id) || null;
  },

  getByEmail: (email: string): User | null => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    return users.find(user => user.email === email) || null;
  },

  create: (user: Omit<User, 'id' | 'createdAt'>): User => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  update: (id: string, updates: Partial<User>): User | null => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    saveToStorage(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  delete: (id: string): boolean => {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const filteredUsers = users.filter(user => user.id !== id);
    if (filteredUsers.length === users.length) return false;
    saveToStorage(STORAGE_KEYS.USERS, filteredUsers);
    return true;
  },
};

// Notification operations
export const notificationDB = {
  getAll: (): Notification[] => {
    return getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  },

  getByUserId: (userId: string): Notification[] => {
    const notifications = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    return notifications.filter(notification => notification.userId === userId);
  },

  create: (notification: Omit<Notification, 'id' | 'createdAt'>): Notification => {
    const notifications = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    notifications.push(newNotification);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  },

  markAsRead: (id: string): boolean => {
    const notifications = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const index = notifications.findIndex(notification => notification.id === id);
    if (index === -1) return false;

    notifications[index].read = true;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return true;
  },

  delete: (id: string): boolean => {
    const notifications = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const filteredNotifications = notifications.filter(notification => notification.id !== id);
    if (filteredNotifications.length === notifications.length) return false;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, filteredNotifications);
    return true;
  },
};

// Facility operations
export const facilityDB = {
  getAll: (): Facility[] => {
    return getFromStorage<Facility>(STORAGE_KEYS.FACILITIES);
  },

  getById: (id: string): Facility | null => {
    const facilities = getFromStorage<Facility>(STORAGE_KEYS.FACILITIES);
    return facilities.find(facility => facility.id === id) || null;
  },

  create: (facility: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>): Facility => {
    const facilities = getFromStorage<Facility>(STORAGE_KEYS.FACILITIES);
    const newFacility: Facility = {
      ...facility,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    facilities.push(newFacility);
    saveToStorage(STORAGE_KEYS.FACILITIES, facilities);
    return newFacility;
  },

  update: (id: string, updates: Partial<Facility>): Facility | null => {
    const facilities = getFromStorage<Facility>(STORAGE_KEYS.FACILITIES);
    const index = facilities.findIndex(facility => facility.id === id);
    if (index === -1) return null;

    facilities[index] = {
      ...facilities[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.FACILITIES, facilities);
    return facilities[index];
  },

  delete: (id: string): boolean => {
    const facilities = getFromStorage<Facility>(STORAGE_KEYS.FACILITIES);
    const filteredFacilities = facilities.filter(facility => facility.id !== id);
    if (filteredFacilities.length === facilities.length) return false;
    saveToStorage(STORAGE_KEYS.FACILITIES, filteredFacilities);
    return true;
  },
};

// Authentication operations
export const authDB = {
  getCurrentUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error reading current user:', error);
      return null;
    }
  },

  setCurrentUser: (user: AuthUser): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  },

  logout: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  authenticate: (email: string, password: string): AuthUser | null => {
    // Simple authentication - in production, this would be properly secured
    const user = userDB.getByEmail(email);
    if (!user || !user.isActive) return null;

    // For demo purposes, accept any password for existing users
    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    authDB.setCurrentUser(authUser);
    return authUser;
  },
};

// Initialize data on first load
if (typeof window !== 'undefined') {
  initializeDefaultData();
}

export { initializeDefaultData };

export interface RequesterInfo {
  name: string;
  company: string;
  designation: string;
  mobile: string;
  email: string;
  residenceOfNRC9: boolean;
  unitNo: string;
  unitLocation: string;
  requestInitiatedDate: string;
}

export interface EventDetails {
  venueRequested: string;
  event: string;
  eventScheduleStartDate: string;
  eventEndDate: string;
  eventStartTime: string;
  eventEndTime: string;
  numberOfGuests: number;
  avSystem: {
    required: boolean;
    details?: string;
  };
  fbServices: {
    required: boolean;
    details?: string;
  };
  chargeable: {
    required: boolean;
    amount?: number;
  };
  invoiceTo: string;
  remarks: string;
}

export interface ApprovalStep {
  id: string;
  handledBy: string;
  signature: string;
  approved: boolean;
  remarks?: string;
  timestamp: string;
  role: UserRole;
}

export interface BookingRequest {
  id: string;
  requesterInfo: RequesterInfo;
  eventDetails: EventDetails;
  status: 'pending' | 'routed' | 'approved' | 'rejected';
  approvalHistory: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
  submissionMethod: 'walk-in' | 'email' | 'qr-code';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  relatedRequestId?: string;
}

export type UserRole = 'resident' | 'helpdesk' | 'manager' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  status?: BookingRequest['status'] | '';
  venue?: string;
  requester?: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  monthlyRequests: number;
}

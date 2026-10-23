import type { JobAssignmentWithPost } from '../entities/jobAssignment/types';
import type { NearbyJobPost } from '../entities/jobPost/types';
import type { User, WaiterProfile } from '../entities/user/types';

/**
 * Fixtures that reproduce the screens in the design. They exist so the UI can be
 * built and reviewed before the API is up; `apiConfig.useMocks` decides whether
 * anything reads them.
 */

function at(dayOffset: number, hour: number, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const mockUser: User = {
  id: 'b2f1c9d0-0000-7000-8000-000000000001',
  fullName: 'Lucas Andrade',
  email: 'lucas@serveup.app',
  phone: '+55 11 90000-0000',
  profilePhotoPath: null,
  status: 'Active',
  roles: ['Waiter'],
};

export const mockWaiterProfile: WaiterProfile = {
  userId: mockUser.id,
  bio: 'Garçom com experiência em eventos sociais e corporativos.',
  experienceYears: 4,
  hourlyRate: 40,
  averageRating: 4.9,
  ratingsCount: 27,
  isAvailable: true,
  searchRadiusMeters: 10_000,
  completedServices: 12,
  homeAddress: { city: 'São Paulo', state: 'SP', country: 'BR' },
  homeLocation: null,
  pixKey: null,
  pixKeyType: null,
  canReceivePayouts: false,
};

export const mockNearbyJobPosts: NearbyJobPost[] = [
  {
    id: 'job-0001',
    companyId: 'company-0001',
    companyName: 'Eventos Flores',
    establishmentId: null,
    establishmentName: null,
    serviceKind: 'PrivateEvent',
    providerKind: 'Waiter',
    title: 'Evento Particular',
    description:
      'Evento de aniversário para 50 pessoas. Serviço de coquetel e jantar. Traje social (black).',
    shiftStart: at(1, 19),
    shiftEnd: at(1, 23),
    slots: 2,
    slotsFilled: 0,
    payAmount: 160,
    payType: 'PerShift',
    dressCode: 'Social (black)',
    requirements: null,
    address: {
      street: 'Rua das Flores',
      number: '123',
      district: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
    },
    location: { latitude: -23.5614, longitude: -46.6559 },
    status: 'Published',
    distanceMeters: 1200,
    hasApplied: false,
  },
  {
    id: 'job-0002',
    companyId: 'company-0002',
    companyName: 'Bar Paulista',
    establishmentId: 'est-0002',
    establishmentName: 'Bar Paulista',
    serviceKind: 'Restaurant',
    providerKind: 'Bartender',
    title: 'Restaurante / Bar',
    description: 'Reforço na equipe para noite de alto movimento.',
    shiftStart: at(0, 18),
    shiftEnd: at(1, 0),
    slots: 1,
    slotsFilled: 0,
    payAmount: 200,
    payType: 'PerShift',
    dressCode: null,
    requirements: null,
    address: {
      street: 'Av. Paulista',
      number: '1000',
      district: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
    },
    location: { latitude: -23.5652, longitude: -46.6521 },
    status: 'Published',
    distanceMeters: 2800,
    hasApplied: false,
  },
  {
    id: 'job-0003',
    companyId: 'company-0003',
    companyName: 'Faria Corp',
    establishmentId: 'est-0003',
    establishmentName: 'Centro de Convenções',
    serviceKind: 'Corporate',
    providerKind: 'PantryAttendant',
    title: 'Evento Corporativo',
    description: 'Coffee break e almoço para congresso.',
    shiftStart: at(1, 12),
    shiftEnd: at(1, 18),
    slots: 3,
    slotsFilled: 1,
    payAmount: 280,
    payType: 'PerShift',
    dressCode: null,
    requirements: null,
    address: {
      street: 'Rua Faria Lima',
      number: '350',
      district: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
    },
    location: { latitude: -23.5747, longitude: -46.6889 },
    status: 'Published',
    distanceMeters: 3400,
    hasApplied: false,
  },
  {
    id: 'job-0004',
    companyId: 'company-0004',
    companyName: 'Casa Pinheiros',
    establishmentId: null,
    establishmentName: null,
    serviceKind: 'PrivateEvent',
    providerKind: 'KitchenAssistant',
    title: 'Casamento',
    description: 'Recepção de casamento com serviço à francesa.',
    shiftStart: at(8, 17),
    shiftEnd: at(9, 1),
    slots: 2,
    slotsFilled: 0,
    payAmount: 320,
    payType: 'PerShift',
    dressCode: 'Social',
    requirements: 'Experiência com serviço à francesa',
    address: {
      street: 'Rua dos Pinheiros',
      number: '78',
      district: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
    },
    location: { latitude: -23.5629, longitude: -46.6944 },
    status: 'Published',
    distanceMeters: 4100,
    hasApplied: false,
  },
];

function toAssignment(post: NearbyJobPost, status: JobAssignmentWithPost['status']): JobAssignmentWithPost {
  return {
    id: `assignment-${post.id}`,
    jobPostId: post.id,
    jobApplicationId: `application-${post.id}`,
    waiterUserId: mockUser.id,
    status,
    checkInAt: null,
    checkOutAt: null,
    completedAt: null,
    payAmount: post.payAmount,
    checkInDistanceMeters: null,
    checkOutDistanceMeters: null,
    contestWindowEndsAt: null,
    jobPost: post,
  };
}

export const mockUpcomingAssignments: JobAssignmentWithPost[] = [
  toAssignment(mockNearbyJobPosts[0], 'Confirmed'),
  toAssignment(mockNearbyJobPosts[1], 'Confirmed'),
  toAssignment(mockNearbyJobPosts[3], 'Confirmed'),
];

export const mockHistoryAssignments: JobAssignmentWithPost[] = [
  { ...toAssignment(mockNearbyJobPosts[2], 'Completed'), completedAt: at(-6, 18) },
];

export const mockMonthEarnings = 1240;

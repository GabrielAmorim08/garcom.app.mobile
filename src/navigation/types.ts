import type { NavigatorScreenParams } from '@react-navigation/native';
import type { JobApplicant } from '../entities/jobApplication/types';

export type CompanyTabParamList = {
  CompanyHome: undefined;
  CompanyServices: undefined;
  Messages: undefined;
  CompanyProfile: undefined;
};

export type WaiterTabParamList = {
  WaiterHome: undefined;
  NearbyServices: undefined;
  Messages: undefined;
  WaiterProfile: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: { role?: 'Waiter' | 'CompanyOwner' } | undefined;
  EmailVerification: undefined;
  ProfileDetails: undefined;
  Notifications: undefined;

  CompanyTabs: NavigatorScreenParams<CompanyTabParamList>;
  NewRequestStepOne: undefined;
  NewRequestStepTwo: undefined;
  NewRequestStepThree: undefined;
  RequestSent: { jobPostId: string };
  CompanyServiceDetail: { jobPostId: string };
  CandidateProfile: { jobPostId: string; applicant: JobApplicant };
  MemberLookup: { jobPostId?: string } | undefined;
  ChatConversation: { conversationId: string; title: string; context: string };

  WaiterTabs: NavigatorScreenParams<WaiterTabParamList>;
  ServiceDetail: { jobPostId: string };
  ServiceConfirmed: { jobPostId: string };
  MyServices: { tab?: 'upcoming' | 'applications' | 'history' } | undefined;
  EarningsDashboard: undefined;
  AssignmentDetail: { assignmentId: string };
  WaiterProfileEdit: undefined;
};

/** Makes useNavigation() typed everywhere without passing generics at each call site. */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

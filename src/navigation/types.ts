import type { NavigatorScreenParams } from '@react-navigation/native';

export type CompanyTabParamList = {
  CompanyHome: undefined;
  CompanyServices: undefined;
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

  CompanyTabs: NavigatorScreenParams<CompanyTabParamList>;
  NewRequestStepOne: undefined;
  NewRequestStepTwo: undefined;
  NewRequestStepThree: undefined;
  RequestSent: { jobPostId: string };

  WaiterTabs: NavigatorScreenParams<WaiterTabParamList>;
  ServiceDetail: { jobPostId: string };
  ServiceConfirmed: { jobPostId: string };
  MyServices: undefined;
};

/** Makes useNavigation() typed everywhere without passing generics at each call site. */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

import type { TranslationSchema } from './pt-BR';

/** English mirror of the pt-BR schema. The type keeps both files in sync. */
export const en: TranslationSchema = {
  common: {
    appName: 'ServeUp',
    tagline: 'People who serve good experiences',
    continue: 'Continue',
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    close: 'Close',
    next: 'Next',
    optional: 'optional',
    loading: 'Loading...',
    retry: 'Try again',
    seeDetails: 'See details',
    filter: 'Filter',
    map: 'Map',
    list: 'List',
    today: 'Today',
    tomorrow: 'Tomorrow',
    stepOf: '{{current}} of {{total}}',
    distanceKm: '{{value}} km',
    distanceFromYou: '{{value}} km from you',
    waiterCount_one: '{{count}} waiter',
    waiterCount_other: '{{count}} waiters',
    hoursShort: '{{count}}h',
  },

  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'No connection. Check your internet.',
    unauthorized: 'Your session expired. Please sign in again.',
    notFound: "We couldn't find what you are looking for.",
    required: 'Required field',
    invalidEmail: 'Invalid e-mail',
    invalidDate: 'Invalid date',
    endBeforeStart: 'End time must be after the start time',
  },

  tabs: {
    home: 'Home',
    services: 'Services',
    messages: 'Messages',
    profile: 'Profile',
  },

  auth: {
    signIn: 'Sign in',
    signInTitle: 'Sign in to your account',
    signInSubtitle: 'Access nearby jobs or publish services for your venue.',
    signOut: 'Sign out',
    email: 'E-mail',
    fullName: 'Full name',
    fullNamePlaceholder: 'Your name',
    phone: 'Phone',
    password: 'Password',
    passwordMin: 'Password must have at least 8 characters.',
    forgotPassword: 'Forgot my password',
    createAccount: 'Create account',
    createWaiterAccount: 'Create waiter account',
    createCompanyAccount: 'Create company account',
    hasAccount: 'I already have an account',
    noAccount: 'Create an account',
    signUpTitle: 'Create your account',
    signUpSubtitle: 'Choose your profile and start using ServeUp.',
    companySectionTitle: 'Company details',
    companySectionSubtitle: 'This information will be used to publish jobs and receive applicants.',
    companyLegalName: 'Legal name',
    companyLegalNamePlaceholder: 'Registered company name',
    companyTradeName: 'Trade name',
    companyTradeNamePlaceholder: 'Public-facing company name',
    companyTaxId: 'CNPJ',
    companyTaxIdInvalid: 'Enter a valid CNPJ.',
    companyEmail: 'Company e-mail',
    companyPhone: 'Company phone',
    emailVerificationTitle: 'Verify your e-mail',
    emailVerificationSubtitle: 'We sent a code to {{email}}. Enter it to unlock your account.',
    emailVerificationCode: 'Verification code',
    emailVerificationCodeInvalid: 'Enter the 6-digit code.',
    emailVerificationConfirm: 'Verify e-mail',
    emailVerificationResend: 'Resend code',
    emailVerificationSent: 'We sent a new code to your e-mail.',
    useAnotherAccount: 'Use another account',
    iAmACompany: "I'm a company",
    iAmAWaiter: "I'm a waiter",
  },

  company: {
    home: {
      heroTitle: 'Professional waiters for your event',
      heroSubtitle: 'Request in a few steps and count on qualified professionals.',
      requestWaiter: 'Request a waiter',
      myServices: 'My services',
    },
  },

  serviceRequest: {
    newRequest: 'New request',

    step1: {
      question: 'What kind of service?',
      types: {
        privateEvent: { label: 'Private event', hint: 'Birthdays, weddings, gatherings, etc.' },
        restaurant: { label: 'Restaurant / Bar', hint: 'Extra hands for the team' },
        corporate: { label: 'Corporate', hint: 'Company events, conferences, etc.' },
        other: { label: 'Other', hint: 'Describe what you need' },
      },
    },

    step2: {
      question: 'When and where?',
      date: 'Date',
      time: 'Time',
      timeRange: '{{start}} to {{end}}',
      address: 'Address',
      useMyLocation: 'Use my location',
      addressPlaceholder: 'Street, number, district',
    },

    step3: {
      title: 'Service details',
      waiterQuantity: 'How many waiters?',
      notes: 'Notes',
      notesPlaceholder: 'E.g. type of event, desired profile, dress code, etc.',
      estimatedValue: 'Estimated value',
      estimatedRange: '{{min}} - {{max}}',
      estimateDisclaimer: 'The final amount may vary with duration and service details.',
      submit: 'Request now',
    },

    sent: {
      title: 'Request sent successfully!',
      message: 'Waiters nearby will soon be able to see and apply for your service.',
      track: 'Track request',
      backHome: 'Back to home',
    },

    status: {
      draft: 'Draft',
      published: 'Published',
      filled: 'Filled',
      cancelled: 'Cancelled',
      completed: 'Completed',
    },
  },

  waiter: {
    home: {
      greeting: 'Hi, {{name}}!',
      subtitle: 'Ready for your next service?',
      servicesDone: 'Services completed',
      averageRating: 'Average rating',
    },
    nearby: {
      title: 'Services nearby',
      empty: 'No services near you right now.',
      emptyHint: 'Increase your search radius in your profile.',
    },
    detail: {
      waitersNeeded_one: '{{count}} waiter needed',
      waitersNeeded_other: '{{count}} waiters needed',
      perWaiter: '({{value}} per waiter)',
      description: 'Description',
      talkToClient: 'Talk to the client',
      talkToClientHint: 'Ask questions and align the service details.',
      apply: 'I want this service',
      applyHint: "You'll be notified if you are selected.",
      alreadyApplied: 'Application sent',
    },
    confirmed: {
      title: 'Congratulations!',
      subtitle: 'You have been selected!',
      chat: 'Chat now',
    },
    myServices: {
      title: 'My services',
      upcoming: 'Upcoming',
      history: 'History',
      monthEarnings: 'Earnings this month',
      emptyUpcoming: "You don't have scheduled services yet.",
      emptyHistory: 'Your history will show up here.',
    },
  },

  assignment: {
    status: {
      confirmed: 'Confirmed',
      checkedIn: 'In progress',
      checkedOut: 'Finished',
      noShow: 'No show',
      cancelled: 'Cancelled',
      completed: 'Completed',
    },
  },

  rating: {
    title: 'How was the service?',
    commentPlaceholder: 'Tell us how it went (optional)',
    submit: 'Submit rating',
  },
};

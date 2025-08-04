export type Language = 'en' | 'es' | 'fr' | 'de' | 'cs' | 'it' | 'pl' | 'pt';

export interface Translations {
  // Navigation
  nav: {
    home: string;
    screenshots: string;
    pricing: string;
    about: string;
    login: string;
    signup: string;
    legal: string;
  };

  // Homepage sections
  home: {
    title: string;
    subtitle: string;
    startTrial: string;
    viewScreenshots: string;
    mission: string;
    features: {
      title: string;
      subtitle: string;
    };
    pricing: {
      title: string;
      subtitle: string;
    };
    cta: {
      title: string;
      subtitle: string;
    };
  };

  // Features
  features: {
    finance: {
      title: string;
      desc: string;
    };
    sales: {
      title: string;
      desc: string;
    };
    manager: {
      title: string;
      desc: string;
    };
    info: {
      title: string;
      desc: string;
    };
    scheduler: {
      title: string;
      desc: string;
    };
    calculator: {
      title: string;
      desc: string;
    };
  };

  // Screenshots page
  screenshots: {
    title: string;
    subtitle: string;
    finance: {
      title: string;
      desc: string;
    };
    sales: {
      title: string;
      desc: string;
    };
    manager: {
      title: string;
      desc: string;
    };
    gm: {
      title: string;
      desc: string;
    };
  };

  // Pricing page
  pricing: {
    title: string;
    subtitle: string;
    finance: string;
    dealership: string;
    group: string;
    freeTime: string;
    getStarted: string;
    startTrial: string;
    popular: string;
    discountPopup: {
      specialSummerSavings: string;
      yourDiscountCode: string;
      tenPercentOff: string;
      firstThreeMonths: string;
      enterEmailPrompt: string;
      emailPlaceholder: string;
      getDiscountCode: string;
      maybeWater: string;
      thankYouMessage: string;
      discountCodeLabel: string;
      copied: string;
      copy: string;
      claimOffer: string;
      useLater: string;
      validityNotice: string;
      emailRequired: string;
      validEmailRequired: string;
    };
  };

  // About page
  about: {
    title: string;
    subtitle: string;
    founderVision: {
      title: string;
      paragraph1: string;
      paragraph2: string;
      paragraph3: string;
    };
    team: {
      title: string;
      members: {
        tyler: {
          name: string;
          role: string;
          bio: string;
        };
        sarah: {
          name: string;
          role: string;
          bio: string;
        };
        claude: {
          name: string;
          role: string;
          bio: string;
        };
        annie: {
          name: string;
          role: string;
          bio: string;
        };
      };
    };
    values: {
      title: string;
      customerFocused: {
        title: string;
        description: string;
      };
      dataDriven: {
        title: string;
        description: string;
      };
      continuousImprovement: {
        title: string;
        description: string;
      };
    };
    contact: {
      title: string;
      subtitle: string;
      email: string;
      phone: string;
    };
  };

  // Signup pages
  signup: {
    title: string;
    subtitle: string;
    selectLanguage: string;
    dealerGroup: string;
    dealership: string;
    financeManager: string;
    form: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
      dealershipName: string;
      role: string;
      phone: string;
      submit: string;
      alreadyHave: string;
      signIn: string;
      terms: string;
    };
    dealershipSignup: {
      getStartedToday: string;
      createAccountConfigure: string;
      organizationInfo: string;
      organizationName: string;
      organizationNamePlaceholder: string;
      businessAddress: string;
      businessAddressPlaceholder: string;
      city: string;
      cityPlaceholder: string;
      state: string;
      statePlaceholder: string;
      zipCode: string;
      zipCodePlaceholder: string;
      adminContactInfo: string;
      adminName: string;
      adminNamePlaceholder: string;
      emailAddress: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      confirmPassword: string;
      confirmPasswordPlaceholder: string;
      createAccountButton: string;
      configureAfterSignup: string;
      useDiscountCode: string;
      pricing: {
        dealershipManagement: string;
        buildCustomPackage: string;
        dynamicPackagePricing: string;
        basePricePerDealership: string;
        includesDashboardAccess: string;
        standardTeamAccess: string;
        upToSalesPeople: string;
        upToFinanceManagers: string;
        upToSalesManagers: string;
        oneGeneralManager: string;
        coreFeatures: string;
        realTimeDealTracking: string;
        performanceAnalytics: string;
        scheduleManagement: string;
        goalTracking: string;
        whatsIncluded: string;
        completeDashboardSuite: string;
        realTimeDealTrackingAnalytics: string;
        multiLocationManagement: string;
        flexibleAdminStructure: string;
        scheduleGoalManagement: string;
        performanceReporting: string;
        volumeDiscountsAvailable: string;
        specialBundleOffers: string;
        sellMoreBundle: string;
        sellMoreBundleDesc: string;
        sellMostBundle: string;
        sellMostBundleDesc: string;
        aLaCarteAddons: string;
        additionalSalesPerson: string;
        additionalFinanceManager: string;
        additionalSalesManager: string;
        financeDirector: string;
        generalSalesManager: string;
        areaVicePresident: string;
        dashboardPreview: string;
        salesPersonDashboard: string;
        financeManagerDashboard: string;
        salesManagerDashboard: string;
        financeDirectorDashboard: string;
        generalManagerDashboard: string;
        areaVicePresidentDashboard: string;
      };
      validation: {
        organizationNameRequired: string;
        addressRequired: string;
        cityRequired: string;
        stateRequired: string;
        zipCodeRequired: string;
        adminNameRequired: string;
        emailRequired: string;
        validEmailRequired: string;
        passwordRequired: string;
        passwordMinLength: string;
        passwordsDoNotMatch: string;
      };
    };
  };

  // Common UI elements
  common: {
    language: string;
    login: string;
    signUp: string;
    loading: string;
    save: string;
    cancel: string;
    continue: string;
    back: string;
    next: string;
    submit: string;
    close: string;
  };

  // Footer
  footer: {
    tagline: string;
    industry: string;
    product: string;
    legal: string;
    contact: string;
    support: string;
    copyright: string;
    terms: string;
    privacy: string;
    subscription: string;
  };

  // Legal
  legal: {
    terms: {
      title: string;
    };
    privacy: {
      title: string;
    };
    subscription: {
      title: string;
    };
  };
}

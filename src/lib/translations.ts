export type Language = 'en' | 'es' | 'fr' | 'de' | 'cs' | 'it' | 'pl' | 'pt' | 'nl' | 'gr';

interface Translations {
  nav: {
    home: string;
    screenshots: string;
    pricing: string;
    about: string;
    login: string;
    signup: string;
    legal: string;
  };
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
    viewDetails: string;
    tiers: {
      finance: {
        name: string;
        price: string;
        originalPrice: string;
        description: string;
      };
      dealership: {
        name: string;
        price: string;
        description: string;
      };
      group: {
        name: string;
        price: string;
        description: string;
      };
    };
  };
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
  signup: {
    title: string;
    subtitle: string;
    selectLanguage: string;
    dealerGroup: string;
    dealership: string;
    financeManager: string;
    simple: {
      title: string;
      subtitle: string;
      description: string;
      submitButton: string;
      whyTitle: string;
      whyBenefits: string[];
    };
    form: {
      firstName: string;
      lastName: string;
      fullName: string;
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
      agreePrefix: string;
      emailNote: string;
    };
  };
  dashboard: {
    singleFinance: {
      title: string;
      kpi: {
        fiGross: string;
        dealsProcessed: string;
        dealTypes: string;
        productsPerDeal: string;
        pvr: string;
        pvrFull: string;
      };
      dealTypes: {
        finance: string;
        cash: string;
        lease: string;
      };
      productMix: {
        title: string;
        product: string;
        avgProfit: string;
        penetration: string;
        extendedWarranty: string;
        gapInsurance: string;
        paintProtection: string;
        tireWheel: string;
        ppm: string;
        theft: string;
        bundled: string;
        other: string;
      };
      payCalculator: {
        title: string;
        grossProfit: string;
        payPlan: string;
        estimatedPay: string;
        baseAmount: string;
        bonusAmount: string;
        totalPay: string;
      };
      dealsLog: {
        title: string;
        refresh: string;
        viewAll: string;
        number: string;
        lastName: string;
        date: string;
        gross: string;
        products: string;
        status: string;
      };
      timePeriod: {
        thisMonth: string;
        lastMonth: string;
        lastQuarter: string;
        ytd: string;
        lastYear: string;
        custom: string;
      };
      status: {
        pending: string;
        funded: string;
        unwound: string;
        deadDeal: string;
      };
    };
    deals: {
      title: string;
      backToDashboard: string;
      note: string;
      searchPlaceholder: string;
      allStatuses: string;
      tableHeaders: {
        number: string;
        lastName: string;
        dealNumber: string;
        stockNumber: string;
        date: string;
        vin: string;
        vehicleType: string;
        lender: string;
        frontEnd: string;
        vsc: string;
        ppm: string;
        gap: string;
        tireWheel: string;
        appearance: string;
        theft: string;
        bundled: string;
        ppd: string;
        pvr: string;
        total: string;
        status: string;
        edit: string;
        delete: string;
      };
      vehicleTypes: {
        new: string;
        used: string;
        cpo: string;
      };
      statusOptions: {
        pending: string;
        funded: string;
        held: string;
        unwound: string;
        deadDeal: string;
      };
      noDealsFound: string;
      noDealsYet: string;
      showingDeals: string;
      totalGross: string;
      backEndTotal: string;
      confirmDelete: string;
      finalConfirmDelete: string;
      editButton: string;
    };
    dealLog: {
      title: string;
      dealInformation: string;
      customerInformation: string;
      teamInformation: string;
      financialInformation: string;
      productProfits: string;
      financialSummary: string;
      dealNumber: string;
      stockNumber: string;
      vinNumber: string;
      saleDate: string;
      vehicleType: string;
      manufacturer: string;
      customerName: string;
      dealType: string;
      status: string;
      salesperson: string;
      salesManager: string;
      lender: string;
      splitDeal: string;
      secondSalesperson: string;
      frontEndGross: string;
      reserveFlat: string;
      backEndGross: string;
      autoCalculated: string;
      totalGross: string;
      allFieldsCompleted: string;
      saveDeal: string;
      updateDeal: string;
      cancel: string;
      vehicleTypes: {
        new: string;
        used: string;
        certified: string;
      };
      dealTypes: {
        cash: string;
        finance: string;
        lease: string;
      };
      products: {
        vsc: string;
        gap: string;
        ppm: string;
        tireWheel: string;
        appearance: string;
        theft: string;
        bundled: string;
        keyReplacement: string;
        windshield: string;
        lojack: string;
        extWarranty: string;
        other: string;
      };
    };
    settings: {
      title: string;
      teamManagement: string;
      payConfiguration: string;
      languageSettings: string;
      teamMembers: string;
      addNewMember: string;
      firstName: string;
      lastName: string;
      role: string;
      addMember: string;
      noMembers: string;
      salespeople: string;
      salesManagers: string;
      active: string;
      inactive: string;
      remove: string;
      commissionBasePay: string;
      commissionRate: string;
      baseRate: string;
      bonusThresholds: string;
      vscBonus: string;
      gapBonus: string;
      ppmBonus: string;
      totalThreshold: string;
      saveConfiguration: string;
      currentLanguage: string;
      changeLanguage: string;
      selectLanguage: string;
      languageUpdated: string;
      roles: {
        salesperson: string;
        salesManager: string;
      };
    };
  };
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
    home: string;
    screenshots: string;
    pricing: string;
    aboutUs: string;
  };
  currency: {
    symbol: string;
    name: string;
  };
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

export const translations: Record<Language, Translations | Partial<Translations>> = {
  en: {
    nav: {
      home: 'Home',
      screenshots: 'Screenshots',
      pricing: 'Pricing',
      about: 'About Us',
      login: 'Login',
      signup: 'Sign Up',
      legal: 'Legal',
    },
    home: {
      title: 'The DAS Board',
      subtitle:
        'Real-time dashboards providing critical insights for finance managers, dealerships, and dealer groups.',
      startTrial: 'Start Your Free Trial',
      signupNow: 'Sign Up Now!',
      viewScreenshots: 'View Screenshots',
      mission:
        '"The DAS Board redefines dealership success, empowering Sales Managers to optimize teams and Finance Managers to maximize profits with key sales insights, and Sales People to stay on top of their deals." - Tyler Durden',
      features: {
        title: 'Key Features',
        subtitle: 'Everything you need to manage your dealership operations effectively',
      },
      pricing: {
        title: 'Try it Now',
        subtitle:
          'Start your free trial and see the difference real-time insights can make for your dealership.',
      },
      pricingTiers: {
        singleFinance: {
          name: 'Single Finance Manager',
          price: '$20/mo limited time',
          originalPrice: '$29.99/mo',
          description:
            'Perfect for individual finance managers who want to track their personal performance',
          features: [
            'Personal deal tracking',
            'PVR & product profit analytics',
            'Pay calculator',
            'Performance metrics',
            'May be tax deductible',
          ],
          buttonText: 'Get Started Now!',
          setupTime: 'Try risk free for one calendar month',
        },
        dealership: {
          name: 'Dealership / Dealer Group',
          price: '$250/mo base',
          description:
            'Complete dealership management with role-specific dashboards and team management',
          popular: 'Most Popular',
          features: [
            'All single manager features',
            'Team dashboards for all roles',
            'Multi-location analytics',
            'Flexible admin structures',
          ],
          buttonText: 'Configure Your Package',
          setupTime: 'Get started today',
        },
        priceSubtext: 'per dealership + add-ons',
      },
      cta: {
        title: 'Ready to transform your dealership operations?',
        subtitle:
          'Join hundreds of dealerships already using The DAS Board to optimize their operations.',
      },
    },
    features: {
      finance: {
        title: 'Finance Dashboards',
        desc: 'Real-time insights for finance managers to track daily performance, log deals, view metrics including PVR, VSC, and other Products.',
      },
      sales: {
        title: 'Sales Team Dashboards',
        desc: 'The Das Board is your new Leaderboard! Keep track of your deals know exactly where you are throughout the month.',
      },
      manager: {
        title: 'Sales Manager Dashboards',
        desc: 'View Deals Logs, Sales People statistics, manage your Teams more effectively.',
      },
      info: {
        title: 'Informative Dashboards',
        desc: 'Role-specific dashboards for Sales Teams, Finance Managers, Sales Managers and General Managers.',
      },
      scheduler: {
        title: 'Dynamic Scheduler',
        desc: 'Dynamic Sales person scheduler for efficient team coordination. Manage schedules to maximize daily production.',
      },
      calculator: {
        title: 'Pay Calculator',
        desc: 'Your Sales Team and Finance Managers will be able to see month to date real time earnings with pre-configured pay plans.',
      },
    },
    screenshots: {
      title: 'See The DAS Board in Action',
      subtitle: 'Take a look at our intuitive dashboards designed for automotive professionals.',
      finance: {
        title: 'Finance Manager Dashboard',
        desc: 'Track deals, PVR, VSC metrics, and daily performance in real-time.',
      },
      sales: {
        title: 'Sales Dashboard',
        desc: 'Your personal leaderboard showing deals, rankings, and monthly progress.',
      },
      manager: {
        title: 'Sales Manager Dashboard',
        desc: 'Comprehensive team overview with deal logs and performance analytics.',
      },
      gm: {
        title: 'General Manager Dashboard',
        desc: 'High-level insights into dealership performance and team productivity.',
      },
    },
    pricing: {
      title: 'Choose the Perfect Plan',
      subtitle:
        'Start with our free trial for finance managers, or choose the plan that scales with your dealership.',
      finance: 'Finance Manager',
      dealership: 'Single Dealership',
      group: 'Dealer Groups',
      freeTime: 'Free for Limited Time!',
      getStarted: 'Get Started',
      startTrial: 'Start Free Trial',
      popular: 'Most Popular',
      viewDetails: 'View Full Pricing Details →',
      tiers: {
        finance: {
          name: 'Finance Manager',
          price: 'Free for Limited Time!',
          originalPrice: '$5/Month',
          description: 'Perfect for individual finance managers',
        },
        dealership: {
          name: 'Small Dealer Groups',
          price: '$250/mo per Dealership',
          description: '1-5 Dealerships',
        },
        group: {
          name: 'Dealer Groups 6+',
          price: '$200/Mo per Dealer*',
          description: 'Everything Single Dealership offers plus Area VP Dashboard',
        },
      },
      discountPopup: {
        specialSummerSavings: 'Special Summer Savings!',
        yourDiscountCode: 'Your Discount Code!',
        tenPercentOff: '10% off',
        firstThreeMonths: 'your first 3 months with our dealership management solution.',
        enterEmailPrompt: 'Enter your email to receive the discount code:',
        emailPlaceholder: 'your@email.com',
        getDiscountCode: 'Get Discount Code',
        maybeWater: 'Maybe Later',
        thankYouMessage: "Thank you! Here's your",
        discountCodeLabel: 'Discount Code:',
        copied: 'Copied!',
        copy: 'Copy',
        claimOffer: 'Claim Offer',
        useLater: 'Use Later',
        validityNotice: '* Valid for new dealership subscriptions only. Expires in 30 days.',
        emailRequired: 'Email address is required',
        validEmailRequired: 'Please enter a valid email address',
      },
      pricingPage: {
        title: 'Select Your',
        titleHighlight: 'Solution',
        subtitle:
          "Select the option that best describes your needs. We'll customize your experience accordingly.",
        singleFinance: {
          title: 'Single Finance Manager',
          description:
            'Perfect for individual finance managers who want to track their personal performance and deals.',
          originalPrice: '$29.99/mo',
          price: '$20/mo limited time',
          features: [
            'Personal deal tracking',
            'PVR & product profit analytics',
            'Pay calculator',
            'Performance metrics',
            'May be tax deductible',
          ],
          buttonText: 'Get Started Now!',
          setupTime: 'Try risk free for one calendar month',
        },
        dealership: {
          title: 'Dealership / Dealer Group',
          description:
            'Complete dealership management with role-specific dashboards, team management, and multi-location support.',
          price: '$250/mo base',
          priceSubtext: 'per dealership + add-ons',
          popular: 'Most Popular',
          features: [
            'All single manager features',
            'Team dashboards for all roles',
            'Multi-location analytics',
            'Flexible admin structures',
            'Volume discounts available',
          ],
          buttonText: 'View Dynamic Package Pricing',
          setupTime: 'Get started today',
        },
        benefits: {
          title: 'Transform Your Dealership Today',
          performance: {
            title: 'Increase Performance',
            description: 'Real-time insights help teams exceed goals and maximize profitability',
          },
          operations: {
            title: 'Streamline Operations',
            description: 'Centralized management reduces admin time and improves efficiency',
          },
          security: {
            title: 'Secure & Reliable',
            description: 'Enterprise-grade security with 99.9% uptime guarantee',
          },
        },
        helpText: {
          title: 'Not sure which option to choose?',
          description:
            "Start with the single finance manager option to try our platform, then easily upgrade to dealership features when you're ready to expand your team.",
        },
        footer: {
          copyright: '© 2025 The DAS Board. All rights reserved.',
          support: 'Questions? Contact us at',
          email: 'support@thedasboard.com',
        },
      },
    },
    about: {
      title: 'Who We Are',
      subtitle:
        'Passionate professionals dedicated to revolutionizing dealership management through innovative technology and data-driven insights.',
      founderVision: {
        title: 'Why I Created The DAS Board – Tyler Durden, CEO and Founder',
        paragraph1:
          "With over 27 years of experience in the automotive dealership industry, I've seen firsthand the challenges managers face in balancing their roles as leaders and performers. As a seasoned professional, I founded The DAS Board to address a critical gap I observed: while Sales Managers excel at selling cars, they often struggle to effectively manage their sales teams.",
        paragraph2:
          'I believe that informed, motivated, and well-supported salespeople are the key to driving exceptional results—far surpassing the outcomes of disengaged or uninformed teams. The DAS Board empowers Sales Managers with intuitive tools to lead their teams more effectively, ensuring they can focus on both team development and sales excellence.',
        paragraph3:
          'Beyond sales, the app supports Finance Managers by providing real-time insights into deal profitability and key metrics, while offering GMs actionable reports to guide strategic decisions. My vision with The DAS Board is to revolutionize dealership management, fostering a culture of efficiency, transparency, and success across all levels of the organization.',
      },
      team: {
        title: 'Our Team',
        members: {
          tyler: {
            name: 'Tyler Durden',
            role: 'CEO & Founder',
            bio: 'Drawing on extensive experience in dealership management, Tyler Durden founded The DAS Board to foster a culture where informed and motivated employees thrive, driving productivity through transparent, data-driven tools that empower automotive teams.',
          },
          sarah: {
            name: 'Sarah Conner',
            role: 'Chief Product Officer',
            bio: 'With over 25 years of dealership and retail experience, Sarah Conner brings deep insights into achieving sales success. She understands the power of effective tools and skilled management to inspire teams, ensuring The DAS Board drives exceptional results for dealerships.',
          },
          claude: {
            name: 'Claude Sonnet',
            role: 'Chief Technology Officer',
            bio: 'Claude Sonnet brings deep expertise in crafting software that excels, with a focus on scalable, secure platforms. His ability to deliver insights without complexity ensures The DAS Board provides seamless, reliable technology for dealerships.',
          },
          annie: {
            name: 'Annie Porter',
            role: 'Customer Success Director',
            bio: 'Dedicated to ensuring every DAS Board customer gets the most from our platform through personalized onboarding and support',
          },
        },
      },
      values: {
        title: 'Our Values',
        customerFocused: {
          title: 'Customer-Focused',
          description:
            'We empower automotive dealerships with intuitive dashboards that prioritize their unique needs, ensuring seamless management and enhanced customer experiences.',
        },
        dataDriven: {
          title: 'Data-Driven',
          description:
            'Our platform delivers real-time, actionable insights from dealership data, enabling precise decision-making to boost sales and operational efficiency.',
        },
        continuousImprovement: {
          title: 'Continuous Improvement',
          description:
            'We relentlessly refine our tools to help dealerships optimize performance, adapt to industry trends, and achieve sustained growth.',
        },
      },
      contact: {
        title: 'Get in Touch',
        subtitle:
          "Ready to see how The DAS Board can transform your dealership operations? We'd love to hear from you.",
        email: 'Email:',
        phone: 'Phone:',
      },
    },
    signup: {
      title: 'Join The DAS Board',
      subtitle: 'Get started with your dealership management solution today.',
      selectLanguage: 'Select Your Language',
      dealerGroup: 'Dealer Group Signup',
      dealership: 'Dealership Signup',
      financeManager: 'Finance Manager Signup',
      simple: {
        title: 'Simple Signup',
        subtitle: 'Get Started Free',
        description: 'Sign up as a Single Finance Manager in under 2 minutes',
        submitButton: 'Start Free Account',
        whyTitle: 'Why Single Finance Manager?',
        whyBenefits: [
          'Track your personal performance metrics',
          'Calculate your pay with real-time data',
          'Monitor your PVR and product penetration',
          'Completely FREE for individual use',
        ],
      },
      form: {
        firstName: 'First Name',
        lastName: 'Last Name',
        fullName: 'Full Name',
        email: 'Email Address',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        dealershipName: 'Dealership Name',
        role: 'Your Role',
        phone: 'Phone Number',
        submit: 'Create Account',
        alreadyHave: 'Already have an account?',
        signIn: 'Sign In',
        terms: 'I agree to the Terms of Service and Privacy Policy',
        agreePrefix: 'I agree to the',
        emailNote: 'Must be a verified dealership email address',
        language: 'Preferred Language',
        languageNote: 'This will be your default language for the dashboard',
      },
      dealershipSignup: {
        getStartedToday: 'Get Started Today',
        createAccountConfigure: 'Create your account and configure your dealerships after signup',
        organizationInfo: 'Organization Information',
        organizationName: 'Organization Name *',
        organizationNamePlaceholder: 'ABC Auto Group',
        businessAddress: 'Business Address *',
        businessAddressPlaceholder: '123 Main Street',
        city: 'City *',
        cityPlaceholder: 'Anytown',
        state: 'State *',
        statePlaceholder: 'CA',
        zipCode: 'ZIP Code *',
        zipCodePlaceholder: '12345',
        adminContactInfo: 'Admin Contact Information',
        adminName: 'Admin Name *',
        adminNamePlaceholder: 'John Smith',
        emailAddress: 'Email Address *',
        emailPlaceholder: 'john@abcautogroup.com',
        password: 'Password *',
        passwordPlaceholder: 'At least 8 characters',
        confirmPassword: 'Confirm Password *',
        confirmPasswordPlaceholder: 'Confirm your password',
        createAccountButton: 'Create Account & Get Started',
        configureAfterSignup: 'Configure dealerships and team after signup',
        useDiscountCode: 'Use code SAVE10 for 10% off first 3 months',
        pricing: {
          dealershipManagement: 'Dealership Management',
          buildCustomPackage:
            "Build your custom package with flexible pricing tailored to your dealership's needs.",
          dynamicPackagePricing: 'Dynamic Package Pricing',
          basePricePerDealership: 'Base Price per Dealership',
          includesDashboardAccess: 'Includes dashboard access for standard team',
          standardTeamAccess: 'Standard Team Access:',
          upToSalesPeople: 'Up to 10 Sales People',
          upToFinanceManagers: 'Up to 3 Finance Managers',
          upToSalesManagers: 'Up to 3 Sales Managers',
          oneGeneralManager: '1 General Manager',
          coreFeatures: 'Core Features:',
          realTimeDealTracking: 'Real-time deal tracking',
          performanceAnalytics: 'Performance analytics',
          scheduleManagement: 'Schedule management',
          goalTracking: 'Goal tracking',
          whatsIncluded: "What's Included:",
          completeDashboardSuite: 'Complete dashboard suite for all roles',
          realTimeDealTrackingAnalytics: 'Real-time deal tracking & analytics',
          multiLocationManagement: 'Multi-location management',
          flexibleAdminStructure: 'Flexible admin structure',
          scheduleGoalManagement: 'Schedule & goal management',
          performanceReporting: 'Performance reporting',
          volumeDiscountsAvailable: 'Volume discounts available',
          specialBundleOffers: 'Special Bundle Offers',
          sellMoreBundle: 'Sell More Bundle (+$50/mo):',
          sellMoreBundleDesc:
            '10 Additional Sales People, 2 Additional Finance Managers, 2 Additional Sales Managers',
          sellMostBundle: 'Sell Most Bundle (+$100/mo):',
          sellMostBundleDesc:
            '20 Additional Sales People, 4 Sales Managers, 1 GSM, 1 Finance Director',
          aLaCarteAddons: 'À La Carte Add-ons',
          additionalSalesPerson: 'Additional Sales Person',
          additionalFinanceManager: 'Additional Finance Manager',
          additionalSalesManager: 'Additional Sales Manager',
          financeDirector: 'Finance Director',
          generalSalesManager: 'General Sales Manager (GSM)',
          areaVicePresident: 'Area Vice President (AVP)',
          dashboardPreview: 'Dashboard Preview',
          salesPersonDashboard: 'Sales Person Dashboard',
          financeManagerDashboard: 'Finance Manager Dashboard',
          salesManagerDashboard: 'Sales Manager Dashboard',
          financeDirectorDashboard: 'Finance Director Dashboard',
          generalManagerDashboard: 'General Manager Dashboard',
          areaVicePresidentDashboard: 'Area Vice President Dashboard',
        },
        validation: {
          organizationNameRequired: 'Organization name is required',
          addressRequired: 'Address is required',
          cityRequired: 'City is required',
          stateRequired: 'State is required',
          zipCodeRequired: 'ZIP code is required',
          adminNameRequired: 'Admin name is required',
          emailRequired: 'Email is required',
          validEmailRequired: 'Please enter a valid email address',
          passwordRequired: 'Password is required',
          passwordMinLength: 'Password must be at least 8 characters',
          passwordsDoNotMatch: 'Passwords do not match',
        },
      },
    },
    dashboard: {
      singleFinance: {
        title: 'Single Finance Manager Dashboard',
        homeTitle: 'Single Finance Manager',
        promo: {
          title: 'Special Promotion Active!',
          description: 'Your Finance Manager subscription is currently',
          free: 'FREE',
          limited: 'for a limited time',
        },
        trends: {
          up12: '+12% from last month',
          down8: '-8% from last month',
          up3: '+3% from last month',
          upPoint2: '+0.2 from last month',
          downPoint3: '-0.3 from last month',
          up125: '+$125 from last month',
          down89: '-$89 from last month',
        },
        kpi: {
          fiGross: 'F&I Gross',
          dealsProcessed: 'Deals Processed',
          dealTypes: 'Deal Types',
          productsPerDeal: 'Products Per Deal',
          pvr: 'PVR',
          pvrFull: 'PVR (Per Vehicle Retailed)',
        },
        periods: {
          thisMonth: 'This Month',
          lastMonth: 'Last Month',
          lastQuarter: 'Last Quarter',
          ytd: 'Year to Date',
          lastYear: 'Last Year',
        },
        bestPractice: {
          title: 'F&I Best Practice',
        },
        errors: {
          failedToLoadLocal: 'Failed to load deals from local storage.',
          failedToLoad: 'Failed to load deals. Please try again later.',
          unexpectedError: 'An unexpected error occurred while loading deals.',
          failedToUpdate: 'Failed to update deal status',
          failedToDelete: 'Failed to delete deal',
        },
        confirmations: {
          deleteWarning:
            '⚠️ DELETE CONFIRMATION\n\nAre you sure you want to delete this deal?\n\nThis action will:\n• Permanently remove all deal data\n• Update your dashboard metrics\n• Cannot be undone\n\nClick OK to delete or Cancel to keep the deal.',
          finalConfirmation:
            '🚨 FINAL CONFIRMATION\n\nThis is your last chance!\n\nClick OK to permanently delete this deal, or Cancel to keep it.',
        },
        dealTypes: {
          finance: 'Finance',
          cash: 'Cash',
          lease: 'Lease',
        },
        productMix: {
          title: 'Product Mix & Performance',
          product: 'Product',
          avgProfit: 'Avg Profit',
          penetration: 'Penetration',
          extendedWarranty: 'Extended Warranty',
          gapInsurance: 'GAP Insurance',
          paintProtection: 'Paint & Protection',
          tireWheel: 'Tire & Wheel',
          ppm: 'PPM',
          theft: 'Theft Protection',
          bundled: 'Bundled',
          other: 'Other',
        },
        payCalculator: {
          title: 'Monthly Pay Estimator',
          hideAmounts: 'Hide pay amounts',
          showAmounts: 'Show pay amounts',
          grossProfit: 'Gross Profit',
          payPlan: 'Pay Plan',
          estimatedPay: 'Estimated Monthly Pay',
          baseAmount: 'Base Pay',
          commission: 'Commission ({rate}%)',
          bonuses: 'Product Bonuses',
          bonusAmount: 'Bonus Amount',
          totalPay: 'Total Pay',
          bonusBreakdown: 'Bonus Breakdown',
          vscDeals: 'VSC Deals',
          gapDeals: 'GAP Deals',
          ppmDeals: 'PPM Deals',
          disclaimer: {
            title: 'Disclaimer',
            text: 'This calculator is for informational purposes only. Actual pay may differ based on final accounting, management review, and company policies. Configure your pay settings in the Settings page.',
          },
        },
        dealsLog: {
          title: 'Recent Deals Log',
          refresh: 'Refresh',
          viewAll: 'View All',
          number: '#',
          lastName: 'Last Name',
          date: 'Date',
          gross: 'Gross',
          products: 'Products',
          status: 'Status',
        },
        deals: {
          recentDeals: 'Recent Deals',
          viewAll: 'View All',
          addNew: 'Log New Deal',
          noDealsYet: 'No deals logged yet.',
          refreshTooltip: 'Refresh deals',
          tableHeaders: {
            number: '#',
            lastName: 'Last Name',
            dealNumber: 'Deal #',
            stockNumber: 'Stock #',
            date: 'Date',
            vin: 'VIN',
            vehicleType: 'N/U/CPO',
            lender: 'Lender',
            frontEnd: 'Front End',
            vsc: 'VSC',
            ppm: 'PPM',
            gap: 'GAP',
            appearance: 'App',
            tireWheel: 'T&W',
            ppd: 'PPD',
            pvr: 'PVR',
            total: 'Total',
            status: 'Status',
            edit: 'Edit',
            delete: 'Delete',
            totals: 'TOTALS',
          },
          statusOptions: {
            pending: 'Pending',
            funded: 'Funded',
            held: 'Held',
            unwound: 'Unwound',
          },
          actions: {
            edit: 'Edit',
          },
        },
        timePeriod: {
          thisMonth: 'This Month',
          lastMonth: 'Last Month',
          lastQuarter: 'Last Quarter',
          ytd: 'YTD',
          lastYear: 'Last Year',
          custom: 'Custom',
        },
        status: {
          pending: 'Pending',
          funded: 'Funded',
          unwound: 'Unwound',
          deadDeal: 'Dead Deal',
        },
      },
      deals: {
        title: 'Single Finance Manager - Deals',
        backToDashboard: 'Back to Dashboard',
        note: 'These deals are specific to your Single Finance Manager Dashboard and are stored separately from the main finance deals.',
        searchPlaceholder: 'Search deals by customer, vehicle, deal #, or VIN',
        allStatuses: 'All Statuses',
        tableHeaders: {
          number: '#',
          lastName: 'Last Name',
          dealNumber: 'Deal #',
          stockNumber: 'Stock #',
          date: 'Date',
          vin: 'VIN',
          vehicleType: 'N/U/CPO',
          lender: 'Lender',
          frontEnd: 'Front End',
          vsc: 'VSC',
          ppm: 'PPM',
          gap: 'GAP',
          tireWheel: 'T&W',
          appearance: 'App',
          theft: 'Theft',
          bundled: 'Bundled',
          ppd: 'PPD',
          pvr: 'PVR',
          total: 'Total',
          status: 'Status',
          edit: 'Edit',
          delete: 'Delete',
        },
        vehicleTypes: {
          new: 'N',
          used: 'U',
          cpo: 'C',
        },
        statusOptions: {
          pending: 'Pending',
          funded: 'Funded',
          held: 'Held',
          unwound: 'Unwound',
          deadDeal: 'Dead Deal',
        },
        noDealsFound: 'No deals match your search criteria.',
        noDealsYet: "No deals logged yet. Use the 'Log New Deal' button to add deals.",
        showingDeals: 'Showing {count} of {total} deals',
        totalGross: 'Total Gross:',
        backEndTotal: 'Back End Total:',
        confirmDelete:
          '⚠️ DELETE CONFIRMATION\n\nAre you sure you want to delete this deal?\n\nThis action will:\n• Permanently remove all deal data\n• Update your dashboard metrics\n• Cannot be undone\n\nClick OK to delete or Cancel to keep the deal.',
        finalConfirmDelete:
          '🚨 FINAL CONFIRMATION\n\nThis is your last chance!\n\nClick OK to permanently delete this deal, or Cancel to keep it.',
        editButton: 'Edit',
      },
      dealLog: {
        title: 'Log New Deal',
        backToDashboard: 'Back to Dashboard',
        note: 'Note',
        editDeal: 'Edit Deal - Single Finance Dashboard',
        dealInformation: 'Deal Information',
        customerInformation: 'Customer Information',
        teamInformation: 'Team Information',
        financialInformation: 'Financial Information',
        productProfits: 'Product Profits',
        financialSummary: 'Financial Summary',
        frontEndGross: 'Front End Gross',
        reserveFlat: 'Reserve/Flat',
        backEndGross: 'Back End Gross',
        autoCalculated: 'Auto-Calculated',
        totalGross: 'Total Gross',
        dealNumber: 'Deal #',
        enterDealNumber: 'Enter deal number',
        stockNumber: 'Stock #',
        vinNumber: 'VIN # (Last 8)',
        vinLast8: 'Last 8 of VIN *',
        vinPlaceholder: 'Last 8 of VIN',
        saleDate: 'Sale Date',
        vehicleType: 'Vehicle Type',
        manufacturer: 'Manufacturer',
        selectManufacturer: 'Select Manufacturer',
        customerName: 'Customer Name',
        customerPlaceholder: 'Customer last name',
        dealType: 'Deal Type',
        status: 'Status',
        salesperson: 'Salesperson',
        selectSalesperson: 'Select Salesperson',
        secondSalesperson: 'Second Salesperson',
        selectSecondSalesperson: 'Select Second Salesperson',
        salesManager: 'Sales Manager',
        selectManager: 'Select Manager',
        lender: 'Lender',
        selectLender: 'Select Lender',
        splitDeal: 'Split Deal',
        editingNote: 'You are editing an existing deal. All changes will be saved automatically.',
        dashboardNote: 'All fields marked with * are required. Make sure to enter accurate information for proper tracking.',
        savingDeal: 'Saving Deal...',
        updatingDeal: 'Updating Deal...',
        allFieldsRequired: 'All fields are required.',
        saveDeal: 'Save Deal',
        updateDeal: 'Update Deal',
        cancel: 'Cancel',
        addNewSalesperson: 'Add New Salesperson',
        firstName: 'First Name',
        lastName: 'Last Name',
        addSalesperson: 'Add Salesperson',
        vehicleTypes: {
          new: 'New',
          used: 'Used',
          certified: 'Certified',
          cpo: 'CPO',
        },
        dealTypes: {
          cash: 'Cash',
          finance: 'Finance',
          lease: 'Lease',
        },
        statusOptions: {
          pending: 'Pending',
          funded: 'Funded',
        },
        productsAndProfit: 'Products & Profit',
        products: {
          vsc: 'VSC',
          gap: 'GAP',
          ppm: 'PPM',
          tireWheel: 'Tire & Wheel',
          appearance: 'Appearance',
          theft: 'Theft',
          bundled: 'Bundled',
          keyReplacement: 'Key Replacement',
          windshield: 'Windshield',
          lojack: 'LoJack',
          extWarranty: 'Ext Warranty',
          other: 'Other',
          vscProfit: 'VSC Profit',
          gapProfit: 'GAP Profit',
          ppmProfit: 'PPM Profit',
          tireWheelProfit: 'Tire & Wheel Profit',
          appearanceProfit: 'Appearance Profit',
          theftProfit: 'Theft Profit',
          bundledProfit: 'Bundled Profit',
          otherProfit: 'Other Profit',
        },
      },
      settings: {
        title: 'Single Finance Manager Settings',
        backToDashboard: 'Back to Dashboard',
        teamManagement: 'Team Members',
        payConfiguration: 'Pay Configurator',
        languageSettings: 'Language Settings',
        teamMembers: 'Team Members',
        addNewMember: 'Add New Team Member',
        firstName: 'First Name',
        lastName: 'Last Name',
        role: 'Role',
        addMember: 'Add Member',
        noMembers: 'No team members added yet. Add your first team member above.',
        salespeople: 'Salespeople',
        salesManagers: 'Sales Managers',
        active: 'Active',
        inactive: 'Inactive',
        remove: 'Remove',
        commissionBasePay: 'Commission & Base Pay',
        commissionRate: 'Commission Rate (%)',
        commissionRateDescription: 'Percentage of back-end gross profit',
        baseRate: 'Base Monthly Rate ($)',
        baseRateDescription: 'Fixed monthly base pay',
        bonusThresholds: 'Product Bonuses',
        vscBonus: 'VSC Bonus ($)',
        gapBonus: 'GAP Bonus ($)',
        ppmBonus: 'PPM Bonus ($)',
        totalThreshold: 'Monthly Threshold ($)',
        totalThresholdDescription: 'Monthly gross threshold for full bonuses',
        saveConfiguration: 'Save Configuration',
        currentLanguage: 'Current Language',
        changeLanguage: 'Change Language',
        selectLanguage: 'Select Language',
        languageUpdated: 'Language updated successfully',
        firstNamePlaceholder: 'First name',
        lastNamePlaceholder: 'Last name',
        confirmRemove: 'Are you sure you want to remove {firstName} {lastName} from the team?',
        memberAdded: '{firstName} {lastName} added to team',
        memberRemoved: 'Team member removed',
        note: {
          title: 'Note',
          description:
            'These settings are specific to your Single Finance Manager Dashboard and will be used for deal logging and pay calculations.',
        },
        roles: {
          salesperson: 'Salesperson',
          salesManager: 'Sales Manager',
        },
      },
    },
    common: {
      language: 'Language',
      login: 'Login',
      signUp: 'Sign Up',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      continue: 'Continue',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      close: 'Close',
      success: 'Success',
    },
    footer: {
      tagline: 'Modern dealership management software with real-time insights.',
      industry: 'Dealership Automotive Sales',
      product: 'Product',
      legal: 'Legal',
      contact: 'Contact',
      support: 'For support or inquiries, please contact us at:',
      copyright: '© 2025 The DAS Board. All rights reserved. Designed with 🖤',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      subscription: 'Subscription Agreement',
      home: 'Home',
      screenshots: 'Screenshots',
      pricing: 'Pricing',
      aboutUs: 'About Us',
    },
    currency: {
      symbol: '$',
      name: 'USD',
    },
    legal: {
      terms: {
        title: 'Terms of Service',
        lastUpdated: 'Last Updated: 6/28/2025',
        intro:
          'Welcome to The DAS Board. These Terms of Service ("Terms") govern your access to and use of our dealership management software platform. By accessing or using our services, you agree to be bound by these Terms.',
        sections: {
          acceptance: {
            title: '1. Acceptance of Terms',
            content:
              'By creating an account, accessing, or using The DAS Board, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our services. You must be at least 18 years old and have the authority to enter into these Terms on behalf of your organization.',
          },
          service: {
            title: '2. Description of Service',
            content:
              'The DAS Board is a cloud-based dealership management software platform that provides tools for inventory management, sales tracking, customer relationship management, financial reporting, and related automotive industry services. We reserve the right to modify, suspend, or discontinue any aspect of our service with reasonable notice.',
          },
          account: {
            title: '3. Account Registration and Security',
            content:
              'To use our services, you must create an account with accurate and complete information. You are responsible for:',
            items: [
              'Maintaining the confidentiality of your account credentials',
              'All activities that occur under your account',
              'Notifying us immediately of any unauthorized use',
              'Ensuring your account information remains current and accurate',
              'Complying with our security requirements and best practices',
            ],
          },
          subscription: {
            title: '4. Subscription and Payment Terms',
            content:
              'The DAS Board operates on a subscription basis. By subscribing, you agree to:',
            items: [
              'Pay all fees associated with your subscription plan',
              'Automatic renewal unless cancelled before the renewal date',
              "Fee changes with 30 days' advance notice",
              'No refunds for partial subscription periods',
              'Suspension of service for non-payment after reasonable notice',
            ],
          },
          usage: {
            title: '5. Acceptable Use Policy',
            content:
              'You agree to use The DAS Board only for lawful purposes and in accordance with these Terms. You may not:',
            items: [
              'Violate any applicable laws, regulations, or third-party rights',
              'Upload harmful, offensive, or inappropriate content',
              "Attempt to gain unauthorized access to our systems or other users' accounts",
              'Use the service to send spam, malware, or other malicious content',
              'Reverse engineer, decompile, or attempt to extract source code',
              'Interfere with or disrupt the integrity or performance of our services',
              'Use the platform for any fraudulent or illegal activities',
            ],
          },
          intellectual: {
            title: '6. Intellectual Property Rights',
            content:
              'The DAS Board and all related technology, content, and materials are owned by us or our licensors. This includes:',
            items: [
              'Software, algorithms, and user interfaces',
              'Trademarks, logos, and branding materials',
              'Documentation, tutorials, and support materials',
              'Analytics, reports, and aggregated data insights',
            ],
            footer:
              'You retain ownership of your data but grant us a license to use it to provide our services. We may use anonymized, aggregated data for industry research and platform improvement.',
          },
          privacy: {
            title: '7. Data Protection and Privacy',
            content:
              'You are responsible for ensuring that any personal data you process through our platform complies with applicable privacy laws. We will process data in accordance with our Privacy Policy and applicable data protection regulations, including GDPR and CCPA where applicable.',
          },
          availability: {
            title: '8. Service Availability and Support',
            content:
              'While we strive for high availability, we do not guarantee uninterrupted service. We provide:',
            items: [
              '99.9% uptime SLA for paid subscriptions',
              'Regular maintenance windows with advance notice',
              'Technical support based on your subscription level',
              'Security monitoring and incident response',
            ],
          },
          termination: {
            title: '9. Termination',
            content: 'Either party may terminate these Terms:',
            items: [
              'You may cancel your subscription at any time through your account settings',
              'We may terminate for breach of these Terms with reasonable notice',
              'We may suspend service immediately for serious violations or security threats',
              'Upon termination, you will lose access to the platform and your data',
              'We will provide a reasonable opportunity to export your data before deletion',
            ],
          },
          disclaimers: {
            title: '10. Disclaimers and Limitations of Liability',
            content:
              'THE DAS BOARD IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW:',
            items: [
              'We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose',
              'We are not liable for indirect, incidental, special, or consequential damages',
              'Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim',
              'You acknowledge that software may contain bugs and agree to report them promptly',
            ],
          },
          indemnification: {
            title: '11. Indemnification',
            content:
              'You agree to indemnify and hold us harmless from any claims, losses, or damages arising from your use of our services, violation of these Terms, or infringement of any third-party rights.',
          },
          governing: {
            title: '12. Governing Law and Dispute Resolution',
            content:
              'These Terms are governed by the laws of [Jurisdiction] without regard to conflict of law principles. Any disputes will be resolved through binding arbitration, except for injunctive relief claims which may be brought in appropriate courts.',
          },
          changes: {
            title: '13. Changes to Terms',
            content:
              'We may modify these Terms from time to time. We will provide notice of material changes at least 30 days in advance. Continued use of our services after changes take effect constitutes acceptance of the revised Terms.',
          },
          entire: {
            title: '14. Entire Agreement',
            content:
              'These Terms, together with our Privacy Policy and any additional agreements, constitute the entire agreement between you and The DAS Board regarding your use of our services.',
          },
          contact: {
            title: '15. Contact Information',
            content: 'If you have questions about these Terms, please contact us:',
            email: 'legal@thedasboard.com',
            address: '[Company Address]',
            phone: '[Support Phone Number]',
          },
        },
      },
      privacy: {
        title: 'Privacy Policy',
        lastUpdated: 'Last Updated: 6/28/2025',
        intro:
          'This Privacy Policy describes how The DAS Board ("we," "us," or "our") collects, uses, and protects your personal information when you use our dealership management software platform. We are committed to protecting your privacy and handling your data responsibly.',
        sections: {
          collection: {
            title: '1. Information We Collect',
            content:
              'When you use The DAS Board, we collect several types of information to provide and improve our services:',
            items: [
              '<strong>Account Information:</strong> Name, email address, phone number, company name, job title, and billing information',
              '<strong>Dealership Data:</strong> Vehicle inventory, sales records, customer information, and financial transactions',
              '<strong>Usage Data:</strong> Features accessed, time spent on platform, user interactions, and performance metrics',
              '<strong>Technical Data:</strong> IP address, browser type, device information, operating system, and access logs',
              '<strong>Communication Data:</strong> Support requests, feedback, and correspondence with our team',
              '<strong>Location Data:</strong> Dealership addresses and, with consent, device location for mobile features',
            ],
          },
          usage: {
            title: '2. How We Use Your Information',
            content:
              'We use the collected information for legitimate business purposes, including:',
            items: [
              'Providing, maintaining, and improving The DAS Board platform and features',
              'Processing subscriptions, payments, and managing your account',
              'Generating analytics, reports, and business insights for your dealership',
              'Providing customer support and responding to your inquiries',
              'Sending service updates, security alerts, and administrative messages',
              'Detecting, preventing, and addressing technical issues and security threats',
              'Complying with legal obligations and industry regulations',
              'Improving user experience through product development and research',
            ],
          },
          sharing: {
            title: '3. Sharing Your Information',
            content:
              'We do not sell, rent, or trade your personal information. We may share your information only in the following circumstances:',
            items: [
              '<strong>Service Providers:</strong> Third-party vendors who help us operate our platform (hosting, analytics, payment processing)',
              '<strong>Business Partners:</strong> Authorized integrations and automotive industry partners with your explicit consent',
              '<strong>Legal Requirements:</strong> When required by law, regulation, or valid legal process',
              '<strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales (with notice to you)',
              '<strong>Safety and Security:</strong> To protect the rights, property, or safety of our users or the public',
            ],
          },
          retention: {
            title: '4. Data Retention',
            content:
              'We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Specifically:',
            items: [
              'Account data is retained while your subscription is active and for 3 years after termination',
              'Transaction records are kept for 7 years to comply with financial regulations',
              'Usage logs are retained for 2 years for security and performance analysis',
              'Communication records are kept for 5 years for customer service purposes',
            ],
          },
          rights: {
            title: '5. Your Rights and Choices',
            content:
              'Depending on your location, you may have the following rights regarding your personal information:',
            items: [
              '<strong>Access:</strong> Request a copy of your personal information we hold',
              '<strong>Correction:</strong> Update or correct inaccurate personal information',
              '<strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)',
              '<strong>Portability:</strong> Receive your data in a machine-readable format',
              '<strong>Restriction:</strong> Limit how we process your personal information',
              '<strong>Objection:</strong> Object to processing based on legitimate interests',
            ],
          },
          cookies: {
            title: '6. Cookies and Tracking Technologies',
            content: 'We use cookies and similar technologies to enhance your experience:',
            items: [
              '<strong>Essential Cookies:</strong> Required for platform functionality and security',
              '<strong>Analytics Cookies:</strong> Help us understand how you use our platform',
              '<strong>Preference Cookies:</strong> Remember your settings and customizations',
              '<strong>Marketing Cookies:</strong> Used for targeted communications (with your consent)',
            ],
            footer:
              'You can control cookie preferences through your browser settings or our cookie management tool.',
          },
          security: {
            title: '7. Security Measures',
            content:
              'We implement industry-standard security measures to protect your information, including:',
            items: [
              'Encryption of data in transit and at rest using AES-256 standards',
              'Regular security audits and penetration testing',
              'Multi-factor authentication and access controls',
              'SOC 2 Type II compliance and regular security assessments',
              'Employee training on data protection and security best practices',
            ],
          },
          international: {
            title: '8. International Data Transfers',
            content:
              'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including Standard Contractual Clauses and adequacy decisions, to protect your data during international transfers.',
          },
          children: {
            title: "9. Children's Privacy",
            content:
              'The DAS Board is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware of such collection, we will delete the information promptly.',
          },
          changes: {
            title: '10. Changes to This Privacy Policy',
            content:
              'We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of significant changes via email or platform notification at least 30 days before they take effect.',
          },
          contact: {
            title: '11. Contact Us',
            content:
              'If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:',
            email: 'privacy@thedasboard.com',
            address: '[Company Address]',
            phone: '[Support Phone Number]',
          },
        },
      },
      subscription: {
        title: 'Subscription Agreement',
        lastUpdated: 'Last Updated: 6/28/2025',
        intro:
          'This Subscription Agreement governs your subscription to and use of The DAS Board dealership management platform.',
        sections: {
          plans: {
            title: '1. Subscription Plans',
            content:
              'The DAS Board offers subscription tiers designed for different dealership needs:',
            items: [
              '<strong>60-Day Free Trial:</strong> Full platform access with no credit card required',
              '<strong>Finance Manager:</strong> Individual user access with core financial tools',
              '<strong>Dealership:</strong> Multi-user access with full inventory and sales management',
              '<strong>Dealer Group:</strong> Enterprise-level access across multiple locations',
            ],
            footer:
              'Subscriptions are billed monthly in advance. You may upgrade or downgrade your subscription at any time, with changes taking effect at the next billing cycle.',
          },
          payment: {
            title: '2. Payment Terms',
            content:
              'Payment is due upon subscription commencement and on the same day each month thereafter. We accept major credit cards and ACH transfers for enterprise accounts. If payment fails, we may suspend your access to The DAS Board after reasonable notice.',
          },
          trial: {
            title: '3. Trial Period',
            content:
              'The 60-day trial provides full access to The DAS Board platform. No credit card is required to start your trial. At the end of the trial period, you will need to select a paid plan to continue using the platform. Trial data will be preserved for 30 days after trial expiration.',
          },
          cancellation: {
            title: '4. Cancellation and Refunds',
            content:
              'You may cancel your subscription at any time through your account settings or by contacting our support team. Upon cancellation:',
            items: [
              'You will maintain access until the end of your current billing period',
              'No refunds are provided for partial months of service',
              'Your data will be available for export for 90 days after cancellation',
              'Automatic renewal will be disabled',
            ],
          },
          sla: {
            title: '5. Service Level Agreement',
            content: 'For paid subscriptions, we commit to:',
            items: [
              '99.9% platform uptime availability',
              'Scheduled maintenance windows with 48-hour advance notice',
              'Customer support response within 24 hours for standard requests',
              'Priority support for Dealer Group subscribers',
            ],
          },
          data: {
            title: '6. Data and Security',
            content: 'Your dealership data remains your property. We provide:',
            items: [
              'Daily automated backups with 30-day retention',
              'Bank-level encryption and security protocols',
              'GDPR and CCPA compliance for data protection',
              'Data export capabilities in standard formats',
            ],
          },
          support: {
            title: '7. Support and Training',
            content: 'All paid subscriptions include:',
            items: [
              'Comprehensive onboarding and setup assistance',
              'Online training resources and documentation',
              'Email and chat support during business hours',
              'Regular platform updates and new feature releases',
            ],
          },
          modifications: {
            title: '8. Modifications to Service',
            content:
              'We may modify or update The DAS Board platform to improve functionality, security, or compliance. We will provide reasonable notice of significant changes that may affect your usage.',
          },
        },
      },
    },
    demoPage: {
      backToHome: 'Back to Home',
      title: 'Experience The DAS Board',
      startFreeTrial: 'Start Free Trial',
      subtitle: 'Explore our interactive demo to see how different roles use our dashboard',
      dashboards: {
        salesperson: {
          title: 'Sales Person Dashboard',
          description: 'Individual sales tracking and customer management',
        },
        finance: {
          title: 'Finance Manager Dashboard',
          description: 'Individual finance manager tracking performance and deals',
        },
        salesManager: {
          title: 'Sales Manager Dashboard',
          description: 'Team management and sales performance overview',
        },
        generalManager: {
          title: 'General Manager Dashboard',
          description: 'Complete dealership overview and analytics',
        },
      },
      hotspots: {
        productTracking: {
          title: 'Product Tracking',
          description:
            'Monitor product sales performance, track warranties, GAP, and other F&I products to maximize profitability per deal.',
        },
        performanceMetrics: {
          title: 'Performance Metrics',
          description:
            'Monitor your personal performance with key metrics like PVR (Per Vehicle Retailed), products per deal, and monthly targets.',
        },
        teamPerformance: {
          title: 'Team Performance',
          description:
            'Compare your performance with team averages and see how you rank among your colleagues.',
        },
        recentDealsLog: {
          title: 'Recent Deals Log',
          description:
            'View and manage your most recent deals with quick access to customer details and deal profitability.',
        },
        pvr: {
          title: 'PVR',
          description:
            'Per Vehicle Retailed - Track your average profit per vehicle and see how it compares to targets and team averages.',
        },
        payCalculator: {
          title: 'Pay Calculator',
          description:
            'Calculate your commission and bonuses based on deal profitability and product sales.',
        },
        schedule: {
          title: 'Schedule',
          description: 'View your Schedule for the week and month',
        },
        teamSchedule: {
          title: 'Team Schedule',
          description:
            'Easily view team schedules, track attendance, and manage shift assignments for optimal coverage.',
        },
        grossProfitIndicator: {
          title: 'Gross Profit Indicator',
          description: 'Easily track Front End and Back End Gross in Real Time.',
        },
        salesReports: {
          title: 'Sales Reports, Scheduler, Goals',
          description:
            'Access comprehensive sales reports, manage team schedules, and set/track monthly and yearly goals for your sales team.',
        },
        dasBoard: {
          title: 'The DAS Board',
          description:
            'View Sales Leaderboard to stay on top of your salespeople performance and rankings.',
        },
        salesPerformance: {
          title: 'Sales Performance',
          description:
            'Quick view to stay on top of sales goals, track team progress, and monitor key performance indicators.',
        },
        unitsSold: {
          title: 'Units Sold',
          description:
            'Track total units sold including new and used vehicles with daily, weekly, and monthly breakdowns.',
        },
        unitCount: {
          title: 'Unit Count',
          description:
            'Track your new car and used car totals with daily, weekly, and monthly breakdowns to monitor sales volume.',
        },
        dealLog: {
          title: 'Deal Log',
          description:
            'Stay on top of all of your deals with detailed customer information, deal status, and transaction history.',
        },
        goalTracker: {
          title: 'Goal Tracker and Pay Calculator',
          description:
            'Stay on top of your goals and MTD pay estimator to track progress and maximize earnings.',
        },
        goalQuickView: {
          title: 'Goal Quick View',
          description:
            'Easily know where you are at with your goals and track progress towards monthly and yearly targets.',
        },
        grossTracker: {
          title: 'Gross Tracker',
          description:
            'Stay on top of your gross with quick view front and back gross tracking to maximize every deal.',
        },
        fiManagerPerformance: {
          title: 'F&I Manager Performance',
          description:
            'Compare F&I Manager performance with team averages and benchmark against industry standards for maximum profitability.',
        },
        salesManagerPerformance: {
          title: 'Sales Manager Performance',
          description:
            'View Sales Manager performance against teammates and compare individual metrics across the sales management team.',
        },
        salesDasBoard: {
          title: 'Sales DAS Board',
          description:
            'View your sales person leaders and track top performers for maximum productivity while monitoring team dynamics and individual goal achievement.',
        },
        pvrDealership: {
          title: 'PVR',
          description:
            "Per Vehicle Retailed - Track the dealership's average profit per vehicle both front end and back end to see results fast.",
        },
        goalTracking: {
          title: 'Goal Tracking',
          description:
            'Quickly determine unit sales progress MTD and track performance against monthly targets.',
        },
        unitsSoldDealer: {
          title: 'Units Sold',
          description:
            'Quickly track total units sold including new and used vehicles with MTD sales.',
        },
      },
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      screenshots: 'Capturas',
      pricing: 'Precios',
      about: 'Nosotros',
      login: 'Iniciar Sesión',
      signup: 'Registrarse',
      legal: 'Legal',
    },
    home: {
      title: 'El DAS Board',
      subtitle:
        'Tableros en tiempo real que proporcionan información crítica para gerentes financieros, concesionarios y grupos de concesionarios.',
      startTrial: 'Comience su Prueba Gratuita',
      signupNow: '¡Regístrate Ahora!',
      viewScreenshots: 'Ver Capturas',
      mission:
        '"El DAS Board redefine el éxito del concesionario, capacitando a los Gerentes de Ventas para optimizar equipos y a los Gerentes Financieros para maximizar las ganancias con información clave de ventas, y a los Vendedores para mantenerse al tanto de sus ofertas." - Tyler Durden',
      features: {
        title: 'Características Clave',
        subtitle:
          'Todo lo que necesita para gestionar las operaciones de su concesionario de manera efectiva',
      },
      pricing: {
        title: 'Pruébelo Ahora',
        subtitle:
          'Comience su prueba gratuita y vea la diferencia que pueden hacer los insights en tiempo real para su concesionario.',
      },
      pricingTiers: {
        singleFinance: {
          name: 'Gerente Financiero Individual',
          price: '$20/mes tiempo limitado',
          originalPrice: '$29.99/mes',
          description:
            'Perfecto para gerentes financieros individuales que quieren rastrear su rendimiento personal',
          features: [
            'Seguimiento de ofertas personales',
            'Análisis de PVR y ganancias de productos',
            'Calculadora de pagos',
            'Métricas de rendimiento',
            'Puede ser deducible de impuestos',
          ],
          buttonText: '¡Comienza Ahora!',
          setupTime: 'Prueba sin riesgo por un mes calendario completo',
        },
        dealership: {
          name: 'Concesionario / Grupo de Concesionarios',
          price: '$250/mes base',
          description:
            'Gestión completa de concesionarios con tableros específicos para roles y gestión de equipos',
          popular: 'Más Popular',
          features: [
            'Todas las características del gerente individual',
            'Tableros de equipo para todos los roles',
            'Análisis de múltiples ubicaciones',
            'Estructuras administrativas flexibles',
          ],
          buttonText: 'Configurar Su Paquete',
          setupTime: 'Comience hoy',
        },
        priceSubtext: 'por concesionario + complementos',
      },
      cta: {
        title: '¿Listo para transformar las operaciones de su concesionario?',
        subtitle:
          'Únase a cientos de concesionarios que ya usan El DAS Board para optimizar sus operaciones.',
      },
    },
    features: {
      finance: {
        title: 'Tableros Financieros',
        desc: 'Información en tiempo real para que los gerentes financieros rastreen el rendimiento diario, registren ofertas, vean métricas incluyendo PVR, VSC y otros Productos.',
      },
      sales: {
        title: 'Tableros del Equipo de Ventas',
        desc: '¡El Das Board es su nueva Tabla de Clasificación! Mantenga un registro de sus ofertas y sepa exactamente dónde está durante el mes.',
      },
      manager: {
        title: 'Tableros del Gerente de Ventas',
        desc: 'Vea Registros de Ofertas, estadísticas de Vendedores, gestione sus Equipos de manera más efectiva.',
      },
      info: {
        title: 'Tableros Informativos',
        desc: 'Tableros específicos por rol para Equipos de Ventas, Gerentes Financieros, Gerentes de Ventas y Gerentes Generales.',
      },
      scheduler: {
        title: 'Programador Dinámico',
        desc: 'Programador dinámico de vendedores para coordinación eficiente del equipo. Gestione horarios para maximizar la producción diaria.',
      },
      calculator: {
        title: 'Calculadora de Pagos',
        desc: 'Su Equipo de Ventas y Gerentes Financieros podrán ver las ganancias en tiempo real del mes hasta la fecha con planes de pago preconfigurados.',
      },
    },
    screenshots: {
      title: 'Vea El DAS Board en Acción',
      subtitle:
        'Eche un vistazo a nuestros tableros intuitivos diseñados para profesionales automotrices.',
      finance: {
        title: 'Tablero del Gerente Financiero',
        desc: 'Rastree ofertas, métricas PVR, VSC y rendimiento diario en tiempo real.',
      },
      sales: {
        title: 'Tablero de Ventas',
        desc: 'Su tabla de clasificación personal que muestra ofertas, rankings y progreso mensual.',
      },
      manager: {
        title: 'Tablero del Gerente de Ventas',
        desc: 'Vista integral del equipo con registros de ofertas y análisis de rendimiento.',
      },
      gm: {
        title: 'Tablero del Gerente General',
        desc: 'Información de alto nivel sobre el rendimiento del concesionario y la productividad del equipo.',
      },
    },
    pricing: {
      title: 'Elija el Plan Perfecto',
      subtitle:
        'Comience con nuestra prueba gratuita para gerentes financieros, o elija el plan que se adapte a su concesionario.',
      finance: 'Gerente Financiero',
      dealership: 'Concesionario Individual',
      group: 'Grupos de Concesionarios',
      freeTime: '¡Gratis por Tiempo Limitado!',
      getStarted: 'Comenzar',
      startTrial: 'Iniciar Prueba Gratuita',
      popular: 'Más Popular',
      viewDetails: 'Ver Detalles Completos de Precios →',
      tiers: {
        finance: {
          name: 'Gerente Financiero',
          price: '¡Gratis por Tiempo Limitado!',
          originalPrice: '$5/Mes',
          description: 'Perfecto para gerentes financieros individuales',
        },
        dealership: {
          name: 'Grupos de Concesionarios Pequeños',
          price: '$250/mes por Concesionario',
          description: '1-5 Concesionarios',
        },
        group: {
          name: 'Grupos de Concesionarios 6+',
          price: '$200/Mes por Concesionario*',
          description: 'Todo lo que ofrece Concesionario Único más Tablero VP de Área',
        },
      },
    },
    about: {
      title: 'Quiénes Somos',
      subtitle:
        'Profesionales apasionados dedicados a revolucionar la gestión de concesionarios a través de tecnología innovadora e insights basados en datos.',
      founderVision: {
        title: 'Por qué Creé The DAS Board – Tyler Durden, CEO y Fundador',
        paragraph1:
          'Con más de 27 años de experiencia en la industria de concesionarios automotrices, he visto de primera mano los desafíos que enfrentan los gerentes al equilibrar sus roles como líderes y ejecutores. Como profesional experimentado, fundé The DAS Board para abordar una brecha crítica que observé: mientras que los Gerentes de Ventas sobresalen vendiendo autos, a menudo luchan para gestionar efectivamente sus equipos de ventas.',
        paragraph2:
          'Creo que los vendedores informados, motivados y bien apoyados son la clave para impulsar resultados excepcionales, superando ampliamente los resultados de equipos descomprometidos o desinformados. The DAS Board empodera a los Gerentes de Ventas con herramientas intuitivas para liderar sus equipos de manera más efectiva, asegurando que puedan enfocarse tanto en el desarrollo del equipo como en la excelencia en ventas.',
        paragraph3:
          'Más allá de las ventas, la aplicación apoya a los Gerentes Financieros proporcionando insights en tiempo real sobre la rentabilidad de las ofertas y métricas clave, mientras ofrece a los GMs reportes accionables para guiar decisiones estratégicas. Mi visión con The DAS Board es revolucionar la gestión de concesionarios, fomentando una cultura de eficiencia, transparencia y éxito en todos los niveles de la organización.',
      },
      team: {
        title: 'Nuestro Equipo',
        members: {
          tyler: {
            name: 'Tyler Durden',
            role: 'CEO y Fundador',
            bio: 'Basándose en una amplia experiencia en gestión de concesionarios, Tyler Durden fundó The DAS Board para fomentar una cultura donde los empleados informados y motivados prosperen, impulsando la productividad a través de herramientas transparentes basadas en datos que empoderan a los equipos automotrices.',
          },
          sarah: {
            name: 'Sarah Conner',
            role: 'Directora de Producto',
            bio: 'Con más de 25 años de experiencia en concesionarios y venta al por menor, Sarah Conner aporta conocimientos profundos para lograr el éxito en ventas. Entiende el poder de las herramientas efectivas y la gestión hábil para inspirar equipos, asegurando que The DAS Board impulse resultados excepcionales para los concesionarios.',
          },
          claude: {
            name: 'Claude Sonnet',
            role: 'Director de Tecnología',
            bio: 'Claude Sonnet aporta una profunda experiencia en la creación de software que sobresale, con un enfoque en plataformas escalables y seguras. Su capacidad para entregar insights sin complejidad asegura que The DAS Board proporcione tecnología confiable y sin problemas para los concesionarios.',
          },
          annie: {
            name: 'Annie Porter',
            role: 'Directora de Éxito del Cliente',
            bio: 'Dedicada a asegurar que cada cliente de DAS Board obtenga el máximo de nuestra plataforma a través de incorporación personalizada y soporte',
          },
        },
      },
      values: {
        title: 'Nuestros Valores',
        customerFocused: {
          title: 'Enfocados en el Cliente',
          description:
            'Empoderamos a los concesionarios automotrices con tableros intuitivos que priorizan sus necesidades únicas, asegurando una gestión perfecta y experiencias mejoradas para el cliente.',
        },
        dataDriven: {
          title: 'Basados en Datos',
          description:
            'Nuestra plataforma entrega insights accionables en tiempo real de datos de concesionarios, permitiendo toma de decisiones precisa para impulsar las ventas y la eficiencia operacional.',
        },
        continuousImprovement: {
          title: 'Mejora Continua',
          description:
            'Refinamos incansablemente nuestras herramientas para ayudar a los concesionarios a optimizar el rendimiento, adaptarse a las tendencias de la industria y lograr un crecimiento sostenido.',
        },
      },
      contact: {
        title: 'Contactános',
        subtitle:
          '¿Listo para ver cómo The DAS Board puede transformar las operaciones de su concesionario? Nos encantaría saber de usted.',
        email: 'Email',
        phone: 'Teléfono',
      },
    },
    signup: {
      title: 'Únete a The DAS Board',
      subtitle: 'Comienza con tu solución de gestión de concesionarios hoy.',
      selectLanguage: 'Selecciona Tu Idioma',
      dealerGroup: 'Registro de Grupo de Concesionarios',
      dealership: 'Registro de Concesionario',
      financeManager: 'Registro de Gerente Financiero',
      simple: {
        title: 'Registro Sencillo',
        subtitle: 'Comienza Gratis',
        description: 'Regístrate como Gerente Financiero Individual en menos de 2 minutos',
        submitButton: 'Comenzar Cuenta Gratuita',
        whyTitle: '¿Por qué Gerente Financiero Individual?',
        whyBenefits: [
          'Rastrea tus métricas de rendimiento personal',
          'Calcula tu pago con datos en tiempo real',
          'Monitorea tu PVR y penetración de productos',
          'Completamente GRATIS para uso individual',
        ],
      },
      form: {
        firstName: 'Nombre',
        lastName: 'Apellido',
        fullName: 'Nombre Completo',
        email: 'Dirección de Email',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        dealershipName: 'Nombre del Concesionario',
        role: 'Tu Rol',
        phone: 'Número de Teléfono',
        submit: 'Crear Cuenta',
        alreadyHave: '¿Ya tienes una cuenta?',
        signIn: 'Iniciar Sesión',
        terms: 'Acepto los Términos de Servicio y la Política de Privacidad',
        agreePrefix: 'Acepto los',
        emailNote: 'Debe ser una dirección de email verificada del concesionario',
      },
    },
    dashboard: {
      singleFinance: {
        title: 'Panel de Control del Gerente Financiero Individual',
        kpi: {
          fiGross: 'F&I Bruto',
          dealsProcessed: 'Ofertas Procesadas',
          dealTypes: 'Tipos de Ofertas',
          productsPerDeal: 'Productos por Oferta',
          pvr: 'PVR',
          pvrFull: 'PVR (Por Vehículo Comercializado)',
        },
        dealTypes: {
          finance: 'Financiado',
          cash: 'Contado',
          lease: 'Arrendamiento',
        },
        productMix: {
          title: 'Mezcla y Rendimiento de Productos',
          product: 'Producto',
          avgProfit: 'Ganancia Promedio',
          penetration: 'Penetración',
          extendedWarranty: 'Garantía Extendida',
          gapInsurance: 'Seguro GAP',
          paintProtection: 'Protección de Pintura',
          tireWheel: 'Ruedas y Neumáticos',
          ppm: 'PPM',
          theft: 'Protección contra Robo',
          bundled: 'Empaquetado',
          other: 'Otros',
        },
        payCalculator: {
          title: 'Calculadora de Pago',
          grossProfit: 'Ganancia Bruta',
          payPlan: 'Plan de Pago',
          estimatedPay: 'Pago Estimado',
          baseAmount: 'Cantidad Base',
          bonusAmount: 'Cantidad de Bono',
          totalPay: 'Pago Total',
        },
        dealsLog: {
          title: 'Registro de Ofertas Recientes',
          refresh: 'Actualizar',
          viewAll: 'Ver Todo',
          number: '#',
          lastName: 'Apellido',
          date: 'Fecha',
          gross: 'Bruto',
          products: 'Productos',
          status: 'Estado',
        },
        timePeriod: {
          thisMonth: 'Este Mes',
          lastMonth: 'Mes Pasado',
          lastQuarter: 'Último Trimestre',
          ytd: 'Acumulado del Año',
          lastYear: 'Año Pasado',
          custom: 'Personalizado',
        },
        status: {
          pending: 'Pendiente',
          funded: 'Financiado',
          unwound: 'Cancelado',
          deadDeal: 'Oferta Muerta',
        },
      },
      deals: {
        title: 'Gerente Financiero Individual - Ofertas',
        backToDashboard: 'Volver al Panel',
        note: 'Estas ofertas son específicas de su Panel de Control del Gerente Financiero Individual y se almacenan por separado de las ofertas financieras principales.',
        searchPlaceholder: 'Buscar ofertas por cliente, vehículo, # de oferta o VIN',
        allStatuses: 'Todos los Estados',
        tableHeaders: {
          number: '#',
          lastName: 'Apellido',
          dealNumber: '# de Oferta',
          stockNumber: '# de Stock',
          date: 'Fecha',
          vin: 'VIN',
          vehicleType: 'N/U/CPO',
          lender: 'Prestamista',
          frontEnd: 'Front End',
          vsc: 'VSC',
          ppm: 'PPM',
          gap: 'GAP',
          tireWheel: 'R&N',
          appearance: 'App',
          theft: 'Robo',
          bundled: 'Empaquetado',
          ppd: 'PPD',
          pvr: 'PVR',
          total: 'Total',
          status: 'Estado',
          edit: 'Editar',
          delete: 'Eliminar',
        },
        vehicleTypes: {
          new: 'N',
          used: 'U',
          cpo: 'C',
        },
        statusOptions: {
          pending: 'Pendiente',
          funded: 'Financiado',
          held: 'Retenido',
          unwound: 'Cancelado',
          deadDeal: 'Oferta Muerta',
        },
        noDealsFound: 'No se encontraron ofertas que coincidan con sus criterios de búsqueda.',
        noDealsYet:
          "Aún no se han registrado ofertas. Use el botón 'Registrar Nueva Oferta' para agregar ofertas.",
        showingDeals: 'Mostrando {count} de {total} ofertas',
        totalGross: 'Total Bruto:',
        backEndTotal: 'Total Back End:',
        confirmDelete:
          '⚠️ CONFIRMACIÓN DE ELIMINACIÓN\n\n¿Está seguro de que desea eliminar esta oferta?\n\nEsta acción:\n• Eliminará permanentemente todos los datos de la oferta\n• Actualizará las métricas de su panel de control\n• No se puede deshacer\n\nHaga clic en Aceptar para eliminar o Cancelar para mantener la oferta.',
        finalConfirmDelete:
          '🚨 CONFIRMACIÓN FINAL\n\n¡Esta es su última oportunidad!\n\nHaga clic en Aceptar para eliminar permanentemente esta oferta, o Cancelar para mantenerla.',
        editButton: 'Editar',
      },
      dealLog: {
        title: 'Registrar Nueva Oferta',
        editDeal: 'Editar Oferta - Panel Financiero Individual',
        backToDashboard: 'Volver al Panel',
        note: 'Nota',
        editingNote:
          'Está editando una oferta existente. Los cambios se reflejarán inmediatamente en su panel de control.',
        dashboardNote:
          'Esta oferta solo aparecerá en su Panel de Control del Gerente Financiero Individual y no afectará otros paneles en el sistema.',
        dealInformation: 'Información de la Oferta',
        dealNumber: '# de Oferta',
        enterDealNumber: 'Ingrese el número de oferta',
        saleDate: 'Fecha de Venta',
        stockNumber: '# de Stock',
        vinLast8: 'VIN # (Últimos 8)',
        vinPlaceholder: 'Últimos 8 del VIN',
        vehicleType: 'Tipo de Vehículo',
        vehicleTypes: {
          new: 'Nuevo',
          used: 'Usado',
          cpo: 'CPO',
        },
        manufacturer: 'Fabricante',
        selectManufacturer: 'Seleccionar Fabricante',
        customerName: 'Apellido del Cliente',
        customerPlaceholder: 'Apellido del cliente',
        salesperson: 'Vendedor',
        selectSalesperson: 'Seleccionar Vendedor',
        splitDeal: 'Oferta Dividida',
        selectSecondSalesperson: 'Seleccionar Segundo Vendedor',
        salesManager: 'Gerente de Ventas',
        selectManager: 'Seleccionar Gerente',
        lender: 'Prestamista',
        selectLender: 'Seleccionar Prestamista',
        dealType: 'Tipo de Oferta',
        dealTypes: {
          cash: 'Contado',
          finance: 'Financiado',
          lease: 'Arrendamiento',
        },
        status: 'Estado',
        statusOptions: {
          pending: 'Pendiente',
          funded: 'Financiado',
        },
        productsAndProfit: 'Productos y Ganancia',
        products: {
          vscProfit: 'Ganancia VSC',
          gapProfit: 'Ganancia GAP',
          ppmProfit: 'Ganancia PPM',
          tireWheelProfit: 'Ganancia Ruedas y Neumáticos',
          appearanceProfit: 'Ganancia Apariencia',
          theftProfit: 'Ganancia Robo',
          bundledProfit: 'Ganancia Empaquetado',
          otherProfit: 'Otras Ganancias',
        },
        financialSummary: 'Resumen Financiero',
        frontEndGross: 'Front End Bruto',
        reserveFlat: 'Reserva/Plano',
        backEndGross: 'Back End Bruto',
        autoCalculated: 'Auto-Calculado',
        totalGross: 'Total Bruto',
        allFieldsRequired: 'Todos los campos deben completarse.',
        cancel: 'Cancelar',
        saveDeal: 'Guardar Oferta',
        updateDeal: 'Actualizar Oferta',
        savingDeal: 'Guardando Oferta...',
        updatingDeal: 'Actualizando Oferta...',
        addNewSalesperson: 'Agregar Nuevo Vendedor',
        firstName: 'Nombre',
        lastName: 'Apellido',
        addSalesperson: 'Agregar Vendedor',
      },
      settings: {
        title: 'Configuraciones',
        teamManagement: 'Miembros del Equipo',
        payConfiguration: 'Configurador de Pago',
        languageSettings: 'Configuración de Idioma',
        addNewMember: 'Agregar Nuevo Miembro del Equipo',
        firstName: 'Nombre',
        lastName: 'Apellido',
        role: 'Rol',
        addMember: 'Agregar Miembro',
        roles: {
          salesperson: 'Vendedor',
          salesManager: 'Gerente de Ventas',
        },
        commissionBasePay: 'Comisión y Pago Base',
        commissionRate: 'Tasa de Comisión (%)',
        baseRate: 'Tasa Base ($)',
        vscBonus: 'Bono VSC ($)',
        gapBonus: 'Bono GAP ($)',
        ppmBonus: 'Bono PPM ($)',
        totalThreshold: 'Umbral Total ($)',
        saveConfiguration: 'Guardar Configuración',
        currentLanguage: 'Idioma Actual',
        selectLanguage: 'Seleccionar Idioma',
        languageUpdated: 'Idioma actualizado con éxito',
      },
    },
    common: {
      language: 'Idioma',
      login: 'Iniciar Sesión',
      signUp: 'Registrarse',
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      continue: 'Continuar',
      back: 'Volver',
      next: 'Siguiente',
      submit: 'Enviar',
      close: 'Cerrar',
    },
    footer: {
      tagline: 'Software moderno de gestión de concesionarios con insights en tiempo real.',
      industry: 'Ventas Automotrices de Concesionarios',
      product: 'Producto',
      legal: 'Legal',
      contact: 'Contacto',
      support: 'Para soporte o consultas, por favor contáctenos en:',
      copyright: '© 2025 The DAS Board. Todos los derechos reservados. Diseñado con 🖤',
      terms: 'Términos de Servicio',
      privacy: 'Política de Privacidad',
      subscription: 'Acuerdo de Suscripción',
      home: 'Inicio',
      screenshots: 'Capturas',
      pricing: 'Precios',
      aboutUs: 'Nosotros',
    },
    currency: {
      symbol: '$',
      name: 'USD',
    },
    legal: {
      terms: {
        title: 'Términos de Servicio',
        lastUpdated: 'Última actualización: 6/28/2025',
        intro:
          'Bienvenido a The DAS Board. Estos Términos de Servicio ("Términos") rigen su acceso y uso de nuestra plataforma de software de gestión de concesionarios. Al acceder o utilizar nuestros servicios, acepta estar sujeto a estos Términos.',
        sections: {
          acceptance: {
            title: '1. Aceptación de Términos',
            content:
              'Al crear una cuenta, acceder o utilizar The DAS Board, reconoce que ha leído, entendido y acepta estar sujeto a estos Términos y nuestra Política de Privacidad. Si no está de acuerdo con estos Términos, no puede utilizar nuestros servicios. Debe tener al menos 18 años y tener la autoridad para celebrar estos Términos en nombre de su organización.',
          },
          service: {
            title: '2. Descripción del Servicio',
            content:
              'The DAS Board es una plataforma de software de gestión de concesionarios basada en la nube que proporciona herramientas para gestión de inventario, seguimiento de ventas, gestión de relaciones con clientes, informes financieros y servicios relacionados con la industria automotriz. Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto de nuestro servicio con notificación razonable.',
          },
          account: {
            title: '3. Registro de Cuenta y Seguridad',
            content:
              'Para utilizar nuestros servicios, debe crear una cuenta con información precisa y completa. Usted es responsable de:',
            items: [
              'Mantener la confidencialidad de las credenciales de su cuenta',
              'Todas las actividades que ocurran bajo su cuenta',
              'Notificarnos inmediatamente de cualquier uso no autorizado',
              'Asegurar que la información de su cuenta permanezca actualizada y precisa',
              'Cumplir con nuestros requisitos de seguridad y mejores prácticas',
            ],
          },
          subscription: {
            title: '4. Términos de Suscripción y Pago',
            content: 'The DAS Board opera bajo un modelo de suscripción. Al suscribirse, acepta:',
            items: [
              'Pagar todas las tarifas asociadas con su plan de suscripción',
              'Renovación automática a menos que se cancele antes de la fecha de renovación',
              'Cambios en las tarifas con aviso de 30 días',
              'Sin reembolsos por períodos de suscripción parciales',
              'Suspensión del servicio por falta de pago después de notificación razonable',
            ],
          },
          usage: {
            title: '5. Política de Uso Aceptable',
            content:
              'Acepta utilizar The DAS Board solo para propósitos legales y de acuerdo con estos Términos. No puede:',
            items: [
              'Violar leyes, regulaciones o derechos de terceros aplicables',
              'Cargar contenido dañino, ofensivo o inapropiado',
              'Intentar obtener acceso no autorizado a nuestros sistemas o cuentas de otros usuarios',
              'Usar el servicio para enviar spam, malware u otro contenido malicioso',
              'Realizar ingeniería inversa, descompilar o intentar extraer código fuente',
              'Interferir o interrumpir la integridad o rendimiento de nuestros servicios',
              'Usar la plataforma para actividades fraudulentas o ilegales',
            ],
          },
          intellectual: {
            title: '6. Derechos de Propiedad Intelectual',
            content:
              'The DAS Board y toda la tecnología, contenido y materiales relacionados son propiedad nuestra o de nuestros licenciantes. Esto incluye:',
            items: [
              'Software, algoritmos e interfaces de usuario',
              'Marcas comerciales, logotipos y materiales de marca',
              'Documentación, tutoriales y materiales de soporte',
              'Análisis, informes y perspectivas de datos agregados',
            ],
            footer:
              'Usted retiene la propiedad de sus datos pero nos otorga una licencia para usarlos para proporcionar nuestros servicios. Podemos usar datos anonimizados y agregados para investigación de la industria y mejora de la plataforma.',
          },
          privacy: {
            title: '7. Protección de Datos y Privacidad',
            content:
              'Usted es responsable de asegurar que cualquier dato personal que procese a través de nuestra plataforma cumpla con las leyes de privacidad aplicables. Procesaremos datos de acuerdo con nuestra Política de Privacidad y regulaciones de protección de datos aplicables, incluyendo GDPR y CCPA donde sea aplicable.',
          },
          availability: {
            title: '8. Disponibilidad del Servicio y Soporte',
            content:
              'Aunque nos esforzamos por alta disponibilidad, no garantizamos servicio ininterrumpido. Proporcionamos:',
            items: [
              '99.9% SLA de tiempo de actividad para suscripciones pagadas',
              'Ventanas de mantenimiento regulares con aviso previo',
              'Soporte técnico basado en su nivel de suscripción',
              'Monitoreo de seguridad y respuesta a incidentes',
            ],
          },
          termination: {
            title: '9. Terminación',
            content: 'Cualquiera de las partes puede terminar estos Términos:',
            items: [
              'Puede cancelar su suscripción en cualquier momento a través de la configuración de su cuenta',
              'Podemos terminar por incumplimiento de estos Términos con notificación razonable',
              'Podemos suspender el servicio inmediatamente por violaciones graves o amenazas de seguridad',
              'Al terminar, perderá acceso a la plataforma y sus datos',
              'Proporcionaremos una oportunidad razonable para exportar sus datos antes de la eliminación',
            ],
          },
          disclaimers: {
            title: '10. Exenciones de Responsabilidad y Limitaciones de Responsabilidad',
            content:
              'THE DAS BOARD SE PROPORCIONA "TAL COMO ESTÁ" SIN GARANTÍAS DE NINGÚN TIPO. HASTA EL MÁXIMO PERMITIDO POR LA LEY:',
            items: [
              'Renunciamos a todas las garantías, expresas o implícitas, incluyendo comerciabilidad e idoneidad para un propósito particular',
              'No somos responsables por daños indirectos, incidentales, especiales o consecuentes',
              'Nuestra responsabilidad total no excederá las tarifas pagadas por usted en los 12 meses anteriores al reclamo',
              'Reconoce que el software puede contener errores y acepta reportarlos prontamente',
            ],
          },
          indemnification: {
            title: '11. Indemnización',
            content:
              'Acepta indemnizar y eximirnos de cualquier reclamo, pérdida o daño que surja de su uso de nuestros servicios, violación de estos Términos o infracción de derechos de terceros.',
          },
          governing: {
            title: '12. Ley Aplicable y Resolución de Disputas',
            content:
              'Estos Términos se rigen por las leyes de [Jurisdicción] sin considerar principios de conflicto de leyes. Cualquier disputa se resolverá a través de arbitraje vinculante, excepto por reclamos de medidas cautelares que pueden presentarse en tribunales apropiados.',
          },
          changes: {
            title: '13. Cambios en los Términos',
            content:
              'Podemos modificar estos Términos de vez en cuando. Proporcionaremos notificación de cambios materiales con al menos 30 días de anticipación. El uso continuado de nuestros servicios después de que los cambios entren en vigor constituye aceptación de los Términos revisados.',
          },
          entire: {
            title: '14. Acuerdo Completo',
            content:
              'Estos Términos, junto con nuestra Política de Privacidad y cualquier acuerdo adicional, constituyen el acuerdo completo entre usted y The DAS Board con respecto al uso de nuestros servicios.',
          },
          contact: {
            title: '15. Información de Contacto',
            content: 'Si tiene preguntas sobre estos Términos, por favor contáctenos:',
            email: 'legal@thedasboard.com',
            address: '[Dirección de la Empresa]',
            phone: '[Número de Teléfono de Soporte]',
          },
        },
      },
      privacy: {
        title: 'Política de Privacidad',
        lastUpdated: 'Última Actualización: 28/6/2025',
        intro:
          'Esta Política de Privacidad describe cómo The DAS Board ("nosotros", "nos" o "nuestro") recopila, utiliza y protege su información personal cuando utiliza nuestra plataforma de software de gestión de concesionarios. Estamos comprometidos a proteger su privacidad y manejar sus datos de manera responsable.',
        sections: {
          collection: {
            title: '1. Información que Recopilamos',
            content:
              'Cuando utiliza The DAS Board, recopilamos varios tipos de información para proporcionar y mejorar nuestros servicios:',
            items: [
              '<strong>Información de Cuenta:</strong> Nombre, dirección de correo electrónico, número de teléfono, nombre de la empresa, cargo y información de facturación',
              '<strong>Datos del Concesionario:</strong> Inventario de vehículos, registros de ventas, información del cliente y transacciones financieras',
              '<strong>Datos de Uso:</strong> Funciones accedidas, tiempo pasado en la plataforma, interacciones del usuario y métricas de rendimiento',
              '<strong>Datos Técnicos:</strong> Dirección IP, tipo de navegador, información del dispositivo, sistema operativo y registros de acceso',
              '<strong>Datos de Comunicación:</strong> Solicitudes de soporte, comentarios y correspondencia con nuestro equipo',
              '<strong>Datos de Ubicación:</strong> Direcciones del concesionario y, con consentimiento, ubicación del dispositivo para funciones móviles',
            ],
          },
          usage: {
            title: '2. Cómo Utilizamos Su Información',
            content:
              'Utilizamos la información recopilada para propósitos comerciales legítimos, incluyendo:',
            items: [
              'Proporcionar, mantener y mejorar la plataforma y funciones de The DAS Board',
              'Procesar suscripciones, pagos y gestionar su cuenta',
              'Generar análisis, informes e insights comerciales para su concesionario',
              'Proporcionar soporte al cliente y responder a sus consultas',
              'Enviar actualizaciones de servicio, alertas de seguridad y mensajes administrativos',
              'Detectar, prevenir y abordar problemas técnicos y amenazas de seguridad',
              'Cumplir con obligaciones legales y regulaciones de la industria',
              'Mejorar la experiencia del usuario a través del desarrollo e investigación de productos',
            ],
          },
          sharing: {
            title: '3. Compartir Su Información',
            content:
              'No vendemos, alquilamos ni intercambiamos su información personal. Podemos compartir su información solo en las siguientes circunstancias:',
            items: [
              '<strong>Proveedores de Servicios:</strong> Vendedores terceros que nos ayudan a operar nuestra plataforma (hosting, análisis, procesamiento de pagos)',
              '<strong>Socios Comerciales:</strong> Integraciones autorizadas y socios de la industria automotriz con su consentimiento explícito',
              '<strong>Requisitos Legales:</strong> Cuando sea requerido por ley, regulación o proceso legal válido',
              '<strong>Transferencias Comerciales:</strong> En conexión con fusiones, adquisiciones o ventas de activos (con aviso previo)',
              '<strong>Seguridad y Protección:</strong> Para proteger los derechos, propiedad o seguridad de nuestros usuarios o el público',
            ],
          },
          retention: {
            title: '4. Retención de Datos',
            content:
              'Retenemos su información personal durante el tiempo necesario para proporcionar nuestros servicios y cumplir con obligaciones legales. Específicamente:',
            items: [
              'Los datos de cuenta se retienen mientras su suscripción esté activa y por 3 años después de la terminación',
              'Los registros de transacciones se mantienen por 7 años para cumplir con regulaciones financieras',
              'Los registros de uso se retienen por 2 años para análisis de seguridad y rendimiento',
              'Los registros de comunicación se mantienen por 5 años para propósitos de servicio al cliente',
            ],
          },
          rights: {
            title: '5. Sus Derechos y Opciones',
            content:
              'Dependiendo de su ubicación, puede tener los siguientes derechos con respecto a su información personal:',
            items: [
              '<strong>Acceso:</strong> Solicitar una copia de su información personal que mantenemos',
              '<strong>Corrección:</strong> Actualizar o corregir información personal inexacta',
              '<strong>Eliminación:</strong> Solicitar la eliminación de su información personal (sujeto a obligaciones legales)',
              '<strong>Portabilidad:</strong> Recibir sus datos en un formato legible por máquina',
              '<strong>Restricción:</strong> Limitar cómo procesamos su información personal',
              '<strong>Objeción:</strong> Objetar el procesamiento basado en intereses legítimos',
            ],
          },
          cookies: {
            title: '6. Cookies y Tecnologías de Seguimiento',
            content: 'Utilizamos cookies y tecnologías similares para mejorar su experiencia:',
            items: [
              '<strong>Cookies Esenciales:</strong> Requeridas para la funcionalidad y seguridad de la plataforma',
              '<strong>Cookies de Análisis:</strong> Nos ayudan a entender cómo utiliza nuestra plataforma',
              '<strong>Cookies de Preferencia:</strong> Recuerdan sus configuraciones y personalizaciones',
              '<strong>Cookies de Marketing:</strong> Utilizadas para comunicaciones dirigidas (con su consentimiento)',
            ],
            footer:
              'Puede controlar las preferencias de cookies a través de la configuración de su navegador o nuestra herramienta de gestión de cookies.',
          },
          security: {
            title: '7. Medidas de Seguridad',
            content:
              'Implementamos medidas de seguridad estándar de la industria para proteger su información, incluyendo:',
            items: [
              'Cifrado de datos en tránsito y en reposo utilizando estándares AES-256',
              'Auditorías de seguridad regulares y pruebas de penetración',
              'Autenticación multifactor y controles de acceso',
              'Cumplimiento SOC 2 Type II y evaluaciones de seguridad regulares',
              'Capacitación de empleados sobre protección de datos y mejores prácticas de seguridad',
            ],
          },
          international: {
            title: '8. Transferencias Internacionales de Datos',
            content:
              'Su información puede ser transferida y procesada en países distintos al suyo. Garantizamos que se implementen las salvaguardas apropiadas, incluyendo Cláusulas Contractuales Estándar y decisiones de adecuación, para proteger sus datos durante las transferencias internacionales.',
          },
          children: {
            title: '9. Privacidad de Menores',
            content:
              'The DAS Board no está destinado para uso por individuos menores de 18 años. No recopilamos conscientemente información personal de menores de 18 años. Si nos enteramos de tal recopilación, eliminaremos la información inmediatamente.',
          },
          changes: {
            title: '10. Cambios a Esta Política de Privacidad',
            content:
              'Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas o requisitos legales. Le notificaremos sobre cambios significativos por correo electrónico o notificación en la plataforma al menos 30 días antes de que entren en vigor.',
          },
          contact: {
            title: '11. Contáctenos',
            content:
              'Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, por favor contáctenos:',
            email: 'privacy@thedasboard.com',
            address: '[Company Address]',
            phone: '[Support Phone Number]',
          },
        },
      },
      subscription: {
        title: 'Acuerdo de Suscripción',
        lastUpdated: 'Última Actualización: 6/28/2025',
        intro:
          'Este Acuerdo de Suscripción rige su suscripción y uso de la plataforma de gestión de concesionarios The DAS Board.',
        sections: {
          plans: {
            title: '1. Planes de Suscripción',
            content:
              'The DAS Board ofrece niveles de suscripción diseñados para diferentes necesidades de concesionarios:',
            items: [
              '<strong>Prueba Gratuita de 60 Días:</strong> Acceso completo a la plataforma sin tarjeta de crédito requerida',
              '<strong>Gerente Financiero:</strong> Acceso individual de usuario con herramientas financieras centrales',
              '<strong>Concesionario:</strong> Acceso multiusuario con gestión completa de inventario y ventas',
              '<strong>Grupo de Concesionarios:</strong> Acceso a nivel empresarial en múltiples ubicaciones',
            ],
            footer:
              'Las suscripciones se facturan mensualmente por adelantado. Puede actualizar o degradar su suscripción en cualquier momento, con cambios que toman efecto en el próximo ciclo de facturación.',
          },
          payment: {
            title: '2. Términos de Pago',
            content:
              'El pago vence al comienzo de la suscripción y el mismo día de cada mes posterior. Aceptamos las principales tarjetas de crédito y transferencias ACH para cuentas empresariales. Si el pago falla, podemos suspender su acceso a The DAS Board después de un aviso razonable.',
          },
          trial: {
            title: '3. Período de Prueba',
            content:
              'La prueba de 60 días proporciona acceso completo a la plataforma The DAS Board. No se requiere tarjeta de crédito para comenzar su prueba. Al final del período de prueba, necesitará seleccionar un plan pagado para continuar usando la plataforma. Los datos de prueba se conservarán durante 30 días después de la expiración de la prueba.',
          },
          cancellation: {
            title: '4. Cancelación y Reembolsos',
            content:
              'Puede cancelar su suscripción en cualquier momento a través de la configuración de su cuenta o contactando a nuestro equipo de soporte. Tras la cancelación:',
            items: [
              'Mantendrá acceso hasta el final de su período de facturación actual',
              'No se proporcionan reembolsos por meses parciales de servicio',
              'Sus datos estarán disponibles para exportación durante 90 días después de la cancelación',
              'La renovación automática será deshabilitada',
            ],
          },
          sla: {
            title: '5. Acuerdo de Nivel de Servicio',
            content: 'Para suscripciones pagadas, nos comprometemos a:',
            items: [
              '99.9% de disponibilidad de tiempo de actividad de la plataforma',
              'Ventanas de mantenimiento programadas con aviso de 48 horas',
              'Respuesta de soporte al cliente dentro de 24 horas para solicitudes estándar',
              'Soporte prioritario para suscriptores de Grupo de Concesionarios',
            ],
          },
          data: {
            title: '6. Datos y Seguridad',
            content: 'Los datos de su concesionario siguen siendo su propiedad. Proporcionamos:',
            items: [
              'Copias de seguridad automatizadas diarias con retención de 30 días',
              'Protocolos de cifrado y seguridad a nivel bancario',
              'Cumplimiento GDPR y CCPA para protección de datos',
              'Capacidades de exportación de datos en formatos estándar',
            ],
          },
          support: {
            title: '7. Soporte y Capacitación',
            content: 'Todas las suscripciones pagadas incluyen:',
            items: [
              'Asistencia integral de incorporación y configuración',
              'Recursos de capacitación en línea y documentación',
              'Soporte por email y chat durante horario comercial',
              'Actualizaciones regulares de la plataforma y lanzamientos de nuevas funciones',
            ],
          },
          modifications: {
            title: '8. Modificaciones al Servicio',
            content:
              'Podemos modificar o actualizar la plataforma The DAS Board para mejorar la funcionalidad, seguridad o cumplimiento. Proporcionaremos aviso razonable de cambios significativos que puedan afectar su uso.',
          },
        },
      },
      pricingPage: {
        title: 'Selecciona Tu',
        titleHighlight: 'Solución',
        subtitle:
          'Selecciona la opción que mejor describe tus necesidades. Personalizaremos tu experiencia en consecuencia.',
        singleFinance: {
          title: 'Gerente Financiero Individual',
          description:
            'Perfecto para gerentes financieros individuales que quieren rastrear su rendimiento personal y ofertas.',
          originalPrice: '$29.99/mes',
          price: '$20/mes tiempo limitado',
          features: [
            'Seguimiento de ofertas personales',
            'Análisis de PVR y ganancias de productos',
            'Calculadora de pagos',
            'Métricas de rendimiento',
            'Puede ser deducible de impuestos',
          ],
          buttonText: '¡Comienza Ahora!',
          setupTime: 'Prueba sin riesgo por un mes calendario completo',
        },
        dealership: {
          title: 'Concesionario / Grupo de Concesionarios',
          description:
            'Gestión completa de concesionarios con tableros específicos para roles, gestión de equipos y soporte multi-ubicación.',
          price: '$250/mes base',
          priceSubtext: 'por concesionario + complementos',
          popular: 'Más Popular',
          features: [
            'Todas las características del gerente individual',
            'Tableros de equipo para todos los roles',
            'Análisis de múltiples ubicaciones',
            'Estructuras administrativas flexibles',
            'Descuentos por volumen disponibles',
          ],
          buttonText: 'Ver Precios de Paquete Dinámico',
          setupTime: 'Comience hoy',
        },
        benefits: {
          title: 'Transforma Tu Concesionario Hoy',
          performance: {
            title: 'Aumenta el Rendimiento',
            description:
              'Los insights en tiempo real ayudan a los equipos a superar metas y maximizar la rentabilidad',
          },
          operations: {
            title: 'Optimiza las Operaciones',
            description:
              'La gestión centralizada reduce el tiempo administrativo y mejora la eficiencia',
          },
          security: {
            title: 'Seguro y Confiable',
            description:
              'Seguridad de nivel empresarial con garantía de 99.9% de tiempo de actividad',
          },
        },
        helpText: {
          title: '¿No estás seguro de qué opción elegir?',
          description:
            'Comienza con la opción de gerente financiero individual para probar nuestra plataforma, luego actualiza fácilmente a características de concesionario cuando estés listo para expandir tu equipo.',
        },
        footer: {
          copyright: '© 2025 The DAS Board. Todos los derechos reservados.',
          support: '¿Preguntas? Contáctanos en',
          email: 'support@thedasboard.com',
        },
      },
    },
    demoPage: {
      backToHome: 'Volver al Inicio',
      title: 'Experimente El DAS Board',
      startFreeTrial: 'Iniciar Prueba Gratuita',
      subtitle:
        'Explore nuestra demostración interactiva para ver cómo diferentes roles usan nuestro tablero',
      dashboards: {
        salesperson: {
          title: 'Tablero del Vendedor',
          description: 'Seguimiento de ventas individuales y gestión de clientes',
        },
        finance: {
          title: 'Tablero del Gerente Financiero',
          description: 'Seguimiento del rendimiento y ofertas del gerente financiero individual',
        },
        salesManager: {
          title: 'Tablero del Gerente de Ventas',
          description: 'Gestión de equipo y visión general del rendimiento de ventas',
        },
        generalManager: {
          title: 'Tablero del Gerente General',
          description: 'Visión general completa del concesionario y análisis',
        },
      },
      hotspots: {
        productTracking: {
          title: 'Seguimiento de Productos',
          description:
            'Monitoree el rendimiento de ventas de productos, rastree garantías, GAP y otros productos F&I para maximizar la rentabilidad por oferta.',
        },
        performanceMetrics: {
          title: 'Métricas de Rendimiento',
          description:
            'Monitoree su rendimiento personal con métricas clave como PVR (Por Vehículo Vendido), productos por oferta y objetivos mensuales.',
        },
        teamPerformance: {
          title: 'Rendimiento del Equipo',
          description:
            'Compare su rendimiento con los promedios del equipo y vea cómo se clasifica entre sus colegas.',
        },
        recentDealsLog: {
          title: 'Registro de Ofertas Recientes',
          description:
            'Vea y gestione sus ofertas más recientes con acceso rápido a detalles del cliente y rentabilidad de la oferta.',
        },
        pvr: {
          title: 'PVR',
          description:
            'Por Vehículo Vendido - Rastree su ganancia promedio por vehículo y vea cómo se compara con los objetivos y promedios del equipo.',
        },
        payCalculator: {
          title: 'Calculadora de Pagos',
          description:
            'Calcule su comisión y bonificaciones basadas en la rentabilidad de la oferta y ventas de productos.',
        },
        schedule: {
          title: 'Horario',
          description: 'Vea su horario para la semana y el mes',
        },
        teamSchedule: {
          title: 'Horario del Equipo',
          description:
            'Vea fácilmente los horarios del equipo, rastree la asistencia y gestione asignaciones de turnos para cobertura óptima.',
        },
        grossProfitIndicator: {
          title: 'Indicador de Ganancia Bruta',
          description: 'Rastree fácilmente la Ganancia Bruta Frontal y Trasera en Tiempo Real.',
        },
        salesReports: {
          title: 'Informes de Ventas, Programador, Objetivos',
          description:
            'Acceda a informes de ventas completos, gestione horarios del equipo y establezca/rastree objetivos mensuales y anuales para su equipo de ventas.',
        },
        dasBoard: {
          title: 'El DAS Board',
          description:
            'Vea la Tabla de Clasificación de Ventas para mantenerse al tanto del rendimiento y clasificaciones de sus vendedores.',
        },
        salesPerformance: {
          title: 'Rendimiento de Ventas',
          description:
            'Vista rápida para mantenerse al tanto de los objetivos de ventas, rastrear el progreso del equipo y monitorear indicadores clave de rendimiento.',
        },
        unitsSold: {
          title: 'Unidades Vendidas',
          description:
            'Rastree el total de unidades vendidas incluyendo vehículos nuevos y usados con desgloses diarios, semanales y mensuales.',
        },
        unitCount: {
          title: 'Conteo de Unidades',
          description:
            'Rastree sus totales de autos nuevos y usados con desgloses diarios, semanales y mensuales para monitorear el volumen de ventas.',
        },
        dealLog: {
          title: 'Registro de Ofertas',
          description:
            'Manténgase al tanto de todas sus ofertas con información detallada del cliente, estado de la oferta e historial de transacciones.',
        },
        goalTracker: {
          title: 'Rastreador de Objetivos y Calculadora de Pagos',
          description:
            'Manténgase al tanto de sus objetivos y estimador de pagos MTD para rastrear el progreso y maximizar ganancias.',
        },
        goalQuickView: {
          title: 'Vista Rápida de Objetivos',
          description:
            'Sepa fácilmente dónde está con sus objetivos y rastree el progreso hacia objetivos mensuales y anuales.',
        },
        grossTracker: {
          title: 'Rastreador de Ganancias',
          description:
            'Manténgase al tanto de sus ganancias con vista rápida del rastreo de ganancias frontal y trasera para maximizar cada oferta.',
        },
        fiManagerPerformance: {
          title: 'Rendimiento del Gerente F&I',
          description:
            'Compare el rendimiento del Gerente F&I con los promedios del equipo y compare con los estándares de la industria para máxima rentabilidad.',
        },
        salesManagerPerformance: {
          title: 'Rendimiento del Gerente de Ventas',
          description:
            'Vea el rendimiento del Gerente de Ventas contra compañeros de equipo y compare métricas individuales en el equipo de gestión de ventas.',
        },
        salesDasBoard: {
          title: 'DAS Board de Ventas',
          description:
            'Vea a sus líderes de vendedores y rastree a los mejores para máxima productividad mientras monitorea la dinámica del equipo y el logro de objetivos individuales.',
        },
        pvrDealership: {
          title: 'PVR',
          description:
            'Por Vehículo Vendido - Rastree la ganancia promedio del concesionario por vehículo tanto frontal como trasera para ver resultados rápidos.',
        },
        goalTracking: {
          title: 'Seguimiento de Objetivos',
          description:
            'Determine rápidamente el progreso de ventas de unidades MTD y rastree el rendimiento contra objetivos mensuales.',
        },
        unitsSoldDealer: {
          title: 'Unidades Vendidas',
          description:
            'Rastree rápidamente el total de unidades vendidas incluyendo vehículos nuevos y usados con ventas MTD.',
        },
      },
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      screenshots: "Captures d'écran",
      pricing: 'Tarifs',
      about: 'À propos',
      login: 'Connexion',
      signup: "S'inscrire",
      legal: 'Légal',
    },
    home: {
      title: 'The DAS Board',
      subtitle:
        'Tableaux de bord en temps réel fournissant des insights critiques pour les gestionnaires financiers, les concessionnaires et les groupes de concessionnaires.',
      startTrial: 'Commencer votre essai gratuit',
      signupNow: 'Inscrivez-vous Maintenant !',
      viewScreenshots: "Voir les captures d'écran",
      mission:
        '"The DAS Board redéfinit le succès des concessionnaires, permettant aux directeurs des ventes d\'optimiser les équipes et aux gestionnaires financiers de maximiser les profits avec des insights de vente clés, et aux vendeurs de rester au top de leurs affaires." - Tyler Durden',
      features: {
        title: 'Fonctionnalités clés',
        subtitle:
          'Tout ce dont vous avez besoin pour gérer efficacement les opérations de votre concessionnaire',
      },
      pricing: {
        title: 'Essayez maintenant',
        subtitle:
          'Commencez votre essai gratuit et voyez la différence que les insights en temps réel peuvent faire pour votre concessionnaire.',
      },
      pricingTiers: {
        singleFinance: {
          name: 'Gestionnaire Financier Individuel',
          price: '$20/mois temps limité',
          originalPrice: '$29.99/mois',
          description:
            'Parfait pour les gestionnaires financiers individuels qui souhaitent suivre leurs performances personnelles',
          features: [
            'Suivi des affaires personnelles',
            'Analyses PVR et profits des produits',
            'Calculateur de paiements',
            'Métriques de performance',
            'Peut être déductible des impôts',
          ],
          buttonText: 'Commencez Maintenant !',
          setupTime: 'Essai sans risque pendant un mois calendaire complet',
        },
        dealership: {
          name: 'Concession / Groupe de Concessionnaires',
          price: '$250/mo base',
          description:
            "Gestion complète de concession avec tableaux de bord spécifiques aux rôles et gestion d'équipe",
          popular: 'Le Plus Populaire',
          features: [
            'Toutes les fonctionnalités du gestionnaire individuel',
            "Tableaux de bord d'équipe pour tous les rôles",
            'Analyses multi-sites',
            'Structures administratives flexibles',
          ],
          buttonText: 'Configurer Votre Package',
          setupTime: "Commencez dès aujourd'hui",
        },
        priceSubtext: 'par concession + modules complémentaires',
      },
      cta: {
        title: 'Prêt à transformer les opérations de votre concessionnaire?',
        subtitle:
          'Rejoignez des centaines de concessionnaires utilisant déjà The DAS Board pour optimiser leurs opérations.',
      },
    },
    features: {
      finance: {
        title: 'Tableaux de bord financiers',
        desc: 'Insights en temps réel pour les gestionnaires financiers pour suivre les performances quotidiennes, enregistrer les affaires, voir les métriques incluant PVR, VSC et autres produits.',
      },
      sales: {
        title: 'Tableaux de bord équipe de vente',
        desc: 'The DAS Board est votre nouveau tableau de classement! Suivez vos affaires et sachez exactement où vous en êtes tout au long du mois.',
      },
      manager: {
        title: 'Tableaux de bord directeur des ventes',
        desc: "Voir les journaux d'affaires, les statistiques des vendeurs, gérer vos équipes plus efficacement.",
      },
      info: {
        title: 'Tableaux de bord informatifs',
        desc: 'Tableaux de bord spécifiques aux rôles pour les équipes de vente, gestionnaires financiers, directeurs des ventes et directeurs généraux.',
      },
      scheduler: {
        title: 'Planificateur dynamique',
        desc: "Planificateur dynamique des vendeurs pour une coordination d'équipe efficace. Gérez les horaires pour maximiser la production quotidienne.",
      },
      calculator: {
        title: 'Calculateur de paie',
        desc: 'Votre équipe de vente et vos gestionnaires financiers pourront voir les gains en temps réel du mois en cours avec des plans de paie pré-configurés.',
      },
    },
    screenshots: {
      title: 'Voir The DAS Board en action',
      subtitle:
        "Jetez un œil à nos tableaux de bord intuitifs conçus pour les professionnels de l'automobile.",
      finance: {
        title: 'Tableau de bord gestionnaire financier',
        desc: 'Suivez les affaires, PVR, métriques VSC et performances quotidiennes en temps réel.',
      },
      sales: {
        title: 'Tableau de bord des ventes',
        desc: 'Votre tableau de classement personnel montrant les affaires, classements et progrès mensuels.',
      },
      manager: {
        title: 'Tableau de bord directeur des ventes',
        desc: "Vue d'ensemble complète de l'équipe avec journaux d'affaires et analyses de performance.",
      },
      gm: {
        title: 'Tableau de bord directeur général',
        desc: "Insights de haut niveau sur les performances du concessionnaire et la productivité de l'équipe.",
      },
    },
    pricing: {
      title: 'Choisissez le plan parfait',
      subtitle:
        'Commencez avec notre essai gratuit pour les gestionnaires financiers, ou choisissez le plan qui évolue avec votre concessionnaire.',
      finance: 'Gestionnaire financier',
      dealership: 'Concessionnaire unique',
      group: 'Groupes de concessionnaires',
      freeTime: 'Gratuit pour une durée limitée!',
      getStarted: 'Commencer',
      startTrial: "Commencer l'essai gratuit",
      popular: 'Le plus populaire',
      viewDetails: 'Voir les détails complets des tarifs →',
      tiers: {
        finance: {
          name: 'Gestionnaire financier',
          price: 'Gratuit pour une durée limitée!',
          originalPrice: '5$/Mois',
          description: 'Suivez vos affaires, produits, PVR et paie!',
        },
        dealership: {
          name: 'Petits Groupes de Concessionnaires',
          price: '250$/mois par Concessionnaire',
          description: '1-5 Concessionnaires',
        },
        group: {
          name: 'Groupes de Concessionnaires 6+',
          price: '200$/Mois par Concessionnaire*',
          description: 'Tout ce que Concessionnaire Unique offre plus Tableau VP de Zone',
        },
      },
    },
    about: {
      title: 'Qui nous sommes',
      subtitle:
        'Professionnels passionnés dédiés à révolutionner la gestion des concessionnaires grâce à une technologie innovante et des insights basés sur les données.',
      founderVision: {
        title: "Pourquoi j'ai créé The DAS Board – Tyler Durden, PDG et fondateur",
        paragraph1:
          "Avec plus de 27 ans d'expérience dans l'industrie des concessionnaires automobiles, j'ai vu de première main les défis auxquels les gestionnaires font face pour équilibrer leurs rôles de leaders et de performeurs. En tant que professionnel expérimenté, j'ai fondé The DAS Board pour combler un écart critique que j'ai observé : bien que les directeurs des ventes excellent à vendre des voitures, ils ont souvent du mal à gérer efficacement leurs équipes de vente.",
        paragraph2:
          "Je crois que des vendeurs informés, motivés et bien soutenus sont la clé pour obtenir des résultats exceptionnels—dépassant de loin les résultats d'équipes désengagées ou mal informées. The DAS Board donne aux directeurs des ventes des outils intuitifs pour diriger leurs équipes plus efficacement, leur permettant de se concentrer à la fois sur le développement de l'équipe et l'excellence des ventes.",
        paragraph3:
          "Au-delà des ventes, l'application soutient les gestionnaires financiers en fournissant des insights en temps réel sur la rentabilité des affaires et les métriques clés, tout en offrant aux directeurs généraux des rapports exploitables pour guider les décisions stratégiques. Ma vision avec The DAS Board est de révolutionner la gestion des concessionnaires, favorisant une culture d'efficacité, de transparence et de succès à tous les niveaux de l'organisation.",
      },
      team: {
        title: 'Notre équipe',
        members: {
          tyler: {
            name: 'Tyler Durden',
            role: 'PDG et fondateur',
            bio: "S'appuyant sur une vaste expérience en gestion de concessionnaires, Tyler Durden a fondé The DAS Board pour favoriser une culture où les employés informés et motivés prospèrent, stimulant la productivité grâce à des outils transparents et basés sur les données qui autonomisent les équipes automobiles.",
          },
          sarah: {
            name: 'Sarah Conner',
            role: 'Directrice produit',
            bio: "Avec plus de 25 ans d'expérience en concessionnaire et vente au détail, Sarah Conner apporte des insights profonds pour réussir les ventes. Elle comprend le pouvoir d'outils efficaces et d'une gestion qualifiée pour inspirer les équipes, s'assurant que The DAS Board génère des résultats exceptionnels pour les concessionnaires.",
          },
          claude: {
            name: 'Claude Sonnet',
            role: 'Directeur technique',
            bio: 'Claude Sonnet apporte une expertise approfondie dans la création de logiciels qui excellent, avec un focus sur des plateformes évolutives et sécurisées. Sa capacité à fournir des insights sans complexité assure que The DAS Board fournit une technologie transparente et fiable pour les concessionnaires.',
          },
          annie: {
            name: 'Annie Porter',
            role: 'Directrice du succès client',
            bio: "Dédiée à s'assurer que chaque client DAS Board tire le maximum de notre plateforme grâce à un accompagnement et un support personnalisés",
          },
        },
      },
      values: {
        title: 'Nos valeurs',
        customerFocused: {
          title: 'Centré sur le client',
          description:
            'Nous autonomisons les concessionnaires automobiles avec des tableaux de bord intuitifs qui priorisent leurs besoins uniques, assurant une gestion transparente et des expériences client améliorées.',
        },
        dataDriven: {
          title: 'Basé sur les données',
          description:
            "Notre plateforme fournit des insights exploitables en temps réel à partir des données de concessionnaires, permettant une prise de décision précise pour stimuler les ventes et l'efficacité opérationnelle.",
        },
        continuousImprovement: {
          title: 'Amélioration continue',
          description:
            "Nous raffinons sans relâche nos outils pour aider les concessionnaires à optimiser les performances, s'adapter aux tendances de l'industrie et réaliser une croissance durable.",
        },
      },
      contact: {
        title: 'Contactez-nous',
        subtitle:
          'Prêt à voir comment The DAS Board peut transformer les opérations de votre concessionnaire? Nous aimerions avoir de vos nouvelles.',
        email: 'Email:',
        phone: 'Téléphone:',
      },
    },
    signup: {
      title: 'Rejoignez The DAS Board',
      subtitle: "Commencez avec votre solution de gestion de concessionnaire aujourd'hui.",
      selectLanguage: 'Sélectionnez votre langue',
      dealerGroup: 'Inscription groupe de concessionnaires',
      dealership: 'Inscription concessionnaire',
      financeManager: 'Inscription gestionnaire financier',
      form: {
        firstName: 'Prénom',
        lastName: 'Nom de famille',
        email: 'Adresse email',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        dealershipName: 'Nom du concessionnaire',
        role: 'Votre rôle',
        phone: 'Numéro de téléphone',
        submit: 'Créer un compte',
        alreadyHave: 'Vous avez déjà un compte?',
        signIn: 'Se connecter',
        terms: "J'accepte les conditions de service et la politique de confidentialité",
      },
    },
    dashboard: {
      singleFinance: {
        title: 'Tableau de Bord du Gestionnaire Financier Individuel',
        kpi: {
          fiGross: 'Brut F&I',
          dealsProcessed: 'Affaires Traitées',
          dealTypes: "Types d'Affaires",
          productsPerDeal: 'Produits par Affaire',
          pvr: 'PVR',
          pvrFull: 'PVR (Par Véhicule Vendu)',
        },
        dealTypes: {
          finance: 'Financement',
          cash: 'Comptant',
          lease: 'Location',
        },
        productMix: {
          title: 'Mix de Produits et Performance',
          product: 'Produit',
          avgProfit: 'Profit Moyen',
          penetration: 'Pénétration',
          extendedWarranty: 'Garantie Étendue',
          gapInsurance: 'Assurance GAP',
          paintProtection: 'Protection Peinture',
          tireWheel: 'Pneus et Roues',
          ppm: 'PPM',
          theft: 'Protection Vol',
          bundled: 'Groupé',
          other: 'Autres',
        },
        payCalculator: {
          title: 'Calculateur de Paie',
          grossProfit: 'Profit Brut',
          payPlan: 'Plan de Paie',
          estimatedPay: 'Paie Estimée',
          baseAmount: 'Montant de Base',
          bonusAmount: 'Montant Bonus',
          totalPay: 'Paie Totale',
        },
        dealsLog: {
          title: 'Journal des Affaires Récentes',
          refresh: 'Actualiser',
          viewAll: 'Voir Tout',
          number: '#',
          lastName: 'Nom de Famille',
          date: 'Date',
          gross: 'Brut',
          products: 'Produits',
          status: 'Statut',
        },
        timePeriod: {
          thisMonth: 'Ce Mois',
          lastMonth: 'Mois Dernier',
          lastQuarter: 'Dernier Trimestre',
          ytd: 'Cumul Annuel',
          lastYear: 'Année Dernière',
          custom: 'Personnalisé',
        },
        status: {
          pending: 'En Attente',
          funded: 'Financé',
          unwound: 'Annulé',
          deadDeal: 'Affaire Morte',
        },
      },
      deals: {
        title: 'Gestionnaire Financier Individuel - Affaires',
        backToDashboard: 'Retour au Tableau de Bord',
        note: 'Ces affaires sont spécifiques à votre Tableau de Bord du Gestionnaire Financier Individuel et sont stockées séparément des affaires financières principales.',
        searchPlaceholder: 'Rechercher des affaires par client, véhicule, # affaire ou VIN',
        allStatuses: 'Tous les Statuts',
        tableHeaders: {
          number: '#',
          lastName: 'Nom de Famille',
          dealNumber: '# Affaire',
          stockNumber: '# Stock',
          date: 'Date',
          vin: 'VIN',
          vehicleType: 'N/O/CPO',
          lender: 'Prêteur',
          frontEnd: 'Front End',
          vsc: 'VSC',
          ppm: 'PPM',
          gap: 'GAP',
          tireWheel: 'P&R',
          appearance: 'App',
          theft: 'Vol',
          bundled: 'Groupé',
          ppd: 'PPD',
          pvr: 'PVR',
          total: 'Total',
          status: 'Statut',
          edit: 'Modifier',
          delete: 'Supprimer',
        },
        vehicleTypes: {
          new: 'N',
          used: 'O',
          cpo: 'C',
        },
        statusOptions: {
          pending: 'En Attente',
          funded: 'Financé',
          held: 'Retenu',
          unwound: 'Annulé',
          deadDeal: 'Affaire Morte',
        },
        noDealsFound: 'Aucune affaire ne correspond à vos critères de recherche.',
        noDealsYet:
          "Aucune affaire enregistrée encore. Utilisez le bouton 'Enregistrer Nouvelle Affaire' pour ajouter des affaires.",
        showingDeals: 'Affichage de {count} sur {total} affaires',
        totalGross: 'Brut Total:',
        backEndTotal: 'Total Back End:',
        confirmDelete:
          "⚠️ CONFIRMATION DE SUPPRESSION\n\nÊtes-vous sûr de vouloir supprimer cette affaire?\n\nCette action va:\n• Supprimer définitivement toutes les données de l'affaire\n• Mettre à jour vos métriques du tableau de bord\n• Ne peut pas être annulée\n\nCliquez OK pour supprimer ou Annuler pour garder l'affaire.",
        finalConfirmDelete:
          "🚨 CONFIRMATION FINALE\n\nC'est votre dernière chance!\n\nCliquez OK pour supprimer définitivement cette affaire, ou Annuler pour la garder.",
        editButton: 'Modifier',
      },
      dealLog: {
        title: 'Enregistrer Nouvelle Affaire',
        editDeal: 'Modifier Affaire - Tableau de Bord Financier Individuel',
        backToDashboard: 'Retour au Tableau de Bord',
        note: 'Note',
        editingNote:
          'Vous modifiez une affaire existante. Les changements seront reflétés immédiatement sur votre tableau de bord.',
        dashboardNote:
          "Cette affaire apparaîtra seulement sur votre Tableau de Bord du Gestionnaire Financier Individuel et n'affectera pas les autres tableaux de bord du système.",
        dealInformation: "Informations de l'Affaire",
        dealNumber: '# Affaire',
        enterDealNumber: "Entrez le numéro d'affaire",
        saleDate: 'Date de Vente',
        stockNumber: '# Stock',
        vinLast8: 'VIN # (8 Derniers)',
        vinPlaceholder: '8 derniers du VIN',
        vehicleType: 'Type de Véhicule',
        vehicleTypes: {
          new: 'Neuf',
          used: 'Occasion',
          cpo: 'CPO',
        },
        manufacturer: 'Fabricant',
        selectManufacturer: 'Sélectionner Fabricant',
        customerName: 'Nom de Famille du Client',
        customerPlaceholder: 'Nom de famille du client',
        salesperson: 'Vendeur',
        selectSalesperson: 'Sélectionner Vendeur',
        splitDeal: 'Affaire Partagée',
        selectSecondSalesperson: 'Sélectionner Deuxième Vendeur',
        salesManager: 'Directeur des Ventes',
        selectManager: 'Sélectionner Directeur',
        lender: 'Prêteur',
        selectLender: 'Sélectionner Prêteur',
        dealType: "Type d'Affaire",
        dealTypes: {
          cash: 'Comptant',
          finance: 'Financement',
          lease: 'Location',
        },
        status: 'Statut',
        statusOptions: {
          pending: 'En Attente',
          funded: 'Financé',
        },
        productsAndProfit: 'Produits et Profit',
        products: {
          vscProfit: 'Profit VSC',
          gapProfit: 'Profit GAP',
          ppmProfit: 'Profit PPM',
          tireWheelProfit: 'Profit Pneus et Roues',
          appearanceProfit: 'Profit Apparence',
          theftProfit: 'Profit Vol',
          bundledProfit: 'Profit Groupé',
          otherProfit: 'Autres Profits',
        },
        financialSummary: 'Résumé Financier',
        frontEndGross: 'Front End Brut',
        reserveFlat: 'Réserve/Fixe',
        backEndGross: 'Back End Brut',
        autoCalculated: 'Auto-Calculé',
        totalGross: 'Brut Total',
        allFieldsRequired: 'Tous les champs doivent être complétés.',
        cancel: 'Annuler',
        saveDeal: 'Sauvegarder Affaire',
        updateDeal: 'Mettre à jour Affaire',
        savingDeal: 'Sauvegarde Affaire...',
        updatingDeal: 'Mise à jour Affaire...',
        addNewSalesperson: 'Ajouter Nouveau Vendeur',
        firstName: 'Prénom',
        lastName: 'Nom de Famille',
        addSalesperson: 'Ajouter Vendeur',
      },
      settings: {
        title: 'Paramètres',
        teamManagement: "Membres de l'Équipe",
        payConfiguration: 'Configurateur de Paie',
        languageSettings: 'Paramètres de Langue',
        addNewMember: "Ajouter Nouveau Membre d'Équipe",
        firstName: 'Prénom',
        lastName: 'Nom de Famille',
        role: 'Rôle',
        addMember: 'Ajouter Membre',
        roles: {
          salesperson: 'Vendeur',
          salesManager: 'Directeur des Ventes',
        },
        commissionBasePay: 'Commission et Paie de Base',
        commissionRate: 'Taux de Commission (%)',
        baseRate: 'Taux de Base ($)',
        vscBonus: 'Bonus VSC ($)',
        gapBonus: 'Bonus GAP ($)',
        ppmBonus: 'Bonus PPM ($)',
        totalThreshold: 'Seuil Total ($)',
        saveConfiguration: 'Sauvegarder Configuration',
        currentLanguage: 'Langue Actuelle',
        selectLanguage: 'Sélectionner Langue',
        languageUpdated: 'Langue mise à jour avec succès',
      },
    },
    common: {
      language: 'Langue',
      login: 'Connexion',
      signUp: "S'inscrire",
      loading: 'Chargement...',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      continue: 'Continuer',
      back: 'Retour',
      next: 'Suivant',
      submit: 'Soumettre',
      close: 'Fermer',
    },
    footer: {
      tagline: 'Logiciel moderne de gestion de concessionnaires avec des insights en temps réel.',
      industry: 'Ventes automobiles de concessionnaires',
      product: 'Produit',
      legal: 'Légal',
      contact: 'Contact',
      support: 'Pour le support ou les demandes, contactez-nous à:',
      copyright: '© 2025 The DAS Board. Tous droits réservés. Conçu avec 🖤',
      terms: 'Conditions de service',
      privacy: 'Politique de confidentialité',
      subscription: "Accord d'abonnement",
      home: 'Accueil',
      screenshots: "Captures d'écran",
      pricing: 'Tarifs',
      aboutUs: 'À propos',
    },
    currency: {
      symbol: '€',
      name: 'EUR',
    },
    legal: {
      terms: {
        title: 'Conditions de service',
        lastUpdated: 'Dernière mise à jour : 6/28/2025',
        intro:
          'Bienvenue sur The DAS Board. Ces Conditions de Service ("Conditions") régissent votre accès et votre utilisation de notre plateforme logicielle de gestion de concessionnaire. En accédant ou en utilisant nos services, vous acceptez d\'être lié par ces Conditions.',
        sections: {
          acceptance: {
            title: '1. Acceptation des Conditions',
            content:
              "En créant un compte, en accédant ou en utilisant The DAS Board, vous reconnaissez avoir lu, compris et accepté d'être lié par ces Conditions et notre Politique de Confidentialité. Si vous n'acceptez pas ces Conditions, vous ne pouvez pas utiliser nos services. Vous devez avoir au moins 18 ans et avoir l'autorité de conclure ces Conditions au nom de votre organisation.",
          },
          service: {
            title: '2. Description du Service',
            content:
              "The DAS Board est une plateforme logicielle de gestion de concessionnaire basée sur le cloud qui fournit des outils pour la gestion des stocks, le suivi des ventes, la gestion de la relation client, les rapports financiers et les services connexes de l'industrie automobile. Nous nous réservons le droit de modifier, suspendre ou interrompre tout aspect de notre service avec un préavis raisonnable.",
          },
          account: {
            title: '3. Inscription de Compte et Sécurité',
            content:
              'Pour utiliser nos services, vous devez créer un compte avec des informations précises et complètes. Vous êtes responsable de :',
            items: [
              'Maintenir la confidentialité de vos identifiants de compte',
              'Toutes les activités qui se produisent sous votre compte',
              'Nous notifier immédiatement de toute utilisation non autorisée',
              'Veiller à ce que les informations de votre compte restent à jour et exactes',
              'Respecter nos exigences de sécurité et les meilleures pratiques',
            ],
          },
          subscription: {
            title: "4. Conditions d'Abonnement et de Paiement",
            content:
              "The DAS Board fonctionne sur une base d'abonnement. En vous abonnant, vous acceptez :",
            items: [
              "Payer tous les frais associés à votre plan d'abonnement",
              'Le renouvellement automatique sauf annulation avant la date de renouvellement',
              'Les changements de tarifs avec un préavis de 30 jours',
              "Aucun remboursement pour les périodes d'abonnement partielles",
              'La suspension du service pour non-paiement après un préavis raisonnable',
            ],
          },
          usage: {
            title: "5. Politique d'Utilisation Acceptable",
            content:
              "Vous acceptez d'utiliser The DAS Board uniquement à des fins légales et conformément à ces Conditions. Vous ne pouvez pas :",
            items: [
              'Violer les lois, réglementations ou droits de tiers applicables',
              'Télécharger du contenu nuisible, offensant ou inapproprié',
              "Tenter d'obtenir un accès non autorisé à nos systèmes ou aux comptes d'autres utilisateurs",
              "Utiliser le service pour envoyer du spam, des logiciels malveillants ou d'autres contenus malveillants",
              "Faire de l'ingénierie inverse, décompiler ou tenter d'extraire le code source",
              "Interférer ou perturber l'intégrité ou les performances de nos services",
              'Utiliser la plateforme pour des activités frauduleuses ou illégales',
            ],
          },
          intellectual: {
            title: '6. Droits de Propriété Intellectuelle',
            content:
              'The DAS Board et toutes les technologies, contenus et matériaux connexes sont la propriété de nous ou de nos concédants de licence. Cela inclut :',
            items: [
              'Logiciels, algorithmes et interfaces utilisateur',
              'Marques commerciales, logos et matériaux de marque',
              'Documentation, tutoriels et matériaux de support',
              'Analyses, rapports et informations sur les données agrégées',
            ],
            footer:
              "Vous conservez la propriété de vos données mais nous accordez une licence pour les utiliser afin de fournir nos services. Nous pouvons utiliser des données anonymisées et agrégées pour la recherche industrielle et l'amélioration de la plateforme.",
          },
          privacy: {
            title: '7. Protection des Données et Confidentialité',
            content:
              'Vous êtes responsable de vous assurer que toutes les données personnelles que vous traitez via notre plateforme sont conformes aux lois de confidentialité applicables. Nous traiterons les données conformément à notre Politique de Confidentialité et aux réglementations de protection des données applicables, y compris le RGPD et le CCPA le cas échéant.',
          },
          availability: {
            title: '8. Disponibilité du Service et Support',
            content:
              "Bien que nous nous efforcions d'assurer une haute disponibilité, nous ne garantissons pas un service ininterrompu. Nous fournissons :",
            items: [
              '99,9% de SLA de temps de fonctionnement pour les abonnements payants',
              'Fenêtres de maintenance régulières avec préavis',
              "Support technique basé sur votre niveau d'abonnement",
              'Surveillance de la sécurité et réponse aux incidents',
            ],
          },
          termination: {
            title: '9. Résiliation',
            content: "L'une ou l'autre partie peut résilier ces Conditions :",
            items: [
              'Vous pouvez annuler votre abonnement à tout moment via les paramètres de votre compte',
              'Nous pouvons résilier pour violation de ces Conditions avec un préavis raisonnable',
              'Nous pouvons suspendre le service immédiatement pour des violations graves ou des menaces de sécurité',
              "En cas de résiliation, vous perdrez l'accès à la plateforme et à vos données",
              "Nous fournirons une opportunité raisonnable d'exporter vos données avant la suppression",
            ],
          },
          disclaimers: {
            title: '10. Dénis de Responsabilité et Limitations de Responsabilité',
            content:
              'THE DAS BOARD EST FOURNI "TEL QUEL" SANS GARANTIES D\'AUCUNE SORTE. DANS TOUTE LA MESURE PERMISE PAR LA LOI :',
            items: [
              "Nous déclinons toutes les garanties, expresses ou implicites, y compris la qualité marchande et l'adéquation à un usage particulier",
              'Nous ne sommes pas responsables des dommages indirects, accessoires, spéciaux ou consécutifs',
              'Notre responsabilité totale ne dépassera pas les frais que vous avez payés au cours des 12 mois précédant la réclamation',
              'Vous reconnaissez que le logiciel peut contenir des bugs et acceptez de les signaler rapidement',
            ],
          },
          indemnification: {
            title: '11. Indemnisation',
            content:
              "Vous acceptez de nous indemniser et de nous dégager de toute responsabilité concernant les réclamations, pertes ou dommages découlant de votre utilisation de nos services, de la violation de ces Conditions ou de l'atteinte aux droits de tiers.",
          },
          governing: {
            title: '12. Loi Applicable et Résolution des Litiges',
            content:
              "Ces Conditions sont régies par les lois de [Juridiction] sans égard aux principes de conflit de lois. Tout litige sera résolu par arbitrage contraignant, à l'exception des réclamations de mesures injonctives qui peuvent être portées devant les tribunaux appropriés.",
          },
          changes: {
            title: '13. Modifications des Conditions',
            content:
              "Nous pouvons modifier ces Conditions de temps à autre. Nous fournirons un préavis des changements importants au moins 30 jours à l'avance. L'utilisation continue de nos services après l'entrée en vigueur des changements constitue une acceptation des Conditions révisées.",
          },
          entire: {
            title: '14. Accord Complet',
            content:
              "Ces Conditions, ainsi que notre Politique de Confidentialité et tout accord supplémentaire, constituent l'accord complet entre vous et The DAS Board concernant votre utilisation de nos services.",
          },
          contact: {
            title: '15. Informations de Contact',
            content: 'Si vous avez des questions sur ces Conditions, veuillez nous contacter :',
            email: 'legal@thedasboard.com',
            address: "[Adresse de l'Entreprise]",
            phone: '[Numéro de Téléphone du Support]',
          },
        },
      },
      privacy: {
        title: 'Politique de confidentialité',
        lastUpdated: 'Dernière mise à jour : 28/6/2025',
        intro:
          'Cette Politique de confidentialité décrit comment The DAS Board (« nous », « notre » ou « nos ») collecte, utilise et protège vos informations personnelles lorsque vous utilisez notre plateforme logicielle de gestion de concessions. Nous nous engageons à protéger votre vie privée et à traiter vos données de manière responsable.',
        sections: {
          collection: {
            title: '1. Informations que nous collectons',
            content:
              "Lorsque vous utilisez The DAS Board, nous collectons plusieurs types d'informations pour fournir et améliorer nos services :",
            items: [
              "<strong>Informations de compte :</strong> Nom, adresse e-mail, numéro de téléphone, nom de l'entreprise, fonction et informations de facturation",
              '<strong>Données de concession :</strong> Inventaire de véhicules, registres de ventes, informations clients et transactions financières',
              "<strong>Données d'utilisation :</strong> Fonctionnalités accédées, temps passé sur la plateforme, interactions utilisateur et métriques de performance",
              "<strong>Données techniques :</strong> Adresse IP, type de navigateur, informations de l'appareil, système d'exploitation et journaux d'accès",
              '<strong>Données de communication :</strong> Demandes de support, commentaires et correspondance avec notre équipe',
              "<strong>Données de localisation :</strong> Adresses de concession et, avec consentement, localisation de l'appareil pour les fonctionnalités mobiles",
            ],
          },
          usage: {
            title: '2. Comment nous utilisons vos informations',
            content:
              'Nous utilisons les informations collectées à des fins commerciales légitimes, notamment :',
            items: [
              'Fournir, maintenir et améliorer la plateforme et les fonctionnalités de The DAS Board',
              'Traiter les abonnements, paiements et gérer votre compte',
              'Générer des analyses, rapports et insights commerciaux pour votre concession',
              'Fournir un support client et répondre à vos demandes',
              'Envoyer des mises à jour de service, alertes de sécurité et messages administratifs',
              'Détecter, prévenir et traiter les problèmes techniques et menaces de sécurité',
              "Se conformer aux obligations légales et réglementations de l'industrie",
              "Améliorer l'expérience utilisateur grâce au développement et à la recherche de produits",
            ],
          },
          sharing: {
            title: '3. Partage de vos informations',
            content:
              "Nous ne vendons, ne louons ni n'échangeons vos informations personnelles. Nous pouvons partager vos informations uniquement dans les circonstances suivantes :",
            items: [
              '<strong>Fournisseurs de services :</strong> Vendeurs tiers qui nous aident à exploiter notre plateforme (hébergement, analyses, traitement des paiements)',
              "<strong>Partenaires commerciaux :</strong> Intégrations autorisées et partenaires de l'industrie automobile avec votre consentement explicite",
              '<strong>Exigences légales :</strong> Lorsque requis par la loi, la réglementation ou un processus juridique valide',
              "<strong>Transferts commerciaux :</strong> En rapport avec des fusions, acquisitions ou ventes d'actifs (avec préavis)",
              '<strong>Sûreté et sécurité :</strong> Pour protéger les droits, la propriété ou la sécurité de nos utilisateurs ou du public',
            ],
          },
          retention: {
            title: '4. Conservation des données',
            content:
              'Nous conservons vos informations personnelles aussi longtemps que nécessaire pour fournir nos services et nous conformer aux obligations légales. Spécifiquement :',
            items: [
              'Les données de compte sont conservées pendant que votre abonnement est actif et pendant 3 ans après la résiliation',
              'Les registres de transactions sont conservés pendant 7 ans pour se conformer aux réglementations financières',
              "Les journaux d'utilisation sont conservés pendant 2 ans pour l'analyse de sécurité et de performance",
              'Les registres de communication sont conservés pendant 5 ans à des fins de service client',
            ],
          },
          rights: {
            title: '5. Vos droits et choix',
            content:
              'Selon votre localisation, vous pouvez avoir les droits suivants concernant vos informations personnelles :',
            items: [
              '<strong>Accès :</strong> Demander une copie de vos informations personnelles que nous détenons',
              '<strong>Correction :</strong> Mettre à jour ou corriger des informations personnelles inexactes',
              "<strong>Suppression :</strong> Demander la suppression de vos informations personnelles (sous réserve d'obligations légales)",
              '<strong>Portabilité :</strong> Recevoir vos données dans un format lisible par machine',
              '<strong>Restriction :</strong> Limiter la façon dont nous traitons vos informations personnelles',
              "<strong>Objection :</strong> S'opposer au traitement basé sur des intérêts légitimes",
            ],
          },
          cookies: {
            title: '6. Cookies et technologies de suivi',
            content:
              'Nous utilisons des cookies et technologies similaires pour améliorer votre expérience :',
            items: [
              '<strong>Cookies essentiels :</strong> Requis pour la fonctionnalité et la sécurité de la plateforme',
              "<strong>Cookies d'analyse :</strong> Nous aident à comprendre comment vous utilisez notre plateforme",
              '<strong>Cookies de préférence :</strong> Se souviennent de vos paramètres et personnalisations',
              '<strong>Cookies marketing :</strong> Utilisés pour les communications ciblées (avec votre consentement)',
            ],
            footer:
              'Vous pouvez contrôler les préférences de cookies via les paramètres de votre navigateur ou notre outil de gestion des cookies.',
          },
          security: {
            title: '7. Mesures de sécurité',
            content:
              "Nous mettons en œuvre des mesures de sécurité standard de l'industrie pour protéger vos informations, notamment :",
            items: [
              'Chiffrement des données en transit et au repos utilisant les standards AES-256',
              'Audits de sécurité réguliers et tests de pénétration',
              "Authentification multifacteur et contrôles d'accès",
              'Conformité SOC 2 Type II et évaluations de sécurité régulières',
              'Formation des employés sur la protection des données et les meilleures pratiques de sécurité',
            ],
          },
          international: {
            title: '8. Transferts internationaux de données',
            content:
              "Vos informations peuvent être transférées et traitées dans des pays autres que le vôtre. Nous veillons à ce que des garanties appropriées soient en place, notamment les Clauses contractuelles types et les décisions d'adéquation, pour protéger vos données lors des transferts internationaux.",
          },
          children: {
            title: '9. Confidentialité des enfants',
            content:
              "The DAS Board n'est pas destiné à être utilisé par des personnes de moins de 18 ans. Nous ne collectons pas sciemment d'informations personnelles d'enfants de moins de 18 ans. Si nous prenons connaissance d'une telle collecte, nous supprimerons les informations rapidement.",
          },
          changes: {
            title: '10. Modifications de cette politique de confidentialité',
            content:
              "Nous pouvons mettre à jour cette Politique de confidentialité périodiquement pour refléter les changements dans nos pratiques ou exigences légales. Nous vous notifierons des changements significatifs par e-mail ou notification sur la plateforme au moins 30 jours avant qu'ils n'entrent en vigueur.",
          },
          contact: {
            title: '11. Nous contacter',
            content:
              'Si vous avez des questions sur cette Politique de confidentialité ou souhaitez exercer vos droits, veuillez nous contacter :',
            email: 'privacy@thedasboard.com',
            address: '[Company Address]',
            phone: '[Support Phone Number]',
          },
        },
      },
      subscription: {
        title: "Accord d'abonnement",
        lastUpdated: 'Dernière mise à jour : 6/28/2025',
        intro:
          "Cet Accord d'abonnement régit votre abonnement et votre utilisation de la plateforme de gestion de concession The DAS Board.",
        sections: {
          plans: {
            title: "1. Plans d'abonnement",
            content:
              "The DAS Board propose des niveaux d'abonnement conçus pour différents besoins de concession :",
            items: [
              '<strong>Essai gratuit de 60 jours :</strong> Accès complet à la plateforme sans carte de crédit requise',
              '<strong>Gestionnaire financier :</strong> Accès utilisateur individuel avec outils financiers centraux',
              "<strong>Concession :</strong> Accès multi-utilisateurs avec gestion complète d'inventaire et de ventes",
              '<strong>Groupe de concessionnaires :</strong> Accès niveau entreprise sur plusieurs emplacements',
            ],
            footer:
              "Les abonnements sont facturés mensuellement à l'avance. Vous pouvez mettre à niveau ou rétrograder votre abonnement à tout moment, les modifications prenant effet au prochain cycle de facturation.",
          },
          payment: {
            title: '2. Conditions de paiement',
            content:
              "Le paiement est dû au début de l'abonnement et le même jour chaque mois par la suite. Nous acceptons les principales cartes de crédit et les virements ACH pour les comptes d'entreprise. Si le paiement échoue, nous pouvons suspendre votre accès à The DAS Board après un préavis raisonnable.",
          },
          trial: {
            title: "3. Période d'essai",
            content:
              "L'essai de 60 jours fournit un accès complet à la plateforme The DAS Board. Aucune carte de crédit n'est requise pour commencer votre essai. À la fin de la période d'essai, vous devrez sélectionner un plan payant pour continuer à utiliser la plateforme. Les données d'essai seront conservées pendant 30 jours après l'expiration de l'essai.",
          },
          cancellation: {
            title: '4. Annulation et remboursements',
            content:
              "Vous pouvez annuler votre abonnement à tout moment via les paramètres de votre compte ou en contactant notre équipe de support. Lors de l'annulation :",
            items: [
              "Vous maintiendrez l'accès jusqu'à la fin de votre période de facturation actuelle",
              "Aucun remboursement n'est fourni pour les mois partiels de service",
              "Vos données seront disponibles pour exportation pendant 90 jours après l'annulation",
              'Le renouvellement automatique sera désactivé',
            ],
          },
          sla: {
            title: '5. Accord de niveau de service',
            content: 'Pour les abonnements payants, nous nous engageons à :',
            items: [
              '99,9% de disponibilité de la plateforme',
              'Fenêtres de maintenance programmées avec préavis de 48 heures',
              'Réponse du support client dans les 24 heures pour les demandes standard',
              'Support prioritaire pour les abonnés Groupe de concessionnaires',
            ],
          },
          data: {
            title: '6. Données et sécurité',
            content: 'Les données de votre concession restent votre propriété. Nous fournissons :',
            items: [
              'Sauvegardes automatisées quotidiennes avec rétention de 30 jours',
              'Protocoles de chiffrement et de sécurité de niveau bancaire',
              'Conformité RGPD et CCPA pour la protection des données',
              "Capacités d'exportation de données dans des formats standard",
            ],
          },
          support: {
            title: '7. Support et formation',
            content: 'Tous les abonnements payants incluent :',
            items: [
              "Assistance complète d'intégration et de configuration",
              'Ressources de formation en ligne et documentation',
              'Support par email et chat pendant les heures ouvrables',
              'Mises à jour régulières de la plateforme et sorties de nouvelles fonctionnalités',
            ],
          },
          modifications: {
            title: '8. Modifications du service',
            content:
              'Nous pouvons modifier ou mettre à jour la plateforme The DAS Board pour améliorer la fonctionnalité, la sécurité ou la conformité. Nous fournirons un préavis raisonnable des changements significatifs qui peuvent affecter votre utilisation.',
          },
        },
      },
      pricingPage: {
        title: 'Sélectionnez Votre',
        titleHighlight: 'Solution',
        subtitle:
          "Sélectionnez l'option qui décrit le mieux vos besoins. Nous personnaliserons votre expérience en conséquence.",
        singleFinance: {
          title: 'Gestionnaire Financier Individuel',
          description:
            'Parfait pour les gestionnaires financiers individuels qui souhaitent suivre leurs performances personnelles et leurs affaires.',
          originalPrice: '$29.99/mois',
          price: '$20/mois temps limité',
          features: [
            'Suivi des affaires personnelles',
            'Analyses PVR et profits des produits',
            'Calculateur de paiements',
            'Métriques de performance',
            'Peut être déductible des impôts',
          ],
          buttonText: 'Commencez Maintenant !',
          setupTime: 'Essai sans risque pendant un mois calendaire complet',
        },
        dealership: {
          title: 'Concession / Groupe de Concessionnaires',
          description:
            "Gestion complète de concession avec tableaux de bord spécifiques aux rôles, gestion d'équipe et support multi-sites.",
          price: '$250/mois base',
          priceSubtext: 'par concession + modules complémentaires',
          popular: 'Le Plus Populaire',
          features: [
            'Toutes les fonctionnalités du gestionnaire individuel',
            "Tableaux de bord d'équipe pour tous les rôles",
            'Analyses multi-sites',
            'Structures administratives flexibles',
            'Remises sur volume disponibles',
          ],
          buttonText: 'Voir les Prix de Package Dynamique',
          setupTime: "Commencez dès aujourd'hui",
        },
        benefits: {
          title: "Transformez Votre Concession Aujourd'hui",
          performance: {
            title: 'Augmentez la Performance',
            description:
              'Les insights en temps réel aident les équipes à dépasser les objectifs et maximiser la rentabilité',
          },
          operations: {
            title: 'Optimisez les Opérations',
            description:
              "La gestion centralisée réduit le temps administratif et améliore l'efficacité",
          },
          security: {
            title: 'Sécurisé et Fiable',
            description: 'Sécurité de niveau entreprise avec garantie de disponibilité de 99,9%',
          },
        },
        helpText: {
          title: 'Vous ne savez pas quelle option choisir ?',
          description:
            "Commencez avec l'option gestionnaire financier individuel pour essayer notre plateforme, puis passez facilement aux fonctionnalités de concession quand vous êtes prêt à développer votre équipe.",
        },
        footer: {
          copyright: '© 2025 The DAS Board. Tous droits réservés.',
          support: 'Des questions ? Contactez-nous à',
          email: 'support@thedasboard.com',
        },
      },
    },
    demoPage: {
      backToHome: "Retour à l'accueil",
      title: 'Découvrez Le DAS Board',
      startFreeTrial: "Commencer l'essai gratuit",
      subtitle:
        'Explorez notre démo interactive pour voir comment différents rôles utilisent notre tableau de bord',
      dashboards: {
        salesperson: {
          title: 'Tableau de Bord du Vendeur',
          description: 'Suivi des ventes individuelles et gestion des clients',
        },
        finance: {
          title: 'Tableau de Bord du Directeur Financier',
          description:
            'Suivi des performances et des transactions du directeur financier individuel',
        },
        salesManager: {
          title: 'Tableau de Bord du Directeur des Ventes',
          description: "Gestion d'équipe et aperçu des performances commerciales",
        },
        generalManager: {
          title: 'Tableau de Bord du Directeur Général',
          description: "Vue d'ensemble complète de la concession et analyses",
        },
      },
      hotspots: {
        productTracking: {
          title: 'Suivi des Produits',
          description:
            'Surveillez les performances de vente des produits, suivez les garanties, GAP et autres produits F&I pour maximiser la rentabilité par transaction.',
        },
        performanceMetrics: {
          title: 'Métriques de Performance',
          description:
            'Surveillez vos performances personnelles avec des métriques clés comme PVR (Par Véhicule Vendu), produits par transaction et objectifs mensuels.',
        },
        teamPerformance: {
          title: "Performance de l'Équipe",
          description:
            "Comparez vos performances avec les moyennes de l'équipe et voyez votre classement parmi vos collègues.",
        },
        recentDealsLog: {
          title: 'Journal des Transactions Récentes',
          description:
            'Visualisez et gérez vos transactions les plus récentes avec un accès rapide aux détails clients et à la rentabilité des transactions.',
        },
        pvr: {
          title: 'PVR',
          description:
            "Par Véhicule Vendu - Suivez votre profit moyen par véhicule et comparez avec les objectifs et moyennes de l'équipe.",
        },
        payCalculator: {
          title: 'Calculateur de Paie',
          description:
            'Calculez vos commissions et bonus basés sur la rentabilité des transactions et les ventes de produits.',
        },
        schedule: {
          title: 'Horaire',
          description: 'Consultez votre horaire pour la semaine et le mois',
        },
        teamSchedule: {
          title: "Horaire de l'Équipe",
          description:
            "Visualisez facilement les horaires de l'équipe, suivez les présences et gérez les affectations de quarts pour une couverture optimale.",
        },
        grossProfitIndicator: {
          title: 'Indicateur de Profit Brut',
          description: 'Suivez facilement le Profit Brut Avant et Arrière en Temps Réel.',
        },
        salesReports: {
          title: 'Rapports de Ventes, Planificateur, Objectifs',
          description:
            "Accédez aux rapports de ventes complets, gérez les horaires de l'équipe et fixez/suivez les objectifs mensuels et annuels pour votre équipe de vente.",
        },
        dasBoard: {
          title: 'Le DAS Board',
          description:
            'Consultez le Classement des Ventes pour rester au courant des performances et classements de vos vendeurs.',
        },
        salesPerformance: {
          title: 'Performance des Ventes',
          description:
            "Vue rapide pour rester au courant des objectifs de vente, suivre les progrès de l'équipe et surveiller les indicateurs clés de performance.",
        },
        unitsSold: {
          title: 'Unités Vendues',
          description:
            "Suivez le total des unités vendues incluant véhicules neufs et d'occasion avec répartitions quotidiennes, hebdomadaires et mensuelles.",
        },
        unitCount: {
          title: "Comptage d'Unités",
          description:
            "Suivez vos totaux de voitures neuves et d'occasion avec répartitions quotidiennes, hebdomadaires et mensuelles pour surveiller le volume des ventes.",
        },
        dealLog: {
          title: 'Journal des Transactions',
          description:
            'Restez au courant de toutes vos transactions avec informations détaillées sur les clients, statut des transactions et historique.',
        },
        goalTracker: {
          title: 'Suivi des Objectifs et Calculateur de Paie',
          description:
            'Restez au courant de vos objectifs et estimateur de paie MTD pour suivre les progrès et maximiser les gains.',
        },
        goalQuickView: {
          title: 'Vue Rapide des Objectifs',
          description:
            'Sachez facilement où vous en êtes avec vos objectifs et suivez les progrès vers les objectifs mensuels et annuels.',
        },
        grossTracker: {
          title: 'Suivi du Profit Brut',
          description:
            'Restez au courant de votre profit brut avec vue rapide du suivi du profit avant et arrière pour maximiser chaque transaction.',
        },
        fiManagerPerformance: {
          title: 'Performance du Directeur F&I',
          description:
            "Comparez les performances du Directeur F&I avec les moyennes de l'équipe et comparez aux normes de l'industrie pour une rentabilité maximale.",
        },
        salesManagerPerformance: {
          title: 'Performance du Directeur des Ventes',
          description:
            "Visualisez les performances du Directeur des Ventes par rapport aux collègues et comparez les métriques individuelles dans l'équipe de gestion des ventes.",
        },
        salesDasBoard: {
          title: 'DAS Board des Ventes',
          description:
            "Visualisez vos leaders vendeurs et suivez les meilleurs performeurs pour une productivité maximale tout en surveillant la dynamique de l'équipe et la réalisation des objectifs individuels.",
        },
        pvrDealership: {
          title: 'PVR',
          description:
            'Par Véhicule Vendu - Suivez le profit moyen de la concession par véhicule avant et arrière pour voir les résultats rapidement.',
        },
        goalTracking: {
          title: 'Suivi des Objectifs',
          description:
            "Déterminez rapidement le progrès des ventes d'unités MTD et suivez les performances par rapport aux objectifs mensuels.",
        },
        unitsSoldDealer: {
          title: 'Unités Vendues',
          description:
            "Suivez rapidement le total des unités vendues incluant véhicules neufs et d'occasion avec ventes MTD.",
        },
      },
    },
  } as Translations,
  de: {
    nav: {
      home: 'Startseite',
      screenshots: 'Screenshots',
      pricing: 'Preise',
      about: 'Über uns',
      login: 'Anmelden',
      signup: 'Registrieren',
      legal: 'Rechtliches',
    },
    home: {
      title: 'Das DAS Board',
      subtitle:
        'Echtzeit-Dashboards mit kritischen Einblicken für Finanzmanager, Autohäuser und Händlergruppen.',
      startTrial: 'Kostenlose Testversion starten',
      signupNow: 'Jetzt Anmelden!',
      viewScreenshots: 'Screenshots ansehen',
      mission:
        '"Das DAS Board definiert den Erfolg von Autohäusern neu und befähigt Verkaufsleiter, Teams zu optimieren, und Finanzmanager, Gewinne mit wichtigen Verkaufseinblicken zu maximieren, und Verkäufer, ihre Geschäfte im Blick zu behalten." - Tyler Durden',
      features: {
        title: 'Hauptfunktionen',
        subtitle: 'Alles was Sie brauchen, um Ihre Autohaus-Operationen effektiv zu verwalten',
      },
      pricing: {
        title: 'Jetzt ausprobieren',
        subtitle:
          'Starten Sie Ihre kostenlose Testversion und sehen Sie den Unterschied, den Echtzeit-Einblicke für Ihr Autohaus machen können.',
      },
      pricingTiers: {
        singleFinance: {
          name: 'Einzelner Finanzmanager',
          price: '$20/Monat begrenzte Zeit',
          originalPrice: '$29.99/Monat',
          description:
            'Perfekt für individuelle Finanzmanager, die ihre persönliche Leistung verfolgen möchten',
          features: [
            'Persönliche Geschäftsverfolgung',
            'PVR & Produktgewinn-Analysen',
            'Zahlungsrechner',
            'Leistungsmetriken',
            'Kann steuerlich absetzbar sein',
          ],
          buttonText: 'Jetzt Loslegen!',
          setupTime: 'Risikolos für einen ganzen Kalendermonat testen',
        },
        dealership: {
          name: 'Autohaus / Händlergruppe',
          price: '$250/mo base',
          description:
            'Vollständiges Autohaus-Management mit rollenspezifischen Dashboards und Teamverwaltung',
          popular: 'Am Beliebtesten',
          features: [
            'Alle Einzelmanager-Funktionen',
            'Team-Dashboards für alle Rollen',
            'Mehrstandort-Analysen',
            'Flexible Verwaltungsstrukturen',
          ],
          buttonText: 'Ihr Paket Konfigurieren',
          setupTime: 'Starten Sie noch heute',
        },
        priceSubtext: 'pro Autohaus + Add-ons',
      },
      cta: {
        title: 'Bereit, Ihre Autohaus-Operationen zu transformieren?',
        subtitle:
          'Schließen Sie sich Hunderten von Autohäusern an, die bereits Das DAS Board verwenden, um ihre Operationen zu optimieren.',
      },
    },
    features: {
      finance: {
        title: 'Finanz-Dashboards',
        desc: 'Echtzeit-Einblicke für Finanzmanager zur Verfolgung der täglichen Leistung, Protokollierung von Geschäften, Anzeige von Metriken einschließlich PVR, VSC und anderen Produkten.',
      },
      sales: {
        title: 'Verkaufsteam-Dashboards',
        desc: 'Das DAS Board ist Ihre neue Bestenliste! Verfolgen Sie Ihre Geschäfte und wissen Sie genau, wo Sie im Laufe des Monats stehen.',
      },
      manager: {
        title: 'Verkaufsleiter-Dashboards',
        desc: 'Sehen Sie Geschäftsprotokolle, Verkäuferstatistiken, verwalten Sie Ihre Teams effektiver.',
      },
      info: {
        title: 'Informative Dashboards',
        desc: 'Rollenspezifische Dashboards für Verkaufsteams, Finanzmanager, Verkaufsleiter und Geschäftsführer.',
      },
      scheduler: {
        title: 'Dynamischer Planer',
        desc: 'Dynamischer Verkäuferplaner für effiziente Teamkoordination. Verwalten Sie Zeitpläne, um die tägliche Produktion zu maximieren.',
      },
      calculator: {
        title: 'Gehaltsrechner',
        desc: 'Ihr Verkaufsteam und Ihre Finanzmanager können die monatlichen Echtzeit-Einnahmen mit vorkonfigurierten Gehaltsplänen sehen.',
      },
    },
    screenshots: {
      title: 'Sehen Sie Das DAS Board in Aktion',
      subtitle:
        'Werfen Sie einen Blick auf unsere intuitiven Dashboards, die für Automobilprofis entwickelt wurden.',
      finance: {
        title: 'Finanzmanager-Dashboard',
        desc: 'Verfolgen Sie Geschäfte, PVR, VSC-Metriken und tägliche Leistung in Echtzeit.',
      },
      sales: {
        title: 'Verkaufs-Dashboard',
        desc: 'Ihre persönliche Bestenliste mit Geschäften, Rankings und monatlichem Fortschritt.',
      },
      manager: {
        title: 'Verkaufsleiter-Dashboard',
        desc: 'Umfassende Teamübersicht mit Geschäftsprotokollen und Leistungsanalysen.',
      },
      gm: {
        title: 'Geschäftsführer-Dashboard',
        desc: 'Hochrangige Einblicke in die Autohaus-Leistung und Teamproduktivität.',
      },
    },
    pricing: {
      title: 'Wählen Sie den perfekten Plan',
      subtitle:
        'Beginnen Sie mit unserer kostenlosen Testversion für Finanzmanager oder wählen Sie den Plan, der mit Ihrem Autohaus skaliert.',
      finance: 'Finanzmanager',
      dealership: 'Einzelnes Autohaus',
      group: 'Händlergruppen',
      freeTime: 'Kostenlos für begrenzte Zeit!',
      getStarted: 'Loslegen',
      startTrial: 'Kostenlose Testversion starten',
      popular: 'Am beliebtesten',
      viewDetails: 'Vollständige Preisdetails anzeigen →',
      tiers: {
        finance: {
          name: 'Finanzmanager',
          price: 'Kostenlos für begrenzte Zeit!',
          originalPrice: '5€/Monat',
          description: 'Perfekt für einzelne Finanzmanager',
        },
        dealership: {
          name: 'Kleine Händlergruppen',
          price: '250€/Monat pro Autohaus',
          description: '1-5 Autohäuser',
        },
        group: {
          name: 'Händlergruppen 6+',
          price: '200€/Monat pro Autohaus*',
          description: 'Alles was Einzelautohaus bietet plus Area VP Dashboard',
        },
      },
    },
    about: {
      title: 'Wer wir sind',
      subtitle:
        'Leidenschaftliche Profis, die sich der Revolutionierung des Autohaus-Managements durch innovative Technologie und datengesteuerte Einblicke widmen.',
      founderVision: {
        title: 'Warum ich Das DAS Board erstellt habe – Tyler Durden, CEO und Gründer',
        paragraph1:
          'Mit über 27 Jahren Erfahrung in der Automobilhändler-Branche habe ich aus erster Hand die Herausforderungen gesehen, denen sich Manager gegenübersehen, wenn sie ihre Rollen als Führungskräfte und Leistungsträger ausbalancieren. Als erfahrener Profi gründete ich Das DAS Board, um eine kritische Lücke zu schließen, die ich beobachtet hatte: Während Verkaufsleiter beim Verkauf von Autos hervorragend sind, haben sie oft Schwierigkeiten, ihre Verkaufsteams effektiv zu führen.',
        paragraph2:
          'Ich glaube, dass informierte, motivierte und gut unterstützte Verkäufer der Schlüssel für außergewöhnliche Ergebnisse sind – weit über die Ergebnisse von desengagierten oder uninformierten Teams hinaus. Das DAS Board befähigt Verkaufsleiter mit intuitiven Tools, ihre Teams effektiver zu führen und sicherzustellen, dass sie sich sowohl auf die Teamentwicklung als auch auf die Verkaufsexzellenz konzentrieren können.',
        paragraph3:
          'Über den Verkauf hinaus unterstützt die App Finanzmanager, indem sie Echtzeit-Einblicke in die Geschäftsrentabilität und wichtige Metriken bietet, während sie GMs umsetzbare Berichte zur Verfügung stellt, um strategische Entscheidungen zu leiten. Meine Vision mit Das DAS Board ist es, das Autohaus-Management zu revolutionieren und eine Kultur der Effizienz, Transparenz und des Erfolgs auf allen Ebenen der Organisation zu fördern.',
      },
      team: {
        title: 'Unser Team',
        members: {
          tyler: {
            name: 'Tyler Durden',
            role: 'CEO & Gründer',
            bio: 'Aufbauend auf umfangreicher Erfahrung im Autohaus-Management gründete Tyler Durden Das DAS Board, um eine Kultur zu fördern, in der informierte und motivierte Mitarbeiter gedeihen und die Produktivität durch transparente, datengesteuerte Tools steigern, die Automobilteams stärken.',
          },
          sarah: {
            name: 'Sarah Conner',
            role: 'Chief Product Officer',
            bio: 'Mit über 25 Jahren Erfahrung in Autohäusern und im Einzelhandel bringt Sarah Conner tiefe Einblicke für den Verkaufserfolg mit. Sie versteht die Macht effektiver Tools und qualifizierter Führung, um Teams zu inspirieren und sicherzustellen, dass Das DAS Board außergewöhnliche Ergebnisse für Autohäuser erzielt.',
          },
          claude: {
            name: 'Claude Sonnet',
            role: 'Chief Technology Officer',
            bio: 'Claude Sonnet bringt tiefe Expertise in der Entwicklung von Software mit, die hervorragend ist, mit einem Fokus auf skalierbare, sichere Plattformen. Seine Fähigkeit, Einblicke ohne Komplexität zu liefern, stellt sicher, dass Das DAS Board nahtlose, zuverlässige Technologie für Autohäuser bereitstellt.',
          },
          annie: {
            name: 'Annie Porter',
            role: 'Customer Success Direktorin',
            bio: 'Engagiert dafür zu sorgen, dass jeder DAS Board-Kunde das Beste aus unserer Plattform durch personalisierte Einarbeitung und Support herausholt',
          },
        },
      },
      values: {
        title: 'Unsere Werte',
        customerFocused: {
          title: 'Kundenorientiert',
          description:
            'Wir stärken Autohäuser mit intuitiven Dashboards, die ihre einzigartigen Bedürfnisse priorisieren und nahtloses Management und verbesserte Kundenerfahrungen gewährleisten.',
        },
        dataDriven: {
          title: 'Datengesteuert',
          description:
            'Unsere Plattform liefert Echtzeit-umsetzbare Einblicke aus Autohaus-Daten und ermöglicht präzise Entscheidungsfindung zur Steigerung von Verkäufen und betrieblicher Effizienz.',
        },
        continuousImprovement: {
          title: 'Kontinuierliche Verbesserung',
          description:
            'Wir verfeinern unerbittlich unsere Tools, um Autohäusern zu helfen, die Leistung zu optimieren, sich an Branchentrends anzupassen und nachhaltiges Wachstum zu erreichen.',
        },
      },
    },
    dashboard: {
      singleFinance: {
        title: 'Einzel-Finanzmanager-Dashboard',
        homeTitle: 'Einzel-Finanzmanager',
        productMix: {
          ppd: 'PPD',
        },
        kpi: {
          fiGross: 'F&I Brutto',
          dealsProcessed: 'Verarbeitete Geschäfte',
          dealTypes: 'Geschäftsarten',
          productsPerDeal: 'Produkte pro Geschäft',
          pvr: 'PVR',
          pvrFull: 'PVR (Pro Verkauftem Fahrzeug)',
        },
      },
    },
    contact: {
      title: 'Kontaktieren Sie uns',
      subtitle:
        'Bereit zu sehen, wie The DAS Board Ihre Autohausoperationen transformieren kann? Wir würden gerne von Ihnen hören.',
      email: 'E-mail',
      phone: 'Telefon',
    },
    currency: {
      symbol: '€',
      name: 'EUR',
    },
    legal: {
      terms: {
        title: 'Nutzungsbedingungen',
        lastUpdated: 'Letzte Aktualisierung: 6/28/2025',
        intro:
          'Willkommen bei The DAS Board. Diese Nutzungsbedingungen ("Bedingungen") regeln Ihren Zugang zu und die Nutzung unserer Autohausmanagement-Software-Plattform. Durch den Zugriff auf oder die Nutzung unserer Dienste stimmen Sie zu, an diese Bedingungen gebunden zu sein.',
        sections: {
          acceptance: {
            title: '1. Annahme der Bedingungen',
            content:
              'Durch die Erstellung eines Kontos, den Zugriff auf oder die Nutzung von The DAS Board bestätigen Sie, dass Sie diese Bedingungen und unsere Datenschutzrichtlinie gelesen, verstanden und zugestimmt haben, daran gebunden zu sein. Wenn Sie diesen Bedingungen nicht zustimmen, dürfen Sie unsere Dienste nicht nutzen. Sie müssen mindestens 18 Jahre alt sein und die Befugnis haben, diese Bedingungen im Namen Ihrer Organisation einzugehen.',
          },
          service: {
            title: '2. Servicebeschreibung',
            content:
              'The DAS Board ist eine cloudbasierte Autohausmanagement-Software-Plattform, die Tools für Bestandsmanagement, Verkaufsverfolgung, Kundenbeziehungsmanagement, Finanzberichterstattung und verwandte Dienstleistungen der Automobilindustrie bereitstellt. Wir behalten uns das Recht vor, jeden Aspekt unseres Dienstes mit angemessener Ankündigung zu ändern, auszusetzen oder einzustellen.',
          },
          account: {
            title: '3. Kontoregistrierung und Sicherheit',
            content:
              'Um unsere Dienste zu nutzen, müssen Sie ein Konto mit genauen und vollständigen Informationen erstellen. Sie sind verantwortlich für:',
            items: [
              'Die Vertraulichkeit Ihrer Kontoanmeldedaten zu wahren',
              'Alle Aktivitäten, die unter Ihrem Konto auftreten',
              'Uns sofort über jede unbefugte Nutzung zu benachrichtigen',
              'Sicherzustellen, dass Ihre Kontoinformationen aktuell und genau bleiben',
              'Die Einhaltung unserer Sicherheitsanforderungen und bewährten Praktiken',
            ],
          },
          subscription: {
            title: '4. Abonnement- und Zahlungsbedingungen',
            content:
              'The DAS Board arbeitet auf Abonnementbasis. Durch ein Abonnement stimmen Sie zu:',
            items: [
              'Alle mit Ihrem Abonnementplan verbundenen Gebühren zu zahlen',
              'Automatische Verlängerung, es sei denn, vor dem Verlängerungsdatum gekündigt',
              'Gebührenänderungen mit 30-tägiger Vorankündigung',
              'Keine Rückerstattungen für Teilabonnementzeiträume',
              'Aussetzung des Dienstes bei Nichtzahlung nach angemessener Ankündigung',
            ],
          },
          usage: {
            title: '5. Richtlinie für akzeptable Nutzung',
            content:
              'Sie stimmen zu, The DAS Board nur für rechtmäßige Zwecke und in Übereinstimmung mit diesen Bedingungen zu verwenden. Sie dürfen nicht:',
            items: [
              'Anwendbare Gesetze, Vorschriften oder Rechte Dritter verletzen',
              'Schädliche, beleidigende oder unangemessene Inhalte hochladen',
              'Versuchen, unbefugten Zugang zu unseren Systemen oder Konten anderer Benutzer zu erlangen',
              'Den Dienst verwenden, um Spam, Malware oder andere bösartige Inhalte zu senden',
              'Reverse Engineering betreiben, dekompilieren oder versuchen, Quellcode zu extrahieren',
              'Die Integrität oder Leistung unserer Dienste stören oder beeinträchtigen',
              'Die Plattform für betrügerische oder illegale Aktivitäten verwenden',
            ],
          },
          intellectual: {
            title: '6. Rechte an geistigem Eigentum',
            content:
              'The DAS Board und alle verwandten Technologien, Inhalte und Materialien sind Eigentum von uns oder unseren Lizenzgebern. Dies umfasst:',
            items: [
              'Software, Algorithmen und Benutzeroberflächen',
              'Marken, Logos und Markenmaterialien',
              'Dokumentation, Tutorials und Supportmaterialien',
              'Analysen, Berichte und aggregierte Dateneinblicke',
            ],
            footer:
              'Sie behalten das Eigentum an Ihren Daten, gewähren uns jedoch eine Lizenz, diese zur Bereitstellung unserer Dienste zu verwenden. Wir können anonymisierte, aggregierte Daten für Branchenforschung und Plattformverbesserung verwenden.',
          },
          privacy: {
            title: '7. Datenschutz und Privatsphäre',
            content:
              'Sie sind dafür verantwortlich sicherzustellen, dass alle personenbezogenen Daten, die Sie über unsere Plattform verarbeiten, den anwendbaren Datenschutzgesetzen entsprechen. Wir werden Daten in Übereinstimmung mit unserer Datenschutzrichtlinie und anwendbaren Datenschutzbestimmungen verarbeiten, einschließlich DSGVO und CCPA, wo anwendbar.',
          },
          availability: {
            title: '8. Dienstverfügbarkeit und Support',
            content:
              'Obwohl wir eine hohe Verfügbarkeit anstreben, garantieren wir keinen ununterbrochenen Service. Wir bieten:',
            items: [
              '99,9% Betriebszeit-SLA für kostenpflichtige Abonnements',
              'Regelmäßige Wartungsfenster mit Vorankündigung',
              'Technischen Support basierend auf Ihrem Abonnementlevel',
              'Sicherheitsüberwachung und Incident Response',
            ],
          },
          termination: {
            title: '9. Kündigung',
            content: 'Beide Parteien können diese Bedingungen kündigen:',
            items: [
              'Sie können Ihr Abonnement jederzeit über Ihre Kontoeinstellungen kündigen',
              'Wir können bei Verletzung dieser Bedingungen mit angemessener Ankündigung kündigen',
              'Wir können den Service sofort bei schwerwiegenden Verletzungen oder Sicherheitsbedrohungen aussetzen',
              'Bei Kündigung verlieren Sie den Zugang zur Plattform und Ihren Daten',
              'Wir werden eine angemessene Gelegenheit bieten, Ihre Daten vor der Löschung zu exportieren',
            ],
          },
          disclaimers: {
            title: '10. Haftungsausschlüsse und Haftungsbeschränkungen',
            content:
              'THE DAS BOARD WIRD "WIE BESEHEN" OHNE GEWÄHRLEISTUNGEN JEGLICHER ART BEREITGESTELLT. IM MAXIMAL GESETZLICH ZULÄSSIGEN UMFANG:',
            items: [
              'Wir schließen alle Gewährleistungen aus, ausdrücklich oder stillschweigend, einschließlich Marktgängigkeit und Eignung für einen bestimmten Zweck',
              'Wir haften nicht für indirekte, zufällige, besondere oder Folgeschäden',
              'Unsere Gesamthaftung übersteigt nicht die von Ihnen in den 12 Monaten vor der Forderung gezahlten Gebühren',
              'Sie erkennen an, dass Software Fehler enthalten kann und stimmen zu, diese umgehend zu melden',
            ],
          },
          indemnification: {
            title: '11. Schadloshaltung',
            content:
              'Sie stimmen zu, uns von allen Ansprüchen, Verlusten oder Schäden freizustellen und schadlos zu halten, die sich aus Ihrer Nutzung unserer Dienste, der Verletzung dieser Bedingungen oder der Verletzung von Rechten Dritter ergeben.',
          },
          governing: {
            title: '12. Anwendbares Recht und Streitbeilegung',
            content:
              'Diese Bedingungen unterliegen den Gesetzen von [Gerichtsbarkeit] ohne Berücksichtigung von Kollisionsnormen. Alle Streitigkeiten werden durch verbindliche Schiedsgerichtsbarkeit beigelegt, außer bei Ansprüchen auf einstweilige Verfügung, die vor entsprechenden Gerichten geltend gemacht werden können.',
          },
          changes: {
            title: '13. Änderungen der Bedingungen',
            content:
              'Wir können diese Bedingungen von Zeit zu Zeit ändern. Wir werden mindestens 30 Tage im Voraus über wesentliche Änderungen informieren. Die fortgesetzte Nutzung unserer Dienste nach Inkrafttreten der Änderungen stellt eine Annahme der überarbeiteten Bedingungen dar.',
          },
          entire: {
            title: '14. Vollständige Vereinbarung',
            content:
              'Diese Bedingungen bilden zusammen mit unserer Datenschutzrichtlinie und zusätzlichen Vereinbarungen die vollständige Vereinbarung zwischen Ihnen und The DAS Board bezüglich Ihrer Nutzung unserer Dienste.',
          },
          contact: {
            title: '15. Kontaktinformationen',
            content: 'Wenn Sie Fragen zu diesen Bedingungen haben, kontaktieren Sie uns bitte:',
            email: 'legal@thedasboard.com',
            address: '[Firmenadresse]',
            phone: '[Support-Telefonnummer]',
          },
        },
      },
      privacy: {
        title: 'Datenschutzrichtlinie',
        lastUpdated: 'Letzte Aktualisierung: 28.6.2025',
        intro:
          'Diese Datenschutzrichtlinie beschreibt, wie The DAS Board („wir", „uns" oder „unser") Ihre persönlichen Informationen sammelt, verwendet und schützt, wenn Sie unsere Dealership-Management-Software-Plattform nutzen. Wir verpflichten uns, Ihre Privatsphäre zu schützen und Ihre Daten verantwortungsvoll zu behandeln.',
        sections: {
          collection: {
            title: '1. Informationen, die wir sammeln',
            content:
              'Wenn Sie The DAS Board verwenden, sammeln wir verschiedene Arten von Informationen, um unsere Dienste bereitzustellen und zu verbessern:',
            items: [
              '<strong>Kontoinformationen:</strong> Name, E-Mail-Adresse, Telefonnummer, Firmenname, Berufsbezeichnung und Rechnungsinformationen',
              '<strong>Händlerdaten:</strong> Fahrzeuginventar, Verkaufsaufzeichnungen, Kundeninformationen und Finanztransaktionen',
              '<strong>Nutzungsdaten:</strong> Aufgerufene Funktionen, auf der Plattform verbrachte Zeit, Benutzerinteraktionen und Leistungsmetriken',
              '<strong>Technische Daten:</strong> IP-Adresse, Browsertyp, Geräteinformationen, Betriebssystem und Zugriffsprotokolle',
              '<strong>Kommunikationsdaten:</strong> Support-Anfragen, Feedback und Korrespondenz mit unserem Team',
              '<strong>Standortdaten:</strong> Händleradressen und, mit Zustimmung, Gerätestandort für mobile Funktionen',
            ],
          },
          usage: {
            title: '2. Wie wir Ihre Informationen verwenden',
            content:
              'Wir verwenden die gesammelten Informationen für legitime Geschäftszwecke, einschließlich:',
            items: [
              'Bereitstellung, Wartung und Verbesserung der The DAS Board Plattform und Funktionen',
              'Verarbeitung von Abonnements, Zahlungen und Verwaltung Ihres Kontos',
              'Generierung von Analysen, Berichten und Geschäftseinblicken für Ihr Autohaus',
              'Bereitstellung von Kundensupport und Beantwortung Ihrer Anfragen',
              'Versendung von Service-Updates, Sicherheitswarnungen und administrativen Nachrichten',
              'Erkennung, Verhinderung und Behebung technischer Probleme und Sicherheitsbedrohungen',
              'Einhaltung gesetzlicher Verpflichtungen und Branchenvorschriften',
              'Verbesserung der Benutzererfahrung durch Produktentwicklung und -forschung',
            ],
          },
          sharing: {
            title: '3. Weitergabe Ihrer Informationen',
            content:
              'Wir verkaufen, vermieten oder tauschen Ihre persönlichen Informationen nicht. Wir können Ihre Informationen nur unter folgenden Umständen weitergeben:',
            items: [
              '<strong>Dienstanbieter:</strong> Drittanbieter, die uns beim Betrieb unserer Plattform helfen (Hosting, Analysen, Zahlungsverarbeitung)',
              '<strong>Geschäftspartner:</strong> Autorisierte Integrationen und Automobilbranchenpartner mit Ihrer ausdrücklichen Zustimmung',
              '<strong>Gesetzliche Anforderungen:</strong> Wenn gesetzlich, durch Vorschriften oder gültige Gerichtsverfahren erforderlich',
              '<strong>Geschäftsübertragungen:</strong> Im Zusammenhang mit Fusionen, Übernahmen oder Vermögensverkäufen (mit Benachrichtigung an Sie)',
              '<strong>Sicherheit und Schutz:</strong> Zum Schutz der Rechte, des Eigentums oder der Sicherheit unserer Benutzer oder der Öffentlichkeit',
            ],
          },
          retention: {
            title: '4. Datenaufbewahrung',
            content:
              'Wir bewahren Ihre persönlichen Informationen so lange auf, wie es zur Bereitstellung unserer Dienste und zur Erfüllung gesetzlicher Verpflichtungen erforderlich ist. Konkret:',
            items: [
              'Kontodaten werden aufbewahrt, solange Ihr Abonnement aktiv ist und 3 Jahre nach Kündigung',
              'Transaktionsaufzeichnungen werden 7 Jahre lang aufbewahrt, um Finanzvorschriften zu entsprechen',
              'Nutzungsprotokolle werden 2 Jahre lang für Sicherheits- und Leistungsanalysen aufbewahrt',
              'Kommunikationsaufzeichnungen werden 5 Jahre lang für Kundenservice-Zwecke aufbewahrt',
            ],
          },
          rights: {
            title: '5. Ihre Rechte und Wahlmöglichkeiten',
            content:
              'Je nach Ihrem Standort haben Sie möglicherweise die folgenden Rechte bezüglich Ihrer persönlichen Informationen:',
            items: [
              '<strong>Zugang:</strong> Anfordern einer Kopie Ihrer persönlichen Informationen, die wir besitzen',
              '<strong>Berichtigung:</strong> Aktualisierung oder Korrektur ungenauer persönlicher Informationen',
              '<strong>Löschung:</strong> Anfordern der Löschung Ihrer persönlichen Informationen (vorbehaltlich gesetzlicher Verpflichtungen)',
              '<strong>Portabilität:</strong> Erhalt Ihrer Daten in einem maschinenlesbaren Format',
              '<strong>Einschränkung:</strong> Begrenzung der Verarbeitung Ihrer persönlichen Informationen',
              '<strong>Widerspruch:</strong> Widerspruch gegen die Verarbeitung basierend auf berechtigten Interessen',
            ],
          },
          cookies: {
            title: '6. Cookies und Tracking-Technologien',
            content:
              'Wir verwenden Cookies und ähnliche Technologien, um Ihre Erfahrung zu verbessern:',
            items: [
              '<strong>Wesentliche Cookies:</strong> Erforderlich für Plattformfunktionalität und Sicherheit',
              '<strong>Analyse-Cookies:</strong> Helfen uns zu verstehen, wie Sie unsere Plattform nutzen',
              '<strong>Präferenz-Cookies:</strong> Merken sich Ihre Einstellungen und Anpassungen',
              '<strong>Marketing-Cookies:</strong> Verwendet für gezielte Kommunikation (mit Ihrer Zustimmung)',
            ],
            footer:
              'Sie können Cookie-Präferenzen über Ihre Browser-Einstellungen oder unser Cookie-Management-Tool steuern.',
          },
          security: {
            title: '7. Sicherheitsmaßnahmen',
            content:
              'Wir implementieren branchenübliche Sicherheitsmaßnahmen zum Schutz Ihrer Informationen, einschließlich:',
            items: [
              'Verschlüsselung von Daten während der Übertragung und im Ruhezustand mit AES-256-Standards',
              'Regelmäßige Sicherheitsaudits und Penetrationstests',
              'Multi-Faktor-Authentifizierung und Zugriffskontrollen',
              'SOC 2 Type II Compliance und regelmäßige Sicherheitsbewertungen',
              'Mitarbeiterschulungen zu Datenschutz und Sicherheits-Best-Practices',
            ],
          },
          international: {
            title: '8. Internationale Datenübertragungen',
            content:
              'Ihre Informationen können in andere Länder als Ihr eigenes übertragen und verarbeitet werden. Wir stellen sicher, dass angemessene Schutzmaßnahmen vorhanden sind, einschließlich Standardvertragsklauseln und Angemessenheitsbeschlüssen, um Ihre Daten bei internationalen Übertragungen zu schützen.',
          },
          children: {
            title: '9. Privatsphäre von Kindern',
            content:
              'The DAS Board ist nicht für die Nutzung durch Personen unter 18 Jahren bestimmt. Wir sammeln wissentlich keine persönlichen Informationen von Kindern unter 18 Jahren. Wenn wir von einer solchen Sammlung erfahren, löschen wir die Informationen umgehend.',
          },
          changes: {
            title: '10. Änderungen an dieser Datenschutzrichtlinie',
            content:
              'Wir können diese Datenschutzrichtlinie regelmäßig aktualisieren, um Änderungen in unseren Praktiken oder gesetzlichen Anforderungen zu reflektieren. Wir werden Sie über wesentliche Änderungen per E-Mail oder Plattform-Benachrichtigung mindestens 30 Tage vor Inkrafttreten informieren.',
          },
          contact: {
            title: '11. Kontakt',
            content:
              'Wenn Sie Fragen zu dieser Datenschutzrichtlinie haben oder Ihre Rechte ausüben möchten, kontaktieren Sie uns bitte:',
            email: 'privacy@thedasboard.com',
            address: '[Company Address]',
            phone: '[Support Phone Number]',
          },
        },
      },
      subscription: {
        title: 'Abonnementvereinbarung',
        lastUpdated: 'Letzte Aktualisierung: 6/28/2025',
        intro:
          'Diese Abonnementvereinbarung regelt Ihr Abonnement und die Nutzung der Autohaus-Verwaltungsplattform The DAS Board.',
        sections: {
          plans: {
            title: '1. Abonnementpläne',
            content: 'The DAS Board bietet Abonnementstufen für verschiedene Autohaus-Bedürfnisse:',
            items: [
              '<strong>60-Tage kostenlose Testversion:</strong> Vollzugriff auf die Plattform ohne erforderliche Kreditkarte',
              '<strong>Finanzmanager:</strong> Individueller Benutzerzugang mit zentralen Finanztools',
              '<strong>Autohaus:</strong> Multi-User-Zugang mit vollständiger Inventar- und Verkaufsverwaltung',
              '<strong>Händlergruppe:</strong> Unternehmenszugang auf mehreren Standorten',
            ],
            footer:
              'Abonnements werden monatlich im Voraus abgerechnet. Sie können Ihr Abonnement jederzeit upgraden oder downgraden, Änderungen treten im nächsten Abrechnungszyklus in Kraft.',
          },
          payment: {
            title: '2. Zahlungsbedingungen',
            content:
              'Die Zahlung ist bei Abonnementbeginn und am selben Tag jeden Monat danach fällig. Wir akzeptieren Hauptkreditkarten und ACH-Überweisungen für Unternehmenskonten. Bei fehlgeschlagener Zahlung können wir Ihren Zugang zu The DAS Board nach angemessener Benachrichtigung sperren.',
          },
          trial: {
            title: '3. Testperiode',
            content:
              'Die 60-Tage-Testversion bietet vollständigen Zugang zur The DAS Board Plattform. Keine Kreditkarte erforderlich, um Ihre Testversion zu starten. Am Ende der Testperiode müssen Sie einen kostenpflichtigen Plan auswählen, um die Plattform weiter zu nutzen. Testdaten werden 30 Tage nach Ablauf der Testversion gespeichert.',
          },
          cancellation: {
            title: '4. Kündigung und Rückerstattungen',
            content:
              'Sie können Ihr Abonnement jederzeit über Ihre Kontoeinstellungen oder durch Kontaktaufnahme mit unserem Support-Team kündigen. Bei Kündigung:',
            items: [
              'Sie behalten Zugang bis zum Ende Ihrer aktuellen Abrechnungsperiode',
              'Keine Rückerstattungen für Teilmonate des Service',
              'Ihre Daten stehen 90 Tage nach Kündigung zum Export zur Verfügung',
              'Automatische Verlängerung wird deaktiviert',
            ],
          },
          sla: {
            title: '5. Service Level Agreement',
            content: 'Für bezahlte Abonnements verpflichten wir uns zu:',
            items: [
              '99,9% Plattform-Betriebszeit-Verfügbarkeit',
              'Geplante Wartungsfenster mit 48-Stunden-Vorankündigung',
              'Kundensupport-Antwort innerhalb von 24 Stunden für Standardanfragen',
              'Prioritätssupport für Händlergruppen-Abonnenten',
            ],
          },
          data: {
            title: '6. Daten und Sicherheit',
            content: 'Ihre Autohaus-Daten bleiben Ihr Eigentum. Wir bieten:',
            items: [
              'Tägliche automatisierte Backups mit 30-tägiger Aufbewahrung',
              'Verschlüsselung und Sicherheitsprotokolle auf Bankniveau',
              'DSGVO- und CCPA-Konformität für Datenschutz',
              'Datenexport-Funktionen in Standardformaten',
            ],
          },
          support: {
            title: '7. Support und Schulung',
            content: 'Alle kostenpflichtigen Abonnements beinhalten:',
            items: [
              'Umfassende Onboarding- und Setup-Unterstützung',
              'Online-Schulungsressourcen und Dokumentation',
              'E-Mail- und Chat-Support während der Geschäftszeiten',
              'Regelmäßige Plattform-Updates und neue Feature-Releases',
            ],
          },
          modifications: {
            title: '8. Service-Modifikationen',
            content:
              'Wir können die The DAS Board Plattform modifizieren oder aktualisieren, um Funktionalität, Sicherheit oder Compliance zu verbessern. Wir werden angemessene Benachrichtigung über wesentliche Änderungen geben, die Ihre Nutzung beeinträchtigen können.',
          },
        },
      },
      pricingPage: {
        title: 'Wählen Sie Ihre',
        titleHighlight: 'Lösung',
        subtitle:
          'Wählen Sie die Option, die Ihre Bedürfnisse am besten beschreibt. Wir passen Ihre Erfahrung entsprechend an.',
        singleFinance: {
          title: 'Einzelner Finanzmanager',
          description:
            'Perfekt für individuelle Finanzmanager, die ihre persönliche Leistung und Geschäfte verfolgen möchten.',
          originalPrice: '$29.99/Monat',
          price: '$20/Monat begrenzte Zeit',
          features: [
            'Persönliche Geschäftsverfolgung',
            'PVR & Produktgewinn-Analysen',
            'Zahlungsrechner',
            'Leistungsmetriken',
            'Kann steuerlich absetzbar sein',
          ],
          buttonText: 'Jetzt Loslegen!',
          setupTime: 'Risikolos für einen ganzen Kalendermonat testen',
        },
        dealership: {
          title: 'Autohaus / Händlergruppe',
          description:
            'Vollständiges Autohaus-Management mit rollenspezifischen Dashboards, Teamverwaltung und Multi-Standort-Support.',
          price: '$250/Monat Basis',
          priceSubtext: 'pro Autohaus + Add-ons',
          popular: 'Am Beliebtesten',
          features: [
            'Alle Einzelmanager-Funktionen',
            'Team-Dashboards für alle Rollen',
            'Mehrstandort-Analysen',
            'Flexible Verwaltungsstrukturen',
            'Mengenrabatte verfügbar',
          ],
          buttonText: 'Dynamische Paketpreise Anzeigen',
          setupTime: 'Starten Sie noch heute',
        },
        benefits: {
          title: 'Transformieren Sie Ihr Autohaus Heute',
          performance: {
            title: 'Leistung Steigern',
            description:
              'Echtzeit-Einblicke helfen Teams, Ziele zu übertreffen und Rentabilität zu maximieren',
          },
          operations: {
            title: 'Abläufe Optimieren',
            description:
              'Zentralisiertes Management reduziert Verwaltungszeit und verbessert Effizienz',
          },
          security: {
            title: 'Sicher & Zuverlässig',
            description: 'Unternehmenssicherheit mit 99,9% Verfügbarkeitsgarantie',
          },
        },
        helpText: {
          title: 'Nicht sicher, welche Option Sie wählen sollen?',
          description:
            'Beginnen Sie mit der Einzelfinanzmanager-Option, um unsere Plattform zu testen, und aktualisieren Sie dann einfach auf Autohaus-Funktionen, wenn Sie bereit sind, Ihr Team zu erweitern.',
        },
        footer: {
          copyright: '© 2025 The DAS Board. Alle Rechte vorbehalten.',
          support: 'Fragen? Kontaktieren Sie uns unter',
          email: 'support@thedasboard.com',
        },
      },
    },
    demoPage: {
      backToHome: 'Zurück zur Startseite',
      title: 'Erleben Sie Das DAS Board',
      startFreeTrial: 'Kostenlose Testversion starten',
      subtitle:
        'Erkunden Sie unsere interaktive Demo, um zu sehen, wie verschiedene Rollen unser Dashboard nutzen',
      dashboards: {
        salesperson: {
          title: 'Verkäufer-Dashboard',
          description: 'Individuelle Verkaufsverfolgung und Kundenverwaltung',
        },
        finance: {
          title: 'Finanzmanager-Dashboard',
          description: 'Individuelle Finanzmanager-Leistungsverfolgung und Geschäfte',
        },
        salesManager: {
          title: 'Verkaufsleiter-Dashboard',
          description: 'Teamverwaltung und Verkaufsleistungsübersicht',
        },
        generalManager: {
          title: 'Geschäftsführer-Dashboard',
          description: 'Vollständige Händlerübersicht und Analysen',
        },
      },
      hotspots: {
        productTracking: {
          title: 'Produktverfolgung',
          description:
            'Überwachen Sie die Verkaufsleistung von Produkten, verfolgen Sie Garantien, GAP und andere F&I-Produkte zur Maximierung der Rentabilität pro Geschäft.',
        },
        performanceMetrics: {
          title: 'Leistungsmetriken',
          description:
            'Überwachen Sie Ihre persönliche Leistung mit wichtigen Metriken wie PVR (Pro verkauftem Fahrzeug), Produkte pro Geschäft und monatliche Ziele.',
        },
        teamPerformance: {
          title: 'Teamleistung',
          description:
            'Vergleichen Sie Ihre Leistung mit Teamdurchschnitten und sehen Sie, wie Sie unter Ihren Kollegen rangieren.',
        },
        recentDealsLog: {
          title: 'Protokoll der letzten Geschäfte',
          description:
            'Anzeigen und Verwalten Ihrer neuesten Geschäfte mit schnellem Zugriff auf Kundendetails und Geschäftsrentabilität.',
        },
        pvr: {
          title: 'PVR',
          description:
            'Pro verkauftem Fahrzeug - Verfolgen Sie Ihren durchschnittlichen Gewinn pro Fahrzeug und vergleichen Sie mit Zielen und Teamdurchschnitten.',
        },
        payCalculator: {
          title: 'Gehaltsrechner',
          description:
            'Berechnen Sie Ihre Provision und Boni basierend auf Geschäftsrentabilität und Produktverkäufen.',
        },
        schedule: {
          title: 'Zeitplan',
          description: 'Sehen Sie Ihren Zeitplan für die Woche und den Monat',
        },
        teamSchedule: {
          title: 'Team-Zeitplan',
          description:
            'Einfache Ansicht von Teamzeitplänen, Anwesenheitsverfolgung und Schichtzuweisungsverwaltung für optimale Abdeckung.',
        },
        grossProfitIndicator: {
          title: 'Bruttogewinn-Indikator',
          description: 'Verfolgen Sie einfach Front-End- und Back-End-Bruttogewinn in Echtzeit.',
        },
        salesReports: {
          title: 'Verkaufsberichte, Planer, Ziele',
          description:
            'Zugriff auf umfassende Verkaufsberichte, Teamzeitpläne verwalten und monatliche/jährliche Ziele für Ihr Verkaufsteam festlegen/verfolgen.',
        },
        dasBoard: {
          title: 'Das DAS Board',
          description:
            'Sehen Sie die Verkaufs-Bestenliste, um über die Leistung und Rankings Ihrer Verkäufer auf dem Laufenden zu bleiben.',
        },
        salesPerformance: {
          title: 'Verkaufsleistung',
          description:
            'Schnellansicht zur Verfolgung von Verkaufszielen, Teamfortschritt und wichtigen Leistungsindikatoren.',
        },
        unitsSold: {
          title: 'Verkaufte Einheiten',
          description:
            'Verfolgen Sie die Gesamtzahl verkaufter Einheiten einschließlich Neu- und Gebrauchtwagen mit täglichen, wöchentlichen und monatlichen Aufschlüsselungen.',
        },
        unitCount: {
          title: 'Einheitenzählung',
          description:
            'Verfolgen Sie Ihre Neuwagen- und Gebrauchtwagenzahlen mit täglichen, wöchentlichen und monatlichen Aufschlüsselungen zur Überwachung des Verkaufsvolumens.',
        },
        dealLog: {
          title: 'Geschäftsprotokoll',
          description:
            'Bleiben Sie über alle Ihre Geschäfte mit detaillierten Kundeninformationen, Geschäftsstatus und Transaktionsverlauf auf dem Laufenden.',
        },
        goalTracker: {
          title: 'Zielverfolgung und Gehaltsrechner',
          description:
            'Bleiben Sie über Ihre Ziele und MTD-Gehaltsschätzer auf dem Laufenden, um Fortschritte zu verfolgen und Einnahmen zu maximieren.',
        },
        goalQuickView: {
          title: 'Ziel-Schnellansicht',
          description:
            'Wissen Sie leicht, wo Sie mit Ihren Zielen stehen und verfolgen Sie Fortschritte zu monatlichen und jährlichen Zielen.',
        },
        grossTracker: {
          title: 'Bruttogewinn-Tracker',
          description:
            'Bleiben Sie über Ihren Bruttogewinn mit Schnellansicht der Front- und Back-Bruttogewinnverfolgung auf dem Laufenden, um jedes Geschäft zu maximieren.',
        },
        fiManagerPerformance: {
          title: 'F&I-Manager-Leistung',
          description:
            'Vergleichen Sie die F&I-Manager-Leistung mit Teamdurchschnitten und benchmarken Sie gegen Branchenstandards für maximale Rentabilität.',
        },
        salesManagerPerformance: {
          title: 'Verkaufsleiter-Leistung',
          description:
            'Sehen Sie die Verkaufsleiter-Leistung im Vergleich zu Teamkollegen und vergleichen Sie individuelle Metriken im Vertriebsmanagement-Team.',
        },
        salesDasBoard: {
          title: 'Verkaufs-DAS-Board',
          description:
            'Sehen Sie Ihre Verkaufsleiter und verfolgen Sie Top-Performer für maximale Produktivität bei gleichzeitiger Überwachung der Teamdynamik und individuellen Zielerreichung.',
        },
        pvrDealership: {
          title: 'PVR',
          description:
            'Pro verkauftem Fahrzeug - Verfolgen Sie den durchschnittlichen Gewinn des Händlers pro Fahrzeug sowohl Front-End als auch Back-End für schnelle Ergebnisse.',
        },
        goalTracking: {
          title: 'Zielverfolgung',
          description:
            'Bestimmen Sie schnell den MTD-Einheitenverkaufsfortschritt und verfolgen Sie die Leistung gegen monatliche Ziele.',
        },
        unitsSoldDealer: {
          title: 'Verkaufte Einheiten',
          description:
            'Verfolgen Sie schnell die Gesamtzahl verkaufter Einheiten einschließlich Neu- und Gebrauchtwagen mit MTD-Verkäufen.',
        },
      },
    },
  } as Translations,
  cs: {
    nav: {
      home: 'Domů',
      screenshots: 'Snímky obrazovky',
      pricing: 'Ceny',
      about: 'O nás',
      login: 'Přihlášení',
      signup: 'Registrace',
      legal: 'Právní',
    },
    home: {
      title: 'The DAS Board',
      subtitle:
        'Dashboardy v reálném čase s kritickými poznatky pro finanční manažery, prodejce a manažery v automobilovém průmyslu.',
      startTrial: 'Začít bezplatnou zkušební verzi',
      signupNow: 'Registrujte se Nyní!',
      viewScreenshots: 'Zobrazit snímky obrazovky',
      mission:
        'Po 27 letech v automobilovém průmyslu jsem vytvořil DAS Board, abych poskytl dealerstvím nástroje, které potřebují k úspěchu. Naše platforma poskytuje poznatky v reálném čase, které pomáhají týmům dosáhnout svých cílů a zvýšit ziskovost.',
      features: {
        title: 'Vše, co potřebujete k úspěchu',
        subtitle: 'Komplexní sada nástrojů navržených pro moderní dealerství',
      },
      pricing: {
        title: 'Vyzkoušejte to nyní',
        subtitle:
          'Začněte s naší bezplatnou zkušební verzí pro finanční manažery nebo si vyberte plán, který se škáluje s vaším dealerstvím.',
      },
      pricingTiers: {
        singleFinance: {
          name: 'Individuální Finanční Manažer',
          price: '$20/měsíc omezený čas',
          originalPrice: '$29.99/měsíc',
          description:
            'Perfektní pro individuální finanční manažery, kteří chtějí sledovat svůj osobní výkon',
          features: [
            'Sledování osobních obchodů',
            'PVR a analýzy zisku z produktů',
            'Kalkulačka plateb',
            'Výkonnostní metriky',
            'Může být daňově odečitatelné',
          ],
          buttonText: 'Začněte Nyní!',
          setupTime: 'Vyzkoušejte bez rizika na celý kalendářní měsíc',
        },
        dealership: {
          name: 'Dealerství / Skupina Dealerství',
          price: '$250/mo base',
          description:
            'Kompletní řízení dealerství s dashboardy specifickými pro role a správou týmu',
          popular: 'Nejpopulárnější',
          features: [
            'Všechny funkce individuálního manažera',
            'Týmové dashboardy pro všechny role',
            'Analýzy více lokalit',
            'Flexibilní administrativní struktury',
          ],
          buttonText: 'Nakonfigurovat Váš Balíček',
          setupTime: 'Začněte ještě dnes',
        },
        priceSubtext: 'za prodejnu + doplňky',
      },
      cta: {
        title: 'Připraveni začít?',
        subtitle:
          'Připojte se ke stovkám dealerství, která již používají DAS Board k optimalizaci svých operací.',
      },
    },
    features: {
      finance: {
        title: 'Finanční dashboard',
        desc: 'Sledujte PVR, VSC a celkový hrubý zisk v reálném čase s intuitivními grafy a metrikami.',
      },
      sales: {
        title: 'Prodejní dashboard',
        desc: 'Monitorujte prodejní výkon, cíle a žebříčky s podrobnými poznatky pro každého člena týmu.',
      },
      manager: {
        title: 'Manažerský dashboard',
        desc: 'Získejte přehled o celém dealerství s komplexními zprávami a analýzami výkonu.',
      },
      info: {
        title: 'Sledování informací',
        desc: 'Spravujte a sledujte všechny důležité informace o dealerství na jednom místě.',
      },
      scheduler: {
        title: 'Plánovač',
        desc: 'Organizujte plány a cíle týmu s pokročilými nástroji pro plánování.',
      },
      calculator: {
        title: 'Kalkulačka výplat',
        desc: 'Vypočítejte provize a výplaty v reálném čase s přesnými metrikami.',
      },
    },
    screenshots: {
      title: 'Podívejte se na naše dashboardy',
      subtitle: 'Prozkoumejte výkonné funkce navržené pro každou roli ve vašem dealerství',
      finance: {
        title: 'Finanční manažer',
        desc: 'Sledujte PVR, VSC a výkonnostní metriky',
      },
      sales: {
        title: 'Prodejce',
        desc: 'Monitorujte prodeje a osobní cíle',
      },
      manager: {
        title: 'Prodejní manažer',
        desc: 'Spravujte týmový výkon a cíle',
      },
      gm: {
        title: 'Generální manažer',
        desc: 'Přehled celého dealerství',
      },
    },
    pricing: {
      title: 'Vyberte si perfektní plán',
      subtitle:
        'Začněte s naší bezplatnou zkušební verzí pro finanční manažery nebo si vyberte plán, který se škáluje s vaším dealerstvím.',
      finance: 'Finanční manažer',
      dealership: 'Jednotlivé dealerství',
      group: 'Skupiny dealerství',
      freeTime: 'Zdarma na omezenou dobu!',
      getStarted: 'Začít',
      startTrial: 'Začít bezplatnou zkušební verzi',
      popular: 'Nejpopulárnější',
      viewDetails: 'Zobrazit úplné podrobnosti o cenách →',
      tiers: {
        finance: {
          name: 'Finanční manažeři',
          price: 'Zdarma na omezenou dobu!',
          originalPrice: '5 $/měsíc',
          description: 'Sledujte své obchody, produkty, PVR a výplaty!',
        },
        dealership: {
          name: 'Dealerství',
          price: '250 $/měsíc',
          description: 'Pro až 15 uživatelů s plným přístupem k dealerství.',
        },
        group: {
          name: 'Skupiny dealerství',
          price: '500 $/měsíc',
          description: 'Podpora více dealerství pro skupiny dealerství.',
        },
      },
    },
    about: {
      title: 'O nás',
      subtitle: 'Poznáte tým za DAS Board a naši misi transformovat automobilový průmysl',
      founderVision: {
        title: 'Vize zakladatele',
        paragraph1:
          'Jsem Tyler Durden, CEO a zakladatel The DAS Board. S více než 27 lety zkušeností v automobilovém průmyslu jsem viděl, jak se dealerství potýkají s neefektivními systémy a nedostatkem poznatků v reálném čase.',
        paragraph2:
          'Vytvořil jsem The DAS Board, abych poskytl dealerstvím nástroje, které potřebují nejen k přežití, ale k prosperitě v dnešním konkurenčním prostředí. Naše platforma poskytuje poznatky v reálném čase, které pomáhají týmům dosáhnout svých cílů a zvýšit ziskovost.',
        paragraph3:
          'Věřím, že každé dealerství si zaslouží přístup k nejlepším nástrojům a technologiím. Proto jsme vytvořili řešení, které je nejen výkonné, ale také dostupné a snadno použitelné pro týmy všech velikostí.',
      },
      team: {
        title: 'Náš tým',
        members: {
          tyler: {
            name: 'Tyler Durden',
            role: 'CEO & Zakladatel',
            bio: 'S více než 27 lety zkušeností v automobilovém průmyslu přináší Tyler rozsáhlé znalosti z řízení dealerství a operací. Jeho vize pro The DAS Board vychází z hlubokého porozumění výzvám, kterým dealerství čelí každý den.',
          },
          sarah: {
            name: 'Sarah Conner',
            role: 'Ředitelka produktu',
            bio: 'Sarah má více než 25 let zkušeností v dealerstvích a maloobchodu, specializuje se na uživatelský zážitek a produktový design. Vede náš produktový tým při vytváření intuitivních řešení, která skutečně vyhovují potřebám dealerství.',
          },
          claude: {
            name: 'Claude Sonnet',
            role: 'Technický ředitel',
            bio: 'Claude je zkušený softwarový inženýr se specializací na škálovatelné webové aplikace a systémy v reálném čase. Vede náš technický tým při vytváření robustní a spolehlivé platformy, která pohání The DAS Board.',
          },
          annie: {
            name: 'Annie Porter',
            role: 'Ředitelka zákaznického úspěchu',
            bio: 'Annie se specializuje na zajištění úspěchu našich klientů s The DAS Board. Její přístup zaměřený na zákazníka zajišťuje, že každé dealerství dostane personalizovanou podporu potřebnou k maximalizaci své investice.',
          },
        },
      },
      values: {
        title: 'Naše hodnoty',
        customerFocused: {
          title: 'Zaměření na zákazníka',
          description:
            'Zmocňujeme automobilová dealerství intuitivními dashboardy, které upřednostňují jejich jedinečné potřeby, zajišťují bezproblémové řízení a zlepšují zákaznické zkušenosti.',
        },
        dataDriven: {
          title: 'Řízení daty',
          description:
            'Naše platforma poskytuje poznatky z dat dealerství v reálném čase a umožňuje přesné rozhodování pro zvýšení prodeje a provozní efektivity.',
        },
        continuousImprovement: {
          title: 'Neustálé zlepšování',
          description:
            'Neúnavně zdokonalujeme naše nástroje, abychom pomohli dealerstvím optimalizovat výkon, přizpůsobit se trendům v průmyslu a dosáhnout trvalého růstu.',
        },
      },
      contact: {
        title: 'Kontaktujte nás',
        subtitle: 'Máte otázky? Rádi vám pomůžeme.',
        email: 'E-mail',
        phone: 'Telefon',
      },
    },
    signup: {
      title: 'Vytvořit účet',
      subtitle: 'Začněte dnes s vaším řešením pro řízení dealerství.',
      selectLanguage: 'Vyberte svůj jazyk',
      dealerGroup: 'Registrace skupiny dealerů',
      dealership: 'Registrace dealerství',
      financeManager: 'Registrace finančního manažera',
      form: {
        firstName: 'Jméno',
        lastName: 'Příjmení',
        email: 'E-mailová adresa',
        password: 'Heslo',
        confirmPassword: 'Potvrdit heslo',
        dealershipName: 'Název dealerství',
        role: 'Vaše role',
        phone: 'Telefonní číslo',
        submit: 'Vytvořit účet',
        alreadyHave: 'Již máte účet?',
        signIn: 'Přihlásit se',
        terms: 'Souhlasím s podmínkami služby a zásadami ochrany osobních údajů',
        language: 'Preferovaný jazyk',
        languageNote: 'Toto bude váš výchozí jazyk pro dashboard',
      },
    },
    common: {
      language: 'Jazyk',
      login: 'Přihlášení',
      signUp: 'Registrace',
      loading: 'Načítání...',
      save: 'Uložit',
      cancel: 'Zrušit',
      continue: 'Pokračovat',
      back: 'Zpět',
      next: 'Další',
      submit: 'Odeslat',
      close: 'Zavřít',
    },
    footer: {
      tagline: 'Zmocněte své dealerství poznatky v reálném čase',
      industry: 'Navrženo pro automobilový průmysl',
      product: 'Produkt',
      legal: 'Právní',
      contact: 'Kontakt',
      support: 'W przypadku wsparcia lub zapytań skontaktuj się z nami pod adresem:',
      copyright: '© 2025 The DAS Board. Wszystkie prawa zastrzeżone. Zaprojektowane z 🖤',
      terms: 'Warunki świadczenia usług',
      privacy: 'Polityka prywatności',
      subscription: 'Umowa subskrypcji',
      home: 'Domů',
      screenshots: 'Snímky obrazovky',
      pricing: 'Ceny',
      aboutUs: 'O nás',
    },
    currency: {
      symbol: 'Kč',
      name: 'CZK',
    },
    dashboard: {
      singleFinance: {
        title: 'Dashboard jednoduchého finančního manažera',
        homeTitle: 'Jednoduchý finanční manažer',
        promo: {
          title: 'Speciální akce je aktivní!',
          description: 'Vaše předplatné Finance Manager je momentálně',
          free: 'ZDARMA',
          limited: 'po omezenou dobu',
        },
        trends: {
          up12: '+12% od minulého měsíce',
          down8: '-8% od minulého měsíce',
          up3: '+3% od minulého měsíce',
          upPoint2: '+0,2 od minulého měsíce',
          downPoint3: '-0,3 od minulého měsíce',
          up125: '+125 Kč od minulého měsíce',
          down89: '-89 Kč od minulého měsíce',
        },
        kpi: {
          fiGross: 'F&I hrubý zisk',
          dealsProcessed: 'Zpracované obchody',
          dealTypes: 'Typy obchodů',
          productsPerDeal: 'Produkty na obchod',
          pvr: 'PVR',
          pvrFull: 'PVR (za prodané vozidlo)',
        },
        periods: {
          thisMonth: 'Tento měsíc',
          lastMonth: 'Minulý měsíc',
          lastQuarter: 'Minulé čtvrtletí',
          ytd: 'Od začátku roku',
          lastYear: 'Minulý rok',
        },
        dealTypes: {
          finance: 'Financování',
          cash: 'Hotovost',
          lease: 'Leasing',
        },
        settings: {
          title: 'Nastavení',
          backToDashboard: 'Zpět na dashboard',
          teamManagement: 'Správa týmu',
          payConfiguration: 'Konfigurace platů',
          languageSettings: 'Nastavení jazyka',
          teamMembers: 'Členové týmu',
          addNewMember: 'Přidat nového člena týmu',
          firstName: 'Jméno',
          lastName: 'Příjmení',
          role: 'Role',
          addMember: 'Přidat člena',
          noMembers:
            'Zatím nebyly přidáni žádní členové týmu. Přidejte svého prvního člena týmu výše.',
          salespeople: 'Obchodníci',
          salesManagers: 'Manažeři prodeje',
          active: 'Aktivní',
          inactive: 'Neaktivní',
          remove: 'Odstranit',
          commissionBasePay: 'Provize a základní mzda',
          commissionRate: 'Sazba provize (%)',
          commissionRateDescription: 'Procento z hrubého zisku back-endu',
          baseRate: 'Základní měsíční sazba ($)',
          baseRateDescription: 'Fixní měsíční základní mzda',
          bonusThresholds: 'Produktové bonusy',
          vscBonus: 'VSC bonus ($)',
          gapBonus: 'GAP bonus ($)',
          ppmBonus: 'PPM bonus ($)',
          totalThreshold: 'Měsíční práh ($)',
          totalThresholdDescription: 'Měsíční hrubý práh pro plné bonusy',
          saveConfiguration: 'Uložit konfiguraci',
          currentLanguage: 'Aktuální jazyk',
          changeLanguage: 'Změnit jazyk',
          selectLanguage: 'Vybrat jazyk',
          languageUpdated: 'Jazyk byl úspěšně aktualizován',
          firstNamePlaceholder: 'Jméno',
          lastNamePlaceholder: 'Příjmení',
          confirmRemove: 'Opravdu chcete odstranit {firstName} {lastName} z týmu?',
          memberAdded: '{firstName} {lastName} přidán do týmu',
          memberRemoved: 'Člen týmu odstraněn',
          note: {
            title: 'Poznámka',
            description:
              'Tato nastavení jsou specifická pro váš dashboard jednoduchého finančního manažera a budou použita pro logování obchodů a výpočty platů.',
          },
          roles: {
            salesperson: 'Obchodník',
            salesManager: 'Manažer prodeje',
          },
        },
        dealLog: {
          title: 'Protokol nového obchodu',
          editDeal: 'Upravit obchod - Dashboard jednoduchého finančního manažera',
          backToDashboard: 'Zpět na dashboard',
          note: 'Poznámka',
          editingNote:
            'Upravujete existující obchod. Změny se okamžitě zobrazí na vašem dashboardu.',
          dashboardNote:
            'Tento obchod se zobrazí pouze na vašem dashboardu jednoduchého finančního manažera a neovlivní ostatní dashboardy v systému.',
          dealInformation: 'Informace o obchodu',
          dealNumber: 'Číslo obchodu',
          stockNumber: 'Skladové číslo',
          vinLast8: 'Posledních 8 znaků VIN',
          vehicleType: 'Typ vozidla',
          manufacturer: 'Výrobce',
          customerName: 'Jméno zákazníka',
          dealType: 'Typ obchodu',
          status: 'Status',
          saleDate: 'Datum prodeje',
          frontEndGross: 'Frontend hrubý zisk',
          salesperson: 'Obchodník',
          salesManager: 'Manažer prodeje',
          lender: 'Věřitel',
          reserveFlat: 'Reserve Flat',
        },
        productMix: {
          title: 'Produktový mix a výkon',
          product: 'Produkt',
          avgProfit: 'Průměrný zisk',
          penetration: 'Penetrace',
          extendedWarranty: 'Rozšířená záruka',
          gapInsurance: 'GAP pojištění',
          paintProtection: 'Ochrana laku',
          tireWheel: 'Pneumatiky a kola',
          ppm: 'PPM',
          theft: 'Ochrana proti krádeži',
          bundled: 'Balíček',
          other: 'Ostatní',
          ppd: 'PPD',
        },
        payCalculator: {
          title: 'Měsíční odhad platby',
          hideAmounts: 'Skrýt částky plateb',
          showAmounts: 'Zobrazit částky plateb',
          grossProfit: 'Hrubý zisk',
          payPlan: 'Platební plán',
          estimatedPay: 'Odhadovaná měsíční platba',
          baseAmount: 'Základní platba',
          commission: 'Provize ({rate}%)',
          bonuses: 'Produktové bonusy',
          bonusAmount: 'Částka bonusu',
          totalPay: 'Celková platba',
          bonusBreakdown: 'Rozpis bonusů',
          vscDeals: 'VSC obchody',
          gapDeals: 'GAP obchody',
          ppmDeals: 'PPM obchody',
          disclaimer: {
            title: 'Disclaimer',
            text: 'Tato kalkulačka slouží pouze pro informační účely. Skutečná platba se může lišit na základě finálního účetnictví, kontroly managementu a firemních pravidel. Nakonfigurujte nastavení plateb na stránce Nastavení.',
          },
        },
        dealsLog: {
          title: 'Protokol nedávných obchodů',
          refresh: 'Obnovit',
          viewAll: 'Zobrazit všechny',
          number: '#',
          lastName: 'Příjmení',
          date: 'Datum',
          gross: 'Hrubý zisk',
          products: 'Produkty',
          status: 'Status',
        },
        deals: {
          title: 'Správce financí - Obchody',
          recentDeals: 'Nedávné obchody',
          viewAll: 'Zobrazit všechny',
          addNew: 'Zaznamenat nový obchod',
          noDealsYet: 'Zatím nebyly zaznamenány žádné obchody.',
          refreshTooltip: 'Obnovit obchody',
          backToDashboard: 'Zpět na dashboard',
          note: 'Tyto obchody jsou specifické pro váš dashboard jednoduchého finančního manažera a jsou uloženy odděleně od hlavních finančních obchodů.',
          searchPlaceholder: 'Hledat obchody podle zákazníka, vozidla, čísla obchodu nebo VIN',
          allStatuses: 'Všechny statusy',
          tableHeaders: {
            number: '#',
            lastName: 'Příjmení',
            dealNumber: 'Č. obchodu',
            stockNumber: 'Skladové č.',
            date: 'Datum',
            vin: 'VIN',
            vehicleType: 'N/O/CPO',
            lender: 'Věřitel',
            frontEnd: 'Frontend',
            vsc: 'VSC',
            ppm: 'PPM',
            gap: 'GAP',
            tireWheel: 'P&K',
            appearance: 'Vzhled',
            theft: 'Krádež',
            bundled: 'Balíček',
            ppd: 'PPD',
            pvr: 'PVR',
            total: 'Celkem',
            status: 'Status',
            edit: 'Upravit',
            delete: 'Smazat',
            totals: 'CELKEM',
          },
          vehicleTypes: {
            new: 'N',
            used: 'O',
            cpo: 'C',
          },
          statusOptions: {
            pending: 'Čekající',
            funded: 'Financováno',
            held: 'Pozastaveno',
            unwound: 'Zrušeno',
          },
          actions: {
            edit: 'Upravit',
          },
        },
        timePeriod: {
          thisMonth: 'Tento měsíc',
          lastMonth: 'Minulý měsíc',
          lastQuarter: 'Minulé čtvrtletí',
          ytd: 'Letošní rok',
          lastYear: 'Minulý rok',
          custom: 'Vlastní',
        },
        status: {
          pending: 'Čekající',
          funded: 'Financováno',
          unwound: 'Zrušeno',
          deadDeal: 'Mrtvý obchod',
        },
      },
    },
    legal: {
      terms: {
        title: 'Podmínky služby',
        lastUpdated: 'Poslední aktualizace: 6/28/2025',
        intro:
          'Vítejte v The DAS Board. Tyto Podmínky služby ("Podmínky") upravují váš přístup k naší platformě softwaru pro správu autosalonů a její používání. Přístupem nebo používáním našich služeb souhlasíte s tím, že budete vázáni těmito Podmínkami.',
        sections: {
          acceptance: {
            title: '1. Přijetí podmínek',
            content:
              'Vytvořením účtu, přístupem nebo používáním The DAS Board potvrzujete, že jste si přečetli, porozuměli a souhlasíte s tím, že budete vázáni těmito Podmínkami a našimi Zásadami ochrany osobních údajů. Pokud s těmito Podmínkami nesouhlasíte, nesmíte naše služby používat. Musíte být nejméně 18 let a mít oprávnění uzavřít tyto Podmínky jménem vaší organizace.',
          },
          service: {
            title: '2. Popis služby',
            content:
              'The DAS Board je cloudová platforma softwaru pro správu autosalonů, která poskytuje nástroje pro správu zásob, sledování prodeje, správu vztahů se zákazníky, finanční hlášení a související služby v automobilovém průmyslu. Vyhrazujeme si právo upravit, pozastavit nebo ukončit jakýkoli aspekt naší služby s přiměřeným oznámením.',
          },
          account: {
            title: '3. Registrace účtu a bezpečnost',
            content:
              'Pro používání našich služeb musíte vytvořit účet s přesnými a úplnými informacemi. Jste zodpovědní za:',
            items: [
              'Zachování důvěrnosti přihlašovacích údajů vašeho účtu',
              'Všechny aktivity, které se odehrávají pod vaším účtem',
              'Okamžité oznámení jakéhokoli neoprávněného použití',
              'Zajištění, aby informace o vašem účtu zůstaly aktuální a přesné',
              'Dodržování našich bezpečnostních požadavků a osvědčených postupů',
            ],
          },
          subscription: {
            title: '4. Podmínky předplatného a platby',
            content:
              'The DAS Board funguje na základě předplatného. Přihlášením k odběru souhlasíte s:',
            items: [
              'Zaplacením všech poplatků spojených s vaším plánem předplatného',
              'Automatickým obnovením, pokud nebude zrušeno před datem obnovení',
              'Změnami poplatků s 30denním předchozím oznámením',
              'Žádnými vrácenými penězi za částečná období předplatného',
              'Pozastavením služby za neplacení po přiměřeném oznámení',
            ],
          },
          usage: {
            title: '5. Zásady přijatelného používání',
            content:
              'Souhlasíte s používáním The DAS Board pouze pro zákonné účely a v souladu s těmito Podmínkami. Nesmíte:',
            items: [
              'Porušovat platné zákony, předpisy nebo práva třetích stran',
              'Nahrávat škodlivý, urážlivý nebo nevhodný obsah',
              'Pokoušet se získat neoprávněný přístup k našim systémům nebo účtům jiných uživatelů',
              'Používat službu k odesílání spamu, malwaru nebo jiného škodlivého obsahu',
              'Provádět reverzní inženýrství, dekompilovat nebo se pokoušet extrahovat zdrojový kód',
              'Narušovat nebo rušit integritu nebo výkon našich služeb',
              'Používat platformu pro podvodné nebo nezákonné aktivity',
            ],
          },
          intellectual: {
            title: '6. Práva duševního vlastnictví',
            content:
              'The DAS Board a všechny související technologie, obsah a materiály jsou vlastnictvím naším nebo našich poskytovatelů licencí. To zahrnuje:',
            items: [
              'Software, algoritmy a uživatelská rozhraní',
              'Ochranné známky, loga a brandové materiály',
              'Dokumentaci, návody a podpůrné materiály',
              'Analýzy, zprávy a agregované datové poznatky',
            ],
            footer:
              'Zachováváte si vlastnictví svých dat, ale udělujete nám licenci k jejich použití pro poskytování našich služeb. Můžeme používat anonymizovaná, agregovaná data pro průmyslový výzkum a zlepšování platformy.',
          },
          privacy: {
            title: '7. Ochrana údajů a soukromí',
            content:
              'Jste zodpovědní za to, aby všechny osobní údaje, které zpracováváte prostřednictvím naší platformy, byly v souladu s platnými zákony o ochraně soukromí. Budeme zpracovávat údaje v souladu s našimi Zásadami ochrany osobních údajů a platnými předpisy o ochraně údajů, včetně GDPR a CCPA, kde je to možné.',
          },
          availability: {
            title: '8. Dostupnost služby a podpora',
            content:
              'Ačkoli se snažíme o vysokou dostupnost, nezaručujeme nepřerušovanou službu. Poskytujeme:',
            items: [
              '99,9% SLA provozu pro placená předplatná',
              'Pravidelná okna údržby s předchozím oznámením',
              'Technickou podporu založenou na vaší úrovni předplatného',
              'Bezpečnostní monitorování a reakci na incidenty',
            ],
          },
          termination: {
            title: '9. Ukončení',
            content: 'Kterákoli strana může tyto Podmínky ukončit:',
            items: [
              'Můžete kdykoli zrušit své předplatné prostřednictvím nastavení účtu',
              'Můžeme ukončit za porušení těchto Podmínek s přiměřeným oznámením',
              'Můžeme okamžitě pozastavit službu při závažných porušeních nebo bezpečnostních hrozbách',
              'Po ukončení ztratíte přístup k platformě a svým datům',
              'Poskytneme přiměřenou příležitost k exportu vašich dat před smazáním',
            ],
          },
          disclaimers: {
            title: '10. Vyloučení odpovědnosti a omezení odpovědnosti',
            content:
              'THE DAS BOARD JE POSKYTOVÁNO "TAK, JAK JE" BEZ JAKÝCHKOLI ZÁRUK. V MAXIMÁLNÍM ROZSAHU POVOLENÉM ZÁKONEM:',
            items: [
              'Vylučujeme všechny záruky, výslovné nebo předpokládané, včetně obchodovatelnosti a vhodnosti pro konkrétní účel',
              'Neneseme odpovědnost za nepřímé, náhodné, zvláštní nebo následné škody',
              'Naše celková odpovědnost nepřekročí poplatky, které jste zaplatili za 12 měsíců předcházejících nároku',
              'Uznáváte, že software může obsahovat chyby a souhlasíte s jejich rychlým nahlášením',
            ],
          },
          indemnification: {
            title: '11. Odškodnění',
            content:
              'Souhlasíte s tím, že nás odškodníte a zbavíte odpovědnosti za jakékoli nároky, ztráty nebo škody vyplývající z vašeho používání našich služeb, porušení těchto Podmínek nebo porušení práv třetích stran.',
          },
          governing: {
            title: '12. Rozhodné právo a řešení sporů',
            content:
              'Tyto Podmínky se řídí zákony [Jurisdikce] bez ohledu na principy kolize zákonů. Všechny spory budou řešeny prostřednictvím závazného rozhodčího řízení, s výjimkou nároků na předběžné opatření, které mohou být podány u příslušných soudů.',
          },
          changes: {
            title: '13. Změny podmínek',
            content:
              'Můžeme tyto Podmínky čas od času upravit. Poskytneme oznámení o podstatných změnách nejméně 30 dní předem. Pokračování v používání našich služeb po vstoupení změn v platnost představuje přijetí revidovaných Podmínek.',
          },
          entire: {
            title: '14. Celá smlouva',
            content:
              'Tyto Podmínky spolu s našimi Zásadami ochrany osobních údajů a jakýmikoli dodatečnými dohodami tvoří celou smlouvu mezi vámi a The DAS Board týkající se vašeho používání našich služeb.',
          },
          contact: {
            title: '15. Kontaktní informace',
            content: 'Pokud máte otázky o těchto Podmínkách, kontaktujte nás prosím:',
            email: 'legal@thedasboard.com',
            address: '[Adresa společnosti]',
            phone: '[Telefonní číslo podpory]',
          },
        },
      },
      privacy: {
        title: 'Zásady ochrany osobních údajů',
        lastUpdated: 'Poslední aktualizace: 28.6.2025',
        intro:
          'Tyto Zásady ochrany osobních údajů popisují, jak The DAS Board („my", „nás" nebo „naše") shromažďuje, používá a chrání vaše osobní údaje při používání naší softwarové platformy pro správu autosalonů. Zavazujeme se chránit vaše soukromí a zacházet s vašimi daty odpovědně.',
        sections: {
          collection: {
            title: '1. Informace, které shromažďujeme',
            content:
              'Při používání The DAS Board shromažďujeme několik typů informací pro poskytování a zlepšování našich služeb:',
            items: [
              '<strong>Informace o účtu:</strong> Jméno, e-mailová adresa, telefonní číslo, název společnosti, pracovní pozice a fakturační údaje',
              '<strong>Data autosalonu:</strong> Inventář vozidel, záznamy o prodeji, informace o zákaznících a finanční transakce',
              '<strong>Data o používání:</strong> Přistupované funkce, čas strávený na platformě, interakce uživatelů a metriky výkonu',
              '<strong>Technická data:</strong> IP adresa, typ prohlížeče, informace o zařízení, operační systém a přístupové protokoly',
              '<strong>Komunikační data:</strong> Požadavky na podporu, zpětná vazba a korespondence s naším týmem',
              '<strong>Data o poloze:</strong> Adresy autosalonu a, se souhlasem, poloha zařízení pro mobilní funkce',
            ],
          },
          usage: {
            title: '2. Jak používáme vaše informace',
            content: 'Shromážděné informace používáme pro legitimní obchodní účely, včetně:',
            items: [
              'Poskytování, údržba a zlepšování platformy a funkcí The DAS Board',
              'Zpracování předplatného, plateb a správa vašeho účtu',
              'Generování analýz, reportů a obchodních poznatků pro váš autosalon',
              'Poskytování zákaznické podpory a odpovídání na vaše dotazy',
              'Odesílání aktualizací služeb, bezpečnostních upozornění a administrativních zpráv',
              'Detekce, prevence a řešení technických problémů a bezpečnostních hrozeb',
              'Dodržování právních povinností a průmyslových předpisů',
              'Zlepšování uživatelské zkušenosti prostřednictvím vývoje produktů a výzkumu',
            ],
          },
          sharing: {
            title: '3. Sdílení vašich informací',
            content:
              'Neprodáváme, nepronajímáme ani nevyměňujeme vaše osobní údaje. Vaše informace můžeme sdílet pouze za následujících okolností:',
            items: [
              '<strong>Poskytovatelé služeb:</strong> Třetí strany, které nám pomáhají provozovat naši platformu (hosting, analýzy, zpracování plateb)',
              '<strong>Obchodní partneři:</strong> Autorizované integrace a partneři z automobilového průmyslu s vaším výslovným souhlasem',
              '<strong>Právní požadavky:</strong> Pokud to vyžaduje zákon, předpis nebo platný právní proces',
              '<strong>Obchodní převody:</strong> V souvislosti s fúzemi, akvizicemi nebo prodejem aktiv (s oznámením)',
              '<strong>Bezpečnost a ochrana:</strong> K ochraně práv, majetku nebo bezpečnosti našich uživatelů nebo veřejnosti',
            ],
          },
          retention: {
            title: '4. Uchovávání dat',
            content:
              'Vaše osobní údaje uchováváme tak dlouho, jak je to nezbytné pro poskytování našich služeb a dodržování právních povinností. Konkrétně:',
            items: [
              'Data účtu jsou uchovávána po dobu aktivního předplatného a 3 roky po ukončení',
              'Záznamy transakcí jsou uchovávány 7 let pro dodržování finančních předpisů',
              'Protokoly používání jsou uchovávány 2 roky pro bezpečnostní analýzy a analýzy výkonu',
              'Záznamy komunikace jsou uchovávány 5 let pro účely zákaznického servisu',
            ],
          },
          rights: {
            title: '5. Vaše práva a možnosti',
            content:
              'V závislosti na vaší poloze můžete mít následující práva týkající se vašich osobních údajů:',
            items: [
              '<strong>Přístup:</strong> Požádat o kopii vašich osobních údajů, které uchováváme',
              '<strong>Oprava:</strong> Aktualizovat nebo opravit nepřesné osobní údaje',
              '<strong>Výmaz:</strong> Požádat o vymazání vašich osobních údajů (s výhradou právních povinností)',
              '<strong>Přenositelnost:</strong> Obdržet vaše data ve strojově čitelném formátu',
              '<strong>Omezení:</strong> Omezit způsob zpracování vašich osobních údajů',
              '<strong>Námitka:</strong> Namítat proti zpracování založenému na oprávněných zájmech',
            ],
          },
          cookies: {
            title: '6. Cookies a sledovací technologie',
            content: 'Používáme cookies a podobné technologie pro zlepšení vaší zkušenosti:',
            items: [
              '<strong>Základní cookies:</strong> Vyžadované pro funkčnost a bezpečnost platformy',
              '<strong>Analytické cookies:</strong> Pomáhají nám pochopit, jak používáte naši platformu',
              '<strong>Preferenční cookies:</strong> Pamatují si vaše nastavení a přizpůsobení',
              '<strong>Marketingové cookies:</strong> Používané pro cílenou komunikaci (s vaším souhlasem)',
            ],
            footer:
              'Můžete ovládat preference cookies prostřednictvím nastavení prohlížeče nebo našeho nástroje pro správu cookies.',
          },
          security: {
            title: '7. Bezpečnostní opatření',
            content:
              'Implementujeme průmyslové standardní bezpečnostní opatření k ochraně vašich informací, včetně:',
            items: [
              'Šifrování dat při přenosu a v klidu pomocí standardů AES-256',
              'Pravidelné bezpečnostní audity a penetrační testování',
              'Vícefaktorová autentizace a kontroly přístupu',
              'SOC 2 Type II compliance a pravidelná bezpečnostní hodnocení',
              'Školení zaměstnanců o ochraně dat a osvědčených bezpečnostních postupech',
            ],
          },
          international: {
            title: '8. Mezinárodní přenosy dat',
            content:
              'Vaše informace mohou být přeneseny a zpracovávány v jiných zemích než je vaše vlastní. Zajišťujeme, aby byla zavedena vhodná ochranná opatření, včetně Standardních smluvních doložek a rozhodnutí o přiměřenosti, k ochraně vašich dat během mezinárodních přenosů.',
          },
          children: {
            title: '9. Soukromí dětí',
            content:
              'The DAS Board není určen pro používání osobami mladšími 18 let. Vědomě neshromažďujeme osobní údaje od dětí mladších 18 let. Pokud se o takovém shromažďování dozvíme, informace okamžitě smažeme.',
          },
          changes: {
            title: '10. Změny těchto Zásad ochrany osobních údajů',
            content:
              'Tyto Zásady ochrany osobních údajů můžeme pravidelně aktualizovat, abychom odráželi změny v našich postupech nebo právních požadavcích. O významných změnách vás budeme informovat e-mailem nebo oznámením na platformě nejméně 30 dní před jejich účinností.',
          },
          contact: {
            title: '11. Kontaktujte nás',
            content:
              'Máte-li otázky k těmto Zásadám ochrany osobních údajů nebo si přejete uplatnit svá práva, kontaktujte nás prosím:',
            email: 'privacy@thedasboard.com',
            address: '[Company Address]',
            phone: '[Support Phone Number]',
          },
        },
      },
      subscription: {
        title: 'Dohoda o předplatném',
        lastUpdated: 'Poslední aktualizace: 6/28/2025',
        intro:
          'Tato Dohoda o předplatném upravuje vaše předplatné a používání platformy pro správu autosalonů The DAS Board.',
        sections: {
          plans: {
            title: '1. Plány předplatného',
            content:
              'The DAS Board nabízí úrovně předplatného navržené pro různé potřeby autosalonů:',
            items: [
              '<strong>60denní bezplatná zkušební verze:</strong> Plný přístup k platformě bez nutnosti kreditní karty',
              '<strong>Finanční manažer:</strong> Individuální uživatelský přístup se základními finančními nástroji',
              '<strong>Autosalon:</strong> Přístup pro více uživatelů s kompletní správou inventáře a prodeje',
              '<strong>Skupina autosalonů:</strong> Přístup na podnikové úrovni na více lokalitách',
            ],
            footer:
              'Předplatné se účtuje měsíčně předem. Můžete kdykoliv upgradovat nebo downgradovat své předplatné, změny budou platit od následujícího fakturačního cyklu.',
          },
          payment: {
            title: '2. Platební podmínky',
            content:
              'Platba je splatná při začátku předplatného a stejný den každý měsíc poté. Přijímáme hlavní kreditní karty a ACH převody pro podnikové účty. Pokud platba selže, můžeme pozastavit váš přístup k The DAS Board po přiměřeném upozornění.',
          },
          trial: {
            title: '3. Zkušební období',
            content:
              '60denní zkušební verze poskytuje plný přístup k platformě The DAS Board. Pro začátek zkušební verze není potřeba kreditní karta. Na konci zkušebního období budete muset vybrat placený plán pro pokračování v používání platformy. Data ze zkušební verze budou zachována po dobu 30 dnů po vypršení zkušební verze.',
          },
          cancellation: {
            title: '4. Zrušení a refundace',
            content:
              'Můžete zrušit své předplatné kdykoliv prostřednictvím nastavení účtu nebo kontaktováním našeho týmu podpory. Po zrušení:',
            items: [
              'Zachováte přístup do konce aktuálního fakturačního období',
              'Nebudou poskytnuty refundace za částečné měsíce služby',
              'Vaše data budou k dispozici pro export po dobu 90 dnů po zrušení',
              'Automatické obnovení bude zakázáno',
            ],
          },
          sla: {
            title: '5. Dohoda o úrovni služeb',
            content: 'Pro placená předplatná se zavazujeme k:',
            items: [
              '99,9% dostupnosti platformy',
              'Plánovaná okna údržby s 48hodinovým předchozím upozorněním',
              'Odpověď zákaznické podpory do 24 hodin pro standardní požadavky',
              'Prioritní podpora pro předplatitele Skupiny autosalonů',
            ],
          },
          data: {
            title: '6. Data a bezpečnost',
            content: 'Data vašeho autosalonu zůstávají vaším vlastnictvím. Poskytujeme:',
            items: [
              'Denní automatizované zálohy s 30denním uchováním',
              'Šifrování a bezpečnostní protokoly na úrovni bank',
              'Soulad s GDPR a CCPA pro ochranu dat',
              'Možnosti exportu dat ve standardních formátech',
            ],
          },
          support: {
            title: '7. Podpora a školení',
            content: 'Všechna placená předplatná zahrnují:',
            items: [
              'Komplexní asistenci při nasazení a nastavení',
              'Online školicí materiály a dokumentaci',
              'E-mailovou a chatovou podporu během pracovní doby',
              'Pravidelné aktualizace platformy a vydání nových funkcí',
            ],
          },
          modifications: {
            title: '8. Úpravy služby',
            content:
              'Můžeme upravit nebo aktualizovat platformu The DAS Board za účelem zlepšení funkčnosti, bezpečnosti nebo compliance. Poskytneme přiměřené upozornění na významné změny, které mohou ovlivnit vaše používání.',
          },
        },
      },
      pricingPage: {
        title: 'Vyberte Svou',
        titleHighlight: 'Řešení',
        subtitle:
          'Vyberte možnost, která nejlépe popisuje vaše potřeby. Přizpůsobíme vaši zkušenost odpovídajícím způsobem.',
        singleFinance: {
          title: 'Individuální Finanční Manažer',
          description:
            'Perfektní pro individuální finanční manažery, kteří chtějí sledovat svůj osobní výkon a obchody.',
          originalPrice: '$29.99/měsíc',
          price: '$20/měsíc omezený čas',
          features: [
            'Sledování osobních obchodů',
            'PVR a analýzy zisku z produktů',
            'Kalkulačka plateb',
            'Výkonnostní metriky',
            'Může být daňově odečitatelné',
          ],
          buttonText: 'Začněte Nyní!',
          setupTime: 'Vyzkoušejte bez rizika na celý kalendářní měsíc',
        },
        dealership: {
          title: 'Dealerství / Skupina Dealerství',
          description:
            'Kompletní řízení dealerství s dashboardy specifickými pro role, správou týmu a podporou více lokalit.',
          price: '$250/měsíc základ',
          priceSubtext: 'za prodejnu + doplňky',
          popular: 'Nejpopulárnější',
          features: [
            'Všechny funkce individuálního manažera',
            'Týmové dashboardy pro všechny role',
            'Analýzy více lokalit',
            'Flexibilní administrativní struktury',
            'Dostupné objemové slevy',
          ],
          buttonText: 'Zobrazit Dynamické Ceny Balíčků',
          setupTime: 'Začněte ještě dnes',
        },
        benefits: {
          title: 'Transformujte Své Dealerství Dnes',
          performance: {
            title: 'Zvyšte Výkon',
            description:
              'Poznatky v reálném čase pomáhají týmům překročit cíle a maximalizovat ziskovost',
          },
          operations: {
            title: 'Zefektivněte Operace',
            description: 'Centralizované řízení snižuje administrativní čas a zlepšuje efektivitu',
          },
          security: {
            title: 'Bezpečné a Spolehlivé',
            description: 'Podniková bezpečnost s 99,9% zárukou dostupnosti',
          },
        },
        helpText: {
          title: 'Nejste si jisti, kterou možnost zvolit?',
          description:
            'Začněte s možností individuálního finančního manažera a vyzkoušejte naši platformu, poté snadno přejděte na funkce dealerství, až budete připraveni rozšířit svůj tým.',
        },
        footer: {
          copyright: '© 2025 The DAS Board. Všechna práva vyhrazena.',
          support: 'Otázky? Kontaktujte nás na',
          email: 'support@thedasboard.com',
        },
      },
    },
  } as Translations,
  it: {
    nav: {
      home: 'Home',
      screenshots: 'Screenshot',
      pricing: 'Prezzi',
      about: 'Chi siamo',
      login: 'Accedi',
      signup: 'Registrati',
      legal: 'Legale',
    },
    home: {
      title: 'The DAS Board',
      subtitle:
        'Dashboard in tempo reale con insights critici per manager finanziari, venditori e manager nel settore automobilistico.',
      startTrial: 'Inizia la prova gratuita',
      signupNow: 'Iscriviti Ora!',
      viewScreenshots: 'Visualizza screenshot',
      mission:
        'Dopo 27 anni nel settore automobilistico, ho creato DAS Board per fornire alle concessionarie gli strumenti di cui hanno bisogno per avere successo. La nostra piattaforma fornisce insights in tempo reale che aiutano i team a raggiungere i loro obiettivi e aumentare la redditività.',
      features: {
        title: 'Tutto ciò di cui hai bisogno per avere successo',
        subtitle: 'Una suite completa di strumenti progettati per le concessionarie moderne',
      },
      pricing: {
        title: 'Prova ora',
        subtitle:
          'Inizia con la nostra prova gratuita per i manager finanziari o scegli il piano che si adatta alla tua concessionaria.',
      },
      pricingTiers: {
        singleFinance: {
          name: 'Manager Finanziario Singolo',
          price: '$20/mese tempo limitato',
          originalPrice: '$29.99/mese',
          description:
            'Perfetto per manager finanziari individuali che vogliono tracciare le loro prestazioni personali',
          features: [
            'Tracciamento affari personali',
            'Analisi PVR e profitti prodotti',
            'Calcolatore pagamenti',
            'Metriche delle prestazioni',
            'Può essere deducibile dalle tasse',
          ],
          buttonText: 'Inizia Ora!',
          setupTime: 'Prova senza rischi per un mese di calendario completo',
        },
        dealership: {
          name: 'Concessionaria / Gruppo Concessionari',
          price: '$250/mo base',
          description:
            'Gestione completa della concessionaria con dashboard specifici per ruolo e gestione del team',
          popular: 'Più Popolare',
          features: [
            'Tutte le funzionalità del manager singolo',
            'Dashboard di team per tutti i ruoli',
            'Analisi multi-sede',
            'Strutture amministrative flessibili',
          ],
          buttonText: 'Configura Il Tuo Pacchetto',
          setupTime: 'Inizia oggi stesso',
        },
        priceSubtext: 'per concessionaria + componenti aggiuntivi',
      },
      cta: {
        title: 'Pronto per iniziare?',
        subtitle:
          'Unisciti a centinaia di concessionarie che già utilizzano DAS Board per ottimizzare le loro operazioni.',
      },
    },
    features: {
      finance: {
        title: 'Dashboard finanziaria',
        desc: 'Monitora PVR, VSC e profitto lordo totale in tempo reale con grafici e metriche intuitive.',
      },
      sales: {
        title: 'Dashboard vendite',
        desc: 'Monitora performance di vendita, obiettivi e classifiche con insights dettagliati per ogni membro del team.',
      },
      manager: {
        title: 'Dashboard manager',
        desc: 'Ottieni una panoramica completa della concessionaria con report completi e analisi delle performance.',
      },
      info: {
        title: 'Tracciamento informazioni',
        desc: 'Gestisci e monitora tutte le informazioni importanti della concessionaria in un unico posto.',
      },
      scheduler: {
        title: 'Pianificatore',
        desc: 'Organizza programmi e obiettivi del team con strumenti di pianificazione avanzati.',
      },
      calculator: {
        title: 'Calcolatore pagamenti',
        desc: 'Calcola commissioni e pagamenti in tempo reale con metriche precise.',
      },
    },
    screenshots: {
      title: 'Guarda le nostre dashboard',
      subtitle:
        'Esplora le potenti funzionalità progettate per ogni ruolo nella tua concessionaria',
      finance: {
        title: 'Manager finanziario',
        desc: 'Monitora PVR, VSC e metriche di performance',
      },
      sales: {
        title: 'Venditore',
        desc: 'Monitora vendite e obiettivi personali',
      },
      manager: {
        title: 'Manager vendite',
        desc: 'Gestisci performance e obiettivi del team',
      },
      gm: {
        title: 'Direttore generale',
        desc: 'Panoramica completa della concessionaria',
      },
    },
    pricing: {
      title: 'Scegli il piano perfetto',
      subtitle:
        'Inizia con la nostra prova gratuita per i manager finanziari o scegli il piano che si adatta alla tua concessionaria.',
      finance: 'Manager finanziario',
      dealership: 'Concessionaria singola',
      group: 'Gruppi di concessionarie',
      freeTime: 'Gratuito per tempo limitato!',
      getStarted: 'Inizia',
      startTrial: 'Inizia la prova gratuita',
      popular: 'Più popolare',
      viewDetails: 'Visualizza dettagli completi dei prezzi →',
      tiers: {
        finance: {
          name: 'Manager finanziari',
          price: 'Gratuito per tempo limitato!',
          originalPrice: '$5/mese',
          description: 'Monitora le tue operazioni, prodotti, PVR e pagamenti!',
        },
        dealership: {
          name: 'Concessionarie',
          price: '$250/mese',
          description: 'Per fino a 15 utenti con accesso completo alla concessionaria.',
        },
        group: {
          name: 'Gruppi di concessionarie',
          price: '$500/mese',
          description: 'Supporto multi-concessionaria per gruppi di concessionarie.',
        },
      },
    },
    about: {
      title: 'Chi siamo',
      subtitle:
        'Conosci il team dietro DAS Board e la nostra missione di trasformare il settore automobilistico',
      founderVision: {
        title: 'Visione del fondatore',
        paragraph1:
          'Sono Tyler Durden, CEO e fondatore di The DAS Board. Con oltre 27 anni di esperienza nel settore automobilistico, ho visto le concessionarie lottare con sistemi inefficienti e mancanza di insights in tempo reale.',
        paragraph2:
          "Ho creato The DAS Board per fornire alle concessionarie gli strumenti di cui hanno bisogno non solo per sopravvivere, ma per prosperare nell'ambiente competitivo di oggi. La nostra piattaforma fornisce insights in tempo reale che aiutano i team a raggiungere i loro obiettivi e aumentare la redditività.",
        paragraph3:
          "Credo che ogni concessionaria meriti l'accesso ai migliori strumenti e tecnologie. Ecco perché abbiamo creato una soluzione che non è solo potente, ma anche accessibile e facile da usare per team di tutte le dimensioni.",
      },
      team: {
        title: 'Il nostro team',
        members: {
          tyler: {
            name: 'Tyler Durden',
            role: 'CEO & Fondatore',
            bio: 'Con oltre 27 anni di esperienza nel settore automobilistico, Tyler porta una vasta conoscenza della gestione e delle operazioni delle concessionarie. La sua visione per The DAS Board nasce da una profonda comprensione delle sfide che le concessionarie affrontano ogni giorno.',
          },
          sarah: {
            name: 'Sarah Conner',
            role: 'Direttore prodotto',
            bio: 'Sarah ha oltre 25 anni di esperienza nelle concessionarie e nel retail, specializzandosi in user experience e product design. Guida il nostro team di prodotto nella creazione di soluzioni intuitive che soddisfano veramente le esigenze delle concessionarie.',
          },
          claude: {
            name: 'Claude Sonnet',
            role: 'Direttore tecnico',
            bio: 'Claude è un ingegnere software esperto specializzato in applicazioni web scalabili e sistemi in tempo reale. Guida il nostro team tecnico nella costruzione della piattaforma robusta e affidabile che alimenta The DAS Board.',
          },
          annie: {
            name: 'Annie Porter',
            role: 'Direttore successo clienti',
            bio: 'Annie si specializza nel garantire il successo dei nostri clienti con The DAS Board. Il suo approccio centrato sul cliente assicura che ogni concessionaria riceva il supporto personalizzato necessario per massimizzare il proprio investimento.',
          },
        },
      },
      values: {
        title: 'I nostri valori',
        customerFocused: {
          title: 'Centrati sul cliente',
          description:
            'Potenziamo le concessionarie automobilistiche con dashboard intuitive che danno priorità alle loro esigenze uniche, garantendo una gestione senza problemi e esperienze clienti migliorate.',
        },
        dataDriven: {
          title: 'Guidati dai dati',
          description:
            "La nostra piattaforma fornisce insights azionabili in tempo reale dai dati delle concessionarie, consentendo decisioni precise per aumentare le vendite e l'efficacità operativa.",
        },
        continuousImprovement: {
          title: 'Miglioramento continuo',
          description:
            'Raffiniamo instancabilmente i nostri strumenti per aiutare le concessionarie a ottimizzare le performance, adattarsi alle tendenze del settore e raggiungere una crescita sostenuta.',
        },
      },
      contact: {
        title: 'Contattaci',
        subtitle: 'Hai domande? Siamo qui per aiutarti.',
        email: 'Email',
        phone: 'Telefono',
      },
    },
    signup: {
      title: 'Crea account',
      subtitle: 'Inizia oggi con la tua soluzione di gestione concessionaria.',
      selectLanguage: 'Seleziona la tua lingua',
      dealerGroup: 'Registrazione gruppo concessionarie',
      dealership: 'Registrazione concessionaria',
      financeManager: 'Registrazione manager finanziario',
      form: {
        firstName: 'Nome',
        lastName: 'Cognome',
        email: 'Indirizzo email',
        password: 'Password',
        confirmPassword: 'Conferma password',
        dealershipName: 'Nome concessionaria',
        role: 'Il tuo ruolo',
        phone: 'Numero di telefono',
        submit: 'Crea account',
        alreadyHave: 'Hai già un account?',
        signIn: 'Accedi',
        terms: 'Accetto i termini di servizio e la politica sulla privacy',
      },
    },
    common: {
      language: 'Lingua',
      login: 'Accedi',
      signUp: 'Registrati',
      loading: 'Caricamento...',
      save: 'Salva',
      cancel: 'Annulla',
      continue: 'Continua',
      back: 'Indietro',
      next: 'Avanti',
      submit: 'Invia',
      close: 'Chiudi',
    },
    footer: {
      tagline: 'Potenzia la tua concessionaria con insights in tempo reale',
      industry: 'Progettato per il settore automobilistico',
      product: 'Prodotto',
      legal: 'Legale',
      contact: 'Contatto',
      support: 'Per supporto o richieste contattaci a:',
      copyright: '© 2025 The DAS Board. Tutti i diritti riservati. Progettato con 🖤',
      terms: 'Termini di servizio',
      privacy: 'Politica sulla privacy',
      subscription: 'Accordo di abbonamento',
      home: 'Home',
      screenshots: 'Screenshot',
      pricing: 'Prezzi',
      aboutUs: 'Chi siamo',
    },
    currency: {
      symbol: '€',
      name: 'EUR',
    },
    legal: {
      terms: {
        title: 'Termini di servizio',
        lastUpdated: 'Ultimo aggiornamento: 6/28/2025',
        intro:
          'Benvenuti in The DAS Board. Questi Termini di Servizio ("Termini") disciplinano il vostro accesso e utilizzo della nostra piattaforma software di gestione concessionarie. Accedendo o utilizzando i nostri servizi, accettate di essere vincolati da questi Termini.',
        sections: {
          acceptance: {
            title: '1. Accettazione dei Termini',
            content:
              "Creando un account, accedendo o utilizzando The DAS Board, riconoscete di aver letto, compreso e accettato di essere vincolati da questi Termini e dalla nostra Informativa sulla Privacy. Se non accettate questi Termini, non potete utilizzare i nostri servizi. Dovete avere almeno 18 anni e avere l'autorità di stipulare questi Termini per conto della vostra organizzazione.",
          },
          service: {
            title: '2. Descrizione del Servizio',
            content:
              "The DAS Board è una piattaforma software di gestione concessionarie basata su cloud che fornisce strumenti per la gestione dell'inventario, il tracciamento delle vendite, la gestione delle relazioni con i clienti, i report finanziari e i servizi correlati dell'industria automobilistica. Ci riserviamo il diritto di modificare, sospendere o interrompere qualsiasi aspetto del nostro servizio con ragionevole preavviso.",
          },
          account: {
            title: '3. Registrazione Account e Sicurezza',
            content:
              'Per utilizzare i nostri servizi, dovete creare un account con informazioni accurate e complete. Siete responsabili di:',
            items: [
              'Mantenere la riservatezza delle credenziali del vostro account',
              'Tutte le attività che si verificano sotto il vostro account',
              'Notificarci immediatamente di qualsiasi uso non autorizzato',
              'Assicurarvi che le informazioni del vostro account rimangano aggiornate e accurate',
              'Rispettare i nostri requisiti di sicurezza e le migliori pratiche',
            ],
          },
          subscription: {
            title: '4. Termini di Abbonamento e Pagamento',
            content: 'The DAS Board opera su base abbonamento. Sottoscrivendo, accettate di:',
            items: [
              'Pagare tutte le tariffe associate al vostro piano di abbonamento',
              'Rinnovo automatico a meno che non sia cancellato prima della data di rinnovo',
              'Modifiche delle tariffe con 30 giorni di preavviso',
              'Nessun rimborso per periodi di abbonamento parziali',
              'Sospensione del servizio per mancato pagamento dopo ragionevole preavviso',
            ],
          },
          usage: {
            title: '5. Politica di Uso Accettabile',
            content:
              'Accettate di utilizzare The DAS Board solo per scopi legali e in conformità con questi Termini. Non potete:',
            items: [
              'Violare leggi applicabili, regolamenti o diritti di terzi',
              'Caricare contenuti dannosi, offensivi o inappropriati',
              'Tentare di ottenere accesso non autorizzato ai nostri sistemi o agli account di altri utenti',
              'Utilizzare il servizio per inviare spam, malware o altri contenuti malevoli',
              'Fare reverse engineering, decompilare o tentare di estrarre codice sorgente',
              "Interferire o interrompere l'integrità o le prestazioni dei nostri servizi",
              'Utilizzare la piattaforma per attività fraudolente o illegali',
            ],
          },
          intellectual: {
            title: '6. Diritti di Proprietà Intellettuale',
            content:
              'The DAS Board e tutte le tecnologie, contenuti e materiali correlati sono di proprietà nostra o dei nostri licenzianti. Questo include:',
            items: [
              'Software, algoritmi e interfacce utente',
              'Marchi, loghi e materiali di branding',
              'Documentazione, tutorial e materiali di supporto',
              'Analisi, report e approfondimenti su dati aggregati',
            ],
            footer:
              'Mantenete la proprietà dei vostri dati ma ci concedete una licenza per utilizzarli per fornire i nostri servizi. Potremmo utilizzare dati anonimizzati e aggregati per ricerca industriale e miglioramento della piattaforma.',
          },
          privacy: {
            title: '7. Protezione dei Dati e Privacy',
            content:
              'Siete responsabili di assicurarvi che tutti i dati personali che elaborate attraverso la nostra piattaforma siano conformi alle leggi sulla privacy applicabili. Elaboreremo i dati in conformità con la nostra Informativa sulla Privacy e i regolamenti applicabili sulla protezione dei dati, inclusi GDPR e CCPA dove applicabile.',
          },
          availability: {
            title: '8. Disponibilità del Servizio e Supporto',
            content:
              "Sebbene ci sforziamo per un'alta disponibilità, non garantiamo un servizio ininterrotto. Forniamo:",
            items: [
              '99,9% di SLA uptime per abbonamenti a pagamento',
              'Finestre di manutenzione regolari con preavviso',
              'Supporto tecnico basato sul vostro livello di abbonamento',
              'Monitoraggio della sicurezza e risposta agli incidenti',
            ],
          },
          termination: {
            title: '9. Risoluzione',
            content: 'Entrambe le parti possono risolvere questi Termini:',
            items: [
              'Potete cancellare il vostro abbonamento in qualsiasi momento attraverso le impostazioni del vostro account',
              'Possiamo risolvere per violazione di questi Termini con ragionevole preavviso',
              'Possiamo sospendere il servizio immediatamente per violazioni gravi o minacce alla sicurezza',
              "Alla risoluzione, perderete l'accesso alla piattaforma e ai vostri dati",
              "Forniremo un'opportunità ragionevole per esportare i vostri dati prima della cancellazione",
            ],
          },
          disclaimers: {
            title: '10. Esclusioni di Responsabilità e Limitazioni di Responsabilità',
            content:
              'THE DAS BOARD È FORNITO "COSÌ COM\'È" SENZA GARANZIE DI ALCUN TIPO. NELLA MASSIMA MISURA CONSENTITA DALLA LEGGE:',
            items: [
              'Escludiamo tutte le garanzie, espresse o implicite, incluse commerciabilità e idoneità per uno scopo particolare',
              'Non siamo responsabili per danni indiretti, incidentali, speciali o consequenziali',
              'La nostra responsabilità totale non supererà le tariffe da voi pagate nei 12 mesi precedenti il reclamo',
              'Riconoscete che il software può contenere bug e accettate di segnalarli prontamente',
            ],
          },
          indemnification: {
            title: '11. Indennizzo',
            content:
              'Accettate di indennizzarci e tenerci indenni da qualsiasi reclamo, perdita o danno derivante dal vostro uso dei nostri servizi, violazione di questi Termini o violazione di diritti di terzi.',
          },
          governing: {
            title: '12. Legge Applicabile e Risoluzione delle Controversie',
            content:
              'Questi Termini sono disciplinati dalle leggi di [Giurisdizione] senza riguardo ai principi di conflitto di leggi. Qualsiasi controversia sarà risolta tramite arbitrato vincolante, eccetto per i reclami di rimedio ingiuntivo che possono essere portati nei tribunali appropriati.',
          },
          changes: {
            title: '13. Modifiche ai Termini',
            content:
              "Potremmo modificare questi Termini di tanto in tanto. Forniremo avviso di modifiche materiali almeno 30 giorni in anticipo. L'uso continuato dei nostri servizi dopo l'entrata in vigore delle modifiche costituisce accettazione dei Termini rivisti.",
          },
          entire: {
            title: '14. Accordo Completo',
            content:
              "Questi Termini, insieme alla nostra Informativa sulla Privacy e a qualsiasi accordo aggiuntivo, costituiscono l'accordo completo tra voi e The DAS Board riguardo al vostro uso dei nostri servizi.",
          },
          contact: {
            title: '15. Informazioni di Contatto',
            content: 'Se avete domande su questi Termini, contattateci:',
            email: 'legal@thedasboard.com',
            address: '[Indirizzo Aziendale]',
            phone: '[Numero di Telefono Supporto]',
          },
        },
      },
      privacy: {
        title: 'Politica sulla privacy',
        lastUpdated: 'Ultimo aggiornamento: 28/6/2025',
        intro:
          'Questa Politica sulla privacy descrive come The DAS Board ("noi", "nostro" o "nostra") raccoglie, utilizza e protegge le vostre informazioni personali quando utilizzate la nostra piattaforma software di gestione concessionarie. Ci impegniamo a proteggere la vostra privacy e a gestire i vostri dati in modo responsabile.',
        sections: {
          collection: {
            title: '1. Informazioni che raccogliamo',
            content:
              'Quando utilizzate The DAS Board, raccogliamo diversi tipi di informazioni per fornire e migliorare i nostri servizi:',
            items: [
              "<strong>Informazioni dell'account:</strong> Nome, indirizzo email, numero di telefono, nome dell'azienda, posizione lavorativa e informazioni di fatturazione",
              '<strong>Dati della concessionaria:</strong> Inventario veicoli, registri di vendita, informazioni clienti e transazioni finanziarie',
              '<strong>Dati di utilizzo:</strong> Funzioni accessibili, tempo trascorso sulla piattaforma, interazioni utente e metriche di prestazione',
              '<strong>Dati tecnici:</strong> Indirizzo IP, tipo di browser, informazioni dispositivo, sistema operativo e log di accesso',
              '<strong>Dati di comunicazione:</strong> Richieste di supporto, feedback e corrispondenza con il nostro team',
              '<strong>Dati di localizzazione:</strong> Indirizzi della concessionaria e, con consenso, posizione del dispositivo per funzioni mobile',
            ],
          },
          usage: {
            title: '2. Come utilizziamo le vostre informazioni',
            content:
              'Utilizziamo le informazioni raccolte per scopi commerciali legittimi, inclusi:',
            items: [
              'Fornire, mantenere e migliorare la piattaforma e le funzioni di The DAS Board',
              'Elaborare abbonamenti, pagamenti e gestire il vostro account',
              'Generare analisi, report e insights commerciali per la vostra concessionaria',
              'Fornire supporto clienti e rispondere alle vostre richieste',
              'Inviare aggiornamenti del servizio, avvisi di sicurezza e messaggi amministrativi',
              'Rilevare, prevenire e affrontare problemi tecnici e minacce alla sicurezza',
              'Rispettare obblighi legali e normative del settore',
              "Migliorare l'esperienza utente attraverso sviluppo prodotto e ricerca",
            ],
          },
          sharing: {
            title: '3. Condivisione delle vostre informazioni',
            content:
              'Non vendiamo, affittiamo o scambiamo le vostre informazioni personali. Possiamo condividere le vostre informazioni solo nelle seguenti circostanze:',
            items: [
              '<strong>Fornitori di servizi:</strong> Fornitori terzi che ci aiutano a gestire la nostra piattaforma (hosting, analisi, elaborazione pagamenti)',
              "<strong>Partner commerciali:</strong> Integrazioni autorizzate e partner dell'industria automobilistica con il vostro consenso esplicito",
              '<strong>Requisiti legali:</strong> Quando richiesto da legge, regolamento o procedimento legale valido',
              '<strong>Trasferimenti commerciali:</strong> In connessione con fusioni, acquisizioni o vendite di asset (con preavviso)',
              '<strong>Sicurezza e protezione:</strong> Per proteggere i diritti, la proprietà o la sicurezza dei nostri utenti o del pubblico',
            ],
          },
          retention: {
            title: '4. Conservazione dei dati',
            content:
              'Conserviamo le vostre informazioni personali per il tempo necessario a fornire i nostri servizi e rispettare gli obblighi legali. Specificamente:',
            items: [
              "I dati dell'account sono conservati mentre il vostro abbonamento è attivo e per 3 anni dopo la cessazione",
              'I registri delle transazioni sono conservati per 7 anni per rispettare le normative finanziarie',
              'I log di utilizzo sono conservati per 2 anni per analisi di sicurezza e prestazioni',
              'I registri di comunicazione sono conservati per 5 anni per scopi di servizio clienti',
            ],
          },
          rights: {
            title: '5. I vostri diritti e scelte',
            content:
              'A seconda della vostra posizione, potreste avere i seguenti diritti riguardo alle vostre informazioni personali:',
            items: [
              '<strong>Accesso:</strong> Richiedere una copia delle vostre informazioni personali che deteniamo',
              '<strong>Correzione:</strong> Aggiornare o correggere informazioni personali inesatte',
              '<strong>Cancellazione:</strong> Richiedere la cancellazione delle vostre informazioni personali (soggetto a obblighi legali)',
              '<strong>Portabilità:</strong> Ricevere i vostri dati in un formato leggibile da macchina',
              '<strong>Limitazione:</strong> Limitare come elaboriamo le vostre informazioni personali',
              "<strong>Opposizione:</strong> Opporsi all'elaborazione basata su interessi legittimi",
            ],
          },
          cookies: {
            title: '6. Cookie e tecnologie di tracciamento',
            content: 'Utilizziamo cookie e tecnologie simili per migliorare la vostra esperienza:',
            items: [
              '<strong>Cookie essenziali:</strong> Richiesti per funzionalità e sicurezza della piattaforma',
              '<strong>Cookie analitici:</strong> Ci aiutano a capire come utilizzate la nostra piattaforma',
              '<strong>Cookie di preferenza:</strong> Ricordano le vostre impostazioni e personalizzazioni',
              '<strong>Cookie di marketing:</strong> Utilizzati per comunicazioni mirate (con il vostro consenso)',
            ],
            footer:
              'Potete controllare le preferenze dei cookie attraverso le impostazioni del browser o il nostro strumento di gestione cookie.',
          },
          security: {
            title: '7. Misure di sicurezza',
            content:
              'Implementiamo misure di sicurezza standard del settore per proteggere le vostre informazioni, inclusi:',
            items: [
              'Crittografia dei dati in transito e a riposo utilizzando standard AES-256',
              'Audit di sicurezza regolari e test di penetrazione',
              'Autenticazione multi-fattore e controlli di accesso',
              'Conformità SOC 2 Type II e valutazioni di sicurezza regolari',
              'Formazione dei dipendenti sulla protezione dei dati e best practice di sicurezza',
            ],
          },
          international: {
            title: '8. Trasferimenti internazionali di dati',
            content:
              'Le vostre informazioni possono essere trasferite ed elaborate in paesi diversi dal vostro. Garantiamo che siano implementate salvaguardie appropriate, incluse Clausole Contrattuali Standard e decisioni di adeguatezza, per proteggere i vostri dati durante i trasferimenti internazionali.',
          },
          children: {
            title: '9. Privacy dei minori',
            content:
              "The DAS Board non è destinato all'uso da parte di individui sotto i 18 anni. Non raccogliamo consapevolmente informazioni personali da bambini sotto i 18 anni. Se veniamo a conoscenza di tale raccolta, cancelleremo le informazioni prontamente.",
          },
          changes: {
            title: '10. Modifiche a questa Politica sulla privacy',
            content:
              'Possiamo aggiornare questa Politica sulla privacy periodicamente per riflettere cambiamenti nelle nostre pratiche o requisiti legali. Vi notificheremo dei cambiamenti significativi via email o notifica sulla piattaforma almeno 30 giorni prima che abbiano effetto.',
          },
          contact: {
            title: '11. Contattateci',
            content:
              'Se avete domande su questa Politica sulla privacy o desiderate esercitare i vostri diritti, contattateci:',
            email: 'privacy@thedasboard.com',
            address: '[Company Address]',
            phone: '[Support Phone Number]',
          },
        },
      },
      subscription: {
        title: 'Accordo di abbonamento',
        lastUpdated: 'Ultimo aggiornamento: 6/28/2025',
        intro:
          "Questo Accordo di abbonamento regola la tua iscrizione e l'uso della piattaforma di gestione delle concessionarie The DAS Board.",
        sections: {
          plans: {
            title: '1. Piani di abbonamento',
            content:
              'The DAS Board offre livelli di abbonamento progettati per diverse esigenze delle concessionarie:',
            items: [
              '<strong>Prova gratuita di 60 giorni:</strong> Accesso completo alla piattaforma senza carta di credito richiesta',
              '<strong>Manager finanziario:</strong> Accesso utente individuale con strumenti finanziari principali',
              '<strong>Concessionaria:</strong> Accesso multi-utente con gestione completa di inventario e vendite',
              '<strong>Gruppo concessionari:</strong> Accesso a livello aziendale su più località',
            ],
            footer:
              'Gli abbonamenti vengono fatturati mensilmente in anticipo. Puoi aggiornare o declassare il tuo abbonamento in qualsiasi momento, con modifiche che hanno effetto nel prossimo ciclo di fatturazione.',
          },
          payment: {
            title: '2. Termini di pagamento',
            content:
              "Il pagamento è dovuto all'inizio dell'abbonamento e lo stesso giorno di ogni mese successivo. Accettiamo le principali carte di credito e trasferimenti ACH per account aziendali. Se il pagamento fallisce, potremmo sospendere il tuo accesso a The DAS Board dopo ragionevole preavviso.",
          },
          trial: {
            title: '3. Periodo di prova',
            content:
              'La prova di 60 giorni fornisce accesso completo alla piattaforma The DAS Board. Non è richiesta carta di credito per iniziare la prova. Alla fine del periodo di prova, dovrai selezionare un piano a pagamento per continuare a utilizzare la piattaforma. I dati della prova saranno conservati per 30 giorni dopo la scadenza della prova.',
          },
          cancellation: {
            title: '4. Cancellazione e rimborsi',
            content:
              'Puoi cancellare il tuo abbonamento in qualsiasi momento tramite le impostazioni del tuo account o contattando il nostro team di supporto. Alla cancellazione:',
            items: [
              "Manterrai l'accesso fino alla fine del tuo periodo di fatturazione corrente",
              'Non vengono forniti rimborsi per mesi parziali di servizio',
              "I tuoi dati saranno disponibili per l'esportazione per 90 giorni dopo la cancellazione",
              'Il rinnovo automatico sarà disabilitato',
            ],
          },
          sla: {
            title: '5. Accordo sul livello di servizio',
            content: 'Per gli abbonamenti a pagamento, ci impegniamo a:',
            items: [
              '99,9% di disponibilità uptime della piattaforma',
              'Finestre di manutenzione programmate con preavviso di 48 ore',
              'Risposta del supporto clienti entro 24 ore per richieste standard',
              'Supporto prioritario per abbonati Gruppo concessionari',
            ],
          },
          data: {
            title: '6. Dati e sicurezza',
            content: 'I dati della tua concessionaria rimangono di tua proprietà. Forniamo:',
            items: [
              'Backup automatizzati giornalieri con conservazione di 30 giorni',
              'Protocolli di crittografia e sicurezza a livello bancario',
              'Conformità GDPR e CCPA per la protezione dei dati',
              'Capacità di esportazione dati in formati standard',
            ],
          },
          support: {
            title: '7. Supporto e formazione',
            content: 'Tutti gli abbonamenti a pagamento includono:',
            items: [
              'Assistenza completa per onboarding e configurazione',
              'Risorse di formazione online e documentazione',
              "Supporto email e chat durante l'orario lavorativo",
              'Aggiornamenti regolari della piattaforma e rilasci di nuove funzionalità',
            ],
          },
          modifications: {
            title: '8. Modifiche al servizio',
            content:
              'Potremmo modificare o aggiornare la piattaforma The DAS Board per migliorare funzionalità, sicurezza o conformità. Forniremo ragionevole preavviso di cambiamenti significativi che potrebbero influenzare il tuo utilizzo.',
          },
        },
      },
      pricingPage: {
        title: 'Seleziona la Tua',
        titleHighlight: 'Soluzione',
        subtitle:
          "Seleziona l'opzione che descrive meglio le tue esigenze. Personalizzeremo la tua esperienza di conseguenza.",
        singleFinance: {
          title: 'Manager Finanziario Singolo',
          description:
            'Perfetto per manager finanziari individuali che vogliono tracciare le loro prestazioni personali e affari.',
          originalPrice: '$29.99/mese',
          price: '$20/mese tempo limitato',
          features: [
            'Tracciamento affari personali',
            'Analisi PVR e profitti prodotti',
            'Calcolatore pagamenti',
            'Metriche delle prestazioni',
            'Può essere deducibile dalle tasse',
          ],
          buttonText: 'Inizia Ora!',
          setupTime: 'Prova senza rischi per un mese di calendario completo',
        },
        dealership: {
          title: 'Concessionaria / Gruppo Concessionari',
          description:
            'Gestione completa della concessionaria con dashboard specifici per ruolo, gestione del team e supporto multi-sede.',
          price: '$250/mese base',
          priceSubtext: 'per concessionaria + componenti aggiuntivi',
          popular: 'Più Popolare',
          features: [
            'Tutte le funzionalità del manager singolo',
            'Dashboard di team per tutti i ruoli',
            'Analisi multi-sede',
            'Strutture amministrative flessibili',
            'Sconti volume disponibili',
          ],
          buttonText: 'Visualizza Prezzi Pacchetto Dinamico',
          setupTime: 'Inizia oggi stesso',
        },
        benefits: {
          title: 'Trasforma la Tua Concessionaria Oggi',
          performance: {
            title: 'Aumenta le Prestazioni',
            description:
              'Gli insights in tempo reale aiutano i team a superare gli obiettivi e massimizzare la redditività',
          },
          operations: {
            title: 'Semplifica le Operazioni',
            description:
              "La gestione centralizzata riduce i tempi amministrativi e migliora l'efficienza",
          },
          security: {
            title: 'Sicuro e Affidabile',
            description: 'Sicurezza di livello aziendale con garanzia di uptime del 99,9%',
          },
        },
        helpText: {
          title: 'Non sei sicuro di quale opzione scegliere?',
          description:
            "Inizia con l'opzione manager finanziario singolo per provare la nostra piattaforma, poi passa facilmente alle funzionalità della concessionaria quando sei pronto ad espandere il tuo team.",
        },
        footer: {
          copyright: '© 2025 The DAS Board. Tutti i diritti riservati.',
          support: 'Domande? Contattaci a',
          email: 'support@thedasboard.com',
        },
      },
    },
    dashboard: {
      singleFinance: {
        title: 'Dashboard del Finance Manager',
        kpi: {
          fiGross: 'F&I Lordo',
          dealsProcessed: 'Affare Elaborati',
          avgDealSize: 'Dimensione Media Affare',
          vscs: 'VSCs',
          gaps: 'GAPs',
          ppms: 'PPMs',
        },
        deals: {
          title: 'Gestione Affari',
          recentDeals: 'Affari Recenti',
          allDeals: 'Tutti gli Affari',
          viewAll: 'Visualizza tutti gli affari',
          addNew: 'Aggiungi nuovo affare',
          searchPlaceholder: 'Cerca per nome cliente, VIN o numero affare...',
          allStatuses: 'Tutti gli stati',
          backToDashboard: 'Torna alla dashboard',
          noDealsYet: 'Nessun affare ancora. Inizia aggiungendo il tuo primo affare.',
          noDealsFound: 'Nessun affare trovato che corrisponda ai tuoi criteri.',
          showingDeals: 'Mostrando {count} di {total} affari',
          totalGross: 'Totale Lordo:',
          backEndTotal: 'Totale Back-end:',
          confirmDelete:
            'Sei sicuro di voler eliminare questo affare? Questa azione è irreversibile.',
          finalConfirmDelete:
            "Questa è la tua conferma finale. L'affare sarà eliminato permanentemente. Continuare?",
          editButton: 'Modifica',
          note: 'Questi sono i tuoi affari elaborati. Puoi modificarli, eliminarli o cambiare il loro stato.',
          statusOptions: {
            pending: 'In Attesa',
            funded: 'Finanziato',
            held: 'Sospeso',
            unwound: 'Annullato',
            deadDeal: 'Affare Morto',
          },
          tableHeaders: {
            number: '#',
            lastName: 'Cognome',
            dealNumber: 'Numero Affare',
            stockNumber: 'Numero Stock',
            date: 'Data',
            vin: 'VIN',
            vehicleType: 'Tipo',
            lender: 'Prestatore',
            frontEnd: 'Front-End',
            vsc: 'VSC',
            ppm: 'PPM',
            gap: 'GAP',
            tireWheel: 'P&C',
            appearance: 'Aspetto',
            theft: 'Furto',
            bundled: 'Pacchetto',
            ppd: 'PPD',
            pvr: 'PVR',
            total: 'Totale',
            status: 'Stato',
            edit: 'Modifica',
            delete: 'Elimina',
          },
        },
        dealLog: {
          title: 'Registro Nuovo Affare',
          note: 'Tutti i campi contrassegnati con * sono obbligatori. Assicurati di inserire informazioni accurate per un tracking corretto.',
          customerInfo: 'Informazioni Cliente',
          dealInfo: 'Informazioni Affare',
          vehicleInfo: 'Informazioni Veicolo',
          profitInfo: 'Informazioni Profitto',
          firstName: 'Nome *',
          lastName: 'Cognome *',
          dealNumber: 'Numero Affare *',
          stockNumber: 'Numero Stock *',
          vinLast8: 'Ultimi 8 del VIN *',
          dealDate: 'Data Affare *',
          vehicleType: 'Tipo Veicolo *',
          vehicleTypes: {
            new: 'Nuovo',
            used: 'Usato',
            cpo: 'CPO',
          },
          lender: 'Prestatore',
          frontEndGross: 'Front-End Lordo (€)',
          vscProfit: 'Profitto VSC (€)',
          ppmProfit: 'Profitto PPM (€)',
          gapProfit: 'Profitto GAP (€)',
          tireAndWheelProfit: 'Profitto Pneumatici & Cerchi (€)',
          appearanceProfit: 'Profitto Aspetto (€)',
          theftProfit: 'Profitto Furto (€)',
          bundledProfit: 'Profitto Pacchetto (€)',
          dealStatus: 'Stato Affare',
          saveDeal: 'Salva Affare',
          cancel: 'Annulla',
          success: 'Affare salvato con successo!',
          error: "Errore nel salvare l'affare. Riprova.",
          backEndGross: 'Profitto Back-end lordo calcolato dai singoli profitti dei prodotti',
          totalGross: 'Profitto totale lordo (Front-end + Back-end)',
          salesperson: 'Venditore',
          salespeople: 'Venditori',
          selectSalesperson: 'Seleziona venditore',
          addSalesperson: 'Aggiungi venditore',
          noSalespeople: 'Nessun venditore disponibile. Aggiungili nelle Impostazioni.',
          validationErrors: {
            firstName: 'Il nome è obbligatorio',
            lastName: 'Il cognome è obbligatorio',
            dealNumber: 'Il numero affare è obbligatorio',
            stockNumber: 'Il numero stock è obbligatorio',
            vinLast8: 'Gli ultimi 8 del VIN sono obbligatori',
            dealDate: 'La data affare è obbligatoria',
            vehicleType: 'Il tipo veicolo è obbligatorio',
            lender: 'Il prestatore è obbligatorio per questo tipo di affare',
          },
        },
        settings: {
          title: 'Impostazioni',
          teamManagement: 'Gestione Team',
          payConfiguration: 'Configurazione Paghe',
          languageSettings: 'Impostazioni Lingua',
          addNewMember: 'Aggiungi nuovo membro del team',
          firstName: 'Nome',
          lastName: 'Cognome',
          role: 'Ruolo',
          roles: {
            salesperson: 'Venditore',
            salesManager: 'Manager Vendite',
          },
          addMember: 'Aggiungi Membro',
          commissionBasePay: 'Commissioni e Paga Base',
          commissionRate: 'Tasso Commissione (%)',
          baseRate: 'Tasso Base Mensile (€)',
          saveConfiguration: 'Salva Configurazione',
          currentLanguage: 'Lingua Corrente',
          selectLanguage: 'Seleziona Lingua',
          languageUpdated: 'Lingua aggiornata con successo',
        },
      },
    },
  } as Translations,
  pl: {
    nav: {
      home: 'Strona główna',
      screenshots: 'Zrzuty ekranu',
      pricing: 'Cennik',
      about: 'O nas',
      login: 'Zaloguj się',
      signup: 'Zarejestruj się',
      legal: 'Prawne',
    },
    home: {
      title: 'DAS Board',
      subtitle:
        'Kompletne rozwiązanie zarządzania dla dealerów samochodowych. Śledź sprzedaż, zarządzaj harmonogramami i optymalizuj wydajność w czasie rzeczywistym.',
      startTrial: 'Rozpocznij bezpłatny okres próbny',
      signupNow: 'Zarejestruj się Teraz!',
      viewScreenshots: 'Zobacz zrzuty ekranu',
      mission:
        'Nasza misja to wzmocnienie dealerów samochodowych poprzez intuicyjne narzędzia zarządzania, które zapewniają wgląd w czasie rzeczywistym, usprawniają operacje i napędzają wzrost.',
      features: {
        title: 'Funkcje',
        subtitle: 'Wszystko czego potrzebujesz do zarządzania nowoczesnym dealerem samochodowym',
      },
      pricing: {
        title: 'Wypróbuj dziś',
        subtitle: 'Wybierz plan idealnie dopasowany do Twojego salonu samochodowego',
      },
      pricingTiers: {
        singleFinance: {
          name: 'Indywidualny Menedżer Finansowy',
          price: '$20/miesiąc ograniczony czas',
          originalPrice: '$29.99/miesiąc',
          description:
            'Idealny dla indywidualnych menedżerów finansowych, którzy chcą śledzić swoje osobiste wyniki',
          features: [
            'Śledzenie osobistych transakcji',
            'Analiza PVR i zysków z produktów',
            'Kalkulator płatności',
            'Metryki wydajności',
            'Może być odliczane od podatku',
          ],
          buttonText: 'Zacznij Teraz!',
          setupTime: 'Wypróbuj bez ryzyka przez cały miesiąc kalendarzowy',
        },
        dealership: {
          name: 'Salon / Grupa Salonów',
          price: '$250/mo base',
          description:
            'Kompletne zarządzanie salonem z dashboardami specyficznymi dla ról i zarządzaniem zespołem',
          popular: 'Najpopularniejsze',
          features: [
            'Wszystkie funkcje indywidualnego menedżera',
            'Dashboardy zespołowe dla wszystkich ról',
            'Analiza wielu lokalizacji',
            'Elastyczne struktury administracyjne',
          ],
          buttonText: 'Skonfiguruj Swój Pakiet',
          setupTime: 'Zacznij już dziś',
        },
        priceSubtext: 'za salon + dodatki',
      },
      cta: {
        title: 'Gotowy na rozpoczęcie?',
        subtitle:
          'Dołącz do setek dealerów już korzystających z The DAS Board w celu optymalizacji swoich operacji.',
      },
    },
    features: {
      finance: {
        title: 'Śledzenie F&I',
        desc: 'Monitoruj oferty finansowe, marże i rezultaty w czasie rzeczywistym z kompleksowymi narzędziami analitycznymi.',
      },
      sales: {
        title: 'Zarządzanie sprzedażą',
        desc: 'Śledź cele sprzedaży, prowizje i wydajność zespołu z przejrzystymi pulpitami nawigacyjnymi.',
      },
      manager: {
        title: 'Narzędzia menedżerskie',
        desc: 'Zarządzaj harmonogramami zespołu, celami i raportami wydajności z jednego centralnego miejsca.',
      },
      info: {
        title: 'Monitorowanie w czasie rzeczywistym',
        desc: 'Otrzymuj aktualizacje na żywo o ofercie, sprzedaży i kluczowych wskaźnikach wydajności w całym salonie.',
      },
      scheduler: {
        title: 'Inteligentne planowanie',
        desc: 'Optymalizuj pokrycie podłogi i planowanie zespołu dzięki narzędziom do inteligentnego planowania.',
      },
      calculator: {
        title: 'Kalkulator prowizji',
        desc: 'Automatycznie obliczaj prowizje i wynagrodzenia z konfigurowalnymi planami wynagrodzeń.',
      },
    },
    screenshots: {
      title: 'Zobacz The DAS Board w akcji',
      subtitle:
        'Odkryj, jak różne role w Twoim salonie mogą skorzystać z naszych specjalistycznych pulpitów nawigacyjnych',
      finance: {
        title: 'Pulpit Menedżera Finansowego',
        desc: 'Śledź oferty F&I, marże i cele z kompleksowymi narzędziami analitycznymi i raportowymi.',
      },
      sales: {
        title: 'Pulpit Sprzedawcy',
        desc: 'Monitoruj cele sprzedaży, prowizje i wydajność zespołu z intuicyjnymi wizualizacjami.',
      },
      manager: {
        title: 'Pulpit Menedżera Sprzedaży',
        desc: 'Zarządzaj zespołem sprzedaży, celami i planowaniem z potężnymi narzędziami menedżerskimi.',
      },
      gm: {
        title: 'Pulpit Dyrektora Generalnego',
        desc: 'Uzyskaj kompleksowy widok operacji salonu z kluczowymi wskaźnikami i trendami.',
      },
    },
    pricing: {
      title: 'Wybierz swój plan',
      subtitle: 'Znajdź idealne rozwiązanie dla wielkości i potrzeb swojego salonu',
      finance: 'Tylko Menedżer Finansowy',
      dealership: 'Pojedynczy Salon',
      group: 'Grupa Dealerów',
      freeTime: 'DARMOWY przez ograniczony czas',
      getStarted: 'Rozpocznij',
      startTrial: 'Rozpocznij bezpłatny okres próbny',
      popular: 'Popularne',
      viewDetails: 'Zobacz pełne szczegóły cennika →',
      tiers: {
        finance: {
          name: 'Tylko Menedżer Finansowy',
          price: 'DARMOWY',
          originalPrice: '5$/miesiąc',
          description: 'Idealny dla indywidualnych menedżerów finansowych',
        },
        dealership: {
          name: 'Małe Grupy Dealerów',
          price: '250$/miesiąc',
          description: 'Na salon dla 1-5 salonów',
        },
        group: {
          name: 'Grupy Dealerów 6+',
          price: '200$/miesiąc',
          description: 'Na salon z rabatami hurtowymi',
        },
      },
    },
    about: {
      title: 'O nas',
      subtitle: 'Poznaj zespół budujący przyszłość zarządzania salonami samochodowymi',
      founderVision: {
        title: 'Wizja założyciela',
        paragraph1:
          'Tyler Durden, CEO i Założyciel The DAS Board, wnosi ponad 27 lat doświadczenia w branży motoryzacyjnej. Jego głęboka znajomość operacji salonów i zarządzania zespołami napędza jego wizję przyszłości zarządzania salonami.',
        paragraph2:
          'The DAS Board powstał z frustracji brakiem inteligentnych, zorientowanych na dane narzędzi zarządzania w branży motoryzacyjnej. Tyler zobaczył, jak salony walczą z przestarzałymi systemami i postanowił stworzyć rozwiązanie, które rzeczywiście rozumie unikalne potrzeby dealerów samochodowych.',
        paragraph3:
          'Dzisiaj The DAS Board służy setkom dealerów w całym kraju, zapewniając im narzędzia potrzebne do optymalizacji operacji, zwiększenia rentowności i rozwijania ich biznesu.',
      },
      team: {
        title: 'Nasz zespół',
        members: {
          tyler: {
            name: 'Tyler Durden',
            role: 'CEO i Założyciel',
            bio: 'Z ponad 27-letnim doświadczeniem w branży motoryzacyjnej, Tyler wnosi bogate doświadczenie w zarządzaniu salonami i operacjach. Jego wizja The DAS Board wywodzi się z głębokiego zrozumienia wyzwań, z jakimi salony mierzą się każdego dnia.',
          },
          sarah: {
            name: 'Sarah Conner',
            role: 'Dyrektor Produktu',
            bio: 'Sarah ma ponad 25 lat doświadczenia w salonach i handlu detalicznym, specjalizuje się w doświadczeniu użytkownika i projektowaniu produktów. Kieruje naszym zespołem produktowym w tworzeniu intuicyjnych rozwiązań, które rzeczywiście odpowiadają potrzebom salonów.',
          },
          claude: {
            name: 'Claude Sonnet',
            role: 'Dyrektor Techniczny',
            bio: 'Claude to doświadczony inżynier oprogramowania specjalizujący się w skalowalnych aplikacjach internetowych i systemach czasu rzeczywistego. Kieruje naszym zespołem technicznym w budowaniu solidnej i niezawodnej platformy zasilającej The DAS Board.',
          },
          annie: {
            name: 'Annie Porter',
            role: 'Dyrektor Sukcesu Klienta',
            bio: 'Annie specjalizuje się w zapewnianiu sukcesu naszych klientów z The DAS Board. Jej podejście skoncentrowane na kliencie zapewnia, że każdy salon otrzymuje spersonalizowane wsparcie potrzebne do maksymalizacji ich inwestycji.',
          },
        },
      },
      values: {
        title: 'Nasze wartości',
        customerFocused: {
          title: 'Skoncentrowani na kliencie',
          description:
            'Wzmacniamy salony samochodowe intuicyjnymi pulpitami nawigacyjnymi, które priorytetowo traktują ich unikalne potrzeby, zapewniając bezproblemowe zarządzanie i ulepszone doświadczenia klientów.',
        },
        dataDriven: {
          title: 'Napędzani danymi',
          description:
            'Nasza platforma dostarcza w czasie rzeczywistym, praktyczne wglądy z danych salonów, umożliwiając precyzyjne podejmowanie decyzji w celu zwiększenia sprzedaży i efektywności operacyjnej.',
        },
        continuousImprovement: {
          title: 'Ciągłe doskonalenie',
          description:
            'Nieustannie udoskonalamy nasze narzędzia, aby pomóc salonom optymalizować wydajność, dostosowywać się do trendów branżowych i osiągać trwały wzrost.',
        },
      },
      contact: {
        title: 'Skontaktuj się z nami',
        subtitle: 'Masz pytania? Jesteśmy tutaj, aby pomóc.',
        email: 'Email',
        phone: 'Telefon',
      },
    },
    signup: {
      title: 'Utwórz konto',
      subtitle: 'Rozpocznij dziś z rozwiązaniem do zarządzania salonem.',
      selectLanguage: 'Wybierz swój język',
      dealerGroup: 'Rejestracja grupy dealerów',
      dealership: 'Rejestracja salonu',
      financeManager: 'Rejestracja menedżera finansowego',
      form: {
        firstName: 'Imię',
        lastName: 'Nazwisko',
        email: 'Adres email',
        password: 'Hasło',
        confirmPassword: 'Potwierdź hasło',
        dealershipName: 'Nazwa salonu',
        role: 'Twoja rola',
        phone: 'Numer telefonu',
        submit: 'Utwórz konto',
        alreadyHave: 'Masz już konto?',
        signIn: 'Zaloguj się',
        terms: 'Akceptuję warunki świadczenia usług i politykę prywatności',
      },
    },
    common: {
      language: 'Język',
      login: 'Zaloguj się',
      signUp: 'Zarejestruj się',
      loading: 'Ładowanie...',
      save: 'Zapisz',
      cancel: 'Anuluj',
      continue: 'Kontynuuj',
      back: 'Wstecz',
      next: 'Dalej',
      submit: 'Wyślij',
      close: 'Zamknij',
    },
    footer: {
      tagline: 'Wzmocnij swój salon dzięki wglądom w czasie rzeczywistym',
      industry: 'Zaprojektowane dla branży motoryzacyjnej',
      product: 'Produkt',
      legal: 'Prawne',
      contact: 'Kontakt',
      support: 'W przypadku wsparcia lub zapytań skontaktuj się z nami pod adresem:',
      copyright: '© 2025 The DAS Board. Wszystkie prawa zastrzeżone. Zaprojektowane z 🖤',
      terms: 'Warunki świadczenia usług',
      privacy: 'Polityka prywatności',
      subscription: 'Umowa subskrypcji',
      home: 'Strona główna',
      screenshots: 'Zrzuty ekranu',
      pricing: 'Cennik',
      aboutUs: 'O nas',
    },
    currency: {
      symbol: 'PLN',
      name: 'PLN',
    },
    legal: {
      terms: {
        title: 'Warunki świadczenia usług',
        lastUpdated: 'Ostatnia aktualizacja: 6/28/2025',
        intro:
          'Witamy w The DAS Board. Niniejsze Warunki Świadczenia Usług ("Warunki") regulują Państwa dostęp do naszej platformy oprogramowania do zarządzania salonami samochodowymi i korzystanie z niej. Uzyskując dostęp lub korzystając z naszych usług, wyrażają Państwo zgodę na związanie tymi Warunkami.',
        sections: {
          acceptance: {
            title: '1. Akceptacja Warunków',
            content:
              'Tworząc konto, uzyskując dostęp lub korzystając z The DAS Board, potwierdzają Państwo, że przeczytali, zrozumieli i zgodzili się być związani niniejszymi Warunkami oraz naszą Polityką Prywatności. Jeśli nie akceptują Państwo tych Warunków, nie mogą Państwo korzystać z naszych usług. Muszą Państwo mieć co najmniej 18 lat i posiadać uprawnienia do zawierania tych Warunków w imieniu swojej organizacji.',
          },
          service: {
            title: '2. Opis Usługi',
            content:
              'The DAS Board to oparta na chmurze platforma oprogramowania do zarządzania salonami samochodowymi, która zapewnia narzędzia do zarządzania zapasami, śledzenia sprzedaży, zarządzania relacjami z klientami, raportowania finansowego i powiązanych usług w branży motoryzacyjnej. Zastrzegamy sobie prawo do modyfikacji, zawieszenia lub zaprzestania dowolnego aspektu naszej usługi z rozsądnym wyprzedzeniem.',
          },
          account: {
            title: '3. Rejestracja Konta i Bezpieczeństwo',
            content:
              'Aby korzystać z naszych usług, muszą Państwo utworzyć konto z dokładnymi i kompletnymi informacjami. Są Państwo odpowiedzialni za:',
            items: [
              'Zachowanie poufności danych logowania do swojego konta',
              'Wszystkie działania, które mają miejsce na Państwa koncie',
              'Natychmiastowe powiadomienie nas o jakimkolwiek nieautoryzowanym użyciu',
              'Zapewnienie, że informacje o Państwa koncie pozostają aktualne i dokładne',
              'Przestrzeganie naszych wymagań bezpieczeństwa i najlepszych praktyk',
            ],
          },
          subscription: {
            title: '4. Warunki Subskrypcji i Płatności',
            content:
              'The DAS Board działa w modelu subskrypcyjnym. Subskrybując, zgadzają się Państwo na:',
            items: [
              'Opłacenie wszystkich opłat związanych z Państwa planem subskrypcji',
              'Automatyczne odnowienie, chyba że zostanie anulowane przed datą odnowienia',
              'Zmiany opłat z 30-dniowym wyprzedzeniem',
              'Brak zwrotów za częściowe okresy subskrypcji',
              'Zawieszenie usługi za nieopłacenie po rozsądnym powiadomieniu',
            ],
          },
          usage: {
            title: '5. Polityka Dopuszczalnego Użycia',
            content:
              'Zgadzają się Państwo korzystać z The DAS Board wyłącznie w celach zgodnych z prawem i zgodnie z niniejszymi Warunkami. Nie mogą Państwo:',
            items: [
              'Naruszać obowiązujących przepisów prawa, regulacji lub praw osób trzecich',
              'Przesyłać szkodliwych, obraźliwych lub nieodpowiednich treści',
              'Próbować uzyskać nieautoryzowany dostęp do naszych systemów lub kont innych użytkowników',
              'Używać usługi do wysyłania spamu, złośliwego oprogramowania lub innych szkodliwych treści',
              'Przeprowadzać inżynierii wstecznej, dekompilować lub próbować wyodrębnić kod źródłowy',
              'Zakłócać lub przerywać integralność lub wydajność naszych usług',
              'Używać platformy do oszukańczych lub nielegalnych działań',
            ],
          },
          intellectual: {
            title: '6. Prawa Własności Intelektualnej',
            content:
              'The DAS Board oraz wszystkie powiązane technologie, treści i materiały są własnością naszą lub naszych licencjodawców. Obejmuje to:',
            items: [
              'Oprogramowanie, algorytmy i interfejsy użytkownika',
              'Znaki towarowe, logo i materiały brandingowe',
              'Dokumentację, samouczki i materiały wsparcia',
              'Analizy, raporty i zagregowane wglądy w dane',
            ],
            footer:
              'Zachowują Państwo własność swoich danych, ale udzielają nam licencji na ich wykorzystanie w celu świadczenia naszych usług. Możemy wykorzystywać zanonimizowane, zagregowane dane do badań branżowych i ulepszania platformy.',
          },
          privacy: {
            title: '7. Ochrona Danych i Prywatność',
            content:
              'Są Państwo odpowiedzialni za zapewnienie, że wszelkie dane osobowe przetwarzane przez Państwa za pośrednictwem naszej platformy są zgodne z obowiązującymi przepisami o ochronie prywatności. Będziemy przetwarzać dane zgodnie z naszą Polityką Prywatności i obowiązującymi przepisami o ochronie danych, w tym RODO i CCPA, gdzie ma to zastosowanie.',
          },
          availability: {
            title: '8. Dostępność Usługi i Wsparcie',
            content:
              'Chociaż dążymy do wysokiej dostępności, nie gwarantujemy nieprzerwanej usługi. Zapewniamy:',
            items: [
              '99,9% SLA czasu pracy dla płatnych subskrypcji',
              'Regularne okna konserwacyjne z wyprzedzeniem',
              'Wsparcie techniczne oparte na Państwa poziomie subskrypcji',
              'Monitorowanie bezpieczeństwa i reagowanie na incydenty',
            ],
          },
          termination: {
            title: '9. Rozwiązanie',
            content: 'Każda ze stron może rozwiązać niniejsze Warunki:',
            items: [
              'Mogą Państwo anulować swoją subskrypcję w dowolnym momencie poprzez ustawienia konta',
              'Możemy rozwiązać za naruszenie tych Warunków z rozsądnym wyprzedzeniem',
              'Możemy natychmiast zawiesić usługę w przypadku poważnych naruszeń lub zagrożeń bezpieczeństwa',
              'Po rozwiązaniu stracą Państwo dostęp do platformy i swoich danych',
              'Zapewnimy rozsądną możliwość eksportu Państwa danych przed usunięciem',
            ],
          },
          disclaimers: {
            title: '10. Wyłączenia Odpowiedzialności i Ograniczenia Odpowiedzialności',
            content:
              'THE DAS BOARD JEST DOSTARCZANE "TAK JAK JEST" BEZ GWARANCJI JAKIEGOKOLWIEK RODZAJU. W MAKSYMALNYM ZAKRESIE DOZWOLONYM PRZEZ PRAWO:',
            items: [
              'Wyłączamy wszystkie gwarancje, wyraźne lub dorozumiane, w tym przydatność handlową i przydatność do określonego celu',
              'Nie ponosimy odpowiedzialności za szkody pośrednie, przypadkowe, specjalne lub następcze',
              'Nasza całkowita odpowiedzialność nie przekroczy opłat przez Państwa zapłaconych w ciągu 12 miesięcy poprzedzających roszczenie',
              'Uznają Państwo, że oprogramowanie może zawierać błędy i zgadzają się na ich szybkie zgłaszanie',
            ],
          },
          indemnification: {
            title: '11. Odszkodowanie',
            content:
              'Zgadzają się Państwo na odszkodowanie i zwolnienie nas z odpowiedzialności za wszelkie roszczenia, straty lub szkody wynikające z Państwa korzystania z naszych usług, naruszenia tych Warunków lub naruszenia praw osób trzecich.',
          },
          governing: {
            title: '12. Prawo Właściwe i Rozstrzyganie Sporów',
            content:
              'Niniejsze Warunki podlegają prawu [Jurysdykcja] bez względu na zasady kolizji praw. Wszelkie spory będą rozstrzygane poprzez wiążący arbitraż, z wyjątkiem roszczeń o zabezpieczenie, które mogą być wnoszone do odpowiednich sądów.',
          },
          changes: {
            title: '13. Zmiany Warunków',
            content:
              'Możemy od czasu do czasu modyfikować te Warunki. Zapewnimy powiadomienie o istotnych zmianach co najmniej 30 dni z wyprzedzeniem. Kontynuowanie korzystania z naszych usług po wejściu zmian w życie stanowi akceptację zmienionych Warunków.',
          },
          entire: {
            title: '14. Całość Umowy',
            content:
              'Niniejsze Warunki wraz z naszą Polityką Prywatności i wszelkimi dodatkowymi umowami stanowią całość umowy między Państwem a The DAS Board w odniesieniu do korzystania z naszych usług.',
          },
          contact: {
            title: '15. Informacje Kontaktowe',
            content: 'Jeśli mają Państwo pytania dotyczące tych Warunków, prosimy o kontakt:',
            email: 'legal@thedasboard.com',
            address: '[Adres Firmy]',
            phone: '[Numer Telefonu Wsparcia]',
          },
        },
      },
      privacy: {
        title: 'Polityka prywatności',
        lastUpdated: 'Ostatnia aktualizacja: 28.6.2025',
        intro:
          'Ta Polityka prywatności opisuje, jak The DAS Board („my", „nasz" lub „nasze") zbiera, używa i chroni Państwa dane osobowe podczas korzystania z naszej platformy oprogramowania do zarządzania salonami samochodowymi. Zobowiązujemy się chronić Państwa prywatność i odpowiedzialnie zarządzać Państwa danymi.',
        sections: {
          collection: {
            title: '1. Informacje, które zbieramy',
            content:
              'Podczas korzystania z The DAS Board zbieramy kilka rodzajów informacji w celu świadczenia i poprawy naszych usług:',
            items: [
              '<strong>Informacje o koncie:</strong> Imię i nazwisko, adres e-mail, numer telefonu, nazwa firmy, stanowisko i informacje rozliczeniowe',
              '<strong>Dane salonu:</strong> Inwentarz pojazdów, zapisy sprzedaży, informacje o klientach i transakcje finansowe',
              '<strong>Dane o użytkowaniu:</strong> Używane funkcje, czas spędzony na platformie, interakcje użytkownika i metryki wydajności',
              '<strong>Dane techniczne:</strong> Adres IP, typ przeglądarki, informacje o urządzeniu, system operacyjny i dzienniki dostępu',
              '<strong>Dane komunikacyjne:</strong> Prośby o wsparcie, opinie i korespondencja z naszym zespołem',
              '<strong>Dane lokalizacyjne:</strong> Adresy salonu i, za zgodą, lokalizacja urządzenia dla funkcji mobilnych',
            ],
          },
          usage: {
            title: '2. Jak używamy Państwa informacji',
            content: 'Zebrane informacje używamy do celów biznesowych, w tym:',
            items: [
              'Świadczenie, utrzymanie i ulepszanie platformy i funkcji The DAS Board',
              'Przetwarzanie subskrypcji, płatności i zarządzanie Państwa kontem',
              'Generowanie analiz, raportów i spostrzeżeń biznesowych dla Państwa salonu',
              'Świadczenie obsługi klienta i odpowiadanie na Państwa zapytania',
              'Wysyłanie aktualizacji usług, alertów bezpieczeństwa i wiadomości administracyjnych',
              'Wykrywanie, zapobieganie i rozwiązywanie problemów technicznych oraz zagrożeń bezpieczeństwa',
              'Przestrzeganie zobowiązań prawnych i przepisów branżowych',
              'Poprawianie doświadczenia użytkownika poprzez rozwój produktu i badania',
            ],
          },
          sharing: {
            title: '3. Udostępnianie Państwa informacji',
            content:
              'Nie sprzedajemy, nie wypożyczamy ani nie wymieniamy Państwa danych osobowych. Możemy udostępniać Państwa informacje tylko w następujących okolicznościach:',
            items: [
              '<strong>Dostawcy usług:</strong> Dostawcy zewnętrzni, którzy pomagają nam obsługiwać naszą platformę (hosting, analityka, przetwarzanie płatności)',
              '<strong>Partnerzy biznesowi:</strong> Autoryzowane integracje i partnerzy z branży motoryzacyjnej za Państwa wyraźną zgodą',
              '<strong>Wymogi prawne:</strong> Gdy wymaga tego prawo, rozporządzenie lub ważny proces prawny',
              '<strong>Transfery biznesowe:</strong> W związku z fuzjami, przejęciami lub sprzedażą aktywów (z powiadomieniem)',
              '<strong>Bezpieczeństwo i ochrona:</strong> W celu ochrony praw, własności lub bezpieczeństwa naszych użytkowników lub społeczeństwa',
            ],
          },
          retention: {
            title: '4. Przechowywanie danych',
            content:
              'Przechowujemy Państwa dane osobowe tak długo, jak jest to konieczne do świadczenia naszych usług i przestrzegania zobowiązań prawnych. Konkretnie:',
            items: [
              'Dane konta są przechowywane podczas aktywnej subskrypcji i przez 3 lata po rozwiązaniu',
              'Zapisy transakcji są przechowywane przez 7 lat w celu przestrzegania przepisów finansowych',
              'Dzienniki użytkowania są przechowywane przez 2 lata do analizy bezpieczeństwa i wydajności',
              'Zapisy komunikacji są przechowywane przez 5 lat do celów obsługi klienta',
            ],
          },
          rights: {
            title: '5. Państwa prawa i wybory',
            content:
              'W zależności od Państwa lokalizacji, mogą Państwo mieć następujące prawa dotyczące Państwa danych osobowych:',
            items: [
              '<strong>Dostęp:</strong> Żądanie kopii Państwa danych osobowych, które posiadamy',
              '<strong>Sprostowanie:</strong> Aktualizacja lub korekta niedokładnych danych osobowych',
              '<strong>Usunięcie:</strong> Żądanie usunięcia Państwa danych osobowych (z zastrzeżeniem zobowiązań prawnych)',
              '<strong>Przenośność:</strong> Otrzymanie Państwa danych w formacie nadającym się do odczytu maszynowego',
              '<strong>Ograniczenie:</strong> Ograniczenie sposobu przetwarzania Państwa danych osobowych',
              '<strong>Sprzeciw:</strong> Sprzeciw wobec przetwarzania opartego na uzasadnionych interesach',
            ],
          },
          cookies: {
            title: '6. Pliki cookie i technologie śledzenia',
            content:
              'Używamy plików cookie i podobnych technologii w celu poprawy Państwa doświadczenia:',
            items: [
              '<strong>Niezbędne pliki cookie:</strong> Wymagane do funkcjonalności i bezpieczeństwa platformy',
              '<strong>Analityczne pliki cookie:</strong> Pomagają nam zrozumieć, jak korzystają Państwo z naszej platformy',
              '<strong>Preferencyjne pliki cookie:</strong> Zapamiętują Państwa ustawienia i personalizacje',
              '<strong>Marketingowe pliki cookie:</strong> Używane do celowej komunikacji (za Państwa zgodą)',
            ],
            footer:
              'Mogą Państwo kontrolować preferencje plików cookie poprzez ustawienia przeglądarki lub nasze narzędzie zarządzania plikami cookie.',
          },
          security: {
            title: '7. Środki bezpieczeństwa',
            content:
              'Implementujemy standardowe w branży środki bezpieczeństwa w celu ochrony Państwa informacji, w tym:',
            items: [
              'Szyfrowanie danych w transakcji i w spoczynku przy użyciu standardów AES-256',
              'Regularne audyty bezpieczeństwa i testy penetracyjne',
              'Uwierzytelnianie wieloskładnikowe i kontrole dostępu',
              'Zgodność SOC 2 Type II i regularne oceny bezpieczeństwa',
              'Szkolenie pracowników w zakresie ochrony danych i najlepszych praktyk bezpieczeństwa',
            ],
          },
          international: {
            title: '8. Międzynarodowe transfery danych',
            content:
              'Państwa informacje mogą być przekazywane i przetwarzane w krajach innych niż Państwa własny. Zapewniamy, że odpowiednie zabezpieczenia są wdrożone, w tym Standardowe Klauzule Umowne i decyzje o adekwatności, w celu ochrony Państwa danych podczas międzynarodowych transferów.',
          },
          children: {
            title: '9. Prywatność dzieci',
            content:
              'The DAS Board nie jest przeznaczony do użytku przez osoby poniżej 18 roku życia. Nie zbieramy świadomie danych osobowych od dzieci poniżej 18 roku życia. Jeśli dowiemy się o takim zbieraniu, usuniemy informacje niezwłocznie.',
          },
          changes: {
            title: '10. Zmiany w tej Polityce prywatności',
            content:
              'Możemy okresowo aktualizować tę Politykę prywatności, aby odzwierciedlić zmiany w naszych praktykach lub wymogach prawnych. Powiadomimy Państwa o znaczących zmianach poprzez e-mail lub powiadomienie na platformie co najmniej 30 dni przed ich wejściem w życie.',
          },
          contact: {
            title: '11. Skontaktuj się z nami',
            content:
              'Jeśli mają Państwo pytania dotyczące tej Polityki prywatności lub chcą skorzystać ze swoich praw, prosimy o kontakt:',
            email: 'privacy@thedasboard.com',
            address: '[Company Address]',
            phone: '[Support Phone Number]',
          },
        },
      },
      subscription: {
        title: 'Umowa subskrypcji',
        lastUpdated: 'Ostatnia aktualizacja: 6/28/2025',
        intro:
          'Ta Umowa subskrypcji reguluje Twoją subskrypcję i korzystanie z platformy zarządzania dealerami The DAS Board.',
        sections: {
          plans: {
            title: '1. Plany subskrypcji',
            content:
              'The DAS Board oferuje poziomy subskrypcji zaprojektowane dla różnych potrzeb dealerów:',
            items: [
              '<strong>60-dniowa bezpłatna wersja próbna:</strong> Pełny dostęp do platformy bez wymaganej karty kredytowej',
              '<strong>Menedżer finansowy:</strong> Indywidualny dostęp użytkownika z podstawowymi narzędziami finansowymi',
              '<strong>Dealer:</strong> Dostęp dla wielu użytkowników z pełnym zarządzaniem inwentarzem i sprzedażą',
              '<strong>Grupa dealerów:</strong> Dostęp na poziomie przedsiębiorstwa w wielu lokalizacjach',
            ],
            footer:
              'Subskrypcje są rozliczane miesięcznie z góry. Możesz w każdej chwili zaktualizować lub obniżyć swoją subskrypcję, zmiany wchodzą w życie w następnym cyklu rozliczeniowym.',
          },
          payment: {
            title: '2. Warunki płatności',
            content:
              'Płatność jest należna po rozpoczęciu subskrypcji i tego samego dnia każdego kolejnego miesiąca. Akceptujemy główne karty kredytowe i przelewy ACH dla kont firmowych. Jeśli płatność się nie powiedzie, możemy zawiesić Twój dostęp do The DAS Board po uzasadnionym powiadomieniu.',
          },
          trial: {
            title: '3. Okres próbny',
            content:
              '60-dniowa wersja próbna zapewnia pełny dostęp do platformy The DAS Board. Do rozpoczęcia wersji próbnej nie jest wymagana karta kredytowa. Na koniec okresu próbnego musisz wybrać płatny plan, aby kontynuować korzystanie z platformy. Dane z wersji próbnej będą zachowane przez 30 dni po wygaśnięciu wersji próbnej.',
          },
          cancellation: {
            title: '4. Anulowanie i zwroty',
            content:
              'Możesz anulować swoją subskrypcję w dowolnym momencie za pośrednictwem ustawień konta lub kontaktując się z naszym zespołem wsparcia. Po anulowaniu:',
            items: [
              'Zachowasz dostęp do końca bieżącego okresu rozliczeniowego',
              'Nie są udzielane zwroty za częściowe miesiące usługi',
              'Twoje dane będą dostępne do eksportu przez 90 dni po anulowaniu',
              'Automatyczne odnawianie zostanie wyłączone',
            ],
          },
          sla: {
            title: '5. Umowa poziomu usług',
            content: 'Dla płatnych subskrypcji zobowiązujemy się do:',
            items: [
              '99,9% dostępności platformy',
              'Zaplanowane okna konserwacji z 48-godzinnym wyprzedzeniem',
              'Odpowiedź wsparcia klienta w ciągu 24 godzin dla standardowych zapytań',
              'Wsparcie priorytetowe dla subskrybentów Grupy dealerów',
            ],
          },
          data: {
            title: '6. Dane i bezpieczeństwo',
            content: 'Dane Twojego dealera pozostają Twoją własnością. Zapewniamy:',
            items: [
              'Codzienne automatyczne kopie zapasowe z 30-dniowym przechowywaniem',
              'Szyfrowanie i protokoły bezpieczeństwa na poziomie bankowym',
              'Zgodność z GDPR i CCPA w zakresie ochrony danych',
              'Możliwości eksportu danych w standardowych formatach',
            ],
          },
          support: {
            title: '7. Wsparcie i szkolenia',
            content: 'Wszystkie płatne subskrypcje obejmują:',
            items: [
              'Kompleksową pomoc w wdrożeniu i konfiguracji',
              'Zasoby szkoleniowe online i dokumentację',
              'Wsparcie e-mail i chat w godzinach pracy',
              'Regularne aktualizacje platformy i wydania nowych funkcji',
            ],
          },
          modifications: {
            title: '8. Modyfikacje usługi',
            content:
              'Możemy modyfikować lub aktualizować platformę The DAS Board w celu poprawy funkcjonalności, bezpieczeństwa lub zgodności. Zapewnimy uzasadnione powiadomienie o istotnych zmianach, które mogą wpłynąć na Twoje użytkowanie.',
          },
        },
      },
      pricingPage: {
        title: 'Wybierz Swoje',
        titleHighlight: 'Rozwiązanie',
        subtitle:
          'Wybierz opcję, która najlepiej opisuje Twoje potrzeby. Dostosujemy Twoje doświadczenie odpowiednio.',
        singleFinance: {
          title: 'Indywidualny Menedżer Finansowy',
          description:
            'Idealny dla indywidualnych menedżerów finansowych, którzy chcą śledzić swoje osobiste wyniki i transakcje.',
          originalPrice: '$29.99/miesiąc',
          price: '$20/miesiąc ograniczony czas',
          features: [
            'Śledzenie osobistych transakcji',
            'Analiza PVR i zysków z produktów',
            'Kalkulator płatności',
            'Metryki wydajności',
            'Może być odliczane od podatku',
          ],
          buttonText: 'Zacznij Teraz!',
          setupTime: 'Wypróbuj bez ryzyka przez cały miesiąc kalendarzowy',
        },
        dealership: {
          title: 'Salon / Grupa Salonów',
          description:
            'Kompletne zarządzanie salonem z dashboardami specyficznymi dla ról, zarządzaniem zespołem i wsparciem wielolokalizacyjnym.',
          price: '$250/miesiąc podstawa',
          priceSubtext: 'za salon + dodatki',
          popular: 'Najpopularniejsze',
          features: [
            'Wszystkie funkcje indywidualnego menedżera',
            'Dashboardy zespołowe dla wszystkich ról',
            'Analiza wielu lokalizacji',
            'Elastyczne struktury administracyjne',
            'Dostępne rabaty hurtowe',
          ],
          buttonText: 'Zobacz Dynamiczne Ceny Pakietów',
          setupTime: 'Zacznij już dziś',
        },
        benefits: {
          title: 'Przekształć Swój Salon Już Dziś',
          performance: {
            title: 'Zwiększ Wydajność',
            description:
              'Wgląd w czasie rzeczywistym pomaga zespołom przekraczać cele i maksymalizować rentowność',
          },
          operations: {
            title: 'Uspraw Operacje',
            description:
              'Scentralizowane zarządzanie redukuje czas administracyjny i poprawia efektywność',
          },
          security: {
            title: 'Bezpieczne i Niezawodne',
            description:
              'Bezpieczeństwo na poziomie przedsiębiorstwa z gwarancją 99,9% dostępności',
          },
        },
        helpText: {
          title: 'Nie jesteś pewien, którą opcję wybrać?',
          description:
            'Zacznij od opcji indywidualnego menedżera finansowego, aby wypróbować naszą platformę, a następnie łatwo przejdź na funkcje salonu, gdy będziesz gotowy rozszerzyć swój zespół.',
        },
        footer: {
          copyright: '© 2025 The DAS Board. Wszystkie prawa zastrzeżone.',
          support: 'Pytania? Skontaktuj się z nami pod adresem',
          email: 'support@thedasboard.com',
        },
      },
    },
    dashboard: {
      singleFinance: {
        title: 'Dashboard Menedżera Finansowego',
        kpi: {
          fiGross: 'F&I Brutto',
          dealsProcessed: 'Przetworzone Oferty',
          avgDealSize: 'Średni Rozmiar Oferty',
          vscs: 'VSCs',
          gaps: 'GAPs',
          ppms: 'PPMs',
        },
        deals: {
          title: 'Zarządzanie Ofertami',
          recentDeals: 'Ostatnie Oferty',
          allDeals: 'Wszystkie Oferty',
          viewAll: 'Zobacz wszystkie oferty',
          addNew: 'Dodaj nową ofertę',
          searchPlaceholder: 'Szukaj według nazwy klienta, VIN lub numeru oferty...',
          allStatuses: 'Wszystkie statusy',
          backToDashboard: 'Powrót do pulpitu',
          noDealsYet: 'Brak ofert. Zacznij od dodania pierwszej oferty.',
          noDealsFound: 'Nie znaleziono ofert odpowiadających Twoim kryteriom.',
          showingDeals: 'Pokazano {count} z {total} ofert',
          totalGross: 'Całkowity Brutto:',
          backEndTotal: 'Całkowity Back-end:',
          confirmDelete: 'Czy na pewno chcesz usunąć tę ofertę? Ta akcja jest nieodwracalna.',
          finalConfirmDelete:
            'To jest ostateczne potwierdzenie. Oferta zostanie trwale usunięta. Kontynuować?',
          editButton: 'Edytuj',
          note: 'To są Twoje przetworzone oferty. Możesz je edytować, usuwać lub zmieniać ich status.',
          statusOptions: {
            pending: 'Oczekujące',
            funded: 'Sfinansowane',
            held: 'Wstrzymane',
            unwound: 'Anulowane',
            deadDeal: 'Martwa Oferta',
          },
          tableHeaders: {
            number: '#',
            lastName: 'Nazwisko',
            dealNumber: 'Numer Oferty',
            stockNumber: 'Numer Magazynowy',
            date: 'Data',
            vin: 'VIN',
            vehicleType: 'Typ',
            lender: 'Pożyczkodawca',
            frontEnd: 'Front-End',
            vsc: 'VSC',
            ppm: 'PPM',
            gap: 'GAP',
            tireWheel: 'O&K',
            appearance: 'Wygląd',
            theft: 'Kradzież',
            bundled: 'Pakiet',
            ppd: 'PPD',
            pvr: 'PVR',
            total: 'Razem',
            status: 'Status',
            edit: 'Edytuj',
            delete: 'Usuń',
          },
        },
        dealLog: {
          title: 'Rejestr Nowej Oferty',
          note: 'Wszystkie pola oznaczone * są wymagane. Upewnij się, że podasz dokładne informacje dla właściwego śledzenia.',
          customerInfo: 'Informacje o Kliencie',
          dealInfo: 'Informacje o Ofercie',
          vehicleInfo: 'Informacje o Pojeździe',
          profitInfo: 'Informacje o Zysku',
          firstName: 'Imię *',
          lastName: 'Nazwisko *',
          dealNumber: 'Numer Oferty *',
          stockNumber: 'Numer Magazynowy *',
          vinLast8: 'Ostatnie 8 cyfr VIN *',
          dealDate: 'Data Oferty *',
          vehicleType: 'Typ Pojazdu *',
          vehicleTypes: {
            new: 'Nowy',
            used: 'Używany',
            cpo: 'CPO',
          },
          lender: 'Pożyczkodawca',
          frontEndGross: 'Front-End Brutto (zł)',
          vscProfit: 'Zysk VSC (zł)',
          ppmProfit: 'Zysk PPM (zł)',
          gapProfit: 'Zysk GAP (zł)',
          tireAndWheelProfit: 'Zysk Opony & Koła (zł)',
          appearanceProfit: 'Zysk Wygląd (zł)',
          theftProfit: 'Zysk Kradzież (zł)',
          bundledProfit: 'Zysk Pakiet (zł)',
          dealStatus: 'Status Oferty',
          saveDeal: 'Zapisz Ofertę',
          cancel: 'Anuluj',
          success: 'Oferta zapisana pomyślnie!',
          error: 'Błąd podczas zapisywania oferty. Spróbuj ponownie.',
          backEndGross: 'Zysk Back-end brutto obliczony z poszczególnych zysków produktów',
          totalGross: 'Całkowity zysk brutto (Front-end + Back-end)',
          salesperson: 'Sprzedawca',
          salespeople: 'Sprzedawcy',
          selectSalesperson: 'Wybierz sprzedawcę',
          addSalesperson: 'Dodaj sprzedawcę',
          noSalespeople: 'Brak dostępnych sprzedawców. Dodaj ich w Ustawieniach.',
          validationErrors: {
            firstName: 'Imię jest wymagane',
            lastName: 'Nazwisko jest wymagane',
            dealNumber: 'Numer oferty jest wymagany',
            stockNumber: 'Numer magazynowy jest wymagany',
            vinLast8: 'Ostatnie 8 cyfr VIN jest wymagane',
            dealDate: 'Data oferty jest wymagana',
            vehicleType: 'Typ pojazdu jest wymagany',
            lender: 'Pożyczkodawca jest wymagany dla tego typu oferty',
          },
        },
        settings: {
          title: 'Ustawienia',
          teamManagement: 'Zarządzanie Zespołem',
          payConfiguration: 'Konfiguracja Płac',
          languageSettings: 'Ustawienia Języka',
          addNewMember: 'Dodaj nowego członka zespołu',
          firstName: 'Imię',
          lastName: 'Nazwisko',
          role: 'Rola',
          roles: {
            salesperson: 'Sprzedawca',
            salesManager: 'Menedżer Sprzedaży',
          },
          addMember: 'Dodaj Członka',
          commissionBasePay: 'Prowizje i Płaca Podstawowa',
          commissionRate: 'Stawka Prowizji (%)',
          baseRate: 'Podstawowa Stawka Miesięczna (zł)',
          saveConfiguration: 'Zapisz Konfigurację',
          currentLanguage: 'Obecny Język',
          selectLanguage: 'Wybierz Język',
          languageUpdated: 'Język zaktualizowany pomyślnie',
        },
      },
    },
  } as Translations,
  pt: {
    nav: {
      home: 'Início',
      screenshots: 'Capturas de tela',
      pricing: 'Preços',
      about: 'Sobre nós',
      login: 'Entrar',
      signup: 'Cadastrar',
      legal: 'Legal',
    },
    home: {
      title: 'O DAS Board',
      subtitle:
        'Dashboards em tempo real fornecendo insights críticos para gerentes financeiros, concessionárias e grupos de concessionários.',
      startTrial: 'Comece Sua Avaliação Gratuita',
      signupNow: 'Inscreva-se Agora!',
      viewScreenshots: 'Ver Capturas de Tela',
      mission:
        '"O DAS Board redefine o sucesso da concessionária, capacitando Gerentes de Vendas para otimizar equipes e Gerentes Financeiros para maximizar lucros com insights-chave de vendas, e Vendedores para ficarem por dentro de seus negócios." - Tyler Durden',
      features: {
        title: 'Principais Recursos',
        subtitle:
          'Tudo que você precisa para gerenciar as operações da sua concessionária de forma eficaz',
      },
      pricing: {
        title: 'Experimente Agora',
        subtitle:
          'Comece sua avaliação gratuita e veja a diferença que insights em tempo real podem fazer para sua concessionária.',
      },
      pricingTiers: {
        singleFinance: {
          name: 'Gerente Financeiro Individual',
          price: '$20/mês tempo limitado',
          originalPrice: '$29.99/mês',
          description:
            'Perfeito para gerentes financeiros individuais que querem acompanhar seu desempenho pessoal',
          features: [
            'Rastreamento de negócios pessoais',
            'Análises de PVR e lucros de produtos',
            'Calculadora de pagamentos',
            'Métricas de desempenho',
            'Pode ser dedutível de impostos',
          ],
          buttonText: 'Comece Agora!',
          setupTime: 'Experimente sem risco por um mês civil completo',
        },
        dealership: {
          name: 'Concessionária / Grupo de Concessionárias',
          price: '$250/mo base',
          description:
            'Gestão completa da concessionária com dashboards específicos para funções e gerenciamento de equipe',
          popular: 'Mais Popular',
          features: [
            'Todas as funcionalidades do gerente individual',
            'Dashboards de equipe para todas as funções',
            'Análises multi-localização',
            'Estruturas administrativas flexíveis',
          ],
          buttonText: 'Configure Seu Pacote',
          setupTime: 'Comece hoje mesmo',
        },
        priceSubtext: 'por concessionária + complementos',
      },
      cta: {
        title: 'Pronto para transformar as operações da sua concessionária?',
        subtitle:
          'Junte-se a centenas de concessionárias que já usam O DAS Board para otimizar suas operações.',
      },
    },
    features: {
      finance: {
        title: 'Dashboards Financeiros',
        desc: 'Insights em tempo real para gerentes financeiros acompanharem performance diária, registrarem negócios, visualizarem métricas incluindo PVR, VSC e outros Produtos.',
      },
      sales: {
        title: 'Dashboards da Equipe de Vendas',
        desc: 'O DAS Board é sua nova Tabela de Classificação! Acompanhe seus negócios e saiba exatamente onde você está durante o mês.',
      },
      manager: {
        title: 'Dashboards de Gerente de Vendas',
        desc: 'Visualize Logs de Negócios, estatísticas de Vendedores, gerencie suas Equipes de forma mais eficaz.',
      },
      info: {
        title: 'Dashboards Informativos',
        desc: 'Dashboards específicos por função para Equipes de Vendas, Gerentes Financeiros, Gerentes de Vendas e Gerentes Gerais.',
      },
      scheduler: {
        title: 'Agendador Dinâmico',
        desc: 'Agendador dinâmico de vendedores para coordenação eficiente da equipe. Gerencie horários para maximizar a produção diária.',
      },
      calculator: {
        title: 'Calculadora de Pagamento',
        desc: 'Sua Equipe de Vendas e Gerentes Financeiros poderão ver ganhos em tempo real do mês até a data com planos de pagamento pré-configurados.',
      },
    },
    screenshots: {
      title: 'Veja O DAS Board em Ação',
      subtitle:
        'Dê uma olhada em nossos dashboards intuitivos projetados para profissionais automotivos.',
      finance: {
        title: 'Dashboard do Gerente Financeiro',
        desc: 'Acompanhe negócios, métricas PVR, VSC e performance diária em tempo real.',
      },
      sales: {
        title: 'Dashboard de Vendas',
        desc: 'Sua tabela de classificação pessoal mostrando negócios, rankings e progresso mensal.',
      },
      manager: {
        title: 'Dashboard do Gerente de Vendas',
        desc: 'Visão abrangente da equipe com logs de negócios e análises de performance.',
      },
      gm: {
        title: 'Dashboard do Gerente Geral',
        desc: 'Insights de alto nível sobre performance da concessionária e produtividade da equipe.',
      },
    },
    pricing: {
      title: 'Escolha o Plano Perfeito',
      subtitle:
        'Comece com nossa avaliação gratuita para gerentes financeiros, ou escolha o plano que escala com sua concessionária.',
      finance: 'Gerente Financeiro',
      dealership: 'Concessionária Individual',
      group: 'Grupos de Concessionários',
      freeTime: 'Grátis por Tempo Limitado!',
      getStarted: 'Começar',
      startTrial: 'Iniciar Avaliação Gratuita',
      popular: 'Mais Popular',
      viewDetails: 'Ver Detalhes Completos de Preços →',
      tiers: {
        finance: {
          name: 'Gerentes Financeiros',
          price: 'Grátis por Tempo Limitado!',
          originalPrice: 'R$25/Mês',
          description: 'Acompanhe seus Negócios, Produtos, PVR e Pagamento!',
        },
        dealership: {
          name: 'Concessionárias',
          price: 'R$1.250/mês',
          description: 'Para até 15 usuários com acesso completo à concessionária.',
        },
        group: {
          name: 'Grupos de Concessionários',
          price: 'R$2.500/mês',
          description: 'Suporte multi-concessionária para grupos de concessionários.',
        },
      },
    },
    about: {
      title: 'Quem Somos',
      subtitle:
        'Profissionais apaixonados dedicados a revolucionar o gerenciamento de concessionárias através de tecnologia inovadora e insights baseados em dados.',
      founderVision: {
        title: 'Por que Criei O DAS Board – Tyler Durden, CEO e Fundador',
        paragraph1:
          'Com mais de 27 anos de experiência na indústria de concessionárias automotivas, testemunhei em primeira mão os desafios que os gerentes enfrentam ao equilibrar seus papéis como líderes e executores. Como profissional experiente, fundei O DAS Board para abordar uma lacuna crítica que observei: enquanto os Gerentes de Vendas se destacam em vender carros, frequentemente lutam para gerenciar efetivamente suas equipes de vendas.',
        paragraph2:
          'Acredito que vendedores informados, motivados e bem apoiados são a chave para resultados excepcionais — superando de longe os resultados de equipes desengajadas ou desinformadas. O DAS Board capacita Gerentes de Vendas com ferramentas intuitivas para liderar suas equipes de forma mais eficaz, garantindo que possam focar tanto no desenvolvimento da equipe quanto na excelência em vendas.',
        paragraph3:
          'Além das vendas, o aplicativo apoia Gerentes Financeiros fornecendo insights em tempo real sobre lucratividade de negócios e métricas-chave, enquanto oferece aos GMs relatórios acionáveis para orientar decisões estratégicas. Minha visão com O DAS Board é revolucionar o gerenciamento de concessionárias, fomentando uma cultura de eficiência, transparência e sucesso em todos os níveis da organização.',
      },
      team: {
        title: 'Nossa Equipe',
        members: {
          tyler: {
            name: 'Tyler Durden',
            role: 'CEO e Fundador',
            bio: 'Baseando-se em ampla experiência em gerenciamento de concessionárias, Tyler Durden fundou O DAS Board para fomentar uma cultura onde funcionários informados e motivados prosperam, impulsionando produtividade através de ferramentas transparentes baseadas em dados que capacitam equipes automotivas.',
          },
          sarah: {
            name: 'Sarah Conner',
            role: 'Diretora de Produto',
            bio: 'Com mais de 25 anos de experiência em concessionárias e varejo, Sarah Conner traz insights profundos para alcançar sucesso em vendas. Ela entende o poder de ferramentas eficazes e gerenciamento habilidoso para inspirar equipes, garantindo que O DAS Board gere resultados excepcionais para concessionárias.',
          },
          claude: {
            name: 'Claude Sonnet',
            role: 'Diretor de Tecnologia',
            bio: 'Claude Sonnet traz profunda expertise em criar software que se destaca, com foco em plataformas escaláveis e seguras. Sua capacidade de entregar insights sem complexidade garante que O DAS Board forneça tecnologia confiável e perfeita para concessionárias.',
          },
          annie: {
            name: 'Annie Porter',
            role: 'Diretora de Sucesso do Cliente',
            bio: 'Dedicada a garantir que cada cliente do DAS Board obtenha o máximo de nossa plataforma através de integração personalizada e suporte',
          },
        },
      },
      values: {
        title: 'Nossos Valores',
        customerFocused: {
          title: 'Focados no Cliente',
          description:
            'Capacitamos concessionárias automotivas com dashboards intuitivos que priorizam suas necessidades únicas, garantindo gerenciamento perfeito e experiências aprimoradas para o cliente.',
        },
        dataDriven: {
          title: 'Baseados em Dados',
          description:
            'Nossa plataforma entrega insights acionáveis em tempo real de dados de concessionárias, permitindo tomada de decisão precisa para impulsionar vendas e eficiência operacional.',
        },
        continuousImprovement: {
          title: 'Melhoria Contínua',
          description:
            'Refinamos incansavelmente nossas ferramentas para ajudar concessionárias a otimizar performance, adaptar-se a tendências da indústria e alcançar crescimento sustentado.',
        },
      },
      contact: {
        title: 'Entre em Contato',
        subtitle:
          'Pronto para ver como O DAS Board pode transformar as operações da sua concessionária? Adoraríamos ouvir de você.',
        email: 'Email',
        phone: 'Telefone',
      },
    },
    signup: {
      title: 'Junte-se ao DAS Board',
      subtitle: 'Comece hoje com sua solução de gerenciamento de concessionária.',
      selectLanguage: 'Selecione seu idioma',
      dealerGroup: 'Cadastro de Grupo de Concessionários',
      dealership: 'Cadastro de Concessionária',
      financeManager: 'Cadastro de Gerente Financeiro',
      form: {
        firstName: 'Nome',
        lastName: 'Sobrenome',
        email: 'Endereço de Email',
        password: 'Senha',
        confirmPassword: 'Confirmar Senha',
        dealershipName: 'Nome da Concessionária',
        role: 'Sua Função',
        phone: 'Número de Telefone',
        submit: 'Criar Conta',
        alreadyHave: 'Já tem uma conta?',
        signIn: 'Entrar',
        terms: 'Concordo com os termos de serviço e política de privacidade',
      },
    },
    common: {
      language: 'Idioma',
      login: 'Entrar',
      signUp: 'Cadastrar',
      loading: 'Carregando...',
      save: 'Salvar',
      cancel: 'Cancelar',
      continue: 'Continuar',
      back: 'Voltar',
      next: 'Próximo',
      submit: 'Enviar',
      close: 'Fechar',
    },
    footer: {
      tagline: 'Software moderno de gerenciamento de concessionárias com insights em tempo real.',
      industry: 'Vendas Automotivas de Concessionárias',
      product: 'Produto',
      legal: 'Legal',
      contact: 'Contato',
      support: 'Para suporte ou consultas, entre em contato conosco em:',
      copyright: '© 2025 O DAS Board. Todos os direitos reservados. Projetado com 🖤',
      terms: 'Termos de Serviço',
      privacy: 'Política de Privacidade',
      subscription: 'Acordo de Assinatura',
      home: 'Início',
      screenshots: 'Capturas de tela',
      pricing: 'Preços',
      aboutUs: 'Sobre nós',
    },
    currency: {
      symbol: 'R$',
      name: 'BRL',
    },
    legal: {
      terms: {
        title: 'Termos de Serviço',
        lastUpdated: 'Última atualização: 6/28/2025',
        intro:
          'Bem-vindos ao The DAS Board. Estes Termos de Serviço ("Termos") regem o seu acesso e uso da nossa plataforma de software de gestão de concessionárias. Ao acessar ou utilizar os nossos serviços, concordam em estar vinculados a estes Termos.',
        sections: {
          acceptance: {
            title: '1. Aceitação dos Termos',
            content:
              'Ao criar uma conta, acessar ou utilizar o The DAS Board, reconhecem que leram, compreenderam e concordaram em estar vinculados a estes Termos e à nossa Política de Privacidade. Se não concordarem com estes Termos, não podem utilizar os nossos serviços. Devem ter pelo menos 18 anos e ter autoridade para celebrar estes Termos em nome da sua organização.',
          },
          service: {
            title: '2. Descrição do Serviço',
            content:
              'O The DAS Board é uma plataforma de software de gestão de concessionárias baseada na nuvem que fornece ferramentas para gestão de inventário, acompanhamento de vendas, gestão de relacionamento com clientes, relatórios financeiros e serviços relacionados da indústria automobilística. Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer aspecto do nosso serviço com aviso razoável.',
          },
          account: {
            title: '3. Registro de Conta e Segurança',
            content:
              'Para utilizar os nossos serviços, devem criar uma conta com informações precisas e completas. São responsáveis por:',
            items: [
              'Manter a confidencialidade das credenciais da sua conta',
              'Todas as atividades que ocorrem sob a sua conta',
              'Notificar-nos imediatamente de qualquer uso não autorizado',
              'Garantir que as informações da sua conta permaneçam atuais e precisas',
              'Cumprir os nossos requisitos de segurança e melhores práticas',
            ],
          },
          subscription: {
            title: '4. Termos de Subscrição e Pagamento',
            content: 'O The DAS Board opera numa base de subscrição. Ao subscrever, concordam em:',
            items: [
              'Pagar todas as taxas associadas ao seu plano de subscrição',
              'Renovação automática a menos que seja cancelada antes da data de renovação',
              'Alterações de taxas com aviso prévio de 30 dias',
              'Sem reembolsos por períodos de subscrição parciais',
              'Suspensão do serviço por não pagamento após aviso razoável',
            ],
          },
          usage: {
            title: '5. Política de Uso Aceitável',
            content:
              'Concordam em utilizar o The DAS Board apenas para fins legais e de acordo com estes Termos. Não podem:',
            items: [
              'Violar leis aplicáveis, regulamentos ou direitos de terceiros',
              'Carregar conteúdo prejudicial, ofensivo ou inadequado',
              'Tentar obter acesso não autorizado aos nossos sistemas ou contas de outros utilizadores',
              'Usar o serviço para enviar spam, malware ou outro conteúdo malicioso',
              'Fazer engenharia reversa, descompilar ou tentar extrair código fonte',
              'Interferir ou interromper a integridade ou desempenho dos nossos serviços',
              'Usar a plataforma para atividades fraudulentas ou ilegais',
            ],
          },
          intellectual: {
            title: '6. Direitos de Propriedade Intelectual',
            content:
              'O The DAS Board e todas as tecnologias, conteúdos e materiais relacionados são propriedade nossa ou dos nossos licenciadores. Isto inclui:',
            items: [
              'Software, algoritmos e interfaces de utilizador',
              'Marcas comerciais, logótipos e materiais de marca',
              'Documentação, tutoriais e materiais de suporte',
              'Análises, relatórios e insights de dados agregados',
            ],
            footer:
              'Mantêm a propriedade dos seus dados, mas concedem-nos uma licença para os utilizar para fornecer os nossos serviços. Podemos usar dados anonimizados e agregados para pesquisa da indústria e melhoria da plataforma.',
          },
          privacy: {
            title: '7. Proteção de Dados e Privacidade',
            content:
              'São responsáveis por garantir que quaisquer dados pessoais que processem através da nossa plataforma cumpram as leis de privacidade aplicáveis. Processaremos dados de acordo com a nossa Política de Privacidade e regulamentos de proteção de dados aplicáveis, incluindo RGPD e CCPA onde aplicável.',
          },
          availability: {
            title: '8. Disponibilidade do Serviço e Suporte',
            content:
              'Embora nos esforcemos por alta disponibilidade, não garantimos serviço ininterrupto. Fornecemos:',
            items: [
              '99,9% SLA de tempo de atividade para subscrições pagas',
              'Janelas de manutenção regulares com aviso prévio',
              'Suporte técnico baseado no seu nível de subscrição',
              'Monitorização de segurança e resposta a incidentes',
            ],
          },
          termination: {
            title: '9. Rescisão',
            content: 'Qualquer das partes pode rescindir estes Termos:',
            items: [
              'Podem cancelar a sua subscrição a qualquer momento através das configurações da conta',
              'Podemos rescindir por violação destes Termos com aviso razoável',
              'Podemos suspender o serviço imediatamente por violações graves ou ameaças de segurança',
              'Após a rescisão, perderão o acesso à plataforma e aos seus dados',
              'Forneceremos uma oportunidade razoável para exportar os seus dados antes da eliminação',
            ],
          },
          disclaimers: {
            title: '10. Isenções de Responsabilidade e Limitações de Responsabilidade',
            content:
              'O THE DAS BOARD É FORNECIDO "COMO ESTÁ" SEM GARANTIAS DE QUALQUER TIPO. NA MÁXIMA EXTENSÃO PERMITIDA POR LEI:',
            items: [
              'Isentamos todas as garantias, expressas ou implícitas, incluindo comercialização e adequação para um propósito particular',
              'Não somos responsáveis por danos indiretos, incidentais, especiais ou consequenciais',
              'A nossa responsabilidade total não excederá as taxas pagas por vocês nos 12 meses anteriores à reclamação',
              'Reconhecem que o software pode conter bugs e concordam em reportá-los prontamente',
            ],
          },
          indemnification: {
            title: '11. Indemnização',
            content:
              'Concordam em indemnizar-nos e isentar-nos de responsabilidade por quaisquer reclamações, perdas ou danos decorrentes do vosso uso dos nossos serviços, violação destes Termos ou violação de direitos de terceiros.',
          },
          governing: {
            title: '12. Lei Aplicável e Resolução de Disputas',
            content:
              'Estes Termos são regidos pelas leis de [Jurisdição] sem consideração aos princípios de conflito de leis. Quaisquer disputas serão resolvidas através de arbitragem vinculativa, exceto para reclamações de medidas cautelares que podem ser apresentadas em tribunais apropriados.',
          },
          changes: {
            title: '13. Alterações aos Termos',
            content:
              'Podemos modificar estes Termos de tempos em tempos. Forneceremos aviso de alterações materiais pelo menos 30 dias de antecedência. O uso continuado dos nossos serviços após as alterações entrarem em vigor constitui aceitação dos Termos revistos.',
          },
          entire: {
            title: '14. Acordo Completo',
            content:
              'Estes Termos, juntamente com a nossa Política de Privacidade e quaisquer acordos adicionais, constituem o acordo completo entre vocês e o The DAS Board relativamente ao vosso uso dos nossos serviços.',
          },
          contact: {
            title: '15. Informações de Contato',
            content: 'Se tiverem questões sobre estes Termos, contactem-nos:',
            email: 'legal@thedasboard.com',
            address: '[Endereço da Empresa]',
            phone: '[Número de Telefone de Suporte]',
          },
        },
      },
      privacy: {
        title: 'Política de Privacidade',
        lastUpdated: 'Última Atualização: 28/6/2025',
        intro:
          'Esta Política de Privacidade descreve como o The DAS Board ("nós", "nosso" ou "nossa") coleta, usa e protege suas informações pessoais quando você utiliza nossa plataforma de software de gestão de concessionárias. Estamos comprometidos em proteger sua privacidade e tratar seus dados de forma responsável.',
        sections: {
          collection: {
            title: '1. Informações que Coletamos',
            content:
              'Quando você usa o The DAS Board, coletamos vários tipos de informações para fornecer e melhorar nossos serviços:',
            items: [
              '<strong>Informações da Conta:</strong> Nome, endereço de e-mail, número de telefone, nome da empresa, cargo e informações de faturamento',
              '<strong>Dados da Concessionária:</strong> Inventário de veículos, registros de vendas, informações de clientes e transações financeiras',
              '<strong>Dados de Uso:</strong> Recursos acessados, tempo gasto na plataforma, interações do usuário e métricas de desempenho',
              '<strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, informações do dispositivo, sistema operacional e logs de acesso',
              '<strong>Dados de Comunicação:</strong> Solicitações de suporte, feedback e correspondência com nossa equipe',
              '<strong>Dados de Localização:</strong> Endereços da concessionária e, com consentimento, localização do dispositivo para recursos móveis',
            ],
          },
          usage: {
            title: '2. Como Usamos Suas Informações',
            content:
              'Usamos as informações coletadas para propósitos comerciais legítimos, incluindo:',
            items: [
              'Fornecer, manter e melhorar a plataforma e recursos do The DAS Board',
              'Processar assinaturas, pagamentos e gerenciar sua conta',
              'Gerar análises, relatórios e insights comerciais para sua concessionária',
              'Fornecer suporte ao cliente e responder às suas consultas',
              'Enviar atualizações de serviço, alertas de segurança e mensagens administrativas',
              'Detectar, prevenir e resolver problemas técnicos e ameaças de segurança',
              'Cumprir obrigações legais e regulamentações da indústria',
              'Melhorar a experiência do usuário através do desenvolvimento de produtos e pesquisa',
            ],
          },
          sharing: {
            title: '3. Compartilhamento de Suas Informações',
            content:
              'Não vendemos, alugamos ou negociamos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes circunstâncias:',
            items: [
              '<strong>Prestadores de Serviços:</strong> Fornecedores terceirizados que nos ajudam a operar nossa plataforma (hospedagem, análises, processamento de pagamentos)',
              '<strong>Parceiros Comerciais:</strong> Integrações autorizadas e parceiros da indústria automotiva com seu consentimento explícito',
              '<strong>Requisitos Legais:</strong> Quando exigido por lei, regulamento ou processo legal válido',
              '<strong>Transferências Comerciais:</strong> Em conexão com fusões, aquisições ou vendas de ativos (com notificação prévia)',
              '<strong>Segurança e Proteção:</strong> Para proteger os direitos, propriedade ou segurança de nossos usuários ou do público',
            ],
          },
          retention: {
            title: '4. Retenção de Dados',
            content:
              'Retemos suas informações pessoais pelo tempo necessário para fornecer nossos serviços e cumprir obrigações legais. Especificamente:',
            items: [
              'Dados da conta são retidos enquanto sua assinatura estiver ativa e por 3 anos após o cancelamento',
              'Registros de transações são mantidos por 7 anos para cumprir regulamentações financeiras',
              'Logs de uso são retidos por 2 anos para análise de segurança e desempenho',
              'Registros de comunicação são mantidos por 5 anos para fins de atendimento ao cliente',
            ],
          },
          rights: {
            title: '5. Seus Direitos e Escolhas',
            content:
              'Dependendo da sua localização, você pode ter os seguintes direitos em relação às suas informações pessoais:',
            items: [
              '<strong>Acesso:</strong> Solicitar uma cópia de suas informações pessoais que mantemos',
              '<strong>Correção:</strong> Atualizar ou corrigir informações pessoais imprecisas',
              '<strong>Exclusão:</strong> Solicitar a exclusão de suas informações pessoais (sujeito a obrigações legais)',
              '<strong>Portabilidade:</strong> Receber seus dados em formato legível por máquina',
              '<strong>Restrição:</strong> Limitar como processamos suas informações pessoais',
              '<strong>Objeção:</strong> Objetar ao processamento baseado em interesses legítimos',
            ],
          },
          cookies: {
            title: '6. Cookies e Tecnologias de Rastreamento',
            content: 'Usamos cookies e tecnologias similares para aprimorar sua experiência:',
            items: [
              '<strong>Cookies Essenciais:</strong> Necessários para funcionalidade e segurança da plataforma',
              '<strong>Cookies Analíticos:</strong> Nos ajudam a entender como você usa nossa plataforma',
              '<strong>Cookies de Preferência:</strong> Lembram suas configurações e personalizações',
              '<strong>Cookies de Marketing:</strong> Usados para comunicações direcionadas (com seu consentimento)',
            ],
            footer:
              'Você pode controlar as preferências de cookies através das configurações do seu navegador ou nossa ferramenta de gerenciamento de cookies.',
          },
          security: {
            title: '7. Medidas de Segurança',
            content:
              'Implementamos medidas de segurança padrão da indústria para proteger suas informações, incluindo:',
            items: [
              'Criptografia de dados em trânsito e em repouso usando padrões AES-256',
              'Auditorias de segurança regulares e testes de penetração',
              'Autenticação multifator e controles de acesso',
              'Conformidade SOC 2 Type II e avaliações de segurança regulares',
              'Treinamento de funcionários sobre proteção de dados e melhores práticas de segurança',
            ],
          },
          international: {
            title: '8. Transferências Internacionais de Dados',
            content:
              'Suas informações podem ser transferidas e processadas em países diferentes do seu. Garantimos que salvaguardas apropriadas estejam implementadas, incluindo Cláusulas Contratuais Padrão e decisões de adequação, para proteger seus dados durante transferências internacionais.',
          },
          children: {
            title: '9. Privacidade de Crianças',
            content:
              'O The DAS Board não se destina ao uso por indivíduos menores de 18 anos. Não coletamos conscientemente informações pessoais de crianças menores de 18 anos. Se tomarmos conhecimento de tal coleta, excluiremos as informações prontamente.',
          },
          changes: {
            title: '10. Alterações nesta Política de Privacidade',
            content:
              'Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas ou requisitos legais. Notificaremos você sobre mudanças significativas por e-mail ou notificação na plataforma pelo menos 30 dias antes de entrarem em vigor.',
          },
          contact: {
            title: '11. Entre em Contato',
            content:
              'Se você tiver dúvidas sobre esta Política de Privacidade ou desejar exercer seus direitos, entre em contato conosco:',
            email: 'privacy@thedasboard.com',
            address: '[Company Address]',
            phone: '[Support Phone Number]',
          },
        },
      },
      subscription: {
        title: 'Acordo de Assinatura',
        lastUpdated: 'Última atualização: 6/28/2025',
        intro:
          'Este Acordo de Assinatura rege sua assinatura e uso da plataforma de gestão de concessionárias The DAS Board.',
        sections: {
          plans: {
            title: '1. Planos de assinatura',
            content:
              'O The DAS Board oferece níveis de assinatura projetados para diferentes necessidades de concessionárias:',
            items: [
              '<strong>Teste gratuito de 60 dias:</strong> Acesso completo à plataforma sem cartão de crédito necessário',
              '<strong>Gerente financeiro:</strong> Acesso individual de usuário com ferramentas financeiras principais',
              '<strong>Concessionária:</strong> Acesso multiusuário com gestão completa de inventário e vendas',
              '<strong>Grupo de concessionárias:</strong> Acesso de nível empresarial em múltiplas localizações',
            ],
            footer:
              'As assinaturas são cobradas mensalmente com antecedência. Você pode atualizar ou rebaixar sua assinatura a qualquer momento, com alterações tendo efeito no próximo ciclo de cobrança.',
          },
          payment: {
            title: '2. Termos de pagamento',
            content:
              'O pagamento é devido no início da assinatura e no mesmo dia a cada mês seguinte. Aceitamos os principais cartões de crédito e transferências ACH para contas empresariais. Se o pagamento falhar, podemos suspender seu acesso ao The DAS Board após aviso razoável.',
          },
          trial: {
            title: '3. Período de teste',
            content:
              'O teste de 60 dias fornece acesso completo à plataforma The DAS Board. Nenhum cartão de crédito é necessário para iniciar seu teste. No final do período de teste, você precisará selecionar um plano pago para continuar usando a plataforma. Os dados do teste serão preservados por 30 dias após a expiração do teste.',
          },
          cancellation: {
            title: '4. Cancelamento e reembolsos',
            content:
              'Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta ou entrando em contato com nossa equipe de suporte. Após o cancelamento:',
            items: [
              'Você manterá acesso até o final do seu período de cobrança atual',
              'Nenhum reembolso é fornecido para meses parciais de serviço',
              'Seus dados estarão disponíveis para exportação por 90 dias após o cancelamento',
              'A renovação automática será desabilitada',
            ],
          },
          sla: {
            title: '5. Acordo de nível de serviço',
            content: 'Para assinaturas pagas, nos comprometemos a:',
            items: [
              '99,9% de disponibilidade da plataforma',
              'Janelas de manutenção programadas com aviso de 48 horas',
              'Resposta do suporte ao cliente dentro de 24 horas para solicitações padrão',
              'Suporte prioritário para assinantes do Grupo de concessionárias',
            ],
          },
          data: {
            title: '6. Dados e segurança',
            content: 'Os dados da sua concessionária permanecem sua propriedade. Fornecemos:',
            items: [
              'Backups automatizados diários com retenção de 30 dias',
              'Protocolos de criptografia e segurança de nível bancário',
              'Conformidade com GDPR e CCPA para proteção de dados',
              'Capacidades de exportação de dados em formatos padrão',
            ],
          },
          support: {
            title: '7. Suporte e treinamento',
            content: 'Todas as assinaturas pagas incluem:',
            items: [
              'Assistência abrangente de integração e configuração',
              'Recursos de treinamento online e documentação',
              'Suporte por email e chat durante horário comercial',
              'Atualizações regulares da plataforma e lançamentos de novos recursos',
            ],
          },
          modifications: {
            title: '8. Modificações do serviço',
            content:
              'Podemos modificar ou atualizar a plataforma The DAS Board para melhorar funcionalidade, segurança ou conformidade. Forneceremos aviso razoável de mudanças significativas que possam afetar seu uso.',
          },
        },
      },
      pricingPage: {
        title: 'Selecione Sua',
        titleHighlight: 'Solução',
        subtitle:
          'Selecione a opção que melhor descreve suas necessidades. Personalizaremos sua experiência de acordo.',
        singleFinance: {
          title: 'Gerente Financeiro Individual',
          description:
            'Perfeito para gerentes financeiros individuais que querem acompanhar seu desempenho pessoal e negócios.',
          originalPrice: '$29.99/mês',
          price: '$20/mês tempo limitado',
          features: [
            'Rastreamento de negócios pessoais',
            'Análises de PVR e lucros de produtos',
            'Calculadora de pagamentos',
            'Métricas de desempenho',
            'Pode ser dedutível de impostos',
          ],
          buttonText: 'Comece Agora!',
          setupTime: 'Experimente sem risco por um mês civil completo',
        },
        dealership: {
          title: 'Concessionária / Grupo de Concessionárias',
          description:
            'Gestão completa da concessionária com dashboards específicos para funções, gerenciamento de equipe e suporte multi-localização.',
          price: '$250/mês base',
          priceSubtext: 'por concessionária + complementos',
          popular: 'Mais Popular',
          features: [
            'Todas as funcionalidades do gerente individual',
            'Dashboards de equipe para todas as funções',
            'Análises multi-localização',
            'Estruturas administrativas flexíveis',
            'Descontos por volume disponíveis',
          ],
          buttonText: 'Ver Preços de Pacote Dinâmico',
          setupTime: 'Comece hoje mesmo',
        },
        benefits: {
          title: 'Transforme Sua Concessionária Hoje',
          performance: {
            title: 'Aumente o Desempenho',
            description:
              'Insights em tempo real ajudam as equipes a superar metas e maximizar a rentabilidade',
          },
          operations: {
            title: 'Otimize as Operações',
            description:
              'Gerenciamento centralizado reduz tempo administrativo e melhora a eficiência',
          },
          security: {
            title: 'Seguro e Confiável',
            description:
              'Segurança de nível empresarial com garantia de 99,9% de tempo de atividade',
          },
        },
        helpText: {
          title: 'Não tem certeza de qual opção escolher?',
          description:
            'Comece com a opção de gerente financeiro individual para experimentar nossa plataforma, depois atualize facilmente para recursos de concessionária quando estiver pronto para expandir sua equipe.',
        },
        footer: {
          copyright: '© 2025 The DAS Board. Todos os direitos reservados.',
          support: 'Dúvidas? Entre em contato conosco em',
          email: 'support@thedasboard.com',
        },
      },
    },
    dashboard: {
      singleFinance: {
        title: 'Dashboard do Gerente Financeiro',
        kpi: {
          fiGross: 'F&I Bruto',
          dealsProcessed: 'Negócios Processados',
          avgDealSize: 'Tamanho Médio do Negócio',
          vscs: 'VSCs',
          gaps: 'GAPs',
          ppms: 'PPMs',
        },
        deals: {
          title: 'Gestão de Negócios',
          recentDeals: 'Negócios Recentes',
          allDeals: 'Todos os Negócios',
          viewAll: 'Ver todos os negócios',
          addNew: 'Adicionar novo negócio',
          searchPlaceholder: 'Pesquisar por nome do cliente, VIN ou número do negócio...',
          allStatuses: 'Todos os status',
          backToDashboard: 'Voltar ao dashboard',
          noDealsYet: 'Nenhum negócio ainda. Comece adicionando seu primeiro negócio.',
          noDealsFound: 'Nenhum negócio encontrado que corresponda aos seus critérios.',
          showingDeals: 'Mostrando {count} de {total} negócios',
          totalGross: 'Total Bruto:',
          backEndTotal: 'Total Back-end:',
          confirmDelete:
            'Tem certeza de que deseja excluir este negócio? Esta ação é irreversível.',
          finalConfirmDelete:
            'Esta é sua confirmação final. O negócio será excluído permanentemente. Continuar?',
          editButton: 'Editar',
          note: 'Estes são seus negócios processados. Você pode editá-los, excluí-los ou alterar seu status.',
          statusOptions: {
            pending: 'Pendente',
            funded: 'Financiado',
            held: 'Retido',
            unwound: 'Cancelado',
            deadDeal: 'Negócio Morto',
          },
          tableHeaders: {
            number: '#',
            lastName: 'Sobrenome',
            dealNumber: 'Número do Negócio',
            stockNumber: 'Número de Estoque',
            date: 'Data',
            vin: 'VIN',
            vehicleType: 'Tipo',
            lender: 'Credor',
            frontEnd: 'Front-End',
            vsc: 'VSC',
            ppm: 'PPM',
            gap: 'GAP',
            tireWheel: 'P&R',
            appearance: 'Aparência',
            theft: 'Roubo',
            bundled: 'Pacote',
            ppd: 'PPD',
            pvr: 'PVR',
            total: 'Total',
            status: 'Status',
            edit: 'Editar',
            delete: 'Excluir',
          },
        },
        dealLog: {
          title: 'Registro de Novo Negócio',
          note: 'Todos os campos marcados com * são obrigatórios. Certifique-se de inserir informações precisas para rastreamento adequado.',
          customerInfo: 'Informações do Cliente',
          dealInfo: 'Informações do Negócio',
          vehicleInfo: 'Informações do Veículo',
          profitInfo: 'Informações de Lucro',
          firstName: 'Nome *',
          lastName: 'Sobrenome *',
          dealNumber: 'Número do Negócio *',
          stockNumber: 'Número de Estoque *',
          vinLast8: 'Últimos 8 do VIN *',
          dealDate: 'Data do Negócio *',
          vehicleType: 'Tipo de Veículo *',
          vehicleTypes: {
            new: 'Novo',
            used: 'Usado',
            cpo: 'CPO',
          },
          lender: 'Credor',
          frontEndGross: 'Front-End Bruto (R$)',
          vscProfit: 'Lucro VSC (R$)',
          ppmProfit: 'Lucro PPM (R$)',
          gapProfit: 'Lucro GAP (R$)',
          tireAndWheelProfit: 'Lucro Pneus & Rodas (R$)',
          appearanceProfit: 'Lucro Aparência (R$)',
          theftProfit: 'Lucro Roubo (R$)',
          bundledProfit: 'Lucro Pacote (R$)',
          dealStatus: 'Status do Negócio',
          saveDeal: 'Salvar Negócio',
          cancel: 'Cancelar',
          success: 'Negócio salvo com sucesso!',
          error: 'Erro ao salvar negócio. Tente novamente.',
          backEndGross: 'Lucro Back-end bruto calculado a partir de lucros individuais de produtos',
          totalGross: 'Lucro total bruto (Front-end + Back-end)',
          salesperson: 'Vendedor',
          salespeople: 'Vendedores',
          selectSalesperson: 'Selecionar vendedor',
          addSalesperson: 'Adicionar vendedor',
          noSalespeople: 'Nenhum vendedor disponível. Adicione-os nas Configurações.',
          validationErrors: {
            firstName: 'O nome é obrigatório',
            lastName: 'O sobrenome é obrigatório',
            dealNumber: 'O número do negócio é obrigatório',
            stockNumber: 'O número de estoque é obrigatório',
            vinLast8: 'Os últimos 8 do VIN são obrigatórios',
            dealDate: 'A data do negócio é obrigatória',
            vehicleType: 'O tipo de veículo é obrigatório',
            lender: 'O credor é obrigatório para este tipo de negócio',
          },
        },
        settings: {
          title: 'Configurações',
          teamManagement: 'Gestão de Equipe',
          payConfiguration: 'Configuração de Pagamentos',
          languageSettings: 'Configurações de Idioma',
          addNewMember: 'Adicionar novo membro da equipe',
          firstName: 'Nome',
          lastName: 'Sobrenome',
          role: 'Função',
          roles: {
            salesperson: 'Vendedor',
            salesManager: 'Gerente de Vendas',
          },
          addMember: 'Adicionar Membro',
          commissionBasePay: 'Comissões e Salário Base',
          commissionRate: 'Taxa de Comissão (%)',
          baseRate: 'Taxa Base Mensal (R$)',
          saveConfiguration: 'Salvar Configuração',
          currentLanguage: 'Idioma Atual',
          selectLanguage: 'Selecionar Idioma',
          languageUpdated: 'Idioma atualizado com sucesso',
        },
      },
    },
  } as Translations,
  gr: {
    nav: {
      home: 'Αρχική',
      screenshots: 'Στιγμιότυπα',
      pricing: 'Τιμολόγηση',
      about: 'Σχετικά με εμάς',
      login: 'Σύνδεση',
      signup: 'Εγγραφή',
      legal: 'Νομικά',
    },
    home: {
      title: 'Το DAS Board',
      subtitle:
        'Πίνακες ελέγχου πραγματικού χρόνου που παρέχουν κρίσιμες πληροφορίες για χρηματοοικονομικούς διευθυντές, αντιπροσωπείες και ομάδες αντιπροσώπων.',
      startTrial: 'Ξεκινήστε τη Δωρεάν Δοκιμή σας',
      signupNow: 'Εγγραφή Τώρα!',
      viewScreenshots: 'Δείτε Στιγμιότυπα',
      mission:
        '"Το DAS Board επαναπροσδιορίζει την επιτυχία των αντιπροσωπειών, ενδυναμώνοντας τους Διευθυντές Πωλήσεων να βελτιστοποιούν τις ομάδες και τους Χρηματοοικονομικούς Διευθυντές να μεγιστοποιούν τα κέρδη με βασικές πληροφορίες πωλήσεων, και τους Πωλητές να παραμένουν στην κορυφή των συμφωνιών τους." - Tyler Durden',
      features: {
        title: 'Βασικά Χαρακτηριστικά',
        subtitle:
          'Όλα όσα χρειάζεστε για να διαχειριστείτε αποτελεσματικά τις λειτουργίες της αντιπροσωπείας σας',
      },
      pricing: {
        title: 'Δοκιμάστε το Τώρα',
        subtitle:
          'Ξεκινήστε τη δωρεάν δοκιμή σας και δείτε τη διαφορά που μπορούν να κάνουν οι πληροφορίες πραγματικού χρόνου για την αντιπροσωπεία σας.',
      },
      pricingTiers: {
        singleFinance: {
          name: 'Μεμονωμένος Χρηματοοικονομικός Διευθυντής',
          price: '$20/μήνα περιορισμένος χρόνος',
          originalPrice: '$29.99/μήνα',
          description:
            'Ιδανικό για μεμονωμένους χρηματοοικονομικούς διευθυντές που θέλουν να παρακολουθούν την προσωπική τους απόδοση',
          features: [
            'Παρακολούθηση προσωπικών συναλλαγών',
            'Αναλύσεις PVR και κερδών προϊόντων',
            'Υπολογιστής πληρωμών',
            'Μετρήσεις απόδοσης',
            'Μπορεί να είναι εκπεστέα από φόρους',
          ],
          buttonText: 'Ξεκινήστε Τώρα!',
          setupTime: 'Δοκιμάστε χωρίς κίνδυνο για έναν πλήρη ημερολογιακό μήνα',
        },
        dealership: {
          name: 'Αντιπροσωπεία / Ομάδα Αντιπροσωπειών',
          price: '$250/mo base',
          description:
            'Πλήρης διαχείριση αντιπροσωπείας με dashboards ειδικά για ρόλους και διαχείριση ομάδας',
          popular: 'Πιο Δημοφιλές',
          features: [
            'Όλες οι λειτουργίες του μεμονωμένου διευθυντή',
            'Dashboards ομάδας για όλους τους ρόλους',
            'Αναλύσεις πολλαπλών τοποθεσιών',
            'Ευέλικτες διοικητικές δομές',
          ],
          buttonText: 'Διαμορφώστε το Πακέτο Σας',
          setupTime: 'Ξεκινήστε σήμερα',
        },
        priceSubtext: 'ανά αντιπροσωπεία + πρόσθετα',
      },
      cta: {
        title: 'Έτοιμοι να μεταμορφώσετε τις λειτουργίες της αντιπροσωπείας σας;',
        subtitle:
          'Ενταχθείτε σε εκατοντάδες αντιπροσωπείες που ήδη χρησιμοποιούν το DAS Board για να βελτιστοποιήσουν τις λειτουργίες τους.',
      },
    },
    features: {
      finance: {
        title: 'Πίνακες Ελέγχου Χρηματοδότησης',
        desc: 'Πληροφορίες πραγματικού χρόνου για χρηματοοικονομικούς διευθυντές για παρακολούθηση καθημερινής απόδοσης, καταγραφή συμφωνιών, προβολή μετρήσεων συμπεριλαμβανομένων PVR, VSC και άλλων Προϊόντων.',
      },
      sales: {
        title: 'Πίνακες Ελέγχου Ομάδας Πωλήσεων',
        desc: "Το Das Board είναι ο νέος σας Πίνακας Κατάταξης! Παρακολουθήστε τις συμφωνίες σας και να ξέρετε ακριβώς που βρίσκεστε καθ' όλη τη διάρκεια του μήνα.",
      },
      manager: {
        title: 'Πίνακες Ελέγχου Διευθυντή Πωλήσεων',
        desc: 'Προβολή Αρχείων Συμφωνιών, στατιστικών Πωλητών, διαχείριση των Ομάδων σας πιο αποτελεσματικά.',
      },
      info: {
        title: 'Ενημερωτικοί Πίνακες Ελέγχου',
        desc: 'Πίνακες ελέγχου ειδικά για ρόλους για Ομάδες Πωλήσεων, Χρηματοοικονομικούς Διευθυντές, Διευθυντές Πωλήσεων και Γενικούς Διευθυντές.',
      },
      scheduler: {
        title: 'Δυναμικός Προγραμματιστής',
        desc: 'Δυναμικός προγραμματιστής πωλητών για αποτελεσματικό συντονισμό ομάδας. Διαχειριστείτε προγράμματα για μεγιστοποίηση της καθημερινής παραγωγής.',
      },
      calculator: {
        title: 'Υπολογιστής Αμοιβών',
        desc: 'Η Ομάδα Πωλήσεων και οι Χρηματοοικονομικοί Διευθυντές σας θα μπορούν να βλέπουν τα κέρδη του μήνα μέχρι σήμερα σε πραγματικό χρόνο με προ-διαμορφωμένα σχέδια αμοιβών.',
      },
    },
    screenshots: {
      title: 'Δείτε το DAS Board σε Δράση',
      subtitle:
        'Ρίξτε μια ματιά στους διαισθητικούς πίνακες ελέγχου μας που σχεδιάστηκαν για επαγγελματίες του αυτοκινήτου.',
      finance: {
        title: 'Πίνακας Ελέγχου Χρηματοοικονομικού Διευθυντή',
        desc: 'Παρακολουθήστε συμφωνίες, PVR, VSC μετρήσεις και καθημερινή απόδοση σε πραγματικό χρόνο.',
      },
      sales: {
        title: 'Πίνακας Ελέγχου Πωλήσεων',
        desc: 'Ο προσωπικός σας πίνακας κατάταξης που δείχνει συμφωνίες, κατατάξεις και μηνιαία πρόοδο.',
      },
      manager: {
        title: 'Πίνακας Ελέγχου Διευθυντή Πωλήσεων',
        desc: 'Περιεκτική επισκόπηση ομάδας με αρχεία συμφωνιών και αναλυτικά στοιχεία απόδοσης.',
      },
      gm: {
        title: 'Πίνακας Ελέγχου Γενικού Διευθυντή',
        desc: 'Υψηλού επιπέδου πληροφορίες για την απόδοση της αντιπροσωπείας και την παραγωγικότητα της ομάδας.',
      },
    },
    pricing: {
      title: 'Επιλέξτε το Τέλειο Σχέδιο',
      subtitle:
        'Ξεκινήστε με τη δωρεάν δοκιμή μας για χρηματοοικονομικούς διευθυντές, ή επιλέξτε το σχέδιο που κλιμακώνεται με την αντιπροσωπεία σας.',
      finance: 'Χρηματοοικονομικός Διευθυντής',
      dealership: 'Μεμονωμένη Αντιπροσωπεία',
      group: 'Ομάδες Αντιπροσώπων',
      freeTime: 'Δωρεάν για Περιορισμένο Χρόνο!',
      getStarted: 'Ξεκινήστε',
      startTrial: 'Ξεκινήστε Δωρεάν Δοκιμή',
      popular: 'Πιο Δημοφιλές',
      viewDetails: 'Δείτε Πλήρεις Λεπτομέρειες Τιμολόγησης →',
      tiers: {
        finance: {
          name: 'Χρηματοοικονομικοί Διευθυντές',
          price: 'Δωρεάν για Περιορισμένο Χρόνο!',
          originalPrice: '5€/Μήνα',
          description: 'Παρακολουθήστε τις Συμφωνίες, Προϊόντα, PVR και Αμοιβές σας!',
        },
        dealership: {
          name: 'Αντιπροσωπείες',
          price: '250€/μήνα',
          description: 'Για έως 15 χρήστες με πλήρη πρόσβαση αντιπροσωπείας.',
        },
        group: {
          name: 'Ομάδες Αντιπροσώπων',
          price: '500€/μήνα',
          description: 'Υποστήριξη πολλαπλών αντιπροσωπειών για ομάδες αντιπροσώπων.',
        },
      },
    },
    about: {
      title: 'Ποιοι Είμαστε',
      subtitle:
        'Παθιασμένοι επαγγελματίες αφοσιωμένοι στην επανάσταση της διαχείρισης αντιπροσωπειών μέσω καινοτόμου τεχνολογίας και πληροφοριών βασισμένων σε δεδομένα.',
      founderVision: {
        title: 'Γιατί Δημιούργησα το DAS Board – Tyler Durden, CEO και Ιδρυτής',
        paragraph1:
          'Με πάνω από 27 χρόνια εμπειρίας στη βιομηχανία αντιπροσωπειών αυτοκινήτων, έχω δει από πρώτο χέρι τις προκλήσεις που αντιμετωπίζουν οι διευθυντές στην εξισορρόπηση των ρόλων τους ως ηγέτες και εκτελεστές. Ως έμπειρος επαγγελματίας, ίδρυσα το DAS Board για να αντιμετωπίσω ένα κρίσιμο κενό που παρατήρησα: ενώ οι Διευθυντές Πωλήσεων διαπρέπουν στην πώληση αυτοκινήτων, συχνά δυσκολεύονται να διαχειριστούν αποτελεσματικά τις ομάδες πωλήσεων τους.',
        paragraph2:
          'Πιστεύω ότι οι ενημερωμένοι, παρακινημένοι και καλά υποστηριζόμενοι πωλητές είναι το κλειδί για εξαιρετικά αποτελέσματα—υπερβαίνοντας κατά πολύ τα αποτελέσματα των απομακρυσμένων ή μη ενημερωμένων ομάδων. Το DAS Board ενδυναμώνει τους Διευθυντές Πωλήσεων με διαισθητικά εργαλεία για να ηγούνται των ομάδων τους πιο αποτελεσματικά, διασφαλίζοντας ότι μπορούν να εστιάσουν τόσο στην ανάπτυξη της ομάδας όσο και στην αριστεία πωλήσεων.',
        paragraph3:
          'Πέρα από τις πωλήσεις, η εφαρμογή υποστηρίζει τους Χρηματοοικονομικούς Διευθυντές παρέχοντας πληροφορίες πραγματικού χρόνου για την κερδοφορία συμφωνιών και βασικές μετρήσεις, ενώ προσφέρει στους GMs εφαρμόσιμες αναφορές για την καθοδήγηση στρατηγικών αποφάσεων. Το όραμά μου με το DAS Board είναι να επαναστατήσω τη διαχείριση αντιπροσωπειών, προωθώντας μια κουλτούρα αποδοτικότητας, διαφάνειας και επιτυχίας σε όλα τα επίπεδα του οργανισμού.',
      },
      team: {
        title: 'Η Ομάδα μας',
        members: {
          tyler: {
            name: 'Tyler Durden',
            role: 'CEO & Ιδρυτής',
            bio: 'Βασιζόμενος σε εκτεταμένη εμπειρία στη διαχείριση αντιπροσωπειών, ο Tyler Durden ίδρυσε το DAS Board για να προωθήσει μια κουλτούρα όπου οι ενημερωμένοι και παρακινημένοι εργαζόμενοι ευδοκιμούν, οδηγώντας την παραγωγικότητα μέσω διαφανών, βασισμένων σε δεδομένα εργαλείων που ενδυναμώνουν τις αυτοκινητιστικές ομάδες.',
          },
          sarah: {
            name: 'Sarah Conner',
            role: 'Διευθύντρια Προϊόντος',
            bio: 'Με πάνω από 25 χρόνια εμπειρίας σε αντιπροσωπείες και λιανικό εμπόριο, η Sarah Conner φέρνει βαθιές γνώσεις για την επίτευξη επιτυχίας πωλήσεων. Κατανοεί τη δύναμη των αποτελεσματικών εργαλείων και της ειδικευμένης διαχείρισης για να εμπνεύσει ομάδες, διασφαλίζοντας ότι το DAS Board οδηγεί σε εξαιρετικά αποτελέσματα για τις αντιπροσωπείες.',
          },
          claude: {
            name: 'Claude Sonnet',
            role: 'Διευθυντής Τεχνολογίας',
            bio: 'Ο Claude Sonnet φέρνει βαθιά εμπειρογνωμοσύνη στη δημιουργία λογισμικού που διαπρέπει, με εστίαση σε κλιμακώσιμες, ασφαλείς πλατφόρμες. Η ικανότητά του να παρέχει πληροφορίες χωρίς πολυπλοκότητα διασφαλίζει ότι το DAS Board παρέχει απρόσκοπτη, αξιόπιστη τεχνολογία για αντιπροσωπείες.',
          },
          annie: {
            name: 'Annie Porter',
            role: 'Διευθύντρια Επιτυχίας Πελατών',
            bio: 'Αφοσιωμένη στο να διασφαλίσει ότι κάθε πελάτης του DAS Board αποκομίζει τα μέγιστα από την πλατφόρμα μας μέσω εξατομικευμένης εισαγωγής και υποστήριξης',
          },
        },
      },
      values: {
        title: 'Οι Αξίες μας',
        customerFocused: {
          title: 'Εστιασμένοι στον Πελάτη',
          description:
            'Ενδυναμώνουμε τις αυτοκινητιστικές αντιπροσωπείες με διαισθητικούς πίνακες ελέγχου που δίνουν προτεραιότητα στις μοναδικές τους ανάγκες, διασφαλίζοντας απρόσκοπτη διαχείριση και βελτιωμένες εμπειρίες πελατών.',
        },
        dataDriven: {
          title: 'Βασισμένοι σε Δεδομένα',
          description:
            'Η πλατφόρμα μας παρέχει εφαρμόσιμες πληροφορίες πραγματικού χρόνου από δεδομένα αντιπροσωπειών, επιτρέποντας ακριβή λήψη αποφάσεων για την ενίσχυση των πωλήσεων και της λειτουργικής αποδοτικότητας.',
        },
        continuousImprovement: {
          title: 'Συνεχής Βελτίωση',
          description:
            'Βελτιώνουμε αδιάκοπα τα εργαλεία μας για να βοηθήσουμε τις αντιπροσωπείες να βελτιστοποιήσουν την απόδοση, να προσαρμοστούν στις τάσεις της βιομηχανίας και να επιτύχουν βιώσιμη ανάπτυξη.',
        },
      },
      contact: {
        title: 'Επικοινωνήστε μαζί μας',
        subtitle:
          'Έτοιμοι να δείτε πώς το DAS Board μπορεί να μεταμορφώσει τις λειτουργίες της αντιπροσωπείας σας; Θα θέλαμε να ακούσουμε από εσάς.',
        email: 'Email',
        phone: 'Τηλέφωνο',
      },
    },
    signup: {
      title: 'Εγγραφείτε στο DAS Board',
      subtitle: 'Ξεκινήστε σήμερα με τη λύση διαχείρισης αντιπροσωπείας σας.',
      selectLanguage: 'Επιλέξτε τη γλώσσα σας',
      dealerGroup: 'Εγγραφή Ομάδας Αντιπροσώπων',
      dealership: 'Εγγραφή Αντιπροσωπείας',
      financeManager: 'Εγγραφή Χρηματοοικονομικού Διευθυντή',
      form: {
        firstName: 'Όνομα',
        lastName: 'Επώνυμο',
        email: 'Διεύθυνση Email',
        password: 'Κωδικός Πρόσβασης',
        confirmPassword: 'Επιβεβαίωση Κωδικού Πρόσβασης',
        dealershipName: 'Όνομα Αντιπροσωπείας',
        role: 'Ο Ρόλος σας',
        phone: 'Αριθμός Τηλεφώνου',
        submit: 'Δημιουργία Λογαριασμού',
        alreadyHave: 'Έχετε ήδη λογαριασμό;',
        signIn: 'Σύνδεση',
        terms: 'Συμφωνώ με τους όρους χρήσης και την πολιτική απορρήτου',
      },
    },
    common: {
      language: 'Γλώσσα',
      login: 'Σύνδεση',
      signUp: 'Εγγραφή',
      loading: 'Φόρτωση...',
      save: 'Αποθήκευση',
      cancel: 'Ακύρωση',
      continue: 'Συνέχεια',
      back: 'Πίσω',
      next: 'Επόμενο',
      submit: 'Υποβολή',
      close: 'Κλείσιμο',
    },
    footer: {
      tagline: 'Σύγχρονο λογισμικό διαχείρισης αντιπροσωπειών με πληροφορίες πραγματικού χρόνου.',
      industry: 'Πωλήσεις Αυτοκινήτων Αντιπροσωπειών',
      product: 'Προϊόν',
      legal: 'Νομικά',
      contact: 'Επικοινωνία',
      support: 'Για υποστήριξη ή ερωτήσεις, παρακαλώ επικοινωνήστε μαζί μας στο:',
      copyright: '© 2025 Το DAS Board. Όλα τα δικαιώματα διατηρούνται. Σχεδιάστηκε με 🖤',
      terms: 'Όροι Χρήσης',
      privacy: 'Πολιτική Απορρήτου',
      subscription: 'Συμφωνία Συνδρομής',
      home: 'Αρχική',
      screenshots: 'Στιγμιότυπα',
      pricing: 'Τιμολόγηση',
      aboutUs: 'Σχετικά με εμάς',
    },
    currency: {
      symbol: '€',
      name: 'EUR',
    },
    legal: {
      terms: {
        title: 'Όροι Χρήσης',
        lastUpdated: 'Τελευταία ενημέρωση: 6/28/2025',
        intro:
          'Καλώς ήρθατε στο The DAS Board. Αυτοί οι Όροι Χρήσης ("Όροι") διέπουν την πρόσβασή σας και τη χρήση της πλατφόρμας λογισμικού διαχείρισης αντιπροσωπειών μας. Με την πρόσβαση ή τη χρήση των υπηρεσιών μας, συμφωνείτε να δεσμεύεστε από αυτούς τους Όρους.',
        sections: {
          acceptance: {
            title: '1. Αποδοχή των Όρων',
            content:
              'Δημιουργώντας έναν λογαριασμό, αποκτώντας πρόσβαση ή χρησιμοποιώντας το The DAS Board, αναγνωρίζετε ότι έχετε διαβάσει, κατανοήσει και συμφωνείτε να δεσμεύεστε από αυτούς τους Όρους και την Πολιτική Απορρήτου μας. Εάν δεν συμφωνείτε με αυτούς τους Όρους, δεν μπορείτε να χρησιμοποιήσετε τις υπηρεσίες μας. Πρέπει να είστε τουλάχιστον 18 ετών και να έχετε την εξουσία να συνάψετε αυτούς τους Όρους εκ μέρους του οργανισμού σας.',
          },
          service: {
            title: '2. Περιγραφή Υπηρεσίας',
            content:
              'Το The DAS Board είναι μια πλατφόρμα λογισμικού διαχείρισης αντιπροσωπειών βασισμένη στο cloud που παρέχει εργαλεία για διαχείριση αποθέματος, παρακολούθηση πωλήσεων, διαχείριση σχέσεων πελατών, οικονομική αναφορά και σχετικές υπηρεσίες της αυτοκινητοβιομηχανίας. Διατηρούμε το δικαίωμα να τροποποιήσουμε, να αναστείλουμε ή να διακόψουμε οποιαδήποτε πτυχή της υπηρεσίας μας με εύλογη ειδοποίηση.',
          },
          account: {
            title: '3. Εγγραφή Λογαριασμού και Ασφάλεια',
            content:
              'Για να χρησιμοποιήσετε τις υπηρεσίες μας, πρέπει να δημιουργήσετε έναν λογαριασμό με ακριβείς και πλήρεις πληροφορίες. Είστε υπεύθυνοι για:',
            items: [
              'Τη διατήρηση της εμπιστευτικότητας των διαπιστευτηρίων του λογαριασμού σας',
              'Όλες τις δραστηριότητες που πραγματοποιούνται στον λογαριασμό σας',
              'Την άμεση ειδοποίησή μας για οποιαδήποτε μη εξουσιοδοτημένη χρήση',
              'Να διασφαλίζετε ότι οι πληροφορίες του λογαριασμού σας παραμένουν ενημερωμένες και ακριβείς',
              'Τη συμμόρφωση με τις απαιτήσεις ασφαλείας μας και τις βέλτιστες πρακτικές',
            ],
          },
          subscription: {
            title: '4. Όροι Συνδρομής και Πληρωμής',
            content: 'Το The DAS Board λειτουργεί με βάση τη συνδρομή. Συνδρομή, συμφωνείτε σε:',
            items: [
              'Πληρωμή όλων των τελών που σχετίζονται με το πλάνο συνδρομής σας',
              'Αυτόματη ανανέωση εκτός εάν ακυρωθεί πριν την ημερομηνία ανανέωσης',
              'Αλλαγές τελών με προειδοποίηση 30 ημερών',
              'Καμία επιστροφή χρημάτων για μερικές περιόδους συνδρομής',
              'Αναστολή υπηρεσίας για μη πληρωμή μετά από εύλογη ειδοποίηση',
            ],
          },
          usage: {
            title: '5. Πολιτική Αποδεκτής Χρήσης',
            content:
              'Συμφωνείτε να χρησιμοποιήσετε το The DAS Board μόνο για νόμιμους σκοπούς και σύμφωνα με αυτούς τους Όρους. Δεν μπορείτε να:',
            items: [
              'Παραβιάζετε ισχύοντες νόμους, κανονισμούς ή δικαιώματα τρίτων',
              'Ανεβάζετε βλαβερό, προσβλητικό ή ακατάλληλο περιεχόμενο',
              'Επιχειρείτε να αποκτήσετε μη εξουσιοδοτημένη πρόσβαση στα συστήματά μας ή τους λογαριασμούς άλλων χρηστών',
              'Χρησιμοποιείτε την υπηρεσία για αποστολή spam, κακόβουλου λογισμικού ή άλλου κακόβουλου περιεχομένου',
              'Πραγματοποιείτε reverse engineering, αποσυμπίληση ή επιχειρείτε να εξάγετε πηγαίο κώδικα',
              'Παρεμβαίνετε ή διακόπτετε την ακεραιότητα ή την απόδοση των υπηρεσιών μας',
              'Χρησιμοποιείτε την πλατφόρμα για δόλιες ή παράνομες δραστηριότητες',
            ],
          },
          intellectual: {
            title: '6. Δικαιώματα Πνευματικής Ιδιοκτησίας',
            content:
              'Το The DAS Board και όλες οι σχετικές τεχνολογίες, περιεχόμενο και υλικά είναι ιδιοκτησία μας ή των αδειοδοτών μας. Αυτό περιλαμβάνει:',
            items: [
              'Λογισμικό, αλγορίθμους και διεπαφές χρήστη',
              'Εμπορικά σήματα, λογότυπα και υλικά επωνυμίας',
              'Τεκμηρίωση, οδηγούς και υλικά υποστήριξης',
              'Αναλύσεις, αναφορές και συγκεντρωτικές πληροφορίες δεδομένων',
            ],
            footer:
              'Διατηρείτε την κυριότητα των δεδομένων σας αλλά μας παρέχετε άδεια χρήσης τους για την παροχή των υπηρεσιών μας. Μπορούμε να χρησιμοποιήσουμε ανωνυμοποιημένα, συγκεντρωτικά δεδομένα για βιομηχανική έρευνα και βελτίωση της πλατφόρμας.',
          },
          privacy: {
            title: '7. Προστασία Δεδομένων και Απόρρητο',
            content:
              'Είστε υπεύθυνοι για να διασφαλίσετε ότι οποιαδήποτε προσωπικά δεδομένα επεξεργάζεστε μέσω της πλατφόρμας μας συμμορφώνονται με τους ισχύοντες νόμους απορρήτου. Θα επεξεργαστούμε δεδομένα σύμφωνα με την Πολιτική Απορρήτου μας και τους ισχύοντες κανονισμούς προστασίας δεδομένων, συμπεριλαμβανομένου του GDPR και CCPA όπου εφαρμόζεται.',
          },
          availability: {
            title: '8. Διαθεσιμότητα Υπηρεσίας και Υποστήριξη',
            content:
              'Ενώ προσπαθούμε για υψηλή διαθεσιμότητα, δεν εγγυόμαστε αδιάκοπη υπηρεσία. Παρέχουμε:',
            items: [
              '99,9% SLA χρόνου λειτουργίας για πληρωμένες συνδρομές',
              'Τακτικά παράθυρα συντήρησης με προειδοποίηση',
              'Τεχνική υποστήριξη βασισμένη στο επίπεδο συνδρομής σας',
              'Παρακολούθηση ασφαλείας και απόκριση σε περιστατικά',
            ],
          },
          termination: {
            title: '9. Καταγγελία',
            content: 'Οποιοδήποτε μέρος μπορεί να καταγγείλει αυτούς τους Όρους:',
            items: [
              'Μπορείτε να ακυρώσετε τη συνδρομή σας οποιαδήποτε στιγμή μέσω των ρυθμίσεων λογαριασμού σας',
              'Μπορούμε να καταγγείλουμε για παραβίαση αυτών των Όρων με εύλογη ειδοποίηση',
              'Μπορούμε να αναστείλουμε την υπηρεσία άμεσα για σοβαρές παραβιάσεις ή απειλές ασφαλείας',
              'Με την καταγγελία, θα χάσετε πρόσβαση στην πλατφόρμα και τα δεδομένα σας',
              'Θα παρέχουμε εύλογη ευκαιρία για εξαγωγή των δεδομένων σας πριν τη διαγραφή',
            ],
          },
          disclaimers: {
            title: '10. Αποποιήσεις Ευθύνης και Περιορισμοί Ευθύνης',
            content:
              'ΤΟ THE DAS BOARD ΠΑΡΕΧΕΤΑΙ "ΩΣ ΕΧΕΙ" ΧΩΡΙΣ ΕΓΓΥΗΣΕΙΣ ΟΠΟΙΟΥΔΗΠΟΤΕ ΕΙΔΟΥΣ. ΣΤΟ ΜΕΓΙΣΤΟ ΒΑΘΜΟ ΠΟΥ ΕΠΙΤΡΕΠΕΤΑΙ ΑΠΟ ΤΟ ΝΟΜΟ:',
            items: [
              'Αποποιούμαστε όλες τις εγγυήσεις, ρητές ή συνεπαγόμενες, συμπεριλαμβανομένης της εμπορευσιμότητας και καταλληλότητας για συγκεκριμένο σκοπό',
              'Δεν ευθυνόμαστε για έμμεσες, τυχαίες, ειδικές ή συνεπαγόμενες ζημίες',
              'Η συνολική ευθύνη μας δεν θα υπερβαίνει τα τέλη που πληρώσατε τους 12 μήνες πριν την αξίωση',
              'Αναγνωρίζετε ότι το λογισμικό μπορεί να περιέχει σφάλματα και συμφωνείτε να τα αναφέρετε άμεσα',
            ],
          },
          indemnification: {
            title: '11. Αποζημίωση',
            content:
              'Συμφωνείτε να μας αποζημιώσετε και να μας απαλλάξετε από οποιεσδήποτε αξιώσεις, απώλειες ή ζημίες που προκύπτουν από τη χρήση των υπηρεσιών μας, παραβίαση αυτών των Όρων ή παραβίαση δικαιωμάτων τρίτων.',
          },
          governing: {
            title: '12. Εφαρμοστέο Δίκαιο και Επίλυση Διαφορών',
            content:
              'Αυτοί οι Όροι διέπονται από τους νόμους της [Δικαιοδοσίας] χωρίς να λαμβάνονται υπόψη οι αρχές σύγκρουσης νόμων. Οποιεσδήποτε διαφορές θα επιλυθούν μέσω δεσμευτικής διαιτησίας, εκτός από αξιώσεις ασφαλιστικών μέτρων που μπορούν να προσφύγουν στα κατάλληλα δικαστήρια.',
          },
          changes: {
            title: '13. Αλλαγές στους Όρους',
            content:
              'Μπορούμε να τροποποιήσουμε αυτούς τους Όρους κατά καιρούς. Θα παρέχουμε ειδοποίηση για ουσιώδεις αλλαγές τουλάχιστον 30 ημέρες εκ των προτέρων. Η συνεχιζόμενη χρήση των υπηρεσιών μας μετά την έναρξη ισχύος των αλλαγών συνιστά αποδοχή των αναθεωρημένων Όρων.',
          },
          entire: {
            title: '14. Πλήρης Συμφωνία',
            content:
              'Αυτοί οι Όροι, μαζί με την Πολιτική Απορρήτου μας και οποιεσδήποτε πρόσθετες συμφωνίες, αποτελούν την πλήρη συμφωνία μεταξύ σας και του The DAS Board σχετικά με τη χρήση των υπηρεσιών μας.',
          },
          contact: {
            title: '15. Στοιχεία Επικοινωνίας',
            content:
              'Εάν έχετε ερωτήσεις σχετικά με αυτούς τους Όρους, παρακαλώ επικοινωνήστε μαζί μας:',
            email: 'legal@thedasboard.com',
            address: '[Διεύθυνση Εταιρείας]',
            phone: '[Αριθμός Τηλεφώνου Υποστήριξης]',
          },
        },
      },
      privacy: {
        title: 'Πολιτική Απορρήτου',
        lastUpdated: 'Τελευταία Ενημέρωση: 28/6/2025',
        intro:
          'Αυτή η Πολιτική Απορρήτου περιγράφει πώς το The DAS Board ("εμείς", "μας" ή "μας") συλλέγει, χρησιμοποιεί και προστατεύει τις προσωπικές σας πληροφορίες όταν χρησιμοποιείτε την πλατφόρμα λογισμικού διαχείρισης αντιπροσωπειών μας. Δεσμευόμαστε να προστατεύουμε το απόρρητό σας και να χειριζόμαστε τα δεδομένα σας με υπευθυνότητα.',
        sections: {
          collection: {
            title: '1. Πληροφορίες που Συλλέγουμε',
            content:
              'Όταν χρησιμοποιείτε το The DAS Board, συλλέγουμε διάφορους τύπους πληροφοριών για να παρέχουμε και να βελτιώνουμε τις υπηρεσίες μας:',
            items: [
              '<strong>Στοιχεία Λογαριασμού:</strong> Όνομα, διεύθυνση email, αριθμός τηλεφώνου, όνομα εταιρείας, θέση εργασίας και στοιχεία χρέωσης',
              '<strong>Δεδομένα Αντιπροσωπείας:</strong> Απόθεμα οχημάτων, αρχεία πωλήσεων, πληροφορίες πελατών και χρηματοοικονομικές συναλλαγές',
              '<strong>Δεδομένα Χρήσης:</strong> Χαρακτηριστικά που προσπελάστηκαν, χρόνος που περάστηκε στην πλατφόρμα, αλληλεπιδράσεις χρήστη και μετρήσεις απόδοσης',
              '<strong>Τεχνικά Δεδομένα:</strong> Διεύθυνση IP, τύπος φυλλομετρητή, πληροφορίες συσκευής, λειτουργικό σύστημα και αρχεία πρόσβασης',
              '<strong>Δεδομένα Επικοινωνίας:</strong> Αιτήματα υποστήριξης, σχόλια και αλληλογραφία με την ομάδα μας',
              '<strong>Δεδομένα Τοποθεσίας:</strong> Διευθύνσεις αντιπροσωπείας και, με συναίνεση, τοποθεσία συσκευής για λειτουργίες κινητού',
            ],
          },
          usage: {
            title: '2. Πώς Χρησιμοποιούμε τις Πληροφορίες σας',
            content:
              'Χρησιμοποιούμε τις συλλεχθείσες πληροφορίες για νόμιμους επιχειρηματικούς σκοπούς, συμπεριλαμβανομένων:',
            items: [
              'Παροχή, συντήρηση και βελτίωση της πλατφόρμας και χαρακτηριστικών του The DAS Board',
              'Επεξεργασία συνδρομών, πληρωμών και διαχείριση του λογαριασμού σας',
              'Δημιουργία αναλύσεων, αναφορών και επιχειρηματικών πληροφοριών για την αντιπροσωπεία σας',
              'Παροχή υποστήριξης πελατών και απάντηση στις ερωτήσεις σας',
              'Αποστολή ενημερώσεων υπηρεσίας, ειδοποιήσεων ασφαλείας και διοικητικών μηνυμάτων',
              'Εντοπισμός, πρόληψη και αντιμετώπιση τεχνικών προβλημάτων και απειλών ασφαλείας',
              'Συμμόρφωση με νομικές υποχρεώσεις και κανονισμούς του κλάδου',
              'Βελτίωση της εμπειρίας χρήστη μέσω ανάπτυξης προϊόντος και έρευνας',
            ],
          },
          sharing: {
            title: '3. Κοινή Χρήση των Πληροφοριών σας',
            content:
              'Δεν πουλάμε, ενοικιάζουμε ή ανταλλάσσουμε τις προσωπικές σας πληροφορίες. Μπορούμε να μοιραστούμε τις πληροφορίες σας μόνο στις ακόλουθες περιστάσεις:',
            items: [
              '<strong>Παροχείς Υπηρεσιών:</strong> Τρίτοι πωλητές που μας βοηθούν να λειτουργούμε την πλατφόρμα μας (φιλοξενία, αναλυτικά, επεξεργασία πληρωμών)',
              '<strong>Επιχειρηματικοί Εταίροι:</strong> Εξουσιοδοτημένες ενοποιήσεις και εταίροι της αυτοκινητοβιομηχανίας με τη ρητή συναίνεσή σας',
              '<strong>Νομικές Απαιτήσεις:</strong> Όταν απαιτείται από νόμο, κανονισμό ή έγκυρη νομική διαδικασία',
              '<strong>Επιχειρηματικές Μεταφορές:</strong> Σε σχέση με συγχωνεύσεις, εξαγορές ή πωλήσεις περιουσιακών στοιχείων (με ειδοποίηση)',
              '<strong>Ασφάλεια και Προστασία:</strong> Για την προστασία των δικαιωμάτων, περιουσίας ή ασφάλειας των χρηστών μας ή του κοινού',
            ],
          },
          retention: {
            title: '4. Διατήρηση Δεδομένων',
            content:
              'Διατηρούμε τις προσωπικές σας πληροφορίες για όσο χρόνο είναι απαραίτητο για την παροχή των υπηρεσιών μας και την συμμόρφωση με νομικές υποχρεώσεις. Συγκεκριμένα:',
            items: [
              'Τα δεδομένα λογαριασμού διατηρούνται ενώ η συνδρομή σας είναι ενεργή και για 3 χρόνια μετά τη λήξη',
              'Τα αρχεία συναλλαγών διατηρούνται για 7 χρόνια για συμμόρφωση με χρηματοοικονομικούς κανονισμούς',
              'Τα αρχεία χρήσης διατηρούνται για 2 χρόνια για ανάλυση ασφαλείας και απόδοσης',
              'Τα αρχεία επικοινωνίας διατηρούνται για 5 χρόνια για σκοπούς εξυπηρέτησης πελατών',
            ],
          },
          rights: {
            title: '5. Τα Δικαιώματα και Επιλογές σας',
            content:
              'Ανάλογα με την τοποθεσία σας, μπορεί να έχετε τα ακόλουθα δικαιώματα σχετικά με τις προσωπικές σας πληροφορίες:',
            items: [
              '<strong>Πρόσβαση:</strong> Αίτημα αντιγράφου των προσωπικών σας πληροφοριών που κατέχουμε',
              '<strong>Διόρθωση:</strong> Ενημέρωση ή διόρθωση ανακριβών προσωπικών πληροφοριών',
              '<strong>Διαγραφή:</strong> Αίτημα διαγραφής των προσωπικών σας πληροφοριών (υπόκειται σε νομικές υποχρεώσεις)',
              '<strong>Φορητότητα:</strong> Λήψη των δεδομένων σας σε μορφή αναγνώσιμη από μηχανή',
              '<strong>Περιορισμός:</strong> Περιορισμός του τρόπου επεξεργασίας των προσωπικών σας πληροφοριών',
              '<strong>Αντίρρηση:</strong> Αντίρρηση στην επεξεργασία βάσει νόμιμων συμφερόντων',
            ],
          },
          cookies: {
            title: '6. Cookies και Τεχνολογίες Παρακολούθησης',
            content:
              'Χρησιμοποιούμε cookies και παρόμοιες τεχνολογίες για να βελτιώσουμε την εμπειρία σας:',
            items: [
              '<strong>Βασικά Cookies:</strong> Απαιτούνται για τη λειτουργικότητα και ασφάλεια της πλατφόρμας',
              '<strong>Αναλυτικά Cookies:</strong> Μας βοηθούν να κατανοήσουμε πώς χρησιμοποιείτε την πλατφόρμα μας',
              '<strong>Cookies Προτιμήσεων:</strong> Θυμούνται τις ρυθμίσεις και προσαρμογές σας',
              '<strong>Cookies Μάρκετινγκ:</strong> Χρησιμοποιούνται για στοχευμένες επικοινωνίες (με τη συναίνεσή σας)',
            ],
            footer:
              'Μπορείτε να ελέγξετε τις προτιμήσεις cookies μέσω των ρυθμίσεων του φυλλομετρητή σας ή του εργαλείου διαχείρισης cookies μας.',
          },
          security: {
            title: '7. Μέτρα Ασφαλείας',
            content:
              'Εφαρμόζουμε βιομηχανικά πρότυπα μέτρα ασφαλείας για την προστασία των πληροφοριών σας, συμπεριλαμβανομένων:',
            items: [
              'Κρυπτογράφηση δεδομένων σε μετάδοση και σε ηρεμία χρησιμοποιώντας πρότυπα AES-256',
              'Τακτικοί έλεγχοι ασφαλείας και δοκιμές διείσδυσης',
              'Πολυπαραγοντική ταυτοποίηση και έλεγχοι πρόσβασης',
              'Συμμόρφωση SOC 2 Type II και τακτικές αξιολογήσεις ασφαλείας',
              'Εκπαίδευση υπαλλήλων σχετικά με την προστασία δεδομένων και τις καλύτερες πρακτικές ασφαλείας',
            ],
          },
          international: {
            title: '8. Διεθνείς Μεταφορές Δεδομένων',
            content:
              'Οι πληροφορίες σας μπορεί να μεταφερθούν και να επεξεργαστούν σε χώρες άλλες από τη δική σας. Διασφαλίζουμε ότι κατάλληλες διασφαλίσεις είναι σε ισχύ, συμπεριλαμβανομένων Τυποποιημένων Συμβατικών Ρητρών και αποφάσεων επάρκειας, για την προστασία των δεδομένων σας κατά τις διεθνείς μεταφορές.',
          },
          children: {
            title: '9. Απόρρητο Παιδιών',
            content:
              'Το The DAS Board δεν προορίζεται για χρήση από άτομα κάτω των 18 ετών. Δεν συλλέγουμε εν γνώσει μας προσωπικές πληροφορίες από παιδιά κάτω των 18 ετών. Εάν λάβουμε γνώση τέτοιας συλλογής, θα διαγράψουμε τις πληροφορίες άμεσα.',
          },
          changes: {
            title: '10. Αλλαγές σε αυτή την Πολιτική Απορρήτου',
            content:
              'Μπορούμε να ενημερώνουμε αυτή την Πολιτική Απορρήτου περιοδικά για να αντικατοπτρίζουμε αλλαγές στις πρακτικές μας ή νομικές απαιτήσεις. Θα σας ειδοποιήσουμε για σημαντικές αλλαγές μέσω email ή ειδοποίησης πλατφόρμας τουλάχιστον 30 ημέρες πριν τεθούν σε ισχύ.',
          },
          contact: {
            title: '11. Επικοινωνήστε μαζί μας',
            content:
              'Εάν έχετε ερωτήσεις σχετικά με αυτή την Πολιτική Απορρήτου ή θέλετε να ασκήσετε τα δικαιώματά σας, παρακαλούμε επικοινωνήστε μαζί μας:',
            email: 'privacy@thedasboard.com',
            address: '[Company Address]',
            phone: '[Support Phone Number]',
          },
        },
      },
      subscription: {
        title: 'Συμφωνία Συνδρομής',
        lastUpdated: 'Τελευταία ενημέρωση: 6/28/2025',
        intro:
          'Αυτή η Συμφωνία Συνδρομής διέπει τη συνδρομή σας και τη χρήση της πλατφόρμας διαχείρισης αντιπροσωπειών The DAS Board.',
        sections: {
          plans: {
            title: '1. Πλάνα συνδρομής',
            content:
              'Το The DAS Board προσφέρει επίπεδα συνδρομής σχεδιασμένα για διαφορετικές ανάγκες αντιπροσωπειών:',
            items: [
              '<strong>60ήμερη δωρεάν δοκιμή:</strong> Πλήρης πρόσβαση στην πλατφόρμα χωρίς απαιτούμενη πιστωτική κάρτα',
              '<strong>Διαχειριστής χρηματοδότησης:</strong> Ατομική πρόσβαση χρήστη με βασικά χρηματοοικονομικά εργαλεία',
              '<strong>Αντιπροσωπεία:</strong> Πρόσβαση πολλών χρηστών με πλήρη διαχείριση αποθέματος και πωλήσεων',
              '<strong>Ομάδα αντιπροσωπειών:</strong> Πρόσβαση επιχειρηματικού επιπέδου σε πολλές τοποθεσίες',
            ],
            footer:
              'Οι συνδρομές χρεώνονται μηνιαίως εκ των προτέρων. Μπορείτε να αναβαθμίσετε ή να υποβαθμίσετε τη συνδρομή σας οποιαδήποτε στιγμή, με τις αλλαγές να ισχύουν στον επόμενο κύκλο χρέωσης.',
          },
          payment: {
            title: '2. Όροι πληρωμής',
            content:
              'Η πληρωμή οφείλεται κατά την έναρξη της συνδρομής και την ίδια ημέρα κάθε επόμενο μήνα. Δεχόμαστε τις κύριες πιστωτικές κάρτες και μεταφορές ACH για εταιρικούς λογαριασμούς. Εάν η πληρωμή αποτύχει, μπορούμε να αναστείλουμε την πρόσβασή σας στο The DAS Board μετά από εύλογη ειδοποίηση.',
          },
          trial: {
            title: '3. Περίοδος δοκιμής',
            content:
              'Η 60ήμερη δοκιμή παρέχει πλήρη πρόσβαση στην πλατφόρμα The DAS Board. Δεν απαιτείται πιστωτική κάρτα για να ξεκινήσετε τη δοκιμή σας. Στο τέλος της περιόδου δοκιμής, θα χρειαστεί να επιλέξετε ένα επί πληρωμή πλάνο για να συνεχίσετε να χρησιμοποιείτε την πλατφόρμα. Τα δεδομένα δοκιμής θα διατηρηθούν για 30 ημέρες μετά τη λήξη της δοκιμής.',
          },
          cancellation: {
            title: '4. Ακύρωση και επιστροφές χρημάτων',
            content:
              'Μπορείτε να ακυρώσετε τη συνδρομή σας οποιαδήποτε στιγμή μέσω των ρυθμίσεων του λογαριασμού σας ή επικοινωνώντας με την ομάδα υποστήριξής μας. Κατά την ακύρωση:',
            items: [
              'Θα διατηρήσετε πρόσβαση μέχρι το τέλος της τρέχουσας περιόδου χρέωσής σας',
              'Δεν παρέχονται επιστροφές χρημάτων για μερικούς μήνες υπηρεσίας',
              'Τα δεδομένα σας θα είναι διαθέσιμα για εξαγωγή για 90 ημέρες μετά την ακύρωση',
              'Η αυτόματη ανανέωση θα απενεργοποιηθεί',
            ],
          },
          sla: {
            title: '5. Συμφωνία επιπέδου υπηρεσίας',
            content: 'Για επί πληρωμή συνδρομές, δεσμευόμαστε σε:',
            items: [
              '99,9% διαθεσιμότητα λειτουργίας πλατφόρμας',
              'Προγραμματισμένα παράθυρα συντήρησης με προειδοποίηση 48 ωρών',
              'Απάντηση υποστήριξης πελατών εντός 24 ωρών για τυπικά αιτήματα',
              'Προτεραιότητα υποστήριξης για συνδρομητές Ομάδας αντιπροσωπειών',
            ],
          },
          data: {
            title: '6. Δεδομένα και ασφάλεια',
            content: 'Τα δεδομένα της αντιπροσωπείας σας παραμένουν ιδιοκτησία σας. Παρέχουμε:',
            items: [
              'Καθημερινά αυτοματοποιημένα αντίγραφα ασφαλείας με διατήρηση 30 ημερών',
              'Πρωτόκολλα κρυπτογράφησης και ασφάλειας τραπεζικού επιπέδου',
              'Συμμόρφωση GDPR και CCPA για προστασία δεδομένων',
              'Δυνατότητες εξαγωγής δεδομένων σε τυπικές μορφές',
            ],
          },
          support: {
            title: '7. Υποστήριξη και εκπαίδευση',
            content: 'Όλες οι επί πληρωμή συνδρομές περιλαμβάνουν:',
            items: [
              'Ολοκληρωμένη βοήθεια ενσωμάτωσης και εγκατάστασης',
              'Διαδικτυακούς πόρους εκπαίδευσης και τεκμηρίωση',
              'Υποστήριξη email και chat κατά τις εργάσιμες ώρες',
              'Τακτικές ενημερώσεις πλατφόρμας και κυκλοφορίες νέων χαρακτηριστικών',
            ],
          },
          modifications: {
            title: '8. Τροποποιήσεις υπηρεσίας',
            content:
              'Μπορούμε να τροποποιήσουμε ή να ενημερώσουμε την πλατφόρμα The DAS Board για να βελτιώσουμε τη λειτουργικότητα, την ασφάλεια ή τη συμμόρφωση. Θα παρέχουμε εύλογη ειδοποίηση σημαντικών αλλαγών που μπορεί να επηρεάσουν τη χρήση σας.',
          },
        },
      },
      pricingPage: {
        title: 'Επιλέξτε την',
        titleHighlight: 'Λύση σας',
        subtitle:
          'Επιλέξτε την επιλογή που περιγράφει καλύτερα τις ανάγκες σας. Θα προσαρμόσουμε την εμπειρία σας αναλόγως.',
        singleFinance: {
          title: 'Μεμονωμένος Χρηματοοικονομικός Διευθυντής',
          description:
            'Ιδανικό για μεμονωμένους χρηματοοικονομικούς διευθυντές που θέλουν να παρακολουθούν την προσωπική τους απόδοση και τις συναλλαγές.',
          originalPrice: '$29.99/μήνα',
          price: '$20/μήνα περιορισμένος χρόνος',
          features: [
            'Παρακολούθηση προσωπικών συναλλαγών',
            'Αναλύσεις PVR και κερδών προϊόντων',
            'Υπολογιστής πληρωμών',
            'Μετρήσεις απόδοσης',
            'Μπορεί να είναι εκπεστέα από φόρους',
          ],
          buttonText: 'Ξεκινήστε Τώρα!',
          setupTime: 'Δοκιμάστε χωρίς κίνδυνο για έναν πλήρη ημερολογιακό μήνα',
        },
        dealership: {
          title: 'Αντιπροσωπεία / Ομάδα Αντιπροσωπειών',
          description:
            'Πλήρης διαχείριση αντιπροσωπείας με dashboards ειδικά για ρόλους, διαχείριση ομάδας και υποστήριξη πολλαπλών τοποθεσιών.',
          price: '$250/μήνα βάση',
          priceSubtext: 'ανά αντιπροσωπεία + πρόσθετα',
          popular: 'Πιο Δημοφιλές',
          features: [
            'Όλες οι λειτουργίες του μεμονωμένου διευθυντή',
            'Dashboards ομάδας για όλους τους ρόλους',
            'Αναλύσεις πολλαπλών τοποθεσιών',
            'Ευέλικτες διοικητικές δομές',
            'Διαθέσιμες εκπτώσεις όγκου',
          ],
          buttonText: 'Δείτε Δυναμικές Τιμές Πακέτων',
          setupTime: 'Ξεκινήστε σήμερα',
        },
        benefits: {
          title: 'Μεταμορφώστε την Αντιπροσωπεία σας Σήμερα',
          performance: {
            title: 'Αυξήστε την Απόδοση',
            description:
              'Οι πληροφορίες πραγματικού χρόνου βοηθούν τις ομάδες να ξεπεράσουν τους στόχους και να μεγιστοποιήσουν την κερδοφορία',
          },
          operations: {
            title: 'Βελτιστοποιήστε τις Λειτουργίες',
            description:
              'Η κεντρική διαχείριση μειώνει τον διοικητικό χρόνο και βελτιώνει την αποτελεσματικότητα',
          },
          security: {
            title: 'Ασφαλές και Αξιόπιστο',
            description: 'Ασφάλεια επιχειρηματικού επιπέδου με εγγύηση διαθεσιμότητας 99,9%',
          },
        },
        helpText: {
          title: 'Δεν είστε σίγουροι ποια επιλογή να διαλέξετε;',
          description:
            'Ξεκινήστε με την επιλογή μεμονωμένου χρηματοοικονομικού διευθυντή για να δοκιμάσετε την πλατφόρμα μας, στη συνέχεια αναβαθμιστείτε εύκολα σε χαρακτηριστικά αντιπροσωπείας όταν είστε έτοιμοι να επεκτείνετε την ομάδα σας.',
        },
        footer: {
          copyright: '© 2025 The DAS Board. Όλα τα δικαιώματα διατηρούνται.',
          support: 'Ερωτήσεις; Επικοινωνήστε μαζί μας στο',
          email: 'support@thedasboard.com',
        },
      },
    },
    dashboard: {
      singleFinance: {
        title: 'Dashboard Διαχειριστή Χρηματοδότησης',
        kpi: {
          fiGross: 'F&I Μικτό',
          dealsProcessed: 'Επεξεργασμένες Συμφωνίες',
          avgDealSize: 'Μέσο Μέγεθος Συμφωνίας',
          vscs: 'VSCs',
          gaps: 'GAPs',
          ppms: 'PPMs',
        },
        deals: {
          title: 'Διαχείριση Συμφωνιών',
          recentDeals: 'Πρόσφατες Συμφωνίες',
          allDeals: 'Όλες οι Συμφωνίες',
          viewAll: 'Προβολή όλων των συμφωνιών',
          addNew: 'Προσθήκη νέας συμφωνίας',
          searchPlaceholder: 'Αναζήτηση με όνομα πελάτη, VIN ή αριθμό συμφωνίας...',
          allStatuses: 'Όλες οι καταστάσεις',
          backToDashboard: 'Επιστροφή στο dashboard',
          noDealsYet: 'Καμία συμφωνία ακόμα. Ξεκινήστε προσθέτοντας την πρώτη συμφωνία.',
          noDealsFound: 'Δεν βρέθηκε συμφωνία που να ταιριάζει με τα κριτήριά σας.',
          showingDeals: 'Εμφάνιση {count} από {total} συμφωνίες',
          totalGross: 'Συνολικό Μικτό:',
          backEndTotal: 'Συνολικό Back-end:',
          confirmDelete:
            'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη συμφωνία; Αυτή η ενέργεια είναι μη αναστρέψιμη.',
          finalConfirmDelete:
            'Αυτή είναι η τελική επιβεβαίωσή σας. Η συμφωνία θα διαγραφεί οριστικά. Συνέχεια;',
          editButton: 'Επεξεργασία',
          note: 'Αυτές είναι οι επεξεργασμένες συμφωνίες σας. Μπορείτε να τις επεξεργαστείτε, να τις διαγράψετε ή να αλλάξετε την κατάστασή τους.',
          statusOptions: {
            pending: 'Εκκρεμής',
            funded: 'Χρηματοδοτήθηκε',
            held: 'Αναμονή',
            unwound: 'Ακυρώθηκε',
            deadDeal: 'Νεκρή Συμφωνία',
          },
          tableHeaders: {
            number: '#',
            lastName: 'Επώνυμο',
            dealNumber: 'Αριθμός Συμφωνίας',
            stockNumber: 'Αριθμός Αποθέματος',
            date: 'Ημερομηνία',
            vin: 'VIN',
            vehicleType: 'Τύπος',
            lender: 'Δανειστής',
            frontEnd: 'Front-End',
            vsc: 'VSC',
            ppm: 'PPM',
            gap: 'GAP',
            tireWheel: 'Λ&Ζ',
            appearance: 'Εμφάνιση',
            theft: 'Κλοπή',
            bundled: 'Πακέτο',
            ppd: 'PPD',
            pvr: 'PVR',
            total: 'Σύνολο',
            status: 'Κατάσταση',
            edit: 'Επεξεργασία',
            delete: 'Διαγραφή',
          },
        },
        dealLog: {
          title: 'Αρχείο Νέας Συμφωνίας',
          note: 'Όλα τα πεδία που επισημαίνονται με * είναι υποχρεωτικά. Βεβαιωθείτε ότι εισάγετε ακριβείς πληροφορίες για σωστή παρακολούθηση.',
          customerInfo: 'Πληροφορίες Πελάτη',
          dealInfo: 'Πληροφορίες Συμφωνίας',
          vehicleInfo: 'Πληροφορίες Οχήματος',
          profitInfo: 'Πληροφορίες Κέρδους',
          firstName: 'Όνομα *',
          lastName: 'Επώνυμο *',
          dealNumber: 'Αριθμός Συμφωνίας *',
          stockNumber: 'Αριθμός Αποθέματος *',
          vinLast8: 'Τελευταία 8 του VIN *',
          dealDate: 'Ημερομηνία Συμφωνίας *',
          vehicleType: 'Τύπος Οχήματος *',
          vehicleTypes: {
            new: 'Καινούργιο',
            used: 'Μεταχειρισμένο',
            cpo: 'CPO',
          },
          lender: 'Δανειστής',
          frontEndGross: 'Front-End Μικτό (€)',
          vscProfit: 'Κέρδος VSC (€)',
          ppmProfit: 'Κέρδος PPM (€)',
          gapProfit: 'Κέρδος GAP (€)',
          tireAndWheelProfit: 'Κέρδος Λάστιχα & Ζάντες (€)',
          appearanceProfit: 'Κέρδος Εμφάνισης (€)',
          theftProfit: 'Κέρδος Κλοπής (€)',
          bundledProfit: 'Κέρδος Πακέτου (€)',
          dealStatus: 'Κατάσταση Συμφωνίας',
          saveDeal: 'Αποθήκευση Συμφωνίας',
          cancel: 'Ακύρωση',
          success: 'Συμφωνία αποθηκεύτηκε επιτυχώς!',
          error: 'Σφάλμα κατά την αποθήκευση της συμφωνίας. Δοκιμάστε ξανά.',
          backEndGross: 'Μικτό κέρδος Back-end υπολογισμένο από μεμονωμένα κέρδη προϊόντων',
          totalGross: 'Συνολικό μικτό κέρδος (Front-end + Back-end)',
          salesperson: 'Πωλητής',
          salespeople: 'Πωλητές',
          selectSalesperson: 'Επιλογή πωλητή',
          addSalesperson: 'Προσθήκη πωλητή',
          noSalespeople: 'Δεν υπάρχουν διαθέσιμοι πωλητές. Προσθέστε τους στις Ρυθμίσεις.',
          validationErrors: {
            firstName: 'Το όνομα είναι υποχρεωτικό',
            lastName: 'Το επώνυμο είναι υποχρεωτικό',
            dealNumber: 'Ο αριθμός συμφωνίας είναι υποχρεωτικός',
            stockNumber: 'Ο αριθμός αποθέματος είναι υποχρεωτικός',
            vinLast8: 'Τα τελευταία 8 του VIN είναι υποχρεωτικά',
            dealDate: 'Η ημερομηνία συμφωνίας είναι υποχρεωτική',
            vehicleType: 'Ο τύπος οχήματος είναι υποχρεωτικός',
            lender: 'Ο δανειστής είναι υποχρεωτικός για αυτόν τον τύπο συμφωνίας',
          },
        },
        settings: {
          title: 'Ρυθμίσεις',
          teamManagement: 'Διαχείριση Ομάδας',
          payConfiguration: 'Διαμόρφωση Πληρωμών',
          languageSettings: 'Ρυθμίσεις Γλώσσας',
          addNewMember: 'Προσθήκη νέου μέλους ομάδας',
          firstName: 'Όνομα',
          lastName: 'Επώνυμο',
          role: 'Ρόλος',
          roles: {
            salesperson: 'Πωλητής',
            salesManager: 'Διευθυντής Πωλήσεων',
          },
          addMember: 'Προσθήκη Μέλους',
          commissionBasePay: 'Προμήθειες και Βασικός Μισθός',
          commissionRate: 'Ποσοστό Προμήθειας (%)',
          baseRate: 'Βασικός Μηνιαίος Μισθός (€)',
          saveConfiguration: 'Αποθήκευση Διαμόρφωσης',
          currentLanguage: 'Τρέχουσα Γλώσσα',
          selectLanguage: 'Επιλογή Γλώσσας',
          languageUpdated: 'Η γλώσσα ενημερώθηκε επιτυχώς',
        },
      },
    },
  } as Translations,
  nl: {
    nav: {
      home: 'Home',
      screenshots: 'Screenshots',
      pricing: 'Prijzen',
      about: 'Over Ons',
      login: 'Inloggen',
      signup: 'Aanmelden',
      legal: 'Juridisch',
    },
    home: {
      title: 'Het DAS Board',
      subtitle:
        'Real-time dashboards die kritieke inzichten bieden voor financiële managers, dealerships en dealer groups.',
      startTrial: 'Start Uw Gratis Proefperiode',
      signupNow: 'Nu Aanmelden!',
      viewScreenshots: 'Bekijk Screenshots',
      mission:
        '"Het DAS Board herdefiniëert dealership succes, maakt Sales Managers mogelijk om teams te optimaliseren en Finance Managers om winsten te maximaliseren met belangrijke verkoop inzichten, en Verkopers om bovenop hun deals te blijven." - Tyler Durden',
      features: {
        title: 'Belangrijke Functies',
        subtitle: 'Alles wat u nodig heeft om uw dealership operaties effectief te beheren',
      },
      pricing: {
        title: 'Probeer Nu',
        subtitle:
          'Start uw gratis proefperiode en zie het verschil dat real-time inzichten kunnen maken voor uw dealership.',
      },
      pricingTiers: {
        singleFinance: {
          name: 'Individuele Finance Manager',
          price: '$20/maand beperkte tijd',
          originalPrice: '$29.99/maand',
          description:
            'Perfect voor individuele finance managers die hun persoonlijke prestaties willen volgen',
          features: [
            'Persoonlijke deal tracking',
            'PVR & product winst analytics',
            'Betaal calculator',
            'Prestatie metrieken',
            'Mogelijk fiscaal aftrekbaar',
          ],
          buttonText: 'Begin Nu!',
          setupTime: 'Probeer risicovrij voor een volledige kalendermaand',
        },
        dealership: {
          name: 'Dealership / Dealer Group',
          price: '$250/maand basis',
          description:
            'Complete dealership management met rol-specifieke dashboards en team management',
          popular: 'Meest Populair',
          features: [
            'Alle individuele manager functies',
            'Team dashboards voor alle rollen',
            'Multi-locatie analytics',
            'Flexibele admin structuren',
          ],
          buttonText: 'Configureer Uw Pakket',
          setupTime: 'Begin vandaag nog',
        },
        priceSubtext: 'per dealership + add-ons',
      },
      cta: {
        title: 'Klaar om uw dealership operaties te transformeren?',
        subtitle:
          'Sluit u aan bij honderden dealerships die al Het DAS Board gebruiken om hun operaties te optimaliseren.',
      },
    },
    features: {
      finance: {
        title: 'Finance Dashboards',
        desc: 'Real-time inzichten voor finance managers om dagelijkse prestaties te volgen, deals te loggen, metrieken te bekijken inclusief PVR, VSC en andere Producten.',
      },
      sales: {
        title: 'Sales Team Dashboards',
        desc: 'Het Das Board is uw nieuwe Leaderboard! Houd uw deals bij en weet precies waar u staat gedurende de maand.',
      },
      manager: {
        title: 'Sales Manager Dashboards',
        desc: 'Bekijk Deal Logs, Sales People statistieken, beheer uw Teams effectiever.',
      },
      info: {
        title: 'Informatieve Dashboards',
        desc: 'Rol-specifieke dashboards voor Sales Teams, Finance Managers, Sales Managers en General Managers.',
      },
      scheduler: {
        title: 'Dynamische Planner',
        desc: 'Dynamische Sales persoon planner voor efficiënte team coördinatie. Beheer roosters om dagelijkse productie te maximaliseren.',
      },
      calculator: {
        title: 'Betaal Calculator',
        desc: 'Uw Sales Team en Finance Managers kunnen maand-tot-datum real-time verdiensten zien met vooraf geconfigureerde betaalplannen.',
      },
    },
    screenshots: {
      title: 'Zie Het DAS Board in Actie',
      subtitle: 'Bekijk onze intuïtieve dashboards ontworpen voor automotive professionals.',
      finance: {
        title: 'Finance Manager Dashboard',
        desc: 'Volg deals, PVR, VSC metrieken en dagelijkse prestaties in real-time.',
      },
      sales: {
        title: 'Sales Dashboard',
        desc: 'Monitor verkoop prestaties, lead conversies en team productiviteit.',
      },
      management: {
        title: 'Management Dashboard',
        desc: 'High-level inzichten in dealership prestaties en team productiviteit.',
      },
    },
    pricing: {
      title: 'Kies het Perfecte Plan',
      subtitle:
        'Begin met onze gratis proefperiode voor finance managers, of kies het plan dat schaalt met uw dealership.',
      finance: 'Finance Manager',
      dealership: 'Enkel Dealership',
      group: 'Dealer Groups',
      freeTime: 'Gratis voor Beperkte Tijd!',
      getStarted: 'Begin',
      startTrial: 'Start Gratis Proefperiode',
      popular: 'Meest Populair',
      viewDetails: 'Bekijk Volledige Prijsdetails →',
      tiers: {
        finance: {
          name: 'Finance Manager',
          price: 'Gratis voor Beperkte Tijd!',
          originalPrice: '$5/Maand',
          description: 'Alles wat u nodig heeft als individuele finance manager',
          features: [
            'Personal deal tracking',
            'PVR tracking & product analytics',
            'Pay calculator met live verdiensten',
            'Prestatie metrieken & rapporten',
          ],
        },
        dealership: {
          name: 'Enkel Dealership',
          price: '$250/Mo Basis',
          originalPrice: '',
          description: 'Volledige dealership management oplossing',
          features: [
            'Alles van Finance Manager plus',
            'Sales team dashboards',
            'Manager oversight tools',
            'Inventory & lead management',
          ],
        },
        group: {
          name: 'Dealer Groups',
          price: '$200/Mo per Dealer*',
          description: 'Alles van Enkel Dealership plus Area VP Dashboard',
        },
      },
      discountPopup: {
        specialSummerSavings: 'Speciale Zomer Besparingen!',
        yourDiscountCode: 'Uw Kortingscode!',
        tenPercentOff: '10% korting',
        firstThreeMonths: 'uw eerste 3 maanden met onze dealership management oplossing.',
        enterEmailPrompt: 'Voer uw e-mail in om de kortingscode te ontvangen:',
        emailPlaceholder: 'uw@email.com',
        getDiscountCode: 'Ontvang Kortingscode',
        maybeWater: 'Misschien Later',
        thankYouMessage: 'Dank u! Hier is uw',
        discountCodeLabel: 'Kortingscode:',
        copied: 'Gekopieerd!',
        copy: 'Kopiëren',
        claimOffer: 'Claim Aanbieding',
        useLater: 'Later Gebruiken',
        validityNotice:
          '* Geldig voor nieuwe dealership abonnementen alleen. Verloopt over 30 dagen.',
        emailRequired: 'E-mailadres is vereist',
        validEmailRequired: 'Voer een geldig e-mailadres in',
      },
      pricingPage: {
        title: 'Selecteer Uw',
        titleHighlight: 'Oplossing',
        subtitle:
          'Selecteer de optie die uw behoeften het beste beschrijft. Wij passen uw ervaring dienovereenkomstig aan.',
        singleFinance: {
          title: 'Individuele Finance Manager',
          description:
            'Perfect voor individuele finance managers die hun persoonlijke prestaties en deals willen volgen.',
          originalPrice: '$29.99/maand',
          price: '$20/maand beperkte tijd',
          features: [
            'Persoonlijke deal tracking',
            'PVR & product winst analytics',
            'Betaal calculator',
            'Prestatie metrieken',
            'Mogelijk fiscaal aftrekbaar',
          ],
          buttonText: 'Begin Nu!',
          setupTime: 'Probeer risicovrij voor een volledige kalendermaand',
        },
        dealership: {
          title: 'Dealership / Dealer Group',
          description:
            'Complete dealership management met rol-specifieke dashboards, team management en multi-locatie ondersteuning.',
          price: '$250/maand basis',
          priceSubtext: 'per dealership + add-ons',
          popular: 'Meest Populair',
          features: [
            'Alle individuele manager functies',
            'Team dashboards voor alle rollen',
            'Multi-locatie analytics',
            'Flexibele admin structuren',
            'Volume kortingen beschikbaar',
          ],
          buttonText: 'Bekijk Dynamische Pakket Prijzen',
          setupTime: 'Begin vandaag nog',
        },
        benefits: {
          title: 'Transformeer Uw Dealership Vandaag',
          performance: {
            title: 'Verhoog Prestaties',
            description:
              'Real-time inzichten helpen teams doelen te overtreffen en winstgevendheid te maximaliseren',
          },
          operations: {
            title: 'Stroomlijn Operaties',
            description:
              'Gecentraliseerd management reduceert administratieve tijd en verbetert efficiëntie',
          },
          security: {
            title: 'Veilig & Betrouwbaar',
            description: 'Enterprise-grade beveiliging met 99,9% uptime garantie',
          },
        },
        helpText: {
          title: 'Niet zeker welke optie te kiezen?',
          description:
            'Begin met de individuele finance manager optie om ons platform te proberen, upgrade dan eenvoudig naar dealership functies wanneer u klaar bent om uw team uit te breiden.',
        },
        footer: {
          copyright: '© 2025 Het DAS Board. Alle rechten voorbehouden.',
          support: 'Vragen? Neem contact met ons op via',
          email: 'support@thedasboard.com',
        },
      },
    },
    about: {
      title: 'Wie Wij Zijn',
      subtitle:
        'Gepassioneerde professionals toegewijd aan het revolutioneren van dealership management door innovatieve technologie en data-gedreven inzichten.',
      founderVision: {
        title: 'Waarom Ik Het DAS Board Creëerde – Tyler Durden, CEO en Oprichter',
        paragraph1:
          "Met meer dan 27 jaar ervaring in de automotive dealership industrie, heb ik uit de eerste hand de uitdagingen gezien waarmee managers geconfronteerd worden bij het balanceren van hun rollen als leiders en presteerders. Als ervaren professional, stichtte ik Het DAS Board om een kritieke kloof aan te pakken die ik observeerde: hoewel Sales Managers uitblinken in het verkopen van auto's, worstelen ze vaak om hun sales teams effectief te managen.",
        paragraph2:
          'Ik geloof dat geïnformeerde, gemotiveerde en goed ondersteunde verkopers de sleutel zijn tot het behalen van uitzonderlijke resultaten—veel beter dan de uitkomsten van onbetrokken of ongeïnformeerde teams. Het DAS Board geeft Sales Managers intuïtieve tools om hun teams effectiever te leiden, zodat ze zich kunnen concentreren op zowel teamontwikkeling als verkoop excellentie.',
        paragraph3:
          'Naast verkoop, ondersteunt de app Finance Managers door real-time inzichten te bieden in deal winstgevendheid en belangrijke metrieken, terwijl het GMs actioneerbare rapporten biedt om strategische beslissingen te begeleiden. Mijn visie met Het DAS Board is om dealership management te revolutioneren, een cultuur van efficiëntie, transparantie en succes te bevorderen op alle niveaus van de organisatie.',
      },
      team: {
        title: 'Ons Team',
        members: {
          tyler: {
            name: 'Tyler Durden',
            role: 'CEO & Oprichter',
            bio: 'Met uitgebreide ervaring in dealership management, stichtte Tyler Durden Het DAS Board om een cultuur te bevorderen waar geïnformeerde en gemotiveerde werknemers floreren, productiviteit stimuleren door transparante, data-gedreven tools die automotive teams versterken.',
          },
          sarah: {
            name: 'Sarah Conner',
            role: 'Chief Product Officer',
            bio: 'Met meer dan 25 jaar dealership en retail ervaring, brengt Sarah Conner diepe inzichten in het bereiken van verkoop succes. Ze begrijpt de kracht van effectieve tools en bekwaam management om teams te inspireren, ervoor zorgend dat Het DAS Board uitzonderlijke resultaten behaalt voor dealerships.',
          },
          claude: {
            name: 'Claude Shannon',
            role: 'Chief Technology Officer',
            bio: 'Claude Shannon leidt onze technische innovatie met een focus op schaalbare, betrouwbare systemen. Zijn expertise in data architectuur en real-time analytics zorgt ervoor dat Het DAS Board robuuste prestaties levert terwijl het evolueert met dealership behoeften.',
          },
          annie: {
            name: 'Annie Oakley',
            role: 'VP of Customer Success',
            bio: 'Annie Oakley zorgt ervoor dat elke dealership slaagt met Het DAS Board. Haar achtergrond in automotive operaties en klantervaring helpt teams onze tools effectief te implementeren en maximale waarde te realiseren van hun investering.',
          },
        },
      },
      values: {
        title: 'Onze Waarden',
        customerFocused: {
          title: 'Klantgericht',
          description:
            'Wij plaatsen dealership succes centraal in alles wat wij doen, bouwen functies die echte waarde leveren.',
        },
        dataDriven: {
          title: 'Data-gedreven',
          description:
            'Onze beslissingen zijn gebaseerd op concrete data en feedback van echte automotive professionals.',
        },
        continuousImprovement: {
          title: 'Continue Verbetering',
          description:
            'Wij evolueren voortdurend ons platform om de veranderende behoeften van de automotive industrie te ontmoeten.',
        },
      },
      contact: {
        title: 'Neem Contact Met Ons Op',
        subtitle: 'Klaar om te zien hoe Het DAS Board uw dealership kan transformeren?',
        email: 'E-mail:',
        phone: 'Telefoon:',
      },
    },
    common: {
      language: 'Taal',
      login: 'Inloggen',
      signUp: 'Aanmelden',
      loading: 'Laden...',
      save: 'Opslaan',
      cancel: 'Annuleren',
      continue: 'Doorgaan',
      back: 'Terug',
      next: 'Volgende',
      submit: 'Verzenden',
      close: 'Sluiten',
    },
    footer: {
      tagline: 'Moderne dealership management software met real-time inzichten.',
      industry: 'Automotive Dealer Verkoop',
      product: 'Product',
      legal: 'Juridisch',
      contact: 'Contact',
      support: 'Voor ondersteuning of vragen, neem contact met ons op:',
      copyright: '© 2025 Het DAS Board. Alle rechten voorbehouden. Ontworpen met 🖤',
      terms: 'Servicevoorwaarden',
      privacy: 'Privacybeleid',
      subscription: 'Abonnement Overeenkomst',
      home: 'Home',
      screenshots: 'Screenshots',
      pricing: 'Prijzen',
      aboutUs: 'Over Ons',
    },
    currency: {
      symbol: '$',
      name: 'Dollar',
    },
    legal: {
      terms: {
        title: 'Servicevoorwaarden',
        lastUpdated: 'Laatst Bijgewerkt: 28/6/2025',
        intro:
          'Deze Servicevoorwaarden ("Voorwaarden") regelen uw gebruik van Het DAS Board platform en services.',
        sections: {
          acceptance: {
            title: '1. Acceptatie van Voorwaarden',
            content:
              'Door toegang te krijgen tot of gebruik te maken van Het DAS Board, gaat u akkoord met deze Voorwaarden. Als u niet akkoord gaat met deze voorwaarden, mag u onze services niet gebruiken.',
          },
          description: {
            title: '2. Service Beschrijving',
            content:
              'Het DAS Board biedt dealership management software met real-time dashboards en analytics voor automotive professionals.',
            items: [
              '<strong>Finance Manager Tools:</strong> Deal tracking, PVR analytics, betaal calculators',
              '<strong>Sales Management:</strong> Team prestatie monitoring, lead tracking',
              '<strong>Dealership Analytics:</strong> Comprehensive rapportage en inzichten',
              '<strong>Multi-user Ondersteuning:</strong> Rol-gebaseerde toegang en permissies',
            ],
          },
          eligibility: {
            title: '3. Geschiktheid',
            content:
              'U moet 18 jaar of ouder zijn en gemachtigd om namens uw dealership contracten aan te gaan om deze service te gebruiken.',
          },
          accounts: {
            title: '4. Gebruikersaccounts',
            content:
              'U bent verantwoordelijk voor het handhaven van de vertrouwelijkheid van uw account en het beperken van toegang tot uw computer. U gaat akkoord om verantwoordelijkheid te accepteren voor alle activiteiten die plaatsvinden onder uw account.',
            items: [
              'Verstrek accurate en volledige registratie informatie',
              'Houd uw wachtwoord veilig en deel het niet',
              'Informeer ons onmiddellijk over ongeautoriseerd gebruik',
              'U bent verantwoordelijk voor alle activiteiten onder uw account',
            ],
          },
          conduct: {
            title: '5. Gebruikersgedrag',
            content: 'U gaat ermee akkoord om Het DAS Board niet te gebruiken voor:',
            items: [
              'Illegale activiteiten of schending van wetten',
              'Inbreuk op intellectueel eigendom rechten',
              'Verzending van spam, malware of schadelijke code',
              'Poging tot ongeautoriseerde toegang tot onze systemen',
              'Verstoring van service voor andere gebruikers',
            ],
          },
          data: {
            title: '6. Data en Privacy',
            content:
              'Uw privacy is belangrijk voor ons. Onze praktijken zijn beschreven in ons Privacybeleid.',
            items: [
              'U behoudt eigendom van uw dealership data',
              'Wij gebruiken uw data alleen zoals beschreven in ons Privacybeleid',
              'Wij implementeren industriestandaard beveiligingsmaatregelen',
              'U kunt uw data te allen tijde exporteren',
            ],
          },
          payment: {
            title: '7. Betaling en Facturering',
            content:
              'Betaalde abonnementen worden maandelijks vooraf gefactureerd. Alle prijzen zijn in USD tenzij anders vermeld.',
            items: [
              'Betalingen zijn verschuldigd bij het begin van elke factureringsperiode',
              'Prijzen kunnen veranderen met 30 dagen voorafgaande kennisgeving',
              'Restituties worden behandeld per geval',
              'Niet-betaling kan resulteren in service opschorting',
            ],
          },
          termination: {
            title: '8. Beëindiging',
            content:
              'Beide partijen kunnen deze overeenkomst beëindigen. Bij beëindiging wordt uw toegang tot de service gestopt en kunnen we uw data verwijderen na een redelijke kennisgevingsperiode.',
          },
          disclaimers: {
            title: '9. Disclaimers',
            content:
              'Het DAS Board wordt geleverd "zoals het is" zonder garanties van welke aard dan ook. Wij wijzen alle garanties af, uitdrukkelijk of impliciet.',
          },
          limitation: {
            title: '10. Beperking van Aansprakelijkheid',
            content:
              'Onze aansprakelijkheid is beperkt tot het maximum toegestaan door de wet. Wij zijn niet aansprakelijk voor indirecte, incidentele of gevolgschade.',
          },
          governing: {
            title: '11. Toepasselijk Recht',
            content:
              'Deze voorwaarden worden beheerst door de wetten van [Jurisdictie]. Geschillen worden opgelost door bindende arbitrage.',
          },
          changes: {
            title: '12. Wijzigingen in Voorwaarden',
            content:
              'Wij kunnen deze voorwaarden te allen tijde wijzigen. Wij zullen gebruikers op de hoogte stellen van materiële wijzigingen via e-mail of service kennisgevingen.',
          },
          contact: {
            title: '13. Contact Informatie',
            content:
              'Voor vragen over deze Voorwaarden, neem contact met ons op via support@thedasboard.com.',
          },
          severability: {
            title: '14. Deelbaarheid',
            content:
              'Als een deel van deze voorwaarden ongeldig wordt verklaard, blijven de resterende bepalingen volledig van kracht.',
          },
          entire: {
            title: '15. Volledige Overeenkomst',
            content:
              'Deze Voorwaarden vormen de volledige overeenkomst tussen u en Het DAS Board betreffende het gebruik van onze service.',
          },
        },
      },
      privacy: {
        title: 'Privacybeleid',
        lastUpdated: 'Laatst Bijgewerkt: 28/6/2025',
        intro:
          'Dit Privacybeleid beschrijft hoe Het DAS Board uw persoonlijke informatie verzamelt, gebruikt en beschermt.',
        sections: {
          collection: {
            title: '1. Informatie Verzameling',
            content:
              'Wij verzamelen informatie die u ons verstrekt en informatie die automatisch wordt verzameld wanneer u onze service gebruikt.',
            items: [
              '<strong>Account Informatie:</strong> Naam, e-mailadres, telefoon, bedrijfsinformatie',
              '<strong>Dealership Data:</strong> Verkoop records, klant data, inventaris informatie',
              '<strong>Gebruik Data:</strong> Hoe u onze service gebruikt, functies die u opent',
              '<strong>Technische Data:</strong> IP-adres, browser type, apparaat informatie',
            ],
          },
          usage: {
            title: '2. Hoe Wij Informatie Gebruiken',
            content:
              'Wij gebruiken uw informatie om onze service te leveren, te verbeteren en te ondersteunen.',
            items: [
              'Service functionaliteit en ondersteuning leveren',
              'Uw account en veiligheid beheren',
              'Communiceren over service updates en ondersteuning',
              'Onze service analyseren en verbeteren',
              'Voldoen aan wettelijke verplichtingen',
            ],
          },
          sharing: {
            title: '3. Informatie Delen',
            content:
              'Wij verkopen uw persoonlijke informatie niet. Wij kunnen informatie delen in beperkte omstandigheden:',
            items: [
              '<strong>Service Providers:</strong> Vertrouwde partners die ons helpen bij service levering',
              '<strong>Wettelijke Verplichtingen:</strong> Wanneer vereist door wet of rechtelijke procedures',
              '<strong>Bedrijfsoverdrachten:</strong> In geval van fusie, acquisitie of asset verkoop',
              '<strong>Toestemming:</strong> Wanneer u uitdrukkelijke toestemming geeft',
            ],
          },
          retention: {
            title: '4. Data Bewaring',
            content:
              'Wij bewaren uw informatie zolang uw account actief is of zoals nodig om u service te verlenen.',
            items: [
              'Account data wordt bewaard totdat u uw account sluit',
              'Dealership data wordt bewaard volgens uw abonnement',
              'Sommige informatie kan langer worden bewaard voor wettelijke doeleinden',
              'U kunt data verwijdering aanvragen, onderhevig aan wettelijke beperkingen',
            ],
          },
          rights: {
            title: '5. Uw Rechten en Keuzes',
            content: 'U heeft verschillende rechten betreffende uw persoonlijke informatie:',
            items: [
              '<strong>Toegang:</strong> Vraag een kopie van uw persoonlijke informatie aan',
              '<strong>Correctie:</strong> Verzoek om correctie van onnauwkeurige informatie',
              '<strong>Verwijdering:</strong> Verzoek om verwijdering van uw persoonlijke informatie',
              '<strong>Portabiliteit:</strong> Ontvang uw data in een overdraagbare vorm',
            ],
          },
          cookies: {
            title: '6. Cookies en Tracking',
            content:
              'Wij gebruiken cookies en vergelijkbare technologieën om uw ervaring te verbeteren.',
            items: [
              '<strong>Essentiële Cookies:</strong> Vereist voor basis service functionaliteit',
              '<strong>Prestatie Cookies:</strong> Helpen ons te begrijpen hoe u onze service gebruikt',
              '<strong>Functionele Cookies:</strong> Onthouden uw voorkeuren en instellingen',
              '<strong>Third-party Cookies:</strong> Van onze analytics en service providers',
            ],
            footer:
              'U kunt cookies beheren via uw browser instellingen, maar dit kan service functionaliteit beïnvloeden.',
          },
          security: {
            title: '7. Beveiliging',
            content:
              'Wij implementeren passende technische en organisatorische maatregelen om uw informatie te beschermen.',
            items: [
              'Encryptie van data in transit en at rest',
              'Regelmatige beveiligingsbeoordelingen en updates',
              'Toegangscontroles en employee training',
              'Incident response procedures',
            ],
          },
          international: {
            title: '8. Internationale Overdrachten',
            content:
              'Uw informatie kan worden overgedragen naar en verwerkt in landen buiten uw woonplaats. Wij zorgen ervoor dat passende waarborgen worden getroffen voor dergelijke overdrachten.',
          },
          children: {
            title: '9. Kinderen Privacy',
            content:
              'Onze service is niet bedoeld voor kinderen onder de 16 jaar. Wij verzamelen niet bewust persoonlijke informatie van kinderen onder de 16.',
          },
          changes: {
            title: '10. Wijzigingen in dit Beleid',
            content:
              'Wij kunnen dit Privacybeleid bijwerken. Wij zullen u op de hoogte stellen van materiële wijzigingen via e-mail of service kennisgeving.',
          },
          contact: {
            title: '11. Contact Ons',
            content:
              'Voor vragen over dit Privacybeleid of onze privacy praktijken, neem contact met ons op:',
            email: 'privacy@thedasboard.com',
            address: '123 Privacy Street, Data City, DC 12345',
            phone: '(555) 123-4567',
          },
        },
      },
      subscription: {
        title: 'Abonnement Overeenkomst',
        lastUpdated: 'Laatst Bijgewerkt: 28/6/2025',
        intro:
          'Deze Abonnement Overeenkomst regelt uw abonnement op en gebruik van Het DAS Board dealership management platform.',
        sections: {
          plans: {
            title: '1. Abonnement Plannen',
            content:
              'Het DAS Board biedt abonnement tiers ontworpen voor verschillende dealership behoeften:',
            items: [
              '<strong>60-Dag Gratis Proefperiode:</strong> Volledige toegang tot platform zonder creditcard vereist',
              '<strong>Finance Manager:</strong> Enkelvoudige gebruiker toegang met kern financiële tools',
              '<strong>Dealership:</strong> Multi-user toegang met volledige inventory en sales management',
              '<strong>Dealer Group:</strong> Enterprise-level toegang over meerdere locaties',
            ],
            footer:
              'Abonnementen worden maandelijks vooraf gefactureerd. U kunt uw abonnement op elk moment upgraden of downgraden, met wijzigingen die ingaan bij de volgende factureringsperiode.',
          },
          payment: {
            title: '2. Betalingsvoorwaarden',
            content:
              'Alle abonnement tarieven zijn in USD en exclusief toepasselijke belastingen. Betalingen zijn verschuldigd bij het begin van elke factureringsperiode. Niet-betaling kan resulteren in service opschorting.',
          },
          trial: {
            title: '3. Proefperiode',
            content:
              'Nieuwe gebruikers ontvangen een 60-dagen gratis proefperiode. Geen creditcard vereist voor proefperiode activatie. Proefperiode limieten gelden per dealership entiteit.',
          },
          cancellation: {
            title: '4. Annulering en Restitutie',
            content:
              'U kunt uw abonnement op elk moment annuleren met onmiddellijke ingang. Restituties worden per geval behandeld:',
            items: [
              'Geen restituties voor gedeeltelijk gebruikte maanden',
              'Annulering stopt toekomstige facturering maar beëindigt geen huidige service periode',
              'Data export beschikbaar voor 30 dagen na annulering',
              'Enterprise klanten kunnen aangepaste annuleringsvoorwaarden hebben',
            ],
          },
          sla: {
            title: '5. Service Level Overeenkomst',
            content: 'Wij streven naar 99.9% uptime voor alle betaalde abonnementen:',
            items: [
              'Maandelijkse uptime doelstelling van 99.9%',
              'Geplande onderhoudsmeldingen met 24 uur voorafgaande kennisgeving',
              'Service credits voor significante outages',
              '24/7 monitoring en incident response',
            ],
          },
          data: {
            title: '6. Data en Beveiliging',
            content: 'Uw dealership data blijft uw eigendom. Wij leveren:',
            items: [
              'Dagelijkse geautomatiseerde backups met 30-dagen retentie',
              'Bank-grade encryptie en beveiligingsprotocollen',
              'GDPR en CCPA compliance voor data bescherming',
              'Data export mogelijkheden in standaard formaten',
            ],
          },
          support: {
            title: '7. Ondersteuning en Training',
            content: 'Alle betaalde abonnementen omvatten:',
            items: [
              'Volledige onboarding en setup ondersteuning',
              'Online training resources en documentatie',
              'E-mail en chat ondersteuning tijdens kantooruren',
              'Regelmatige platform updates en nieuwe feature releases',
            ],
          },
          modifications: {
            title: '8. Service Wijzigingen',
            content:
              'Wij kunnen Het DAS Board platform wijzigen of updaten om functionaliteit, beveiliging of compliance te verbeteren. Wij zullen redelijke voorafgaande kennisgeving geven van significante wijzigingen die uw gebruik kunnen beïnvloeden.',
          },
        },
      },
    },
    dashboard: {
      singleFinance: {
        title: 'Finance Manager Dashboard',
        kpi: {
          fiGross: 'F&I Bruto',
          dealsProcessed: 'Verwerkte Deals',
          avgDealSize: 'Gemiddelde Deal Grootte',
          vscs: 'VSCs',
          gaps: 'GAPs',
          ppms: 'PPMs',
        },
        deals: {
          title: 'Recente Deals',
          customerName: 'Klantnaam',
          vehicleInfo: 'Voertuig Info',
          fiGross: 'F&I Bruto',
          status: 'Status',
          date: 'Datum',
        },
        productMix: {
          title: 'Product Mix Performance',
          vsc: 'VSC',
          gap: 'GAP',
          ppm: 'PPM',
          other: 'Overig',
        },
        payCalculator: {
          title: 'Betaal Calculator',
          monthlyEarnings: 'Maandelijkse Verdiensten',
          ytdEarnings: 'Jaar-tot-Datum Verdiensten',
          projectedAnnual: 'Geprojecteerd Jaarlijks',
          lastUpdated: 'Laatst Bijgewerkt',
          baseSalary: 'Basis Salaris',
          commission: 'Commissie',
          bonuses: 'Bonussen',
          total: 'Totaal',
          disclaimer: {
            title: 'Berekening Disclaimer',
            text: 'Deze berekeningen zijn schattingen gebaseerd op huidige prestaties en kunnen variëren. Raadpleeg uw manager voor officiële compensatie informatie.',
          },
        },
      },
    },
    auth: {
      login: {
        title: 'Inloggen bij Het DAS Board',
        email: 'E-mail',
        password: 'Wachtwoord',
        rememberMe: 'Onthoud mij',
        forgotPassword: 'Wachtwoord vergeten?',
        signIn: 'Inloggen',
        noAccount: 'Nog geen account?',
        signUp: 'Aanmelden',
        or: 'of',
        invalidCredentials: 'Ongeldige inloggegevens',
        emailRequired: 'E-mail is vereist',
        passwordRequired: 'Wachtwoord is vereist',
      },
      signup: {
        title: 'Aanmelden voor Het DAS Board',
        email: 'E-mail',
        password: 'Wachtwoord',
        confirmPassword: 'Bevestig Wachtwoord',
        firstName: 'Voornaam',
        lastName: 'Achternaam',
        company: 'Bedrijf',
        role: 'Rol',
        createAccount: 'Account Aanmaken',
        alreadyHaveAccount: 'Al een account?',
        signIn: 'Inloggen',
        passwordsDoNotMatch: 'Wachtwoorden komen niet overeen',
        emailAlreadyExists: 'E-mail bestaat al',
        accountCreated: 'Account succesvol aangemaakt',
      },
      roles: {
        financeManager: 'Finance Manager',
        salesManager: 'Sales Manager',
        salesperson: 'Verkoper',
        generalManager: 'General Manager',
      },
      errors: {
        networkError: 'Netwerkfout. Probeer opnieuw.',
        serverError: 'Server fout. Probeer later opnieuw.',
        unauthorized: 'Ongeautoriseerd. Controleer uw inloggegevens.',
        forbidden: 'Toegang geweigerd.',
        notFound: 'Niet gevonden.',
        validationError: 'Validatiefout. Controleer uw invoer.',
        sessionExpired: 'Sessie verlopen. Log opnieuw in.',
        accountLocked: 'Account vergrendeld. Neem contact op met ondersteuning.',
        passwordTooWeak: 'Wachtwoord te zwak. Gebruik een sterker wachtwoord.',
        emailInvalid: 'Ongeldig e-mailadres.',
      },
      success: {
        loginSuccessful: 'Succesvol ingelogd',
        logoutSuccessful: 'Succesvol uitgelogd',
        accountCreated: 'Account succesvol aangemaakt',
        passwordReset: 'Wachtwoord reset e-mail verzonden',
        profileUpdated: 'Profiel succesvol bijgewerkt',
        passwordChanged: 'Wachtwoord succesvol gewijzigd',
        emailVerified: 'E-mail succesvol geverifieerd',
        settingsSaved: 'Instellingen succesvol opgeslagen',
        dataExported: 'Data succesvol geëxporteerd',
        invitationSent: 'Uitnodiging succesvol verzonden',
        permissionsUpdated: 'Permissies succesvol bijgewerkt',
        languageUpdated: 'Taal succesvol bijgewerkt',
      },
    },
  } as Translations,
};

// Translation getter function with fallback
export const getTranslation = (language: Language, key: string): string | string[] | object => {
  const keys = key.split('.');

  // Helper function to navigate through nested object
  const getNestedValue = (obj: unknown, keyPath: string[]): unknown => {
    let current = obj;
    for (const k of keyPath) {
      if (current && typeof current === 'object' && k in current) {
        current = (current as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }
    return current;
  };

  // Try to get translation in requested language
  let result = getNestedValue(translations[language], keys);

  // If not found or language doesn't have complete translations, fallback to English
  if (result === undefined && language !== 'en') {
    result = getNestedValue(translations.en, keys);
  }

  // If still not found, return the key as fallback
  if (result === undefined) {
    console.warn(`Translation missing for key: ${key} in language: ${language}`);
    return key;
  }

  // Return result if it's string or array, otherwise convert to string
  if (typeof result === 'string' || Array.isArray(result)) {
    return result;
  }

  // If it's an object, it means the key path was incomplete
  if (typeof result === 'object') {
    console.warn(`Translation key incomplete: ${key} - expected string/array but got object`);
    return key;
  }

  return String(result);
};

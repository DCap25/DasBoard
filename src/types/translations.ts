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

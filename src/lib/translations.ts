export type Language = 'en' | 'es' | 'fr' | 'de' | 'cs' | 'it' | 'pl' | 'pt' | 'gr';

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
      form: {
        firstName: 'First Name',
        lastName: 'Last Name',
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
      },
      privacy: {
        title: 'Privacy Policy',
      },
      subscription: {
        title: 'Subscription Agreement',
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
      form: {
        firstName: 'Nombre',
        lastName: 'Apellido',
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
      },
      privacy: {
        title: 'Política de Privacidad',
      },
      subscription: {
        title: 'Acuerdo de Suscripción',
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
      },
      privacy: {
        title: 'Politique de confidentialité',
      },
      subscription: {
        title: "Accord d'abonnement",
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
          description: 'Verfolgen Sie Ihre Geschäfte, Produkte, PVR und Gehalt!',
        },
        dealership: {
          name: 'Autohäuser',
          price: '250€/Monat',
          description: 'Für bis zu 15 Benutzer mit vollständigem Autohaus-Zugang.',
        },
        group: {
          name: 'Händlergruppen',
          price: '500€/Monat',
          description: 'Multi-Autohaus-Unterstützung für Händlergruppen.',
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
      contact: {
        title: 'Kontaktieren Sie uns',
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
      support: 'Pro podporu nebo dotazy nás kontaktujte na:',
      copyright: '© 2025 The DAS Board. Všechna práva vyhrazena. Navrženo s 🖤',
      terms: 'Podmínky služby',
      privacy: 'Zásady ochrany osobních údajů',
      subscription: 'Dohoda o předplatném',
      home: 'Domů',
      screenshots: 'Snímky obrazovky',
      pricing: 'Ceny',
      aboutUs: 'O nás',
    },
    currency: {
      symbol: 'Kč',
      name: 'CZK',
    },
    legal: {
      terms: {
        title: 'Podmínky služby',
      },
      privacy: {
        title: 'Zásady ochrany osobních údajů',
      },
      subscription: {
        title: 'Dohoda o předplatném',
      },
    },
  } as Partial<Translations>,
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
    legal: {
      terms: {
        title: 'Podmínky služby',
      },
      privacy: {
        title: 'Zásady ochrany osobních údajů',
      },
      subscription: {
        title: 'Dohoda o předplatném',
      },
    },
  } as Partial<Translations>,
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
      },
      privacy: {
        title: 'Politica sulla privacy',
      },
      subscription: {
        title: 'Accordo di abbonamento',
      },
    },
  } as Partial<Translations>,
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
      },
      privacy: {
        title: 'Polityka prywatności',
      },
      subscription: {
        title: 'Umowa subskrypcji',
      },
    },
  } as Partial<Translations>,
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
      },
      privacy: {
        title: 'Política de Privacidade',
      },
      subscription: {
        title: 'Acordo de Assinatura',
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
      },
      privacy: {
        title: 'Πολιτική Απορρήτου',
      },
      subscription: {
        title: 'Συμφωνία Συνδρομής',
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

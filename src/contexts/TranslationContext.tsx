import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de' | 'cs' | 'it' | 'pl' | 'el' | 'pt';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.screenshots': 'Screenshots',
    'nav.pricing': 'Pricing',
    'nav.about': 'About Us',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.legal': 'Legal',

    // Homepage
    'home.title': 'The DAS Board',
    'home.subtitle':
      'Real-time dashboards providing critical insights for finance managers, dealerships, and dealer groups.',
    'home.startTrial': 'Start Your Free Trial',
    'home.viewScreenshots': 'View Screenshots',
    'home.mission':
      '"The DAS Board redefines dealership success, empowering Sales Managers to optimize teams and Finance Managers to maximize profits with key sales insights, and Sales People to stay on top of their deals." - Tyler Durden',
    'home.features.title': 'Key Features',
    'home.features.subtitle':
      'Everything you need to manage your dealership operations effectively',
    'home.pricing.title': 'Try it Now',
    'home.pricing.subtitle':
      'Start your free trial and see the difference real-time insights can make for your dealership.',
    'home.cta.title': 'Ready to transform your dealership operations?',
    'home.cta.subtitle':
      'Join hundreds of dealerships already using The DAS Board to optimize their operations.',

    // Features
    'features.finance.title': 'Finance Dashboards',
    'features.finance.desc':
      'Real-time insights for finance managers to track daily performance, log deals, view metrics including PVR, VSC, and other Products.',
    'features.sales.title': 'Sales Team Dashboards',
    'features.sales.desc':
      'The Das Board is your new Leaderboard! Keep track of your deals know exactly where you are throughout the month.',
    'features.manager.title': 'Sales Manager Dashboards',
    'features.manager.desc':
      'View Deals Logs, Sales People statistics, manage your Teams more effectively.',
    'features.info.title': 'Informative Dashboards',
    'features.info.desc':
      'Role-specific dashboards for Sales Teams, Finance Managers, Sales Managers and General Managers.',
    'features.scheduler.title': 'Dynamic Scheduler',
    'features.scheduler.desc':
      'Dynamic Sales person scheduler for efficient team coordination. Manage schedules to maximize daily production.',
    'features.calculator.title': 'Pay Calculator',
    'features.calculator.desc':
      'Your Sales Team and Finance Managers will be able to see month to date real time earnings with pre-configured pay plans.',

    // Pricing
    'pricing.title': 'Choose the Perfect Plan',
    'pricing.subtitle':
      'Start with our free trial for finance managers, or choose the plan that scales with your dealership.',
    'pricing.finance': 'Finance Manager',
    'pricing.dealership': 'Single Dealership',
    'pricing.group': 'Dealer Groups',
    'pricing.freeTime': 'Free for Limited Time!',
    'pricing.getStarted': 'Get Started',
    'pricing.startTrial': 'Start Free Trial',
    'pricing.popular': 'Most Popular',

    // Footer
    'footer.tagline': 'Modern dealership management software with real-time insights.',
    'footer.industry': 'Dealership Automotive Sales',
    'footer.product': 'Product',
    'footer.legal': 'Legal',
    'footer.contact': 'Contact',
    'footer.support': 'For support or inquiries, please contact us at:',
    'footer.copyright': '© 2025 The DAS Board. All rights reserved. Designed with 🖤',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.subscription': 'Subscription Agreement',

    // Legal
    'legal.terms.title': 'Terms of Service',
    'legal.privacy.title': 'Privacy Policy',
    'legal.subscription.title': 'Subscription Agreement',

    // About
    'about.title': 'Who We Are',
    'about.subtitle':
      'Passionate professionals dedicated to revolutionizing dealership management through innovative technology and data-driven insights.',
    'about.founderVision.title': 'Why I Created The DAS Board – Tyler Durden, CEO and Founder',
    'about.founderVision.paragraph1':
      "With over 27 years of experience in the automotive dealership industry, I've seen firsthand the challenges managers face in balancing their roles as leaders and performers. As a seasoned professional, I founded The DAS Board to address a critical gap I observed: while Sales Managers excel at selling cars, they often struggle to effectively manage their sales teams.",
    'about.founderVision.paragraph2':
      'I believe that informed, motivated, and well-supported salespeople are the key to driving exceptional results—far surpassing the outcomes of disengaged or uninformed teams. The DAS Board empowers Sales Managers with intuitive tools to lead their teams more effectively, ensuring they can focus on both team development and sales excellence.',
    'about.founderVision.paragraph3':
      'Beyond sales, the app supports Finance Managers by providing real-time insights into deal profitability and key metrics, while offering GMs actionable reports to guide strategic decisions. My vision with The DAS Board is to revolutionize dealership management, fostering a culture of efficiency, transparency, and success across all levels of the organization.',
    'about.team.title': 'Our Team',
    'about.team.members.tyler.name': 'Tyler Durden',
    'about.team.members.tyler.role': 'CEO & Founder',
    'about.team.members.tyler.bio':
      'Drawing on extensive experience in dealership management, Tyler Durden founded The DAS Board to foster a culture where informed and motivated employees thrive, driving productivity through transparent, data-driven tools that empower automotive teams.',
    'about.team.members.sarah.name': 'Sarah Conner',
    'about.team.members.sarah.role': 'Chief Product Officer',
    'about.team.members.sarah.bio':
      'With over 25 years of dealership and retail experience, Sarah Conner brings deep insights into achieving sales success. She understands the power of effective tools and skilled management to inspire teams, ensuring The DAS Board drives exceptional results for dealerships.',
    'about.team.members.claude.name': 'Claude Sonnet',
    'about.team.members.claude.role': 'Chief Technology Officer',
    'about.team.members.claude.bio':
      'Claude Sonnet brings deep expertise in crafting software that excels, with a focus on scalable, secure platforms. His ability to deliver insights without complexity ensures The DAS Board provides seamless, reliable technology for dealerships.',
    'about.team.members.annie.name': 'Annie Porter',
    'about.team.members.annie.role': 'Customer Success Director',
    'about.team.members.annie.bio':
      'Dedicated to ensuring every DAS Board customer gets the most from our platform through personalized onboarding and support',
    'about.values.title': 'Our Values',
    'about.values.customerFocused.title': 'Customer-Focused',
    'about.values.customerFocused.description':
      'We empower automotive dealerships with intuitive dashboards that prioritize their unique needs, ensuring seamless management and enhanced customer experiences.',
    'about.values.dataDriven.title': 'Data-Driven',
    'about.values.dataDriven.description':
      'Our platform delivers real-time, actionable insights from dealership data, enabling precise decision-making to boost sales and operational efficiency.',
    'about.values.continuousImprovement.title': 'Continuous Improvement',
    'about.values.continuousImprovement.description':
      'We relentlessly refine our tools to help dealerships optimize performance, adapt to industry trends, and achieve sustained growth.',
    'about.contact.title': 'Get in Touch',
    'about.contact.subtitle':
      "Ready to see how The DAS Board can transform your dealership operations? We'd love to hear from you.",
    'about.contact.email': 'Email:',
    'about.contact.phone': 'Phone:',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.screenshots': 'Capturas',
    'nav.pricing': 'Precios',
    'nav.about': 'Nosotros',
    'nav.login': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'nav.legal': 'Legal',

    // Homepage
    'home.title': 'El DAS Board',
    'home.subtitle':
      'Tableros en tiempo real que proporcionan información crítica para gerentes financieros, concesionarios y grupos de concesionarios.',
    'home.startTrial': 'Comience su Prueba Gratuita',
    'home.viewScreenshots': 'Ver Capturas',
    'home.mission':
      '"El DAS Board redefine el éxito del concesionario, capacitando a los Gerentes de Ventas para optimizar equipos y a los Gerentes Financieros para maximizar las ganancias con información clave de ventas, y a los Vendedores para mantenerse al tanto de sus ofertas." - Tyler Durden',
    'home.features.title': 'Características Clave',
    'home.features.subtitle':
      'Todo lo que necesita para gestionar las operaciones de su concesionario de manera efectiva',
    'home.pricing.title': 'Pruébelo Ahora',
    'home.pricing.subtitle':
      'Comience su prueba gratuita y vea la diferencia que pueden hacer los insights en tiempo real para su concesionario.',
    'home.cta.title': '¿Listo para transformar las operaciones de su concesionario?',
    'home.cta.subtitle':
      'Únase a cientos de concesionarios que ya usan El DAS Board para optimizar sus operaciones.',

    // Features
    'features.finance.title': 'Tableros Financieros',
    'features.finance.desc':
      'Información en tiempo real para que los gerentes financieros rastreen el rendimiento diario, registren ofertas, vean métricas incluyendo PVR, VSC y otros Productos.',
    'features.sales.title': 'Tableros del Equipo de Ventas',
    'features.sales.desc':
      '¡El Das Board es su nueva Tabla de Clasificación! Mantenga un registro de sus ofertas y sepa exactamente dónde está durante el mes.',
    'features.manager.title': 'Tableros del Gerente de Ventas',
    'features.manager.desc':
      'Vea Registros de Ofertas, estadísticas de Vendedores, gestione sus Equipos de manera más efectiva.',
    'features.info.title': 'Tableros Informativos',
    'features.info.desc':
      'Tableros específicos por rol para Equipos de Ventas, Gerentes Financieros, Gerentes de Ventas y Gerentes Generales.',
    'features.scheduler.title': 'Programador Dinámico',
    'features.scheduler.desc':
      'Programador dinámico de vendedores para coordinación eficiente del equipo. Gestione horarios para maximizar la producción diaria.',
    'features.calculator.title': 'Calculadora de Pagos',
    'features.calculator.desc':
      'Su Equipo de Ventas y Gerentes Financieros podrán ver las ganancias en tiempo real del mes hasta la fecha con planes de pago preconfigurados.',

    // Pricing
    'pricing.title': 'Elija el Plan Perfecto',
    'pricing.subtitle':
      'Comience con nuestra prueba gratuita para gerentes financieros, o elija el plan que se adapte a su concesionario.',
    'pricing.finance': 'Gerente Financiero',
    'pricing.dealership': 'Concesionario Individual',
    'pricing.group': 'Grupos de Concesionarios',
    'pricing.freeTime': '¡Gratis por Tiempo Limitado!',
    'pricing.getStarted': 'Comenzar',
    'pricing.startTrial': 'Iniciar Prueba Gratuita',
    'pricing.popular': 'Más Popular',

    // Footer
    'footer.tagline':
      'Software moderno de gestión de concesionarios con información en tiempo real.',
    'footer.industry': 'Ventas Automotrices de Concesionarios',
    'footer.product': 'Producto',
    'footer.legal': 'Legal',
    'footer.contact': 'Contacto',
    'footer.support': 'Para soporte o consultas, por favor contáctenos en:',
    'footer.copyright': '© 2025 The DAS Board. Todos los derechos reservados. Diseñado con 🖤',
    'footer.terms': 'Términos de Servicio',
    'footer.privacy': 'Política de Privacidad',
    'footer.subscription': 'Acuerdo de Suscripción',

    // Legal
    'legal.terms.title': 'Términos de Servicio',
    'legal.privacy.title': 'Política de Privacidad',
    'legal.subscription.title': 'Acuerdo de Suscripción',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.screenshots': 'Captures',
    'nav.pricing': 'Tarifs',
    'nav.about': 'À Propos',
    'nav.login': 'Connexion',
    'nav.signup': "S'inscrire",
    'nav.legal': 'Légal',

    // Homepage
    'home.title': 'Le DAS Board',
    'home.subtitle':
      'Tableaux de bord en temps réel fournissant des informations critiques pour les gestionnaires financiers, les concessionnaires et les groupes de concessionnaires.',
    'home.startTrial': 'Commencez Votre Essai Gratuit',
    'home.viewScreenshots': 'Voir les Captures',
    'home.mission':
      '"Le DAS Board redéfinit le succès des concessionnaires, permettant aux Gestionnaires des Ventes d\'optimiser les équipes et aux Gestionnaires Financiers de maximiser les profits avec des informations clés sur les ventes, et aux Vendeurs de rester au courant de leurs affaires." - Tyler Durden',
    'home.features.title': 'Fonctionnalités Clés',
    'home.features.subtitle':
      'Tout ce dont vous avez besoin pour gérer efficacement les opérations de votre concessionnaire',
    'home.pricing.title': 'Essayez Maintenant',
    'home.pricing.subtitle':
      'Commencez votre essai gratuit et voyez la différence que peuvent faire les insights en temps réel pour votre concessionnaire.',
    'home.cta.title': 'Prêt à transformer les opérations de votre concessionnaire?',
    'home.cta.subtitle':
      'Rejoignez des centaines de concessionnaires utilisant déjà Le DAS Board pour optimiser leurs opérations.',

    // Pricing
    'pricing.title': 'Choisissez le Plan Parfait',
    'pricing.subtitle':
      "Commencez avec notre essai gratuit pour les gestionnaires financiers, ou choisissez le plan qui s'adapte à votre concessionnaire.",
    'pricing.finance': 'Gestionnaire Financier',
    'pricing.dealership': 'Concessionnaire Unique',
    'pricing.group': 'Groupes de Concessionnaires',
    'pricing.freeTime': 'Gratuit pour une Durée Limitée!',
    'pricing.getStarted': 'Commencer',
    'pricing.startTrial': "Commencer l'Essai Gratuit",
    'pricing.popular': 'Le Plus Populaire',

    // Footer
    'footer.tagline':
      'Logiciel moderne de gestion de concessionnaire avec des informations en temps réel.',
    'footer.industry': 'Ventes Automobiles de Concessionnaires',
    'footer.product': 'Produit',
    'footer.legal': 'Légal',
    'footer.contact': 'Contact',
    'footer.support': 'Pour le support ou les demandes, veuillez nous contacter à:',
    'footer.copyright': '© 2025 The DAS Board. Tous droits réservés. Conçu avec 🖤',
    'footer.terms': 'Conditions de Service',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.subscription': "Accord d'Abonnement",

    // Legal
    'legal.terms.title': 'Conditions de Service',
    'legal.privacy.title': 'Politique de Confidentialité',
    'legal.subscription.title': "Accord d'Abonnement",
  },
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.screenshots': 'Screenshots',
    'nav.pricing': 'Preise',
    'nav.about': 'Über uns',
    'nav.login': 'Anmelden',
    'nav.signup': 'Registrieren',
    'nav.legal': 'Rechtliches',

    // Homepage
    'home.title': 'Das DAS Board',
    'home.subtitle':
      'Echtzeit-Dashboards mit wichtigen Einblicken für Finanzmanager, Autohäuser und Autohausgruppen.',
    'home.startTrial': 'Starten Sie Ihre Kostenlose Testversion',
    'home.viewScreenshots': 'Screenshots Ansehen',
    'home.mission':
      '"Das DAS Board definiert den Erfolg von Autohäusern neu, ermöglicht Verkaufsleitern die Optimierung von Teams und Finanzmanagern die Maximierung von Gewinnen mit wichtigen Verkaufseinblicken, und Verkäufern, über ihre Geschäfte auf dem Laufenden zu bleiben." - Tyler Durden',
    'home.features.title': 'Hauptmerkmale',
    'home.features.subtitle':
      'Alles was Sie brauchen, um die Abläufe Ihres Autohauses effektiv zu verwalten',
    'home.pricing.title': 'Jetzt Ausprobieren',
    'home.pricing.subtitle':
      'Starten Sie Ihre kostenlose Testversion und sehen Sie den Unterschied, den Echtzeit-Einblicke für Ihr Autohaus machen können.',
    'home.cta.title': 'Bereit, die Abläufe Ihres Autohauses zu transformieren?',
    'home.cta.subtitle':
      'Schließen Sie sich Hunderten von Autohäusern an, die bereits Das DAS Board verwenden, um ihre Abläufe zu optimieren.',

    // Pricing
    'pricing.title': 'Wählen Sie den Perfekten Plan',
    'pricing.subtitle':
      'Beginnen Sie mit unserer kostenlosen Testversion für Finanzmanager oder wählen Sie den Plan, der zu Ihrem Autohaus passt.',
    'pricing.finance': 'Finanzmanager',
    'pricing.dealership': 'Einzelnes Autohaus',
    'pricing.group': 'Autohausgruppen',
    'pricing.freeTime': 'Begrenzte Zeit Kostenlos!',
    'pricing.getStarted': 'Loslegen',
    'pricing.startTrial': 'Kostenlose Testversion Starten',
    'pricing.popular': 'Am Beliebtesten',

    // Footer
    'footer.tagline': 'Moderne Autohaus-Management-Software mit Echtzeit-Einblicken.',
    'footer.industry': 'Autohaus-Automobilverkäufe',
    'footer.product': 'Produkt',
    'footer.legal': 'Rechtliches',
    'footer.contact': 'Kontakt',
    'footer.support': 'Für Support oder Anfragen kontaktieren Sie uns bitte unter:',
    'footer.copyright': '© 2025 The DAS Board. Alle Rechte vorbehalten. Entworfen mit 🖤',
    'footer.terms': 'Nutzungsbedingungen',
    'footer.privacy': 'Datenschutzrichtlinie',
    'footer.subscription': 'Abonnement-Vereinbarung',

    // Legal
    'legal.terms.title': 'Nutzungsbedingungen',
    'legal.privacy.title': 'Datenschutzrichtlinie',
    'legal.subscription.title': 'Abonnement-Vereinbarung',
  },
  cs: {
    // Navigation
    'nav.home': 'Domů',
    'nav.screenshots': 'Snímky',
    'nav.pricing': 'Ceny',
    'nav.about': 'O nás',
    'nav.login': 'Přihlásit',
    'nav.signup': 'Registrovat',
    'nav.legal': 'Právní',

    // Homepage
    'home.title': 'DAS Board',
    'home.subtitle':
      'Dashboardy v reálném čase poskytující kritické poznatky pro finanční manažery, dealerství a skupiny dealerství.',
    'home.startTrial': 'Začněte Vaši Bezplatnou Zkušební Verzi',
    'home.viewScreenshots': 'Zobrazit Snímky',
    'home.features.title': 'Klíčové Funkce',
    'home.features.subtitle': 'Vše co potřebujete k efektivnímu řízení provozu vašeho dealerství',
    'home.pricing.title': 'Vyzkoušejte Nyní',
    'home.pricing.subtitle':
      'Začněte vaši bezplatnou zkušební verzi a uvidíte rozdíl, který mohou udělat poznatky v reálném čase pro vaše dealerství.',
    'home.cta.title': 'Připraveni transformovat provoz vašeho dealerství?',
    'home.cta.subtitle':
      'Připojte se ke stovkám dealerství, která již používají DAS Board k optimalizaci svých operací.',

    // Pricing
    'pricing.title': 'Vyberte Perfektní Plán',
    'pricing.subtitle':
      'Začněte s naší bezplatnou zkušební verzí pro finanční manažery, nebo si vyberte plán, který se hodí k vašemu dealerství.',
    'pricing.finance': 'Finanční Manažer',
    'pricing.dealership': 'Jednotlivé Dealerství',
    'pricing.group': 'Skupiny Dealerství',
    'pricing.freeTime': 'Zdarma na Omezenou Dobu!',
    'pricing.getStarted': 'Začít',
    'pricing.startTrial': 'Začít Bezplatnou Zkušební Verzi',
    'pricing.popular': 'Nejpopulárnější',

    // Footer
    'footer.tagline': 'Moderní software pro řízení dealerství s poznatky v reálném čase.',
    'footer.industry': 'Prodej Automobilů Dealerství',
    'footer.product': 'Produkt',
    'footer.legal': 'Právní',
    'footer.contact': 'Kontakt',
    'footer.support': 'Pro podporu nebo dotazy nás prosím kontaktujte na:',
    'footer.copyright': '© 2025 The DAS Board. Všechna práva vyhrazena. Navrženo s 🖤',
    'footer.terms': 'Podmínky Služby',
    'footer.privacy': 'Zásady Ochrany Soukromí',
    'footer.subscription': 'Smlouva o Předplatném',

    // Legal
    'legal.terms.title': 'Podmínky Služby',
    'legal.privacy.title': 'Zásady Ochrany Soukromí',
    'legal.subscription.title': 'Smlouva o Předplatném',
  },
  it: {
    // Navigation
    'nav.home': 'Home',
    'nav.screenshots': 'Screenshot',
    'nav.pricing': 'Prezzi',
    'nav.about': 'Chi Siamo',
    'nav.login': 'Accedi',
    'nav.signup': 'Registrati',
    'nav.legal': 'Legale',

    // Homepage
    'home.title': 'Il DAS Board',
    'home.subtitle':
      'Dashboard in tempo reale che forniscono informazioni critiche per manager finanziari, concessionarie e gruppi di concessionarie.',
    'home.startTrial': 'Inizia la Tua Prova Gratuita',
    'home.viewScreenshots': 'Visualizza Screenshot',
    'home.features.title': 'Caratteristiche Principali',
    'home.features.subtitle':
      'Tutto ciò di cui hai bisogno per gestire efficacemente le operazioni della tua concessionaria',
    'home.pricing.title': 'Provalo Ora',
    'home.pricing.subtitle':
      'Inizia la tua prova gratuita e vedi la differenza che possono fare le informazioni in tempo reale per la tua concessionaria.',
    'home.cta.title': 'Pronto a trasformare le operazioni della tua concessionaria?',
    'home.cta.subtitle':
      'Unisciti a centinaia di concessionarie che già utilizzano Il DAS Board per ottimizzare le loro operazioni.',

    // Pricing
    'pricing.title': 'Scegli il Piano Perfetto',
    'pricing.subtitle':
      'Inizia con la nostra prova gratuita per manager finanziari, o scegli il piano che si adatta alla tua concessionaria.',
    'pricing.finance': 'Manager Finanziario',
    'pricing.dealership': 'Concessionaria Singola',
    'pricing.group': 'Gruppi di Concessionarie',
    'pricing.freeTime': 'Gratis per Tempo Limitato!',
    'pricing.getStarted': 'Inizia',
    'pricing.startTrial': 'Inizia Prova Gratuita',
    'pricing.popular': 'Più Popolare',

    // Footer
    'footer.tagline':
      'Software moderno di gestione concessionaria con informazioni in tempo reale.',
    'footer.industry': 'Vendite Automobilistiche Concessionarie',
    'footer.product': 'Prodotto',
    'footer.legal': 'Legale',
    'footer.contact': 'Contatto',
    'footer.support': 'Per supporto o richieste, contattaci a:',
    'footer.copyright': '© 2025 The DAS Board. Tutti i diritti riservati. Progettato con 🖤',
    'footer.terms': 'Termini di Servizio',
    'footer.privacy': 'Politica sulla Privacy',
    'footer.subscription': 'Accordo di Abbonamento',

    // Legal
    'legal.terms.title': 'Termini di Servizio',
    'legal.privacy.title': 'Politica sulla Privacy',
    'legal.subscription.title': 'Accordo di Abbonamento',
  },
  pl: {
    // Navigation
    'nav.home': 'Strona Główna',
    'nav.screenshots': 'Zrzuty Ekranu',
    'nav.pricing': 'Cennik',
    'nav.about': 'O Nas',
    'nav.login': 'Zaloguj',
    'nav.signup': 'Zarejestruj',
    'nav.legal': 'Prawne',

    // Homepage
    'home.title': 'DAS Board',
    'home.subtitle':
      'Dashboardy w czasie rzeczywistym dostarczające krytyczne spostrzeżenia dla menedżerów finansowych, dealerów i grup dealerskich.',
    'home.startTrial': 'Rozpocznij Darmową Wersję Próbną',
    'home.viewScreenshots': 'Zobacz Zrzuty Ekranu',
    'home.features.title': 'Kluczowe Funkcje',
    'home.features.subtitle':
      'Wszystko czego potrzebujesz do efektywnego zarządzania operacjami swojego dealera',
    'home.pricing.title': 'Wypróbuj Teraz',
    'home.pricing.subtitle':
      'Rozpocznij darmową wersję próbną i zobacz różnicę, jaką mogą zrobić spostrzeżenia w czasie rzeczywistym dla twojego dealera.',
    'home.cta.title': 'Gotowy na transformację operacji swojego dealera?',
    'home.cta.subtitle':
      'Dołącz do setek dealerów, którzy już używają DAS Board do optymalizacji swoich operacji.',

    // Pricing
    'pricing.title': 'Wybierz Idealny Plan',
    'pricing.subtitle':
      'Rozpocznij od naszej darmowej wersji próbnej dla menedżerów finansowych, lub wybierz plan, który pasuje do twojego dealera.',
    'pricing.finance': 'Menedżer Finansowy',
    'pricing.dealership': 'Pojedynczy Dealer',
    'pricing.group': 'Grupy Dealerskie',
    'pricing.freeTime': 'Darmowe przez Ograniczony Czas!',
    'pricing.getStarted': 'Rozpocznij',
    'pricing.startTrial': 'Rozpocznij Darmową Wersję Próbną',
    'pricing.popular': 'Najpopularniejszy',

    // Footer
    'footer.tagline':
      'Nowoczesne oprogramowanie do zarządzania dealerem z spostrzeżeniami w czasie rzeczywistym.',
    'footer.industry': 'Sprzedaż Samochodów Dealerskich',
    'footer.product': 'Produkt',
    'footer.legal': 'Prawne',
    'footer.contact': 'Kontakt',
    'footer.support': 'W celu uzyskania wsparcia lub zapytań, skontaktuj się z nami pod adresem:',
    'footer.copyright': '© 2025 The DAS Board. Wszelkie prawa zastrzeżone. Zaprojektowane z 🖤',
    'footer.terms': 'Warunki Usługi',
    'footer.privacy': 'Polityka Prywatności',
    'footer.subscription': 'Umowa Subskrypcji',

    // Legal
    'legal.terms.title': 'Warunki Usługi',
    'legal.privacy.title': 'Polityka Prywatności',
    'legal.subscription.title': 'Umowa Subskrypcji',
  },
  el: {
    // Navigation
    'nav.home': 'Αρχική',
    'nav.screenshots': 'Στιγμιότυπα',
    'nav.pricing': 'Τιμές',
    'nav.about': 'Σχετικά',
    'nav.login': 'Σύνδεση',
    'nav.signup': 'Εγγραφή',
    'nav.legal': 'Νομικά',

    // Homepage
    'home.title': 'Το DAS Board',
    'home.subtitle':
      'Dashboards σε πραγματικό χρόνο που παρέχουν κρίσιμες πληροφορίες για οικονομικούς διευθυντές, αντιπροσωπείες και ομάδες αντιπροσωπειών.',
    'home.startTrial': 'Ξεκινήστε τη Δωρεάν Δοκιμή',
    'home.viewScreenshots': 'Δείτε Στιγμιότυπα',
    'home.features.title': 'Βασικά Χαρακτηριστικά',
    'home.features.subtitle':
      'Όλα όσα χρειάζεστε για να διαχειριστείτε αποτελεσματικά τις λειτουργίες της αντιπροσωπείας σας',
    'home.pricing.title': 'Δοκιμάστε Τώρα',
    'home.pricing.subtitle':
      'Ξεκινήστε τη δωρεάν δοκιμή και δείτε τη διαφορά που μπορούν να κάνουν οι πληροφορίες σε πραγματικό χρόνο για την αντιπροσωπεία σας.',
    'home.cta.title': 'Έτοιμοι να μεταμορφώσετε τις λειτουργίες της αντιπροσωπείας σας;',
    'home.cta.subtitle':
      'Ενωθείτε με εκατοντάδες αντιπροσωπείες που ήδη χρησιμοποιούν το DAS Board για να βελτιστοποιήσουν τις λειτουργίες τους.',

    // Pricing
    'pricing.title': 'Επιλέξτε το Τέλειο Πλάνο',
    'pricing.subtitle':
      'Ξεκινήστε με τη δωρεάν δοκιμή για οικονομικούς διευθυντές, ή επιλέξτε το πλάνο που ταιριάζει στην αντιπροσωπεία σας.',
    'pricing.finance': 'Οικονομικός Διευθυντής',
    'pricing.dealership': 'Μεμονωμένη Αντιπροσωπεία',
    'pricing.group': 'Ομάδες Αντιπροσωπειών',
    'pricing.freeTime': 'Δωρεάν για Περιορισμένο Χρόνο!',
    'pricing.getStarted': 'Ξεκινήστε',
    'pricing.startTrial': 'Ξεκινήστε Δωρεάν Δοκιμή',
    'pricing.popular': 'Πιο Δημοφιλές',

    // Footer
    'footer.tagline':
      'Σύγχρονο λογισμικό διαχείρισης αντιπροσωπείας με πληροφορίες σε πραγματικό χρόνο.',
    'footer.industry': 'Πωλήσεις Αυτοκινήτων Αντιπροσωπειών',
    'footer.product': 'Προϊόν',
    'footer.legal': 'Νομικά',
    'footer.contact': 'Επικοινωνία',
    'footer.support': 'Για υποστήριξη ή ερωτήσεις, επικοινωνήστε μαζί μας στο:',
    'footer.copyright': '© 2025 The DAS Board. Όλα τα δικαιώματα διατηρούνται. Σχεδιασμένο με 🖤',
    'footer.terms': 'Όροι Υπηρεσίας',
    'footer.privacy': 'Πολιτική Απορρήτου',
    'footer.subscription': 'Συμφωνία Συνδρομής',

    // Legal
    'legal.terms.title': 'Όροι Υπηρεσίας',
    'legal.privacy.title': 'Πολιτική Απορρήτου',
    'legal.subscription.title': 'Συμφωνία Συνδρομής',
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.screenshots': 'Capturas',
    'nav.pricing': 'Preços',
    'nav.about': 'Sobre Nós',
    'nav.login': 'Entrar',
    'nav.signup': 'Registrar',
    'nav.legal': 'Legal',

    // Homepage
    'home.title': 'O DAS Board',
    'home.subtitle':
      'Dashboards em tempo real fornecendo insights críticos para gerentes financeiros, concessionárias e grupos de concessionárias.',
    'home.startTrial': 'Inicie Sua Avaliação Gratuita',
    'home.viewScreenshots': 'Ver Capturas',
    'home.features.title': 'Características Principais',
    'home.features.subtitle':
      'Tudo que você precisa para gerenciar efetivamente as operações da sua concessionária',
    'home.pricing.title': 'Experimente Agora',
    'home.pricing.subtitle':
      'Inicie sua avaliação gratuita e veja a diferença que insights em tempo real podem fazer para sua concessionária.',
    'home.cta.title': 'Pronto para transformar as operações da sua concessionária?',
    'home.cta.subtitle':
      'Junte-se a centenas de concessionárias que já usam O DAS Board para otimizar suas operações.',

    // Pricing
    'pricing.title': 'Escolha o Plano Perfeito',
    'pricing.subtitle':
      'Comece com nossa avaliação gratuita para gerentes financeiros, ou escolha o plano que se adapta à sua concessionária.',
    'pricing.finance': 'Gerente Financeiro',
    'pricing.dealership': 'Concessionária Individual',
    'pricing.group': 'Grupos de Concessionárias',
    'pricing.freeTime': 'Grátis por Tempo Limitado!',
    'pricing.getStarted': 'Começar',
    'pricing.startTrial': 'Iniciar Avaliação Gratuita',
    'pricing.popular': 'Mais Popular',

    // Footer
    'footer.tagline': 'Software moderno de gestão de concessionária com insights em tempo real.',
    'footer.industry': 'Vendas Automotivas de Concessionárias',
    'footer.product': 'Produto',
    'footer.legal': 'Legal',
    'footer.contact': 'Contato',
    'footer.support': 'Para suporte ou consultas, entre em contato conosco em:',
    'footer.copyright': '© 2025 The DAS Board. Todos os direitos reservados. Projetado com 🖤',
    'footer.terms': 'Termos de Serviço',
    'footer.privacy': 'Política de Privacidade',
    'footer.subscription': 'Acordo de Assinatura',

    // Legal
    'legal.terms.title': 'Termos de Serviço',
    'legal.privacy.title': 'Política de Privacidade',
    'legal.subscription.title': 'Acordo de Assinatura',
  },
};

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get language from localStorage or browser
    const saved = localStorage.getItem('dasboard-language');
    if (saved && Object.keys(translations).includes(saved)) {
      return saved as Language;
    }

    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('cs')) return 'cs';
    if (browserLang.startsWith('it')) return 'it';
    if (browserLang.startsWith('pl')) return 'pl';
    if (browserLang.startsWith('el')) return 'el';
    if (browserLang.startsWith('pt')) return 'pt';

    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('dasboard-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

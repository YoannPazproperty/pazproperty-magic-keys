
// Types pour l'objet de traductions
type TranslationData = Record<string, string>;
type TranslationsType = Record<string, TranslationData>;

// Traductions pour toutes les langues
export const translations: TranslationsType = {
  // Portugais (par défaut)
  pt: {
    // Navbar
    'nav.home': 'Início',
    'nav.services': 'Serviços',
    'nav.properties': 'Propriedades',
    'nav.about': 'Sobre Nós',
    'nav.contact': 'Contacto',
    'nav.declaration': 'Declara um sinistro',
    'nav.tech': 'Espace Technique',
    'nav.admin': 'Administration',
    
    // Hero Section
    'hero.title': 'Gestão de Arrendamentos Simplificada em Lisboa, Grande Lisboa e Margem Sul',
    'hero.tagline1': 'Your keys, our responsibilities',
    'hero.tagline2': 'As suas chaves, a nossa missão',
    'hero.contact': 'Fale Connosco',
    'hero.services': 'Nossos Serviços',
    
    // Services Overview
    'services.title': 'Nossos Serviços',
    'services.subtitle': 'Oferecemos uma gama completa de serviços para garantir que o seu imóvel esteja sempre bem cuidado e a gerar o máximo retorno.',
    'services.rental.title': 'Gestão de Arrendamentos',
    'services.rental.description': 'Gerimos todo o processo — desde a promoção do imóvel até à gestão diária, passando pela seleção de inquilinos e contratos.',
    'services.maintenance.title': 'Manutenção',
    'services.maintenance.description': 'Equipa de profissionais pronta para resolver qualquer questão de manutenção — desde pequenos reparos até grandes renovações.',
    'services.consulting.title': 'Consultoria',
    'services.consulting.description': 'Aconselhamento especializado sobre o mercado imobiliário em Lisboa, com foco em oportunidades de investimento e na otimização de rendimentos.',
    'services.viewAll': 'Ver Todos os Serviços',
    'services.learnMore': 'Saber mais',
    
    // Why Choose Us
    'why.title': 'Por Que Escolher a Pazproperty?',
    'why.subtitle': 'Com anos de experiência no mercado imobiliário lisboeta, oferecemos um serviço completo e personalizado para proprietários que valorizam tranquilidade, eficiência e confiança.',
    'why.local': 'Equipa Local',
    'why.local.desc': 'Conhecemos Lisboa como a palma da nossa mão.',
    'why.availability': 'Disponibilidade 24/7',
    'why.availability.desc': 'Sempre prontos para responder a qualquer emergência.',
    'why.tech': 'Tecnologia Avançada',
    'why.tech.desc': 'Sistema de gestão online para acompanhar tudo em tempo real.',
    'why.transparency': 'Transparência Total',
    'why.transparency.desc': 'Relatórios detalhados e comunicação constante.',
    
    // Contact CTA
    'cta.title': 'Pronto para simplificar a gestão do seu imóvel?',
    'cta.subtitle': 'Ligue já para nós e transforme o seu imóvel num rendimento seguro!',
    'cta.email': 'Seu e-mail',
    'cta.contact': 'Contactar',
    
    // About Story Section
    'story.title': 'A Nossa História',
    'story.p1': 'A PazProperty nasceu de uma paixão: a paixão por Lisboa — pelos seus bairros cheios de vida, pelos edifícios com história e pelo potencial de cada imóvel escondido entre o Tejo e as colinas.',
    'story.p2': 'Ao viver entre Portugal e o estrangeiro, percebemos uma realidade partilhada por muitos — não só investidores internacionais, mas também muitos portugueses: proprietários que valorizam os seus imóveis, mas que não querem — ou não podem — lidar com a gestão do dia a dia.',
    'story.p3': 'Foi com isso em mente que fundámos a PazProperty, em 2023. Mais do que uma empresa de gestão de arrendamentos, somos um parceiro de confiança. Cuidamos de cada propriedade como se fosse nossa — com proximidade, rigor e dedicação.',
    'story.p4': 'Combinamos tecnologia inteligente, processos transparentes e um atendimento humano, próximo e disponível. A nossa equipa é formada por profissionais experientes, apaixonados pelo setor imobiliário e por resolver problemas antes que eles aconteçam.',
    'story.p5': 'Hoje, a PazProperty é mais do que um nome — é uma promessa: a de transformar imóveis em rendimento, e preocupações em paz.',
    
    // Language Selector
    'lang.pt': 'Português',
    'lang.fr': 'Français',
    'lang.en': 'English',
  },
  
  // Français
  fr: {
    // Navbar
    'nav.home': 'Accueil',
    'nav.services': 'Services',
    'nav.properties': 'Propriétés',
    'nav.about': 'À Propos',
    'nav.contact': 'Contact',
    'nav.declaration': 'Déclarer un sinistre',
    'nav.tech': 'Espace Technique',
    'nav.admin': 'Administration',
    
    // Hero Section
    'hero.title': 'Gestion Locative Simplifiée à Lisbonne, Grand Lisbonne et Rive Sud',
    'hero.tagline1': 'Your keys, our responsibilities',
    'hero.tagline2': 'Vos clés, notre mission',
    'hero.contact': 'Contactez-nous',
    'hero.services': 'Nos Services',
    
    // Services Overview
    'services.title': 'Nos Services',
    'services.subtitle': 'Nous offrons une gamme complète de services pour garantir que votre bien immobilier soit toujours bien entretenu et génère un rendement maximal.',
    'services.rental.title': 'Gestion Locative',
    'services.rental.description': 'Nous gérons tout le processus — de la promotion du bien à la gestion quotidienne, en passant par la sélection des locataires et les contrats.',
    'services.maintenance.title': 'Maintenance',
    'services.maintenance.description': 'Une équipe de professionnels prête à résoudre tout problème de maintenance — des petites réparations aux grandes rénovations.',
    'services.consulting.title': 'Conseil',
    'services.consulting.description': 'Conseils spécialisés sur le marché immobilier de Lisbonne, avec un focus sur les opportunités d\'investissement et l\'optimisation des revenus.',
    'services.viewAll': 'Voir Tous les Services',
    'services.learnMore': 'En savoir plus',
    
    // Why Choose Us
    'why.title': 'Pourquoi Choisir Pazproperty?',
    'why.subtitle': 'Avec des années d\'expérience sur le marché immobilier lisboète, nous offrons un service complet et personnalisé pour les propriétaires qui valorisent la tranquillité, l\'efficacité et la confiance.',
    'why.local': 'Équipe Locale',
    'why.local.desc': 'Nous connaissons Lisbonne comme notre poche.',
    'why.availability': 'Disponibilité 24/7',
    'why.availability.desc': 'Toujours prêts à répondre à toute urgence.',
    'why.tech': 'Technologie Avancée',
    'why.tech.desc': 'Système de gestion en ligne pour suivre tout en temps réel.',
    'why.transparency': 'Transparence Totale',
    'why.transparency.desc': 'Rapports financiers détaillés et communication constante.',
    
    // Contact CTA
    'cta.title': 'Prêt à simplifier la gestion de votre bien immobilier?',
    'cta.subtitle': 'Appelez-nous dès maintenant et transformez votre propriété en un revenu sécurisé!',
    'cta.email': 'Votre e-mail',
    'cta.contact': 'Contacter',
    
    // About Story Section
    'story.title': 'Notre Histoire',
    'story.p1': 'PazProperty est née d\'une passion : la passion pour Lisbonne — pour ses quartiers pleins de vie, ses bâtiments chargés d\'histoire et le potentiel de chaque propriété cachée entre le Tage et les collines.',
    'story.p2': 'En vivant entre le Portugal et l\'étranger, nous avons constaté une réalité partagée par beaucoup — non seulement les investisseurs internationaux, mais aussi de nombreux Portugais : des propriétaires qui valorisent leurs biens, mais qui ne veulent pas — ou ne peuvent pas — s\'occuper de la gestion au jour le jour.',
    'story.p3': 'C\'est dans cet esprit que nous avons fondé PazProperty en 2023. Plus qu\'une société de gestion locative, nous sommes un partenaire de confiance. Nous prenons soin de chaque propriété comme si elle était la nôtre — avec proximité, rigueur et dévouement.',
    'story.p4': 'Nous combinons technologie intelligente, processus transparents et un service client humain, proche et disponible. Notre équipe est composée de professionnels expérimentés, passionnés par l\'immobilier et par la résolution des problèmes avant qu\'ils ne surviennent.',
    'story.p5': 'Aujourd\'hui, PazProperty est plus qu\'un nom — c\'est une promesse : celle de transformer des biens immobiliers en revenus, et des préoccupations en tranquillité.',
    
    // Language Selector
    'lang.pt': 'Português',
    'lang.fr': 'Français',
    'lang.en': 'English',
  },
  
  // English
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.properties': 'Properties',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.declaration': 'Report an incident',
    'nav.tech': 'Technical Portal',
    'nav.admin': 'Administration',
    
    // Hero Section
    'hero.title': 'Simplified Property Management in Lisbon, Greater Lisbon and South Bank',
    'hero.tagline1': 'Your keys, our responsibilities',
    'hero.tagline2': 'Your keys, our mission',
    'hero.contact': 'Contact Us',
    'hero.services': 'Our Services',
    
    // Services Overview
    'services.title': 'Our Services',
    'services.subtitle': 'We offer a complete range of services to ensure your property is always well maintained and generating maximum returns.',
    'services.rental.title': 'Rental Management',
    'services.rental.description': 'We manage the entire process — from property marketing to day-to-day management, including tenant selection and contracts.',
    'services.maintenance.title': 'Maintenance',
    'services.maintenance.description': 'Team of professionals ready to solve any maintenance issue — from small repairs to major renovations.',
    'services.consulting.title': 'Consulting',
    'services.consulting.description': 'Specialized advice on the Lisbon real estate market, focusing on investment opportunities and income optimization.',
    'services.viewAll': 'View All Services',
    'services.learnMore': 'Learn more',
    
    // Why Choose Us
    'why.title': 'Why Choose Pazproperty?',
    'why.subtitle': 'With years of experience in the Lisbon real estate market, we offer a complete and personalized service for property owners who value peace of mind, efficiency, and trust.',
    'why.local': 'Local Team',
    'why.local.desc': 'We know Lisbon like the back of our hand.',
    'why.availability': '24/7 Availability',
    'why.availability.desc': 'Always ready to respond to any emergency.',
    'why.tech': 'Advanced Technology',
    'why.tech.desc': 'Online management system to track everything in real time.',
    'why.transparency': 'Total Transparency',
    'why.transparency.desc': 'Detailed financial reports and constant communication.',
    
    // Contact CTA
    'cta.title': 'Ready to simplify your property management?',
    'cta.subtitle': 'Call us now and transform your property into a secure income!',
    'cta.email': 'Your email',
    'cta.contact': 'Contact',
    
    // About Story Section
    'story.title': 'Our Story',
    'story.p1': 'PazProperty was born from a passion: the passion for Lisbon — for its vibrant neighborhoods, historic buildings, and the potential of each property hidden between the Tagus River and the hills.',
    'story.p2': 'Living between Portugal and abroad, we noticed a reality shared by many — not only international investors but also many Portuguese: property owners who value their real estate but don\'t want — or can\'t — deal with day-to-day management.',
    'story.p3': 'It was with this in mind that we founded PazProperty in 2023. More than a rental management company, we are a trusted partner. We take care of each property as if it were our own — with proximity, rigor, and dedication.',
    'story.p4': 'We combine intelligent technology, transparent processes, and human, accessible, and available customer service. Our team consists of experienced professionals who are passionate about real estate and solving problems before they happen.',
    'story.p5': 'Today, PazProperty is more than a name — it\'s a promise: to transform properties into income, and concerns into peace of mind.',
    
    // Language Selector
    'lang.pt': 'Português',
    'lang.fr': 'Français',
    'lang.en': 'English',
  }
};

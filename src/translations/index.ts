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
    'hero.title': 'Gestão de Arrendamentos em Lisboa, Grande Lisboa e Margem Sul',
    'hero.simplified': 'Simplificada',
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
    
    // Services Page
    'services.hero.title': 'Nossos Serviços',
    'services.hero.subtitle': 'Soluções personalizadas para proprietários em Lisboa',
    'services.hero.description': 'Descubra como a nossa gestão especializada pode maximizar o potencial do seu imóvel enquanto lhe oferece total tranquilidade.',
    
    // Services Page - CTA
    'services.cta.title': 'Pronto para começar?',
    'services.cta.description': 'Entre em contacto connosco para discutir as suas necessidades e como podemos ajudar a maximizar o valor do seu imóvel em Lisboa.',
    'services.cta.button': 'Fale Connosco Hoje',
    
    // Services Grid
    'services.grid.title': 'Todos os Nossos Serviços',
    'services.grid.description': 'Conheça a gama completa de serviços que oferecemos para garantir uma gestão imobiliária sem complicações.',
    
    // Properties Page
    'properties.hero.title': 'Propriedades Geridas',
    'properties.hero.description': 'Descubra a seleção de propriedades de alta qualidade que gerimos em Lisboa. Cada uma é cuidada com a máxima atenção aos detalhes.',
    'properties.search': 'Pesquisar propriedades...',
    'properties.rooms': 'Nº de Quartos',
    'properties.studio': 'Estúdio',
    'properties.bedroom': 'Quarto',
    'properties.bedrooms': 'Quartos',
    'properties.location': 'Localização',
    'properties.details': 'Ver Detalhes',
    'properties.month': '/mês',
    'properties.notfound': 'Nenhuma propriedade encontrada',
    'properties.adjustsearch': 'Tente ajustar os seus critérios de pesquisa.',
    
    // Properties CTA
    'properties.cta.title': 'Procura gestão para a sua propriedade?',
    'properties.cta.description': 'A Pazproperty oferece serviços completos de gestão que maximizam o retorno do seu investimento enquanto minimizam as suas preocupações.',
    'properties.cta.button': 'Fale Connosco Hoje',
    
    // Contact Page
    'contact.hero.title': 'Entre em Contacto',
    
    // Contact Form
    'contact.info.title': 'Informações de Contacto',
    'contact.phone': 'Telefone',
    'contact.phone.hours': 'Seg-Sex: 9:00 - 18:00',
    'contact.email': 'Email',
    'contact.email.response': 'Respondemos em 24 horas',
    'contact.address': 'Morada',
    'contact.address.hours': 'Seg-Sex: 9:00 - 18:00 (com marcação)',
    
    'contact.hours.title': 'Horário de Funcionamento',
    'contact.hours.monday': 'Segunda-Feira',
    'contact.hours.tuesday': 'Terça-Feira',
    'contact.hours.wednesday': 'Quarta-Feira',
    'contact.hours.thursday': 'Quinta-Feira',
    'contact.hours.friday': 'Sexta-Feira',
    'contact.hours.saturday': 'Sábado',
    'contact.hours.sunday': 'Domingo',
    'contact.hours.closed': 'Fechado',
    
    'contact.form.title': 'Envie-nos uma Mensagem',
    'contact.form.name': 'Nome Completo',
    'contact.form.name.placeholder': 'Seu nome completo',
    'contact.form.email': 'Email',
    'contact.form.email.placeholder': 'Seu email',
    'contact.form.phone': 'Telefone',
    'contact.form.phone.placeholder': 'Seu telefone',
    'contact.form.message': 'Mensagem',
    'contact.form.message.placeholder': 'Como podemos ajudar?',
    'contact.form.submit': 'Enviar Mensagem',
    'contact.form.sending': 'A enviar...',
    'contact.form.type.owner': 'Proprietário',
    'contact.form.type.tenant': 'Inquilino',
    'contact.form.type.prospect': 'Potencial Cliente',
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
    'hero.title': 'Gestion Locative à Lisbonne, Grand Lisbonne et Rive Sud',
    'hero.simplified': 'Simplifiée',
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
    
    // Services Page
    'services.hero.title': 'Nos Services',
    'services.hero.subtitle': 'Solutions personnalisées pour propriétaires à Lisbonne',
    'services.hero.description': 'Découvrez comment notre gestion spécialisée peut maximiser le potentiel de votre bien immobilier tout en vous offrant une tranquillité totale.',
    
    // Services Page - CTA
    'services.cta.title': 'Prêt à commencer?',
    'services.cta.description': 'Contactez-nous pour discuter de vos besoins et comment nous pouvons vous aider à maximiser la valeur de votre propriété à Lisbonne.',
    'services.cta.button': 'Contactez-Nous Aujourd\'hui',
    
    // Services Grid
    'services.grid.title': 'Tous Nos Services',
    'services.grid.description': 'Découvrez la gamme complète de services que nous offrons pour garantir une gestion immobilière sans complications.',
    
    // Properties Page
    'properties.hero.title': 'Propriétés Gérées',
    'properties.hero.description': 'Découvrez notre sélection de propriétés de haute qualité que nous gérons à Lisbonne. Chacune est entretenue avec la plus grande attention aux détails.',
    'properties.search': 'Rechercher des propriétés...',
    'properties.rooms': 'Nombre de Chambres',
    'properties.studio': 'Studio',
    'properties.bedroom': 'Chambre',
    'properties.bedrooms': 'Chambres',
    'properties.location': 'Emplacement',
    'properties.details': 'Voir Détails',
    'properties.month': '/mois',
    'properties.notfound': 'Aucune propriété trouvée',
    'properties.adjustsearch': 'Essayez d\'ajuster vos critères de recherche.',
    
    // Properties CTA
    'properties.cta.title': 'Vous recherchez une gestion pour votre propriété?',
    'properties.cta.description': 'Pazproperty offre des services complets de gestion qui maximisent le retour sur votre investissement tout en minimisant vos préoccupations.',
    'properties.cta.button': 'Contactez-Nous Aujourd\'hui',
    
    // Contact Page
    'contact.hero.title': 'Contactez-Nous',
    
    // Contact Form
    'contact.info.title': 'Informations de Contact',
    'contact.phone': 'Téléphone',
    'contact.phone.hours': 'Lun-Ven: 9:00 - 18:00',
    'contact.email': 'Email',
    'contact.email.response': 'Nous répondons sous 24 heures',
    'contact.address': 'Adresse',
    'contact.address.hours': 'Lun-Ven: 9:00 - 18:00 (sur rendez-vous)',
    
    'contact.hours.title': 'Heures d\'Ouverture',
    'contact.hours.monday': 'Lundi',
    'contact.hours.tuesday': 'Mardi',
    'contact.hours.wednesday': 'Mercredi',
    'contact.hours.thursday': 'Jeudi',
    'contact.hours.friday': 'Vendredi',
    'contact.hours.saturday': 'Samedi',
    'contact.hours.sunday': 'Dimanche',
    'contact.hours.closed': 'Fermé',
    
    'contact.form.title': 'Envoyez-nous un Message',
    'contact.form.name': 'Nom Complet',
    'contact.form.name.placeholder': 'Votre nom complet',
    'contact.form.email': 'Email',
    'contact.form.email.placeholder': 'Votre email',
    'contact.form.phone': 'Téléphone',
    'contact.form.phone.placeholder': 'Votre téléphone',
    'contact.form.message': 'Message',
    'contact.form.message.placeholder': 'Comment pouvons-nous vous aider?',
    'contact.form.submit': 'Envoyer le Message',
    'contact.form.sending': 'Envoi en cours...',
    'contact.form.type.owner': 'Propriétaire',
    'contact.form.type.tenant': 'Locataire',
    'contact.form.type.prospect': 'Prospect',
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
    'hero.title': 'Property Management in Lisbon, Greater Lisbon and South Bank',
    'hero.simplified': 'Simplified',
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
    
    // Services Page
    'services.hero.title': 'Our Services',
    'services.hero.subtitle': 'Custom solutions for property owners in Lisbon',
    'services.hero.description': 'Discover how our specialized management can maximize your property\'s potential while providing you with complete peace of mind.',
    
    // Services Page - CTA
    'services.cta.title': 'Ready to get started?',
    'services.cta.description': 'Contact us to discuss your needs and how we can help maximize the value of your property in Lisbon.',
    'services.cta.button': 'Contact Us Today',
    
    // Services Grid
    'services.grid.title': 'All Our Services',
    'services.grid.description': 'Explore the full range of services we offer to ensure hassle-free property management.',
    
    // Properties Page
    'properties.hero.title': 'Managed Properties',
    'properties.hero.description': 'Discover our selection of high-quality properties that we manage in Lisbon. Each one is maintained with the utmost attention to detail.',
    'properties.search': 'Search properties...',
    'properties.rooms': 'Number of Rooms',
    'properties.studio': 'Studio',
    'properties.bedroom': 'Bedroom',
    'properties.bedrooms': 'Bedrooms',
    'properties.location': 'Location',
    'properties.details': 'View Details',
    'properties.month': '/month',
    'properties.notfound': 'No properties found',
    'properties.adjustsearch': 'Try adjusting your search criteria.',
    
    // Properties CTA
    'properties.cta.title': 'Looking for management for your property?',
    'properties.cta.description': 'Pazproperty offers complete management services that maximize the return on your investment while minimizing your worries.',
    'properties.cta.button': 'Contact Us Today',
    
    // Contact Page
    'contact.hero.title': 'Contact Us',
    
    // Contact Form
    'contact.info.title': 'Contact Information',
    'contact.phone': 'Phone',
    'contact.phone.hours': 'Mon-Fri: 9:00 - 18:00',
    'contact.email': 'Email',
    'contact.email.response': 'We respond within 24 hours',
    'contact.address': 'Address',
    'contact.address.hours': 'Mon-Fri: 9:00 - 18:00 (by appointment)',
    
    'contact.hours.title': 'Business Hours',
    'contact.hours.monday': 'Monday',
    'contact.hours.tuesday': 'Tuesday',
    'contact.hours.wednesday': 'Wednesday',
    'contact.hours.thursday': 'Thursday',
    'contact.hours.friday': 'Friday',
    'contact.hours.saturday': 'Saturday',
    'contact.hours.sunday': 'Sunday',
    'contact.hours.closed': 'Closed',
    
    'contact.form.title': 'Send Us a Message',
    'contact.form.name': 'Full Name',
    'contact.form.name.placeholder': 'Your full name',
    'contact.form.email': 'Email',
    'contact.form.email.placeholder': 'Your email',
    'contact.form.phone': 'Phone',
    'contact.form.phone.placeholder': 'Your phone number',
    'contact.form.message': 'Message',
    'contact.form.message.placeholder': 'How can we help you?',
    'contact.form.submit': 'Send Message',
    'contact.form.sending': 'Sending...',
    'contact.form.type.owner': 'Owner',
    'contact.form.type.tenant': 'Tenant',
    'contact.form.type.prospect': 'Prospect',
  }
};

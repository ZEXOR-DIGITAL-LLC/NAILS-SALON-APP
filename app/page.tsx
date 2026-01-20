'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type Language = 'EN' | 'ES' | 'FR' | 'PT';

// ============================================================================ 
// TRANSLATIONS
// ============================================================================ 
const translations = {
  nav: {
    features: { EN: 'Features', ES: 'Funciones', FR: 'Fonctionnalités', PT: 'Recursos' },
    howItWorks: { EN: 'How It Works', ES: 'Cómo Funciona', FR: 'Comment Ça Marche', PT: 'Como Funciona' },
    faq: { EN: 'FAQ', ES: 'Preguntas', FR: 'FAQ', PT: 'Perguntas' },
    download: { EN: 'Download App', ES: 'Descargar App', FR: "Télécharger", PT: 'Baixar App' },
  },
  hero: {
    headline: {
      EN: 'Organize your bookings like a pro.',
      ES: 'Organiza tus reservas como un profesional.',
      FR: 'Organisez vos réservations comme une pro.',
      PT: 'Organize seus agendamentos como uma profissional.',
    },
    subheadline: {
      EN: 'The simplest booking app for salon owners and nail techs. Manage appointments, clients, employees, inventory, and revenue in one place.',
      ES: 'La app de reservas más simple para dueños de salones y técnicas de uñas. Gestiona citas, clientes, empleados, inventario e ingresos en un solo lugar.',
      FR: "L'application de réservation la plus simple pour les propriétaires de salons et techniciennes ongulaires. Gérez rendez-vous, clients, employés, inventaire et revenus.",
      PT: 'O app de agendamento mais simples para donos de salões e manicures. Gerencie agendamentos, clientes, funcionários, inventário e receitas em um só lugar.',
    },
    primaryCTA: {
      EN: 'Download for iOS',
      ES: 'Descargar para iOS',
      FR: "Télécharger pour iOS",
      PT: 'Baixar para iOS',
    },
    secondaryCTA: {
      EN: 'See How It Works',
      ES: 'Ver Cómo Funciona',
      FR: 'Voir Comment Ça Marche',
      PT: 'Veja Como Funciona',
    },
    badge: {
      EN: 'For Salon Owners',
      ES: 'Para Dueños de Salón',
      FR: 'Pour Propriétaires de Salon',
      PT: 'Para Donos de Salão',
    },
    bullets: {
      EN: [
        'Live dashboard status',
        "Employee management",
        'Inventory tracking',
      ],
      ES: [
        'Estado en tiempo real',
        'Gestión de empleados',
        'Control de inventario',
      ],
      FR: [
        'Tableau de bord en direct',
        "Gestion des employés",
        'Suivi d\'inventaire',
      ],
      PT: [
        'Painel em tempo real',
        'Gestão de funcionários',
        'Controle de estoque',
      ],
    },
  },
  problem: {
    badge: { EN: 'Sound familiar?', ES: '¿Te suena familiar?', FR: 'Ça vous parle ?', PT: 'Parece familiar?' },
    headline: {
      EN: 'Running a salon without the right tools?',
      ES: '¿Manejando un salón sin las herramientas correctas?',
      FR: 'Gérer un salon sans les bons outils ?',
      PT: 'Gerenciando um salão sem as ferramentas certas?',
    },
    bullets: {
      EN: [
        '"I spend hours coordinating schedules between my team instead of serving clients."',
        '"I never know which products are running low until we run out completely."',
        '"Tracking revenue across multiple employees is a nightmare with spreadsheets."',
        '"Clients book through WhatsApp and Instagram DMs—it\'s impossible to keep organized."',
        '"I can\'t see who\'s busy and who\'s available without walking through the salon."',
      ],
      ES: [
        '"Paso horas coordinando horarios entre mi equipo en lugar de atender clientes."',
        '"Nunca sé qué productos se están acabando hasta que se agotan por completo."',
        '"Rastrear ingresos de múltiples empleados es una pesadilla con hojas de cálculo."',
        '"Los clientes reservan por WhatsApp e Instagram DMs—es imposible mantenerse organizado."',
        '"No puedo ver quién está ocupado y quién disponible sin caminar por todo el salón."',
      ],
      FR: [
        '"Je passe des heures à coordonner les horaires de mon équipe au lieu de servir les clientes."',
        '"Je ne sais jamais quels produits sont bas jusqu\'à ce qu\'ils soient épuisés."',
        '"Suivre les revenus de plusieurs employés est un cauchemar avec des tableurs."',
        '"Les clientes réservent via WhatsApp et DM Instagram—impossible de rester organisé."',
        '"Je ne peux pas voir qui est occupé sans faire le tour du salon."',
      ],
      PT: [
        '"Passo horas coordenando horários entre minha equipe em vez de atender clientes."',
        '"Nunca sei quais produtos estão acabando até que acabem completamente."',
        '"Rastrear receitas de múltiplos funcionários é um pesadelo com planilhas."',
        '"Clientes agendam por WhatsApp e DMs do Instagram—é impossível manter organizado."',
        '"Não consigo ver quem está ocupado e quem está disponível sem andar pelo salão."',
      ],
    },
  },
  solution: {
    badge: { EN: 'The Solution', ES: 'La Solución', FR: 'La Solution', PT: 'A Solução' },
    headline: {
      EN: "Here's how Nails Salon makes running your business easy",
      ES: 'Así es como Nails Salon hace que manejar tu negocio sea fácil',
      FR: 'Voici comment Nails Salon facilite la gestion de votre salon',
      PT: 'Veja como o Nails Salon facilita a gestão do seu negócio',
    },
    liveNow: { EN: 'Available Now', ES: 'Disponible Ahora', FR: 'Disponible Maintenant', PT: 'Disponível Agora' },
    steps: {
      EN: [
        { title: 'Register Your Salon', description: 'Sign up and create your salon profile. Add your business info, working hours, services, and team members. Get your personal booking link in minutes.' },
        { title: 'Manage Your Team', description: 'Add employees with color-coded profiles. Assign appointments to team members and track who\'s available in real-time from your live dashboard.' },
        { title: 'Track Everything', description: 'Monitor appointments, inventory levels, and revenue in one place. Get alerts for low stock, view earnings by date range, and export reports.' },
        { title: 'Grow Your Business', description: 'Share your booking link to let clients schedule directly. Build your work gallery to showcase nail art and attract new customers.' },
      ],
      ES: [
        { title: 'Registra Tu Salón', description: 'Regístrate y crea el perfil de tu salón. Agrega info de negocio, horarios, servicios y miembros del equipo. Obtén tu link de reservas en minutos.' },
        { title: 'Gestiona Tu Equipo', description: 'Agrega empleados con perfiles de colores. Asigna citas a miembros del equipo y rastrea quién está disponible en tiempo real.' },
        { title: 'Rastrea Todo', description: 'Monitorea citas, niveles de inventario e ingresos en un solo lugar. Recibe alertas de bajo stock, ve ganancias por rango de fecha.' },
        { title: 'Haz Crecer Tu Negocio', description: 'Comparte tu link de reservas para que los clientes agenden directamente. Crea tu galería de trabajos para mostrar nail art.' },
      ],
      FR: [
        { title: 'Enregistrez Votre Salon', description: 'Inscrivez-vous et créez votre profil de salon. Ajoutez vos infos, horaires, services et membres de l\'équipe. Obtenez votre lien de réservation.' },
        { title: 'Gérez Votre Équipe', description: 'Ajoutez des employés avec des profils colorés. Assignez des rendez-vous et suivez qui est disponible en temps réel.' },
        { title: 'Suivez Tout', description: 'Surveillez rendez-vous, niveaux d\'inventaire et revenus en un seul endroit. Recevez des alertes de stock bas.' },
        { title: 'Développez Votre Activité', description: 'Partagez votre lien de réservation pour que les clientes réservent directement. Créez votre galerie pour montrer votre nail art.' },
      ],
      PT: [
        { title: 'Registre Seu Salão', description: 'Cadastre-se e crie o perfil do seu salão. Adicione info do negócio, horários, serviços e membros da equipe. Obtenha seu link de agendamento.' },
        { title: 'Gerencie Sua Equipe', description: 'Adicione funcionários com perfis coloridos. Atribua agendamentos a membros da equipe e acompanhe quem está disponível em tempo real.' },
        { title: 'Rastreie Tudo', description: 'Monitore agendamentos, níveis de estoque e receitas em um só lugar. Receba alertas de estoque baixo e exporte relatórios.' },
        { title: 'Cresça Seu Negócio', description: 'Compartilhe seu link de agendamento para clientes agendarem diretamente. Crie sua galeria de trabalhos para mostrar nail art.' },
      ],
    },
  },
  features: {
    badge: { EN: 'Features', ES: 'Funciones', FR: 'Fonctionnalités', PT: 'Recursos' },
    headline: {
      EN: 'Everything you need to run your nail business',
      ES: 'Todo lo que necesitas para manejar tu negocio de uñas',
      FR: 'Tout ce dont vous avez besoin pour gérer votre activité',
      PT: 'Tudo que você precisa para gerenciar seu negócio de unhas',
    },
    items: {
      EN: [
        { name: 'Live Dashboard', benefit: 'See real-time status of your salon: who\'s being served, who\'s next, and time remaining. Toggle your salon open/closed with one tap.' },
        { name: 'Online Booking', benefit: 'Clients book appointments through your personal link. No more WhatsApp chaos—just organized, professional scheduling.' },
        { name: 'Employee Management', benefit: 'Add team members with color-coded profiles, track availability, and assign appointments. See who\'s busy and who\'s available at a glance.' },
        { name: 'Inventory Tracking', benefit: 'Manage stock levels with alerts for low inventory, expiration dates, and supplier info. Export reports to Excel anytime.' },
        { name: 'Revenue Analytics', benefit: 'Track earnings by day, week, or month. Filter by client and see total revenue with detailed transaction history.' },
        { name: 'Work Gallery', benefit: 'Showcase your best nail art with photo galleries. Create multiple albums to display your skills and attract new clients.' },
        { name: 'Smart Calendar', benefit: 'View daily, weekly, and monthly schedules. See pending, in-service, completed, and cancelled appointments at once.' },
        { name: 'Client Profiles', benefit: 'Store contact info, visit history, preferences, and favorite designs for each client. Personal touch, every time.' },
        { name: 'Multilingual Support', benefit: 'Switch between English, Spanish, French, and Portuguese. Serve diverse clients in their preferred language.' },
      ],
      ES: [
        { name: 'Panel en Vivo', benefit: 'Ve el estado en tiempo real de tu salón: quién está siendo atendido, quién sigue, y tiempo restante. Abre/cierra tu salón con un toque.' },
        { name: 'Reservas Online', benefit: 'Los clientes reservan citas a través de tu link personal. Sin caos de WhatsApp—solo agendamiento organizado y profesional.' },
        { name: 'Gestión de Empleados', benefit: 'Agrega miembros del equipo con perfiles de colores, rastrea disponibilidad y asigna citas. Ve quién está ocupado de un vistazo.' },
        { name: 'Control de Inventario', benefit: 'Gestiona niveles de stock con alertas de bajo inventario, fechas de vencimiento e info de proveedores. Exporta reportes a Excel.' },
        { name: 'Análisis de Ingresos', benefit: 'Rastrea ganancias por día, semana o mes. Filtra por cliente y ve ingresos totales con historial detallado.' },
        { name: 'Galería de Trabajos', benefit: 'Muestra tu mejor nail art con galerías de fotos. Crea múltiples álbumes para exhibir tus habilidades.' },
        { name: 'Calendario Inteligente', benefit: 'Ve agendas diarias, semanales y mensuales. Ve citas pendientes, en servicio, completadas y canceladas de una vez.' },
        { name: 'Perfiles de Clientes', benefit: 'Guarda info de contacto, historial de visitas, preferencias y diseños favoritos de cada cliente.' },
        { name: 'Soporte Multilingüe', benefit: 'Cambia entre inglés, español, francés y portugués. Atiende clientes diversos en su idioma preferido.' },
      ],
      FR: [
        { name: 'Tableau de Bord en Direct', benefit: 'Voyez l\'état en temps réel de votre salon: qui est servi, qui suit, et le temps restant. Ouvrez/fermez votre salon d\'un tap.' },
        { name: 'Réservation en Ligne', benefit: 'Les clientes réservent via votre lien personnel. Plus de chaos WhatsApp—juste une planification professionnelle.' },
        { name: 'Gestion des Employés', benefit: 'Ajoutez des membres avec des profils colorés, suivez la disponibilité et assignez des rendez-vous.' },
        { name: 'Suivi d\'Inventaire', benefit: 'Gérez les niveaux de stock avec des alertes de bas inventaire, dates d\'expiration et infos fournisseurs. Exportez vers Excel.' },
        { name: 'Analyse des Revenus', benefit: 'Suivez les gains par jour, semaine ou mois. Filtrez par cliente et voyez les revenus totaux avec historique détaillé.' },
        { name: 'Galerie de Travaux', benefit: 'Présentez votre meilleur nail art avec des galeries photo. Créez plusieurs albums pour montrer vos compétences.' },
        { name: 'Calendrier Intelligent', benefit: 'Affichez les agendas quotidiens, hebdomadaires et mensuels. Voyez tous les types de rendez-vous d\'un coup.' },
        { name: 'Profils Clients', benefit: 'Stockez infos de contact, historique de visites, préférences et designs favoris pour chaque cliente.' },
        { name: 'Support Multilingue', benefit: 'Passez de l\'anglais au français, espagnol et portugais. Servez des clientes diverses dans leur langue.' },
      ],
      PT: [
        { name: 'Painel em Tempo Real', benefit: 'Veja o status em tempo real do seu salão: quem está sendo atendido, quem é o próximo, e tempo restante. Abra/feche com um toque.' },
        { name: 'Agendamento Online', benefit: 'Clientes agendam através do seu link pessoal. Sem caos de WhatsApp—apenas agendamento organizado e profissional.' },
        { name: 'Gestão de Funcionários', benefit: 'Adicione membros da equipe com perfis coloridos, acompanhe disponibilidade e atribua agendamentos.' },
        { name: 'Controle de Estoque', benefit: 'Gerencie níveis de estoque com alertas de baixo inventário, datas de validade e info de fornecedores. Exporte para Excel.' },
        { name: 'Análise de Receitas', benefit: 'Acompanhe ganhos por dia, semana ou mês. Filtre por cliente e veja receitas totais com histórico detalhado.' },
        { name: 'Galeria de Trabalhos', benefit: 'Mostre sua melhor nail art com galerias de fotos. Crie múltiplos álbuns para exibir suas habilidades.' },
        { name: 'Calendário Inteligente', benefit: 'Veja agendas diárias, semanais e mensais. Veja agendamentos pendentes, em serviço, concluídos e cancelados.' },
        { name: 'Perfis de Clientes', benefit: 'Armazene info de contato, histórico de visitas, preferências e designs favoritos de cada cliente.' },
        { name: 'Suporte Multilíngue', benefit: 'Alterne entre inglês, espanhol, francês e português. Atenda clientes diversos no idioma preferido.' },
      ],
    },
  },
  socialProof: {
    badge: { EN: 'Testimonials', ES: 'Testimonios', FR: 'Témoignages', PT: 'Depoimentos' },
    headline: {
      EN: 'Salon owners like you are loving it',
      ES: 'A dueños de salones como tú les encanta',
      FR: 'Les propriétaires de salons comme vous adorent',
      PT: 'Donos de salões como você estão amando',
    },
    note: { EN: '', ES: '', FR: '', PT: '' },
    testimonials: {
      EN: [
        { quote: "Finally I can see who's busy and who's available without walking around the salon!", author: 'Ana', role: 'Salon Owner', location: 'Santo Domingo' },
        { quote: 'The inventory tracking saves me so much time. No more surprise stockouts.', author: 'Maria', role: 'Salon Manager', location: 'Mexico City' },
        { quote: "Managing 5 employees used to be chaos. Now I assign appointments in seconds.", author: 'Sofia', role: 'Salon Owner', location: 'Buenos Aires' },
      ],
      ES: [
        { quote: '¡Por fin puedo ver quién está ocupado y quién disponible sin caminar por el salón!', author: 'Ana', role: 'Dueña de Salón', location: 'Santo Domingo' },
        { quote: 'El control de inventario me ahorra tanto tiempo. No más sorpresas de falta de stock.', author: 'Maria', role: 'Gerente de Salón', location: 'Ciudad de México' },
        { quote: 'Gestionar 5 empleados era un caos. Ahora asigno citas en segundos.', author: 'Sofia', role: 'Dueña de Salón', location: 'Buenos Aires' },
      ],
      FR: [
        { quote: "Enfin je peux voir qui est occupé et qui est disponible sans faire le tour du salon !", author: 'Ana', role: 'Propriétaire de Salon', location: 'Saint-Domingue' },
        { quote: "Le suivi d'inventaire me fait gagner tellement de temps. Plus de ruptures surprises.", author: 'Maria', role: 'Gérante de Salon', location: 'Mexico' },
        { quote: "Gérer 5 employés était le chaos. Maintenant j'assigne des rendez-vous en secondes.", author: 'Sofia', role: 'Propriétaire de Salon', location: 'Buenos Aires' },
      ],
      PT: [
        { quote: 'Finalmente posso ver quem está ocupado e quem está disponível sem andar pelo salão!', author: 'Ana', role: 'Dona de Salão', location: 'Santo Domingo' },
        { quote: 'O controle de estoque me poupa tanto tempo. Sem mais surpresas de falta de produtos.', author: 'Maria', role: 'Gerente de Salão', location: 'Cidade do México' },
        { quote: 'Gerenciar 5 funcionários era um caos. Agora atribuo agendamentos em segundos.', author: 'Sofia', role: 'Dona de Salão', location: 'Buenos Aires' },
      ],
    },
    indicators: {
      EN: ['Designed for salon owners and nail techs', 'Employee management built-in', 'Inventory tracking included'],
      ES: ['Diseñado para dueños de salones y técnicas', 'Gestión de empleados incluida', 'Control de inventario incluido'],
      FR: ['Conçu pour propriétaires de salons et techniciennes', 'Gestion des employés intégrée', "Suivi d'inventaire inclus"],
      PT: ['Projetado para donos de salões e manicures', 'Gestão de funcionários incluída', 'Controle de estoque incluído'],
    },
  },
  downloadSection: {
    badge: { EN: 'Get Started', ES: 'Empezar', FR: 'Commencer', PT: 'Começar' },
    headline: {
      EN: 'Ready to upgrade your salon?',
      ES: '¿Listo para mejorar tu salón?',
      FR: 'Prêt à améliorer votre salon ?',
      PT: 'Pronto para melhorar seu salão?',
    },
    subheadline: {
      EN: 'Download Nails Salon Connect today and start managing your entire business in minutes.',
      ES: 'Descarga Nails Salon Connect hoy y comienza a gestionar todo tu negocio en minutos.',
      FR: "Téléchargez Nails Salon Connect aujourd'hui et commencez à gérer toute votre activité.",
      PT: 'Baixe o Nails Salon Connect hoje e comece a gerenciar todo seu negócio em minutos.',
    },
    bullets: {
      EN: [
        { icon: 'star', text: 'Live dashboard to track salon status' },
        { icon: 'tag', text: 'Manage employees and assign appointments' },
        { icon: 'chat', text: 'Track inventory and revenue in one place' },
        { icon: 'check', text: 'Free to try' },
      ],
      ES: [
        { icon: 'star', text: 'Panel en vivo para rastrear estado del salón' },
        { icon: 'tag', text: 'Gestiona empleados y asigna citas' },
        { icon: 'chat', text: 'Rastrea inventario e ingresos en un lugar' },
        { icon: 'check', text: 'Prueba gratis' },
      ],
      FR: [
        { icon: 'star', text: 'Tableau de bord en direct pour suivre le salon' },
        { icon: 'tag', text: 'Gérez employés et assignez des rendez-vous' },
        { icon: 'chat', text: 'Suivez inventaire et revenus en un seul endroit' },
        { icon: 'check', text: 'Essai gratuit' },
      ],
      PT: [
        { icon: 'star', text: 'Painel em tempo real para acompanhar o salão' },
        { icon: 'tag', text: 'Gerencie funcionários e atribua agendamentos' },
        { icon: 'chat', text: 'Acompanhe estoque e receitas em um só lugar' },
        { icon: 'check', text: 'Teste grátis' },
      ],
    },
  },
  faq: {
    badge: { EN: 'FAQ', ES: 'Preguntas Frecuentes', FR: 'FAQ', PT: 'Perguntas Frequentes' },
    headline: {
      EN: 'Frequently Asked Questions',
      ES: 'Preguntas Frecuentes',
      FR: 'Questions Fréquentes',
      PT: 'Perguntas Frequentes',
    },
    items: {
      EN: [
        { q: 'Who is this app for?', a: "Nails Salon Connect is designed for salon owners and independent nail techs who want to manage their entire business—bookings, employees, inventory, and revenue—from one app." },
        { q: 'Is it available now?', a: "Yes! Download the app for iOS and Android right now. Start managing your salon in minutes." },
        { q: 'Can I manage multiple employees?', a: "Absolutely! Add team members with color-coded profiles, assign appointments, and track who's available in real-time from your live dashboard." },
        { q: 'Does it include inventory management?', a: 'Yes! Track stock levels with low inventory alerts, expiration dates, supplier info, and export reports to Excel anytime.' },
        { q: 'Can my clients book online?', a: "Yes! You get a personal booking link to share on Instagram or WhatsApp. Clients can book directly without downloading the app." },
        { q: 'What languages are supported?', a: 'The app supports English, Spanish, French, and Portuguese—perfect for serving diverse clients.' },
        { q: 'What does it cost?', a: 'The app is free to download with a trial period. After that, we offer affordable monthly plans for all salon sizes.' },
      ],
      ES: [
        { q: '¿Para quién es esta app?', a: 'Nails Salon Connect está diseñada para dueños de salones y técnicas independientes que quieren gestionar todo su negocio—reservas, empleados, inventario e ingresos—desde una app.' },
        { q: '¿Está disponible ahora?', a: '¡Sí! Descarga la app para iOS y Android ahora mismo. Comienza a gestionar tu salón en minutos.' },
        { q: '¿Puedo gestionar múltiples empleados?', a: '¡Absolutamente! Agrega miembros del equipo con perfiles de colores, asigna citas y rastrea quién está disponible en tiempo real.' },
        { q: '¿Incluye gestión de inventario?', a: '¡Sí! Rastrea niveles de stock con alertas de bajo inventario, fechas de vencimiento, info de proveedores y exporta reportes a Excel.' },
        { q: '¿Mis clientes pueden reservar online?', a: '¡Sí! Obtienes un link personal de reservas para compartir en Instagram o WhatsApp. Los clientes reservan directamente sin bajar la app.' },
        { q: '¿Qué idiomas soporta?', a: 'La app soporta inglés, español, francés y portugués—perfecto para atender clientes diversos.' },
        { q: '¿Cuánto cuesta?', a: 'La descarga es gratis con un periodo de prueba. Después, ofrecemos planes mensuales accesibles para todos los tamaños de salón.' },
      ],
      FR: [
        { q: 'Pour qui est cette app ?', a: "Nails Salon Connect est conçu pour les propriétaires de salons et techniciennes indépendantes qui veulent gérer leur activité—réservations, employés, inventaire et revenus—depuis une app." },
        { q: 'Est-ce disponible maintenant ?', a: "Oui ! Téléchargez l'app pour iOS et Android maintenant. Commencez à gérer votre salon en minutes." },
        { q: 'Puis-je gérer plusieurs employés ?', a: "Absolument ! Ajoutez des membres avec des profils colorés, assignez des rendez-vous et suivez qui est disponible en temps réel." },
        { q: "Inclut-il la gestion d'inventaire ?", a: "Oui ! Suivez les niveaux de stock avec des alertes, dates d'expiration, infos fournisseurs et exportez vers Excel." },
        { q: 'Mes clientes peuvent-elles réserver en ligne ?', a: "Oui ! Vous obtenez un lien de réservation personnel à partager. Les clientes réservent directement sans télécharger l'app." },
        { q: 'Quelles langues sont supportées ?', a: "L'app supporte anglais, espagnol, français et portugais—parfait pour servir des clientes diverses." },
        { q: 'Combien ça coûte ?', a: "Le téléchargement est gratuit avec une période d'essai. Ensuite, nous offrons des plans mensuels abordables." },
      ],
      PT: [
        { q: 'Para quem é este app?', a: 'Nails Salon Connect é projetado para donos de salões e manicures independentes que querem gerenciar todo seu negócio—agendamentos, funcionários, estoque e receitas—de um só app.' },
        { q: 'Está disponível agora?', a: 'Sim! Baixe o app para iOS e Android agora mesmo. Comece a gerenciar seu salão em minutos.' },
        { q: 'Posso gerenciar múltiplos funcionários?', a: 'Absolutamente! Adicione membros da equipe com perfis coloridos, atribua agendamentos e acompanhe quem está disponível em tempo real.' },
        { q: 'Inclui gestão de estoque?', a: 'Sim! Acompanhe níveis de estoque com alertas de baixo inventário, datas de validade, info de fornecedores e exporte relatórios para Excel.' },
        { q: 'Meus clientes podem agendar online?', a: 'Sim! Você ganha um link pessoal de agendamento para compartilhar. Clientes agendam diretamente sem baixar o app.' },
        { q: 'Quais idiomas são suportados?', a: 'O app suporta inglês, espanhol, francês e português—perfeito para atender clientes diversos.' },
        { q: 'Quanto custa?', a: 'O download é grátis com um período de teste. Depois, oferecemos planos mensais acessíveis para todos os tamanhos de salão.' },
      ],
    },
  },
  finalCTA: {
    headline: {
      EN: 'Ready to transform your salon?',
      ES: '¿Lista para transformar tu salón?',
      FR: 'Prête à transformer votre salon ?',
      PT: 'Pronta para transformar seu salão?',
    },
    subheadline: {
      EN: 'Join salon owners who manage bookings, employees, inventory, and revenue all from one app.',
      ES: 'Únete a dueños de salones que gestionan reservas, empleados, inventario e ingresos desde una sola app.',
      FR: 'Rejoignez les propriétaires de salons qui gèrent réservations, employés, inventaire et revenus depuis une seule app.',
      PT: 'Junte-se a donos de salões que gerenciam agendamentos, funcionários, estoque e receitas de um só app.',
    },
  },
  footer: {
    tagline: {
      EN: 'The complete salon management app.',
      ES: 'La app completa de gestión de salones.',
      FR: 'L\'app complète de gestion de salon.',
      PT: 'O app completo de gestão de salões.',
    },
    copyright: { EN: 'All rights reserved.', ES: 'Todos los derechos reservados.', FR: 'Tous droits réservés.', PT: 'Todos os direitos reservados.' },
    links: {
      privacy: { EN: 'Privacy Policy', ES: 'Política de Privacidad', FR: 'Politique de Confidentialité', PT: 'Política de Privacidade' },
      terms: { EN: 'Terms of Service', ES: 'Términos de Servicio', FR: "Conditions d'Utilisation", PT: 'Termos de Serviço' },
      cookie: { EN: 'Cookie Policy', ES: 'Política de Cookies', FR: 'Politique de Cookies', PT: 'Política de Cookies' },
      contact: { EN: 'Contact', ES: 'Contacto', FR: 'Contact', PT: 'Contato' },
    },
  },
  languageSwitcher: {
    tooltip: {
      EN: 'Switch language anytime',
      ES: 'Cambia el idioma cuando quieras',
      FR: "Changez de langue à tout moment",
      PT: 'Mude o idioma quando quiser',
    },
  },
};

// ============================================================================ 
// ICONS (SVG Components)
// ============================================================================ 
const Icons = {
  Calendar: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  Photo: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  ),
  Bell: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  ),
  Chart: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  Globe: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  Phone: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  Check: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  ),
  Star: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475 .345l5.518 .442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84 .61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
  Tag: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607 .33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  ),
  Chat: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  ),
  ChevronDown: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  ),
  Menu: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  X: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
  Quote: ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  ),
  Sparkle: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  Apple: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 384 512" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
    </svg>
  ),
  PlayStore: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor">
      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l220.7-221.2 60.1 60.1L104.6 499z" />
    </svg>
  ),
};

const featureIcons = [Icons.Chart, Icons.Calendar, Icons.Bell, Icons.Tag, Icons.Star, Icons.Photo, Icons.Calendar, Icons.Chat, Icons.Globe];

// ============================================================================ 
// COMPONENTS
// ============================================================================ 

function LanguageSwitcher({ language, setLanguage }: { language: Language; setLanguage: (lang: Language) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const languages: { code: Language; label: string }[] = [
    { code: 'EN', label: 'English' },
    { code: 'ES', label: 'Español' },
    { code: 'FR', label: 'Français' },
    { code: 'PT', label: 'Português' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50"
        title={translations.languageSwitcher.tooltip[language]}
      >
        <Icons.Globe className="w-4 h-4" />
        <span>{language}</span>
        <Icons.ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-rose-50 transition-colors ${language === lang.code ? 'text-rose-600 font-semibold bg-rose-50' : 'text-gray-700'}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Header({ language, setLanguage }: { language: Language; setLanguage: (lang: Language) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = translations.nav;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="/nails-salon.png"
                alt="Nails Salon Logo"
                width={44}
                height={44}
                className="rounded-xl shadow-lg shadow-rose-200/50"
              />
            </div>
            <span className="font-serif font-bold text-2xl text-gray-900 tracking-tight">Nails Salon</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('features')} className="text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors">{t.features[language]}</button>
            <button onClick={() => scrollTo('how-it-works')} className="text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors">{t.howItWorks[language]}</button>
            <button onClick={() => scrollTo('faq')} className="text-sm font-medium text-gray-600 hover:text-rose-600 transition-colors">{t.faq[language]}</button>
            <div className="w-px h-5 bg-gray-200"></div>
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
            <button onClick={() => scrollTo('download')} className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              {t.download[language]}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              {mobileMenuOpen ? <Icons.X className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-100 bg-white/95 backdrop-blur-lg absolute left-0 right-0 px-4 shadow-xl rounded-b-3xl">
            <div className="flex flex-col gap-4">
              <button onClick={() => scrollTo('features')} className="text-left font-medium text-lg text-gray-600 hover:text-rose-600 py-2">{t.features[language]}</button>
              <button onClick={() => scrollTo('how-it-works')} className="text-left font-medium text-lg text-gray-600 hover:text-rose-600 py-2">{t.howItWorks[language]}</button>
              <button onClick={() => scrollTo('faq')} className="text-left font-medium text-lg text-gray-600 hover:text-rose-600 py-2">{t.faq[language]}</button>
              <button onClick={() => scrollTo('download')} className="bg-gray-900 text-white px-4 py-3.5 rounded-xl text-center font-medium shadow-lg mt-2">
                {t.download[language]}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function StoreLinks({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg relative z-20">
       <button className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-1 flex-1 sm:flex-none justify-center">
          <Icons.Apple className="w-8 h-8" />
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Download on the</div>
            <div className="text-lg font-bold leading-none">App Store</div>
          </div>
       </button>
       <button className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-1 flex-1 sm:flex-none justify-center">
          <Icons.PlayStore className="w-7 h-7" />
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Get it on</div>
            <div className="text-lg font-bold leading-none">Google Play</div>
          </div>
       </button>
    </div>
  );
}

function PhoneMockup({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Phone Frame */}
      <div className="relative mx-auto border-gray-900 dark:border-gray-900 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl shadow-rose-200/50 flex flex-col overflow-hidden">
        <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
        <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
        
        {/* Screen Content */}
        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white flex flex-col relative">
            {/* Status Bar */}
            <div className="h-6 w-full bg-white flex justify-between items-center px-6 pt-2">
                <span className="text-[10px] font-bold">9:41</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-black rounded-full text-[8px] flex items-center justify-center text-white">4G</div>
                </div>
            </div>

            {/* App Header */}
            <div className="px-5 pt-4 pb-2 flex justify-between items-center">
                <div>
                    <h3 className="text-gray-400 text-xs font-medium">Good Morning,</h3>
                    <h2 className="text-gray-900 text-xl font-serif font-bold">Ana Maria</h2>
                </div>
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <span className="text-rose-600 font-bold">AM</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3 px-5 py-3 overflow-x-auto no-scrollbar">
                <div className="bg-rose-500 text-white p-3 rounded-xl min-w-[100px] shadow-lg shadow-rose-200">
                    <div className="text-xs opacity-80 mb-1">Today</div>
                    <div className="font-bold text-lg">5 Appts</div>
                </div>
                <div className="bg-white border border-gray-100 p-3 rounded-xl min-w-[100px] shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">Revenue</div>
                    <div className="font-bold text-lg text-gray-900">$420</div>
                </div>
            </div>

            {/* Upcoming Section */}
            <div className="px-5 mt-2 flex-1 overflow-hidden relative">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-900">Upcoming</h3>
                    <span className="text-xs text-rose-500 font-medium">See All</span>
                </div>

                <div className="space-y-3">
                    {/* Appointment Card 1 */}
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-xl">💅</div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-900">Sarah J.</h4>
                            <p className="text-xs text-gray-500">Gel Manicure • 10:00 AM</p>
                        </div>
                        <div className="text-green-500 bg-green-50 px-2 py-1 rounded text-xs font-bold">Conf</div>
                    </div>

                    {/* Appointment Card 2 */}
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">🎨</div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-900">Jessica M.</h4>
                            <p className="text-xs text-gray-500">Acrylic Set • 11:30 AM</p>
                        </div>
                        <div className="text-amber-500 bg-amber-50 px-2 py-1 rounded text-xs font-bold">Wait</div>
                    </div>

                     {/* Appointment Card 3 */}
                     <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm opacity-50">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">👣</div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-900">Emily R.</h4>
                            <p className="text-xs text-gray-500">Pedicure • 1:00 PM</p>
                        </div>
                    </div>
                </div>
                
                {/* Floating Add Button */}
                <div className="absolute bottom-4 right-2 w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center shadow-lg text-white text-2xl shadow-gray-400/50">
                    +
                </div>
            </div>

             {/* Bottom Nav */}
             <div className="h-16 bg-white border-t border-gray-100 flex justify-around items-center px-2">
                <div className="p-2 text-rose-600"><Icons.Calendar className="w-6 h-6" /></div>
                <div className="p-2 text-gray-300"><Icons.Chat className="w-6 h-6" /></div>
                <div className="p-2 text-gray-300"><Icons.Photo className="w-6 h-6" /></div>
                <div className="p-2 text-gray-300"><Icons.Bell className="w-6 h-6" /></div>
             </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className={`border-b border-gray-100 last:border-0 transition-colors ${isOpen ? 'bg-rose-50/50' : ''}`}>
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left px-6"
      >
        <span className={`font-medium text-lg pr-4 ${isOpen ? 'text-rose-900' : 'text-gray-900'}`}>{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-rose-100 rotate-180' : 'bg-gray-100'}`}>
            <Icons.ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? 'text-rose-600' : 'text-gray-500'}`} />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 px-6 ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// ============================================================================ 
// MAIN PAGE
// ============================================================================ 

export default function Home() {
  const [language, setLanguage] = useState<Language>('EN');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const t = translations;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-rose-100 selection:text-rose-900">
      <Header language={language} setLanguage={setLanguage} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-gradient-to-br from-rose-100/40 to-pink-100/40 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-blue-50/50 to-purple-50/50 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Text Content */}
            <div className="text-center lg:text-left">
               <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                  <div className="inline-flex items-center gap-2 bg-white border border-green-100 shadow-sm text-green-700 px-4 py-1.5 rounded-full text-sm font-medium animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {t.solution.liveNow[language]}
                  </div>
                  <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-1.5 rounded-full text-sm font-medium">
                    <Icons.Star className="w-4 h-4" />
                    {t.hero.badge[language]}
                  </div>
               </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                {language === 'EN' && <>Organize your <span className="text-rose-600 italic relative">bookings <svg className="absolute w-full h-3 -bottom-1 left-0 text-rose-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg></span> like a pro.</>}
                {language === 'ES' && <>Organiza tus <span className="text-rose-600 italic relative">reservas <svg className="absolute w-full h-3 -bottom-1 left-0 text-rose-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg></span> como un profesional.</>}
                {language === 'FR' && <>Organisez vos <span className="text-rose-600 italic relative">réservations <svg className="absolute w-full h-3 -bottom-1 left-0 text-rose-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg></span> comme une pro.</>}
                {language === 'PT' && <>Organize seus <span className="text-rose-600 italic relative">agendamentos <svg className="absolute w-full h-3 -bottom-1 left-0 text-rose-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg></span> como uma profissional.</>}
              </h1>

              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t.hero.subheadline[language]}
              </p>

              <div className="flex flex-col items-center lg:items-start gap-8">
                  <StoreLinks />
                  
                  <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-3 text-sm font-medium text-gray-500">
                    {t.hero.bullets[language].map((bullet, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Icons.Check className="w-3 h-3" />
                        </div>
                        {bullet}
                      </div>
                    ))}
                  </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative mx-auto lg:mr-0 lg:ml-auto">
               <div className="relative z-10 lg:rotate-[-6deg] lg:hover:rotate-0 transition-transform duration-500 ease-out">
                   <PhoneMockup />
               </div>
               {/* Floating elements decoration */}
               <div className="absolute top-20 -right-12 bg-white p-4 rounded-2xl shadow-xl z-20 animate-bounce delay-700 hidden lg:block">
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-xl">✨</div>
                       <div>
                           <div className="text-xs text-gray-500">New Review</div>
                           <div className="font-bold text-sm">⭐⭐⭐⭐⭐</div>
                       </div>
                   </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-16 items-center">
             <div className="md:w-1/3">
                <span className="text-rose-600 font-bold tracking-wider text-sm uppercase mb-2 block">{t.problem.badge[language]}</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                  {t.problem.headline[language]}
                </h2>
                <div className="w-20 h-1.5 bg-rose-200 rounded-full"></div>
             </div>
             
             <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
                {t.problem.bullets[language].map((bullet, i) => (
                  <div key={i} className={`p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${i === 0 ? 'sm:col-span-2 bg-rose-50 border-rose-100' : 'bg-white'}`}>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                           <Icons.X className="w-5 h-5" />
                        </div>
                        <p className="text-gray-700 text-lg italic leading-relaxed">{bullet}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-rose-600 font-bold tracking-wider text-sm uppercase mb-3 block">{t.solution.badge[language]}</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              {t.solution.headline[language]}
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
               <Icons.Sparkle className="w-4 h-4" />
               {t.solution.liveNow[language]}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.solution.steps[language].map((step, i) => (
              <div key={i} className="relative group">
                <div className="h-full bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative z-10">
                  <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.description}</p>
                </div>
                {/* Connector line for desktop */}
                {i < 3 && (
                    <div className="hidden lg:block absolute top-14 left-1/2 w-full h-0.5 bg-gray-200 -z-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
                <span className="text-rose-600 font-bold tracking-wider text-sm uppercase mb-3 block">{t.features.badge[language]}</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                {t.features.headline[language]}
                </h2>
            </div>
            <button onClick={() => document.getElementById('download')?.scrollIntoView({behavior: 'smooth'})} className="hidden md:flex items-center gap-2 text-rose-600 font-bold hover:gap-3 transition-all">
                {t.hero.secondaryCTA[language]} <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.items[language].map((feature, i) => {
              const Icon = featureIcons[i];
              return (
                <div key={i} className="group p-8 rounded-[2rem] bg-gray-50 hover:bg-rose-50/50 transition-colors duration-300">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300 text-rose-600">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-rose-700 transition-colors">{feature.name}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.benefit}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              {t.socialProof.headline[language]}
            </h2>
            <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map(s => <Icons.Star key={s} className="w-6 h-6 text-yellow-400 fill-yellow-400" />)}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {t.socialProof.testimonials[language].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/15 transition-colors">
                <Icons.Quote className="w-8 h-8 text-rose-400 mb-6" />
                <p className="text-lg leading-relaxed text-gray-200 mb-8 font-light">"{item.quote}"</p>
                <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center font-bold text-white shadow-lg">
                      {item.author[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white">{item.author}</p>
                      <p className="text-sm text-gray-400">{item.role}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16 border-t border-white/10 pt-10">
            {t.socialProof.indicators[language].map((indicator, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Icons.Check className="w-3.5 h-3.5 text-green-400" />
                </div>
                <span>{indicator}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section (Formerly Early Access) */}
      <section id="download" className="py-24 bg-gradient-to-b from-rose-50 to-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="bg-white rounded-[3rem] shadow-2xl shadow-rose-200/50 p-8 md:p-16 border border-rose-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400"></div>
                
                <span className="inline-block bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
                    {t.downloadSection.badge[language]}
                </span>
                
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                    {t.downloadSection.headline[language]}
                </h2>
                
                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                    {t.downloadSection.subheadline[language]}
                </p>

                <div className="max-w-2xl mx-auto bg-gray-50 rounded-2xl p-8 mb-10 grid sm:grid-cols-2 gap-6 text-left">
                    {t.downloadSection.bullets[language].map((item, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Icons.Check className="w-3.5 h-3.5 text-rose-600" />
                            </div>
                            <span className="text-gray-700 font-medium">{item.text}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <StoreLinks />
                </div>
           </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              {t.faq.headline[language]}
            </h2>
            <p className="text-gray-500">Everything you need to know.</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {t.faq.items[language].map((item, i) => (
              <FAQItem
                key={i}
                question={item.q}
                answer={item.a}
                isOpen={openFAQ === i}
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            {t.finalCTA.headline[language]}
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {t.finalCTA.subheadline[language]}
          </p>
          <div className="flex justify-center">
            <StoreLinks />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Logo & Tagline */}
            <div className="flex items-center gap-3">
              <Image
                src="/nails-salon.png"
                alt="Nails Salon Logo"
                width={32}
                height={32}
                className="rounded-lg grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all"
              />
              <span className="font-bold text-gray-400">Nails Salon</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm text-gray-500 font-medium">
              <a href="/privacy-policy" className="hover:text-rose-600 transition-colors">{t.footer.links.privacy[language]}</a>
              <a href="/cookie-policy" className="hover:text-rose-600 transition-colors">{t.footer.links.cookie[language]}</a>
              <a href="/terms-of-service" className="hover:text-rose-600 transition-colors">{t.footer.links.terms[language]}</a>
              <a href="#" className="hover:text-rose-600 transition-colors">{t.footer.links.contact[language]}</a>
            </div>
            
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Nails Salon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

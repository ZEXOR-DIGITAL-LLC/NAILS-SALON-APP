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
    joinWaitlist: { EN: 'Join Waitlist', ES: 'Unirse', FR: 'Rejoindre', PT: 'Entrar' },
  },
  hero: {
    headline: {
      EN: 'Organize your bookings like a pro.',
      ES: 'Organiza tus reservas como un profesional.',
      FR: 'Organisez vos réservations comme une pro.',
      PT: 'Organize seus agendamentos como uma profissional.',
    },
    subheadline: {
      EN: 'Join the waitlist now for early access to the simplest booking app for nail techs. Get organized before launch and be first in line for beta testing.',
      ES: 'Únete a la lista de espera ahora para acceso temprano a la app de reservas más simple para técnicos de uñas. Organízate antes del lanzamiento y sé la primera en la fila para pruebas beta.',
      FR: "Rejoignez la liste d'attente maintenant pour un accès anticipé à l'application de réservation la plus simple pour les techniciennes ongulaires.",
      PT: 'Junte-se à lista de espera agora para acesso antecipado ao app de agendamento mais simples para manicures.',
    },
    primaryCTA: {
      EN: 'Join the Waitlist',
      ES: 'Únete a la Lista',
      FR: "Rejoindre la Liste",
      PT: 'Entrar na Lista',
    },
    secondaryCTA: {
      EN: 'See How It Works',
      ES: 'Ver Cómo Funciona',
      FR: 'Voir Comment Ça Marche',
      PT: 'Veja Como Funciona',
    },
    bullets: {
      EN: [
        'No more no-shows',
        "Instant client history",
        'Zero booking chaos',
      ],
      ES: [
        'Sin más ausencias',
        'Historial al instante',
        'Cero caos de reservas',
      ],
      FR: [
        'Plus de rendez-vous manqués',
        "Historique instantané",
        'Zéro chaos de réservation',
      ],
      PT: [
        'Sem mais faltas',
        'Histórico instantâneo',
        'Zero caos de agendamento',
      ],
    },
    emailPlaceholder: {
      EN: 'Enter your email',
      ES: 'Ingresa tu email',
      FR: 'Entrez votre email',
      PT: 'Digite seu email',
    },
  },
  problem: {
    badge: { EN: 'Sound familiar?', ES: '¿Te suena familiar?', FR: 'Ça vous parle ?', PT: 'Parece familiar?' },
    headline: {
      EN: 'Tired of booking nightmares that steal your nail time?',
      ES: '¿Cansada de pesadillas de reservas que roban tu tiempo de uñas?',
      FR: 'Fatiguée des cauchemars de réservation qui volent votre temps de manucure ?',
      PT: 'Cansada de pesadelos de agendamento que roubam seu tempo de unhas?',
    },
    bullets: {
      EN: [
        '"I spend hours scrolling through WhatsApp to confirm appointments instead of doing nails."',
        '"Clients cancel last minute or don\'t show up, and I lose money every time."',
        '"I forget what designs they liked or their nail history—it\'s embarrassing."',
        '"My schedule is a mess between Instagram DMs and my notebook."',
        '"I\'m always chasing new clients because I can\'t keep the regulars coming back."',
      ],
      ES: [
        '"Paso horas revisando WhatsApp para confirmar citas en lugar de hacer uñas."',
        '"Las clientas cancelan a última hora o no aparecen, y pierdo dinero cada vez."',
        '"Olvido qué diseños les gustaron o su historial de uñas—es vergonzoso."',
        '"Mi agenda es un desastre entre DMs de Instagram y mi libreta."',
        '"Siempre estoy buscando nuevas clientas porque no puedo hacer que las regulares vuelvan."',
      ],
      FR: [
        '"Je passe des heures à défiler WhatsApp pour confirmer les rendez-vous au lieu de faire des ongles."',
        '"Les clientes annulent à la dernière minute ou ne se présentent pas, et je perds de l\'argent."',
        '"J\'oublie quels designs elles aimaient ou leur historique—c\'est embarrassant."',
        '"Mon agenda est un désastre entre les DM Instagram et mon carnet."',
        '"Je suis toujours à la recherche de nouvelles clientes car je ne peux pas garder les régulières."',
      ],
      PT: [
        '"Passo horas no WhatsApp para confirmar agendamentos em vez de fazer unhas."',
        '"Clientes cancelam de última hora ou não aparecem, e perco dinheiro toda vez."',
        '"Esqueço quais designs elas gostaram ou seu histórico—é constrangedor."',
        '"Minha agenda é uma bagunça entre DMs do Instagram e meu caderno."',
        '"Estou sempre buscando novas clientes porque não consigo fazer as regulares voltarem."',
      ],
    },
  },
  solution: {
    badge: { EN: 'The Solution', ES: 'La Solución', FR: 'La Solution', PT: 'A Solução' },
    headline: {
      EN: "Here's how Nails Salon will make booking easy",
      ES: 'Así es como Nails Salon hará que las reservas sean fáciles',
      FR: 'Voici comment Nails Salon rendra la réservation facile',
      PT: 'Veja como o Nails Salon tornará o agendamento fácil',
    },
    comingSoon: { EN: 'Launching Soon', ES: 'Próximamente', FR: 'Bientôt Disponible', PT: 'Em Breve' },
    steps: {
      EN: [
        { title: 'Set Your Availability', description: 'Open the app and mark your available times for the week. No more back-and-forth texts—just a clean calendar view that clients can book directly.' },
        { title: 'Clients Book Instantly', description: 'Share your booking link via WhatsApp or Instagram. Clients pick a time, service (like a gel set or fill), and confirm—no more chasing confirmations.' },
        { title: 'Automatic Reminders', description: 'The app sends reminder texts or emails to you and the client 24 hours before, cutting down on no-shows and saving you stress.' },
        { title: 'Track Everything', description: 'After the appointment, add photos of the design and notes on preferences. Next time they book, their history pops up automatically.' },
      ],
      ES: [
        { title: 'Configura Tu Disponibilidad', description: 'Abre la app y marca tus horarios disponibles para la semana. Sin más mensajes de ida y vuelta—solo un calendario limpio donde las clientas pueden reservar directamente.' },
        { title: 'Clientas Reservan Al Instante', description: 'Comparte tu link de reservas por WhatsApp o Instagram. Las clientas eligen hora, servicio (como un set de gel o relleno), y confirman—sin perseguir confirmaciones.' },
        { title: 'Recordatorios Automáticos', description: 'La app envía recordatorios por mensaje o email a ti y a la clienta 24 horas antes, reduciendo ausencias y ahorrándote estrés.' },
        { title: 'Registra Todo', description: 'Después de la cita, agrega fotos del diseño y notas sobre preferencias. La próxima vez que reserven, su historial aparece automáticamente.' },
      ],
      FR: [
        { title: 'Définissez Votre Disponibilité', description: "Ouvrez l'app et marquez vos créneaux disponibles pour la semaine. Plus de messages interminables—juste un calendrier clair où les clientes peuvent réserver directement." },
        { title: 'Réservation Instantanée', description: 'Partagez votre lien de réservation via WhatsApp ou Instagram. Les clientes choisissent un créneau, un service, et confirment—plus de relances.' },
        { title: 'Rappels Automatiques', description: "L'app envoie des rappels par message ou email à vous et à la cliente 24 heures avant, réduisant les absences et votre stress." },
        { title: 'Suivez Tout', description: "Après le rendez-vous, ajoutez des photos du design et des notes sur les préférences. La prochaine fois qu'elles réservent, leur historique apparaît automatiquement." },
      ],
      PT: [
        { title: 'Configure Sua Disponibilidade', description: 'Abra o app e marque seus horários disponíveis para a semana. Sem mais mensagens de vai e vem—apenas um calendário limpo onde clientes podem agendar diretamente.' },
        { title: 'Clientes Agendam Instantaneamente', description: 'Compartilhe seu link de agendamento via WhatsApp ou Instagram. Clientes escolhem horário, serviço (como gel ou manutenção), e confirmam—sem perseguir confirmações.' },
        { title: 'Lembretes Automáticos', description: 'O app envia lembretes por mensagem ou email para você e a cliente 24 horas antes, reduzindo faltas e economizando seu estresse.' },
        { title: 'Registre Tudo', description: 'Após o atendimento, adicione fotos do design e notas sobre preferências. Na próxima vez que agendarem, o histórico aparece automaticamente.' },
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
        { name: 'Smart Calendar', benefit: 'Keep your schedule organized with instant bookings, reducing no-shows by 50% so you can focus on perfect nail art instead of texts.' },
        { name: 'Client History Gallery', benefit: "Access photos of every client's past designs and preferences in seconds, helping you deliver exactly what they love without guesswork." },
        { name: 'Automated Reminders', benefit: 'Let the app handle reminders so clients show up on time, freeing you from constant follow-ups and letting you build a reliable client base.' },
        { name: 'Income Tracking', benefit: 'Track earnings from each service to spot trends, like when fills bring in more than sets, and plan your week better.' },
        { name: 'Multilingual Support', benefit: 'Switch to Spanish, French, or Portuguese easily, making it simple to communicate with diverse clients and grow beyond your local area.' },
        { name: 'Mobile Ready', benefit: 'Works perfectly on your phone browser. Take your business anywhere—manage appointments between clients or from home.' },
      ],
      ES: [
        { name: 'Calendario Inteligente', benefit: 'Mantén tu agenda organizada con reservas instantáneas, reduciendo ausencias un 50% para que puedas enfocarte en el nail art perfecto.' },
        { name: 'Galería de Historial', benefit: 'Accede a fotos de diseños pasados y preferencias de cada clienta en segundos, ayudándote a entregar exactamente lo que les encanta.' },
        { name: 'Recordatorios Automáticos', benefit: 'Deja que la app maneje los recordatorios para que las clientas lleguen a tiempo, liberándote de seguimientos constantes.' },
        { name: 'Seguimiento de Ingresos', benefit: 'Rastrea ganancias de cada servicio para identificar tendencias, como cuándo los rellenos generan más que los sets.' },
        { name: 'Soporte Multilingüe', benefit: 'Cambia a español, francés o portugués fácilmente, simplificando la comunicación con clientas diversas.' },
        { name: 'Listo para Móvil', benefit: 'Funciona perfectamente en el navegador de tu teléfono. Lleva tu negocio a cualquier lugar.' },
      ],
      FR: [
        { name: 'Calendrier Intelligent', benefit: "Gardez votre agenda organisé avec des réservations instantanées, réduisant les absences de 50% pour vous concentrer sur le nail art." },
        { name: 'Galerie Historique', benefit: "Accédez aux photos des designs passés et préférences de chaque cliente en secondes, vous aidant à livrer exactement ce qu'elles aiment." },
        { name: 'Rappels Automatiques', benefit: "Laissez l'app gérer les rappels pour que les clientes arrivent à l'heure, vous libérant des relances constantes." },
        { name: 'Suivi des Revenus', benefit: 'Suivez les gains de chaque service pour repérer les tendances et mieux planifier votre semaine.' },
        { name: 'Support Multilingue', benefit: 'Passez facilement au français, espagnol ou portugais, simplifiant la communication avec des clientes diverses.' },
        { name: 'Prêt pour Mobile', benefit: "Fonctionne parfaitement sur le navigateur de votre téléphone. Emportez votre activité partout." },
      ],
      PT: [
        { name: 'Calendário Inteligente', benefit: 'Mantenha sua agenda organizada com agendamentos instantâneos, reduzindo faltas em 50% para você focar na nail art perfeita.' },
        { name: 'Galeria de Histórico', benefit: 'Acesse fotos de designs anteriores e preferências de cada cliente em segundos, ajudando você a entregar exatamente o que elas amam.' },
        { name: 'Lembretes Automáticos', benefit: 'Deixe o app gerenciar lembretes para que clientes cheguem na hora, liberando você de follow-ups constantes.' },
        { name: 'Rastreamento de Renda', benefit: 'Acompanhe ganhos de cada serviço para identificar tendências e planejar melhor sua semana.' },
        { name: 'Suporte Multilíngue', benefit: 'Mude para português, espanhol ou francês facilmente, simplificando a comunicação com clientes diversas.' },
        { name: 'Pronto para Mobile', benefit: 'Funciona perfeitamente no navegador do seu celular. Leve seu negócio para qualquer lugar.' },
      ],
    },
  },
  socialProof: {
    badge: { EN: 'Testimonials', ES: 'Testimonios', FR: 'Témoignages', PT: 'Depoimentos' },
    headline: {
      EN: 'Nail techs like you are already excited',
      ES: 'Técnicas de uñas como tú ya están emocionadas',
      FR: 'Les techniciennes ongulaires comme vous sont déjà excitées',
      PT: 'Manicures como você já estão empolgadas',
    },
    note: { EN: '* Sample testimonials from beta feedback', ES: '* Testimonios de ejemplo de retroalimentación beta', FR: '* Témoignages exemples des retours bêta', PT: '* Depoimentos de exemplo do feedback beta' },
    testimonials: {
      EN: [
        { quote: "This is exactly what I needed—my calendar is finally organized!", author: 'Ana', role: 'Nail Tech', location: 'Santo Domingo' },
        { quote: 'No more lost bookings in WhatsApp. I feel so professional now.', author: 'Maria', role: 'Home-Based Artist', location: 'Mexico City' },
        { quote: "My clients love the reminders, and I'm getting way fewer cancellations.", author: 'Sofia', role: 'Small Salon Owner', location: 'Buenos Aires' },
      ],
      ES: [
        { quote: '¡Esto es exactamente lo que necesitaba—mi calendario finalmente está organizado!', author: 'Ana', role: 'Técnica de Uñas', location: 'Santo Domingo' },
        { quote: 'No más reservas perdidas en WhatsApp. Me siento tan profesional ahora.', author: 'Maria', role: 'Artista en Casa', location: 'Ciudad de México' },
        { quote: 'A mis clientas les encantan los recordatorios, y tengo muchas menos cancelaciones.', author: 'Sofia', role: 'Dueña de Salón', location: 'Buenos Aires' },
      ],
      FR: [
        { quote: "C'est exactement ce dont j'avais besoin—mon calendrier est enfin organisé !", author: 'Ana', role: 'Technicienne Ongulaire', location: 'Saint-Domingue' },
        { quote: 'Plus de réservations perdues dans WhatsApp. Je me sens tellement professionnelle maintenant.', author: 'Maria', role: 'Artiste à Domicile', location: 'Mexico' },
        { quote: "Mes clientes adorent les rappels, et j'ai beaucoup moins d'annulations.", author: 'Sofia', role: 'Propriétaire de Salon', location: 'Buenos Aires' },
      ],
      PT: [
        { quote: 'Isso é exatamente o que eu precisava—meu calendário finalmente está organizado!', author: 'Ana', role: 'Manicure', location: 'Santo Domingo' },
        { quote: 'Sem mais agendamentos perdidos no WhatsApp. Me sinto tão profissional agora.', author: 'Maria', role: 'Artista em Casa', location: 'Cidade do México' },
        { quote: 'Minhas clientes amam os lembretes, e estou tendo muito menos cancelamentos.', author: 'Sofia', role: 'Dona de Salão', location: 'Buenos Aires' },
      ],
    },
    indicators: {
      EN: ['Designed specifically for independent nail techs', 'No long-term contracts—cancel anytime', 'Built by people who understand appointments'],
      ES: ['Diseñado específicamente para técnicas independientes', 'Sin contratos a largo plazo—cancela cuando quieras', 'Creado por personas que entienden las citas'],
      FR: ['Conçu spécifiquement pour les techniciennes indépendantes', 'Pas de contrats à long terme—annulez quand vous voulez', 'Créé par des gens qui comprennent les rendez-vous'],
      PT: ['Projetado especificamente para manicures independentes', 'Sem contratos de longo prazo—cancele quando quiser', 'Criado por pessoas que entendem agendamentos'],
    },
  },
  earlyAccess: {
    badge: { EN: 'Early Access', ES: 'Acceso Temprano', FR: 'Accès Anticipé', PT: 'Acesso Antecipado' },
    headline: {
      EN: 'Be the first nail tech to try Nails Salon',
      ES: 'Sé la primera técnica de uñas en probar Nails Salon',
      FR: 'Soyez la première technicienne à essayer Nails Salon',
      PT: 'Seja a primeira manicure a testar o Nails Salon',
    },
    subheadline: {
      EN: 'Join our exclusive waitlist and get special perks when we launch.',
      ES: 'Únete a nuestra lista exclusiva y obtén beneficios especiales cuando lancemos.',
      FR: 'Rejoignez notre liste exclusive et obtenez des avantages spéciaux au lancement.',
      PT: 'Junte-se à nossa lista exclusiva e ganhe benefícios especiais quando lançarmos.',
    },
    bullets: {
      EN: [
        { icon: 'star', text: 'Get exclusive early feedback opportunities to shape the product' },
        { icon: 'tag', text: 'Enjoy special launch pricing when it goes live' },
        { icon: 'chat', text: 'Direct contact with the founder for personalized support' },
        { icon: 'check', text: 'Free to join—no credit card required' },
      ],
      ES: [
        { icon: 'star', text: 'Obtén oportunidades exclusivas de feedback para dar forma al producto' },
        { icon: 'tag', text: 'Disfruta de precios especiales de lanzamiento cuando esté disponible' },
        { icon: 'chat', text: 'Contacto directo con el fundador para soporte personalizado' },
        { icon: 'check', text: 'Gratis para unirse—no se requiere tarjeta de crédito' },
      ],
      FR: [
        { icon: 'star', text: 'Obtenez des opportunités exclusives de feedback pour façonner le produit' },
        { icon: 'tag', text: 'Profitez de prix spéciaux de lancement' },
        { icon: 'chat', text: 'Contact direct avec le fondateur pour un support personnalisé' },
        { icon: 'check', text: "Gratuit pour s'inscrire—aucune carte de crédit requise" },
      ],
      PT: [
        { icon: 'star', text: 'Tenha oportunidades exclusivas de feedback para moldar o produto' },
        { icon: 'tag', text: 'Aproveite preços especiais de lançamento quando estiver disponível' },
        { icon: 'chat', text: 'Contato direto com o fundador para suporte personalizado' },
        { icon: 'check', text: 'Grátis para entrar—não precisa de cartão de crédito' },
      ],
    },
    cta: {
      EN: 'Join Early Access Now',
      ES: 'Únete al Acceso Temprano',
      FR: "Rejoindre l'Accès Anticipé",
      PT: 'Entrar no Acesso Antecipado',
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
        { q: 'Is it available now?', a: "Not yet—it's in pre-launch beta. Join the waitlist to be first to try it when we launch." },
        { q: 'Will there be mobile apps?', a: 'Yes, mobile apps for iOS and Android are coming soon after the web launch. The web app works great on mobile browsers too.' },
        { q: 'Is it only for nails?', a: "Absolutely—it's built specifically for nail techs and salons, with features like design galleries and service types tailored for nails." },
        { q: 'Is it available in multiple languages?', a: 'Yes! Starting with English and Spanish, with French and Portuguese being added soon.' },
        { q: 'Do I need a computer or can I use it on my phone browser?', a: 'You can use it on any device with a web browser—phone, tablet, or computer. It works perfectly on mobile.' },
        { q: 'What will it cost approximately?', a: 'Pricing will start at $19/month for basic plans, with premium features available. Early access members get special pricing.' },
        { q: 'What happens when I join the waitlist?', a: "You'll get early access to beta testing, exclusive updates, and first dibs on launch. We'll also ask for your feedback to improve the app." },
        { q: 'Will my feedback influence features?', a: 'Definitely—early access members will have direct input on new features and improvements. We build this for you!' },
      ],
      ES: [
        { q: '¿Está disponible ahora?', a: 'Todavía no—está en beta pre-lanzamiento. Únete a la lista de espera para ser la primera en probarlo cuando lancemos.' },
        { q: '¿Habrá apps móviles?', a: 'Sí, las apps móviles para iOS y Android vienen pronto después del lanzamiento web. La app web también funciona muy bien en navegadores móviles.' },
        { q: '¿Es solo para uñas?', a: 'Absolutamente—está construida específicamente para técnicas de uñas y salones, con funciones como galerías de diseños y tipos de servicio adaptados para uñas.' },
        { q: '¿Está disponible en varios idiomas?', a: '¡Sí! Empezando con inglés y español, con francés y portugués siendo agregados pronto.' },
        { q: '¿Necesito una computadora o puedo usarlo en el navegador de mi teléfono?', a: 'Puedes usarlo en cualquier dispositivo con navegador web—teléfono, tablet o computadora. Funciona perfectamente en móvil.' },
        { q: '¿Cuánto costará aproximadamente?', a: 'Los precios comenzarán en $19/mes para planes básicos, con funciones premium disponibles. Los miembros de acceso temprano obtienen precios especiales.' },
        { q: '¿Qué pasa cuando me uno a la lista de espera?', a: 'Obtendrás acceso temprano a pruebas beta, actualizaciones exclusivas, y prioridad en el lanzamiento. También te pediremos feedback para mejorar la app.' },
        { q: '¿Mi feedback influenciará las funciones?', a: 'Definitivamente—los miembros de acceso temprano tendrán input directo en nuevas funciones y mejoras. ¡Construimos esto para ti!' },
      ],
      FR: [
        { q: 'Est-ce disponible maintenant ?', a: "Pas encore—c'est en bêta pré-lancement. Rejoignez la liste d'attente pour être la première à l'essayer." },
        { q: 'Y aura-t-il des apps mobiles ?', a: "Oui, les apps mobiles pour iOS et Android arrivent bientôt après le lancement web. L'app web fonctionne très bien sur les navigateurs mobiles aussi." },
        { q: "C'est uniquement pour les ongles ?", a: "Absolument—c'est conçu spécifiquement pour les techniciennes ongulaires et salons, avec des fonctionnalités comme les galeries de designs adaptées aux ongles." },
        { q: 'Est-ce disponible en plusieurs langues ?', a: 'Oui ! En commençant par anglais et espagnol, avec français et portugais bientôt ajoutés.' },
        { q: "Ai-je besoin d'un ordinateur ou puis-je l'utiliser sur mon téléphone ?", a: "Vous pouvez l'utiliser sur n'importe quel appareil avec un navigateur web—téléphone, tablette ou ordinateur." },
        { q: 'Combien ça coûtera approximativement ?', a: 'Les prix commenceront à 19$/mois pour les plans de base. Les membres en accès anticipé bénéficient de prix spéciaux.' },
        { q: "Que se passe-t-il quand je rejoins la liste d'attente ?", a: "Vous aurez un accès anticipé aux tests bêta, des mises à jour exclusives, et la priorité au lancement." },
        { q: 'Mon feedback influencera-t-il les fonctionnalités ?', a: "Définitivement—les membres en accès anticipé auront un input direct sur les nouvelles fonctionnalités. Nous construisons cela pour vous !" },
      ],
      PT: [
        { q: 'Está disponível agora?', a: 'Ainda não—está em beta pré-lançamento. Junte-se à lista de espera para ser a primeira a testar quando lançarmos.' },
        { q: 'Haverá apps móveis?', a: 'Sim, apps móveis para iOS e Android estão chegando logo após o lançamento web. O app web também funciona muito bem em navegadores móveis.' },
        { q: 'É só para unhas?', a: 'Absolutamente—é construído especificamente para manicures e salões, com recursos como galerias de designs e tipos de serviço adaptados para unhas.' },
        { q: 'Está disponível em vários idiomas?', a: 'Sim! Começando com inglês e espanhol, com francês e português sendo adicionados em breve.' },
        { q: 'Preciso de um computador ou posso usar no navegador do celular?', a: 'Você pode usar em qualquer dispositivo com navegador web—celular, tablet ou computador. Funciona perfeitamente no mobile.' },
        { q: 'Quanto vai custar aproximadamente?', a: 'Os preços começarão em $19/mês para planos básicos. Membros de acesso antecipado ganham preços especiais.' },
        { q: 'O que acontece quando entro na lista de espera?', a: 'Você terá acesso antecipado a testes beta, atualizações exclusivas, e prioridade no lançamento. Também pediremos seu feedback para melhorar o app.' },
        { q: 'Meu feedback influenciará os recursos?', a: 'Definitivamente—membros de acesso antecipado terão input direto em novos recursos e melhorias. Construímos isso para você!' },
      ],
    },
  },
  finalCTA: {
    headline: {
      EN: 'Ready to ditch the chaos?',
      ES: '¿Lista para deshacerte del caos?',
      FR: 'Prête à abandonner le chaos ?',
      PT: 'Pronta para abandonar o caos?',
    },
    subheadline: {
      EN: 'Secure your spot in the first wave of nail techs to try Nails Salon.',
      ES: 'Asegura tu lugar en la primera ola de técnicas de uñas en probar Nails Salon.',
      FR: 'Réservez votre place parmi les premières techniciennes à essayer Nails Salon.',
      PT: 'Garanta seu lugar na primeira onda de manicures a testar o Nails Salon.',
    },
    button: {
      EN: 'Join the Waitlist Now',
      ES: 'Únete a la Lista Ahora',
      FR: 'Rejoindre la Liste Maintenant',
      PT: 'Entrar na Lista Agora',
    },
  },
  footer: {
    tagline: {
      EN: 'The simplest booking app for nail techs.',
      ES: 'La app de reservas más simple para técnicas de uñas.',
      FR: 'La plus simple app de réservation pour techniciennes ongulaires.',
      PT: 'O app de agendamento mais simples para manicures.',
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
  Tag: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
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
};

const featureIcons = [Icons.Calendar, Icons.Photo, Icons.Bell, Icons.Chart, Icons.Globe, Icons.Phone];

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
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
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
            <button onClick={() => scrollTo('early-access')} className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              {t.joinWaitlist[language]}
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
              <button onClick={() => scrollTo('early-access')} className="bg-gray-900 text-white px-4 py-3.5 rounded-xl text-center font-medium shadow-lg mt-2">
                {t.joinWaitlist[language]}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function EmailForm({ language, variant = 'light' }: { language: Language; variant?: 'light' | 'dark' }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const t = translations.hero;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      console.log('Email submitted:', email);
    }
  };

  if (submitted) {
    return (
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl ${variant === 'dark' ? 'bg-white/10 text-white backdrop-blur-sm' : 'bg-green-50 text-green-800 border border-green-100'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${variant === 'dark' ? 'bg-green-500' : 'bg-green-100'}`}>
           <Icons.Check className={`w-5 h-5 ${variant === 'dark' ? 'text-white' : 'text-green-600'}`} />
        </div>
        <span className="font-medium text-lg">
          {language === 'EN' && "You're on the list!"}
          {language === 'ES' && '¡Estás en la lista!'}
          {language === 'FR' && 'Vous êtes sur la liste !'}
          {language === 'PT' && 'Você está na lista!'}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-lg relative z-20">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.emailPlaceholder[language]}
        required
        className={`flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-400 text-base shadow-sm focus:outline-none focus:ring-4 transition-all ${variant === 'dark' ? 'bg-white/10 text-white placeholder-rose-100 focus:ring-rose-500/30 border border-white/20' : 'bg-white border border-gray-200 focus:ring-rose-100 focus:border-rose-300'}`}
      />
      <button
        type="submit"
        className="group bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-rose-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap hover:-translate-y-0.5"
      >
        {t.primaryCTA[language]}
        <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
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
               <div className="inline-flex items-center gap-2 bg-white border border-rose-100 shadow-sm text-rose-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in-up">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  {language === 'EN' && 'Coming Soon — Join the Waitlist'}
                  {language === 'ES' && 'Próximamente — Únete a la Lista'}
                  {language === 'FR' && "Bientôt — Rejoignez la Liste"}
                  {language === 'PT' && 'Em Breve — Entre na Lista'}
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
                  <EmailForm language={language} />
                  
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
               <Icons.Sparkle className="w-4 h-4" />
               {t.solution.comingSoon[language]}
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
            <button onClick={() => document.getElementById('early-access')?.scrollIntoView({behavior: 'smooth'})} className="hidden md:flex items-center gap-2 text-rose-600 font-bold hover:gap-3 transition-all">
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

      {/* Early Access Section */}
      <section id="early-access" className="py-24 bg-gradient-to-b from-rose-50 to-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="bg-white rounded-[3rem] shadow-2xl shadow-rose-200/50 p-8 md:p-16 border border-rose-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400"></div>
                
                <span className="inline-block bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
                    {t.earlyAccess.badge[language]}
                </span>
                
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                    {t.earlyAccess.headline[language]}
                </h2>
                
                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                    {t.earlyAccess.subheadline[language]}
                </p>

                <div className="max-w-2xl mx-auto bg-gray-50 rounded-2xl p-8 mb-10 grid sm:grid-cols-2 gap-6 text-left">
                    {t.earlyAccess.bullets[language].map((item, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Icons.Check className="w-3.5 h-3.5 text-rose-600" />
                            </div>
                            <span className="text-gray-700 font-medium">{item.text}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <EmailForm language={language} />
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
            <p className="text-gray-500">Everything you need to know about the beta.</p>
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
            <EmailForm language={language} />
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
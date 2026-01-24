'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

type Language = 'EN' | 'ES' | 'FR' | 'PT';
type AmPm = 'AM' | 'PM';

type SalonData = {
  id: string;
  businessName: string;
  businessImage: string | null;
  type: string;
  address: string;
  city: string;
  country: string;
  phoneCode: string | null;
  phoneNumber: string | null;
  // Business Hours
  isOpen: boolean;
  workingDays: number[];
  openingHour: number;
  openingMinute: number;
  closingHour: number;
  closingMinute: number;
};

type GalleryImage = {
  id: string;
  imageUrl: string;
  order: number;
};

type Gallery = {
  id: string;
  title: string;
  description: string | null;
  images: GalleryImage[];
};

type BookingResult = {
  id: string;
  appointmentDate: string;
  appointmentHour: number;
  appointmentMinute: number;
  durationHours: number;
  durationMinutes: number;
  service: string;
  clientName: string;
};

type Employee = {
  id: string;
  name: string;
  color: string | null;
};

const translations = {
  bookAppointment: {
    EN: 'Book an Appointment',
    ES: 'Reservar una Cita',
    FR: 'Prendre Rendez-vous',
    PT: 'Agendar um Horario',
  },
  at: {
    EN: 'at',
    ES: 'en',
    FR: 'a',
    PT: 'em',
  },
  selectDate: {
    EN: 'Select Date',
    ES: 'Seleccionar Fecha',
    FR: 'Selectionner la Date',
    PT: 'Selecionar Data',
  },
  selectTime: {
    EN: 'Select Time',
    ES: 'Seleccionar Hora',
    FR: "Selectionner l'Heure",
    PT: 'Selecionar Horario',
  },
  duration: {
    EN: 'Service Duration',
    ES: 'Duracion del Servicio',
    FR: 'Duree du Service',
    PT: 'Duracao do Servico',
  },
  clientName: {
    EN: 'Your Name',
    ES: 'Tu Nombre',
    FR: 'Votre Nom',
    PT: 'Seu Nome',
  },
  clientNamePlaceholder: {
    EN: 'Enter your name',
    ES: 'Ingresa tu nombre',
    FR: 'Entrez votre nom',
    PT: 'Digite seu nome',
  },
  serviceDescription: {
    EN: 'Service Description',
    ES: 'Descripcion del Servicio',
    FR: 'Description du Service',
    PT: 'Descricao do Servico',
  },
  servicePlaceholder: {
    EN: 'Describe the service you need...',
    ES: 'Describe el servicio que necesitas...',
    FR: 'Decrivez le service dont vous avez besoin...',
    PT: 'Descreva o servico que voce precisa...',
  },
  hour: {
    EN: 'Hour',
    ES: 'Hora',
    FR: 'Heure',
    PT: 'Hora',
  },
  minutes: {
    EN: 'Min',
    ES: 'Min',
    FR: 'Min',
    PT: 'Min',
  },
  bookNow: {
    EN: 'Book Appointment',
    ES: 'Reservar Cita',
    FR: 'Reserver',
    PT: 'Agendar',
  },
  booking: {
    EN: 'Booking...',
    ES: 'Reservando...',
    FR: 'Reservation...',
    PT: 'Agendando...',
  },
  requiredFields: {
    EN: 'Please fill in all required fields',
    ES: 'Por favor complete todos los campos requeridos',
    FR: 'Veuillez remplir tous les champs requis',
    PT: 'Por favor preencha todos os campos obrigatorios',
  },
  durationPending: {
    EN: 'Assigned by salon',
    ES: 'Asignada por el salon',
    FR: 'Attribuee par le salon',
    PT: 'Atribuida pelo salao',
  },
  pastTimeError: {
    EN: 'Cannot book appointments in the past',
    ES: 'No se puede reservar en el pasado',
    FR: 'Impossible de reserver dans le passe',
    PT: 'Nao e possivel agendar no passado',
  },
  pastTimeMessage: {
    EN: 'Please select a future time for your appointment.',
    ES: 'Por favor selecciona un horario futuro para tu cita.',
    FR: 'Veuillez selectionner une heure future pour votre rendez-vous.',
    PT: 'Por favor selecione um horario futuro para seu agendamento.',
  },
  bookingSuccess: {
    EN: 'Appointment Booked!',
    ES: 'Cita Reservada!',
    FR: 'Rendez-vous Reserve!',
    PT: 'Agendamento Confirmado!',
  },
  successMessage: {
    EN: 'Your appointment has been successfully booked.',
    ES: 'Tu cita ha sido reservada exitosamente.',
    FR: 'Votre rendez-vous a ete reserve avec succes.',
    PT: 'Seu agendamento foi confirmado com sucesso.',
  },
  appointmentDetails: {
    EN: 'Appointment Details',
    ES: 'Detalles de la Cita',
    FR: 'Details du Rendez-vous',
    PT: 'Detalhes do Agendamento',
  },
  date: {
    EN: 'Date',
    ES: 'Fecha',
    FR: 'Date',
    PT: 'Data',
  },
  time: {
    EN: 'Time',
    ES: 'Hora',
    FR: 'Heure',
    PT: 'Horario',
  },
  service: {
    EN: 'Service',
    ES: 'Servicio',
    FR: 'Service',
    PT: 'Servico',
  },
  bookAnother: {
    EN: 'Book Another Appointment',
    ES: 'Reservar Otra Cita',
    FR: 'Reserver un Autre Rendez-vous',
    PT: 'Agendar Outro Horario',
  },
  loading: {
    EN: 'Loading...',
    ES: 'Cargando...',
    FR: 'Chargement...',
    PT: 'Carregando...',
  },
  salonNotFound: {
    EN: 'Salon not found',
    ES: 'Salon no encontrado',
    FR: 'Salon non trouve',
    PT: 'Salao nao encontrado',
  },
  salonNotFoundMessage: {
    EN: 'The salon you are looking for does not exist or the link is invalid.',
    ES: 'El salon que buscas no existe o el enlace es invalido.',
    FR: 'Le salon que vous recherchez n\'existe pas ou le lien est invalide.',
    PT: 'O salao que voce procura nao existe ou o link e invalido.',
  },
  close: {
    EN: 'Close',
    ES: 'Cerrar',
    FR: 'Fermer',
    PT: 'Fechar',
  },
  workGallery: {
    EN: 'Our Work',
    ES: 'Nuestro Trabajo',
    FR: 'Notre Travail',
    PT: 'Nosso Trabalho',
  },
  viewAllWork: {
    EN: 'View all our work',
    ES: 'Ver todo nuestro trabajo',
    FR: 'Voir tout notre travail',
    PT: 'Veja todo nosso trabalho',
  },
  noGalleryImages: {
    EN: 'No gallery images available',
    ES: 'No hay imagenes de galeria disponibles',
    FR: 'Aucune image de galerie disponible',
    PT: 'Nenhuma imagem de galeria disponivel',
  },
  photos: {
    EN: 'photos',
    ES: 'fotos',
    FR: 'photos',
    PT: 'fotos',
  },
  salonClosed: {
    EN: 'Currently Closed',
    ES: 'Actualmente Cerrado',
    FR: 'Actuellement Ferme',
    PT: 'Atualmente Fechado',
  },
  salonClosedMessage: {
    EN: 'This salon is not accepting bookings at the moment. Please check back later.',
    ES: 'Este salon no esta aceptando reservas en este momento. Por favor vuelve mas tarde.',
    FR: 'Ce salon n\'accepte pas de reservations pour le moment. Veuillez revenir plus tard.',
    PT: 'Este salao nao esta aceitando agendamentos no momento. Por favor volte mais tarde.',
  },
  workingHours: {
    EN: 'Working Hours',
    ES: 'Horario de Trabajo',
    FR: 'Heures de Travail',
    PT: 'Horario de Funcionamento',
  },
  selectEmployee: {
    EN: 'Select Employee (Optional)',
    ES: 'Seleccionar Empleado (Opcional)',
    FR: 'Selectionner un Employe (Optionnel)',
    PT: 'Selecionar Funcionario (Opcional)',
  },
  anyAvailable: {
    EN: 'Any Available',
    ES: 'Cualquier Disponible',
    FR: 'N\'importe quel Disponible',
    PT: 'Qualquer Disponivel',
  },
  employeeNotAvailable: {
    EN: 'Employee Not Available',
    ES: 'Empleado No Disponible',
    FR: 'Employe Non Disponible',
    PT: 'Funcionario Nao Disponivel',
  },
  employeeNotAvailableMessage: {
    EN: 'This employee is not available at this time. Please choose a different time or employee.',
    ES: 'Este empleado no esta disponible en este horario. Por favor elige otro horario o empleado.',
    FR: 'Cet employe n\'est pas disponible a cette heure. Veuillez choisir un autre horaire ou employe.',
    PT: 'Este funcionario nao esta disponivel neste horario. Por favor escolha outro horario ou funcionario.',
  },
  clientCodeLabel: {
    EN: 'Client Code (Optional)',
    ES: 'Codigo de Cliente (Opcional)',
    FR: 'Code Client (Optionnel)',
    PT: 'Codigo do Cliente (Opcional)',
  },
  clientCodePlaceholder: {
    EN: 'Enter your code (e.g. CLT-0001)',
    ES: 'Ingresa tu codigo (ej. CLT-0001)',
    FR: 'Entrez votre code (ex. CLT-0001)',
    PT: 'Digite seu codigo (ex. CLT-0001)',
  },
  clientCodeHint: {
    EN: 'If you have a client code, enter it here. Otherwise, one will be assigned automatically.',
    ES: 'Si tienes un codigo de cliente, ingresalo aqui. De lo contrario, se asignara uno automaticamente.',
    FR: 'Si vous avez un code client, entrez-le ici. Sinon, un code sera attribue automatiquement.',
    PT: 'Se voce tem um codigo de cliente, digite aqui. Caso contrario, um sera atribuido automaticamente.',
  },
  lookupButton: {
    EN: 'Look Up My Account',
    ES: 'Buscar Mi Cuenta',
    FR: 'Rechercher Mon Compte',
    PT: 'Buscar Minha Conta',
  },
  lookupDescription: {
    EN: 'Have a client code? Look up your info to book faster.',
    ES: 'Tienes un codigo de cliente? Busca tu informacion para reservar mas rapido.',
    FR: 'Vous avez un code client? Recherchez vos informations pour reserver plus vite.',
    PT: 'Tem um codigo de cliente? Busque suas informacoes para agendar mais rapido.',
  },
  lookupTitle: {
    EN: 'Look Up Your Account',
    ES: 'Buscar Tu Cuenta',
    FR: 'Rechercher Votre Compte',
    PT: 'Buscar Sua Conta',
  },
  lookupInputPlaceholder: {
    EN: 'Enter code (e.g. CLT-0001 or 0001)',
    ES: 'Ingresa codigo (ej. CLT-0001 o 0001)',
    FR: 'Entrez code (ex. CLT-0001 ou 0001)',
    PT: 'Digite codigo (ex. CLT-0001 ou 0001)',
  },
  lookupSearch: {
    EN: 'Search',
    ES: 'Buscar',
    FR: 'Rechercher',
    PT: 'Buscar',
  },
  lookupSearching: {
    EN: 'Searching...',
    ES: 'Buscando...',
    FR: 'Recherche...',
    PT: 'Buscando...',
  },
  lookupNotFound: {
    EN: 'No account found with this code. Please check and try again.',
    ES: 'No se encontro una cuenta con este codigo. Verifica e intenta de nuevo.',
    FR: 'Aucun compte trouve avec ce code. Veuillez verifier et reessayer.',
    PT: 'Nenhuma conta encontrada com este codigo. Verifique e tente novamente.',
  },
  lookupSuccess: {
    EN: 'Account found! Your info has been filled in.',
    ES: 'Cuenta encontrada! Tu informacion ha sido completada.',
    FR: 'Compte trouve! Vos informations ont ete remplies.',
    PT: 'Conta encontrada! Suas informacoes foram preenchidas.',
  },
  cancel: {
    EN: 'Cancel',
    ES: 'Cancelar',
    FR: 'Annuler',
    PT: 'Cancelar',
  },
};

// 12-hour format hours (1-12)
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

// No fixed duration - salon owner assigns duration after booking
const FIXED_DURATION_HOURS = 0;
const FIXED_DURATION_MINUTES = 0;

// Generate calendar data for 3 months (current + next 2)
const generateCalendarData = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months: { year: number; month: number; days: (Date | null)[] }[] = [];

  for (let m = 0; m < 3; m++) {
    const date = new Date(today.getFullYear(), today.getMonth() + m, 1);
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d, 0, 0, 0, 0));
    }

    months.push({ year, month, days });
  }

  return { months, today };
};

function formatTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;
  const m = minute.toString().padStart(2, '0');
  return `${hour12}:${m} ${ampm}`;
}

function formatDuration(hours: number, minutes: number): string {
  let result = '';
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;
  return result.trim() || '0m';
}

function formatDateDisplay(date: Date, lang: Language): string {
  const locales: Record<Language, string> = {
    EN: 'en-US',
    ES: 'es-ES',
    FR: 'fr-FR',
    PT: 'pt-BR',
  };
  return date.toLocaleDateString(locales[lang], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getMonthName(month: number, lang: Language): string {
  const date = new Date(2024, month, 1);
  const locales: Record<Language, string> = {
    EN: 'en-US',
    ES: 'es-ES',
    FR: 'fr-FR',
    PT: 'pt-BR',
  };
  return date.toLocaleDateString(locales[lang], { month: 'long' });
}

function getWeekdayHeaders(lang: Language): string[] {
  const locales: Record<Language, string> = {
    EN: 'en-US',
    ES: 'es-ES',
    FR: 'fr-FR',
    PT: 'pt-BR',
  };
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(2024, 0, i);
    days.push(date.toLocaleDateString(locales[lang], { weekday: 'short' }).charAt(0).toUpperCase());
  }
  return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function PublicBookingPage() {
  const params = useParams();
  const router = useRouter();
  const salonId = params?.salonId as string;

  const [salon, setSalon] = useState<SalonData | null>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('EN');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showEmployeePicker, setShowEmployeePicker] = useState(false);

  // Form state
  const { months, today } = useMemo(() => generateCalendarData(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedHour12, setSelectedHour12] = useState(9);
  const [selectedAmPm, setSelectedAmPm] = useState<AmPm>('AM');
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [clientName, setClientName] = useState('');
  const [clientCodeInput, setClientCodeInput] = useState('');
  const [service, setService] = useState('');

  // Gallery modal state
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [showMinutePicker, setShowMinutePicker] = useState(false);
  const [showAmPmPicker, setShowAmPmPicker] = useState(false);

  // Client lookup state
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupSuccess, setLookupSuccess] = useState(false);

  // Error modals
  const [showPastTimeError, setShowPastTimeError] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Success state
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const t = (key: keyof typeof translations) => translations[key][language];
  const weekdayHeaders = useMemo(() => getWeekdayHeaders(language), [language]);

  // Fetch salon data
  useEffect(() => {
    if (salonId) {
      fetchSalon();
    }
  }, [salonId]);

  const fetchSalon = async () => {
    try {
      // Fetch salon info and galleries in parallel
      const [salonResponse, galleriesResponse] = await Promise.all([
        fetch(`/api/book/${salonId}`),
        fetch(`/api/book/${salonId}/gallery`),
      ]);

      const salonData = await salonResponse.json();
      const galleriesData = await galleriesResponse.json();

      if (!salonData.success) {
        setError(salonData.error || 'Failed to fetch salon');
        setSalon(null);
      } else {
        setSalon(salonData.salon);
        setEmployees(salonData.employees || []);
        setError(null);
      }

      if (galleriesData.success) {
        setGalleries(galleriesData.galleries || []);
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Convert 12-hour to 24-hour format for API
  const get24Hour = () => {
    if (selectedAmPm === 'AM') {
      return selectedHour12 === 12 ? 0 : selectedHour12;
    } else {
      return selectedHour12 === 12 ? 12 : selectedHour12 + 12;
    }
  };

  // Check if selected time is in the past
  const isTimeInPast = () => {
    if (!isSameDay(selectedDate, today)) {
      return false;
    }
    const now = new Date();
    const hour24 = get24Hour();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (hour24 < currentHour) return true;
    if (hour24 === currentHour && selectedMinute <= currentMinute) return true;
    return false;
  };

  // Handle booking submission
  const handleSubmit = async () => {
    setValidationError(null);

    if (!clientName.trim()) {
      setValidationError(t('requiredFields'));
      return;
    }

    if (!service.trim()) {
      setValidationError(t('requiredFields'));
      return;
    }

    if (isTimeInPast()) {
      setShowPastTimeError(true);
      return;
    }

    setSubmitting(true);

    try {
      const hour24 = get24Hour();
      const appointmentDateStr = formatDateForAPI(selectedDate);

      const response = await fetch(`/api/book/${salonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          service: service.trim(),
          appointmentDate: appointmentDateStr,
          appointmentHour: hour24,
          appointmentMinute: selectedMinute,
          durationHours: FIXED_DURATION_HOURS,
          durationMinutes: FIXED_DURATION_MINUTES,
          employeeId: selectedEmployee,
          clientCode: clientCodeInput.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to the live status page with client code
        const codeParam = data.clientCode ? `?clientCode=${encodeURIComponent(data.clientCode)}` : '';
        router.push(`/booking/${data.appointment.id}${codeParam}`);
        return;
      } else {
        setValidationError(data.error || 'Booking failed');
      }
    } catch {
      setValidationError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form for another booking
  const handleBookAnother = () => {
    setBookingSuccess(false);
    setBookingResult(null);
    setClientName('');
    setClientCodeInput('');
    setService('');
    setSelectedDate(today);
    setSelectedHour12(9);
    setSelectedAmPm('AM');
    setSelectedMinute(0);
    setSelectedEmployee(null);
  };

  // Handle client code lookup
  const handleLookup = async () => {
    if (!lookupCode.trim()) return;

    setLookupLoading(true);
    setLookupError(null);
    setLookupSuccess(false);

    try {
      const response = await fetch(`/api/book/${salonId}/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: lookupCode.trim() }),
      });

      const data = await response.json();

      if (data.success && data.client) {
        const fullName = [data.client.firstName, data.client.lastName].filter(Boolean).join(' ');
        setClientName(fullName);
        setClientCodeInput(data.client.clientCode || '');
        setLookupSuccess(true);
        // Close modal after a short delay
        setTimeout(() => {
          setShowLookupModal(false);
          setLookupCode('');
          setLookupSuccess(false);
        }, 1500);
      } else {
        setLookupError(t('lookupNotFound'));
      }
    } catch {
      setLookupError('Network error. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Get selected employee name for display
  const getSelectedEmployeeName = () => {
    if (!selectedEmployee) return t('anyAvailable');
    const emp = employees.find(e => e.id === selectedEmployee);
    return emp?.name || t('anyAvailable');
  };

  // Get all gallery images flattened
  const allGalleryImages = useMemo(() => {
    return galleries.flatMap((gallery) => gallery.images);
  }, [galleries]);

  const isDateSelectable = (date: Date | null) => {
    if (!date) return false;
    return date.getTime() >= today.getTime();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !salon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">{t('salonNotFound')}</h1>
          <p className="text-gray-500">{t('salonNotFoundMessage')}</p>
        </div>
      </div>
    );
  }

  // Salon closed - show overlay blocking bookings
  if (!salon.isOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white relative overflow-hidden">
        {/* Language Selector */}
        <div className="absolute top-4 right-4 z-10">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="EN">English</option>
            <option value="ES">Español</option>
            <option value="FR">Français</option>
            <option value="PT">Português</option>
          </select>
        </div>

        {/* Decorative background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-40 h-40 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 bg-orange-500 rounded-full blur-3xl"></div>
        </div>

        <div className="text-center p-8 max-w-md relative z-10">
          {/* Salon Image */}
          {salon.businessImage && (
            <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={salon.businessImage}
                alt={salon.businessName}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Business Name */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{salon.businessName}</h2>

          {/* Closed Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-200">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Closed Message */}
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{t('salonClosed')}</h1>
          <p className="text-gray-500 leading-relaxed">{t('salonClosedMessage')}</p>

          {/* Contact Info */}
          {salon.phoneNumber && salon.phoneCode && (
            <div className="mt-8 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Contact</p>
              <a
                href={`tel:${salon.phoneCode}${salon.phoneNumber}`}
                className="text-pink-500 font-medium hover:text-pink-600 transition-colors"
              >
                {salon.phoneCode} {salon.phoneNumber}
              </a>
            </div>
          )}

          <div className="mt-10">
            <p className="text-xs text-gray-400">Powered by Nails Salon Connect</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (bookingSuccess && bookingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        {/* Language Selector */}
        <div className="absolute top-4 right-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="EN">English</option>
            <option value="ES">Espanol</option>
            <option value="FR">Francais</option>
            <option value="PT">Portugues</option>
          </select>
        </div>

        <div className="max-w-md mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{t('bookingSuccess')}</h1>
            <p className="text-gray-600 mt-2">{t('successMessage')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 text-lg">{t('appointmentDetails')}</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">{t('date')}</span>
                <span className="font-medium text-gray-800">
                  {formatDateDisplay(new Date(bookingResult.appointmentDate), language)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">{t('time')}</span>
                <span className="font-medium text-gray-800">
                  {formatTime(bookingResult.appointmentHour, bookingResult.appointmentMinute)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">{t('duration')}</span>
                <span className="font-medium text-gray-800">
                  {bookingResult.durationHours === 0 && bookingResult.durationMinutes === 0
                    ? t('durationPending')
                    : formatDuration(bookingResult.durationHours, bookingResult.durationMinutes)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">{t('service')}</span>
                <span className="font-medium text-gray-800">{bookingResult.service}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleBookAnother}
            className="w-full mt-6 bg-pink-500 hover:bg-pink-600 text-white px-6 py-4 rounded-xl font-medium transition-colors"
          >
            {t('bookAnother')}
          </button>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">Powered by Nails Salon Connect</p>
          </div>
        </div>
      </div>
    );
  }

  // Main booking form
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-10">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="EN">English</option>
          <option value="ES">Espanol</option>
          <option value="FR">Francais</option>
          <option value="PT">Portugues</option>
        </select>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          {salon.businessImage ? (
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-pink-200">
              <Image
                src={salon.businessImage}
                alt={salon.businessName}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800">{t('bookAppointment')}</h1>
          <p className="text-pink-600 font-medium mt-1">{t('at')} {salon.businessName}</p>
          <p className="text-gray-500 text-sm mt-1">{salon.address}, {salon.city}, {salon.country}</p>
          {salon.phoneNumber && (
            <a
              href={`tel:${salon.phoneCode || ''}${salon.phoneNumber}`}
              className="inline-flex items-center gap-1.5 text-pink-600 text-sm mt-2 hover:text-pink-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call: {salon.phoneCode} {salon.phoneNumber}
            </a>
          )}
        </div>

        {/* Work Gallery Section */}
        {allGalleryImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">{t('workGallery')}</h2>
              <span className="text-sm text-gray-500">
                {allGalleryImages.length} {t('photos')}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {allGalleryImages.slice(0, 6).map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => {
                    setSelectedGalleryImage(image.imageUrl);
                    setShowGalleryModal(true);
                  }}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                >
                  <Image
                    src={image.imageUrl}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 150px"
                  />
                  {index === 5 && allGalleryImages.length > 6 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        +{allGalleryImages.length - 6}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {allGalleryImages.length > 6 && (
              <button
                onClick={() => setShowGalleryModal(true)}
                className="w-full mt-3 py-2 text-pink-600 font-medium text-sm hover:text-pink-700 transition-colors"
              >
                {t('viewAllWork')}
              </button>
            )}
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            {validationError}
          </div>
        )}

        {/* Client Lookup Button */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <p className="text-sm text-gray-500 mb-3">{t('lookupDescription')}</p>
          <button
            onClick={() => {
              setShowLookupModal(true);
              setLookupError(null);
              setLookupSuccess(false);
              setLookupCode('');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-pink-600 font-medium hover:bg-pink-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {t('lookupButton')}
          </button>
        </div>

        {/* Booking Form */}
        <div className="space-y-6">
          {/* Date Picker */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('selectDate')}</label>
            <button
              onClick={() => setShowDatePicker(true)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-pink-300 transition-colors"
            >
              <span className="font-medium text-gray-800">{formatDateDisplay(selectedDate, language)}</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {/* Time Picker */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('selectTime')}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHourPicker(true)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl flex flex-col items-center hover:border-pink-300 transition-colors"
              >
                <span className="text-xs text-gray-400">{t('hour')}</span>
                <span className="text-2xl font-bold text-gray-800">{selectedHour12}</span>
              </button>
              <div className="flex items-center text-2xl font-bold text-gray-400">:</div>
              <button
                onClick={() => setShowMinutePicker(true)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl flex flex-col items-center hover:border-pink-300 transition-colors"
              >
                <span className="text-xs text-gray-400">{t('minutes')}</span>
                <span className="text-2xl font-bold text-gray-800">{selectedMinute.toString().padStart(2, '0')}</span>
              </button>
              <button
                onClick={() => setShowAmPmPicker(true)}
                className="px-4 py-3 border border-pink-200 bg-pink-50 rounded-xl flex items-center justify-center hover:bg-pink-100 transition-colors"
              >
                <span className="text-lg font-bold text-pink-600">{selectedAmPm}</span>
              </button>
            </div>
          </div>

          {/* Employee Picker (only show if salon has employees) */}
          {employees.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">{t('selectEmployee')}</label>
              <button
                onClick={() => setShowEmployeePicker(true)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-pink-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {selectedEmployee && (
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: employees.find(e => e.id === selectedEmployee)?.color || '#E63B60' }}
                    />
                  )}
                  <span className={`font-medium ${selectedEmployee ? 'text-gray-800' : 'text-gray-500'}`}>
                    {getSelectedEmployeeName()}
                  </span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          )}

          {/* Client Name */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('clientName')}</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder={t('clientNamePlaceholder')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Client Code (Optional) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('clientCodeLabel')}</label>
            <p className="text-xs text-gray-400 mb-3">{t('clientCodeHint')}</p>
            <input
              type="text"
              value={clientCodeInput}
              onChange={(e) => setClientCodeInput(e.target.value.toUpperCase())}
              placeholder={t('clientCodePlaceholder')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent uppercase"
              maxLength={8}
            />
          </div>

          {/* Service Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('serviceDescription')}</label>
            <textarea
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder={t('servicePlaceholder')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white px-6 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('booking')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('bookNow')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">Powered by Nails Salon Connect</p>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center" onClick={() => setShowDatePicker(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{t('selectDate')}</h3>
              <button onClick={() => setShowDatePicker(false)} className="text-pink-500 font-medium">Done</button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {months.map(({ year, month, days }) => (
                <div key={`${year}-${month}`} className="mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4 capitalize">
                    {getMonthName(month, language)} {year}
                  </h4>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekdayHeaders.map((day, i) => (
                      <div key={i} className="text-center text-xs text-gray-400 py-2">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((date, i) => (
                      <div key={i} className="aspect-square flex items-center justify-center">
                        {date && (
                          <button
                            onClick={() => {
                              if (isDateSelectable(date)) {
                                setSelectedDate(date);
                                setShowDatePicker(false);
                              }
                            }}
                            disabled={!isDateSelectable(date)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                              isSameDay(date, selectedDate)
                                ? 'bg-pink-500 text-white'
                                : isSameDay(date, today)
                                  ? 'border-2 border-pink-500 text-pink-500 font-semibold'
                                  : isDateSelectable(date)
                                    ? 'hover:bg-pink-50 text-gray-700'
                                    : 'text-gray-300 cursor-not-allowed'
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hour Picker Modal */}
      {showHourPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center" onClick={() => setShowHourPicker(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[50vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{t('hour')}</h3>
              <button onClick={() => setShowHourPicker(false)} className="text-pink-500 font-medium">Done</button>
            </div>
            <div className="overflow-y-auto max-h-[40vh]">
              {HOURS_12.map((hour) => (
                <button
                  key={hour}
                  onClick={() => {
                    setSelectedHour12(hour);
                    setShowHourPicker(false);
                  }}
                  className={`w-full py-4 text-center text-lg ${
                    hour === selectedHour12
                      ? 'bg-pink-50 text-pink-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Minute Picker Modal */}
      {showMinutePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center" onClick={() => setShowMinutePicker(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[50vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{t('minutes')}</h3>
              <button onClick={() => setShowMinutePicker(false)} className="text-pink-500 font-medium">Done</button>
            </div>
            <div className="overflow-y-auto max-h-[40vh]">
              {MINUTES.map((minute) => (
                <button
                  key={minute}
                  onClick={() => {
                    setSelectedMinute(minute);
                    setShowMinutePicker(false);
                  }}
                  className={`w-full py-4 text-center text-lg ${
                    minute === selectedMinute
                      ? 'bg-pink-50 text-pink-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {minute.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AM/PM Picker Modal */}
      {showAmPmPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center" onClick={() => setShowAmPmPicker(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">AM / PM</h3>
              <button onClick={() => setShowAmPmPicker(false)} className="text-pink-500 font-medium">Done</button>
            </div>
            <div>
              {(['AM', 'PM'] as AmPm[]).map((ampm) => (
                <button
                  key={ampm}
                  onClick={() => {
                    setSelectedAmPm(ampm);
                    setShowAmPmPicker(false);
                  }}
                  className={`w-full py-4 text-center text-lg ${
                    ampm === selectedAmPm
                      ? 'bg-pink-50 text-pink-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {ampm}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col" onClick={() => {
          setShowGalleryModal(false);
          setSelectedGalleryImage(null);
        }}>
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => {
                setShowGalleryModal(false);
                setSelectedGalleryImage(null);
              }}
              className="text-white p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Selected image view */}
          {selectedGalleryImage && (
            <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full max-w-2xl aspect-square">
                <Image
                  src={selectedGalleryImage}
                  alt="Gallery image"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </div>
          )}

          {/* Thumbnail strip */}
          <div className="p-4 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-2 justify-center flex-wrap max-h-32 overflow-y-auto">
              {allGalleryImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedGalleryImage(image.imageUrl)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                    selectedGalleryImage === image.imageUrl ? 'ring-2 ring-pink-500' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image.imageUrl}
                    alt="Gallery thumbnail"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Past Time Error Modal */}
      {showPastTimeError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('pastTimeError')}</h3>
            <p className="text-gray-500 mb-6">{t('pastTimeMessage')}</p>
            <button
              onClick={() => setShowPastTimeError(false)}
              className="w-full bg-pink-500 text-white py-3 rounded-xl font-medium"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Client Lookup Modal */}
      {showLookupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowLookupModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('lookupTitle')}</h3>

            <input
              type="text"
              value={lookupCode}
              onChange={(e) => {
                setLookupCode(e.target.value.toUpperCase());
                setLookupError(null);
                setLookupSuccess(false);
              }}
              placeholder={t('lookupInputPlaceholder')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent uppercase mb-4"
              maxLength={8}
              autoFocus
            />

            {/* Error Message */}
            {lookupError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {lookupError}
              </div>
            )}

            {/* Success Message */}
            {lookupSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('lookupSuccess')}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowLookupModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleLookup}
                disabled={lookupLoading || !lookupCode.trim()}
                className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 disabled:bg-pink-300 transition-colors flex items-center justify-center gap-2"
              >
                {lookupLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('lookupSearching')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {t('lookupSearch')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Picker Modal */}
      {showEmployeePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center" onClick={() => setShowEmployeePicker(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[60vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{t('selectEmployee')}</h3>
              <button onClick={() => setShowEmployeePicker(false)} className="text-pink-500 font-medium">Done</button>
            </div>
            <div className="overflow-y-auto max-h-[50vh]">
              {/* Any Available Option */}
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setShowEmployeePicker(false);
                }}
                className={`w-full py-4 px-4 text-left flex items-center gap-3 ${
                  !selectedEmployee
                    ? 'bg-pink-50 text-pink-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className={`font-medium ${!selectedEmployee ? 'text-pink-600' : 'text-gray-800'}`}>
                  {t('anyAvailable')}
                </span>
                {!selectedEmployee && (
                  <svg className="w-5 h-5 ml-auto text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Employee List */}
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => {
                    setSelectedEmployee(employee.id);
                    setShowEmployeePicker(false);
                  }}
                  className={`w-full py-4 px-4 text-left flex items-center gap-3 ${
                    selectedEmployee === employee.id
                      ? 'bg-pink-50 text-pink-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: employee.color || '#E63B60' }}
                  >
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`font-medium ${selectedEmployee === employee.id ? 'text-pink-600' : 'text-gray-800'}`}>
                    {employee.name}
                  </span>
                  {selectedEmployee === employee.id && (
                    <svg className="w-5 h-5 ml-auto text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

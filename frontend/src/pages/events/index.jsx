import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/ui/Header';
import CalendarView from './components/CalendarView';
import EventFilters from './components/EventFilters';
import EventList from './components/EventList';
import AddEventForm from './components/AddEventForm';
import EditEvent from './components/EditEvent';
import { Plus } from 'lucide-react';
import Footer from '../../components/ui/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../../services/eventService';
import { getCurrentFamilyId, initializeFamilyId } from '../../services/familyService';

const CalendarEventsStellarMemory = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState({
    eventType: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [activeFamilyId, setActiveFamilyId] = useState(null);

  // Initialize active family using familyService (localStorage + /families API)
  useEffect(() => {
    const setupFamily = async () => {
      // If there's already a family selected, use it
      let id = getCurrentFamilyId();

      // If not, try to initialize from API (pick first family)
      if (!id && currentUser) {
        id = await initializeFamilyId();
      }

      if (id) {
        setActiveFamilyId(id);
      }
    };

    setupFamily();
  }, [currentUser]);

  const mapApiEventToUiEvent = (apiEvent) => {
    // Backend fields: id, title, eventType (or type), eventDate, reminder (minutes as string), description
    const eventDate = apiEvent.eventDate ? new Date(apiEvent.eventDate) : null;
    const dateStr = eventDate ? eventDate.toISOString().split('T')[0] : '';
    const timeStr = eventDate
      ? eventDate.toTimeString().slice(0, 5) // HH:MM
      : '12:00';

  let reminderDays = '1';
    if (apiEvent.reminder != null) {
      const minutes = Number(apiEvent.reminder);
      if (!Number.isNaN(minutes)) {
        reminderDays = String(Math.round(minutes / (24 * 60)));
      }
    }
    // Normalize event type to lowercase for consistent UI & filtering
    const rawType = apiEvent.eventType || apiEvent.type || 'OTHER';
    const normalizedType = rawType.toString().toLowerCase();

    return {
      id: apiEvent.id,
      name: apiEvent.title,
      type: normalizedType,
      date: dateStr,
      time: timeStr,
      reminder: reminderDays,
      description: apiEvent.description || '',
    };
  };

  const loadEvents = async () => {
    if (!activeFamilyId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchEvents(activeFamilyId, {
        eventType: filters.eventType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });
      const apiEvents = res.data ?? res;
      const uiEvents = apiEvents.map(mapApiEventToUiEvent);
      setEvents(uiEvents);
    } catch (error) {
      console.error('Failed to load events from API', error);
      setError('Không tải được danh sách sự kiện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Set page title
  useEffect(() => {
    document.title = 'RiO Universe - Lịch & Sự kiện';
  }, []);

  // Load events when filters or active family changes
  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFamilyId, filters.eventType, filters.dateFrom, filters.dateTo]);

  // Get events for selected date
  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date?.toISOString()?.split('T')?.[0];
    return events?.filter((event) => event?.date === dateStr);
  };

  // Get filtered events
  const getFilteredEvents = () => {
    let filtered = [...events];

    // Filter by event type
    if (filters?.eventType !== 'all') {
      filtered = filtered?.filter((event) => event?.type === filters?.eventType);
    }

    // Filter by date range
    if (filters?.dateFrom) {
      filtered = filtered?.filter((event) => event?.date >= filters?.dateFrom);
    }
    if (filters?.dateTo) {
      filtered = filtered?.filter((event) => event?.date <= filters?.dateTo);
    }

    return filtered;
  };

  const handleAddEvent = async (newEvent) => {
    if (!activeFamilyId) return;
    try {
      const res = await createEvent(activeFamilyId, newEvent);
      const created = res.data ?? res;
      const uiEvent = mapApiEventToUiEvent(created);
      setEvents((prev) => [...prev, uiEvent]);
      // Return true so AddEventForm can show success state
      return true;
    } catch (error) {
      console.error('Failed to create event', error);
      setError('Tạo sự kiện thất bại.');
      // Signal failure so AddEventForm can show error state
      return false;
    }
  };

  const handleUpdateEvent = async (updatedEvent) => {
    if (!activeFamilyId) return;
    try {
      const res = await updateEvent(activeFamilyId, updatedEvent.id, updatedEvent);
      const updated = res.data ?? res;
      const uiEvent = mapApiEventToUiEvent(updated);
      setEvents((prev) => prev.map((event) => (event.id === uiEvent.id ? uiEvent : event)));
      // Modal will be closed by component after notification inside EditEvent
    } catch (error) {
      console.error('Failed to update event', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!activeFamilyId) return;
    try {
      await deleteEvent(activeFamilyId, id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (error) {
      console.error('Failed to delete event', error);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen text-foreground relative overflow-x-hidden">
      {/* Header */}
      <Header />
      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <motion.div
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-cosmic-glow font-accent text-center mb-8 mt-4"
            initial={{ opacity: 0, y: 0.8 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          >
            <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent">
              Những vì sao ghi nhớ kí ức
            </span>
            <div className="w-48 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-2"></div>
          </motion.div>
          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-primary-foreground font-light opacity-80 text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Nơi thời gian và ký ức của dòng họ RiO giao hòa.
          </motion.p>

          {/* Calendar and Events Layout */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12 mt-8">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <CalendarView
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  events={events}
                  onDateClick={handleDateClick}
                  selectedDate={selectedDate}
                />
              </motion.div>
            </div>

            {/* Events Section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {/* Event Filters */}
                <EventFilters filters={filters} onFiltersChange={setFilters} />

                {/* Event List */}
                {loading && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    Đang tải sự kiện...
                  </div>
                )}

                {error && !loading && (
                  <div className="mt-4 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {!loading && !error && (
                  <EventList
                    events={selectedDate ? getEventsForDate(selectedDate) : getFilteredEvents()}
                    selectedDate={selectedDate}
                    onClearSelection={() => setSelectedDate(null)}
                    onEdit={setEditingEvent}
                    onDelete={handleDeleteEvent}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      {/* Add Event Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-cosmic-energy to-accent rounded-full flex items-center justify-center cosmic-glow-hover transition-all duration-300 z-50"
        onClick={() => setShowAddForm(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Plus size={24} />
      </motion.button>
      {/* Add Event Form */}
      {showAddForm && (
        <AddEventForm onSubmit={handleAddEvent} onClose={() => setShowAddForm(false)} />
      )}
      {/* Edit Event Form */}
      {editingEvent && (
        <EditEvent
          event={editingEvent}
          onSubmit={handleUpdateEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CalendarEventsStellarMemory;

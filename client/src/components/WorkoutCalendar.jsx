import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getAllWorkoutEvents } from "../utils/workoutStorage";

/**
 * WorkoutCalendar Component
 * An editorial-style calendar for tracking routines.
 * Customizable FullCalendar wrapper for FitMart design style.
 */
export default function WorkoutCalendar() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(getAllWorkoutEvents());
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleDateClick = (arg) => {
    localStorage.setItem("selectedDate", arg.dateStr);
    navigate("/notes");
  };

  const handleEventClick = (arg) => {
    const dateStr = arg.event.startStr.split("T")[0];
    localStorage.setItem("selectedDate", dateStr);
    navigate("/notes");
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden p-6 md:p-8 shadow-md hover:border-stone-300 hover:shadow-xl transition-all duration-500">
      <style>{`
        /* FullCalendar Customization — FitMart Style */
        .fc {
          --fc-button-bg-color: transparent;
          --fc-button-border-color: #e7e5e3; /* stone-200 */
          --fc-button-hover-bg-color: #f5f5f4; /* stone-100 */
          --fc-button-hover-border-color: #d6d3d1; /* stone-300 */
          --fc-button-active-bg-color: #fafaf9; /* stone-50 */
          --fc-button-active-border-color: #1c1917; /* stone-900 */
          --fc-button-text-color: #44403c; /* stone-700 */
          
          --fc-border-color: #f5f5f4;
          --fc-today-bg-color: #fafaf9;
          
          font-family: 'DM Sans', sans-serif;
        }

        .fc .fc-toolbar {
          position: relative;
          justify-content: space-between;
        }

        /* Absolutely center the title regardless of side buttons */
        .fc .fc-toolbar-chunk:nth-child(2) {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .fc .fc-toolbar-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.75rem;
          color: #1c1917; /* stone-900 */
          letter-spacing: -0.01em;
          text-align: center;
        }

        .fc .fc-button-primary {
          border-radius: 9999px;
          padding: 0.6rem 1.25rem;
          font-weight: 500;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
        }

        .fc .fc-button-primary:not(:disabled):active,
        .fc .fc-button-primary:not(:disabled).fc-button-active {
           background-color: #1c1917;
           color: white;
           border-color: #1c1917;
        }

        .fc .fc-daygrid-day-number {
          padding: 12px;
          font-size: 0.8rem;
          color: #78716c; /* stone-500 */
          text-decoration: none !important;
        }

        .fc .fc-col-header-cell-cushion {
          padding: 16px 4px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-size: 0.7rem;
          color: #a8a29e; /* stone-400 */
          text-decoration: none !important;
          font-weight: 600;
        }

        .fc .fc-day-today {
          background-color: #fafaf9 !important;
          border-top: 2px solid #1c1917 !important;
        }

        .fc-event {
          cursor: pointer;
          background-color: #1c1917; /* stone-900 */
          border: none;
          border-radius: 9999px; /* Pill shape */
          padding: 4px 10px;
          font-weight: 600;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 4px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 4px -1px rgba(0,0,0,0.1);
        }

        .fc-event:hover {
          background-color: #44403c; /* stone-700 */
          transform: translateY(-2px);
          box-shadow: 0 6px 10px -2px rgba(0,0,0,0.15);
        }

        .fc-daygrid-day {
          transition: background-color 0.2s ease;
          cursor: pointer;
        }

        .fc-daygrid-day:hover {
          background-color: #fafaf9;
        }

        /* Mobile specific adjustments */
        @media (max-width: 640px) {
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 1.25rem;
            align-items: center;
          }
          .fc .fc-toolbar-chunk:nth-child(2) {
            position: relative;
            left: 0;
            transform: none;
          }
          .fc .fc-toolbar-title {
            font-size: 1.4rem;
          }
        }
      `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
        aspectRatio={1.4}
        selectable={true}
      />

      <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] text-stone-400 uppercase tracking-widest">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-900 shadow-sm animate-pulse"></span>
          Pick a date to start logging
        </div>
        <p className="text-[10px] text-stone-300 font-medium">Local Data Only</p>
      </div>
    </div>
  );
}
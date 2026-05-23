import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddressSelector({ addresses = [], selectedAddressId, onSelect }) {
  const navigate = useNavigate();

  if (!addresses.length) {
    return (
      <div className="bg-stone-800 rounded-lg p-3">
        <p className="text-xs text-stone-400 mb-2">No saved addresses</p>
        <button
          onClick={() => navigate('/profile')}
          className="text-xs text-white underline hover:text-stone-300 transition-colors"
          aria-label="Go to profile to add a shipping address"
        >
          Add a shipping address →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-400 tracking-wide uppercase mb-2">Ship to</p>

      <AnimatePresence>
        {addresses.map((addr) => {
          const isSelected = addr.id === selectedAddressId;
          return (
            <motion.button
              key={addr.id}
              type="button"
              onClick={() => onSelect(addr)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              aria-pressed={isSelected}
              aria-label={`Select address: ${addr.label}, ${addr.line1}, ${addr.city}`}
              className={`w-full text-left rounded-lg p-3 border transition-all duration-200
                ${isSelected
                  ? 'bg-white text-stone-900 border-white'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:border-stone-500'
                }`}
            >
              <div className={`text-xs font-medium mb-0.5 ${isSelected ? 'text-stone-900' : 'text-white'}`}>
                {addr.label}
                {isSelected && <span className="ml-2 text-stone-500">✓</span>}
              </div>
              <div className={`text-xs ${isSelected ? 'text-stone-600' : 'text-stone-400'}`}>
                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
              </div>
              <div className={`text-xs ${isSelected ? 'text-stone-500' : 'text-stone-500'}`}>
                {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip}
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>

      <button
        onClick={() => navigate('/profile')}
        className="text-xs text-stone-400 hover:text-stone-200 transition-colors underline mt-1"
        aria-label="Manage addresses on profile page"
      >
        Manage addresses →
      </button>
    </div>
  );
}

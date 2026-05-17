import { useNavigate } from "react-router-dom";

export default function LegalFooterLinks({ className = "" }) {
  const navigate = useNavigate();

  return (
    <div className={`flex gap-4 sm:gap-5 ${className}`}>
      <button
        type="button"
        onClick={() => navigate("/privacy-policy")}
        className="text-xs text-stone-400 hover:text-stone-600 transition-colors min-h-9 px-1"
      >
        Privacy
      </button>
      <button
        type="button"
        onClick={() => navigate("/terms")}
        className="text-xs text-stone-400 hover:text-stone-600 transition-colors min-h-9 px-1"
      >
        Terms
      </button>
      <a
        href="mailto:support@fitmart.com"
        className="text-xs text-stone-400 hover:text-stone-600 transition-colors min-h-9 px-1 inline-flex items-center"
      >
        Support
      </a>
    </div>
  );
}

import React from "react";
import { motion } from "framer-motion";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

function ErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-5 lg:px-10 py-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-8 md:p-10 text-center shadow-lg hover:border-stone-300 transition-all duration-300"
      >
        <div className="mb-6 flex justify-center">
          <span className="text-[10px] tracking-[0.15em] uppercase bg-red-50 text-red-600 border border-red-100 px-3.5 py-1.5 rounded-full inline-block">
            System Notice
          </span>
        </div>

        <h1 className="font-['DM_Serif_Display'] text-3xl md:text-4xl text-stone-900 mb-4 leading-tight">
          Something went wrong.
        </h1>

        <p className="text-sm text-stone-500 leading-relaxed mb-8">
          The application encountered an unexpected error. Please refresh the page or return to the main dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.1 }}
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto bg-stone-900 text-white text-sm px-8 py-3 rounded-full hover:bg-stone-700 transition-colors cursor-pointer"
          >
            Refresh Page
          </motion.button>
          
          <motion.a
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.1 }}
            href="/"
            className="w-full sm:w-auto text-center border border-stone-300 text-stone-700 text-sm px-8 py-3 rounded-full hover:bg-stone-100 transition-colors"
          >
            Go Home
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}

export default ErrorBoundary;
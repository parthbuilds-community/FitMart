// src/components/AdminKPIGrid.jsx

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const KPICard = ({ label, value, sub, icon }) => (
  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 flex items-start justify-between gap-4 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
    <div className="min-w-0">
      <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-4 sm:mb-5 leading-tight">
        {label}
      </p>

      <p className="text-2xl sm:text-3xl font-semibold text-stone-900 leading-none">
        {value}
      </p>

      {sub && (
        <p className="text-xs text-stone-400 mt-2">
          {sub}
        </p>
      )}
    </div>

    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-lg text-stone-600 shrink-0">
      {icon}
    </div>
  </div>
);

const KPICardSkeleton = () => (
  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 flex items-start justify-between gap-4">
    <div className="min-w-0">
      {/* Label */}
      <div className="h-3 w-24 bg-stone-200 rounded-full animate-pulse mb-5" />

      {/* Value */}
      <div className="h-8 w-20 bg-stone-200 rounded-lg animate-pulse" />

      {/* Sub text */}
      <div className="h-3 w-28 bg-stone-100 rounded-full animate-pulse mt-3" />
    </div>

    {/* Icon */}
    <div className="w-10 h-10 rounded-xl bg-stone-100 animate-pulse shrink-0" />
  </div>
);

export default function AdminKPIGrid({ stats, loading = false }) {
  // Show skeleton cards while dashboard data is loading.
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <KPICardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Don't render KPI cards when there is no data
  // and the dashboard is no longer loading.
  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      <KPICard
        label="Total Orders"
        value={(stats.totalOrders || 0).toLocaleString("en-IN")}
        icon="◎"
      />

      <KPICard
        label="Customers"
        value={(stats.totalCustomers || 0).toLocaleString("en-IN")}
        icon="◉"
      />

      <KPICard
        label="Revenue"
        value={fmt(stats.totalRevenue || 0)}
        icon="₹"
      />

      <KPICard
        label="Low on Stock"
        value={(stats.lowStockCount || 0).toLocaleString("en-IN")}
        sub="Below 5 units"
        icon="─"
      />
    </div>
  );
}
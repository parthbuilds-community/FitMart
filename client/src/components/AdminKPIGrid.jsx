// src/components/AdminKPIGrid.jsx

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const KPICard = ({ label, value, sub, icon }) => (
  <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7
                  hover:border-stone-300 hover:shadow-lg transition-all duration-300">
    <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em]
                  uppercase text-stone-400 mb-4 sm:mb-5 leading-tight">
      {label}
    </p>
    <div className="flex items-end justify-between">
      <p style={{ fontFamily: "'DM Serif Display', serif" }}
        className="text-2xl sm:text-3xl md:text-4xl text-stone-900 leading-none wrap-break-word min-w-0">
        {value}
      </p>
      <div className="text-xl sm:text-2xl opacity-40 mb-0.5 shrink-0 ml-2">
        {typeof icon === 'string' ? <span>{icon}</span> : icon}
      </div>
    </div>
    {sub && <p className="text-xs text-stone-400 mt-2 sm:mt-3">{sub}</p>}
  </div>
);

export default function AdminKPIGrid({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      <KPICard
        label="Total Revenue"
        value={fmt(stats.totalRevenue)}
        icon="₹"
      />
      <KPICard
        label="Total Orders"
        value={(stats.totalOrders || 0).toLocaleString()}
        icon="◎"
      />
      <KPICard
        label="Customers"
        value={(stats.totalCustomers || 0).toLocaleString()}
        icon={
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
      />
      <KPICard
        label="Low on Stock"
        value={stats.lowStockCount || 0}
        sub="Below 5 units"
        icon="─"
      />
    </div>
  );
}

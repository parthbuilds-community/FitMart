const AdminKPIGrid = ({ kpis }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
        <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase text-stone-400 mb-4 sm:mb-5 leading-tight">
          Total Revenue
        </p>
        <div className="flex items-end justify-between">
          <p
            style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-2xl sm:text-3xl md:text-4xl text-stone-900 leading-none wrap-break-word min-w-0"
          >
            ₹{kpis.totalRevenue?.toLocaleString()}
          </p>
          <div className="text-xl sm:text-2xl opacity-40 mb-0.5 shrink-0 ml-2">
            ₹
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
        <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase text-stone-400 mb-4 sm:mb-5 leading-tight">
          Total Orders
        </p>
        <div className="flex items-end justify-between">
          <p
            style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-2xl sm:text-3xl md:text-4xl text-stone-900 leading-none"
          >
            {kpis.totalOrders?.toLocaleString()}
          </p>
          <div className="text-xl sm:text-2xl opacity-40 mb-0.5">◎</div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
        <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase text-stone-400 mb-4 sm:mb-5 leading-tight">
          Customers
        </p>
        <div className="flex items-end justify-between">
          <p
            style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-2xl sm:text-3xl md:text-4xl text-stone-900 leading-none"
          >
            {kpis.totalCustomers?.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 hover:border-stone-300 hover:shadow-lg transition-all duration-300">
        <p className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase text-stone-400 mb-4 sm:mb-5 leading-tight">
          Low on Stock
        </p>
        <div className="flex items-end justify-between">
          <p
            style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-2xl sm:text-3xl md:text-4xl text-stone-900 leading-none"
          >
            {kpis.lowStockCount}
          </p>
          <div className="text-xl sm:text-2xl opacity-40 mb-0.5">─</div>
        </div>
      </div>
    </div>
  );
};

export default AdminKPIGrid;
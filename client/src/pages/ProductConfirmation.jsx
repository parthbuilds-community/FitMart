// src/pages/ProductConfirmation.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../auth/firebase";
import { fmt } from "../utils/formatters";

export default function ProductConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { items = [], total = 0, paymentId = "", address = null } = location.state || {};

  useEffect(() => {
    document.title = "FitMart";
  }, []);

  const orderDate = useRef(
    new Date().toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    })
  );
  const orderTime = useRef(
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit",
    })
  );

  useEffect(() => {
    if (!items.length) navigate("/");
  }, [items, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const downloadInvoice = () => {
    setDownloading(true);

    const user = auth.currentUser;
    const userName = user?.displayName || user?.email || "Valued Customer";
    const userEmail = user?.email || "";

    const addr = address;
    const addrHtml = addr ? `
      <div class="billing-block">
        <h3>Shipping Address</h3>
        <p>${addr.label || ''}</p>
        <p>${addr.line1 || ''}${addr.line2 ? `, ${addr.line2}` : ''}</p>
        <p>${[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}</p>
        ${addr.country ? `<p>${addr.country}</p>` : ''}
        ${addr.phone ? `<p>${addr.phone}</p>` : ''}
      </div>
    ` : '';

    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>FitMart Invoice – ${paymentId || "ORDER"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1c1917;
      background: #fff;
      padding: 48px;
      font-size: 14px;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 32px;
      border-bottom: 2px solid #1c1917;
      margin-bottom: 40px;
    }
    .brand { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .invoice-label {
      font-size: 11px; letter-spacing: 0.18em;
      text-transform: uppercase; color: #78716c; margin-top: 6px;
    }
    .meta { text-align: right; }
    .meta p { font-size: 12px; color: #78716c; }
    .meta .pid {
      font-family: monospace; font-size: 11px; color: #44403c;
      margin-top: 4px; word-break: break-all;
    }
    .billing {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 32px; margin-bottom: 40px;
    }
    .billing-block h3 {
      font-size: 10px; letter-spacing: 0.18em;
      text-transform: uppercase; color: #78716c; margin-bottom: 8px;
    }
    .billing-block p { font-size: 13px; color: #1c1917; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead tr { background: #1c1917; color: #fff; }
    thead th {
      padding: 10px 14px; text-align: left; font-size: 10px;
      letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
    }
    thead th:last-child { text-align: right; }
    tbody tr { border-bottom: 1px solid #e7e5e3; }
    tbody tr:last-child { border-bottom: none; }
    tbody td { padding: 14px; font-size: 13px; vertical-align: middle; }
    tbody td:last-child { text-align: right; font-weight: 500; }
    .product-brand {
      font-size: 10px; letter-spacing: 0.1em;
      text-transform: uppercase; color: #78716c; margin-bottom: 2px;
    }
    .product-name { font-size: 14px; color: #1c1917; }
    .unit-price { font-size: 11px; color: #a8a29e; margin-top: 2px; }
    .totals {
      margin-left: auto; width: 280px;
      border-top: 2px solid #1c1917; padding-top: 20px;
    }
    .total-row {
      display: flex; justify-content: space-between;
      padding: 5px 0; font-size: 13px; color: #44403c;
    }
    .total-row.grand {
      font-size: 16px; font-weight: 700; color: #1c1917;
      padding-top: 12px; margin-top: 8px; border-top: 1px solid #e7e5e3;
    }
    .footer {
      margin-top: 60px; padding-top: 24px; border-top: 1px solid #e7e5e3;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer p { font-size: 11px; color: #a8a29e; }
    .thank-you { font-size: 13px; color: #1c1917; font-weight: 500; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">FitMart</div>
      <div class="invoice-label">Tax Invoice</div>
    </div>
    <div class="meta">
      <p>${orderDate.current} · ${orderTime.current}</p>
      ${paymentId ? `<div class="pid">Payment ID: ${paymentId}</div>` : ""}
    </div>
  </div>
  <div class="billing">
    <div class="billing-block">
      <h3>Billed To</h3>
      <p>${userName}</p>
      ${userEmail ? `<p>${userEmail}</p>` : ""}
    </div>
    ${addrHtml}
    <div class="billing-block">
      <h3>Sold By</h3>
      <p>FitMart India Pvt. Ltd.</p>
      <p>Mumbai, Maharashtra</p>
      <p>fitmart.in</p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(({ product, quantity }) => `
        <tr>
          <td>
            <div class="product-brand">${product.brand || ""}</div>
            <div class="product-name">${product.name}</div>
            <div class="unit-price">${fmt(product.price)} / unit</div>
          </td>
          <td style="text-align:center">${quantity}</td>
          <td>${fmt(product.price * quantity)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>${fmt(total)}</span></div>
    <div class="total-row"><span>Shipping</span><span>Free</span></div>
    <div class="total-row"><span>Tax (GST)</span><span>Included</span></div>
    <div class="total-row grand"><span>Total Paid</span><span>${fmt(total)}</span></div>
  </div>
  <div class="footer">
    <p>© 2026 FitMart · Mumbai · All rights reserved</p>
    <span class="thank-you">Thank you for your purchase ✓</span>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(invoiceHTML);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      setDownloading(false);
    }, 400);
  };

  if (!items.length) return null;

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        .fade-up {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 0.12s; }
        .delay-2 { transition-delay: 0.26s; }
        .delay-3 { transition-delay: 0.40s; }
        .delay-4 { transition-delay: 0.54s; }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 sm:px-5 py-10 sm:py-16">

        {/* ── Success header ── */}
        <div className={`fade-up ${visible ? "visible" : ""} text-center mb-10 sm:mb-12`}>
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20
                          bg-stone-900 rounded-full mb-5 sm:mb-6 shadow-lg">
            <span className="text-white text-2xl sm:text-3xl">✓</span>
          </div>
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">
            Order Confirmed
          </p>
          <h1
            style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-3xl sm:text-4xl md:text-5xl text-stone-900 mb-3 leading-tight"
          >
            Payment Successful
          </h1>
          <p className="text-sm text-stone-500 mb-1">
            Thank you for shopping with FitMart.
          </p>
          <p className="text-xs text-stone-400">
            {orderDate.current} · {orderTime.current}
          </p>
          {paymentId && (
            <p className="text-[11px] text-stone-400 mt-2 font-mono bg-stone-100
                          inline-block px-3 py-1 rounded-full break-all max-w-full">
              {paymentId}
            </p>
          )}
        </div>

        {/* ── Purchased items card ── */}
        <div className={`fade-up delay-1 ${visible ? "visible" : ""}
                         bg-white border border-stone-200 rounded-2xl overflow-hidden mb-4`}>
          <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-stone-100
                          flex justify-between items-center">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400">
              Items Purchased
            </p>
            <p className="text-xs text-stone-400">
              {items.length} item{items.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="divide-y divide-stone-100">
            {items.map(({ product, quantity }) => (
              <div
                key={product.productId}
                className="flex items-center gap-3 sm:gap-5 px-4 sm:px-7 py-4 sm:py-5"
              >
                {/* Product image */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-stone-100
                                flex-shrink-0 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-0.5">
                    {product.brand}
                  </p>
                  <p
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-base sm:text-lg text-stone-900 leading-tight truncate"
                  >
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-stone-400">Qty {quantity}</span>
                    <span className="text-stone-200 hidden sm:inline">·</span>
                    <span className="text-xs text-stone-400">
                      {fmt(product.price)} each
                    </span>
                  </div>
                </div>

                {/* Line total */}
                <p
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                  className="text-lg sm:text-xl text-stone-900 flex-shrink-0"
                >
                  {fmt(product.price * quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals footer */}
          <div className="bg-stone-50 border-t border-stone-200 px-4 sm:px-7 py-4 sm:py-5 space-y-2">
            <div className="flex justify-between text-sm text-stone-500">
              <span>Subtotal</span>
              <span>{fmt(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-500">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="h-px bg-stone-200 my-1" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-stone-700">Total Paid</span>
              <span
                style={{ fontFamily: "'DM Serif Display', serif" }}
                className="text-2xl sm:text-3xl text-stone-900"
              >
                {fmt(total)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Download Invoice button ── */}
        <div className={`fade-up delay-2 ${visible ? "visible" : ""} mb-4`}>
          <button
            onClick={downloadInvoice}
            disabled={downloading}
            className="w-full border border-stone-900 text-stone-900 text-sm px-8 py-4
                       rounded-full hover:bg-stone-900 hover:text-white transition-all
                       disabled:opacity-50 flex items-center justify-center gap-2
                       min-h-[52px] active:scale-[0.98]"
          >
            {downloading ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent
                                 rounded-full animate-spin" />
                Generating invoice…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Invoice (PDF)
              </>
            )}
          </button>
          <p className="text-[10px] text-stone-400 text-center mt-2">
            Opens print dialog → Save as PDF
          </p>
        </div>

        {/* ── Action buttons ── */}
        <div className={`fade-up delay-3 ${visible ? "visible" : ""} flex flex-col sm:flex-row gap-3`}>
          <button
            onClick={() => navigate("/home")}
            className="flex-1 bg-stone-900 text-white text-sm px-8 py-4
                       rounded-full hover:bg-stone-700 transition-colors text-center
                       min-h-[52px] active:scale-[0.98]"
          >
            Continue Shopping
          </button>
        </div>

        {/* ── Footer note ── */}
        <p className={`fade-up delay-4 ${visible ? "visible" : ""}
                       text-xs text-stone-400 text-center mt-6 sm:mt-8 leading-relaxed px-4`}>
          A confirmation will be sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
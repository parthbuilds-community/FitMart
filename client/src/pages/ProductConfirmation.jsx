// src/pages/ProductConfirmation.jsx
import { useEffect, useState } from "react";
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

const now = new Date();

const currentOrderDate = now.toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const currentOrderTime = now.toLocaleTimeString("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
});

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
      <div class="billing-card">
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
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FitMart Invoice – ${paymentId || "ORDER"}</title>

  <link
    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap"
    rel="stylesheet"
  />

  <style>
    :root {
      --stone-50: #fafaf9;
      --stone-100: #f5f5f4;
      --stone-200: #e7e5e4;
      --stone-300: #d6d3d1;
      --stone-500: #78716c;
      --stone-700: #44403c;
      --stone-900: #1c1917;
      --green-100: #dcfce7;
      --green-700: #15803d;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 12mm;
    }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--stone-100);
      color: var(--stone-900);
      padding: 40px;
      line-height: 1.6;
    }

    .invoice-wrapper {
      max-width: 960px;
      margin: auto;
      background: #fff;
      border-radius: 28px;
      padding: 42px;
      box-shadow: 0 10px 35px rgba(0,0,0,0.06);
      border: 1px solid var(--stone-200);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      padding-bottom: 32px;
      border-bottom: 1px solid var(--stone-200);
      margin-bottom: 36px;
    }

    .brand-section h1 {
      font-family: 'DM Serif Display', serif;
      font-size: 42px;
      font-weight: 400;
      color: var(--stone-900);
      line-height: 1;
      margin-bottom: 10px;
    }

    .invoice-label {
      display: inline-block;
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--stone-500);
      margin-bottom: 14px;
    }

    .tagline {
      color: var(--stone-500);
      font-size: 14px;
    }

    .meta {
      text-align: right;
    }

    .meta-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--stone-500);
      margin-bottom: 8px;
    }

    .meta p {
      font-size: 14px;
      color: var(--stone-700);
      margin-bottom: 6px;
    }

    .pid {
      font-size: 12px;
      color: var(--stone-700);
      word-break: break-word;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 7px 14px;
      border-radius: 999px;
      background: var(--green-100);
      color: var(--green-700);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 12px;
    }

    .billing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 36px;
    }

    .billing-card {
      background: var(--stone-50);
      border: 1px solid var(--stone-200);
      border-radius: 20px;
      padding: 22px;
    }

    .billing-card h3 {
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--stone-500);
      margin-bottom: 12px;
    }

    .billing-card p {
      font-size: 14px;
      color: var(--stone-900);
      margin-bottom: 4px;
    }

    .products-section {
      margin-bottom: 34px;
    }

    .section-title {
      font-family: 'DM Serif Display', serif;
      font-size: 28px;
      margin-bottom: 20px;
      color: var(--stone-900);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead th {
      background: var(--stone-900);
      color: white;
      padding: 14px 16px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 600;
    }

    thead th:first-child {
      border-top-left-radius: 14px;
    }

    thead th:last-child {
      border-top-right-radius: 14px;
      text-align: right;
    }

    tbody tr {
      border-bottom: 1px solid var(--stone-200);
    }

    tbody td {
      padding: 18px 16px;
      vertical-align: middle;
      font-size: 14px;
    }

    tbody td:last-child {
      text-align: right;
      font-weight: 700;
      color: var(--stone-900);
    }

    .product-cell {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .product-image {
      width: 68px;
      height: 68px;
      border-radius: 14px;
      object-fit: cover;
      border: 1px solid var(--stone-200);
      background: white;
    }

    .product-brand {
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--stone-500);
      margin-bottom: 4px;
    }

    .product-name {
      font-size: 15px;
      color: var(--stone-900);
      font-weight: 600;
      margin-bottom: 4px;
    }

    .unit-price {
      font-size: 12px;
      color: var(--stone-500);
    }

    .qty {
      text-align: center;
      font-weight: 600;
      color: var(--stone-700);
    }

    .summary-section {
      display: flex;
      justify-content: flex-end;
    }

    .totals-card {
      width: 340px;
      background: var(--stone-50);
      border: 1px solid var(--stone-200);
      border-radius: 22px;
      padding: 26px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
      color: var(--stone-700);
    }

    .total-row.grand {
      margin-top: 12px;
      padding-top: 18px;
      border-top: 1px solid var(--stone-300);
      font-size: 22px;
      font-family: 'DM Serif Display', serif;
      color: var(--stone-900);
    }

    .footer {
      margin-top: 42px;
      padding-top: 24px;
      border-top: 1px solid var(--stone-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .footer-left p {
      font-size: 12px;
      color: var(--stone-500);
      margin-bottom: 4px;
    }

    .thank-you {
      font-size: 15px;
      font-weight: 600;
      color: var(--stone-900);
      margin-bottom: 8px;
    }

    .qr-code {
      width: 78px;
      height: 78px;
      border-radius: 12px;
      border: 1px solid var(--stone-200);
      padding: 4px;
      background: white;
    }

    @media (max-width: 768px) {
      body {
        padding: 20px;
      }

      .invoice-wrapper {
        padding: 24px;
      }

      .header {
        flex-direction: column;
      }

      .meta {
        text-align: left;
      }

      .summary-section {
        justify-content: stretch;
      }

      .totals-card {
        width: 100%;
      }

      .footer {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .invoice-wrapper {
        box-shadow: none;
        border: none;
        padding: 0;
        max-width: 100%;
      }

      .billing-card,
      .totals-card {
        break-inside: avoid;
      }
    }
  </style>
</head>

<body>
  <div class="invoice-wrapper">

    <div class="header">
      <div class="brand-section">
        <div class="invoice-label">FitMart Official Invoice</div>
        <h1>FitMart</h1>
        <p class="tagline">
          Premium fitness marketplace for modern athletes.
        </p>
      </div>

      <div class="meta">
        <div class="meta-title">Invoice Details</div>
        <p>${currentOrderDate} · ${currentOrderTime}</p>

        ${
          paymentId
            ? `<div class="pid">Payment ID: ${paymentId}</div>`
            : ""
        }

        <div class="status-badge">Paid Successfully</div>
      </div>
    </div>

    <div class="billing-grid">

      <div class="billing-card">
        <h3>Billed To</h3>
        <p>${userName}</p>
        ${userEmail ? `<p>${userEmail}</p>` : ""}
      </div>

      ${addrHtml}

      <div class="billing-card">
        <h3>Sold By</h3>
        <p>FitMart India Pvt. Ltd.</p>
        <p>Mumbai, Maharashtra</p>
        <p>support@fitmart.in</p>
      </div>

    </div>

    <div class="products-section">
      <h2 class="section-title">Order Summary</h2>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Amount</th>
          </tr>
        </thead>

        <tbody>
          ${items.map(({ product, quantity }) => `
            <tr>
              <td>
                <div class="product-cell">

                  <img
                    src="${product.image}"
                    alt="${product.name}"
                    class="product-image"
                  />

                  <div>
                    <div class="product-brand">
                      ${product.brand || "FitMart"}
                    </div>

                    <div class="product-name">
                      ${product.name}
                    </div>

                    <div class="unit-price">
                      ${fmt(product.price)} / unit
                    </div>
                  </div>

                </div>
              </td>

              <td class="qty">
                ${quantity}
              </td>

              <td>
                ${fmt(product.price * quantity)}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <div class="summary-section">
      <div class="totals-card">

        <div class="total-row">
          <span>Subtotal</span>
          <span>${fmt(total)}</span>
        </div>

        <div class="total-row">
          <span>Shipping</span>
          <span>Free</span>
        </div>

        <div class="total-row">
          <span>Tax (GST)</span>
          <span>Included</span>
        </div>

        <div class="total-row grand">
          <span>Total Paid</span>
          <span>${fmt(total)}</span>
        </div>

      </div>
    </div>

    <div class="footer">

      <div class="footer-left">
        <div class="thank-you">
          Thank you for shopping with FitMart ✓
        </div>

        <p>
          © 2026 FitMart India Pvt. Ltd. All rights reserved.
        </p>

        <p>
          Designed for seamless digital invoicing and print-ready export.
        </p>
      </div>

      ${
        paymentId
          ? `
            <img
              class="qr-code"
              src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${paymentId}"
              alt="Payment QR"
            />
          `
          : ""
      }

    </div>

  </div>
</body>
</html>
`;

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
            {currentOrderDate} · {currentOrderTime}
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
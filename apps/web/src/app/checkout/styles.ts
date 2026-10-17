// Page-scoped styles copied verbatim from the legacy checkout.html <style> block.
export const checkoutCss = `
  .checkout-wrap{ max-width: 760px; margin: 0 auto; padding: 48px 24px 80px; }
  .checkout-card{ background:#fff; border:1px solid var(--line); border-radius: var(--radius); padding: 28px; box-shadow: var(--shadow-card); margin-bottom:24px; }
  .checkout-card h2{ font-size:1.25rem; }
  .form-row{ margin-bottom:16px; }
  .form-row label{ display:block; font-family: var(--mono); font-size:.78rem; text-transform:uppercase; letter-spacing:.05em; color: var(--ink-soft); margin-bottom:6px; }
  .form-row input, .form-row textarea, .form-row select{
    width:100%; padding:11px 12px; border:1px solid var(--line); border-radius: var(--radius-sm); font-family: var(--body); font-size:.95rem;
  }
  .form-grid{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media (max-width:600px){ .form-grid{ grid-template-columns:1fr; } }
  .delivery-options{ display:flex; gap:12px; }
  .delivery-options label{
    flex:1; border:1px solid var(--line); border-radius: var(--radius-sm); padding:12px; display:flex; gap:8px; align-items:center; cursor:pointer; font-family:var(--body); text-transform:none; letter-spacing:0; color: var(--ink);
  }
  .delivery-options input{ width:auto; }
  .delivery-options small{ color: var(--ink-soft); font-size:.74rem; margin-left:4px; }
  .ship-note{ background: var(--bg); border-left:3px solid var(--accent); padding:10px 12px; font-size:.86rem; color: var(--ink-soft); margin:0 0 16px; border-radius:0 8px 8px 0; }
  .ship-note b{ color: var(--ink); }
  .delivery-options{ flex-wrap:wrap; }
  .summary-line{ display:flex; justify-content:space-between; padding:8px 0; font-size:.92rem; }
  .summary-line.total{ font-family: var(--mono); font-weight:700; font-size:1.15rem; border-top:1px dashed var(--line); margin-top:8px; padding-top:14px; }
  .copy-btn{ margin-left:6px; border:1px solid var(--line); background:#fff; border-radius:999px; padding:2px 10px; font-size:.74rem; font-weight:600; cursor:pointer; }
  .bank-box{ background: var(--paper); border:1px dashed var(--line); border-radius: var(--radius-sm); padding:16px; font-family: var(--mono); font-size:.88rem; line-height:1.7; }
  #order-confirm{ display:none; text-align:center; }
  #order-confirm .code{ font-family: var(--mono); font-size:1.6rem; font-weight:700; color: var(--coral); }
`;

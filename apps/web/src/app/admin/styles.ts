// Page-scoped styles copied verbatim from the legacy admin.html <style> block.
export const adminCss = `
  body{ background: var(--bg); }
  .admin-wrap{ max-width: 1180px; margin: 0 auto; padding: 40px 24px 80px; }
  .login-card{ max-width: 360px; margin: 80px auto; background:#fff; border:1px solid var(--line); border-radius: var(--radius); padding:28px; box-shadow: var(--shadow-card); }
  .login-card input{ width:100%; padding:11px 12px; border:1px solid var(--line-strong); border-radius: var(--radius-sm); margin-bottom:12px; font-family: var(--body); }
  .admin-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
  table{ width:100%; border-collapse: collapse; background:#fff; border:1px solid var(--line); border-radius: var(--radius); overflow:hidden; }
  th, td{ text-align:left; padding: 12px 14px; border-bottom:1px solid var(--line); font-size:.88rem; vertical-align:top; }
  th{ font-family: var(--mono); font-size:.72rem; text-transform:uppercase; letter-spacing:.04em; color: var(--ink-soft); background: var(--bg); }
  tr:last-child td{ border-bottom:none; }
  .pay-select{ font-family: var(--mono); font-size:.78rem; padding:6px 8px; border-radius:8px; border:1px solid var(--line-strong); background:#fff; }
  .status-select{ font-family: var(--mono); font-size:.78rem; padding:6px 8px; border-radius:8px; border:1px solid var(--line-strong); }
  .thumbs{ display:flex; gap:6px; flex-wrap:wrap; }
  .thumbs img{ width:44px; height:44px; object-fit:cover; border-radius:6px; border:1px solid var(--line); }
  .order-code{ font-family: var(--mono); font-weight:700; }
  .thumbs-big{ display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:12px; }
  .gcell{ background:#fff; border:1px solid var(--line); border-radius:10px; padding:8px; font-size:.75rem; text-align:center; }
  .gcell img{ width:100%; height:100px; object-fit:contain; background:#eee; border-radius:6px; }
  .pub-btn{ font-size:.7rem; border:1px solid var(--accent); color:var(--accent); background:#fff; border-radius:999px; padding:2px 8px; cursor:pointer; margin-top:3px; }
  .thumb-wrap{ display:inline-flex; flex-direction:column; align-items:center; }
  .toolbar{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
  .toolbar input, .toolbar select{ padding:9px 12px; border:1px solid var(--line-strong); border-radius:var(--radius-sm); font-family:var(--body); background:#fff; }
  .toolbar input{ flex:1; min-width:180px; }
  .ocard{ background:#fff; border:1px solid var(--line); border-radius:var(--radius); margin-bottom:18px; overflow:hidden; }
  .ohead{ display:flex; gap:14px; align-items:center; flex-wrap:wrap; padding:14px 18px; background:var(--bg); border-bottom:1px solid var(--line); }
  .ohead .num{ font-family:var(--mono); font-weight:700; font-size:1.25rem; }
  .ohead .grow{ flex:1; min-width:120px; color:var(--ink-soft); font-size:.8rem; }
  .obody{ display:grid; grid-template-columns: 240px 1fr; gap:0; }
  @media (max-width:760px){ .obody{ grid-template-columns:1fr; } }
  .ocust{ padding:16px 18px; font-size:.85rem; border-right:1px solid var(--line); line-height:1.5; }
  .oitems{ padding:14px 18px; }
  .ogroup{ font-family:var(--mono); font-size:.7rem; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-soft); margin:10px 0 8px; }
  .ogroup:first-child{ margin-top:0; }
  .tiles{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px; }
  .dtile{ border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#fff; font-size:.76rem; display:flex; flex-direction:column; }
  .dtile .pv{ height:150px; display:flex; align-items:center; justify-content:center; cursor:zoom-in; padding:8px;
    background: repeating-conic-gradient(#ecebe5 0% 25%, #f7f6f1 0% 50%) 50% / 16px 16px; }
  .dtile .pv img{ max-width:100%; max-height:100%; object-fit:contain; }
  .dtile .inf{ padding:7px 9px 4px; line-height:1.35; }
  .dtile .links{ display:flex; gap:6px; flex-wrap:wrap; padding:0 9px 9px; margin-top:auto; }
  .dtile .links a, .dtile .links button{ font-size:.68rem; border:1px solid var(--line-strong); background:#fff; border-radius:999px; padding:3px 8px; color:var(--ink); text-decoration:none; cursor:pointer; }
  .dtile .links a:hover{ border-color:var(--ink); }
  .q{ display:inline-block; font-family:var(--mono); font-size:.66rem; padding:1px 7px; border-radius:999px; }
  .q.excelente,.q.buena,.q.vectorial{ background:#DDF3E4; color:#1E7B3A; } .q.media{ background:#FFF1CC; color:#8A6300; } .q.baja{ background:#FFE0DC; color:#B3261E; }
  .lb{ position:fixed; inset:0; z-index:2000; background:rgba(15,15,15,.88); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:16px; }
  .lb .stage{ max-width:94vw; max-height:78vh; display:flex; padding:10px; border-radius:8px; }
  .lb .stage img{ max-width:100%; max-height:76vh; object-fit:contain; image-rendering:auto; }
  .lb .bar{ display:flex; gap:8px; flex-wrap:wrap; justify-content:center; color:#fff; font-size:.8rem; align-items:center; }
  .lb .bar button, .lb .bar a{ background:#fff; color:#111; border:none; border-radius:999px; padding:7px 14px; font-weight:600; font-size:.8rem; text-decoration:none; cursor:pointer; }
  .empty{ text-align:center; padding:60px 0; color: var(--ink-soft); }

  .atabs{ display:flex; gap:6px; flex-wrap:wrap; margin:0 0 22px; border-bottom:1px solid var(--line); padding-bottom:0; }
  .atabs button{ border:0; background:none; padding:11px 18px; font:inherit; font-weight:600; cursor:pointer; color:var(--ink-soft); border-bottom:3px solid transparent; margin-bottom:-1px; }
  .atabs button.on{ color:var(--ink); border-bottom-color:var(--accent); }
  .atabs .badge{ background:var(--accent); color:#fff; border-radius:999px; font-size:.68rem; padding:1px 7px; margin-left:6px; font-family:var(--mono); }
  .kpis{ display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:12px; margin-bottom:22px; }
  .kpi{ background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:14px 16px; }
  .kpi small{ display:block; font-family:var(--mono); font-size:.68rem; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-soft); }
  .kpi b{ display:block; font-size:1.5rem; margin-top:4px; font-family:var(--mono); }
  .kpi.pos b{ color:#1E7B3A; } .kpi.neg b{ color:#B3261E; }
  .panel{ background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:18px; margin-bottom:22px; }
  .panel h2{ font-size:1.05rem; margin:0 0 12px; }
  .chart{ display:flex; align-items:flex-end; gap:8px; height:190px; padding:10px 4px 0; overflow-x:auto; }
  .chart .col{ flex:1; min-width:46px; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; }
  .chart .bars{ display:flex; gap:3px; align-items:flex-end; height:150px; width:100%; justify-content:center; }
  .chart .bar{ width:42%; max-width:22px; border-radius:4px 4px 0 0; min-height:1px; } .chart .bar.b1{ background:var(--accent); } .chart .bar.b2{ background:#9A9A94; }
  .chart .lab{ font-size:.68rem; color:var(--ink-soft); margin-top:6px; font-family:var(--mono); }
  .legend{ font-size:.76rem; color:var(--ink-soft); margin-top:8px; } .legend i{ display:inline-block; width:10px; height:10px; border-radius:3px; margin:0 5px 0 12px; vertical-align:middle; }
  .num{ text-align:right; font-family:var(--mono); white-space:nowrap; }
  .frm{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px; }
  .frm input, .frm select, .frm textarea, .panel textarea, .panel input.t{ padding:9px 11px; border:1px solid var(--line-strong); border-radius:8px; font:inherit; background:#fff; }
  .panel textarea{ width:100%; min-height:110px; }
  .muted{ color:var(--ink-soft); font-size:.84rem; }
  .pill{ display:inline-block; font-family:var(--mono); font-size:.68rem; padding:2px 8px; border-radius:999px; background:#EEE; } .pill.yes{ background:#DDF3E4; color:#1E7B3A; }
  .tbl-wrap{ overflow-x:auto; }
  .gcell .by{ color:var(--ink-soft); font-size:.7rem; }
[hidden]{ display:none !important; }
.armada { display:flex; gap:14px; flex-wrap:wrap; margin:8px 0 12px; } .armada figure { margin:0; background:#fff; border:1px solid var(--line); border-radius:10px; padding:8px; max-width:340px; } .armada img { display:block; max-width:100%; border-radius:6px; background:repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0/14px 14px; } .armada figcaption { font-size:.78rem; margin-top:6px; line-height:1.4; }
.ostats{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; } .ostat{ border:1px solid var(--line-strong); background:#fff; border-radius:12px; padding:8px 14px; cursor:pointer; text-align:left; font-family:var(--body); min-width:120px; } .ostat b{ display:block; font-size:1.2rem; font-family:var(--mono); } .ostat span{ font-size:.74rem; color:var(--ink-soft); } .ostat.on{ border-color:var(--accent,#FF4D00); box-shadow:0 0 0 2px rgba(255,77,0,.18); } .ostat.warn b{ color:#C0392B; }
.dlab{ font-size:.78rem; color:var(--ink-soft); display:flex; align-items:center; gap:6px; } .dlab input{ flex:none; min-width:0; }
.ocard.nuevo{ border-color:#FF4D00; } .onote{ width:100%; margin-top:10px; padding:8px; border:1px solid var(--line-strong); border-radius:8px; font-family:var(--body); font-size:.82rem; resize:vertical; min-height:44px; } .ohist{ font-size:.72rem; color:var(--ink-soft); margin-top:8px; line-height:1.5; }
.oprod{ background:#FFF4EC; border:1px solid #FFD2B8; border-radius:8px; padding:8px 12px; font-size:.86rem; margin-bottom:10px; }
.olinks{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; } .olinks a{ font-size:.78rem; }
`;

import { useState, useMemo, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const SAMPLE = [
  { id:1, company:"스타벅스코리아", contractDate:"2026-01-15", content:"SNS 인스타그램 피드 광고 2회", amount:1500000, deadline:"2026-06-28", taxInvoice:true,  paid:true,  sponsored:false },
  { id:2, company:"나이키코리아",   contractDate:"2026-02-01", content:"유튜브 쇼츠 광고 1회",         amount:800000,  deadline:"2026-07-15", taxInvoice:true,  paid:false, sponsored:false },
  { id:3, company:"올리브영",       contractDate:"2026-03-01", content:"블로그 체험단 후기 작성",       amount:0,       deadline:"2026-09-01", taxInvoice:false, paid:false, sponsored:true  },
  { id:4, company:"무신사",         contractDate:"2026-03-10", content:"릴스 광고 3회",               amount:1200000, deadline:"2026-08-20", taxInvoice:true,  paid:true,  sponsored:false },
  { id:5, company:"카카오스타일",   contractDate:"2026-04-01", content:"틱톡 광고 2회",               amount:600000,  deadline:"2026-09-01", taxInvoice:false, paid:false, sponsored:false },
  { id:6, company:"배달의민족",     contractDate:"2026-04-10", content:"인스타 스토리 광고",           amount:450000,  deadline:"2026-05-30", taxInvoice:true,  paid:false, sponsored:false },
];
const EMPTY = { company:"", contractDate:"", content:"", amount:"", deadline:"", taxInvoice:false, paid:false, sponsored:false };
const fmt = n => Number(n).toLocaleString("ko-KR")+"원";
const fmtS = n => { if(n>=1000000) return (n/1000000).toFixed(1)+"M"; if(n>=10000) return Math.round(n/10000)+"만"; return String(n); };
const now = new Date();
const YY = now.getFullYear(), MM = now.getMonth()+1;
const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

const Ico = ({ d, size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const P = {
  home:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  file:     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  cog:      "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  plus:     "M12 5v14 M5 12h14",
  search:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  x:        "M18 6L6 18 M6 6l12 12",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:    "M3 6h18 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6 M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2",
  user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
};

const Bdg = ({ on, labels }) => (
  <span style={{ display:"inline-block", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:on?"#e8f5e9":"#fce8e8", color:on?"#2e7d32":"#c62828" }}>
    {on?labels[0]:labels[1]}
  </span>
);

export default function App() {
  const [loaded,  setLoaded]  = useState(false);
  const [tab,     setTab]     = useState("dashboard");
  const [data,    setData]    = useState(SAMPLE);
  const [flw,     setFlw]     = useState("");
  const [vi,      setVi]      = useState({});
  const [editFlw, setEditFlw] = useState(false);
  const [flwIn,   setFlwIn]   = useState("");
  const [editVM,  setEditVM]  = useState(null);
  const [viIn,    setViIn]    = useState("");
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [search,  setSearch]  = useState("");
  const [fPaid,   setFPaid]   = useState("all");
  const [fType,   setFType]   = useState("all"); // 사이드바 필터
  const [sort,    setSort]    = useState("contractDateDesc");
  const [delConf, setDelConf] = useState(null);
  const [detail,  setDetail]  = useState(null);

  useEffect(() => {
    let done = false;
    const timer = setTimeout(() => { if (!done) setLoaded(true); }, 3000);
    const load = async () => {
      try {
        const [d,f,v] = await Promise.allSettled([
          window.storage.get("ad-collab"),
          window.storage.get("ov-flw"),
          window.storage.get("ov-vi"),
        ]);
        if (d.status==="fulfilled" && d.value?.value) setData(JSON.parse(d.value.value));
        if (f.status==="fulfilled" && f.value?.value) setFlw(f.value.value);
        if (v.status==="fulfilled" && v.value?.value) setVi(JSON.parse(v.value.value));
      } catch {}
      done = true;
      clearTimeout(timer);
      setLoaded(true);
    };
    load();
    return () => clearTimeout(timer);
  }, []);

  const saveToStorage = async (key, value) => {
    try { await window.storage.set(key, value); } catch {}
  };

  useEffect(() => { if (loaded) saveToStorage("ad-collab", JSON.stringify(data)); }, [data, loaded]);
  useEffect(() => { if (loaded) saveToStorage("ov-flw", flw); }, [flw, loaded]);
  useEffect(() => { if (loaded) saveToStorage("ov-vi", JSON.stringify(vi)); }, [vi, loaded]);

  const openAdd  = () => { setForm(EMPTY); setModal({mode:"add"}); };
  const openEdit = (item, e) => { e&&e.stopPropagation(); setForm({...item, amount:String(item.amount)}); setModal({mode:"edit",item}); };
  const save = () => {
    if (!form.company||!form.contractDate||!form.deadline||(!form.sponsored&&!form.amount)) return alert("필수 항목을 입력해주세요.");
    const entry = {...form, amount:form.sponsored?0:Number(String(form.amount).replace(/,/g,"")), id:modal.mode==="edit"?modal.item.id:Date.now()};
    setData(prev => modal.mode==="edit" ? prev.map(d=>d.id===entry.id?entry:d) : [...prev,entry]);
    if (detail?.id===entry.id) setDetail(entry);
    setModal(null);
  };
  const del = id => { setData(prev=>prev.filter(d=>d.id!==id)); setDelConf(null); if(detail?.id===id) setDetail(null); };
  const toggle = (id, key, e) => { e&&e.stopPropagation(); setData(prev=>prev.map(d=>{ if(d.id!==id)return d; const u={...d,[key]:!d[key]}; if(detail?.id===id)setDetail(u); return u; })); };
  const saveVi = mk => { setVi(p=>({...p,[mk]:Number(viIn)||0})); setEditVM(null); setViIn(""); };

  const annualIncome  = useMemo(()=>data.filter(r=>r.contractDate.startsWith(String(YY))&&!r.sponsored).reduce((s,r)=>s+r.amount,0),[data]);
  const monthlyIncome = useMemo(()=>data.filter(r=>{const[y,m]=r.contractDate.split("-").map(Number);return y===YY&&m===MM&&!r.sponsored;}).reduce((s,r)=>s+r.amount,0),[data]);
  const chartData = useMemo(()=>MONTHS.map((label,i)=>{
    const m=i+1, mk=`${YY}-${String(m).padStart(2,"0")}`;
    const ad=data.filter(r=>{const[y,mo]=r.contractDate.split("-").map(Number);return y===YY&&mo===m&&!r.sponsored;}).reduce((s,r)=>s+r.amount,0);
    const va=vi[mk]||0;
    return {label, ad, va, total:ad+va, mk};
  }),[data,vi]);
  const active   = useMemo(()=>data.filter(r=>new Date(r.deadline)>=now).sort((a,b)=>a.deadline>b.deadline?1:-1),[data]);
  const filtered = useMemo(()=>{
    let d = data.filter(r => r.company.includes(search) || r.content.includes(search));
    // 사이드바 필터 우선 적용
    if (fType === "unpaid")      d = d.filter(r => !r.sponsored && !r.paid);
    else if (fType === "tax")    d = d.filter(r => !r.sponsored && !r.taxInvoice);
    else if (fType === "done")   d = d.filter(r => !r.sponsored && r.paid && r.taxInvoice);
    else if (fType === "active") d = d.filter(r => !(r.paid && r.taxInvoice));
    else {
      // 드롭다운 필터
      if (fPaid === "paid")   d = d.filter(r => r.paid);
      if (fPaid === "unpaid") d = d.filter(r => !r.paid);
    }
    return [...d].sort((a,b)=>{ if(sort==="contractDateDesc")return a.contractDate<b.contractDate?1:-1; if(sort==="amount")return b.amount-a.amount; return a[sort]>b[sort]?1:-1; });
  },[data, search, fPaid, fType, sort]);

  const daysLeft = dl => Math.ceil((new Date(dl)-now)/86400000);
  const unpaidN  = data.filter(r=>!r.paid&&!r.sponsored).length;
  const taxN     = data.filter(r=>!r.taxInvoice&&!r.sponsored).length;

  const card = { background:"#fff", borderRadius:14, border:"1px solid #ebebeb", padding:"20px 22px" };
  const btn  = { cursor:"pointer", border:"none", borderRadius:10, fontSize:13, fontWeight:600, padding:"9px 18px" };
  const iBtn = (active) => ({ width:40, height:40, borderRadius:10, background:active?"#3a3a3c":"transparent", color:active?"#fff":"#888", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"none" });

  const NavItem = ({ label, active, onClick, badge }) => (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 18px", borderRadius:10, margin:"1px 8px", cursor:"pointer", background:active?"#fff":"transparent", boxShadow:active?"0 1px 4px rgba(0,0,0,.07)":"none", fontWeight:active?600:400, color:active?"#1c1c1e":"#555", fontSize:13 }}>
      <span>{label}</span>
      {badge!=null && <span style={{ background:active?"#1c1c1e":"#e0e0e0", color:active?"#fff":"#666", fontSize:11, fontWeight:700, padding:"1px 7px", borderRadius:20 }}>{badge}</span>}
    </div>
  );

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Pretendard','Apple SD Gothic Neo',sans-serif", overflow:"hidden" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px;}
        input,select,textarea{width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;background:#fff;font-family:inherit;}
        input:focus,select:focus,textarea:focus{border-color:#1c1c1e;}
        .ov{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:200;padding:16px;backdrop-filter:blur(2px);}
        .mb{background:#fff;border-radius:18px;padding:28px;width:100%;max-width:460px;max-height:90vh;overflow-y:auto;}
        .tr:hover td{background:#f9f9f7;} .tr-s td{background:#f4f4f0;} .tr{cursor:pointer;}
        td,th{padding:12px 16px;text-align:left;}
        th{font-size:11px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:.05em;border-bottom:1.5px solid #f0f0ec;padding-bottom:10px;}
        td{font-size:13px;color:#1c1c1e;border-bottom:1px solid #f7f7f5;}
        lbl{font-size:13px;font-weight:600;color:#333;margin-bottom:5px;display:block;}
      `}</style>

      {/* 아이콘 사이드바 */}
      <div style={{ width:60, background:"#1c1c1e", display:"flex", flexDirection:"column", alignItems:"center", paddingTop:16, paddingBottom:16, gap:8, flexShrink:0 }}>
        <div style={{ width:32, height:32, background:"#fff", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
          <span style={{ fontSize:14, fontWeight:900, color:"#1c1c1e" }}>O</span>
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:4 }}>
          {[["dashboard", P.home], ["contracts", P.file]].map(([k, ic]) => (
            <button key={k} style={iBtn(tab===k)} onClick={()=>setTab(k)}>
              <Ico d={ic} size={18}/>
            </button>
          ))}
        </div>
        <button style={iBtn(false)}><Ico d={P.cog} size={18}/></button>
      </div>

      {/* 보조 패널 */}
      <div style={{ width:220, background:"#f7f7f5", borderRight:"1px solid #e8e8e6", display:"flex", flexDirection:"column", flexShrink:0, overflowY:"auto" }}>
        <div style={{ padding:"18px 18px 12px", borderBottom:"1px solid #ebebeb" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"#1c1c1e", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Ico d={P.user} size={16}/>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#1c1c1e" }}>Origin Vault</div>
              <div style={{ fontSize:11, color:"#aaa" }}>광고 협업 관리</div>
            </div>
          </div>
        </div>

        {[
          { title:"메뉴", items:[
            { label:"대시보드",  active:tab==="dashboard", onClick:()=>setTab("dashboard") },
            { label:"계약 관리", active:tab==="contracts", onClick:()=>setTab("contracts") },
          ]},
          { title:"현황", items:[
            { label:"전체 계약",          active:fType==="all",    onClick:()=>{setTab("contracts");setFType("all");setFPaid("all");},    badge:data.length },
            { label:"미지급",             active:fType==="unpaid", onClick:()=>{setTab("contracts");setFType("unpaid");},                 badge:unpaidN },
            { label:"세금계산서 미발행",  active:fType==="tax",    onClick:()=>{setTab("contracts");setFType("tax");},                   badge:taxN },
          ]},
          { title:"필터", items:[
            { label:"지급 완료",   active:fType==="done",   onClick:()=>{setTab("contracts");setFType("done");} },
            { label:"진행 중 계약", active:fType==="active", onClick:()=>{setTab("contracts");setFType("active");}, badge:active.length },
          ]},
        ].map(sec => (
          <div key={sec.title} style={{ marginBottom:4 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#aaa", padding:"18px 18px 6px", letterSpacing:".06em", textTransform:"uppercase" }}>{sec.title}</div>
            {sec.items.map((it,i) => <NavItem key={i} {...it}/>)}
          </div>
        ))}

        <div style={{ padding:12, marginTop:"auto", borderTop:"1px solid #ebebeb" }}>
          <button style={{ ...btn, background:"#1c1c1e", color:"#fff", width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }} onClick={()=>{setTab("contracts");openAdd();}}>
            <Ico d={P.plus} size={14}/> 새 협업 추가
          </button>
        </div>
      </div>

      {/* 메인 */}
      <div style={{ flex:1, overflowY:"auto", background:"#f0f0ec", padding:"28px" }}>

        {!loaded && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"#aaa", fontSize:13 }}>불러오는 중...</div>
        )}

        {loaded && tab==="dashboard" && (<>
          <div style={{ marginBottom:24 }}>
            <h1 style={{ fontSize:26, fontWeight:800, color:"#1c1c1e", letterSpacing:"-.5px" }}>대시보드</h1>
            <p style={{ fontSize:13, color:"#aaa", marginTop:4 }}>Origin Vault</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:16 }}>
            {/* 팔로워 */}
            <div style={card}>
              <div style={{ fontSize:11, fontWeight:700, color:"#aaa", marginBottom:10, textTransform:"uppercase", letterSpacing:".05em" }}>팔로워 수</div>
              {editFlw ? (
                <div style={{ display:"flex", gap:8 }}>
                  <input autoFocus type="text" placeholder="예: 1.6만, 10만" value={flwIn} onChange={e=>setFlwIn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){setFlw(flwIn);setEditFlw(false);}}}/>
                  <button style={{ ...btn, background:"#1c1c1e", color:"#fff", padding:"8px 14px", whiteSpace:"nowrap" }} onClick={()=>{setFlw(flwIn);setEditFlw(false);}}>저장</button>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
                  <div>
                    <span style={{ fontSize:32, fontWeight:800, color:"#1c1c1e", letterSpacing:"-1px" }}>{flw||"—"}</span>
                    {flw && <span style={{ fontSize:13, color:"#aaa", marginLeft:4 }}>명</span>}
                  </div>
                  <button style={{ ...btn, background:"#f0f0ec", color:"#555", padding:"6px 12px", fontSize:12 }} onClick={()=>{setFlwIn(flw);setEditFlw(true);}}>{flw?"수정":"입력"}</button>
                </div>
              )}
              <div style={{ fontSize:11, color:"#ccc", marginTop:8 }}>소셜 미디어 총 팔로워</div>
            </div>
            {/* 연간 */}
            <div style={{ ...card, borderLeft:"3px solid #1c1c1e" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#aaa", marginBottom:10, textTransform:"uppercase", letterSpacing:".05em" }}>{YY}년 연간 수입</div>
              <div style={{ fontSize:28, fontWeight:800, color:"#1c1c1e", letterSpacing:"-1px" }}>{fmt(annualIncome)}</div>
              <div style={{ display:"flex", gap:12, marginTop:10 }}>
                <span style={{ fontSize:11, color:"#aaa" }}>계약 {data.filter(r=>r.contractDate.startsWith(String(YY))).length}건</span>
                <span style={{ fontSize:11, color:"#2e7d32" }}>지급완료 {fmt(data.filter(r=>r.contractDate.startsWith(String(YY))&&r.paid&&!r.sponsored).reduce((s,r)=>s+r.amount,0))}</span>
              </div>
            </div>
            {/* 월간 */}
            <div style={{ ...card, borderLeft:"3px solid #888" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#aaa", marginBottom:10, textTransform:"uppercase", letterSpacing:".05em" }}>{MM}월 월간 수입</div>
              <div style={{ fontSize:28, fontWeight:800, color:"#1c1c1e", letterSpacing:"-1px" }}>{fmt(monthlyIncome)}</div>
              <div style={{ display:"flex", gap:12, marginTop:10 }}>
                <span style={{ fontSize:11, color:"#aaa" }}>계약 {data.filter(r=>{const[y,m]=r.contractDate.split("-").map(Number);return y===YY&&m===MM;}).length}건</span>
                <span style={{ fontSize:11, color:"#2e7d32" }}>지급완료 {fmt(data.filter(r=>{const[y,m]=r.contractDate.split("-").map(Number);return y===YY&&m===MM&&r.paid&&!r.sponsored;}).reduce((s,r)=>s+r.amount,0))}</span>
              </div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1.1fr 0.9fr", gap:14, alignItems:"start" }}>
            {/* 그래프 */}
            <div style={card}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:"#1c1c1e" }}>월별 수입 그래프</div>
                  <div style={{ fontSize:12, color:"#aaa", marginTop:3 }}>막대 클릭 → 조회수 수입 입력</div>
                </div>
                <div style={{ fontSize:12, color:"#aaa", background:"#f7f7f5", padding:"5px 12px", borderRadius:8 }}>
                  연간 <strong style={{ color:"#1c1c1e" }}>{fmt(chartData.reduce((s,d)=>s+d.total,0))}</strong>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <ComposedChart data={chartData} margin={{ top:4,right:4,left:0,bottom:0 }}
                  onClick={e=>{ if(e?.activePayload?.length){ const d=e.activePayload[0]?.payload; if(d){setEditVM(d.mk);setViIn(String(d.va||""));} } }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ec" vertical={false}/>
                  <XAxis dataKey="label" tick={{ fontSize:11,fill:"#bbb" }} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={fmtS} tick={{ fontSize:10,fill:"#bbb" }} axisLine={false} tickLine={false} width={42}/>
                  <Tooltip content={({active,payload})=>{
                    if(!active||!payload?.length)return null;
                    const d=payload[0]?.payload;
                    return <div style={{ background:"#fff",border:"1px solid #ebebeb",borderRadius:12,padding:"12px 16px",fontSize:12,boxShadow:"0 4px 16px rgba(0,0,0,.08)" }}>
                      <div style={{ fontWeight:700,color:"#1c1c1e",marginBottom:8 }}>{d?.label}</div>
                      <div style={{ color:"#555",marginBottom:4 }}>광고 수입: {fmt(d?.ad||0)}</div>
                      <div style={{ color:"#888",marginBottom:4 }}>조회수 수입: {fmt(d?.va||0)}</div>
                      <div style={{ color:"#1c1c1e",fontWeight:700,borderTop:"1px solid #f0f0ec",paddingTop:6,marginTop:4 }}>합계: {fmt(d?.total||0)}</div>
                    </div>;
                  }} cursor={{ fill:"#f7f7f5" }}/>
                  <Bar dataKey="ad" stackId="a" fill="#1c1c1e" barSize={24} radius={[0,0,0,0]}/>
                  <Bar dataKey="va" stackId="a" fill="#888"    barSize={24} radius={[6,6,0,0]}/>
                  <Line type="linear" dataKey="total" stroke="#bbb" strokeWidth={1.5} dot={{ r:3,fill:"#bbb",strokeWidth:0 }} activeDot={{ r:4 }}/>
                </ComposedChart>
              </ResponsiveContainer>
              {editVM && (
                <div style={{ background:"#f7f7f5",borderRadius:12,padding:"14px 16px",marginTop:14,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
                  <span style={{ fontSize:13,fontWeight:700,color:"#1c1c1e" }}>{editVM.slice(5)}월 조회수 수입</span>
                  <input autoFocus type="number" placeholder="금액 (원)" value={viIn} style={{ maxWidth:180,fontSize:13 }} onChange={e=>setViIn(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter")saveVi(editVM); if(e.key==="Escape")setEditVM(null); }}/>
                  <button style={{ ...btn,background:"#1c1c1e",color:"#fff",padding:"7px 14px",fontSize:12 }} onClick={()=>saveVi(editVM)}>저장</button>
                  <button style={{ ...btn,background:"#f0f0ec",color:"#555",padding:"7px 14px",fontSize:12 }} onClick={()=>setEditVM(null)}>취소</button>
                </div>
              )}
              <div style={{ display:"flex",gap:18,marginTop:14,paddingTop:12,borderTop:"1px solid #f0f0ec" }}>
                {[["#1c1c1e","광고 수입"],["#888","조회수 수입"],["#bbb","합계 (꺾은선)"]].map(([c,l])=>(
                  <div key={l} style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#888" }}>
                    <span style={{ width:l.includes("꺾은선")?16:10, height:l.includes("꺾은선")?2:10, borderRadius:3, background:c, display:"inline-block" }}></span>{l}
                  </div>
                ))}
              </div>
            </div>

            {/* 진행 중 계약 */}
            <div style={card}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:15,fontWeight:700,color:"#1c1c1e" }}>진행 중인 계약</div>
                  <div style={{ fontSize:12,color:"#aaa",marginTop:3 }}>마감일이 지나지 않은 계약</div>
                </div>
                <span style={{ background:"#1c1c1e",color:"#fff",fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:20 }}>{active.length}</span>
              </div>
              {active.length===0
                ? <div style={{ textAlign:"center",padding:"28px 0",color:"#ccc",fontSize:13 }}>진행 중인 계약이 없어요</div>
                : active.map(r=>{
                  const days=daysLeft(r.deadline);
                  const col=days<=7?"#c62828":days<=30?"#bf6e00":"#2e7d32";
                  return (
                    <div key={r.id} onClick={()=>{setTab("contracts");setDetail(r);}} style={{ padding:"12px 0",borderBottom:"1px solid #f7f7f5",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                      <div style={{ flex:1,paddingRight:12 }}>
                        <div style={{ fontSize:13,fontWeight:700,color:"#1c1c1e" }}>{r.company}</div>
                        <div style={{ fontSize:11,color:"#aaa",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:140 }}>{r.content}</div>
                        <div style={{ fontSize:11,marginTop:6,color:col,fontWeight:600 }}>{days}일 남음 · {r.deadline}</div>
                      </div>
                      <div style={{ textAlign:"right",flexShrink:0 }}>
                        {r.sponsored
                          ? <span style={{ background:"#f0f0ec",color:"#555",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20 }}>협찬</span>
                          : <div style={{ fontSize:13,fontWeight:700,color:"#1c1c1e" }}>{fmt(r.amount)}</div>
                        }
                        {!r.sponsored && <div style={{ marginTop:4 }}><Bdg on={r.paid} labels={["지급완료","미지급"]}/></div>}
                      </div>
                    </div>
                  );
                })
              }
              <button style={{ ...btn,background:"#f0f0ec",color:"#1c1c1e",width:"100%",marginTop:14,fontSize:12 }} onClick={()=>setTab("contracts")}>전체 계약 보기 →</button>
            </div>
          </div>
        </>)}

        {loaded && tab==="contracts" && (<>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
            <div>
              <h1 style={{ fontSize:26,fontWeight:800,color:"#1c1c1e",letterSpacing:"-.5px" }}>계약 관리</h1>
              <p style={{ fontSize:13,color:"#aaa",marginTop:4 }}>총 {data.length}건의 협업 계약</p>
            </div>
            <button style={{ ...btn,background:"#1c1c1e",color:"#fff",display:"flex",alignItems:"center",gap:6 }} onClick={openAdd}>
              <Ico d={P.plus} size={14}/> 새 협업 추가
            </button>
          </div>

          <div style={{ display:"flex",gap:10,marginBottom:18,flexWrap:"wrap" }}>
            <div style={{ position:"relative",flex:1,minWidth:180,maxWidth:260 }}>
              <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#bbb" }}><Ico d={P.search} size={14}/></span>
              <input style={{ paddingLeft:36 }} placeholder="업체명 / 계약내용 검색" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select style={{ maxWidth:140 }} value={fPaid} onChange={e=>setFPaid(e.target.value)}>
              <option value="all">전체 지급 상태</option>
              <option value="paid">지급 완료</option>
              <option value="unpaid">미지급</option>
            </select>
            <select style={{ maxWidth:130 }} value={sort} onChange={e=>setSort(e.target.value)}>
              <option value="contractDateDesc">최신순</option>
              <option value="deadline">마감일 순</option>
              <option value="contractDate">계약일 순</option>
              <option value="amount">금액 순</option>
              <option value="company">업체명 순</option>
            </select>
          </div>

          <div style={{ background:"#fff",borderRadius:14,border:"1px solid #ebebeb",overflow:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",minWidth:760 }}>
              <thead><tr>{["업체명","계약 날짜","계약 내용","금액","광고 마감일","세금계산서","광고비 지급",""].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.length===0
                  ? <tr><td colSpan={8} style={{ textAlign:"center",padding:44,color:"#bbb" }}>데이터가 없습니다.</td></tr>
                  : filtered.map(r=>{
                    const over=new Date(r.deadline)<now&&!r.paid&&!r.sponsored;
                    const sel=detail?.id===r.id;
                    return (
                      <tr key={r.id} className={`tr${sel?" tr-s":""}`} onClick={()=>setDetail(sel?null:r)} style={{ background:over?"#fff9f9":undefined }}>
                        <td>
                          <div style={{ fontWeight:600,color:"#1c1c1e" }}>{r.company}</div>
                          <div style={{ display:"flex",gap:4,marginTop:4,flexWrap:"wrap" }}>
                            {r.sponsored && <span style={{ background:"#f0f0ec",color:"#555",fontSize:11,fontWeight:600,padding:"1px 8px",borderRadius:20 }}>협찬</span>}
                            {over && <span style={{ background:"#fce8e8",color:"#c62828",fontSize:11,fontWeight:600,padding:"1px 8px",borderRadius:20 }}>⚠ 미수금</span>}
                          </div>
                        </td>
                        <td style={{ color:"#888" }}>{r.contractDate}</td>
                        <td style={{ maxWidth:160,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",color:"#555" }} title={r.content}>{r.content}</td>
                        <td style={{ fontWeight:700 }}>{r.sponsored?<span style={{ color:"#bbb" }}>—</span>:fmt(r.amount)}</td>
                        <td style={{ color:over?"#c62828":"#555",fontWeight:over?700:400 }}>{r.deadline}</td>
                        <td>{r.sponsored?<span style={{ color:"#bbb" }}>—</span>:<button onClick={e=>toggle(r.id,"taxInvoice",e)} style={{ background:"none",border:"none",cursor:"pointer",padding:0 }}><Bdg on={r.taxInvoice} labels={["발행완료","미발행"]}/></button>}</td>
                        <td>{r.sponsored?<span style={{ color:"#bbb" }}>—</span>:<button onClick={e=>toggle(r.id,"paid",e)} style={{ background:"none",border:"none",cursor:"pointer",padding:0 }}><Bdg on={r.paid} labels={["지급완료","미지급"]}/></button>}</td>
                        <td>
                          <div style={{ display:"flex",gap:6 }}>
                            <button style={{ ...btn,background:"#f7f7f5",color:"#1c1c1e",padding:"6px 10px" }} onClick={e=>openEdit(r,e)}><Ico d={P.edit} size={13}/></button>
                            <button style={{ ...btn,background:"#fce8e8",color:"#c62828",padding:"6px 10px" }} onClick={e=>{e.stopPropagation();setDelConf(r.id);}}><Ico d={P.trash} size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>

          {detail && (
            <div style={{ ...card,marginTop:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
                <div>
                  <div style={{ fontSize:15,fontWeight:700,color:"#1c1c1e" }}>계약 상세 내역</div>
                  <div style={{ fontSize:12,color:"#aaa",marginTop:2 }}>{detail.company}</div>
                </div>
                <button style={{ ...btn,background:"#f0f0ec",color:"#555",padding:"7px 12px" }} onClick={()=>setDetail(null)}><Ico d={P.x} size={14}/></button>
              </div>
              <div style={{ background:"#f7f7f5",borderRadius:12,padding:"4px 20px" }}>
                {[
                  ["업체명", detail.company],
                  ["계약 날짜", detail.contractDate],
                  ["계약 내용", detail.content||"—"],
                  ["협찬 여부", <Bdg on={detail.sponsored} labels={["협찬","유료 계약"]}/>],
                  ...(!detail.sponsored?[["계약 금액",<span style={{ fontWeight:800,color:"#1c1c1e",fontSize:16 }}>{fmt(detail.amount)}</span>]]:[]),
                  ["광고 마감일",<span style={{ color:new Date(detail.deadline)<now&&!detail.paid&&!detail.sponsored?"#c62828":"#1c1c1e" }}>{detail.deadline}</span>],
                  ...(!detail.sponsored?[["세금계산서",<Bdg on={detail.taxInvoice} labels={["발행완료","미발행"]}/>],["광고비 지급",<Bdg on={detail.paid} labels={["지급완료","미지급"]}/>]]:[]),
                ].map(([l,v],i,arr)=>(
                  <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:i<arr.length-1?"1px solid #efefed":"none" }}>
                    <span style={{ fontSize:11,color:"#aaa",fontWeight:700,textTransform:"uppercase",letterSpacing:".04em",minWidth:120 }}>{l}</span>
                    <span style={{ fontSize:14,color:"#1c1c1e",fontWeight:500,textAlign:"right" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex",gap:10,marginTop:16,justifyContent:"flex-end" }}>
                <button style={{ ...btn,background:"#f0f0ec",color:"#1c1c1e",display:"flex",alignItems:"center",gap:6 }} onClick={e=>openEdit(detail,e)}><Ico d={P.edit} size={14}/> 수정</button>
                <button style={{ ...btn,background:"#fce8e8",color:"#c62828",display:"flex",alignItems:"center",gap:6 }} onClick={()=>setDelConf(detail.id)}><Ico d={P.trash} size={14}/> 삭제</button>
              </div>
            </div>
          )}
        </>)}
      </div>

      {modal && (
        <div className="ov" onClick={()=>setModal(null)}>
          <div className="mb" onClick={e=>e.stopPropagation()}>
            <h2 style={{ fontSize:18,fontWeight:800,color:"#1c1c1e",marginBottom:22 }}>{modal.mode==="add"?"새 협업 추가":"협업 수정"}</h2>
            <div style={{ display:"grid",gap:14 }}>
              {[{k:"company",l:"업체명 *",t:"text",p:"예: 스타벅스코리아"},{k:"contractDate",l:"계약 날짜 *",t:"date"},{k:"deadline",l:"광고 마감일 *",t:"date"}].map(f=>(
                <div key={f.k}><label>{f.l}</label><input type={f.t} placeholder={f.p} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}/></div>
              ))}
              <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:0 }}>
                <input type="checkbox" style={{ width:"auto" }} checked={form.sponsored} onChange={e=>setForm(p=>({...p,sponsored:e.target.checked,amount:e.target.checked?"0":p.amount,taxInvoice:e.target.checked?false:p.taxInvoice,paid:e.target.checked?false:p.paid}))}/>
                협찬 (금액 없음)
              </label>
              {!form.sponsored && <div><label>금액 (원) *</label><input type="number" placeholder="예: 1500000" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))}/></div>}
              <div><label>계약 내용</label><textarea rows={3} placeholder="예: SNS 피드 광고 2회" value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))}/></div>
              {!form.sponsored && (
                <div style={{ display:"flex",gap:20 }}>
                  {[{k:"taxInvoice",l:"세금계산서 발행"},{k:"paid",l:"광고비 지급"}].map(c=>(
                    <label key={c.k} style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer" }}>
                      <input type="checkbox" style={{ width:"auto" }} checked={form[c.k]} onChange={e=>setForm(p=>({...p,[c.k]:e.target.checked}))}/>{c.l}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display:"flex",gap:10,marginTop:24,justifyContent:"flex-end" }}>
              <button style={{ ...btn,background:"#f0f0ec",color:"#555" }} onClick={()=>setModal(null)}>취소</button>
              <button style={{ ...btn,background:"#1c1c1e",color:"#fff" }} onClick={save}>{modal.mode==="add"?"추가하기":"저장하기"}</button>
            </div>
          </div>
        </div>
      )}

      {delConf && (
        <div className="ov" onClick={()=>setDelConf(null)}>
          <div className="mb" style={{ maxWidth:340 }} onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontSize:16,fontWeight:800,color:"#1c1c1e",marginBottom:10 }}>정말 삭제하시겠어요?</h3>
            <p style={{ fontSize:13,color:"#aaa",marginBottom:22 }}>삭제된 데이터는 복구할 수 없습니다.</p>
            <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
              <button style={{ ...btn,background:"#f0f0ec",color:"#555" }} onClick={()=>setDelConf(null)}>취소</button>
              <button style={{ ...btn,background:"#1c1c1e",color:"#fff" }} onClick={()=>del(delConf)}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

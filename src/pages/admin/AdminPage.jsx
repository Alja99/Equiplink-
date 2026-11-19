import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "../../lib/supabase.js";
import {
  createAttachmentDownloadUrl,
  fetchAdminAssets,
  fetchAdminDowntime,
  fetchAdminRequests,
  normalizeAdminRequest,
  updateAdminRequestStatus,
} from "../../utils/adminRequests.js";
import "../../pages.css";

const serviceFilters = ["All requests", "Equipment", "Consultancy", "Procurement", "Contact", "Partner"];
const viewOptions = [["Requests", FileText], ["Fleet deployment", Truck], ["Maintenance", Wrench], ["Reports", Package]];

function displayError(error) {
  if (error?.code === "42501") return "Your account is not authorized to access the operations desk.";
  if (error?.code === "PGRST202" || error?.code === "PGRST205") return "The database is missing a required migration. Apply all Supabase migrations, then retry.";
  return error?.message || "The operations service could not be reached. Check the connection and retry.";
}

function Status({ status }) {
  const tone = status === "Pending Review" ? "pending"
    : status === "Docs Verified" || status === "Approved" ? "verified"
      : status === "Quote Prepared" ? "quoted"
        : status === "Cancelled" || status === "Rejected" ? "cancelled" : "dispatched";
  return <span className={`el-status ${tone}`}><i />{status}</span>;
}

function one(value) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

function nextAction(request) {
  if (request.service === "Equipment") {
    if (request.statusValue === "pending") return ["approved", "Approve booking"];
    if (request.statusValue === "approved") return ["dispatched", "Confirm & dispatch"];
    if (request.statusValue === "dispatched" || request.statusValue === "confirmed") return ["completed", "Mark completed"];
  } else if (request.service === "Consultancy") {
    if (request.statusValue === "pending") return ["in_review", "Start review"];
    if (request.statusValue === "in_review") return ["docs_verified", "Verify documents"];
    if (request.statusValue === "docs_verified") return ["completed", "Mark completed"];
  } else if (request.service === "Procurement") {
    if (request.statusValue === "pending") return ["in_review", "Start review"];
    if (request.statusValue === "in_review") return ["quote_prepared", "Mark quote prepared"];
    if (request.statusValue === "quote_prepared") return ["completed", "Mark completed"];
  } else {
    if (request.statusValue === "pending") return ["in_review", "Start review"];
    if (request.statusValue === "in_review") return ["completed", "Mark completed"];
  }
  return null;
}

function AdminSignIn({ message, onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  async function submit(event) {
    event.preventDefault();
    if (lock.current || !supabase) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Sign-in failed. Check your email and password, then try again.");
        return;
      }
      onSignedIn();
    } catch {
      setError("Sign-in service is unavailable. Check your connection and try again.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return <div className="el-admin el-admin-auth-shell">
    <main className="el-admin-main el-admin-auth-main">
      <section className="el-admin-panel el-admin-auth-panel">
        <a className="el-brand" href="/" aria-label="EquipLink home"><span className="el-brand-artwork"><img className="el-brand-symbol" src="/images/equiplink-symbol.png" alt="" /><img className="el-brand-logo" src="/images/equiplink-wordmark.png" alt="" /></span><small>OPERATIONS DESK</small></a>
        <p className="el-eyebrow"><ShieldCheck size={14} /> STAFF ACCESS</p>
        <h1>Sign in to the request desk</h1>
        {message && <p className="el-admin-auth-message" role="status">{message}</p>}
        {error && <p className="el-admin-auth-error" role="alert">{error}</p>}
        <form onSubmit={submit}>
          <label>Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button type="submit" disabled={busy} aria-busy={busy}>{busy ? "Signing in..." : "Sign in"} <ArrowRight size={15} /></button>
        </form>
      </section>
    </main>
  </div>;
}

function AdminPage() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [authChecking, setAuthChecking] = useState(false);
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [downtime, setDowntime] = useState([]);
  const [filter, setFilter] = useState("All requests");
  const [selectedId, setSelectedId] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("Requests");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [downloadingId, setDownloadingId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthReady(true);
      return undefined;
    }
    let active = true;
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setAuthError(displayError(error));
        setSession(data?.session || null);
      })
      .catch((error) => { if (active) setAuthError(displayError(error)); })
      .finally(() => { if (active) setAuthReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setAuthorized(false);
        setSession(nextSession);
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) {
      setAuthorized(false);
      setAuthChecking(false);
      return undefined;
    }
    let active = true;
    setAuthChecking(true);
    supabase.rpc("is_equiplink_staff")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setAuthError(displayError(error));
        setAuthorized(!error && data === true);
      })
      .catch((error) => { if (active) setAuthError(displayError(error)); })
      .finally(() => { if (active) setAuthChecking(false); });
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (!authorized) return undefined;
    let active = true;
    setLoading(true);
    setLoadError("");
    Promise.all([fetchAdminRequests(), fetchAdminAssets(), fetchAdminDowntime()])
      .then(([requestRows, assetRows, downtimeRows]) => {
        if (!active) return;
        const normalized = requestRows.map(normalizeAdminRequest);
        setRequests(normalized);
        setAssets(assetRows);
        setDowntime(downtimeRows);
        setSelectedId((current) => normalized.some((request) => request.id === current) ? current : normalized[0]?.id || "");
      })
      .catch((error) => { if (active) setLoadError(displayError(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authorized, reloadKey]);

  const selected = requests.find((request) => request.id === selectedId) || null;
  const filtered = useMemo(() => requests.filter((request) =>
    (filter === "All requests" || request.service === filter)
    && `${request.name} ${request.company} ${request.item} ${request.id}`.toLowerCase().includes(search.toLowerCase()),
  ), [filter, requests, search]);
  const pending = requests.filter((request) => request.statusValue === "pending").length;
  const activeCount = requests.filter((request) => !["completed", "cancelled", "rejected"].includes(request.statusValue)).length;

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(displayError(error));
  }

  async function changeStatus(request, status, message) {
    if (updatingId) return;
    setUpdatingId(request.id);
    setNotice("");
    try {
      await updateAdminRequestStatus(request.id, status);
      setNotice(`${message}: ${request.id}`);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setNotice(displayError(error));
    } finally {
      setUpdatingId("");
    }
  }

  async function downloadAttachment(attachment) {
    if (downloadingId) return;
    setDownloadingId(attachment.id);
    setNotice("");
    try {
      const url = await createAttachmentDownloadUrl(attachment.object_path);
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = attachment.original_name;
      link.click();
    } catch (error) {
      setNotice(displayError(error));
    } finally {
      setDownloadingId("");
    }
  }

  function exportRequests() {
    const columns = ["ID", "Service", "Name", "Company", "Email", "Status", "Created"];
    const rows = filtered.map((request) => [request.id, request.service, request.name, request.company, request.email, request.status, request.createdAt]);
    const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value || "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "equiplink-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!isSupabaseConfigured) {
    return <AdminSignIn message="Add the Supabase project URL and public anon key to .env.local, then restart Vite." onSignedIn={() => {}} />;
  }
  if (!authReady || authChecking) {
    return <div className="el-admin el-admin-state"><p role="status">Checking staff access...</p></div>;
  }
  if (!session) return <AdminSignIn message={authError} onSignedIn={() => setAuthError("")} />;
  if (!authorized) {
    return <div className="el-admin el-admin-state"><section className="el-admin-panel"><ShieldCheck size={24} /><h1>Staff access required</h1><p>{authError || "This account is not authorized for the EquipLink request desk."}</p><button type="button" onClick={signOut}>Sign out <LogOut size={15} /></button></section></div>;
  }

  const activeRequestAction = selected && nextAction(selected);
  return <div className="el-admin">
    <aside className={`el-admin-sidebar${adminMenuOpen ? " mobile-open" : ""}`}>
      <a className="el-brand" href="/" aria-label="EquipLink home"><span className="el-brand-artwork"><img className="el-brand-symbol" src="/images/equiplink-symbol.png" alt="" /><img className="el-brand-logo" src="/images/equiplink-wordmark.png" alt="" /></span><small>OPERATIONS DESK</small></a>
      <div className="el-admin-workspace"><span>EL</span><div><strong>EquipLink Operations</strong><small>{session.user.email}</small></div><ChevronDown size={14} /></div>
      <p className="el-admin-label">WORKSPACE</p>
      {viewOptions.map(([label, Icon]) => <button key={label} className={`el-admin-nav${view === label ? " active" : ""}`} onClick={() => { setView(label); setAdminMenuOpen(false); }}><Icon size={17} />{label}{label === "Requests" && pending > 0 && <span>{pending}</span>}</button>)}
      <div className="el-admin-bottom"><a href="/">← Back to website</a><button type="button" className="el-admin-signout" onClick={signOut}><LogOut size={14} /> Sign out</button></div>
    </aside>
    {adminMenuOpen && <button className="el-admin-scrim" aria-label="Close admin navigation" onClick={() => setAdminMenuOpen(false)} />}
    <main className="el-admin-main">
      <header className="el-admin-top"><div><button className="el-admin-menu-toggle" aria-label="Open admin navigation" aria-expanded={adminMenuOpen} onClick={() => setAdminMenuOpen(!adminMenuOpen)}><Menu size={18} /></button><span>Operations</span><ChevronRight size={14} /><strong>{view}</strong></div><div><span className="el-admin-live"><i /> Connected</span><button type="button" aria-label="Refresh request data" onClick={() => setReloadKey((key) => key + 1)}><ArrowDown size={15} /></button><span className="el-admin-user-avatar">{session.user.email?.slice(0, 2).toUpperCase()}</span></div></header>
      <div className="el-admin-content">
        <div className="el-admin-heading"><div><p className="el-eyebrow">OPERATIONS OVERVIEW</p><h1>{view === "Requests" ? "Request management" : view}</h1><p>Live records from the EquipLink database.</p></div><span className="el-date"><CalendarDays size={15} /> Liberia time <ChevronDown size={13} /></span></div>
        {notice && <div className="el-admin-notice" role="status"><CheckCircle2 size={16} />{notice}<button type="button" onClick={() => setNotice("")}><X size={15} /></button></div>}
        {loadError && <div className="el-admin-load-error" role="alert"><span>{loadError}</span><button type="button" onClick={() => setReloadKey((key) => key + 1)}>Retry</button></div>}
        <div className="el-admin-metrics"><AdminMetric label="Total requests" value={String(requests.length)} caption="All service divisions" icon={<FileText size={17} />} /><AdminMetric label="Open pipeline" value={String(activeCount)} caption="Not completed or closed" icon={<Package size={17} />} /><AdminMetric label="Pending review" value={String(pending)} caption="Require staff review" icon={<Clock3 size={17} />} alert={pending > 0} /><AdminMetric label="Registered assets" value={String(assets.length)} caption="Physical equipment records" icon={<Truck size={17} />} /></div>
        {view === "Requests" && <div className="el-admin-grid"><section className="el-admin-panel el-requests-panel"><div className="el-admin-panel-head"><div><h2>Service pipeline</h2><p>{requests.length} live requests across all divisions</p></div><button type="button" className="el-admin-export" onClick={exportRequests} disabled={!filtered.length}><ArrowDown size={14} /> Export</button></div>
          <div className="el-request-toolbar"><div className="el-admin-tabs">{serviceFilters.map((item) => <button type="button" key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><label><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests" /></label></div>
          {loading ? <div className="el-admin-state-inline" role="status">Loading requests...</div>
            : filtered.length ? <div className="el-request-table-wrap"><table className="el-request-table"><thead><tr><th>REQUEST</th><th>SERVICE</th><th>SUBMITTED</th><th>STATUS</th><th /></tr></thead><tbody>{filtered.map((request) => <tr key={request.id} className={selected?.id === request.id ? "selected" : ""} onClick={() => setSelectedId(request.id)}><td><strong>{request.name || "New enquiry"}</strong><small>{request.id} · {request.company || request.email}</small></td><td><span className={`el-service-chip ${request.service.toLowerCase()}`}>{request.service}</span></td><td>{new Date(request.createdAt).toLocaleDateString()}</td><td><Status status={request.status} /></td><td><ChevronRight size={15} /></td></tr>)}</tbody></table></div>
              : <div className="el-admin-empty"><FileText size={23} /><strong>{requests.length ? "No matching requests" : "No requests yet"}</strong><span>{requests.length ? "Try a different filter or search term." : "New website submissions will appear here."}</span></div>}
          <div className="el-table-foot">Showing {filtered.length} of {requests.length} database requests <span>Refresh to load the latest records</span></div>
        </section>
        <aside className="el-admin-panel el-dossier">{selected ? <><div className="el-dossier-top"><div><span>REQUEST DOSSIER</span><span>{selected.service}</span></div><strong>{selected.item || `${selected.service} request`}</strong><small>{selected.id} · {new Date(selected.createdAt).toLocaleString()}</small></div><Status status={selected.status} />
          <div className="el-dossier-section"><h3>Client details</h3><p><UserRound size={14} /><span><strong>{selected.name || "Not provided"}</strong><small>Contact name</small></span></p><p><Building2 size={14} /><span><strong>{selected.company || "Independent"}</strong><small>Organization</small></span></p><p><Mail size={14} /><span><strong>{selected.email || "No email provided"}</strong><small>Email address</small></span></p>{selected.phone && <p><Phone size={14} /><span><strong>{selected.phone}</strong><small>Phone number</small></span></p>}</div>
          <div className="el-dossier-section"><h3>Request details</h3>{selected.location && <p><MapPin size={14} /><span><strong>{selected.location}</strong><small>Delivery location</small></span></p>}{selected.booking && <p><CalendarDays size={14} /><span><strong>{new Date(selected.booking.starts_at).toLocaleString()} – {new Date(selected.booking.ends_at).toLocaleString()}</strong><small>Requested booking · {selected.booking.booking_status}</small></span></p>}{selected.consultancy && <p><BadgeCheck size={14} /><span><strong>{selected.consultancy.practice}</strong><small>{selected.consultancy.urgency || "Standard"}{selected.consultancy.headcount ? ` · ${selected.consultancy.headcount} personnel` : ""}</small></span></p>}{selected.procurement && <p><Package size={14} /><span><strong>{selected.procurement.division}</strong><small>{selected.procurement.quantity} · {selected.procurement.timeline}</small></span></p>}{selected.details && <blockquote>{selected.details}</blockquote>}
            {selected.attachments.map((attachment) => <div className="el-attachment" key={attachment.id}><FileText size={15} /><span><strong>{attachment.original_name}</strong><small>{Math.ceil(attachment.size_bytes / 1024)} KB · Private document</small></span><button type="button" disabled={downloadingId === attachment.id} aria-label={`Download ${attachment.original_name}`} onClick={() => downloadAttachment(attachment)}>{downloadingId === attachment.id ? "..." : <ArrowDown size={14} />}</button></div>)}
          </div>
          <div className="el-dossier-actions">{activeRequestAction && <button type="button" disabled={updatingId === selected.id} onClick={() => changeStatus(selected, activeRequestAction[0], activeRequestAction[1])}>{updatingId === selected.id ? "Updating..." : activeRequestAction[1]} <ArrowUpRight size={15} /></button>}{!["completed", "cancelled", "rejected"].includes(selected.statusValue) && <><button type="button" className="secondary" disabled={updatingId === selected.id} onClick={() => changeStatus(selected, "cancelled", "Request cancelled")}>Cancel request</button><button type="button" className="secondary" disabled={updatingId === selected.id} onClick={() => changeStatus(selected, "rejected", "Request rejected")}>Reject request</button></>}</div>
        </> : <div className="el-admin-empty"><FileText size={23} /><strong>Select a request</strong><span>Choose a record to review its details.</span></div>}</aside></div>}
        {view === "Fleet deployment" && <DataPanel title="Registered equipment assets" description="Physical machines and their current operational status" loading={loading} error={loadError} empty={!assets.length} emptyText="No equipment assets are registered yet."><div className="el-request-table-wrap"><table className="el-request-table"><thead><tr><th>ASSET</th><th>EQUIPMENT</th><th>LOCATION</th><th>STATUS</th><th>DAILY RATE</th></tr></thead><tbody>{assets.map((asset) => { const equipment = one(asset.equipment); return <tr key={asset.id}><td><strong>{asset.asset_code}</strong></td><td>{equipment?.name || "Equipment"}</td><td>{asset.location}</td><td>{asset.operational_status} · {asset.availability_status}</td><td>${Number(asset.daily_rate).toLocaleString()}</td></tr>; })}</tbody></table></div></DataPanel>}
        {view === "Maintenance" && <DataPanel title="Maintenance and downtime" description="Scheduled and active asset downtime" loading={loading} error={loadError} empty={!downtime.length} emptyText="No maintenance periods or downtime records were found."><div className="el-request-table-wrap"><table className="el-request-table"><thead><tr><th>ASSET</th><th>TYPE</th><th>PERIOD</th><th>STATUS</th><th>REASON</th></tr></thead><tbody>{downtime.map((period) => { const asset = one(period.asset); const equipment = one(asset?.equipment); return <tr key={period.id}><td><strong>{asset?.asset_code || equipment?.name || "Asset"}</strong></td><td>{period.downtime_type}</td><td>{new Date(period.starts_at).toLocaleString()} – {new Date(period.ends_at).toLocaleString()}</td><td>{period.downtime_status}</td><td>{period.reason || "—"}</td></tr>; })}</tbody></table></div></DataPanel>}
        {view === "Reports" && <div className="el-admin-panel el-report-panel"><div className="el-admin-panel-head"><div><h2>Request summary</h2><p>Counts derived from current database records</p></div></div>{loading ? <div className="el-admin-state-inline" role="status">Loading report data...</div> : <div className="el-admin-report-grid">{serviceFilters.slice(1).map((service) => <AdminMetric key={service} label={service} value={String(requests.filter((request) => request.service === service).length)} caption="Requests" icon={<FileText size={17} />} />)}</div>}</div>}
      </div>
    </main>
  </div>;
}

function DataPanel({ title, description, loading, error, empty, emptyText, children }) {
  return <section className="el-admin-panel el-data-panel"><div className="el-admin-panel-head"><div><h2>{title}</h2><p>{description}</p></div></div>{loading ? <div className="el-admin-state-inline" role="status">Loading...</div> : error ? <div className="el-admin-empty" role="alert">{error}</div> : empty ? <div className="el-admin-empty"><FileText size={23} /><strong>{emptyText}</strong></div> : children}</section>;
}

function AdminMetric({ label, value, caption, icon, alert }) {
  return <article className="el-admin-panel el-admin-metric"><span className="el-admin-metric-icon">{icon}</span><small>{label}</small><strong>{value}</strong><span className={alert ? "is-alert" : ""}>{caption}</span></article>;
}

export { AdminPage };

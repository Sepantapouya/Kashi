import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  Input,
  Select,
  SegmentedControl,
  Switch,
} from "@kashi-ui/react";
import { Icon } from "@kashi-ui/icons/react";
import Reports, { time } from "./Reports";
import { SanjeMark } from "./SanjeMark";
import { channels, channelIds, num, stages } from "./reportData";
import { sanje } from "./config";
import {
  data,
  defaultPreferences,
  devices,
  initialFilters,
  loadPreferences,
  loadSaved,
  pages,
  persist,
  readFilters,
  reportUrl,
  type Filters,
  type Page,
  type Preferences,
  type Session,
} from "./model";

const analyticsPages: Page[] = [
  "dashboard",
  "funnel",
  "channels",
  "sessions",
  "events",
];
const utilityPages: Page[] = ["saved", "settings", "guide"];

export default function Workspace() {
  const [url, setUrl] = useState(location.pathname + location.search);
  const pathname =
    url.split("?")[0].split("/").filter(Boolean)[0] || "dashboard";
  const validPage = Object.hasOwn(pages, pathname);
  const page: Page = validPage ? (pathname as Page) : "dashboard";
  const filters = readFilters(
    url.includes("?") ? url.slice(url.indexOf("?")) : "",
  );
  const analytics = analyticsPages.includes(page) && validPage;
  const [preferences, setPreferences] = useState(loadPreferences);
  const [saved, setSaved] = useState(loadSaved);
  const [theme, setTheme] = useState(
    document.documentElement.dataset.theme || "dark",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [notice, setNotice] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const initialPage = useRef(true);

  useEffect(() => {
    const sync = () => setUrl(location.pathname + location.search);
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("keydown", shortcut);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("keydown", shortcut);
    };
  }, []);
  useEffect(() => {
    document.title = `${validPage ? pages[page].title : "صفحه پیدا نشد"} · سنجه`;
    if (initialPage.current) {
      initialPage.current = false;
      return;
    }
    heading.current?.focus();
    window.scrollTo(0, 0);
  }, [page, validPage]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  function navigate(next: string, replace = false) {
    if (replace) history.replaceState(null, "", next);
    else history.pushState(null, "", next);
    setUrl(location.pathname + location.search);
    setMenuOpen(false);
  }
  function handleLink(event: MouseEvent) {
    const link = (event.target as HTMLElement).closest("a");
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target ||
      link.hasAttribute("download")
    )
      return;
    const destination = new URL(link.href);
    if (destination.origin !== location.origin || destination.hash) return;
    event.preventDefault();
    navigate(destination.pathname + destination.search);
  }
  function changeFilters(patch: Partial<Filters>) {
    navigate(reportUrl(page, { ...filters, ...patch }), true);
  }
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem("sanje-theme", next);
    } catch {
      setNotice("ذخیرهٔ تم در مرورگر ممکن نشد.");
    }
  }
  function saveReport() {
    if (!reportName.trim()) return;
    if (saved.length >= 50) {
      setNotice(
        "تا ۵۰ گزارش می‌توانید ذخیره کنید؛ یکی از گزارش‌های قبلی را حذف کنید.",
      );
      return;
    }
    const next = [
      {
        id: crypto.randomUUID(),
        name: reportName.trim(),
        url: reportUrl(page, filters),
        created: new Date().toISOString(),
      },
      ...saved,
    ];
    if (!persist("sanje-saved", next)) {
      setNotice("ذخیره در مرورگر ممکن نشد؛ تنظیمات حریم خصوصی را بررسی کنید.");
      return;
    }
    setSaved(next);
    setSaveOpen(false);
    setNotice("گزارش ذخیره شد. از «گزارش‌های من» دوباره بازش کنید.");
  }
  const nav = (items: Page[]) =>
    items.map((item) => (
      <a
        key={item}
        href={reportUrl(item, filters)}
        aria-current={validPage && page === item ? "page" : undefined}
      >
        <Icon name={pages[item].icon} size={19} />
        <span>{item === "saved" ? "گزارش‌های من" : pages[item].title}</span>
        {item === "saved" && saved.length > 0 && (
          <small>{num(saved.length)}</small>
        )}
      </a>
    ));
  const matchingPages = (Object.keys(pages) as Page[]).filter((item) =>
    pages[item].title.includes(search.trim()),
  );
  const matchingSessions =
    search.trim().length >= 2
      ? data
          .filter((row) =>
            row.id.toLowerCase().includes(search.trim().toLowerCase()),
          )
          .slice(0, 6)
      : [];

  return (
    <div className="workspace" onClick={handleLink}>
      <a className="skip-link" href="#sanje-main">
        رفتن به محتوای اصلی
      </a>
      <aside className="sidebar" aria-label="ناوبری سنجه">
        <a className="brand" href="/dashboard/">
          <SanjeMark />
          <b>سنجه</b>
          <small>فضای تحلیل</small>
        </a>
        <div className="workspace-picker">
          <span className="store-avatar">ک</span>
          <div>
            <strong>{preferences.name}</strong>
            <small>فضای کاری نمونه</small>
          </div>
        </div>
        <button className="quick-search" onClick={() => setSearchOpen(true)}>
          <Icon name="search" size={17} />
          <span>جستجو در سنجه</span>
          <kbd>⌘ K</kbd>
        </button>
        <span className="nav-caption">تحلیل و گزارش</span>
        <nav>{nav(analyticsPages)}</nav>
        <span className="nav-caption">فضای کاری</span>
        <nav>{nav(utilityPages)}</nav>
        <div className="sidebar-bottom">
          <div className="sample-note">
            <span className="status-dot" />
            <div>
              <b>محیط آزمایشی</b>
              <p>دادهٔ نمونهٔ آبان ۱۴۰۵</p>
            </div>
          </div>
          <a className="profile" href="/settings/">
            <Avatar name="مدیر فروشگاه" size="sm" color="auto" />
            <span>
              <strong>مدیر فروشگاه</strong>
              <small>تنظیمات فضای کاری</small>
            </span>
            <Icon name="settings" size={18} />
          </a>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="topbar">
          <Button
            className="mobile-menu"
            variant="tertiary"
            size="sm"
            shape="square"
            aria-label="باز کردن منو"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" size={20} />
          </Button>
          <div className="breadcrumbs">
            <span>{preferences.name}</span>
            <Icon name="chevron-left" size={13} />
            <b>{validPage ? pages[page].title : "صفحه پیدا نشد"}</b>
          </div>
          <div className="topbar-actions">
            <Badge size="sm" variant="outline">
              نسخهٔ نمایشی
            </Badge>
            <button
              className="icon-button"
              aria-label="جستجو در سنجه"
              onClick={() => setSearchOpen(true)}
            >
              <Icon name="search" size={19} />
            </button>
            <button
              className="icon-button"
              aria-label={theme === "dark" ? "تم روشن" : "تم تیره"}
              onClick={toggleTheme}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={19} />
            </button>
            <Avatar name={preferences.name} size="sm" color="auto" />
          </div>
        </header>
        <main id="sanje-main" className="main-content">
          <header className="page-header">
            <div>
              <div className="page-eyebrow">
                {analytics ? "تحلیل عملکرد فروشگاه" : "فضای کاری سنجه"}
              </div>
              <h1 tabIndex={-1} ref={heading}>
                {validPage ? pages[page].title : "صفحه پیدا نشد"}
              </h1>
              <p>
                {validPage
                  ? pages[page].description
                  : "از منوی سنجه، گزارش موردنظرتان را باز کنید."}
              </p>
            </div>
            {analytics && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setReportName(
                    pages[page].title +
                      " · " +
                      (filters.channel === "all"
                        ? "همهٔ کانال‌ها"
                        : channels[filters.channel as keyof typeof channels]),
                  );
                  setSaveOpen(true);
                }}
                iconStart={<Icon name="bookmark" size={17} />}
              >
                ذخیرهٔ گزارش
              </Button>
            )}
          </header>
          {analytics && (
            <>
              <div className="filterbar">
                <SegmentedControl
                  size="sm"
                  aria-label="بازهٔ گزارش"
                  value={filters.days}
                  onChange={(days) => changeFilters({ days })}
                  options={[
                    { value: "7", label: "۷ روز آخر" },
                    { value: "14", label: "۱۴ روز آخر" },
                    { value: "30", label: "کل ماه" },
                  ]}
                />
                <div className="filter-selects">
                  <Select
                    size="sm"
                    aria-label="کانال جذب"
                    value={filters.channel}
                    onChange={(event) =>
                      changeFilters({ channel: event.target.value })
                    }
                    options={[
                      { value: "all", label: "همهٔ کانال‌ها" },
                      ...channelIds.map((id) => ({
                        value: id,
                        label: channels[id],
                      })),
                    ]}
                  />
                  <Select
                    size="sm"
                    aria-label="دستگاه"
                    value={filters.device}
                    onChange={(event) =>
                      changeFilters({ device: event.target.value })
                    }
                    options={[
                      { value: "all", label: "همهٔ دستگاه‌ها" },
                      ...Object.entries(devices).map(([value, label]) => ({
                        value,
                        label,
                      })),
                    ]}
                  />
                </div>
                <span className="date-label">
                  <Icon name="calendar" size={16} />
                  {num(31 - Number(filters.days))} تا ۳۰ آبان ۱۴۰۵
                </span>
              </div>
              {(filters.channel !== "all" ||
                filters.device !== "all" ||
                filters.stage !== "all" ||
                filters.query) && (
                <div className="active-filters">
                  <span>فیلترهای فعال</span>
                  {filters.channel !== "all" && (
                    <Badge onRemove={() => changeFilters({ channel: "all" })}>
                      {channels[filters.channel as keyof typeof channels]}
                    </Badge>
                  )}
                  {filters.device !== "all" && (
                    <Badge onRemove={() => changeFilters({ device: "all" })}>
                      {devices[filters.device as keyof typeof devices]}
                    </Badge>
                  )}
                  {filters.stage !== "all" && page === "events" && (
                    <Badge onRemove={() => changeFilters({ stage: "all" })}>
                      {stages[Number(filters.stage)]}
                    </Badge>
                  )}
                  {filters.query && (
                    <Badge onRemove={() => changeFilters({ query: "" })}>
                      {filters.query}
                    </Badge>
                  )}
                  <button
                    className="text-button"
                    onClick={() =>
                      changeFilters({ ...initialFilters, days: filters.days })
                    }
                  >
                    پاک کردن فیلترها
                  </button>
                </div>
              )}
              <Reports
                key={page + filters.days + filters.channel + filters.device}
                page={page}
                filters={filters}
                preferences={preferences}
                onFilter={changeFilters}
                onSession={setSession}
              />
            </>
          )}
          {page === "saved" && (
            <section className="panel saved-panel">
              <div className="panel-header">
                <div>
                  <h2>گزارش‌های من</h2>
                  <p>{num(saved.length)} نمای ذخیره‌شده در این مرورگر</p>
                </div>
              </div>
              {saved.length === 0 ? (
                <div className="empty-state">
                  <Icon name="bookmark" size={36} />
                  <h2>گزارش پرکاربردتان را نگه دارید</h2>
                  <p>
                    فیلترها را در یکی از گزارش‌ها تنظیم کنید و «ذخیرهٔ گزارش» را
                    بزنید.
                  </p>
                  <Button href="/dashboard/">رفتن به نمای کلی</Button>
                </div>
              ) : (
                <div className="saved-list">
                  {saved.map((item) => (
                    <article key={item.id}>
                      <span className="saved-icon">
                        <Icon name="file-text" size={21} />
                      </span>
                      <div>
                        <a href={item.url}>{item.name}</a>
                        <small>
                          {new Date(item.created).toLocaleDateString("fa-IR")}
                        </small>
                      </div>
                      <Button size="sm" variant="secondary" href={item.url}>
                        باز کردن
                      </Button>
                      <button
                        className="icon-button"
                        aria-label={"حذف " + item.name}
                        onClick={() => {
                          const next = saved.filter(
                            (report) => report.id !== item.id,
                          );
                          if (persist("sanje-saved", next)) {
                            setSaved(next);
                            setNotice("گزارش حذف شد.");
                          } else setNotice("حذف گزارش ذخیره نشد.");
                        }}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
          {page === "settings" && (
            <Settings
              preferences={preferences}
              onSave={(next) => {
                if (!persist("sanje-preferences", next)) {
                  setNotice("ذخیره در مرورگر ممکن نشد.");
                  return false;
                }
                setPreferences(next);
                setNotice("تنظیمات ذخیره شد.");
                return true;
              }}
            />
          )}
          {page === "guide" && (
            <div className="guide-grid">
              {[
                [
                  "dashboard",
                  "از تصویر کلی شروع کنید",
                  "درآمد، خرید و نرخ تبدیل را در دو دوره مقایسه کنید. روی هر کارت بزنید تا روند همان شاخص را ببینید.",
                ],
                [
                  "funnel",
                  "ریزش را پیدا کنید",
                  "قیف را به تفکیک کانال و دستگاه بررسی کنید. روی مرحله‌ها بزنید تا رویدادهای پشت اعداد را ببینید.",
                ],
                [
                  "sessions",
                  "مسیر یک نشست را دنبال کنید",
                  "شناسهٔ هر نشست، مشخصات و ترتیب تعامل‌های آن را در یک پنجره باز می‌کند.",
                ],
                [
                  "saved",
                  "گزارش را برای بعد نگه دارید",
                  "گزارش‌های ذخیره‌شده، فیلترها و عبارت جستجو را نگه می‌دارند. خروجی CSV هم از نتایج همان نما ساخته می‌شود.",
                ],
              ].map(([target, title, text], index) => (
                <a
                  href={reportUrl(target as Page, filters)}
                  className="panel guide-card"
                  key={target}
                >
                  <span className="step-number">{num(index + 1)}</span>
                  <h2>{title}</h2>
                  <p>{text}</p>
                  <span className="text-link">
                    باز کردن {pages[target as Page].title} ←
                  </span>
                </a>
              ))}
            </div>
          )}
          <footer className="workspace-footer">
            <span>سنجه · ساخته‌شده با کاشی</span>
            <span>
              داده‌ها نمونه‌اند؛ تنظیمات و گزارش‌های ذخیره‌شده در همین مرورگر
              نگهداری می‌شوند.
            </span>
            <a href={sanje.home}>معرفی سنجه ↗</a>
          </footer>
        </main>
      </div>
      <Dialog
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="سنجه"
        placement="start"
        size="sm"
      >
        <nav className="mobile-nav">
          {nav([...analyticsPages, ...utilityPages])}
        </nav>
      </Dialog>
      <Dialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="جستجو در سنجه"
        description="نام صفحه یا شناسهٔ نشست را وارد کنید."
        size="md"
      >
        <Input
          autoFocus
          aria-label="جستجوی سراسری"
          placeholder="مثلاً قیف خرید یا SJ-…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          clearable
        />
        <div className="search-results">
          {matchingPages.map((item) => (
            <button
              key={item}
              onClick={() => {
                setSearchOpen(false);
                navigate(reportUrl(item, filters));
              }}
            >
              <Icon name={pages[item].icon} size={18} />
              <span>{pages[item].title}</span>
              <Icon name="arrow-left" size={15} />
            </button>
          ))}
          {matchingSessions.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSearchOpen(false);
                setSession(item);
              }}
            >
              <Icon name="users" size={18} />
              <bdi>{item.id}</bdi>
              <small>{channels[item.channel]}</small>
            </button>
          ))}
          {matchingPages.length + matchingSessions.length === 0 && (
            <p className="empty-search">نتیجه‌ای پیدا نشد.</p>
          )}
        </div>
      </Dialog>
      <Dialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        title="ذخیرهٔ گزارش"
        description="این نما با فیلترهای فعلی در مرورگر ذخیره می‌شود."
        size="sm"
      >
        <form
          className="dialog-form"
          onSubmit={(event) => {
            event.preventDefault();
            saveReport();
          }}
        >
          <Input
            autoFocus
            label="نام گزارش"
            value={reportName}
            maxLength={80}
            required
            onChange={(event) => setReportName(event.target.value)}
          />
          <Button type="submit" disabled={!reportName.trim()}>
            ذخیرهٔ گزارش
          </Button>
        </form>
      </Dialog>
      <Dialog
        open={!!session}
        onOpenChange={(open) => {
          if (!open) setSession(null);
        }}
        title="جزئیات نشست"
        description={session?.id}
        placement="end"
        size="md"
      >
        {session && (
          <div className="session-detail">
            <div className="detail-summary">
              <Badge tone={session.depth === 4 ? "success" : "neutral"}>
                {stages[session.depth - 1]}
              </Badge>
              <strong>
                {num(session.amount)} <small>تومان درآمد</small>
              </strong>
            </div>
            <dl className="detail-grid">
              <div>
                <dt>کانال جذب</dt>
                <dd>{channels[session.channel]}</dd>
              </div>
              <div>
                <dt>دستگاه</dt>
                <dd>{devices[session.device]}</dd>
              </div>
              <div>
                <dt>شهر</dt>
                <dd>{session.city}</dd>
              </div>
              <div>
                <dt>زمان شروع</dt>
                <dd>
                  {num(session.day)} آبان · <bdi>{time(session.minute)}</bdi>
                </dd>
              </div>
            </dl>
            <h3>مسیر این نشست</h3>
            <ol className="session-timeline">
              {stages.map((stage, index) => (
                <li key={stage} data-complete={index < session.depth}>
                  <span>
                    {index < session.depth ? (
                      <Icon name="check" size={15} />
                    ) : (
                      num(index + 1)
                    )}
                  </span>
                  <div>
                    <b>{stage}</b>
                    <small>
                      {index < session.depth
                        ? time(session.minute + index * 2)
                        : "ثبت نشده"}
                    </small>
                  </div>
                </li>
              ))}
            </ol>
            <Button
              variant="secondary"
              onClick={() => {
                navigate(
                  reportUrl("events", {
                    ...initialFilters,
                    days: "30",
                    query: session.id,
                  }),
                );
                setSession(null);
              }}
            >
              رویدادهای این نشست ←
            </Button>
          </div>
        )}
      </Dialog>
      <div
        className="notice"
        role="status"
        aria-live="polite"
        data-visible={!!notice}
      >
        {notice && (
          <>
            <Icon name="info" size={18} />
            <span>{notice}</span>
            <button aria-label="بستن پیام" onClick={() => setNotice("")}>
              <Icon name="close" size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Settings({
  preferences,
  onSave,
}: {
  preferences: Preferences;
  onSave: (next: Preferences) => boolean;
}) {
  const [draft, setDraft] = useState(preferences);
  const [goal, setGoal] = useState(String(preferences.goal));
  const [error, setError] = useState("");
  return (
    <form
      className="settings-layout"
      onSubmit={(event) => {
        event.preventDefault();
        const amount = Number(goal);
        if (
          !draft.name.trim() ||
          !Number.isSafeInteger(amount) ||
          amount <= 0
        ) {
          setError("نام فضای کاری و یک هدف فروش مثبت و معتبر وارد کنید.");
          return;
        }
        if (onSave({ ...draft, name: draft.name.trim(), goal: amount }))
          setError("");
      }}
    >
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>فضای کاری</h2>
            <p>نام فروشگاه و هدف فروش ماهانه</p>
          </div>
          <Icon name="shopping-bag" size={22} />
        </div>
        <div className="settings-fields">
          <Input
            label="نام فضای کاری"
            value={draft.name}
            maxLength={60}
            required
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
          />
          <Input
            label="هدف فروش ماهانه (تومان)"
            type="number"
            min={1}
            step={1}
            required
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            hint="هدف ماهانه با مجموع فروش همهٔ کانال‌ها مقایسه می‌شود."
          />
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>نمایش گزارش‌ها</h2>
            <p>چیدمان جدول‌ها و تعداد نتایج</p>
          </div>
        </div>
        <div className="settings-fields">
          <Select
            label="تعداد نتیجه در هر صفحه"
            value={String(draft.pageSize)}
            onChange={(event) =>
              setDraft({ ...draft, pageSize: Number(event.target.value) })
            }
            options={[12, 24, 48].map((value) => ({
              value: String(value),
              label: num(value) + " نتیجه",
            }))}
          />
          <Switch
            label="جدول فشرده"
            description="ردیف‌های بیشتری در ارتفاع صفحه نمایش داده می‌شوند."
            checked={draft.compact}
            onChange={(event) =>
              setDraft({ ...draft, compact: event.target.checked })
            }
          />
        </div>
      </section>
      <aside className="settings-note">
        <Icon name="info" size={20} />
        <p>
          تنظیمات این محیط در مرورگر شما ذخیره می‌شوند. مجموعه‌دادهٔ نمونه برای
          بررسی طراحی و تعامل گزارش‌ها آماده شده است.
        </p>
      </aside>
      {error && <p role="alert">{error}</p>}
      <div className="settings-actions">
        <Button type="submit">ذخیرهٔ تنظیمات</Button>
        <Button
          variant="tertiary"
          type="button"
          onClick={() => {
            setDraft(defaultPreferences);
            setGoal(String(defaultPreferences.goal));
          }}
        >
          بازگرداندن مقادیر پیش‌فرض
        </Button>
      </div>
    </form>
  );
}

import { useState } from "react";
import {
  Badge,
  Button,
  DataTable,
  Input,
  LineChart,
  Progress,
  Select,
  Sparkline,
  Switch,
} from "@kashi-ui/react";
import { Icon } from "@kashi-ui/icons/react";
import { channels, channelIds, stages, summary, rate, num } from "./reportData";
import {
  data,
  devices,
  downloadCsv,
  reportUrl,
  selectRows,
  type Filters,
  type Page,
  type Preferences,
  type Session,
} from "./model";

const measures = {
  revenue: ["درآمد", "تومان", "credit-card"],
  orders: ["خرید موفق", "خرید", "shopping-bag"],
  visits: ["نشست‌ها", "نشست", "users"],
  conversion: ["نرخ تبدیل", "درصد", "target"],
} as const;
type Measure = keyof typeof measures;
const channelIcons = ['search', 'link', 'users', 'mail'] as const;
const measureKeys = Object.keys(measures) as Measure[];
const valueFor = (result: ReturnType<typeof summary>, key: Measure) =>
  key === "conversion"
    ? result.visits
      ? (100 * result.orders) / result.visits
      : 0
    : result[key];
export const time = (minute: number) =>
  [Math.floor(minute / 60), minute % 60]
    .map((value) => num(value).padStart(2, "۰"))
    .join(":");

type Props = {
  page: Page;
  filters: Filters;
  preferences: Preferences;
  onFilter: (patch: Partial<Filters>) => void;
  onSession: (session: Session) => void;
};

export default function Reports({
  page,
  filters,
  preferences,
  onFilter,
  onSession,
}: Props) {
  const [measure, setMeasure] = useState<Measure>("revenue");
  const [compare, setCompare] = useState(false);
  const [pageNo, setPageNo] = useState(0);
  const rows = selectRows(filters);
  const days = Number(filters.days);
  const total = summary(rows);
  const previous = days <= 14 ? summary(selectRows(filters, true)) : null;
  const dayLabels = Array.from(
    { length: days },
    (_, index) => 31 - days + index,
  );
  const daily = dayLabels.map((day) =>
    summary(rows.filter((row) => row.day === day)),
  );
  const priorRows = selectRows(filters, true);
  const priorDaily = dayLabels.map((day) =>
    summary(priorRows.filter((row) => row.day === day - days)),
  );
  const breakdown = channelIds.map((id) => ({
    id,
    ...summary(rows.filter((row) => row.channel === id)),
  }));
  const ranked = [...breakdown].sort((a, b) => b.revenue - a.revenue);
  const losses = total.counts
    .slice(1)
    .map((count, index) => total.counts[index] - count);
  const lossIndex = losses.indexOf(Math.max(...losses));
  const fmt = (value: number, key: Measure) =>
    num(value) + (key === "conversion" ? "٪" : "");
  const trend = (key: Measure) => daily.map((item) => valueFor(item, key));
  const latest = [...rows].sort((a, b) => b.day - a.day || b.minute - a.minute);
  const query = filters.query.trim().toLocaleLowerCase("fa");
  const visibleSessions = latest.filter((row) =>
    (
      row.id +
      " " +
      row.city +
      " " +
      channels[row.channel] +
      " " +
      devices[row.device]
    )
      .toLocaleLowerCase("fa")
      .includes(query),
  );
  const events = latest
    .flatMap((row) =>
      stages.slice(0, row.depth).map((label, index) => ({
        id: row.id + "-" + index,
        session: row,
        label,
        index,
        minute: row.minute + index * 2,
      })),
    )
    .filter(
      (event) =>
        (filters.stage === "all" || event.index === Number(filters.stage)) &&
        (
          event.session.id +
          " " +
          event.label +
          " " +
          channels[event.session.channel]
        )
          .toLocaleLowerCase("fa")
          .includes(query),
    )
    .sort((a, b) => b.session.day - a.session.day || b.minute - a.minute);
  const count = page === "events" ? events.length : visibleSessions.length;
  const last = Math.max(0, Math.ceil(count / preferences.pageSize) - 1);
  const current = Math.min(pageNo, last);
  const start = current * preferences.pageSize;

  function comparison(key: Measure) {
    if (!previous) return { text: "کل ماه", positive: true };
    const now = valueFor(total, key);
    const before = valueFor(previous, key);
    if (!before) return { text: "بدون مبنای مقایسه", positive: true };
    const delta = now - before;
    return {
      text:
        (delta >= 0 ? "↑ " : "↓ ") +
        (key === "conversion"
          ? num(Math.abs(delta)) + " واحد"
          : rate(Math.abs(delta), before)),
      positive: delta >= 0,
    };
  }

  function exportReport() {
    if (page === "events") {
      downloadCsv("sanje-events", [
        ["نشست", "رویداد", "روز آبان", "ساعت", "کانال"],
        ...events.map((event) => [
          event.session.id,
          event.label,
          event.session.day,
          time(event.minute),
          channels[event.session.channel],
        ]),
      ]);
    } else if (page === "sessions") {
      downloadCsv("sanje-sessions", [
        [
          "نشست",
          "روز آبان",
          "کانال",
          "دستگاه",
          "شهر",
          "آخرین مرحله",
          "درآمد تومان",
        ],
        ...visibleSessions.map((row) => [
          row.id,
          row.day,
          channels[row.channel],
          devices[row.device],
          row.city,
          stages[row.depth - 1],
          row.amount,
        ]),
      ]);
    } else if (page === "channels") {
      downloadCsv("sanje-channels", [
        ["کانال", "نشست", "خرید", "درآمد تومان"],
        ...breakdown.map((row) => [
          channels[row.id],
          row.visits,
          row.orders,
          row.revenue,
        ]),
      ]);
    } else if (page === "funnel") {
      downloadCsv("sanje-funnel", [
        ["مرحله", "نشست"],
        ...stages.map((stage, index) => [stage, total.counts[index]]),
      ]);
    } else {
      downloadCsv("sanje-daily", [
        ["روز آبان", "نشست", "خرید", "درآمد تومان"],
        ...daily.map((row, index) => [
          dayLabels[index],
          row.visits,
          row.orders,
          row.revenue,
        ]),
      ]);
    }
  }

  const exportButton = (
    <Button
      size="sm"
      variant="secondary"
      onClick={exportReport}
      iconStart={<Icon name="download" size={16} />}
    >
      خروجی CSV
    </Button>
  );
  const sessionLink = (row: Session) => (
    <button className="text-button session-link" onClick={() => onSession(row)}>
      <bdi>{row.id}</bdi>
      <Icon name="arrow-up-left" size={14} />
    </button>
  );
  const pager = (
    <div className="table-footer">
      <span role="status">
        {num(count)} {page === "events" ? "رویداد" : "نشست"} · صفحهٔ{" "}
        {num(current + 1)} از {num(last + 1)}
      </span>
      <div>
        <Button
          size="sm"
          variant="secondary"
          disabled={current === 0}
          onClick={() => setPageNo(current - 1)}
        >
          قبلی
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={current >= last}
          onClick={() => setPageNo(current + 1)}
        >
          بعدی
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="report-meta">
        <span>
          <i className="status-dot" /> دادهٔ نمونه · آبان ۱۴۰۵{" "}
          <span className="meta-divider">/</span> {num(rows.length)} نشست در این
          نما
        </span>
        {exportButton}
      </div>
      {page === "dashboard" && (
        <>
          <div
            className="metric-grid"
            role="group"
            aria-label="انتخاب شاخص نمودار"
          >
            {measureKeys.map((key) => {
              const delta = comparison(key);
              return (
                <button
                  className="metric-card"
                  key={key}
                  type="button"
                  aria-pressed={measure === key}
                  onClick={() => setMeasure(key)}
                >
                  <span className="metric-top">
                    <span>{measures[key][0]}</span>
                    <Icon name={measures[key][2]} size={19} />
                  </span>
                  <strong>
                    {fmt(valueFor(total, key), key)}
                    {key === "revenue" && <small>تومان</small>}
                  </strong>
                  <div className="metric-bottom">
                    <span>
                      <b data-positive={delta.positive}>{delta.text}</b>
                      <small>
                        {previous ? "نسبت به دورهٔ قبل" : "دادهٔ دورهٔ انتخابی"}
                      </small>
                    </span>
                    <Sparkline
                      values={trend(key)}
                      area={false}
                      tone={delta.positive ? "brand" : "error"}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="overview-grid">
            <section className="panel trend-panel">
              <div className="panel-header">
                <div>
                  <h2>روند {measures[measure][0]}</h2>
                  <p>
                    از {num(31 - days)} تا ۳۰ آبان · {measures[measure][1]}
                  </p>
                </div>
                <Switch
                  size="sm"
                  label="مقایسه با قبل"
                  checked={compare && !!previous}
                  disabled={!previous}
                  onChange={(event) => setCompare(event.target.checked)}
                />
              </div>
              <LineChart
                title={"روند روزانهٔ " + measures[measure][0]}
                labels={dayLabels.map((day) => num(day))}
                series={[
                  { name: "دورهٔ انتخابی", values: trend(measure) },
                  ...(compare && previous
                    ? [
                        {
                          name: "دورهٔ قبل",
                          values: priorDaily.map((item) =>
                            valueFor(item, measure),
                          ),
                        },
                      ]
                    : []),
                ]}
                format={(value) =>
                  measure === "revenue" && value >= 1000000
                    ? num(value / 1000000) + " م"
                    : fmt(value, measure)
                }
                area={!compare || !previous}
                height="16rem"
              />
              <div className="chart-caption">
                <span>
                  <i /> دورهٔ انتخابی
                </span>
                {compare && previous && (
                  <span>
                    <i className="prior-dot" /> دورهٔ قبل
                  </span>
                )}
                <small>روزهای آبان ۱۴۰۵</small>
              </div>
            </section>
            <section className="panel goal-panel">
              <div className="panel-header">
                <div>
                  <h2>هدف فروش ماهانه</h2>
                  <p>همهٔ کانال‌ها · کل آبان</p>
                </div>
                <a
                  className="icon-link"
                  href="/settings/"
                  aria-label="ویرایش هدف فروش"
                >
                  <Icon name="settings" size={18} />
                </a>
              </div>
              <div className="goal-ring">
                <Progress
                  variant="circular"
                  size="lg"
                  value={summary(data).revenue}
                  max={preferences.goal}
                  aria-label="پیشرفت هدف فروش ماهانه"
                />
                <div>
                  <strong>
                    {rate(summary(data).revenue, preferences.goal)}
                  </strong>
                  <small>از هدف ماهانه</small>
                </div>
              </div>
              <div className="goal-amount">
                <span>فروش ثبت‌شده</span>
                <b>
                  {num(summary(data).revenue)} <small>تومان</small>
                </b>
              </div>
              <div className="goal-amount">
                <span>هدف شما</span>
                <b>
                  {num(preferences.goal)} <small>تومان</small>
                </b>
              </div>
              <p className="goal-note">
                {summary(data).revenue >= preferences.goal
                  ? "هدف این ماه محقق شده است."
                  : num(preferences.goal - summary(data).revenue) +
                    " تومان تا رسیدن به هدف"}
              </p>
            </section>
          </div>
          <div className="overview-lower">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>کانال‌های برتر</h2>
                  <p>سهم از درآمد این بازه</p>
                </div>
                <a className="text-link" href={reportUrl("channels", filters)}>
                  همهٔ کانال‌ها ←
                </a>
              </div>
              <div className="channel-list">
                {ranked.map((row, index) => (
                  <a
                    href={reportUrl("events", {
                      ...filters,
                      channel: row.id,
                      stage: "3",
                      query: "",
                    })}
                    key={row.id}
                  >
                    <span className={"channel-icon channel-" + index}>
                      <Icon
                        name={channelIcons[channelIds.indexOf(row.id)]}
                        size={18}
                      />
                    </span>
                    <div>
                      <div>
                        <b>{channels[row.id]}</b>
                        <span>
                          {num(row.revenue)} <small>تومان</small>
                        </span>
                      </div>
                      <Progress
                        value={row.revenue}
                        max={total.revenue || 1}
                        size="sm"
                        aria-label={"سهم " + channels[row.id]}
                      />
                    </div>
                    <small>{rate(row.revenue, total.revenue)}</small>
                  </a>
                ))}
              </div>
            </section>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>مسیر تبدیل</h2>
                  <p>از بازدید تا پرداخت موفق</p>
                </div>
                <Badge tone="brand">{rate(total.orders, total.visits)}</Badge>
              </div>
              <div className="mini-funnel">
                {stages.map((stage, index) => (
                  <a
                    key={stage}
                    href={reportUrl("events", {
                      ...filters,
                      stage: String(index),
                      query: "",
                    })}
                  >
                    <span>{stage}</span>
                    <i>
                      <b
                        style={{
                          width:
                            total.visits === 0
                              ? "0%"
                              : (100 * total.counts[index]) / total.visits +
                                "%",
                        }}
                      />
                    </i>
                    <strong>{num(total.counts[index])}</strong>
                  </a>
                ))}
              </div>
              <a className="insight-link" href={reportUrl("funnel", filters)}>
                <Icon name="arrow-down" size={17} />
                <span>
                  {num(losses[lossIndex])} نشست بعد از {stages[lossIndex]} متوقف
                  شدند.
                </span>
                <Icon name="arrow-left" size={16} />
              </a>
            </section>
          </div>
          <section className="panel table-panel">
            <div className="panel-header">
              <div>
                <h2>آخرین نشست‌ها</h2>
                <p>برای دیدن مسیر کامل، شناسهٔ نشست را باز کنید.</p>
              </div>
              <a
                className="text-link"
                href={reportUrl("sessions", { ...filters, query: "" })}
              >
                همهٔ نشست‌ها ←
              </a>
            </div>
            <DataTable
              caption="آخرین نشست‌های فروشگاه"
              hideCaption
              rows={latest.slice(0, 5)}
              getRowId={(row) => row.id}
              columns={[
                { key: "id", header: "شناسهٔ نشست", render: sessionLink },
                {
                  key: "channel",
                  header: "کانال",
                  render: (row) => channels[row.channel],
                },
                {
                  key: "device",
                  header: "دستگاه",
                  render: (row) => devices[row.device],
                },
                {
                  key: "depth",
                  header: "آخرین مرحله",
                  render: (row) => (
                    <Badge
                      tone={row.depth === 4 ? "success" : "neutral"}
                      size="sm"
                    >
                      {stages[row.depth - 1]}
                    </Badge>
                  ),
                },
                {
                  key: "amount",
                  header: "درآمد (تومان)",
                  render: (row) => num(row.amount),
                },
              ]}
            />
          </section>
        </>
      )}
      {page === "funnel" && (
        <>
          <div className="summary-strip">
            <div>
              <span>ورودی قیف</span>
              <strong>
                {num(total.visits)} <small>نشست</small>
              </strong>
            </div>
            <div>
              <span>خرید موفق</span>
              <strong>{num(total.orders)}</strong>
            </div>
            <div>
              <span>تبدیل نهایی</span>
              <strong>{rate(total.orders, total.visits)}</strong>
            </div>
            <div>
              <span>درآمد هر نشست</span>
              <strong>
                {num(
                  total.visits ? Math.round(total.revenue / total.visits) : 0,
                )}{" "}
                <small>تومان</small>
              </strong>
            </div>
          </div>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>چهار قدم تا خرید</h2>
                <p>عرض هر مرحله، سهم آن از ورودی قیف را نشان می‌دهد.</p>
              </div>
              <Badge variant="outline">قیف بستهٔ خرید</Badge>
            </div>
            <div className="funnel-stages">
              {stages.map((stage, index) => (
                <div key={stage} className="funnel-stage">
                  <div className="funnel-stage-heading">
                    <span className="step-number">{num(index + 1)}</span>
                    <h3>{stage}</h3>
                    <strong>{num(total.counts[index])}</strong>
                    <small>نشست</small>
                  </div>
                  <a
                    className="funnel-shape"
                    href={reportUrl("events", {
                      ...filters,
                      stage: String(index),
                      query: "",
                    })}
                    aria-label={"مشاهدهٔ رویدادهای " + stage}
                  >
                    <i
                      style={{
                        width:
                          Math.max(
                            3,
                            (100 * total.counts[index]) / (total.visits || 1),
                          ) + "%",
                      }}
                    />
                    <b>{rate(total.counts[index], total.visits)}</b>
                    <span>مشاهدهٔ رویدادها ←</span>
                  </a>
                  <div className="funnel-foot">
                    <span>
                      {index === 0
                        ? "مبنای محاسبهٔ قیف"
                        : rate(total.counts[index], total.counts[index - 1]) +
                          " عبور از مرحلهٔ قبل"}
                    </span>
                    {index > 0 && (
                      <small>{num(losses[index - 1])} نشست ریزش</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="insight-banner">
            <Icon name="funnel" size={24} />
            <div>
              <h2>بیشترین ریزش بعد از «{stages[lossIndex]}»</h2>
              <p>
                {num(losses[lossIndex])} نشست به مرحلهٔ بعد نرسیدند. کانال و
                دستگاه را تغییر دهید تا این الگو را در گروه‌های مختلف مقایسه
                کنید.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              href={reportUrl("sessions", filters)}
            >
              بررسی نشست‌ها
            </Button>
          </section>
        </>
      )}
      {page === "channels" && (
        <>
          <div className="channel-cards">
            {breakdown.map((row, index) => (
              <section className="panel" key={row.id}>
                <span className={"channel-icon channel-" + index}>
                  <Icon
                    name={channelIcons[index]}
                    size={20}
                  />
                </span>
                <h2>{channels[row.id]}</h2>
                <strong>
                  {num(row.revenue)} <small>تومان</small>
                </strong>
                <div>
                  <span>{num(row.visits)} نشست</span>
                  <Badge size="sm" tone="brand">
                    {rate(row.orders, row.visits)} تبدیل
                  </Badge>
                </div>
              </section>
            ))}
          </div>
          <section className="panel table-panel">
            <div className="panel-header">
              <div>
                <h2>مقایسهٔ عملکرد کانال‌ها</h2>
                <p>ستون‌های عددی قابل مرتب‌سازی‌اند.</p>
              </div>
            </div>
            <DataTable
              caption="مقایسهٔ کانال‌ها"
              hideCaption
              rows={breakdown}
              getRowId={(row) => row.id}
              columns={[
                {
                  key: "id",
                  header: "کانال",
                  render: (row) => (
                    <a
                      className="text-link"
                      href={reportUrl("sessions", {
                        ...filters,
                        channel: row.id,
                        query: "",
                      })}
                    >
                      {channels[row.id]} ←
                    </a>
                  ),
                },
                {
                  key: "visits",
                  header: "نشست",
                  sortable: true,
                  render: (row) => num(row.visits),
                },
                {
                  key: "orders",
                  header: "خرید",
                  sortable: true,
                  render: (row) => num(row.orders),
                },
                {
                  key: "conversion",
                  header: "نرخ تبدیل",
                  sortable: true,
                  sortValue: (row) =>
                    row.visits ? row.orders / row.visits : 0,
                  render: (row) => rate(row.orders, row.visits),
                },
                {
                  key: "revenue",
                  header: "درآمد (تومان)",
                  sortable: true,
                  render: (row) => num(row.revenue),
                },
                {
                  key: "average",
                  header: "میانگین خرید",
                  sortable: true,
                  sortValue: (row) =>
                    row.orders ? row.revenue / row.orders : 0,
                  render: (row) =>
                    row.orders
                      ? num(Math.round(row.revenue / row.orders))
                      : "—",
                },
              ]}
            />
          </section>
        </>
      )}
      {(page === "sessions" || page === "events") && (
        <section className="panel table-panel">
          <div className="panel-header">
            <div>
              <h2>{page === "sessions" ? "همهٔ نشست‌ها" : "همهٔ رویدادها"}</h2>
              <p>{num(count)} نتیجه در بازهٔ انتخابی</p>
            </div>
          </div>
          <div className="table-tools">
            <Input
              aria-label="جستجو"
              placeholder={
                page === "sessions"
                  ? "شناسه، شهر یا دستگاه…"
                  : "شناسهٔ نشست یا رویداد…"
              }
              value={filters.query}
              onChange={(event) => {
                onFilter({ query: event.target.value });
                setPageNo(0);
              }}
              clearable
            />
            {page === "events" && (
              <Select
                aria-label="نوع رویداد"
                value={filters.stage}
                onChange={(event) => {
                  onFilter({ stage: event.target.value });
                  setPageNo(0);
                }}
                options={[
                  { value: "all", label: "همهٔ رویدادها" },
                  ...stages.map((stage, index) => ({
                    value: String(index),
                    label: stage,
                  })),
                ]}
              />
            )}
          </div>
          {page === "sessions" ? (
            <DataTable
              caption="نشست‌ها"
              hideCaption
              compact={preferences.compact}
              rows={visibleSessions.slice(start, start + preferences.pageSize)}
              getRowId={(row) => row.id}
              empty="نشستی پیدا نشد؛ جستجو یا فیلترها را تغییر دهید."
              columns={[
                { key: "id", header: "نشست", render: sessionLink },
                {
                  key: "channel",
                  header: "کانال",
                  render: (row) => channels[row.channel],
                },
                {
                  key: "device",
                  header: "دستگاه",
                  render: (row) => devices[row.device],
                },
                { key: "city", header: "شهر" },
                {
                  key: "depth",
                  header: "آخرین مرحله",
                  render: (row) => (
                    <Badge
                      size="sm"
                      tone={row.depth === 4 ? "success" : "neutral"}
                    >
                      {stages[row.depth - 1]}
                    </Badge>
                  ),
                },
                {
                  key: "day",
                  header: "زمان",
                  render: (row) => (
                    <span>
                      {num(row.day)} آبان · <bdi>{time(row.minute)}</bdi>
                    </span>
                  ),
                },
              ]}
            />
          ) : (
            <DataTable
              caption="رویدادها"
              hideCaption
              compact={preferences.compact}
              rows={events.slice(start, start + preferences.pageSize)}
              getRowId={(row) => row.id}
              empty="رویدادی پیدا نشد؛ جستجو یا فیلترها را تغییر دهید."
              columns={[
                {
                  key: "label",
                  header: "رویداد",
                  render: (row) => (
                    <span className="event-name">
                      <i data-success={row.index === 3} />
                      {row.label}
                    </span>
                  ),
                },
                {
                  key: "session",
                  header: "نشست",
                  render: (row) => sessionLink(row.session),
                },
                {
                  key: "channel",
                  header: "کانال",
                  render: (row) => channels[row.session.channel],
                },
                {
                  key: "device",
                  header: "دستگاه",
                  render: (row) => devices[row.session.device],
                },
                {
                  key: "minute",
                  header: "زمان",
                  render: (row) => (
                    <span>
                      {num(row.session.day)} آبان ·{" "}
                      <bdi>{time(row.minute)}</bdi>
                    </span>
                  ),
                },
              ]}
            />
          )}
          {pager}
        </section>
      )}
    </>
  );
}

// English docs: navigation and the component catalogue.
// Component pages themselves are Persian; their live demos, code and prop names are the same in every language.

export const EN_NAV = [
  { title: "Introduction", href: "/en/docs/" },
  { title: "Installation", href: "/en/docs/installation/" },
  { title: "Using Kashi in English", href: "/en/docs/localization/" },
  { title: "Persian & Iranian features", href: "/en/docs/persian/" },
  { title: "Components", href: "/en/docs/components/" },
  { title: "Contributing", href: "/en/docs/contributing/" },
];

type Entry = [slug: string, name: string, text: string];

export const EN_COMPONENTS: { title: string; items: Entry[] }[] = [
  {
    title: "Forms and inputs",
    items: [
      ["form", "Form validation (useForm)", "Values, errors and submit handling with ready rules for Iranian IDs and fa/en messages."],
      ["button", "Button", "Primary, secondary, tertiary and danger buttons with loading and icon variants."],
      ["input", "Input", "Text field with label, hint, error, prefix, suffix, clear and password toggle."],
      ["select", "Select", "Native-feeling select with a custom listbox, search and states."],
      ["checkbox", "Checkbox", "Checkbox with description, indeterminate and read-only states."],
      ["radio", "Radio group", "Single choice as a list or as choice cards."],
      ["switch", "Switch", "On/off toggle for settings."],
      ["combobox", "Combobox", "Searchable select; treats Arabic and Persian letter forms as the same."],
      ["multi-select", "Multi select", "Pick several options with chips and search."],
      ["search-suggest", "Search suggest", "Search field with suggestions, recent searches and loading."],
      ["tag-input", "Tag input", "Type and add tags; submitted as a hidden field."],
      ["file-upload", "File upload", "Drop zone with type and size checks, progress and image resizing."],
      ["rich-text", "Rich text editor", "Light Persian editor: per-paragraph direction, ZWNJ shortcut and sanitized paste."],
      ["slider", "Slider", "Single value or range slider."],
      ["number-input", "Number input", "Spinbutton with thousands separators and Persian digits."],
      ["segmented-control", "Segmented control", "A small set of mutually exclusive options."],
      ["button-group", "Button group", "Related buttons joined into one control."],
      ["chips", "Chips", "Filter and choice chips."],
      ["copy-button", "Copy button", "Copies text with success feedback for screen readers."],
      ["password-strength", "Password strength", "Strength meter with requirement checklist."],
      ["rating", "Rating", "Star rating built on real radio buttons."],
      ["inline-edit", "Inline edit", "Click-to-edit text that saves in place."],
      ["color-picker", "Color picker", "Swatches plus a free color input."],
      ["swatch-group", "Swatch group", "Choose a product color or material."],
    ],
  },
  {
    title: "Data display",
    items: [
      ["table", "Data table", "Sorting, selection, loading, sticky header and virtual scrolling for tens of thousands of rows."],
      ["charts", "Charts", "Bar, line, pie, bar list and sparkline charts that read right to left."],
      ["stat-card", "Stat card", "Metric with trend, for dashboards."],
      ["timeline", "Timeline", "Ordered events with relative time."],
      ["card", "Card", "Container with header, media, body and footer."],
      ["badge", "Badge", "Status and count labels."],
      ["avatar", "Avatar", "Initials or photo with status and groups."],
      ["tree-view", "Tree view", "Nested, keyboard-navigable hierarchy."],
      ["progress", "Progress", "Linear and circular progress."],
      ["meter", "Meter", "A value within a known range, like storage used."],
      ["carousel", "Carousel", "Slides with thumbnails, autoplay and lightbox."],
      ["skeleton", "Skeleton", "Placeholders while content loads."],
      ["empty-state", "Empty state", "Six ready presets (no data, no results, error, offline, no access, done) with sizes."],
      ["divider", "Divider and Kbd", "Separators and keyboard shortcut labels."],
      ["gallery", "Image gallery", "Thumbnail grid with a full-screen lightbox, swipe and zoom."],
      ["qr-code", "QR code", "Dependency-free SVG QR code with Persian text, error levels and a center logo."],
    ],
  },
  {
    title: "Chat and AI",
    items: [
      ["chat", "Chat", "Message bubbles, day dividers and a typing indicator; RTL with auto direction per message."],
      ["chat-composer", "Chat composer", "Auto-growing message box with Enter to send, attachments and a stop button."],
      ["streaming-text", "Streaming text", "Word-by-word text for live AI responses, quiet for screen readers until done."],
      ["code-block", "Code block", "Always-LTR code with language label, copy, line numbers and wrap."],
    ],
  },
  {
    title: "Work and collaboration",
    items: [
      ["kanban", "Kanban", "Drag cards between columns with mouse, touch or keyboard; WIP limits."],
      ["sortable", "Sortable list", "Reorder by dragging or with the keyboard, with announcements."],
      ["scheduler", "Scheduler", "Week and day calendar on the Jalali calendar with overlapping events and a now line."],
      ["notifications", "Notification center", "Bell with unread count and a grouped notification list."],
    ],
  },
  {
    title: "Navigation",
    items: [
      ["navbar", "Navbar", "Top bar with line, pill, centered, floating and transparent models and a mobile drawer menu."],
      ["tabs", "Tabs", "Line, pill and segmented tabs with RTL-aware arrow keys."],
      ["side-nav", "Side nav", "Collapsible sidebar for dashboards."],
      ["breadcrumb", "Breadcrumb", "Path with collapsing for long trails."],
      ["pagination", "Pagination", "Pages, page size and jump to page."],
      ["stepper", "Stepper", "Steps of a multi-step flow."],
      ["command-palette", "Command palette", "Cmd/Ctrl+K search across actions and pages."],
      ["dropdown-menu", "Dropdown menu", "Menus with shortcuts, checkable items and submenus."],
      ["context-menu", "Context menu", "Right-click menu."],
      ["accordion", "Accordion", "Expandable sections on native details."],
      ["splitter", "Splitter", "Resizable panels."],
    ],
  },
  {
    title: "Feedback and overlays",
    items: [
      ["alert", "Alert", "Inline messages in five tones."],
      ["toast", "Toast", "Temporary notifications with promise support."],
      ["banner", "Banner", "Page-wide announcement."],
      ["dialog", "Dialog", "Modal on native dialog with focus trap and exit animation."],
      ["drawer", "Drawer", "Side panel in three sizes for filters, details and settings."],
      ["bottom-sheet", "Bottom sheet", "Mobile sheet with a drag handle, snap points and swipe to close."],
      ["popover", "Popover", "Interactive content next to a trigger."],
      ["tooltip", "Tooltip", "Short hints on hover and keyboard focus."],
      ["tour", "Tour", "Step-by-step product tour."],
    ],
  },
];

export const EN_PERSIAN: { title: string; items: Entry[] }[] = [
  {
    title: "Persian fields",
    items: [
      ["input", "Persian input", "National ID, company ID, mobile (with operator), landline, card, IBAN, money, postal code, time, plate, cheque Sayad ID, economic code, invoice tax ID and text in one component."],
      ["province", "Province select", "All 31 provinces with search by province or city."],
      ["otp", "OTP", "One-time code input with SMS autofill."],
    ],
  },
  {
    title: "Maps and addresses",
    items: [
      ["iran-map", "Iran map", "Interactive map of the 31 provinces; choropleth or picker."],
      ["address", "Address form", "Province, city (1,200+ cities), street, plaque, unit and postal code."],
    ],
  },
  {
    title: "Dates and time (Jalali)",
    items: [
      ["date-picker", "Jalali date picker", "Solar Hijri calendar with holidays, accurate from 1300 to 1500."],
      ["time-picker", "Time picker", "24-hour clock face beside the date picker: type the time or pick the hour, then the minute."],
      ["date-range", "Date range", "Start and end dates with Persian shortcuts."],
      ["month-picker", "Month picker", "Choose a Jalali month and year."],
      ["appointment", "Appointment picker", "Days and time slots with capacity."],
      ["business-hours", "Business hours", "Weekly opening hours, Saturday to Friday, with several ranges a day and an open-now status."],
      ["date-tile", "Date tile", "Calendar-page style date."],
      ["countdown", "Countdown", "Days, hours, minutes and seconds left."],
      ["activity-heatmap", "Activity heatmap", "GitHub-style year view on the Jalali calendar."],
    ],
  },
  {
    title: "Banking and money",
    items: [
      ["money", "Money", "Toman/Rial amounts, compact form and amount in words."],
      ["price-range", "Price range", "Min/max price filter."],
      ["bank-card", "Bank card", "Card with the issuing bank's color and logo."],
      ["receipt", "Payment receipt", "Transaction receipt with reference numbers."],
      ["bank-logos", "Bank logos", "Logos of 40+ Iranian banks and payment gateways."],
    ],
  },
  {
    title: "Persian text",
    items: [
      ["text-fix", "Text fix", "Fixes Arabic ي/ك, half-spaces and text typed on the wrong keyboard layout."],
      ["utilities", "Utilities", "Framework-free functions: Jalali dates, digits, validation, money and time."],
    ],
  },
];

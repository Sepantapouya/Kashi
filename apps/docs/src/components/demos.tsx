// نمونه‌هایی که JSX را به‌عنوان prop می‌دهند باید در فایل React باشند؛
// در MDX، JSX داخل prop به عنصر React تبدیل نمی‌شود.
import { Alert, Button, Input } from "@kashi-ui/react";
import { ArrowIcon, MailIcon, PlusIcon, SearchIcon, TrashIcon } from "./icons";

export const ButtonIcons = () => (
  <>
    <Button variant="primary" iconStart={<PlusIcon />}>پروژهٔ جدید</Button>
    <Button iconEnd={<ArrowIcon />}>ادامه</Button>
    <Button iconOnly aria-label="جستجو"><SearchIcon /></Button>
    <Button variant="danger-secondary" iconOnly aria-label="حذف"><TrashIcon /></Button>
  </>
);

export const InputAddons = () => (
  <>
    <Input label="ایمیل" type="email" placeholder="you@example.com" addonStart={<MailIcon />} />
    <Input label="مبلغ" inputMode="numeric" placeholder="۰" addonEnd="تومان" />
    <Input aria-label="جستجو" placeholder="جستجو…" addonStart={<SearchIcon />} size="sm" />
  </>
);

export const AlertActions = () => (
  <Alert
    tone="info"
    title="به‌روزرسانی در دسترس است"
    actions={<><Button variant="link">به‌روزرسانی</Button><Button variant="link">بعداً</Button></>}
    onClose={() => {}}
  >
    نسخهٔ جدید بهبودهای امنیتی دارد.
  </Alert>
);

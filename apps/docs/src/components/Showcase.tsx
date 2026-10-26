// نمونهٔ ترکیبی صفحهٔ اصلی — کاملاً با کامپوننت‌های واقعی @kashi-ui/react
import {
  Alert, Avatar, AvatarGroup, Badge, Button, Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle, Checkbox, Input, Switch,
} from "@kashi-ui/react";
import { MailIcon } from "./icons";

export default function Showcase() {
  return (
    <div className="showcase__grid">
      <Card className="showcase__signup">
        <CardHeader>
          <CardTitle as="h3">ساخت حساب کاربری</CardTitle>
          <CardDescription>کمتر از یک دقیقه طول می‌کشد.</CardDescription>
        </CardHeader>
        <CardBody className="sc-stack">
          <Input label="نام" placeholder="مثلاً سارا احمدی" />
          <Input label="ایمیل" type="email" placeholder="you@example.com" addonStart={<MailIcon />} hint="هیچ‌وقت ایمیل تبلیغاتی نمی‌فرستیم." />
          <Checkbox label="قوانین و حریم خصوصی را می‌پذیرم" defaultChecked />
        </CardBody>
        <CardFooter>
          <Button variant="tertiary">ورود</Button>
          <Button variant="primary">ثبت‌نام</Button>
        </CardFooter>
      </Card>

      <div className="sc-stack">
        <Card>
          <CardHeader>
            <CardTitle as="h3">اعلان‌ها</CardTitle>
          </CardHeader>
          <CardBody className="sc-stack">
            <Switch label="خلاصهٔ هفتگی" description="گزارش فعالیت‌ها هر شنبه" defaultChecked />
            <Switch label="پیام‌های مستقیم" defaultChecked />
            <Switch label="پیشنهادهای ویژه" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="sc-team">
            <div>
              <p className="sc-team__title">تیم طراحی</p>
              <div className="sc-row">
                <Badge tone="success" dot>فعال</Badge>
                <Badge tone="brand">۱۲ پروژه</Badge>
              </div>
            </div>
            <AvatarGroup max={3} size="sm" aria-label="اعضای تیم طراحی">
              <Avatar size="sm" name="سارا احمدی" brand />
              <Avatar size="sm" name="علی رضایی" />
              <Avatar size="sm" name="مریم کریمی" brand />
              <Avatar size="sm" name="رضا نوری" />
              <Avatar size="sm" name="نگار صادقی" />
            </AvatarGroup>
          </CardBody>
        </Card>
        <Alert tone="success" title="تغییرات ذخیره شد">نسخهٔ جدید برای همهٔ اعضا قابل‌مشاهده است.</Alert>
      </div>
    </div>
  );
}

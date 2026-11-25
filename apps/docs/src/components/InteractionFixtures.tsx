// نمونه‌های ثابت برای تست تعامل (tests/interaction): صفحه‌کلید، تلهٔ فوکوس و بازگشت فوکوس.
// متن‌ها و گزینه‌ها عمداً ساده و پایدارند تا تست به محتوای مستندات وابسته نباشد. در فهرست سایت نیست.
import { useState } from "react";
import {
  Accordion, AccordionItem, Button, Combobox, Dialog, Drawer, DropdownMenu, Input, MenuItem,
  Radio, RadioGroup, Select, Tab, TabList, TabPanel, Tabs,
  ChatComposer, Gallery, Kanban, Scheduler, SortableList, type KanbanColumn,
} from "@kashi-ui/react";

const CITIES = [
  { value: "tehran", label: "تهران" },
  { value: "tabriz", label: "تبریز" },
  { value: "shiraz", label: "شیراز" },
  { value: "mashhad", label: "مشهد" },
];

export default function InteractionFixtures() {
  const [dialog, setDialog] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [city, setCity] = useState<string | null>(null);
  const [picked, setPicked] = useState("");
  const [order, setOrder] = useState([{ id: "a", t: "الف" }, { id: "b", t: "ب" }, { id: "c", t: "پ" }]);
  const [cols, setCols] = useState<KanbanColumn<{ id: string; t: string }>[]>([
    { id: "todo", title: "انجام", items: [{ id: "k1", t: "کارت یک" }] },
    { id: "done", title: "تمام", items: [] },
  ]);
  const [sent, setSent] = useState("");
  const [slot, setSlot] = useState("");

  return (
    <main style={{ display: "grid", gap: "32px", padding: "24px", maxInlineSize: "40rem" }}>
      <section data-fixture="sortable">
        <SortableList aria-label="ترتیب" items={order} getId={(x) => x.id} getLabel={(x) => x.t} onReorder={setOrder} />
        <output id="sortable-value">{order.map((x) => x.id).join("")}</output>
      </section>
      <section data-fixture="kanban">
        <Kanban columns={cols} onChange={setCols} getId={(x) => x.id} getLabel={(x) => x.t} />
        <output id="kanban-value">{cols.map((c) => c.items.map((x) => x.id).join(",")).join("|")}</output>
      </section>
      <section data-fixture="composer">
        <ChatComposer onSend={({ text }) => setSent(text)} />
        <output id="composer-value">{sent}</output>
      </section>
      <section data-fixture="gallery">
        <Gallery images={[{ src: "/demo/tile-1.svg", alt: "یک" }, { src: "/demo/tile-2.svg", alt: "دو" }]} />
      </section>
      <section data-fixture="scheduler">
        <Scheduler events={[]} date={new Date(2026, 10, 7)} now={new Date(2026, 10, 7, 9)} startHour={8} endHour={10} onSlotClick={(d) => setSlot(`${d.getDate()}-${d.getHours()}:${d.getMinutes()}`)} />
        <output id="scheduler-value">{slot}</output>
      </section>
      <section data-fixture="dialog">
        <Button id="dialog-trigger" onClick={() => setDialog(true)}>باز کردن پنجره</Button>
        <button type="button" id="outside">دکمهٔ بیرون</button>
        <Dialog
          open={dialog}
          onOpenChange={setDialog}
          title="حذف فایل"
          description="این کار برگشت‌پذیر نیست."
          footer={<><Button onClick={() => setDialog(false)}>انصراف</Button><Button variant="primary" onClick={() => setDialog(false)}>حذف</Button></>}
        >
          <Input label="نام فایل" defaultValue="گزارش" />
        </Dialog>
      </section>

      <section data-fixture="drawer">
        <Button id="drawer-trigger" onClick={() => setDrawer(true)}>فیلترها</Button>
        <Drawer open={drawer} onOpenChange={setDrawer} title="فیلترها" footer={<Button onClick={() => setDrawer(false)}>اعمال</Button>}>
          <Input label="جستجو" />
        </Drawer>
      </section>

      <section data-fixture="combobox">
        <Combobox label="شهر" options={CITIES} value={city} onChange={setCity} placeholder="انتخاب شهر" />
        <output id="combobox-value">{city ?? ""}</output>
      </section>

      <section data-fixture="select">
        <Select label="مرتب‌سازی" options={[{ value: "new", label: "جدیدترین" }, { value: "cheap", label: "ارزان‌ترین" }, { value: "popular", label: "پربازدیدترین" }]} defaultValue="new" />
      </section>

      <section data-fixture="tabs">
        <Tabs defaultValue="a">
          <TabList aria-label="بخش‌ها">
            <Tab value="a">مشخصات</Tab>
            <Tab value="b">نظرها</Tab>
            <Tab value="c">پرسش‌ها</Tab>
          </TabList>
          <TabPanel value="a">پنل مشخصات</TabPanel>
          <TabPanel value="b">پنل نظرها</TabPanel>
          <TabPanel value="c">پنل پرسش‌ها</TabPanel>
        </Tabs>
      </section>

      <section data-fixture="radio">
        <RadioGroup label="ارسال" defaultValue="post">
          <Radio value="post" label="پست" />
          <Radio value="courier" label="پیک" />
          <Radio value="pickup" label="تحویل حضوری" />
        </RadioGroup>
      </section>

      <section data-fixture="menu">
        <DropdownMenu trigger={<Button>گزینه‌ها</Button>} label="گزینه‌ها">
          <MenuItem onSelect={() => setPicked("edit")}>ویرایش</MenuItem>
          <MenuItem onSelect={() => setPicked("copy")}>رونوشت</MenuItem>
          <MenuItem onSelect={() => setPicked("delete")} tone="danger">حذف</MenuItem>
        </DropdownMenu>
        <output id="menu-value">{picked}</output>
      </section>

      <section data-fixture="accordion">
        <Accordion type="single">
          <AccordionItem title="ارسال چقدر طول می‌کشد؟">دو تا چهار روز کاری.</AccordionItem>
          <AccordionItem title="امکان مرجوعی هست؟">تا هفت روز.</AccordionItem>
        </Accordion>
      </section>
    </main>
  );
}

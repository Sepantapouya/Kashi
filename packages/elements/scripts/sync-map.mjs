// دادهٔ مرز استان‌ها یک منبع دارد (packages/react)؛ پیش از ساخت اینجا کپی می‌شود تا دو نسخه از هم جدا نشوند.
import { copyFileSync } from "node:fs";
copyFileSync("../react/src/iranMapData.ts", "src/iranMapData.ts");

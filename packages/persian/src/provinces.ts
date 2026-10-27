/** استان‌های ایران با مرکز استان و پیش‌شمارهٔ تلفن ثابت */
export interface Province {
  name: string;
  capital: string;
  /** پیش‌شمارهٔ تلفن ثابت بدون صفر */
  areaCode: string;
}

export const PROVINCES: Province[] = [
  { name: "آذربایجان شرقی", capital: "تبریز", areaCode: "41" },
  { name: "آذربایجان غربی", capital: "ارومیه", areaCode: "44" },
  { name: "اردبیل", capital: "اردبیل", areaCode: "45" },
  { name: "اصفهان", capital: "اصفهان", areaCode: "31" },
  { name: "البرز", capital: "کرج", areaCode: "26" },
  { name: "ایلام", capital: "ایلام", areaCode: "84" },
  { name: "بوشهر", capital: "بوشهر", areaCode: "77" },
  { name: "تهران", capital: "تهران", areaCode: "21" },
  { name: "چهارمحال و بختیاری", capital: "شهرکرد", areaCode: "38" },
  { name: "خراسان جنوبی", capital: "بیرجند", areaCode: "56" },
  { name: "خراسان رضوی", capital: "مشهد", areaCode: "51" },
  { name: "خراسان شمالی", capital: "بجنورد", areaCode: "58" },
  { name: "خوزستان", capital: "اهواز", areaCode: "61" },
  { name: "زنجان", capital: "زنجان", areaCode: "24" },
  { name: "سمنان", capital: "سمنان", areaCode: "23" },
  { name: "سیستان و بلوچستان", capital: "زاهدان", areaCode: "54" },
  { name: "فارس", capital: "شیراز", areaCode: "71" },
  { name: "قزوین", capital: "قزوین", areaCode: "28" },
  { name: "قم", capital: "قم", areaCode: "25" },
  { name: "کردستان", capital: "سنندج", areaCode: "87" },
  { name: "کرمان", capital: "کرمان", areaCode: "34" },
  { name: "کرمانشاه", capital: "کرمانشاه", areaCode: "83" },
  { name: "کهگیلویه و بویراحمد", capital: "یاسوج", areaCode: "74" },
  { name: "گلستان", capital: "گرگان", areaCode: "17" },
  { name: "گیلان", capital: "رشت", areaCode: "13" },
  { name: "لرستان", capital: "خرم‌آباد", areaCode: "66" },
  { name: "مازندران", capital: "ساری", areaCode: "11" },
  { name: "مرکزی", capital: "اراک", areaCode: "86" },
  { name: "هرمزگان", capital: "بندرعباس", areaCode: "76" },
  { name: "همدان", capital: "همدان", areaCode: "81" },
  { name: "یزد", capital: "یزد", areaCode: "35" },
];

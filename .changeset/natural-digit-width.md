---
"@kashi-ui/css": patch
---

Persian digits use their natural width everywhere: the Iran map legend, Money, BankCard number and PaymentReceipt no longer force `tabular-nums`, which spread Persian digits apart. `.k-tabular` stays available as an opt-in.

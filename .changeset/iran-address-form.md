---
"@kashi-ui/persian": minor
"@kashi-ui/react": minor
"@kashi-ui/css": minor
---

Iranian address form. `AddressForm` puts province, a city from that province, street, plaque, unit and a validated 10-digit postal code in one fieldset, with an optional Iran map for picking the province and `name` support for plain HTML forms (`shipping[province]` …). `CitySelect` searches 1,278 cities from Wikidata (CC0), fills the province when a city is picked first, ignores spaces and half-spaces in search, and accepts a city that is not in the list. `@kashi-ui/persian` adds `CITIES`, `getCities`, `getCityProvinces`, `formatAddress` and the `IranAddress` type. Fields no longer overflow narrow grid columns.

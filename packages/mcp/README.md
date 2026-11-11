# @kashi-ui/mcp

سرور [MCP](https://modelcontextprotocol.io) کاشی: Claude، Cursor، Copilot و دیگر دستیارهای هوش مصنوعی را مستقیم به مستندات کامپوننت‌ها، ۷۳۹۳ آیکون، توکن‌ها و ابزارهای فارسی [کاشی](https://kashi.sepantapouya.com) وصل می‌کند تا کد را از روی prop های واقعی بنویسند، نه از روی حدس.

راهنمای کامل: [kashi.sepantapouya.com/docs/ai](https://kashi.sepantapouya.com/docs/ai/)

## نصب

Claude Code:

```bash
claude mcp add kashi -- npx -y @kashi-ui/mcp
```

Cursor (`.cursor/mcp.json`)، Claude Desktop و Windsurf:

```json
{ "mcpServers": { "kashi": { "command": "npx", "args": ["-y", "@kashi-ui/mcp"] } } }
```

VS Code (`.vscode/mcp.json`):

```json
{ "servers": { "kashi": { "command": "npx", "args": ["-y", "@kashi-ui/mcp"] } } }
```

## ابزارها

| ابزار | کار |
|---|---|
| `kashi_get_docs` | مستندات کامل یک کامپوننت: prop ها، نمونهٔ React و HTML، متغیرهای CSS و دسترس‌پذیری |
| `kashi_search_docs` | جستجوی فارسی و انگلیسی در مستندات |
| `kashi_list_docs` | فهرست همهٔ صفحه‌ها |
| `kashi_search_icons` | جستجو بین ۷۳۹۳ آیکون |
| `kashi_get_icon` | کد React یا SVG یک آیکون در هر شش سبک |
| `kashi_get_tokens` | توکن‌های طراحی و متغیرهای تم |
| `kashi_create_theme` | CSS تم برند از یک رنگ |
| `kashi_persian` | کد ملی، شبا، کارت، موبایل، تبدیل تاریخ شمسی، عدد به حروف |

همهٔ صفحه‌ها به شکل resource هم در دسترس‌اند: `kashi://docs/{slug}`.

سرور روی کامپیوتر خودتان اجرا می‌شود، کلید API لازم ندارد و همهٔ مستندات داخل پکیج است.

لایسنس MIT · ساخته‌شده توسط [سپنتا پویا](https://sepantapouya.com)

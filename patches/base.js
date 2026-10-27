import { jsx as _jsx, jsxs as _jsxs } from "@kitajs/html/jsx-runtime";
export const BaseHtml = ({ children, title = "Conversor de Mídia Local", webroot = "", }) => (_jsxs("html", { lang: "pt-BR", children: [_jsxs("head", { children: [
    _jsx("meta", { charset: "UTF-8" }),
    _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
    _jsx("meta", { name: "webroot", content: webroot }),
    _jsx("title", { safe: true, children: title }),
    _jsx("link", { rel: "stylesheet", href: `${webroot}/generated.css` }),
    _jsx("link", { rel: "stylesheet", href: `${webroot}/cozy.css` }),
    _jsx("link", { rel: "apple-touch-icon", sizes: "180x180", href: `${webroot}/apple-touch-icon.png` }),
    _jsx("link", { rel: "icon", type: "image/png", sizes: "32x32", href: `${webroot}/favicon-32x32.png` }),
    _jsx("link", { rel: "icon", type: "image/png", sizes: "16x16", href: `${webroot}/favicon-16x16.png` })
] }), _jsxs("body", { class: "flex min-h-screen w-full flex-col text-neutral-200", children: [
    children,
    _jsx("footer", { class: "w-full mt-auto py-6", children: _jsxs("div", { class: "text-center text-xs text-neutral-500 flex items-center justify-center gap-2", children: [
        _jsx("span", { children: "✨ Conversor de Arquivos 100% Local" }),
        _jsx("span", { children: "•" }),
        _jsx("span", { children: "Privado e Ilimitado" })
    ] }) })
] })] }));

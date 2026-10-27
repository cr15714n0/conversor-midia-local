import { jsx as _jsx, jsxs as _jsxs } from "@kitajs/html/jsx-runtime";
export const Header = ({ loggedIn, accountRegistration, allowUnauthenticated, hideHistory, webroot = "", branding = "Conversor Local", }) => {
    return (_jsx("header", { class: "w-full p-4 sm:p-6", children: 
        _jsxs("nav", { class: "mx-auto flex max-w-4xl items-center justify-between", children: [
            _jsx("ul", { class: "flex items-center gap-3", children: [
                _jsx("li", { children: 
                    _jsxs("a", { href: `${webroot}/`, class: "flex items-center gap-2.5 text-white font-extrabold text-lg sm:text-xl tracking-tight transition-transform hover:scale-105", children: [
                        _jsx("span", { class: "flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30 text-sm", children: "✨" }),
                        _jsx("span", { children: "Conversor de Mídia" })
                    ] })
                })
            ] }),
            _jsxs("ul", { class: "flex items-center gap-4 text-sm font-medium", children: [
                _jsx("li", { children: 
                    _jsx("a", { class: "text-neutral-400 hover:text-amber-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5", href: `${webroot}/history`, children: "Histórico" })
                }),
                _jsx("li", { children: 
                    _jsx("a", { class: "text-amber-400/90 hover:text-amber-300 font-semibold text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20", href: `${webroot}/`, children: "Offline • Seguro" })
                })
            ] })
        ] })
    }));
};

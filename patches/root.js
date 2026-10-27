import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "@kitajs/html/jsx-runtime";
import { randomInt } from "node:crypto";
import { Elysia, t } from "elysia";
import { BaseHtml } from "../components/base";
import { Header } from "../components/header";
import db from "../db/db";
import { User } from "../db/types";
import { ACCOUNT_REGISTRATION, ALLOW_UNAUTHENTICATED, HIDE_HISTORY, HTTP_ALLOWED, UNAUTHENTICATED_USER_SHARING, WEBROOT, BRANDING, } from "../helpers/env";
import { FIRST_RUN, userService } from "./user";

export const root = new Elysia().use(userService).get("/", async ({ jwt, redirect, cookie: { auth, jobId } }) => {
    if (!ALLOW_UNAUTHENTICATED) {
        if (FIRST_RUN) {
            return redirect(`${WEBROOT}/setup`, 302);
        }
        if (!auth?.value) {
            return redirect(`${WEBROOT}/login`, 302);
        }
    }
    // validate jwt
    let user = false;
    if (ALLOW_UNAUTHENTICATED) {
        const newUserId = String(UNAUTHENTICATED_USER_SHARING
            ? 0
            : randomInt(2 ** 24, Math.min(2 ** 48 + 2 ** 24 - 1, Number.MAX_SAFE_INTEGER)));
        const accessToken = await jwt.sign({
            id: newUserId,
        });
        user = { id: newUserId };
        if (!auth) {
            return {
                message: "No auth cookie, perhaps your browser is blocking cookies.",
            };
        }
        auth.set({
            value: accessToken,
            httpOnly: true,
            secure: !HTTP_ALLOWED,
            maxAge: 24 * 60 * 60,
            sameSite: "strict",
        });
    }
    else if (auth?.value) {
        user = await jwt.verify(auth.value);
        if (user !== false &&
            user.id &&
            (Number.parseInt(user.id) < 2 ** 24 || !ALLOW_UNAUTHENTICATED)) {
            const existingUser = db.query("SELECT * FROM users WHERE id = ?").as(User).get(user.id);
            if (!existingUser) {
                if (auth?.value) {
                    auth.remove();
                }
                return redirect(`${WEBROOT}/login`, 302);
            }
        }
    }
    if (!user) {
        return redirect(`${WEBROOT}/login`, 302);
    }
    // create a new job
    db.query("INSERT INTO jobs (user_id, date_created) VALUES (?, ?)").run(user.id, new Date().toISOString());
    const { id } = db
        .query("SELECT id FROM jobs WHERE user_id = ? ORDER BY id DESC")
        .get(user.id);
    if (!jobId) {
        return { message: "Cookies should be enabled to use this app." };
    }
    jobId.set({
        value: id,
        httpOnly: true,
        secure: !HTTP_ALLOWED,
        maxAge: 24 * 60 * 60,
        sameSite: "strict",
    });

    return (_jsx(BaseHtml, { webroot: WEBROOT, children: _jsxs(_Fragment, { children: [
        _jsx(Header, { webroot: WEBROOT, branding: BRANDING, accountRegistration: ACCOUNT_REGISTRATION, allowUnauthenticated: ALLOW_UNAUTHENTICATED, hideHistory: HIDE_HISTORY, loggedIn: true }),
        _jsxs("main", { class: "w-full max-w-4xl mx-auto flex-1 px-4 py-4 sm:py-6", children: [
            // Hero section
            _jsxs("div", { class: "text-center mb-8", children: [
                _jsx("h1", { class: "text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3", children: "Transforme seus Vídeos e Imagens" }),
                _jsx("p", { class: "text-neutral-400 text-sm sm:text-base max-w-xl mx-auto", children: "Conversão local rápida, segura e sem anúncios. Seus arquivos nunca saem do seu computador." })
            ] }),

            // Card principal
            _jsxs("article", { class: "article", children: [
                // Dropzone
                _jsxs("div", { id: "dropzone", class: "relative flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-amber-500/30 rounded-2xl hover:border-amber-400 transition-all cursor-pointer bg-white/[0.02]", children: [
                    _jsx("div", { class: "w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-2xl mb-4 shadow-lg shadow-amber-500/10", children: "📁" }),
                    _jsx("p", { class: "text-base sm:text-lg font-bold text-white mb-1", children: "Arraste e solte seus arquivos aqui" }),
                    _jsx("p", { class: "text-xs sm:text-sm text-neutral-400 mb-4", children: "ou clique em qualquer lugar para selecionar do computador" }),
                    _jsxs("div", { class: "flex flex-wrap justify-center gap-2 text-xs", children: [
                        _jsx("span", { class: "px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300", children: "🎬 MP4, MOV, MKV, WebM" }),
                        _jsx("span", { class: "px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300", children: "🖼️ PNG, JPG, WebP, SVG, HEIC" }),
                        _jsx("span", { class: "px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300", children: "🎵 MP3, WAV, AAC" })
                    ] }),
                    _jsx("input", { type: "file", name: "file", multiple: true, class: "absolute inset-0 size-full cursor-pointer opacity-0" })
                ] }),

                // Tabela de arquivos selecionados
                _jsx("div", { class: "mt-6 overflow-hidden", children: 
                    _jsx("table", { id: "file-list", class: "w-full text-left" })
                })
            ] }),

            // Formulário de formato e conversão
            _jsxs("form", { method: "post", action: `${WEBROOT}/convert`, class: "relative w-full max-w-4xl mx-auto", children: [
                _jsx("input", { type: "hidden", name: "file_names", id: "file_names" }),
                _jsxs("article", { class: "article", children: [
                    _jsxs("div", { class: "flex items-center gap-2 mb-4", children: [
                        _jsx("span", { class: "text-xl", children: "🎯" }),
                        _jsx("h2", { class: "text-lg font-bold text-white", children: "Formato de Destino" })
                    ] }),
                    _jsx("div", { class: "select_container", children: 
                        _jsx("p", { class: "text-neutral-400 text-sm italic py-4 text-center", children: "Selecione ou arraste um arquivo acima para carregar os formatos compatíveis." })
                    })
                ] }),
                _jsx("input", { class: "w-full btn-primary cursor-pointer mt-2 text-center", type: "submit", value: "🚀 Iniciar Conversão", disabled: true })
            ] })
        ] }),
        _jsx("script", { src: "script.js", defer: true })
    ] }) }));
}, {
    cookie: t.Cookie({
        auth: t.Optional(t.String()),
        jobId: t.Optional(t.String()),
    }),
});

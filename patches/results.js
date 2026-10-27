import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "@kitajs/html/jsx-runtime";
import { Elysia } from "elysia";
import { BaseHtml } from "../components/base";
import { Header } from "../components/header";
import db from "../db/db";
import { Filename, Jobs } from "../db/types";
import { buildDownloadUrl } from "../helpers/buildDownloadUrl";
import { ALLOW_UNAUTHENTICATED, WEBROOT, BRANDING } from "../helpers/env";
import { DownloadIcon } from "../icons/download";
import { DeleteIcon } from "../icons/delete";
import { EyeIcon } from "../icons/eye";
import { userService } from "./user";

function ResultsArticle({ job, files, outputPath }) {
    const isJobPending = job.status !== "completed" || files.some(f => {
        return !["Done", "Failed, check logs", "File type not supported"].includes(f.status) && !f.status.startsWith("Done") && !f.status.startsWith("Failed");
    });

    return (_jsxs("article", { class: "article", "data-job-pending": isJobPending ? "true" : "false", children: [
        _jsxs("div", { class: "mb-4 flex items-center justify-between", children: [
            _jsx("h1", { class: "text-xl font-bold text-white", children: "Resultados da Conversão" }),
            _jsxs("div", { class: "flex flex-row gap-4", children: [
                _jsx("form", { action: `${WEBROOT}/delete/${job.id}`, method: "POST", children: 
                    _jsxs("button", { type: "submit", class: "flex btn-secondary flex-row gap-2 text-contrast", children: [
                        _jsx(DeleteIcon, {}), " ", _jsx("p", { children: "Excluir" })
                    ] })
                }),
                _jsxs("a", { href: `${WEBROOT}/archive/${job.id}`, download: `converted_files_${job.id}.tar`, class: "flex btn-primary flex-row gap-2 text-contrast", children: [
                    _jsx(DownloadIcon, {}), " ", _jsx("p", { children: "Baixar Todos (Tar)" })
                ] }),
                _jsxs("button", { class: "flex btn-primary flex-row gap-2 text-contrast", onclick: "downloadAll()", children: [
                    _jsx(DownloadIcon, {}), " ", _jsx("p", { children: "Baixar Todos" })
                ] })
            ] })
        ] }),
        _jsx("progress", { max: job.num_files, ...(isJobPending ? {} : { value: job.num_files }), class: `
          mb-4 inline-block h-2 w-full appearance-none overflow-hidden rounded-full border-0
          bg-neutral-700 bg-none text-accent-500 accent-accent-500
          [&::-moz-progress-bar]:bg-accent-500
          [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:[background:none]
          [&[value]::-webkit-progress-value]:bg-accent-500
          [&[value]::-webkit-progress-value]:transition-[inline-size]
        ` }),
        _jsxs("table", { class: `
          w-full table-auto rounded-sm bg-neutral-900 text-left
          [&_td]:p-4
          [&_tr]:rounded-sm [&_tr]:border-b [&_tr]:border-neutral-800
        `, children: [
            _jsx("thead", { children: _jsxs("tr", { children: [
                _jsx("th", { class: "p-3 sm:px-4 text-neutral-300 font-semibold", children: "Nome do Arquivo" }),
                _jsx("th", { class: "p-3 sm:px-4 text-neutral-300 font-semibold min-w-[220px]", children: "Progresso / Status" }),
                _jsx("th", { class: "p-3 sm:px-4 text-neutral-300 font-semibold", children: "Ações" })
            ] }) }),
            _jsx("tbody", { children: files.map((file) => {
                const isDone = file.status === "Done" || file.status?.startsWith("Done");
                const conversionFailed = ["Failed, check logs", "File type not supported"].includes(file.status) || file.status?.startsWith("Failed") || file.status?.startsWith("Falhou");
                const isConverting = !isDone && !conversionFailed;

                // Extract percentage if present
                const pctMatch = file.status.match(/(\d+)%/);
                const percent = pctMatch ? parseInt(pctMatch[1], 10) : (isDone ? 100 : 5);

                return (_jsxs("tr", { children: [
                    _jsx("td", { safe: true, class: "max-w-[20vw] truncate font-medium text-white", children: file.output_file_name }),
                    _jsx("td", { children: isDone ? (
                        _jsxs("div", { class: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800", children: [
                            _jsx("span", { children: "✔" }),
                            _jsx("span", { children: "Concluído (100%)" })
                        ] })
                    ) : conversionFailed ? (
                        _jsx("span", { class: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-800", children: "Falha na conversão" })
                    ) : (
                        _jsxs("div", { class: "flex flex-col gap-1.5 min-w-[180px] max-w-[280px]", children: [
                            _jsxs("div", { class: "flex justify-between text-xs font-medium", children: [
                                _jsx("span", { class: "text-neutral-300 animate-pulse", children: "Convertendo..." }),
                                _jsxs("span", { class: "text-emerald-400 font-bold", children: [percent, "%"] })
                            ] }),
                            _jsx("div", { class: "w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden border border-neutral-700", children: [
                                _jsx("div", { class: "bg-emerald-500 h-2.5 rounded-full transition-all duration-300", style: `width: ${percent}%;` })
                            ] }),
                            _jsx("div", { safe: true, class: "text-[11px] text-neutral-400 truncate", children: file.status })
                        ] })
                    ) }),
                    _jsx("td", { class: "flex flex-row items-center gap-4", children: isDone ? (
                        _jsxs(_Fragment, { children: [
                            _jsx("a", { class: "text-accent-500 underline hover:text-accent-400", href: buildDownloadUrl(WEBROOT, outputPath, file.output_file_name), title: "Visualizar", children: _jsx(EyeIcon, {}) }),
                            _jsx("a", { class: "text-accent-500 underline hover:text-accent-400", href: buildDownloadUrl(WEBROOT, outputPath, file.output_file_name), download: file.output_file_name, title: "Baixar", children: _jsx(DownloadIcon, {}) })
                        ] })
                    ) : isConverting ? (
                        _jsx("span", { class: "text-xs text-neutral-500 italic animate-pulse", children: "Processando..." })
                    ) : (
                        _jsx("span", { class: "text-xs text-neutral-500", children: "Indisponível" })
                    ) })
                ] }));
            }) })
        ] })
    ] }));
}

export const results = new Elysia()
    .use(userService)
    .get("/results/:jobId", async ({ params, set, cookie: { job_id }, user }) => {
    if (job_id?.value) {
        job_id.remove();
    }
    const job = db
        .query("SELECT * FROM jobs WHERE user_id = ? AND id = ?")
        .as(Jobs)
        .get(user.id, params.jobId);
    if (!job) {
        set.status = 404;
        return {
            message: "Job not found.",
        };
    }
    const outputPath = `${user.id}/${params.jobId}/`;
    const files = db
        .query("SELECT * FROM file_names WHERE job_id = ?")
        .as(Filename)
        .all(params.jobId);
    return (_jsx(BaseHtml, { webroot: WEBROOT, title: "ConvertX | Result", children: _jsxs(_Fragment, { children: [
        _jsx(Header, { webroot: WEBROOT, allowUnauthenticated: ALLOW_UNAUTHENTICATED, loggedIn: true, branding: BRANDING }),
        _jsx("main", { class: "w-full flex-1 px-2 sm:px-4", children: _jsx(ResultsArticle, { job: job, files: files, outputPath: outputPath }) }),
        _jsx("script", { src: `${WEBROOT}/results.js`, defer: true })
    ] }) }));
}, { auth: true })
    .post("/progress/:jobId", async ({ set, params, cookie: { job_id }, user }) => {
    if (job_id?.value) {
        job_id.remove();
    }
    const job = db
        .query("SELECT * FROM jobs WHERE user_id = ? AND id = ?")
        .as(Jobs)
        .get(user.id, params.jobId);
    if (!job) {
        set.status = 404;
        return {
            message: "Job not found.",
        };
    }
    const outputPath = `${user.id}/${params.jobId}/`;
    const files = db
        .query("SELECT * FROM file_names WHERE job_id = ?")
        .as(Filename)
        .all(params.jobId);
    return _jsx(ResultsArticle, { job: job, files: files, outputPath: outputPath });
}, { auth: true });

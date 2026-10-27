import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "@kitajs/html/jsx-runtime";
import Elysia, { t } from "elysia";
import { getPossibleTargets } from "../converters/main";
import { userService } from "./user";

const VIDEO_EXTS = new Set(["mp4", "mov", "mkv", "webm", "avi", "flv", "m4v", "wmv", "3gp", "ts", "ogv", "vob"]);
const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "tiff", "tif", "ico", "heic", "heif", "avif"]);
const AUDIO_EXTS = new Set(["mp3", "wav", "flac", "ogg", "m4a", "aac", "opus", "wma", "aiff"]);
const DOCUMENT_EXTS = new Set(["pdf", "docx", "doc", "txt", "md", "epub", "html", "rtf", "odt"]);

export const chooseConverter = new Elysia().use(userService).post("/conversions", ({ body }) => {
    const rawExt = (body.fileType || "").toLowerCase().trim();
    let sections = [];

    if (VIDEO_EXTS.has(rawExt)) {
        sections = [
            {
                title: "🎬 Converter para Vídeo",
                items: [
                    { target: "mp4", converter: "ffmpeg", label: "MP4", badge: "Mais Recomendado" },
                    { target: "webm", converter: "ffmpeg", label: "WebM", badge: "Leve p/ Web" },
                    { target: "mkv", converter: "ffmpeg", label: "MKV", badge: "Alta Definição" },
                    { target: "avi", converter: "ffmpeg", label: "AVI", badge: "" },
                    { target: "mov", converter: "ffmpeg", label: "MOV", badge: "Apple" },
                    { target: "gif", converter: "ffmpeg", label: "GIF Animado", badge: "Sem som" }
                ]
            },
            {
                title: "🎵 Ou Extrair Somente o Áudio",
                items: [
                    { target: "mp3", converter: "ffmpeg", label: "MP3", badge: "Universal" },
                    { target: "wav", converter: "ffmpeg", label: "WAV", badge: "Sem perdas" },
                    { target: "m4a", converter: "ffmpeg", label: "M4A", badge: "Apple" },
                    { target: "aac", converter: "ffmpeg", label: "AAC", badge: "" }
                ]
            }
        ];
    } else if (IMAGE_EXTS.has(rawExt)) {
        sections = [
            {
                title: "🖼️ Converter para Imagem",
                items: [
                    { target: "webp", converter: "ffmpeg", label: "WebP", badge: "Mais Leve & Rápido" },
                    { target: "png", converter: "imagemagick", label: "PNG", badge: "Sem Perdas (Transparência)" },
                    { target: "jpg", converter: "imagemagick", label: "JPG / JPEG", badge: "Padrão de Fotos" },
                    { target: "svg", converter: "vtracer", label: "SVG", badge: "Vetorizar" },
                    { target: "ico", converter: "imagemagick", label: "ICO", badge: "Ícone" },
                    { target: "pdf", converter: "imagemagick", label: "PDF", badge: "Documento" },
                    { target: "gif", converter: "imagemagick", label: "GIF", badge: "" },
                    { target: "bmp", converter: "imagemagick", label: "BMP", badge: "" },
                    { target: "tiff", converter: "imagemagick", label: "TIFF", badge: "Impressão" }
                ]
            }
        ];
    } else if (AUDIO_EXTS.has(rawExt)) {
        sections = [
            {
                title: "🎵 Converter para Áudio",
                items: [
                    { target: "mp3", converter: "ffmpeg", label: "MP3", badge: "Recomendado" },
                    { target: "wav", converter: "ffmpeg", label: "WAV", badge: "Sem Perdas" },
                    { target: "flac", converter: "ffmpeg", label: "FLAC", badge: "Alta Fidelidade" },
                    { target: "m4a", converter: "ffmpeg", label: "M4A", badge: "Apple" },
                    { target: "aac", converter: "ffmpeg", label: "AAC", badge: "" },
                    { target: "ogg", converter: "ffmpeg", label: "OGG", badge: "" }
                ]
            }
        ];
    } else if (DOCUMENT_EXTS.has(rawExt)) {
        sections = [
            {
                title: "📄 Converter para Documento",
                items: [
                    { target: "pdf", converter: "libreoffice", label: "PDF", badge: "Recomendado" },
                    { target: "docx", converter: "pandoc", label: "DOCX", badge: "Word" },
                    { target: "txt", converter: "pandoc", label: "TXT", badge: "Texto Puro" },
                    { target: "epub", converter: "calibre", label: "EPUB", badge: "Livro Digital" }
                ]
            }
        ];
    } else {
        // Fallback: Group targets cleanly
        const rawTargets = getPossibleTargets(rawExt);
        const allItems = [];
        for (const [converter, targets] of Object.entries(rawTargets)) {
            for (const t of targets) {
                allItems.push({ target: t, converter: converter, label: t.toUpperCase(), badge: "" });
            }
        }
        sections = [
            {
                title: "Formatos Disponíveis",
                items: allItems.slice(0, 16)
            }
        ];
    }

    // Build select options
    const allItems = sections.flatMap(s => s.items);

    return (_jsxs("div", { class: "w-full flex flex-col gap-5 my-2 animate-fadeIn", children: [
        sections.map((section) => (_jsxs("div", { class: "cozy-format-section", children: [
            _jsx("div", { class: "cozy-category-title", children: section.title }),
            _jsx("div", { class: "cozy-pills-grid", children: section.items.map((item) => (
                _jsxs("button", {
                    type: "button",
                    tabindex: 0,
                    class: "cozy-pill target group",
                    "data-value": `${item.target},${item.converter}`,
                    "data-target": item.target,
                    "data-converter": item.converter,
                    children: [
                        _jsx("span", { children: item.label }),
                        item.badge ? _jsx("span", { class: "cozy-badge-rec", children: item.badge }) : null
                    ]
                })
            )) })
        ] }))),
        _jsxs("select", { name: "convert_to", "aria-label": "Convert to", required: true, hidden: true, children: [
            _jsx("option", { selected: true, disabled: true, value: "", children: "Selecione o formato" }),
            allItems.map((item) => (
                _jsx("option", { value: `${item.target},${item.converter}`, children: item.target })
            ))
        ] })
    ] }));
}, { body: t.Object({ fileType: t.String() }) });

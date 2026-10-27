import { spawn, spawnSync, execFile as execFileOriginal } from "node:child_process";
import db from "../db/db";

const FFMPEG_MAX_BUFFER = 1024 * 1024 * 64; // 64 MB

export const properties = {
    from: {
        muxer: [
            "264", "265", "266", "302", "3dostr", "3g2", "3gp", "4xm", "669",
            "722", "aa", "aa3", "aac", "aax", "ac3", "ac4", "ace", "acm",
            "act", "adf", "adp", "ads", "adx", "aea", "afc", "aiff", "aix",
            "al", "alaw", "alias_pix", "alp", "alsa", "amf", "amr", "amrnb",
            "amrwb", "ams", "anm", "ans", "apc", "ape", "apl", "apm", "apng",
            "aptx", "aptxhd", "aqt", "aqtitle", "argo_asf", "argo_brp", "art",
            "asc", "asf", "asf_o", "ass", "ast", "au", "av1", "avc", "avi",
            "avif", "avr", "avs", "avs2", "avs3", "awb", "bcstm", "bethsoftvid",
            "bfi", "bfstm", "bin", "bink", "binka", "bit", "bitpacked", "bmv",
            "bmp", "bonk", "boa", "brender_pix", "brstm", "c2", "c93", "caf",
            "cavsvideo", "cdata", "cdg", "cdxl", "cgi", "cif", "cine", "codec2",
            "codec2raw", "concat", "cri", "dash", "dat", "data", "daud", "dav",
            "dbm", "dcstr", "dds", "derf", "dfpwm", "dfa", "dhav", "dif",
            "digi", "dirac", "diz", "dmf", "dnxhd", "dpx_pipe", "dsf", "dsicin",
            "dsm", "dss", "dtk", "dtm", "dts", "dtshd", "dv", "dvbsub",
            "dvbtxt", "dxa", "ea", "eac3", "ea_cdata", "epaf", "exr_pipe",
            "f32be", "f32le", "ec3", "evc", "f4v", "f64be", "f64le", "fap",
            "far", "fbdev", "ffmetadata", "filmstrip", "film_cpk", "fits",
            "flac", "flic", "flm", "flv", "frm", "fsb", "fwse", "g722",
            "g723_1", "g726", "g726le", "g729", "gdm", "gdv", "genh", "gif",
            "gsm", "gxf", "h261", "h263", "h264", "h265", "h266", "h26l",
            "hca", "hcom", "hevc", "hls", "hnm", "ice", "ico", "idcin",
            "idf", "idx", "iec61883", "iff", "ifv", "ilbc", "image2", "imf",
            "imx", "ingenient", "ipmovie", "ipu", "ircam", "ism", "isma",
            "ismv", "iss", "it", "iv8", "ivf", "ivr", "j2b", "j2k", "jack",
            "jacosub", "jv", "kux", "kvag", "laf", "latm", "live_flv", "lmlm4",
            "loas", "lrc", "lvf", "m4a", "m4b", "m4v", "mac", "mca", "mcc",
            "mgsts", "microdvd", "mjpeg", "mjpeg_2000", "mjpg", "mkv", "mlp",
            "mm", "mmf", "mods", "moflex", "mov", "mp2", "mp3", "mp4", "mpa",
            "mpc", "mpc8", "mpeg", "mpegts", "mpegtsraw", "mpegvideo", "mpjpeg",
            "mpl2", "mpsub", "msf", "msnwctcp", "mspf", "mtaf", "mtv", "musx",
            "mv", "mvi", "mxf", "mxf_opatom", "mxg", "nc", "nsv", "nut", "nuv",
            "obu", "oga", "ogg", "ogv", "oma", "opus", "paf", "pam_pipe",
            "pbm_pipe", "pcx_pipe", "pgm_pipe", "pgmyuv_pipe", "phm_pipe",
            "pictor", "pjs", "pmp", "png_pipe", "ppm_pipe", "psxstr", "pva",
            "pvf", "qcp", "qdraw", "qoi_pipe", "r3d", "rawvideo", "realtext",
            "redspark", "rl2", "rm", "roq", "rpl", "rsd", "rso", "rtp", "rtsp",
            "s16be", "s16le", "s24be", "s24le", "s32be", "s32le", "s337m",
            "s8", "sami", "sap", "sbc", "sbg", "scc", "scd", "sdp", "sdr2",
            "sds", "sdx", "segafilm", "ser", "sga", "shorten", "siff",
            "simbiosis_imx", "sln", "smacker", "smjpeg", "smk", "smush", "sol",
            "sox", "spdif", "spx", "srt", "stl", "subviewer", "subviewer1",
            "sunrast_pipe", "sup", "svag", "svg_pipe", "svs", "swf", "tak",
            "tedcaptions", "thp", "tiertexseq", "tiff_pipe", "tmv", "truehd",
            "tta", "ttml", "tty", "txd", "ty", "u16be", "u16le", "u24be",
            "u24le", "u32be", "u32le", "u8", "v210", "v210x", "vag", "vc1",
            "vc1test", "vividas", "vivo", "vmd", "vob", "vobsub", "voc",
            "vpk", "vplayer", "vqf", "vtt", "w64", "wav", "webm", "webp_pipe",
            "webvtt", "wsaud", "wsd", "wsvqa", "wtv", "wv", "wve", "xa",
            "xbin", "xbm_pipe", "xmv", "xpm_pipe", "xvag", "xwd_pipe", "xwma",
            "y4m", "yop", "yuv4mpegpipe"
        ],
    },
    to: {
        muxer: [
            "264", "265", "266", "302", "3g2", "3gp", "a64", "aac", "ac3",
            "ac4", "adts", "adx", "afc", "aif", "aifc", "aiff", "al", "amr",
            "amv", "apm", "apng", "aptx", "aptxhd", "asf", "ass", "ast", "au",
            "aud", "av1.mkv", "av1.mp4", "avi", "avif", "avs", "avs2", "avs3",
            "bit", "bmp", "c2", "caf", "cavs", "chk", "cpk", "cvg", "dfpwm",
            "dnxhd", "dnxhr", "dpx", "drc", "dts", "dv", "dvd", "eac3", "ec3",
            "evc", "exr", "f4v", "ffmeta", "fits", "flac", "flm", "flv", "g722",
            "gif", "gsm", "gxf", "h261", "h263", "h264.mkv", "h264.mp4",
            "h265.mkv", "h265.mp4", "h266.mkv", "hdr", "hevc", "ico", "im1",
            "im24", "im8", "ircam", "isma", "ismv", "ivf", "j2c", "j2k", "jls",
            "jp2", "jpeg", "jpg", "js", "jss", "jxl", "latm", "lbc", "ljpg",
            "loas", "lrc", "m1v", "m2a", "m2t", "m2ts", "m2v", "m3u8", "m4a",
            "m4b", "m4v", "mjpeg", "mjpg", "mka", "mkv", "mlp", "mmf", "mov",
            "mp2", "mp3", "mp4", "mpa", "mpd", "mpeg", "mpg", "msbc", "mts",
            "mxf", "nut", "obu", "oga", "ogg", "ogv", "oma", "opus", "pam",
            "pbm", "pcm", "pcx", "pfm", "pgm", "pgmyuv", "phm", "pix", "png",
            "ppm", "psp", "qoi", "ra", "ras", "rco", "rcv", "rgb", "rm", "roq",
            "rs", "rso", "sb", "sbc", "scc", "sf", "sgi", "sox", "spdif",
            "spx", "srt", "ssa", "sub", "sun", "sunras", "sup", "sw", "swf",
            "tco", "tga", "thd", "tif", "tiff", "ts", "tta", "ttml", "tun",
            "ub", "ul", "uw", "vag", "vbn", "vc1", "vc2", "vob", "voc", "vtt",
            "vvc", "w64", "wav", "wbmp", "webm", "webp", "wma", "wmv", "wtv",
            "wv", "xbm", "xface", "xml", "xwd", "y", "y4m", "yuv"
        ],
    },
};

export async function convert(filePath, fileType, convertTo, targetPath, options = {}) {
    let extraArgs = [];
    let message = "Done";
    if (convertTo === "ico") {
        extraArgs = [
            "-filter:v",
            "scale='min(256,iw)':min'(256,ih)':force_original_aspect_ratio=decrease",
        ];
        message = "Done: resized to 256x256";
    }
    if (convertTo.split(".").length > 1) {
        const split = convertTo.split(".");
        const codec_short = split[0];
        switch (codec_short) {
            case "av1":
                extraArgs.push("-c:v", "libaom-av1");
                break;
            case "h264":
                extraArgs.push("-c:v", "libx264");
                break;
            case "h265":
                extraArgs.push("-c:v", "libx265");
                break;
            case "h266":
                extraArgs.push("-c:v", "libx266");
                break;
        }
    }

    const ffmpegArgs = process.env.FFMPEG_ARGS ? process.env.FFMPEG_ARGS.split(/\s+/) : [];
    const ffmpegOutputArgs = process.env.FFMPEG_OUTPUT_ARGS
        ? process.env.FFMPEG_OUTPUT_ARGS.split(/\s+/)
        : ["-preset", "veryfast"];

    // Probe total duration of video
    let totalDuration = 0;
    try {
        const probe = spawnSync("ffprobe", [
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            filePath
        ]);
        totalDuration = parseFloat(probe.stdout?.toString()?.trim() || "0") || 0;
    } catch (e) {
        totalDuration = 0;
    }

    return new Promise((resolve, reject) => {
        const fullArgs = [
            ...ffmpegArgs,
            "-progress", "pipe:1",
            "-nostats",
            "-i", filePath,
            ...ffmpegOutputArgs,
            ...extraArgs,
            "-y",
            targetPath
        ];

        const child = spawn("ffmpeg", fullArgs);
        let lastUpdate = 0;
        let stderrBuf = "";

        child.stdout.on("data", (chunk) => {
            const text = chunk.toString();
            const matchTime = text.match(/out_time_us=(\d+)/);
            const matchSpeed = text.match(/speed=\s*([0-9.]+x)/);
            if (matchTime && totalDuration > 0) {
                const outTimeSec = parseInt(matchTime[1], 10) / 1000000;
                const percent = Math.min(99, Math.round((outTimeSec / totalDuration) * 100));
                const speedStr = matchSpeed ? matchSpeed[1] : "";
                const now = Date.now();
                if (now - lastUpdate > 400 && options.jobId && options.fileName) {
                    lastUpdate = now;
                    const spdNum = parseFloat(speedStr) || 1;
                    const eta = Math.max(0, Math.round((totalDuration - outTimeSec) / spdNum));
                    const statusMsg = `${percent}% (${speedStr}${eta > 0 ? ` • ~${eta}s rest.` : ""})`;
                    try {
                        db.query("UPDATE file_names SET status = ?1 WHERE job_id = ?2 AND file_name = ?3")
                          .run(statusMsg, options.jobId, options.fileName);
                    } catch (err) {}
                }
            }
        });

        child.stderr.on("data", (chunk) => {
            stderrBuf += chunk.toString();
            if (stderrBuf.length > 50000) {
                stderrBuf = stderrBuf.slice(-20000);
            }
        });

        child.on("error", (err) => {
            reject(`error: ${err}`);
        });

        child.on("close", (code) => {
            if (code === 0) {
                resolve(message);
            } else {
                console.error("FFmpeg error:", stderrBuf);
                reject(`ffmpeg exited with code ${code}`);
            }
        });
    });
}

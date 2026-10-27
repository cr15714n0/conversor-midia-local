import db from "../db/db";
import fs from "node:fs";
import path from "node:path";
import { MAX_CONVERT_PROCESS } from "../helpers/env";
import { normalizeFiletype, normalizeOutputFiletype } from "../helpers/normalizeFiletype";
import { convert as convertassimp, properties as propertiesassimp } from "./assimp";
import { convert as convertCalibre, properties as propertiesCalibre } from "./calibre";
import { convert as convertDasel, properties as propertiesDasel } from "./dasel";
import { convert as convertDvisvgm, properties as propertiesDvisvgm } from "./dvisvgm";
import { convert as convertFFmpeg, properties as propertiesFFmpeg } from "./ffmpeg";
import { convert as convertGraphicsmagick, properties as propertiesGraphicsmagick, } from "./graphicsmagick";
import { convert as convertImagemagick, properties as propertiesImagemagick } from "./imagemagick";
import { convert as convertInkscape, properties as propertiesInkscape } from "./inkscape";
import { convert as convertLibheif, properties as propertiesLibheif } from "./libheif";
import { convert as convertLibjxl, properties as propertiesLibjxl } from "./libjxl";
import { convert as convertLibreOffice, properties as propertiesLibreOffice } from "./libreoffice";
import { convert as convertMsgconvert, properties as propertiesMsgconvert } from "./msgconvert";
import { convert as convertPandoc, properties as propertiesPandoc } from "./pandoc";
import { convert as convertPdftops, properties as propertiesPdftops } from "./pdftops";
import { convert as convertPotrace, properties as propertiesPotrace } from "./potrace";
import { convert as convertresvg, properties as propertiesresvg } from "./resvg";
import { convert as convertImage, properties as propertiesImage } from "./vips";
import { convert as convertVtracer, properties as propertiesVtracer } from "./vtracer";
import { convert as convertVcf, properties as propertiesVcf } from "./vcf";
import { convert as convertxelatex, properties as propertiesxelatex } from "./xelatex";
import { convert as convertMarkitdown, properties as propertiesMarkitdown } from "./markitdown";
// This should probably be reconstructed so that the functions are not imported instead the functions hook into this to make the converters more modular
const properties = {
    ffmpeg: {
        properties: propertiesFFmpeg,
        converter: convertFFmpeg,
    },
    // Prioritize Inkscape for EMF files as it handles them better than ImageMagick
    inkscape: {
        properties: propertiesInkscape,
        converter: convertInkscape,
    },
    libjxl: {
        properties: propertiesLibjxl,
        converter: convertLibjxl,
    },
    resvg: {
        properties: propertiesresvg,
        converter: convertresvg,
    },
    vips: {
        properties: propertiesImage,
        converter: convertImage,
    },
    libheif: {
        properties: propertiesLibheif,
        converter: convertLibheif,
    },
    xelatex: {
        properties: propertiesxelatex,
        converter: convertxelatex,
    },
    calibre: {
        properties: propertiesCalibre,
        converter: convertCalibre,
    },
    dasel: {
        properties: propertiesDasel,
        converter: convertDasel,
    },
    libreoffice: {
        properties: propertiesLibreOffice,
        converter: convertLibreOffice,
    },
    pandoc: {
        properties: propertiesPandoc,
        converter: convertPandoc,
    },
    msgconvert: {
        properties: propertiesMsgconvert,
        converter: convertMsgconvert,
    },
    dvisvgm: {
        properties: propertiesDvisvgm,
        converter: convertDvisvgm,
    },
    imagemagick: {
        properties: propertiesImagemagick,
        converter: convertImagemagick,
    },
    graphicsmagick: {
        properties: propertiesGraphicsmagick,
        converter: convertGraphicsmagick,
    },
    assimp: {
        properties: propertiesassimp,
        converter: convertassimp,
    },
    potrace: {
        properties: propertiesPotrace,
        converter: convertPotrace,
    },
    vtracer: {
        properties: propertiesVtracer,
        converter: convertVtracer,
    },
    vcf: {
        properties: propertiesVcf,
        converter: convertVcf,
    },
    markitDown: {
        properties: propertiesMarkitdown,
        converter: convertMarkitdown,
    },
    pdftops: {
        properties: propertiesPdftops,
        converter: convertPdftops,
    },
};
function chunks(arr, size) {
    if (size <= 0) {
        return [arr];
    }
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
}
export async function handleConvert(fileNames, userUploadsDir, userOutputDir, convertTo, converterName, jobId) {
    const queryInsert = db.query("INSERT INTO file_names (job_id, file_name, output_file_name, status) VALUES (?1, ?2, ?3, ?4)");
    const queryUpdate = db.query("UPDATE file_names SET status = ?1 WHERE job_id = ?2 AND file_name = ?3");

    // Pre-populate files immediately so the user sees progress bars right away
    for (const fileName of fileNames) {
        const fileTypeOrig = fileName.includes(".") ? (fileName.split(".").pop() ?? "") : "";
        const newFileExt = normalizeOutputFiletype(convertTo);
        let newFileName;
        if (fileTypeOrig === "") {
            newFileName = `${fileName}.${newFileExt}`;
        } else {
            newFileName = fileName.replace(new RegExp(`${fileTypeOrig}(?!.*${fileTypeOrig})`), newFileExt);
        }
        if (jobId.value) {
            queryInsert.run(jobId.value, fileName, newFileName, "0% (iniciando...)");
        }
    }

    for (const chunk of chunks(fileNames, MAX_CONVERT_PROCESS)) {
        const toProcess = [];
        for (const fileName of chunk) {
            const filePath = `${userUploadsDir}${fileName}`;
            const fileTypeOrig = fileName.includes(".") ? (fileName.split(".").pop() ?? "") : "";
            const fileType = normalizeFiletype(fileTypeOrig);
            const newFileExt = normalizeOutputFiletype(convertTo);
            let newFileName;
            if (fileTypeOrig === "") {
                newFileName = `${fileName}.${newFileExt}`;
            } else {
                newFileName = fileName.replace(new RegExp(`${fileTypeOrig}(?!.*${fileTypeOrig})`), newFileExt);
            }
            const targetPath = `${userOutputDir}${newFileName}`;
            toProcess.push(new Promise((resolve, reject) => {
                mainConverter(filePath, fileType, convertTo, targetPath, { jobId: jobId.value, fileName, newFileName }, converterName)
                    .then((r) => {
                        if (jobId.value) {
                            queryUpdate.run(r, jobId.value, fileName);
                        }
                        resolve(r);
                    })
                    .catch((c) => {
                        if (jobId.value) {
                            queryUpdate.run("Failed, check logs", jobId.value, fileName);
                        }
                        reject(c);
                    });
            }));
        }
        await Promise.all(toProcess);
    }
}
async function mainConverter(inputFilePath, fileTypeOriginal, convertTo, targetPath, options, converterName) {
    const fileType = normalizeFiletype(fileTypeOriginal);
    let converterFunc;
    if (converterName) {
        converterFunc = properties[converterName]?.converter;
    }
    else {
        // Iterate over each converter in properties
        for (converterName in properties) {
            const converterObj = properties[converterName];
            if (!converterObj) {
                break;
            }
            for (const key in converterObj.properties.from) {
                if (converterObj?.properties?.from[key]?.includes(fileType) &&
                    converterObj?.properties?.to[key]?.includes(convertTo)) {
                    converterFunc = converterObj.converter;
                    break;
                }
            }
        }
    }
    if (!converterFunc) {
        console.log(`No available converter supports converting from ${fileType} to ${convertTo}.`);
        return "File type not supported";
    }
    try {
        const result = await converterFunc(inputFilePath, fileType, convertTo, targetPath, options);
        console.log(`Converted ${inputFilePath} from ${fileType} to ${convertTo} successfully using ${converterName}.`, result);
        if (typeof result === "string") {
            return result;
        }
        return "Done";
    }
    catch (error) {
        console.error(`Failed to convert ${inputFilePath} from ${fileType} to ${convertTo} using ${converterName}.`, error);
        return "Failed, check logs";
    }
}
const possibleTargets = {};
for (const converterName in properties) {
    const converterProperties = properties[converterName]?.properties;
    if (!converterProperties)
        continue;
    for (const key in converterProperties.from) {
        const fromList = converterProperties.from[key];
        const toList = converterProperties.to[key];
        if (!fromList || !toList)
            continue;
        for (const ext of fromList) {
            if (!possibleTargets[ext])
                possibleTargets[ext] = {};
            possibleTargets[ext][converterName] = toList;
        }
    }
}
export const getPossibleTargets = (from) => {
    const fromClean = normalizeFiletype(from);
    return possibleTargets[fromClean] || {};
};
const possibleInputs = [];
for (const converterName in properties) {
    const converterProperties = properties[converterName]?.properties;
    if (!converterProperties) {
        continue;
    }
    for (const key in converterProperties.from) {
        for (const extension of converterProperties.from[key] ?? []) {
            if (!possibleInputs.includes(extension)) {
                possibleInputs.push(extension);
            }
        }
    }
}
possibleInputs.sort();
const allTargets = {};
for (const converterName in properties) {
    const converterProperties = properties[converterName]?.properties;
    if (!converterProperties) {
        continue;
    }
    for (const key in converterProperties.to) {
        if (allTargets[converterName]) {
            allTargets[converterName].push(...(converterProperties.to[key] || []));
        }
        else {
            allTargets[converterName] = converterProperties.to[key] || [];
        }
    }
}
export const getAllTargets = () => {
    return allTargets;
};
const allInputs = {};
for (const converterName in properties) {
    const converterProperties = properties[converterName]?.properties;
    if (!converterProperties) {
        continue;
    }
    for (const key in converterProperties.from) {
        if (allInputs[converterName]) {
            allInputs[converterName].push(...(converterProperties.from[key] || []));
        }
        else {
            allInputs[converterName] = converterProperties.from[key] || [];
        }
    }
}
export const getAllInputs = (converter) => {
    return allInputs[converter] || [];
};
/**
 * @internal For testing only. Do not use in production.
 * Tests need direct access to cover all branches of converter discovery and chunking logic.
 */
export { chunks, mainConverter };

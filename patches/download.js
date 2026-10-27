import path from "node:path";
import { Elysia } from "elysia";
import sanitize from "sanitize-filename";
import * as tar from "tar";
import { outputDir } from "..";
import db from "../db/db";
import { WEBROOT } from "../helpers/env";
import { userService } from "./user";

export const download = new Elysia()
    .use(userService)
    .get("/download/:userId/:jobId/:fileName", async ({ params, redirect, set }) => {
    const userId = params.userId || "0";
    const jobId = decodeURIComponent(params.jobId);
    const fileName = sanitize(decodeURIComponent(params.fileName));
    const filePath = `${outputDir}${userId}/${jobId}/${fileName}`;
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
        set.status = 404;
        return { message: "Converted file not found." };
    }
    return file;
})
    .get("/archive/:jobId", async ({ params, set }) => {
    const userId = "0";
    const jobId = decodeURIComponent(params.jobId);
    const outputPath = `${outputDir}${userId}/${jobId}`;
    const outputTar = path.join(outputPath, `converted_files_${jobId}.tar`);
    try {
        await tar.create({
            file: outputTar,
            cwd: outputPath,
            filter: (path) => !path.match(".*\\.tar"),
        }, ["."]);
        return Bun.file(outputTar);
    } catch (e) {
        set.status = 404;
        return { message: "Archive could not be created." };
    }
});

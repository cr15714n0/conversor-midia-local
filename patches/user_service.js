import { randomUUID } from "node:crypto";
import { jwt } from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { WEBROOT } from "../helpers/env";

export const userService = new Elysia({ name: "user/service" })
    .use(jwt({
        name: "jwt",
        schema: t.Object({
            id: t.String(),
        }),
        secret: "local-converter-secret-key-987654",
        exp: "365d",
    }))
    .model({
        signIn: t.Object({
            email: t.String(),
            password: t.String(),
        }),
        session: t.Cookie({
            auth: t.Optional(t.String()),
            jobId: t.Optional(t.String()),
        }),
        optionalSession: t.Cookie({
            auth: t.Optional(t.String()),
            jobId: t.Optional(t.String()),
        }),
    })
    .macro("auth", {
        cookie: "optionalSession",
        async resolve() {
            // ZERO LOGIN REQUIRED - ALWAYS AUTHENTICATED LOCALLY
            return {
                success: true,
                user: { id: "0" },
            };
        },
    });

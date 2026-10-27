import { Elysia } from "elysia";
import { WEBROOT } from "../helpers/env";
import { userService } from "../services/user";
export { userService } from "../services/user";

export let FIRST_RUN = false;

export const user = new Elysia()
    .use(userService)
    .get("/setup", ({ redirect }) => redirect(`${WEBROOT}/`, 302))
    .get("/register", ({ redirect }) => redirect(`${WEBROOT}/`, 302))
    .post("/register", ({ redirect }) => redirect(`${WEBROOT}/`, 302))
    .get("/login", ({ redirect }) => redirect(`${WEBROOT}/`, 302))
    .post("/login", ({ redirect }) => redirect(`${WEBROOT}/`, 302))
    .get("/logoff", ({ redirect }) => redirect(`${WEBROOT}/`, 302))
    .get("/account", ({ redirect }) => redirect(`${WEBROOT}/`, 302))
    .post("/account", ({ redirect }) => redirect(`${WEBROOT}/`, 302));

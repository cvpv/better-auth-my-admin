import { BetterAuthClientPlugin } from "better-auth";
import type { myAdminPlugin } from "./server";

export const myAdminClient = () => {
    return {
        id: "my-admin",
        $InferServerPlugin: {} as ReturnType<typeof myAdminPlugin>,
    } satisfies BetterAuthClientPlugin;
};

export const schema = {
    user: {
        fields: {
            banned: {
                type: "boolean",
                required: false,
            },
            banReason: {
                type: "string",
                required: false,
            },
            banExpires: {
                type: "date",
                required: false,
            },
        },
    },
} as const;


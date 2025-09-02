export const ButtonTypes = {
    PRIMARY: "primary",
    SECONDARY: "secondary",
    TERTIARY: "tertiary",
    DANGER: "danger"
} as const;

export type ButtonTypes = typeof ButtonTypes[keyof typeof ButtonTypes];

export type Optional<T extends {}> = {
    [x in keyof T]?: T[x];
};

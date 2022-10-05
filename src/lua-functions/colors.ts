import type { ServerLuaFunction } from 'yues-client';
import type { Color } from '@/@types';
import { func } from './@func';
import { colorFix } from './@color-fix';

const setColorBodyArgs = func(['color'], (ref: string, funcName: string) => `
${colorFix}
${ref}:${funcName}(color)
`);

export const setColor = (ref: string, funcName: string): [
    string,
    string[],
    (func: ServerLuaFunction, color: Color) => Promise<any>
] => [
    ...setColorBodyArgs(ref, funcName),
    (func: ServerLuaFunction, color: Color) => func({
        type: typeof color,
        value: color,
    }),
];

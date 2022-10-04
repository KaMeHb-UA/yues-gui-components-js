import type { ServerLuaFunction } from 'yues-client';
import type { RemoteElement } from '@/components/@element';
import { func } from './@func';
import { checkMethod } from './@check-method';
import { objectGetter } from './@object-getter';
import { idPropName } from '@/components/@symbols';

export const objectSetterOnRef = func(['obj'], (ref: string, funcName: string) => `
${checkMethod(ref, funcName).trim()}
${ref}:${funcName}(obj)
`);

const refSetterOnRefBodyArgs = func(['id'], (ref: string, funcName: string) => `
${checkMethod(ref, funcName).trim()}
${objectGetter('obj', 'id').trim()}
${ref}:${funcName}(obj)
`);

export const refSetterOnRef = (ref: string, funcName: string): [
    string,
    string[],
    (func: ServerLuaFunction, element: RemoteElement) => Promise<void>,
] => [
    ...refSetterOnRefBodyArgs(ref, funcName),
    (func: ServerLuaFunction, element: RemoteElement) => func(element[idPropName]),
];

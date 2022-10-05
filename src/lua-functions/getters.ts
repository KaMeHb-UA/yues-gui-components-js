import type { ServerLuaFunction } from 'yues-client';
import { LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME } from '@/constants';
import { ActiveRemoteElementsStorage } from '@/components/@element';
import { func } from './@func';
import { checkMethod } from './@check-method';
import { objectGetter } from './@object-getter';

const getterBody = (ref: string, funcName: string) => `
${checkMethod(ref, funcName).trim()}
${objectGetter('obj', 'id').trim()}
local res = ${ref}:${funcName}(obj)
`.trim();

const arrGetterBody = (ref: string, funcName: string) => `
${checkMethod(ref, funcName).trim()}
local res = {}
for k, v in pairs(${ref}:${funcName}(...)) do
    res[k] = ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(v)
end
return res
`.trim();

export const objectGetterOnRef = func(['id'], (ref: string, funcName: string) => `
${getterBody(ref, funcName)}
return res
`);

const refGetterBodyArgs = func(['id'], (ref: string, funcName: string) => `
${getterBody(ref, funcName)}
return ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(res)
`);

export const refGetterOnRef = (ref: string, funcName: string): [
    string,
    string[],
    (func: ServerLuaFunction) => Promise<any>,
] => [
    ...refGetterBodyArgs(ref, funcName),
    async (func: ServerLuaFunction) => ActiveRemoteElementsStorage[await func()],
];

export const refArrayGetterOnRef = (ref: string, funcName: string): [
    string,
    string[],
    (func: ServerLuaFunction) => Promise<any>,
] => [
    arrGetterBody(ref, funcName),
    ['...'],
    async (func: ServerLuaFunction<any[], string[]>) => (await func()).map((id) => ActiveRemoteElementsStorage[id]),
];

export const multiGetOnRef = func(['...'], (ref: string, funcName: string, varNames: string[]) => `
${checkMethod(ref, funcName).trim()}
local ${varNames.join(', ')} = ${ref}:${funcName}()
return {
${varNames.map(v => `    ${v} = ${v},`).join('\n')}
}
`);

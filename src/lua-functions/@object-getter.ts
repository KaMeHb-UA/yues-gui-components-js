import { LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME } from '@/constants';

export const objectGetter = (objName: string, idName: string) => `
local ${objName} = ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(${idName})
if ${objName} == nil then
    return nil, 'Object with id ' .. ${idName} .. ' does not exist'
end
`;

import { LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME } from '@/constants';

export const colorFix = `
if color.type == 'string' then
    color = color.value
else
    color = ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(color.value)
end
`;

import { LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME } from '@/constants';

export const clipboardDataFix = `
if data.type == 'image' then
    data.value = ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(data.value)
end
`;

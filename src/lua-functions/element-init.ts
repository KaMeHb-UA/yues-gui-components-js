import { func } from './@func';
import { LUA_SET_TO_GLOBAL_STORAGE_FUNC_NAME } from '@/constants';

export const elementInit = func(['ref', 'args'], () => `
local res, err = __getFunction(ref)(unpack(args))
if err ~= nil then return nil, err end
return ${LUA_SET_TO_GLOBAL_STORAGE_FUNC_NAME}(res)
`);

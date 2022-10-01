import { LUA_SET_TO_GLOBAL_STORAGE_FUNC_NAME } from '@/constants';

export const initFunc = () => `
local res, err = __getFunction(ref)(unpack(args))
if err ~= nil then return nil, err end
return ${LUA_SET_TO_GLOBAL_STORAGE_FUNC_NAME}(res)
`.slice(1, -1);

export const bindEventFunc = (ref: string) => `
${ref}['on' .. event] = function(self, ...)
    postMessage {
        targetRef = targetRef,
        event = event,
        data = {...},
    }
end
`.slice(1, -1);

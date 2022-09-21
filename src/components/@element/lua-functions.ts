export const initFunc = (ref: string) => `
local res, err = __getFunction(ref)(unpack(args))
if err ~= nil return nil, err end
${ref} = res
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

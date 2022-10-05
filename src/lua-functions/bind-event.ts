import { func } from './@func';

export const bindEvent = func(['event', 'targetRef'], (ref: string) => `
${ref}['on' .. event] = function(self, ...)
    postMessage {
        targetRef = targetRef,
        event = event,
        data = {...},
    }
end
`);

import { LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME } from '@/constants';

const clipboardDataFix = `
if data.type == 'image' then
    data.value = ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(data.value)
end
`.slice(1, -1);

const colorFix = `
if color.type == 'string' then
    color = color.value
else
    color = ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(color.value)
end
`.slice(1, -1);

export const offsetfromview = (ref: string) => `
local view = ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(viewid)
return ${ref}:offsetfromview(view)
`.slice(1, -1);

export const dodrag = (ref: string) => `
${clipboardDataFix}
${ref}:dodrag(data, operations)
`.slice(1, -1);

export const dodragwithoptions = (ref: string) => `
${clipboardDataFix}
${ref}:dodragwithoptions(data, operations, options)
`.slice(1, -1);

export const setcursor = (ref: string) => `
local cursor = ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(cursorid)
${ref}:setcursor(cursor)
`.slice(1, -1);

export const setcolor = (ref: string) => `
${colorFix}
${ref}:setcolor(color)
`.slice(1, -1);

export const setbackgroundcolor = (ref: string) => `
${colorFix}
${ref}:setbackgroundcolor(color)
`.slice(1, -1);

export const getparent = (ref: string) => `
local parentview = ${ref}:getparent()
local parentid = ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(parentview)
return parentid
`.slice(1, -1);

export const getwindow = (ref: string) => `
local window = ${ref}:getwindow()
local windowid = ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(window)
return windowid
`.slice(1, -1);

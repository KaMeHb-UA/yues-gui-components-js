import {
    LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME,
    LUA_SET_TO_GLOBAL_STORAGE_FUNC_NAME,
    LUA_REMOVE_FROM_GLOBAL_STORAGE_FUNC_NAME,
} from '@/constants';

export const initEnv = `
local uuid = require 'lua-uuid'

local storage = {}

local function getNextUuid()
    local id = uuid()
    if storage[id] == nil then
        return id
    end
    return getNextUuid()
end

local function getValueByGlobalId(id)
    return storage[id]
end

local function getGlobalIdByValue(value)
    for k, v in pairs(storage) do
        if v == value then
            return k
        end
    end
    return nil, 'there is no such value stored globally'
end

function ${LUA_GET_FROM_GLOBAL_STORAGE_FUNC_NAME}(valueorid)
    if type(valueorid) == 'string' then
        return getValueByGlobalId(valueorid)
    else
        return getGlobalIdByValue(valueorid)
    end
end

function ${LUA_SET_TO_GLOBAL_STORAGE_FUNC_NAME}(value)
    local id = getNextUuid()
    storage[id] = value
    return id
end

function ${LUA_REMOVE_FROM_GLOBAL_STORAGE_FUNC_NAME}(id)
    storage[id] = nil
end
`.slice(1, -1);

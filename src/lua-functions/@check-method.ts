export const checkMethod = (ref: string, funcName: string) => `
if ${ref}.${funcName} == nil then
    return nil, 'Referenced object has no method ${funcName}'
end
`;

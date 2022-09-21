import type { Server } from 'yues-client';

// assuming we're using only latest patches
const checkTable = [
    ['0.4.4', 'return gui.TextEdit ~= nil and gui.TextEdit.gettextbounds ~= nil'],
    ['0.5.4', 'return gui.Slider ~= nil'],
    ['0.6.3', 'return gui.Table ~= nil'],
    ['0.8.8', 'return gui.Tray.remove ~= nil'],
    ['0.9.8', 'return gui.Notification ~= nil'],
    ['0.10.3', 'return gui.Scroll.setscrollposition ~= nil'],
    ['0.11.0', 'return gui.DatePicker ~= nil'],
];

const checkLibVersionFunction = `
local version = '0.0.0'
for _, v in pairs(checkTable) do
    local ver, funcbody = unpack(v)
    local func = loadstring(funcbody)
    if not func() then return version end
    version = ver
end
return version
`.slice(1, -1);

function parseVersion(version: string) {
    const [ major, minor, patch ] = version.split('.').map(v => +v);
    return { major, minor, patch };
}

export async function assertLibVersion(server: Server, minimum: string, maximum?: string) {
    const libVersion = await server.exec(
        checkLibVersionFunction,
        ['checkTable'],
        [checkTable],
    );
    const lib = parseVersion(libVersion);
    let errString = 'This app requires libyue version to be greater or equal ' + minimum;
    if (maximum) errString += ' and less or equal ' + maximum;
    errString += ' but installed version is ' + libVersion;
    const min = parseVersion(minimum);
    if (
        (
            min.major > lib.major
        ) || (
            min.major === lib.major && min.minor > lib.minor
        ) || (
            min.major === lib.major && min.minor === lib.minor && min.patch > lib.patch
        )
    ) {
        await server.destroy();
        throw new EvalError(errString);
    }
    if (!maximum) return;
    const max = parseVersion(maximum);
    if (
        (
            max.major < lib.major
        ) || (
            max.major === lib.major && max.minor < lib.minor
        ) || (
            max.major === lib.major && max.minor === lib.minor && max.patch < lib.patch
        )
    ) {
        await server.destroy();
        throw new EvalError(errString);
    }
}

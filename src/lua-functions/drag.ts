import { clipboardDataFix } from './@clipboard-data-fix';

const doDragBody = (ref: string, withOptions: boolean) => `
${clipboardDataFix.trim()}
${ref}:dodrag${withOptions ? 'withoptions' : ''}(data, operations${withOptions ? ', options' : ''})
`;

export const doDrag = (ref: string, withOptions: boolean): [string, string[]] => [
    doDragBody(ref, withOptions).trim(),
    [
        'data',
        'operations',
        ...( withOptions ? ['options'] : [] ),
    ],
];

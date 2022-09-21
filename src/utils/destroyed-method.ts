export const destroyedMethod = Object.assign(async () => {
    throw new EvalError('Cannot call method: component or method is already destroyed');
}, {
    ref: '',
    initialized: false,
    async destroy(){},
});

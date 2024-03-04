/* eslint-disable */

// this bridge adapter as workaround for ESM version of commitlint
// https://github.com/conventional-changelog/commitlint/issues/3949

// @ts-ignore
exports.prompter = async (inquirerIns, commit) => {
    (await import("@commitlint/cz-commitlint")).prompter(inquirerIns, commit);
};

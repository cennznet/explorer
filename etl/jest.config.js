// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/'],
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json',
        },
    },
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    testEnvironment: 'node',
    testMatch: ['**/test/*.+(ts|tsx|js)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
};

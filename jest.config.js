module.exports = {
    "moduleFileExtensions": [
        "js",
        "jsx",
        "mjs",
        "json",
        "ts",
        "tsx"
    ],
    "rootDir": ".",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
        "^.+\\.(t|j)s$": "ts-jest",
        '\\.md$': '<rootDir>/test/file-transform.ts',
    },
    "collectCoverageFrom": [
        "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
        "^src/(.*)$": "<rootDir>/src/$1",
        '\\.md$': '<rootDir>/test/file-transform.ts',
    }
};
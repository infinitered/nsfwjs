export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["__mocks__", "examples"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};

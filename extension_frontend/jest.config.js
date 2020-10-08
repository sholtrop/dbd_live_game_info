module.exports = {
  setupFiles: ["./test/jestsetup.js"],
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(scss|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|scss|less)$": "<rootDir>/__mocks__/styleMock.js",
  },
  resolver: "jest-webpack-resolver",
  testPathIgnorePatterns: ["node_modules/", "cypress/"],
};

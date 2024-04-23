module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(.*(test|spec)).tsx?$',
  testEnvironment: 'node',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared$': '<rootDir>/src/shared/index',
    '^@api$': '<rootDir>/src/api/index',
    '^@modules$': '<rootDir>/src/modules/index',
    '^@commands$': '<rootDir>/src/commands/index',
  },
};

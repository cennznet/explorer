module.exports = {
	testEnvironment: 'node',
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js?|ts?)$',
	testPathIgnorePatterns: ['/scripts/', '/node_modules/'],
	moduleFileExtensions: ['ts', 'js', 'jsx', 'json', 'node'],
	collectCoverage: true,
	verbose: true,
};

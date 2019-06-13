require('dotenv').config();

const isLocal = process.env.NODE_ENV === 'local';

module.exports = {
	type: 'mysql',
	host: process.env.MYSQL_DB_HOST,
	port: Number(process.env.MYSQL_DB_PORT),
	username: process.env.MYSQL_DB_USER,
	password: process.env.MYSQL_DB_PASSWORD,
	database: process.env.MYSQL_DB_NAME,
	entities: [isLocal ? __dirname + '/**/*.entity.ts' : __dirname + '/**/*.entity.js'],
	bigNumberStrings: true,
	supportBigNumbers: true,
	timezone: 'Z',
	synchronize: isLocal,
	migrationsRun: !isLocal,
	migrations: [
		'**/migrations/*.js',
	],
	cli: {
		migrationsDir: 'src/migrations',
	},
};

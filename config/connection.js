const Sequelize = require('sequelize');
require('dotenv').config();


const sequelize = process.env.DB_URL
	? new Sequelize(process.env.DB_URL)
	: new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: 'postgres',
		dialectOptions: {
        decimalNumbers: true,
    },
    });

module.exports = sequelize;
const mysql = require('mysql');

let mysqlHost
let mysqlPort
let mysqlDatabase
let mysqlUser
let mysqlPassword
let mysqlTable

let db
let sql

if(process.version.slice(1, 3) - 0 < 16) {
	throw new Error(
		`NodeJS Version 16 or newer is required, but you are using ${process.version}. See https://nodejs.org to update.`,
	);
}

class AzXp {

	/**
  * @param {string} [dbHost]
  * @param {string} [dbPort]
  * @param {string} [dbDatabase]
  * @param {string} [dbUser]
  * @param {string} [dbPassword]
  * @param {string} [dbTable]
  */

	static async sql(dbHost, dbPort, dbDatabase, dbUser, dbPassword, dbTable) {
		if(!dbHost) throw new TypeError("Aucun Hôte(nom ou ip) de base de données n'a été fournie.\nNo database host(name or ip) was provided.");
		if(!dbPort) throw new TypeError("Aucun Port(origine: 3306) de base de données n'a été fournie.\nNo database Port(origin: 3306) was provided.");
		if(!dbDatabase) throw new TypeError("Aucune base de données n'a été fournie.\nNo database was provided.");
		if(!dbUser) throw new TypeError("Aucun Utilisateur de base de données n'a été fournie.\nNo database user was provided.");
		if(!dbPassword) throw new TypeError("Aucun Mot de passe de l'utilisateur n'a été fournie.\nNo User Password was provided.");
		if(!dbTable) { mysqlTable = "levels" } else { mysqlTable = dbTable }
		mysqlHost = dbHost;
		mysqlPort = dbPort;
		mysqlDatabase = dbDatabase;
		mysqlUser = dbUser;
		mysqlPassword = dbPassword;
		
		db = mysql.createConnection({
			host: mysqlHost,
			port: mysqlPort,
			database: mysqlDatabase,
			user: mysqlUser,
			password: mysqlPassword
		})

		db.query(`SELECT * FROM ${mysqlTable}`, (err, row) => {

			if(row == undefined) {
				sql = `CREATE TABLE ${mysqlTable} (
				 guild     varchar(100),
				 user      varchar(100),
				 xp        varchar(100),
				 level     int(11))`
				db.query(sql, console.log())
			}

			return sql;
		})
	}

	/**
  * @param {string} [guildId]
  * @param {string} [userId]
  */

	static async createUser(guildId, userId) {
		if (!guildId) throw new TypeError("Aucun identifiant de guilde n'a été fourni.\nAn guild id was not provided.");
		if (!userId) throw new TypeError("Aucun identifiant utilisateur n'a été fourni.\nA user id was not provided.");

		db.query(`SELECT * FROM ${mysqlTable} WHERE guild = '${guildId}' AND user = ${userId}`, async (err, row) => {

			if(row.length > 0) return false;

			try {
				sql = `INSERT INTO ${mysqlTable} (guild, user, xp, level) VALUES ('${guildId}', '${userId}', '0', '1')`
				db.query(sql, console.log())
			} catch(err) {
				console.log(`Echec de la suppression de l'utilisateur : ${err}`)
			}

			return sql;
		})
	}

	/**
  	* @param {string} [guildId]
  	*/

	static async deleteGuild(guildId) {
		if (!guildId) throw new TypeError("Aucun identifiant de serveur n'a été fourni.");
	
		db.query(`SELECT * FROM ${mysqlTable} WHERE guild = '${guildId}'`, async (err, row) => {

			if(row.length == 0) return false;

			try {
				sql = `DELETE FROM ${mysqlTable} WHERE guild = ${guildId}`
				db.query(sql, console.log())
			} catch(err) {
				console.log(`Echec de la suppression du serveur : ${err}`)
			}

			return sql;
		})
	}

	/**
  * @param {string} [guildId]
  * @param {string} [userId]
  */

	static async deleteUser(guildId, userId) {
		if (!guildId) throw new TypeError("Aucun identifiant de guilde n'a été fourni.\nAn guild id was not provided.");
		if (!userId) throw new TypeError("Aucun identifiant utilisateur n'a été fourni.\nA user id was not provided.");


		db.query(`SELECT * FROM ${mysqlTable} WHERE guild = '${guildId}' AND user = ${userId}`, async (err, row) => {

			if(row.length == 0) return false;

			try {
				sql = `DELETE FROM ${mysqlTable} WHERE guild = '${guildId}' AND user = '${userId}'`
				db.query(sql, console.log())
			} catch(err) {
				console.log(`Echec de la suppression de l'utilisateur : ${err}`)
			}

			return sql;
		})
	}

	/**
  * @param {string} [guildId]
  * @param {string} [userId]
  * @param {number} [xp]
  */

	static async appendXp(guildId, userId, xp) {
		if (!guildId) throw new TypeError("Aucun identifiant de guilde n'a été fourni.\nAn guild id was not provided.");
		if (!userId) throw new TypeError("Aucun identifiant utilisateur n'a été fourni.\nA user id was not provided.");
		if (xp <= 0 || !xp || isNaN(parseInt(xp))) throw new TypeError("Un montant d'xp n'a pas été fourni/n'était pas valide.\nAn amount of xp was not provided/was invalid.");


		db.query(`SELECT * FROM ${mysqlTable} WHERE guild = '${guildId}' AND user = ${userId}`, async (err, row) => {

			if(row.length == 0) {

				try {
					sql = `INSERT INTO ${mysqlTable} (guild, user, xp, level) VALUES ('${guildId}', '${userId}', '${xp}', '${Math.floor(0.1 * Math.sqrt(xp))}')`
					db.query(sql, console.log())
				} catch(err) {
					console.log("Impossible d'enregistrer le nouvel utilisateur.\nFailed to save new user.")
				}

				return (Math.floor(0.1 * Math.sqrt(xp)) > 0);
			} else {

				let userXp = row[0].xp * 1

				try {
					sql = `UPDATE ${mysqlTable} SET xp = '${parseInt(xp, 10)}' WHERE guild = '${guildId}' AND user = '${userId}'`
					db.query(sql, console.log())
					sql = `UPDATE ${mysqlTable} SET level = '${Math.floor(0.1 * Math.sqrt(userXp + xp))}' WHERE guild = '${guildId}' AND user = '${userId}'`
					db.query(sql, console.log())
				} catch(err) {
					console.log(`Impossible d'ajouter de l'exp : ${err}`)
				}

				return (Math.floor(0.1 * Math.sqrt(userXp - xp)) < row[0].level);
			}
		})
	}

	/**
  * @param {string} [guilId]
  * @param {string} [userId]
  * @param {number} [levels]
  */

	static async appendLevel(guildId, userId, levels) {
		if (!guildId) throw new TypeError("Aucun identifiant de guilde n'a été fourni.\nAn guild id was not provided.");
		if (!userId) throw new TypeError("Aucun identifiant utilisateur n'a été fourni.\nA user id was not provided.");
		if (!levels || isNaN(parseInt(levels))) throw new TypeError("Un montant de niveau n'a pas été fourni/n'était pas valide.\nAn amount of level was not provided/was invalid.");

		db.query(`SELECT * FROM ${mysqlTable} WHERE guild = '${guildId}' AND user = ${userId}`, async (err, row) => {

			if(row.length == 0) return false;

			let userLevel = row[0].level * 1

			try {
				sql = `UPDATE ${mysqlTable} SET level = '${parseInt(userLevel + levels, 10)}' WHERE guild = '${guildId}' AND user = '${userId}'`
				db.query(sql, console.log())
				sql = `UPDATE ${mysqlTable} SET xp = '${(userLevel + levels) * (userLevel + levels) * 100}' WHERE guild = '${guildId}' AND user = '${userId}'`
				db.query(sql, console.log())
			} catch(err) {
				console.log(`Impossible d'ajouter des niveaux : ${err}`)
			}

			return sql;
		})
	}

	/**
  * @param {string} [guildId]
  * @param {string} [userId]
  * @param {number} [xp]
  */

	static async setXp(guildId, userId, xp) {
		if (!guildId) throw new TypeError("Aucun identifiant de guilde n'a été fourni.\nAn guild id was not provided.");
		if (!userId) throw new TypeError("Aucun identifiant utilisateur n'a été fourni.\nA user id was not provided.");
		if (xp <= 0 || !xp || isNaN(parseInt(xp))) throw new TypeError("Un montant d'xp n'a pas été fourni/n'était pas valide.\nAn amount of xp was not provided/was invalid.");


		db.query(`SELECT * FROM ${mysqlTable} WHERE guild = '${guildId}' AND user = ${userId}`, async (err, row) => {

			if(row.length == 0) return false;

			try {
				sql = `UPDATE ${mysqlTable} SET xp = '${xp}' WHERE guild = '${guildId}' AND user = '${userId}'`
				db.query(sql, console.log())
				sql = `UPDATE ${mysqlTable} SET level = '${Math.floor(0.1 * Math.sqrt(row[0].xp + xp))}' WHERE guild = '${guildId}' AND user = '${userId}'`
				db.query(sql, console.log())
			} catch(err) {
				console.log(`Echec de la définition de l'exp : ${err}`)
			}

				return sql;
		})
	}

	/**
  * @param {string} [guildId]
  * @param {string} [userId]
  * @param {number} [levels]
  */

	static async setLevel(guildId, userId, levels) {

		if (!guildId) throw new TypeError("Aucun identifiant de guilde n'a été fourni.\nAn guild id was not provided.");
		if (!userId) throw new TypeError("Aucun identifiant utilisateur n'a été fourni.\nA user id was not provided.");
		if (!levels || isNaN(parseInt(levels))) throw new TypeError("Un montant de niveau n'a pas été fourni/n'était pas valide.\nAn amount of level was not provided/was invalid.");


		db.query(`SELECT * FROM ${mysqlTable} WHERE guild = '${guildId}' AND user = ${userId}`, async (err, row) => {

			if(row.length == 0) return false;

			try {
				sql = `UPDATE ${mysqlTable} SET level = '${levels}' WHERE guild = '${guildId}' AND user = '${userId}'`
				db.query(sql, console.log())
				sql = `UPDATE ${mysqlTable} SET xp = '${levels * levels * 100}' WHERE guild = '${guildId}' AND user = '${userId}'`
				db.query(sql, console.log())
			} catch(err) {
				console.log(`Echec de la définition de niveau : ${err}`)
			}

				return sql;
		})
	}

	/**
  * @param {string} [guildId]
  * @param {string} [userId]
  * @param {number} [xp]
  */

	static async subtractXp(guildId, userId, xp) {
		if (!guildId) throw new TypeError("Aucun identifiant de guilde n'a été fourni.\nAn guild id was not provided.");
		if (!userId) throw new TypeError("Aucun identifiant utilisateur n'a été fourni.\nA user id was not provided.");
		if (xp <= 0 || !xp || isNaN(parseInt(xp))) throw new TypeError("Un montant d'xp n'a pas été fourni/n'était pas valide.\nAn amount of xp was not provided/was invalid.");


		db.query(`SELECT * FROM ${mysqlTable} WHERE guild = '${guildId}' AND user = ${userId}`, async (err, row) => {

			if(row.length == 0) return false;

			let userXp = row[0].xp * 1

			try {
				sql = `UPDATE ${mysqlTable} SET xp = '${userXp - xp}' WHERE guild = '${guildId}' AND user = '${userId}'`
				db.query(sql, console.log())
				sql = `UPDATE ${mysqlTable} SET level = '${Math.floor(0.1 * Math.sqrt(userXp - xp))}' WHERE guild = '${guildId}' AND user = '${userId}'`
				db.query(sql, console.log())
			} catch(err) {
				console.log(`Echec de la soustraction de l'exp : ${err}`)
			}

				return sql;
		})
	}

	/**
  * @param {string} [guildId]
  * @param {string} [userId]
  * @param {number} [levels]
  */

	static async subtractLevel(guildId, userId, levels) {
		if (!guildId) throw new TypeError("Aucun identifiant de guilde n'a été fourni.\nAn guild id was not provided.");
		if (!userId) throw new TypeError("Aucun identifiant utilisateur n'a été fourni.\nA user id was not provided.");
		if (!levels || isNaN(parseInt(levels))) throw new TypeError("Un montant de niveau n'a pas été fourni/n'était pas valide.\nAn amount of level was not provided/was invalid.");

		db.query(`SELECT * FROM ${mysqlTable} WHERE guild = '${guildId}' AND user = ${userId}`, async (err, row) => {

			if(row.length == 0) return false;

			let userLevel = row[0].level * 1

			try {
				sql = `UPDATE ${mysqlTable} SET level = '${userLevel - level}' WHERE guild = '${guildId}' AND user = '${userId}'`
				db.query(sql, console.log())
				sql = `UPDATE ${mysqlTable} SET xp = '${(userLevel - levels) * (userLevel - levels) * 100}' WHERE guild = '${guildId}' AND user = '${userId}'`
				db.query(sql, console.log())
			} catch(err) {
				console.log(`Echec de la soustraction de niveau : ${err}`)
			}
				return sql;
		})
	}

	/**
  * @param {number} [targetLevel] - Xp required to reach that level.
  */
	static xpFor(targetLevel) {
		if (isNaN(targetLevel) || isNaN(parseInt(targetLevel, 10))) throw new TypeError('Target level should be a valid number.');
		if (isNaN(targetLevel)) targetLevel = parseInt(targetLevel, 10);
		if (targetLevel < 0) throw new RangeError('Target level should be a positive number.');
		return targetLevel * targetLevel * 100;
	}
}

module.exports = AzXp;

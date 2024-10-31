import mysql from 'mysql2/promise';

let DB = null

try {
   DB = await mysql.createConnection({
      host: 'localhost',
      user: 'Alan',
      password: 'baiker11',
      database: 'bdeducar',
    });
} catch (err) {
    console.log(err);
}

export default DB;
'use strict';

const { createHash } = require('node:crypto');

// Hostinger may overlap Node workers. Serialize schema sync AND application bootstrap
// across workers/deployments connected to the same database, without changing tables.
async function acquireStartupLock(database, connect = require('mysql2/promise').createConnection) {
  if (database.client !== 'mysql') return async () => {};
  const connection = await connect({ ...database.connection, connectTimeout: 60000 });
  connection.on('error', () => {}); // Query failures still reject; avoid an unhandled EventEmitter error.
  const name = 'agropulse:boot:' + createHash('sha256').update(database.connection.database).digest('hex').slice(0, 40);
  try {
    const [rows] = await connection.execute('SELECT GET_LOCK(?, 300) AS acquired', [name]);
    if (Number(rows[0]?.acquired) !== 1) throw new Error('CMS startup lock timeout');
  } catch (error) {
    connection.destroy();
    throw error;
  }
  let released = false;
  return async () => {
    if (released) return;
    released = true;
    try { await connection.execute('SELECT RELEASE_LOCK(?)', [name]); }
    finally { connection.destroy(); }
  };
}

module.exports = { acquireStartupLock };

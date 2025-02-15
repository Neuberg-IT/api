const sql = require("mssql");
const configSet = {
    user: 'iis_appuser',
    password: 'Q2kyKLeh',
   
    // for dev
    server: '35.154.107.53',

    // for prod
    // server: '192.168.18.28',
   
    port: 6555,
    requestTimeout: 100000,
    connectionTimeout: 100000,
    options: {
        trustServerCertificate: true,
        "encrypt": true,
        "requestTimeout": 45000
    },
    "dialectOptions": {
        options: { "requestTimeout": 300000 }
    },

};
const executeDataSet = (callBack, query, database) => {
    const config = { ...configSet };
    config.database = database || 'corporate_master';
    console.log('\n\n\n')
    console.log('Database config from executeDataSet');
    console.log(JSON.stringify({ ...config, password: "YYYY" }))
    console.log('\n\n\n')
    const connectionConnectionHandler = sql.connect(config, function (err) {
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
        // query to the database and get the records
        request.query(query, function (err, recordset) {
            const result = { status: 1, data: {}, error: null }
            if (err) {
                result.error = err;
                result.data = null;
                result.status = 0;
            }
            else {
                result.data = recordset.recordsets;
            }
            console.log('closing the connection');
            connectionConnectionHandler.close();
            console.log('closing the connection');
            callBack(result);

        });
    });
}

const executeDataSetAsync = async (query, database) => {
    try {
        const config = { ...configSet };
        config.database = database || 'corporate_master';
        console.log('\n\n\n')
        console.log('Database config from executeDataSetAsync');
        console.log(JSON.stringify({ ...config, password: 'ABC' }))
        console.log('\n\n\n')
        const connectionHandler = await sql.connect(config);
        const result = await sql.query(query);
        await connectionHandler.close()
        return result;
    } catch (err) {
        console.log(err);
        return err;
        // ... error checks
    }
}

const executeDataSetAsyncInConnPool = async (query, database) => {
    try {
        //utility functions 
        const connectDB = async (database) => {
            config.database = database;
            console.log('in connectDB function');
            const pool = new sql.ConnectionPool(config);
            try {
                await pool.connect();
                console.log('Connected to the database');
                return pool;
            } catch (err) {
                console.log('Database connection failed!', err);
                return err;
            }
        }

        const getAll = async (command, database) => {
            console.log('in getall function');
            const DB = await connectDB(database);
            try {
                const result = await DB.request().query(command);
                return result;
            } catch (err) {
                console.log('Error querying the database', err);
                return err;
            } finally {
                DB.close();
            }
        }
        //utility functions
        const config = { ...configSet };
        config.database = database || 'corporate_master';
        console.log('\n\n\n')
        console.log('Database config from executeDataSetAsyncInConnPool');
        console.log(JSON.stringify({ ...config, password: "XXX" }))
        console.log('\n\n\n');

        console.log('in executeDataSetAsyncInConnPool function');
        const result = await getAll(query, database);
        console.log('in output executeDataSetAsyncInConnPool function');
        return result;
    }
    catch (ex) {

    }
}
module.exports = {
    executeDataSet,
    executeDataSetAsync,
    executeDataSetAsyncInConnPool
};
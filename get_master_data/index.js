const {  executeDataSetAsyncInConnPool } = require("../database");
const { validate } = require("./authorization");

const getMasterData = async (req, res) => {
    if (!validate(req.headers)) {
        res.status(401).send("Unauthorized access. Please contact the administrator")
    } else {
        const command = `exec [master].[get_${req.body.table_name}] @dated='${req.body.refreshed_date_time}'`
        const result = await executeDataSetAsyncInConnPool(command, "corporate_master");
        if (result.recordsets) {
            console.log('Success')
            res.send({ status: 'Success', data: result.recordsets[0] })
        } else {
            console.log(result);
            res.send({ status: 'Failure', error: "Please retry or contact the administrator" })
        }
    }
}

module.exports = {
    getMasterData
}
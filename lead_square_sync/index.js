const { executeDataSet, executeDataSetAsyncInConnPool } = require("../database");
const axios = require('axios');
const { API_URL, API_KEY, VALIDATE_URL, STATUS_URL } = require("./constant");
const { convertJSONToCSV } = require("../common");
const write = require("write");
const insert_query = `insert into [master].[data_push_audit](request_id,step_no,request, response, table_id)`
const executePushRequest = async (req, res) => {
    try {
        const pendingConfig = await executeDataSetAsyncInConnPool(`exec [master].get_pending_request`, 'corporate_master')
        if (pendingConfig.recordsets?.[0]?.length > 0) {
            await pendingConfig.recordsets?.[0].forEach((async config => {
                const payloadString = Buffer.from(config.request, 'base64').toString('ascii');
                let payload = JSON.parse(payloadString);
                payload.maxBodyLength = Infinity
                const result = await axios.request(payload);
                let stepId = 0;
                let executeStatusResult = {}
                if (result.data.Data.SuccessCount) {
                    stepId = 4;
                    executeStatusResult = await getExecuteStatus(config.table_id, config.request_id);
                }
                const stepResult = await executeDataSetAsyncInConnPool(`${insert_query} values('${config.request_id}',${stepId},'${JSON.stringify(payload)}','${JSON.stringify(result.data || result.error)}','${config.table_id}')`, 'corporate_master');
                if (stepId == 4) {
                    const stepResult = await executeDataSetAsyncInConnPool(`${insert_query} values('${config.request_id}',${5},'${JSON.stringify(payload)}','${JSON.stringify(executeStatusResult)}','${config.table_id}')`, 'corporate_master');
                }
            }));
        }
        res.send('Success')
    }
    catch (ex) {
        res.send('Failure')
    }
}
const pushData = async (req, res) => {
    const result = await executeDataSetAsyncInConnPool(`exec [master].[get_${req.body.table_name}]`, 'corporate_master')
    if (!result) {
        res.send("Invalid Error")
    } else {
        const record = result.recordsets[0];
        const recordSize = record.length;
        console.log("Record size")
        console.log(recordSize);
        const recordList = [];
        const maxLength = 90000
        if (recordSize > maxLength) {
            const divisions = recordSize / maxLength;
            const quotient = parseInt(divisions);
            const actualDivideResult = Number(divisions);
            let parts = quotient;
            if (quotient < actualDivideResult) {
                // for eg : if actual divide result is 2.15 then convert the parts count to 3
                parts = quotient + 1;
            }
            let startIndex = 0;
            for (let i = 0; i < parts; i++) {
                let endIndex = startIndex + maxLength;
                if (endIndex >= recordSize) endIndex = recordSize;
                recordList.push(record.slice(startIndex, endIndex));
                console.log(`start index - ${startIndex} , end index - ${endIndex - 1}`)
                startIndex = endIndex;
            }

        } else {
            recordList.push(record)
        }
        let isAllSuccess = true;
        for (let i = 0; i < recordList.length; i++) {
            const response = await validateRequest(req.body.table_id, recordList[i], res)
            console.log(`response for batch ${i + 1} is `);
            console.log(response);
            if (isAllSuccess && !response) {
                isAllSuccess = false;
            }
        }
        if (isAllSuccess) res.send({ status: 'Success' })
        else res.send({ status: "Failure" })
    }
}
const validateRequest = async (table_id, dataSet, res) => {
    try {

        const syncRequest = await getSyncRequest(table_id);
        const step1Result = await executeDataSetAsyncInConnPool(`${insert_query} values('${syncRequest.data.RequestId}','1','${JSON.stringify(syncRequest.request)}','${JSON.stringify(syncRequest.data || syncRequest.error)}','${table_id}')`, 'corporate_master')


        const uploadRequest = await uploadDataForRequest(syncRequest.data.URL, dataSet, syncRequest.data.RequestId);
        const step2Result = await executeDataSetAsyncInConnPool(`${insert_query} values('${syncRequest.data.RequestId}','2','csv data','${JSON.stringify(uploadRequest.data || uploadRequest.error)}','${table_id}')`, 'corporate_master')


        const validateResult = await executeRequest(table_id, syncRequest.data.RequestId, dataSet);
        const payload = Buffer.from(JSON.stringify(validateResult.request)).toString('base64')
        const step3Result = await executeDataSetAsyncInConnPool(`${insert_query} values('${syncRequest.data.RequestId}','3','${payload}','${JSON.stringify(validateResult.data || validateResult.error)}','${table_id}')`, 'corporate_master');


        /* const statusResult = await getExecuteStatus(table_id, syncRequest.data.RequestId);
         await new Promise(resolve => setTimeout(resolve, 10000));
         const statusResult2 = await getExecuteStatus(table_id, syncRequest.data.RequestId);
         const statusResultString = JSON.stringify({ status1: statusResult, status2: statusResult2 })
         executeDataSet((dataSet) => { }, `${insert_query} values('${syncRequest.data.RequestId}','4','${JSON.stringify(validateResult)}','${JSON.stringify(statusResultString)}')`);
        */
        return true;
        // res.send({ status: 'Success' })
    } catch (ex) {
        // throw ex;
        console.log(ex.message)
        return false;
        // res.send({ status: "Failure", message: ex.message })
    }


}

const getExecuteStatus = async (table_id, request_id) => {
    let data = JSON.stringify({
        "RequestId": request_id,
        "IgnoreErrors": true
    });
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: STATUS_URL.replace('{{table_id}}', table_id),
        headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
        },
        data
    };
    const output = await axios.request(config);
    return output.data;
}

const getSyncRequest = async (table_id) => {
    let data = '{"FileType" : "CSV"}';

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: API_URL.replace('{{table_id}}', table_id),
        headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
        },
        data: data
    };
    try {

        const response = await axios.request(config);
        if (response.data.Data) {
            return { status: 1, data: response.data.Data, request: config }
        }
        return { status: 0, error: 1, request: config }
    }
    catch (ex) {
        return { status: 0, error: ex, request: config }
    }

}

const uploadDataForRequest = async (url, data, requestId) => {
    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url,
        headers: {
            'Content-Type': 'text/csv'
        },
        data: convertJSONToCSV(data)
    };
    try {
        console.log(JSON.stringify(data));
        const path = `csv/${requestId}.csv`
        console.log(`Prepared to write to the csv data in the file ${path}`)
        await write(path, convertJSONToCSV(data));
        console.log(`Wrote the csv data in the file ${path}`)
        const result = await axios.request(config);
        return { request: config, data: result.status }
    }
    catch (ex) {
        return { request: config, error: ex }
    }

}

const executeRequest = async (table_id, requestId, dataSet) => {
    const headers = Object.keys(dataSet[0]).map(row => ({
        "ColumnHeader": row,
        "ColumnId": row
        /* test added for git commit harish*/
    }))
    let data = JSON.stringify({
        "RequestId": requestId,
        "ImportRequestType": "Upsert",
        "SearchColumns": [
            "Table_ID"
        ],
        "UploadMapping": headers
    });
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: VALIDATE_URL.replace('{{table_id}}', table_id),
        headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
        },
        data
    };
    try {
        const result = await axios.request(config);
        return { request: config, data: result.data }
    }
    catch (ex) {
        return { request: config, error: ex }
    }
}
module.exports = {
    pushData,
    executePushRequest
}
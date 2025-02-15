const { default: axios } = require("axios");
const { executeDataSet } = require("../database");
const { validate } = require("./authorization");
const getLead = async (req, res) => {
    if (!validate(req.headers)) {
        res.status(401).send("Unauthorized access. Please contact the administrator")
    } else {
        try {
            const { query } = req;
            const doNotDisturb = query.dncphone == '1' || query.dncmobile == '1';
            const lead_square_payload = [
                {
                    "Attribute": "Notes",
                    "Value": JSON.stringify(query)
                },
                {
                    "Attribute": "FirstName",
                    "Value": query.name
                },
                {
                    "Attribute": "Mobile",
                    "Value": query.mobile
                },
                {
                    "Attribute": "Phone",
                    "Value": query.phone
                },
                {
                    "Attribute": "EmailAddress",
                    "Value": query.email
                },
                {
                    "Attribute": "LeadConvertionDate",
                    "Value": query.date
                },
                {
                    "Attribute": "City",
                    "Value": query.city
                },
                {
                    "Attribute": "mx_Street1",
                    "Value": query.area
                },
                {
                    "Attribute": "mx_Street2",
                    "Value": query.brancharea
                },
                {
                    "Attribute": "DoNotCall",
                    "Value": doNotDisturb ? '1' : '0'
                },
                {
                    "Attribute": "Company",
                    "Value": query.company
                },
                {
                    "Attribute": "Source",
                    "Value": "Affiliate Marketing"
                },
                {
                    "Attribute": "mx_Secondary_Source",
                    "Value": "Justdial"
                }
            ]

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Capture',
                headers: {
                    'Content-Type': 'application/json',
                    'x-LSQ-AccessKey': 'u$r8ac1be138c21c3321c9bc9c08dfae9e1',
                    'x-LSQ-SecretKey': 'cc60394521a574386998a20654649546cf0dbdb3'
                },
                data: lead_square_payload
            };

            const result = await axios.request(config)
                .then((response) => {
                    logAudit(JSON.stringify(query), JSON.stringify(lead_square_payload), JSON.stringify(response.data))
                    // res.send({ status: 'Success', data: response.data })
                    res.send('RECEIVED')
                })
                .catch((error) => {
                    logAudit(JSON.stringify(query), JSON.stringify(lead_square_payload), JSON.stringify(error))
                    // res.send({ status: 'Failure', error: error })
                    res.send('NOT RECEIVED')
                });
        }
        catch (ex) {
            logAudit(JSON.stringify(req.query), '', ex.message)
        }
    }

}

const logAudit = (input, lead_square_input, lead_square_output) => {
    const command = `exec [admin_portal].[save_just_dial_audit] '${input}','${lead_square_input}','${lead_square_output}' `

    executeDataSet((result) => { }, command, 'misdblive');
}
module.exports = {
    getLead
}
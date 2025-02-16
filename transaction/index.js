
const { default: axios } = require("axios");
const { validate } = require("./authorization");

const GetThirdPartyregistrationdetailsbymobileno = async (req, res) => {
    if (!validate(req.headers)) {
        res.status(401).send("Unauthorized access. Please contact the administrator")
    } else {
        try {
            let supratech = JSON.stringify({
                "Limsid": 8,
                "input": {
                    "MobileNo": req.body.Mobile
                }
            });
            let chennai = JSON.stringify({
                "Limsid": 1,
                "input": {
                    "MobileNo": req.body.Mobile
                }
            });
            Promise.all([getPromise(supratech, res), getPromise(chennai, res)]).then((result) => {
                const chennai = JSON.parse(result[1]).Success?.Data?.Patient || [];
                const supratech = JSON.parse(result[0]).Success?.Data?.Patient || [];
                const output = {
                    "IsSuccess": true,
                    "Error": null,
                    "Success": {
                        "Message": "",
                        "Data": {
                            "Patient": supratech.concat(chennai)
                        }
                    }
                }
                res.send(output);
                //res.send({ status: 'Success', supratech, chennai, data:supratech.concat(chennai)  })
            });

        } catch (ex) {
            console.log(ex)
            res.send({ status: 'Failure', error: ex })
        }

    }
}
const getPromise = (data, res) => {
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://192.168.18.29/common/lims/get_data.asmx/GetThirdPartyregistrationdetailsbymobileno',
        headers: {
            'Content-Type': 'application/json'
        },
        data
    };

    return axios.request(config)
        .then((response) => {
            //console.log(JSON.stringify(response.data));
            return response.data.d.result;
            //res.send({ status: 'Success', data: response.data })
        })
        .catch((error) => {
            //console.log(error);
            res.send({ status: 'Failure', error: error })
        });
}
module.exports = {
    GetThirdPartyregistrationdetailsbymobileno
}
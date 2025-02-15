const authorization = {
    companyid: 'Justdial',
    userid: '10',
    password: 'Neuberg@2023',
}
const validate = (headers) => {
    return headers.userid === authorization.userid
        && headers.password === authorization.password
}
module.exports = {
    validate
}
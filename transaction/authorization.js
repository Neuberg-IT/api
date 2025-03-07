const authorization = {
    companyid: 'mobile',
    userid: '8',
    password: 'Agile@12345',
}
const validate = (headers) => {
    return headers.userid === authorization.userid
        && headers.password === authorization.password
}
module.exports = {
    validate
}
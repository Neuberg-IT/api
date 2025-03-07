const authorization = {
    companyid: 'changing_sky',
    username: 'user1',
    password: 'password1',
}
const validate = (headers) => {
    return headers.companyid === authorization.companyid 
    && headers.username === authorization.username
    && headers.password === authorization.password
}
module.exports = {
    validate
}
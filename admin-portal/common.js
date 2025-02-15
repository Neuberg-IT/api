module.exports = {
    
    convertJSONToCSV: (data) => {
        const isNonEmptyString = (value)=>{
            return value !== undefined && value !== null && value.toString().length > 0;  
        };
        let csvString = "";
        if (data && data.length > 0) {
            const setCSVString = (index, value, csv) => {
                const delimiter = index === 0 ? "" : ",";
                let cellValue = value;
                cellValue = isNonEmptyString(cellValue) ? cellValue : "";
                cellValue =
                    cellValue.toString().indexOf(",") !== -1
                        ? '"' + cellValue + '"'
                        : cellValue;
                csv += delimiter + cellValue;
                return csv;
            };
            const headerList = Object.keys(data[0]);
            headerList.forEach((header, index) => {
                csvString = setCSVString(index, header, csvString);
            });
            csvString += "\r\n";
            data.forEach((row) => {
                headerList.forEach((cell, index) => {
                    csvString = setCSVString(index, row[cell], csvString);
                });
                csvString += "\r\n";
            });
        }
        return csvString;
    },
}
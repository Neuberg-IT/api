const { default: axios } = require("axios");
const { executeDataSetAsyncInConnPool } = require("../database");
const { validate } = require("./authorization");
const pageSizeLength = 1000;
let event_id;;
const StoreLeadsInfo2 = async (req, res) => {
  event_id = req.body.event_id;
  console.log(`event_id : ${event_id}`)
  const result = await executeDataSetAsyncInConnPool(`exec [admin_portal].[get_dates_for_lead] ${event_id} `, "misdblive");
  if (result.recordsets?.[0]?.[0]?.fromdate) {
    const fromdate = result.recordsets[0][0].fromdate;
    const todate = result.recordsets[0][0].todate;
    console.log(`querying initial data fromdate ${fromdate} todate ${todate} `);
    const response = await queryLead(fromdate, todate);
    const totalRow = response.data.RecordCount;
    console.log(`total Rows ${totalRow}`)
    const pages = Math.ceil(totalRow / 1000);
    console.log(`total pages ${pages}`)
    if (pages > 1) {
      let currentPage = 2;
      const promiseArray = []
      while (currentPage <= pages) {
        const startPage = currentPage
        promiseArray.push(queryLead(fromdate, todate, startPage))
        currentPage += 1
      }
      Promise.all(promiseArray).then(async (result) => {

        result.push(response);
        const finalResponse = { data: { List: [] } }
        result.forEach(async (res, index) => {
          if (res.error) {
            console.log(res.result);
          }
          finalResponse.data.List = finalResponse.data.List.concat(res.data.List)
          /*         console.log(`finishing ${index}`)
                  const insertResponse = await insertLead(res);
                  console.log(`finishing ${index} ${JSON.stringify(insertResponse)}`) */
        });
        const insertResponse = await insertLead(finalResponse)
        res.send(finalResponse);
      })
    } else {
      const insertResponse = await insertLead(response)
      res.send(response.data);
    }
  } else {
    res.send("Some Error occurred . Please contact the administrator")
  }
}
replaceSpecialCharacters = (inputString) => {
  if(inputString != null)
  {
     inputString = inputString.replace(/\</g," lesser than ")
    inputString = inputString.replace(/\>/g," greater than ")
     inputString = inputString.replace(/\&/g," ambersant ")
    inputString = inputString.replace(/\"/g," Double quote ")
    inputString = inputString.replace(/\'/g," single quote ")
  }
    
  return inputString
}
const insertLead = async (response) => {
  
  let xmlString = ''
  response.data.List.forEach(data => {
    xmlString += `<profile>`
    xmlString += `<ProspectActivityId>${data.ProspectActivityId}</ProspectActivityId>`;
    xmlString += `<RelatedProspectId>${data.RelatedProspectId}</RelatedProspectId>`;
    xmlString += `<CreatedOn>${data.CreatedOn}</CreatedOn>`;
    xmlString += `<ModifiedOn>${data.ModifiedOn}</ModifiedOn>`;
    xmlString += `<Phone>${data.Phone}</Phone>`;
    xmlString += `<Mobile>${data.P_Mobile}</Mobile>`;
    xmlString += `<FirstName>${replaceSpecialCharacters(data.FirstName)}</FirstName>`;

    xmlString += `<mx_Custom_1>${data.mx_Custom_1}</mx_Custom_1>`;
    xmlString += `<mx_Custom_2>${data.mx_Custom_2}</mx_Custom_2>`;
    xmlString += `<mx_Custom_3>${data.mx_Custom_3}</mx_Custom_3>`;
    xmlString += `<mx_Custom_4>${replaceSpecialCharacters(data.mx_Custom_4)}</mx_Custom_4>`;
    xmlString += `<ActivityEvent_Note>${replaceSpecialCharacters(data.ActivityEvent_Note)}</ActivityEvent_Note>`;
    xmlString += `<ActivityType>${data.ActivityType}</ActivityType>`;

    xmlString += `<P_ProspectStage>${data.P_ProspectStage}</P_ProspectStage>`;
    xmlString += `<P_Source>${data.P_Source}</P_Source>`;
    xmlString += `<P_Score>${data.P_Score}</P_Score>`;
    xmlString += `<P_mx_Sub_Stage>${data.P_mx_Sub_Stage}</P_mx_Sub_Stage>`;
    xmlString += `<P_mx_Owner_Group>${data.P_mx_Owner_Group}</P_mx_Owner_Group>`;
    xmlString += `<P_mx_LIMS_ID>${data.P_mx_LIMS_ID}</P_mx_LIMS_ID>`;
    xmlString += `<P_mx_Latest_Disposition>${data.P_mx_Latest_Disposition}</P_mx_Latest_Disposition>`;
    xmlString += `<P_mx_Status>${data.P_mx_Status}</P_mx_Status>`;
    xmlString += `<P_mx_Remarks>${replaceSpecialCharacters(data.P_mx_Remarks)}</P_mx_Remarks>`;
    xmlString += `<P_ProspectAutoId >${data.P_ProspectAutoId}</P_ProspectAutoId >`;
    xmlString += `<P_LastName>${data.P_LastName}</P_LastName>`;
    xmlString += `<P_EmailAddress>${data.P_EmailAddress}</P_EmailAddress>`;
    xmlString += `<P_mx_Zip>${data.P_mx_Zip}</P_mx_Zip>`;
    xmlString += `<P_mx_Secondary_Source >${data.P_mx_Secondary_Source}</P_mx_Secondary_Source >`;
    xmlString += `<P_mx_Relationship>${data.P_mx_Relationship}</P_mx_Relationship>`;
    xmlString += `<P_mx_Street2>${data.P_mx_Street2}</P_mx_Street2>`;
    xmlString += `<P_mx_Street1>${replaceSpecialCharacters(data.P_mx_Street1)}</P_mx_Street1>`;

    xmlString += `<mx_Custom_8>${data.mx_Custom_8}</mx_Custom_8>`;
    xmlString += `<mx_Custom_14>${data.mx_Custom_14}</mx_Custom_14>`;
    xmlString += `<mx_Custom_15>${data.mx_Custom_15}</mx_Custom_15>`;
    xmlString += `<mx_Custom_16>${data.mx_Custom_16}</mx_Custom_16>`;
    xmlString += `<mx_Custom_17>${data.mx_Custom_17}</mx_Custom_17>`;
    xmlString += `<mx_Custom_18>${data.mx_Custom_18}</mx_Custom_18>`;
    xmlString += `<mx_Custom_19>${data.mx_Custom_19}</mx_Custom_19>`;
    xmlString += `<mx_Custom_20>${replaceSpecialCharacters(data.mx_Custom_20)}</mx_Custom_20>`;
    xmlString += `<mx_Custom_21>${data.mx_Custom_21}</mx_Custom_21>`;
    xmlString += `<mx_Custom_22>${data.mx_Custom_22}</mx_Custom_22>`;
    xmlString += `<mx_Custom_23>${data.mx_Custom_23}</mx_Custom_23>`;
    xmlString += `<mx_Custom_28>${data.mx_Custom_28}</mx_Custom_28>`;
    xmlString += `<mx_Custom_29>${data.mx_Custom_29}</mx_Custom_29>`;
    xmlString += `<mx_Custom_30>${data.mx_Custom_30}</mx_Custom_30>`;
    xmlString += `<mx_Custom_31>${data.mx_Custom_31}</mx_Custom_31>`;
    xmlString += `<mx_Custom_32>${data.mx_Custom_32}</mx_Custom_32>`;
    xmlString += `<mx_Custom_34>${data.mx_Custom_34}</mx_Custom_34>`;
    xmlString += `<mx_Custom_70>${data.mx_Custom_70}</mx_Custom_70>`;
    xmlString += `<P_mx_Digital_Lead>${data.P_mx_Digital_Lead}</P_mx_Digital_Lead>`;
    xmlString += `<P_mx_Digital_Source_Name>${data.P_mx_Digital_Source_Name}</P_mx_Digital_Source_Name>`;
    xmlString += `<ActivityEvent>${data.ActivityEvent}</ActivityEvent>`;
    xmlString += `<P_mx_Digital_Created_Date>${data.P_mx_Digital_Created_Date}</P_mx_Digital_Created_Date>`;
    xmlString += `<Status>${data.Status}</Status>`;
    xmlString += `<Owner>${data.Owner}</Owner>`
    xmlString += `</profile>`
  });
  xmlString = xmlString.replace(/&/g, " ")
  xmlString = xmlString.replace(/'/g, " ");
  // console.log(xmlString);
  const res = await executeDataSetAsyncInConnPool(`exec [admin_portal].[store_leads] '${xmlString}'`, 'misdblive')
  return res;
}
const queryLead = async (fromdate, todate, startPage = 1) => {
  let advancedSearch = ``;

  if (event_id == 201) {
    advancedSearch = `{\"GrpConOp\":\"And\",\"Conditions\":[{\"Type\":\"Activity\",\"ConOp\":\"and\",\"RowCondition\":[{\"SubConOp\":\"And\",\"LSO\":\"ActivityEvent\",\"LSO_Type\":\"PAEvent\",\"Operator\":\"eq\",\"RSO\":\"201\"}],\"IsFilterCondition\":true},{\"Type\":\"Activity\",\"ConOp\":\"and\",\"RowCondition\":[{\"SubConOp\":\"And\",\"LSO\":\"ActivityEvent\",\"LSO_Type\":\"PAEvent\",\"Operator\":\"eq\",\"RSO\":\"201\"},{\"SubConOp\":\"And\",\"RSO_IsMailMerged\":false},{\"SubConOp\":\"And\",\"LSO_Type\":\"DateTime\",\"LSO\":\"ActivityTime\",\"Operator\":\"eq\",\"RSO\":\"opt-all-time\"}]},{\"Type\":\"Activity\",\"ConOp\":\"and\",\"RowCondition\":[{\"SubConOp\":\"And\",\"LSO\":\"ActivityEvent\",\"LSO_Type\":\"PAEvent\",\"Operator\":\"eq\",\"RSO\":\"201\"},{\"SubConOp\":\"And\",\"LSO_Type\":\"DateTime\",\"LSO\":\"ActivityTime\",\"Operator\":\"between\",\"RSO\":\"${fromdate} TO ${todate}\"}]}]}`
    //advancedSearch = `{\"GrpConOp\":\"And\",\"Conditions\":[{\"Type\":\"Activity\",\"ConOp\":\"and\",\"RowCondition\":[{\"SubConOp\":\"And\",\"LSO\":\"ActivityEvent\",\"LSO_Type\":\"PAEvent\",\"Operator\":\"eq\",\"RSO\":\"201\"}],\"IsFilterCondition\":true},{\"Type\":\"Activity\",\"ConOp\":\"and\",\"RowCondition\":[{\"SubConOp\":\"And\",\"LSO\":\"ActivityEvent\",\"LSO_Type\":\"PAEvent\",\"Operator\":\"eq\",\"RSO\":\"201\"},{\"SubConOp\":\"And\",\"LSO_Type\":\"SearchableDropdown\",\"LSO\":\"mx_Custom_1\",\"Operator\":\"neq\",\"RSO\":\"Appointment Booking\",\"RSO_IsMailMerged\":false},{\"SubConOp\":\"And\",\"LSO_Type\":\"DateTime\",\"LSO\":\"ActivityTime\",\"Operator\":\"eq\",\"RSO\":\"opt-all-time\"}]},{\"Type\":\"Activity\",\"ConOp\":\"and\",\"RowCondition\":[{\"SubConOp\":\"And\",\"LSO\":\"ActivityEvent\",\"LSO_Type\":\"PAEvent\",\"Operator\":\"eq\",\"RSO\":\"201\"},{\"SubConOp\":\"And\",\"LSO_Type\":\"SearchableDropdown\",\"LSO\":\"mx_Custom_1\",\"Operator\":\"eq\",\"RSO\":\"Enquiry\",\"RSO_IsMailMerged\":false},{\"SubConOp\":\"And\",\"LSO_Type\":\"DateTime\",\"LSO\":\"ActivityTime\",\"Operator\":\"between\",\"RSO\":\"${fromdate} TO ${todate}\"}]}]}`
  } else if (event_id == 207) {
    advancedSearch = `{\"GrpConOp\":\"And\",\"Conditions\":[{\"Type\":\"Activity\",\"ConOp\":\"and\",\"RowCondition\":[{\"SubConOp\":\"And\",\"LSO\":\"ActivityEvent\",\"LSO_Type\":\"PAEvent\",\"Operator\":\"eq\",\"RSO\":\"207\"},{\"SubConOp\":\"And\",\"LSO\":\"CreatedOn\",\"LSO_Type\":\"DateTime\",\"Operator\":\"between\",\"RSO\":\"${fromdate} TO ${todate}\"}],\"IsFilterCondition\":true}]}`
  } else if (event_id == 21) {
    advancedSearch = `{\"GrpConOp\":\"And\",\"Conditions\":[{\"Type\":\"Activity\",\"ConOp\":\"and\",\"RowCondition\":[{\"SubConOp\":\"And\",\"LSO\":\"ActivityEvent\",\"LSO_Type\":\"PAEvent\",\"Operator\":\"eq\",\"RSO\":\"21\"},{\"SubConOp\":\"And\",\"LSO\":\"CreatedOn\",\"LSO_Type\":\"DateTime\",\"Operator\":\"between\",\"RSO\":\"${fromdate} TO ${todate}\"}],\"IsFilterCondition\":true}]}`
    //console.log(advancedSearch)
  }
  else if (event_id == 22) {
    advancedSearch = `{\"GrpConOp\":\"And\",\"Conditions\":[{\"Type\":\"Activity\",\"ConOp\":\"and\",\"RowCondition\":[{\"SubConOp\":\"And\",\"LSO\":\"ActivityEvent\",\"LSO_Type\":\"PAEvent\",\"Operator\":\"eq\",\"RSO\":\"22\"},{\"SubConOp\":\"And\",\"LSO\":\"CreatedOn\",\"LSO_Type\":\"DateTime\",\"Operator\":\"between\",\"RSO\":\"${fromdate} TO ${todate}\"}],\"IsFilterCondition\":true}]}`
    //console.log(advancedSearch)
  }
  try {
    const axios = require('axios');
    let data = JSON.stringify({
      "ActivityEvent": event_id,
      "AdvancedSearch": advancedSearch,
      "Paging": {
        "PageIndex": startPage,
        "PageSize": pageSizeLength
      },
      "Sorting": {
        "ColumnName": "CreatedOn",
        "Direction": 1
      },
      "Columns": {
        "Include_CSV": "ProspectActivityId,P_Mobile,Phone,FirstName,mx_Custom_1,mx_Custom_2,mx_Custom_3,mx_Custom_4,ActivityEvent_Note,Owner,ActivityType,P_ProspectStage, P_Source, P_Score, P_mx_Sub_Stage, P_mx_Owner_Group, P_mx_LIMS_ID, P_mx_Latest_Disposition, P_mx_Status, P_mx_Remarks, P_ProspectAutoId, P_LastName, P_EmailAddress, P_mx_Zip, P_mx_Secondary_Source, P_mx_Relationship, P_mx_Street2, P_mx_Street1,mx_Custom_8, mx_Custom_14,mx_Custom_15,mx_Custom_16,mx_Custom_17,mx_Custom_18,mx_Custom_19,mx_Custom_20,mx_Custom_21,mx_Custom_22,mx_Custom_23,mx_Custom_28,mx_Custom_29,mx_Custom_30,mx_Custom_31,mx_Custom_32,mx_Custom_34,mx_Custom_70,P_mx_Digital_Lead,P_mx_Digital_Source_Name,P_mx_Digital_Created_Date,Owner,Status"

        //     "Include_CSV": "ProspectActivityId,Mobile,Phone,FirstName,mx_Custom_1,mx_Custom_2,mx_Custom_3,mx_Custom_4,ActivityEvent_Note,Status,Owner,ActivityType,P_ProspectStage, P_Source, P_Score, P_mx_Sub_Stage, P_mx_Owner_Group, P_mx_LIMS_ID, P_mx_Latest_Disposition, P_mx_Status, P_mx_Remarks, P_ProspectAutoId, P_LastName, P_EmailAddress, P_mx_Zip, P_mx_Secondary_Source, P_mx_Relationship, P_mx_Street2, P_mx_Street1"
      }
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api-in21.leadsquared.com/v2/ProspectActivity.svc/Activity/Retrieve/BySearchParameter?accessKey=u%24r8ac1be138c21c3321c9bc9c08dfae9e1&secretKey=cc60394521a574386998a20654649546cf0dbdb3',
      headers: {
        'Content-Type': 'application/json'
      },
      data
    };
    let xmlString = '';
    // console.log(JSON.stringify(config))
    return axios.request(config).catch((error) => {
      console.log(error);
      return { error: 1, result: error };
    });
  }
  catch (ex) {
    logAudit(JSON.stringify(req.query), '', ex.message)
  }
}
module.exports = {
  StoreLeadsInfo2
}

require("dotenv").config();
const Asana = require("asana");
let client = Asana.ApiClient.instance;
let token = client.authentications["token"];
token.accessToken = process.env.ASANA_ACCESS_TOKEN;

let workspacesApiInstance = new Asana.WorkspacesApi();
let opts = {
  limit: 50,
  opt_fields: "email_domains,is_organization,name,offset,path,uri",
};
workspacesApiInstance.getWorkspaces(opts).then(
  (result) => {
    console.log(
      "API called successfully. Returned data: " +
        JSON.stringify(result.data, null, 2)
    );
  },
  (error) => {
    console.error(error.response.body);
  }
);

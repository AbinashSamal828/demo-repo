const Asana = require("asana");
require("dotenv").config();
let client = Asana.ApiClient.instance;

let token = client.authentications["token"];
token.accessToken = process.env.ASANA_ACCESS_TOKEN;

let usersApiInstance = new Asana.UsersApi();
let opts = {
  offset: "eyJ0eXAiOJiKV1iQLCJhbGciOiJIUzI1NiJ9",
  opt_fields:
    "email,name,photo,photo.image_1024x1024,photo.image_128x128,photo.image_21x21,photo.image_27x27,photo.image_36x36,photo.image_60x60,workspaces,workspaces.name",
};
const getUsersInWorkspace = async (workspace_gid) => {
  try {
    const data = await usersApiInstance.getUsersForWorkspace(
      workspace_gid,
      opts
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};
module.exports = { getUsersInWorkspace };

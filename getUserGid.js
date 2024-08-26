const { getUsersInWorkspace } = require("./getUsersInWorkspace");

const getUserGid = async (username) => {
  try {
    const users = await getUsersInWorkspace("1208126540134411");
    const user = users.data.find((user) => user.name === username);
    return user.gid ? user.gid : null;
  } catch (error) {
    console.error("Error finding Asana user:", error);
    return null;
  }
};
module.exports = { getUserGid };

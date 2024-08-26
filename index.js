require("dotenv").config();
const express = require("express");
const localtunnel = require("localtunnel");
const bodyParser = require("body-parser");
const Asana = require("asana");
const validateWebhookPayload = require("./validateWebhookPayload");
const { getUserGid } = require("./getUserGid");

let client = Asana.ApiClient.instance;
let token = client.authentications["token"];
token.accessToken = process.env.ASANA_ACCESS_TOKEN;

const app = express();

app.use(
  bodyParser.json({
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || "utf8");
      }
    },
  })
);

const PORT = 3000;

app.listen(PORT, async () => {
  console.log("Server running on port ", PORT);
  const tunnel = await localtunnel({
    port: PORT,
    subdomain: "webhook-integration-828",
  });

  console.log(`LocalTunnel URL: ${tunnel.url}`);

  tunnel.on("close", () => {
    console.log("Tunnel closed");
  });
});

app.get("/", (req, res) => {
  res.send("Working");
});

app.post("/new-issue", validateWebhookPayload, async (req, res) => {
  try {
    const payload = req.body;
    console.log("Received webhook:", payload);
    const assignee_gid = await getUserGid(payload.issue.user.login);
    res.status(200).send("Webhook received");
    if (payload.action === "opened" || payload.action === "reopened") {
      let tasksApiInstance = new Asana.TasksApi();
      let body = {
        data: {
          name: payload.issue.title,
          notes: `${payload.issue.body}\n\nLink to issue: ${payload.issue.url}`,
          workspace: "1208126540134411",
          projects: "1208128739940832",
          id: payload.issue.url,
          due_on: "2024-09-01",
          assignee: assignee_gid,
        },
      };
      let opts = {
        opt_fields: "name,id,notes,assignee,assignee.name",
      };
      tasksApiInstance.createTask(body, opts).then(
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
    }
  } catch (err) {
    console.log(err);
  }
});

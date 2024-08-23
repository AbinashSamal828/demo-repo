# **GitHub to Asana Integration**

## **Overview**

This project sets up an integration between GitHub and Asana to automate task creation in Asana based on GitHub issue events. The integration uses GitHub webhooks to trigger the creation of tasks in Asana whenever an issue is opened or reopened in a GitHub repository.

## **Objective**

The integration aims to streamline task management by creating Asana tasks for new or reopened GitHub issues, ensuring that important tasks are tracked and managed efficiently in Asana.

## **Prerequisites**

Before setting up the integration, ensure you have the following:

1. **GitHub Account**: Access to a GitHub repository where webhooks can be configured.
2. **Asana Account**: Access to an Asana workspace and project where tasks will be created.
3. **Node.js**: Basic understanding of Node.js for setting up the webhook server.
4. **Asana Personal Access Token**: Required for authenticating API requests to Asana.

## **Setup Instructions**

### 1. **Create an Asana Project**

1. **Log in to Asana** and navigate to your workspace.
2. **Create a New Project** or select an existing one where tasks will be created.
3. **Note the Workspace and Project IDs**: You'll need these for the API request.

### 2. **Generate an Asana Personal Access Token**

1. **Navigate to Asana Developer Console**:
   - Go to [Asana Developer Console](https://app.asana.com/0/developer-console).

2. **Create a Personal Access Token**:
   - Generate a new token and copy it for use in the webhook server script.

### 3. **Set Up the Webhook Server**

1. **Initialize a New Node.js Project**:

   ```bash
   mkdir github-to-asana
   cd github-to-asana
   npm init -y
   npm install express body-parser axios asana localtunnel dotenv
   ```

2. **Create the Webhook Server Script** (`index.js`):

   ```javascript
   require("dotenv").config();
   const express = require("express");
   const localtunnel = require("localtunnel");
   const bodyParser = require("body-parser");
   const Asana = require("asana");
   const validateWebhookPayload = require("./validateWebhookPayload");

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

   app.post("/new-issue", validateWebhookPayload, (req, res) => {
     try {
       const payload = req.body;
       console.log("Received webhook:", payload);
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
             assignee: "me", // Use the Asana user ID for the assignee
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
   ```

3. **Create a `.env` File**:

   ```env
   ASANA_ACCESS_TOKEN=your_asana_access_token
   ```

### 4. **Configure GitHub Webhook**

1. **Navigate to Your GitHub Repository**:
   - Go to your GitHub repository and open the settings.

2. **Add a Webhook**:
   - Go to the "Webhooks" section and click "Add webhook."
   - Enter the payload URL provided by LocalTunnel (e.g., `http://webhook-integration-828.localtunnel.me/new-issue`).
   - Set the content type to `application/json`.
   - Add a secret for validation if using a custom validation function.
   - Select the events to trigger the webhook, such as "Issues".

3. **Save the Webhook**.

### 5. **Test the Integration**

1. **Create or Reopen an Issue**:
   - Create a new issue or reopen an existing issue in your GitHub repository to trigger the webhook.

2. **Verify Task Creation**:
   - Check your Asana project to ensure that a new task is created with the relevant details.

### 6. **Error Handling and Logging**

1. **Monitor Server Logs**:
   - Check logs for any errors or issues with the webhook handling.

2. **Handle Errors**:
   - Implement error handling in your webhook server to manage API errors or webhook failures.

## **Additional Resources**

- [Asana API Documentation](https://developers.asana.com/docs/)
- [GitHub Webhooks Documentation](https://docs.github.com/en/developers/webhooks-and-events/webhooks/creating-webhooks)
- [Node.js Express Documentation](https://expressjs.com/)
- [LocalTunnel Documentation](https://localtunnel.github.io/www/)


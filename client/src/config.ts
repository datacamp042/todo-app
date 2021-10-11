// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'nptn3fxazi'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-0-7386wf.us.auth0.com',            // Auth0 domain
  clientId: 'JqN5Vuespqi63afIfmZcPeXvbpUBkJdR',   // Auth0 client id
  callbackUrl: 'http://localhost:8080/callback'
}

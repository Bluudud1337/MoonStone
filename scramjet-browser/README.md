# MoonStone Scramjet Browser

This is an isolated browser app scaffold. It does not replace MoonStone's existing homepage or games.

## Requirements

- Node.js 20+
- A Node hosting service that supports persistent WebSocket upgrades
- HTTPS in production (required for service workers)

The browser app and Wisp transport are served by the same Node process. Standard Vercel static hosting alone is not enough for the persistent Wisp WebSocket transport. Keep MoonStone's main site on Vercel and deploy this sub-app as its own Node service, then link to that service from the main site.

## Local development

From this directory:

```sh
npm install
npm start
```

Open `http://localhost:8080`. Localhost is allowed to register service workers without HTTPS.

## Deployment

Deploy this directory as a Node web service on a host that supports WebSocket upgrades. Set its start command to `npm start`; the host should provide the `PORT` environment variable. Test `/health` after deployment.

Do not expose secrets in frontend files. Review the service provider's acceptable-use rules and configure access controls and resource limits before making the service public.

## Technical notes

- The browser uses Scramjet 1.1.0 and the official BareMux/libcurl transport packages.
- The service worker must be served from the same origin as the browser page.
- The frontend is intentionally separate from MoonStone's main app so the existing homepage remains untouched while this is tested.
- Scramjet and its upstream example can change APIs; verify the package versions and test the deployed service before linking it from MoonStone.

# Pub/Sub Emulator UI

Part of [gcp-pub-sub-boilerplate](https://github.com/aemal/gcp-pub-sub-boilerplate)

> **Credit**: This UI component is forked from [NeoScript/pubsub-emulator-ui](https://github.com/NeoScript/pubsub-emulator-ui), an excellent project that provides visibility into the Google Cloud Pub/Sub emulator. The original project has 83+ stars and 21+ forks on GitHub. We've adapted it for our boilerplate setup while maintaining the core functionality that makes it great.

## Purpose

This is a web-based user interface for monitoring and managing Google Cloud Pub/Sub emulator resources. It provides a visual interface for viewing topics, subscriptions, and messages in your local development environment.

### Original Project Features

As described by the original author:
- Visual tooling for Google Pub/Sub emulator
- Ability to view and create Pub/Sub messages
- Management of topics and pull subscriptions
- Improved message handling over previous solutions
- Docker support for easy deployment

### Our Implementation

We've integrated this UI with our boilerplate setup, providing:
- Angular-based web interface
- Real-time topic and subscription monitoring
- Message inspection and management
- Integration with local Pub/Sub emulator
- CORS proxy support for local development

### Features

- Angular-based web interface
- Real-time topic and subscription monitoring
- Message inspection and management
- Integration with local Pub/Sub emulator
- CORS proxy support for local development

### Components

- **Topic List**: View and manage Pub/Sub topics
- **Subscription List**: View and manage subscriptions for each topic
- **Message Viewer**: Inspect message contents and metadata
- **Real-time Updates**: Live updates when new messages arrive

## Setup

1. Install dependencies:
```bash
cd webapp
npm install
```

2. Start the CORS proxy:
```bash
npm install -g local-cors-proxy
lcp --proxyUrl http://localhost:8790 --proxyPartial 'proxy'
```

3. Start the development server:
```bash
npm start
```

4. Open the UI:
```bash
http://localhost:4200
```

## Configuration

The UI can be configured through environment files:

`src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  pubsubEmulator: {
    host: 'http://localhost:8010',
    projectId: 'your-project-id'
  }
};
```

## Troubleshooting

1. **404 Not Found**: Ensure the CORS proxy is running with correct parameters
2. **No Topics Showing**: Verify the emulator is running and has topics created
3. **Connection Issues**: Check the browser console for CORS or network errors

### Motivations
 - The current Google Pub/Sub emulator does not have any visual tooling
 - I hate having to communicate with the emulator strictly through code
 - An existing project ([gcp-pubsub-emulator-ui](https://github.com/echocode-io/gcp-pubsub-emulator-ui)) would allow users to pull messages, but was limited to only pulling 1 message at a time.
   - I didn't know enough about Maven/Gradle/Java to go in and modify so I just decided to rebuild the tool and try and pick-up some new skills in the process.

## Setting Up For Development

1. First Clone the repository
    ```
    git clone https://github.com/NeoScript/pubsub-ui.git
    ```
2. Then open the folder with VSCode
    - vscode is not required, but I've got a .devcontainers setup that may be helpful
    ```
    cd pubsub-ui
    code .
    ```
3. Reopen the workspace in a container
    - To learn more about devcontainers check out [this link](https://code.visualstudio.com/docs/remote/containers)
4. Spin up the supporting docker-compose file
    - note: we are currently spinning up [this very helpful wrapper](https://github.com/marcelcorso/gcloud-pubsub-emulator) around the emulator.
    - at some point we may try and transition to just spinning up the gcloud sdk itself (if anyone knows an easy way, tell me!)

5. Start serving the angular webapp
    ```
    cd webapp
    npm run start
    ```
6. You should now be able to develop and have changes trigger refreshes on the webapp!

---
### Additional Info
LICENSE: MIT

All improvements and suggestions are welcome!

## Credits and License

- Original Project: [NeoScript/pubsub-emulator-ui](https://github.com/NeoScript/pubsub-emulator-ui)
- License: MIT
- Original Author's Motivation: Created to provide better visual tooling for the Google Pub/Sub emulator and improve upon existing solutions.

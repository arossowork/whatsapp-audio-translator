import radius as rad

@description('Specifies the environment for the resource.')
param environment string

@description('The Radius application ID')
param application string

@description('The port for the NestJS application')
param port int = 3000

@description('The port Dapr sidecar listens on')
param daprPort int = 3500

// 1. Deploy the Queue module
module queue 'src/adapters/queue/queue.bicep' = {
  name: 'queue-module'
  params: {
    environment: environment
    application: application
  }
}

// 2. Deploy the Back-End Container
resource backend 'Applications.Core/containers@2023-10-01-preview' = {
  name: 'next-clean-arch'
  properties: {
    application: application
    environment: environment
    image: 'next-clean-arch:latest'
    ports: {
      app: {
        containerPort: port
      }
    }
    connections: {
      pubsub: {
        source: queue.outputs.id
      }
    }
    extensions: [
      {
        kind: 'daprSidecar'
        appId: 'next-clean-arch'
        appPort: port
        // Ensures the Pub/Sub is bound to this sidecar
        // Connections inherently bind to the environment Dapr settings but we explicitly point out the connection above.
      }
    ]
    env: {
      APP_PORT: port
      DAPR_HOST: '127.0.0.1'
      DAPR_HTTP_PORT: daprPort
    }
  }
}

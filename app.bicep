extension radius

@description('Specifies the environment for the resource.')
param environment string

@description('The Radius application ID')
param application string

@description('The port for the NestJS application')
param port string = '3000'

@description('The port Dapr sidecar listens on')
param daprPort string = '3500'

// 1. Deploy the Dapr Pub/Sub Broker
resource daprPubsub 'Applications.Dapr/pubSubBrokers@2023-10-01-preview' = {
  name: 'app-pubsub'
  properties: {
    environment: environment
    application: application
    // Using a Radius Recipe ensures that cloud configurations like SQS/GCP PubSub or Redis are handled transparently.
    recipe: {
      name: 'default'
    }
  }
}

// 2. Deploy the Back-End Container
resource backend 'Applications.Core/containers@2023-10-01-preview' = {
  name: 'next-clean-arch'
  properties: {
    application: application
    environment: environment
    container: {
      image: 'next-clean-arch:latest'
      ports: {
        app: {
          containerPort: int(port)
        }
      }
      env: {
        APP_PORT: {
          value: port
        }
        DAPR_HOST: {
          value: '127.0.0.1'
        }
        DAPR_HTTP_PORT: {
          value: daprPort
        }
      }
    }
    connections: {
      pubsub: {
        source: daprPubsub.id
      }
    }
    extensions: [
      {
        kind: 'daprSidecar'
        appId: 'next-clean-arch'
        appPort: int(port)
        // Ensures the Pub/Sub is bound to this sidecar
        // Connections inherently bind to the environment Dapr settings but we explicitly point out the connection above.
      }
    ]
  }
}

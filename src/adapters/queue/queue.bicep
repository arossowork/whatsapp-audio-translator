@description('Specifies the environment for the resource.')
param environment string

@description('The name of the pub/sub component')
param pubsubName string = 'pubsub'

@description('The application this component belongs to')
param application string

resource daprPubsub 'Applications.Dapr/pubSubBrokers@2023-10-01-preview' = {
  name: pubsubName
  properties: {
    environment: environment
    application: application
    // Using a Radius Recipe ensures that cloud configurations like SQS/GCP PubSub or Redis are handled transparently.
    recipe: {
      name: 'default'
    }
  }
}

output id string = daprPubsub.id

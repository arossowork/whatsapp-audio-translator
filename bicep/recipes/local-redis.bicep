extension radius

@description('The context from the Radius recipe engine')
param context object

@description('The port for Redis')
param redisPort int = 6379

resource redis 'Applications.Core/containers@2023-10-01-preview' = {
  name: 'redis-${context.resource.name}'
  properties: {
    application: context.application.name
    environment: context.environment.id
    image: 'redis:latest'
    ports: {
      redis: {
        containerPort: redisPort
      }
    }
  }
}

resource daprPubsub 'Applications.Dapr/pubSubBrokers@2023-10-01-preview' = {
  name: context.resource.name
  properties: {
    application: context.application.name
    environment: context.environment.id
    type: 'pubsub.redis'
    version: 'v1'
    metadata: {
      redisHost: '${redis.name}:${redisPort}'
      redisPassword: ''
    }
  }
}

// Recipes are expected to output the id
output id string = daprPubsub.id

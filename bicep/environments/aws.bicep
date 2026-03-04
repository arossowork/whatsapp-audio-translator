import radius as rad

@description('The name of the environment')
param environment string = 'aws'

resource env 'Applications.Core/environments@2023-10-01-preview' = {
  name: environment
  properties: {
    compute: {
      kind: 'kubernetes'
      resourceId: 'local' // usually would point to EKS/etc in real deployment
      namespace: environment
    }
    recipes: {
      'Applications.Dapr/pubSubBrokers': {
        default: {
          templateKind: 'bicep'
          templatePath: 'ghcr.io/radius-project/recipes/aws/pubsub:latest'
        }
      }
    }
  }
}

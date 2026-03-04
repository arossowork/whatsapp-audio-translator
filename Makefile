.PHONY: deploy-local deploy-aws deploy-gcp run-local help

APP_NAME=next-clean-arch
# Default port if not supplied
PORT ?= 3000

help: ## Show this help
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

deploy-local: ## Deploy the Local Radius environment (Redis) and the application
	@echo "Registering Local Redis Recipe..."
	rad recipe register default --template-kind bicep --template-path bicep/recipes/local-redis.bicep --resource-type Applications.Dapr/pubSubBrokers
	@echo "Deploying Application..."
	rad deploy app.bicep -a $(APP_NAME) -p port=$(PORT)

deploy-aws: ## Deploy the AWS Radius environment (SQS) and the application
	@echo "Registering AWS SQS Recipe..."
	rad recipe register default --template-kind bicep --template-path ghcr.io/radius-project/recipes/aws/sqs:0.54 --resource-type Applications.Dapr/pubSubBrokers
	@echo "Deploying Application..."
	rad deploy app.bicep -a $(APP_NAME) -p port=$(PORT)

deploy-gcp: ## Deploy the GCP Radius environment (Pub/Sub) and the application
	@echo "Registering GCP PubSub Recipe..."
	rad recipe register default --template-kind bicep --template-path ghcr.io/radius-project/recipes/gcp/pubsubbrokers:0.54 --resource-type Applications.Dapr/pubSubBrokers
	@echo "Deploying Application..."
	rad deploy app.bicep -a $(APP_NAME) -p port=$(PORT)

purge: ## Purge the Radius application
	@echo "Purging Radius application..."
	rad app delete $(APP_NAME) --yes

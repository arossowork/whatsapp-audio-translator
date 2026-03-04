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
	@echo "Deploying Local Environment..."
	rad deploy bicep/environments/local.bicep -p environment=local
	@echo "Deploying Application to Local Environment..."
	rad deploy app.bicep -p environment=local -p application=$(APP_NAME) -p port=$(PORT)

deploy-aws: ## Deploy the AWS Radius environment (SQS) and the application
	@echo "Deploying AWS Environment..."
	rad deploy bicep/environments/aws.bicep -p environment=aws
	@echo "Deploying Application to AWS Environment..."
	rad deploy app.bicep -p environment=aws -p application=$(APP_NAME) -p port=$(PORT)

deploy-gcp: ## Deploy the GCP Radius environment (Pub/Sub) and the application
	@echo "Deploying GCP Environment..."
	rad deploy bicep/environments/gcp.bicep -p environment=gcp
	@echo "Deploying Application to GCP Environment..."
	rad deploy app.bicep -p environment=gcp -p application=$(APP_NAME) -p port=$(PORT)

run-local: ## Run the application locally with Radius (live development)
	@echo "Running Application Locally..."
	rad run app.bicep -p environment=local -p application=$(APP_NAME) -p port=$(PORT)

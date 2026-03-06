.PHONY: deploy-local deploy-aws deploy-gcp deploy-remote run-local help cluster-restart radius-clean cluster-status app-logs app-qr app-restart

APP_NAME=next-clean-arch
# Default port if not supplied
PORT ?= 3000
# Default namespace is typically the environment name (default) hyphen application name
NAMESPACE ?= default-$(APP_NAME)

help: ## Show this help
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

docker-build: ## Build the Docker image for the application
	@echo "Building Docker image $(APP_NAME):latest..."
	docker build -t $(APP_NAME):latest .

k3d-load: docker-build ## Build the Docker image and load it into local k3d cluster
	@echo "Loading image $(APP_NAME):latest into k3d cluster (radius)..."
	k3d image import $(APP_NAME):latest -c radius

deploy-local: docker-build ## Deploy the Local Radius environment (Redis) and the application
	@echo "Registering Local Redis Recipe..."
	rad recipe register default --template-kind bicep --template-path ghcr.io/radius-project/recipes/local-dev/pubsubbrokers:0.54 --resource-type Applications.Dapr/pubSubBrokers
	@echo "Deploying Application..."
	rad deploy app.bicep -a $(APP_NAME) -p @app.parameters.json -p port=$(PORT)

deploy-aws: docker-build ## Deploy the AWS Radius environment (SQS) and the application
	@echo "Registering AWS SQS Recipe..."
	rad recipe register default --template-kind bicep --template-path ghcr.io/radius-project/recipes/aws/sqs:0.54 --resource-type Applications.Dapr/pubSubBrokers
	@echo "Deploying Application..."
	rad deploy app.bicep -a $(APP_NAME) -p @app.parameters.json -p port=$(PORT)

deploy-gcp: docker-build ## Deploy the GCP Radius environment (Pub/Sub) and the application
	@echo "Registering GCP PubSub Recipe..."
	rad recipe register default --template-kind bicep --template-path ghcr.io/radius-project/recipes/gcp/pubsubbrokers:0.54 --resource-type Applications.Dapr/pubSubBrokers
	@echo "Deploying Application..."
	rad deploy app.bicep -a $(APP_NAME) -p @app.parameters.json -p port=$(PORT)

deploy-remote: ## Deploy a pre-built image to a remote k3d cluster (IMAGE=ghcr.io/…:sha)
	@test -n "$(IMAGE)" || (echo "ERROR: IMAGE is required. Usage: make deploy-remote IMAGE=ghcr.io/owner/repo:tag"; exit 1)
	@echo "Importing $(IMAGE) into k3d cluster (radius)..."
	docker pull $(IMAGE)
	k3d image import $(IMAGE) -c radius
	@echo "Registering Local Redis Recipe..."
	rad recipe register default --template-kind bicep --template-path ghcr.io/radius-project/recipes/local-dev/pubsubbrokers:0.54 --resource-type Applications.Dapr/pubSubBrokers
	@echo "Deploying Application with image $(IMAGE)..."
	rad deploy app.bicep -a $(APP_NAME) -p @app.parameters.json -p port=$(PORT) -p containerImage=$(IMAGE) -p imagePullPolicy=Never

purge: ## Purge the Radius application
	@echo "Purging Radius application..."
	rad app delete $(APP_NAME) --yes

cluster-restart: ## Restart the local k3d radius cluster to fix networking or image pull issues
	@echo "Restarting k3d 'radius' cluster..."
	k3d cluster stop radius && k3d cluster start radius

radius-clean: ## Delete stuck Radius system pods to force an image pull retry
	@echo "Deleting Radius system pods to force recreation..."
	kubectl delete pod -n radius-system -l app.kubernetes.io/part-of=radius

cluster-status: ## Check the status of the local kubernetes cluster pods
	@echo "Checking pods in all namespaces..."
	kubectl get pods -A

namespace-status: ## Check the status of the local kubernetes cluster pods in the application namespace
	@echo "Checking pods in namespace $(NAMESPACE)..."
	kubectl get pods -n $(NAMESPACE)

app-logs: ## Tail the logs of the next-clean-arch application pod
	@echo "Tailing application logs in namespace $(NAMESPACE)..."
	kubectl logs -l app.kubernetes.io/name=$(APP_NAME) -n $(NAMESPACE) -c $(APP_NAME) -f --tail=100

app-qr: ## Print the most recent QR code from the logs
	@echo "Fetching the latest QR code from namespace $(NAMESPACE)..."
	kubectl logs -l app.kubernetes.io/name=$(APP_NAME) -n $(NAMESPACE) -c $(APP_NAME) --tail=100

app-restart: ## Restart the application pod
	@echo "Restarting the $(APP_NAME) pod in namespace $(NAMESPACE)..."
	kubectl delete pod -l app.kubernetes.io/name=$(APP_NAME) -n $(NAMESPACE)

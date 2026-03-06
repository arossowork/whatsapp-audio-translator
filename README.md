# Product Analysis: Audio Translation & Summarization App

## 1. The Core Problem
Audio messaging (especially via WhatsApp, Telegram, etc.) is extremely popular due to its convenience for the sender. However, it presents several pain points for the receiver:
- **Language Barriers**: The sender might speak a different language than the receiver.
- **Time/Convenience Asymmetry**: Listening to a 5-minute audio message takes 5 minutes. Reading a summary takes 15 seconds.
- **Context Loss**: Finding a specific piece of information in a past audio message is nearly impossible without re-listening.
- **Inability to Listen**: The receiver might be in a meeting, loud environment, or simply prefer reading.

## 2. Target Audience
- **Expats & Travelers**: Individuals living in foreign countries who receive audio messages in non-native languages (e.g., from landlords, local contractors, friends).
- **International Business Professionals**: People working across borders dealing with international clients or colleagues.
- **Power Users / Productivity Enthusiasts**: Users who loathe long audio messages and want quick summaries.
- **Accessibility Seekers**: Users who are D/deaf or hard of hearing.
- **Lost-in-thought Listeners (like the Creator)**: Users who struggle to stay focused while listening to long audio messages from partners/friends who are good at synthesis but send very lengthy voice notes.

## 3. Value Proposition
**"Instantly understand any voice note, in any language, without having to listen."**
Transform audio into structured, readable, and translatable text with intelligent context and summarization.

## 4. Key User Journey (The "Happy Path")
1. **Trigger**: User receives a long audio message in WhatsApp.
2. **Action**: User long-presses the audio message and selects "Share".
3. **Routing**: User selects this App from the native OS Share Sheet.
4. **Processing (Background/Foreground)**: The app receives the file. Context can optionally be provided (e.g., "This is from my accountant").
5. **Output**: The app opens, displaying:
   - A short, synthesized **Summary** of the audio.
   - The **Translated** transcript.
   - The **Original** transcript (for reference).
6. **Follow-up**: User can copy the text, share the summary back, or ask follow-up questions to the "interpreter bot".

## 5. Feature Breakdown (MVP vs. Backlog)

### Minimum Viable Product (MVP) - The WhatsApp Bot
- **WhatsApp Bot Interface**: User sends or forwards audio messages to the bot number.
- **QR Code Authentication**: The bot runs right on the server and authenticates using WhatsApp Web via Puppeteer. Upon startup, it generates a QR code in the server terminal, which the user scans with their WhatsApp app to instantly log in the bot.
- **Server Processing Pipeline**: The server receives the audio using `whatsapp-web.js`, processes it via a Message Queue (Dapr Pub/Sub), triggers STT (e.g., Whisper) and an LLM (e.g., GPT-4o-mini).
- **Instant Summary**: The bot replies directly in WhatsApp with the translated summary.

### Backlog / Future Enhancements (Progressive Web App)
- **Full PWA Dashboard**: A dedicated web app to see the history/wall of all processed audios.
- **Interactive Transcript (Audio-Sync)**: Users can click on a specific text segment in the transcript and the app will play the exact corresponding snippet of the original audio.
- **Context Priming**: User can set up profiles/contacts (e.g., "Audio from Maria is usually about project X").
- **Voice Output (TTS)**: Generate a translated audio reply using a cloned synthetic voice.

## 6. Architecture & Platform Strategy
The project follows **Clean Architecture** (Ports & Adapters) principles built on a **NestJS** core. 

1. **The Entry Point (WhatsApp Bot)**: Uses `whatsapp-web.js`. Solves the share-sheet problem natively. Upon starting, the terminal displays a QR Code to link the WhatsApp session.
2. **Event-Driven Pub/Sub**: Uses **Dapr** as the underlying broker to manage scalable asynchronous queues for audio processing and delivery logic.
3. **The Web Interface**: A Progressive Web App (PWA) that initially serves as a simple viewer for long transcripts, but will eventually evolve into the full dashboard.

**PM Recommendation:**
Execute strictly on the MVP (Bot) first to validate the core value proposition. Leave the full PWA dashboard and interactive clicking on the backlog.

## 7. Next Steps & Technical Decisions
1. **Choose STT and LLM Integration**: Implement real Whisper and GPT-4 STT and LLM adapters to replace the mocks.
2. **Data Privacy & Storage**: Define how long audio files and transcripts are retained since this is highly sensitive data. Add database adapters.

## 8. Deployment and Running Locally
The application makes use of **Radius** and **Dapr** for simple declarative environments and deployment. A convenient `Makefile` encapsulates commands.

### Requirements
- Docker
- k3d
- Radius CLI (`rad`)

### Running Locally
1. Start deployment:
   ```bash
   make deploy-local
   ```
   This will build the Docker container and deploy the app along with a local Redis pub/sub broker to a k3d `radius` cluster.

2. **Authenticate the Bot**:
   Observe the pod logs to scan the QR Code that connects the `whatsapp-bot.js` client:
   ```bash
   kubectl logs -l app=next-clean-arch --follow
   ```
   *Scan the generated QR code with your phone's WhatsApp.*

### Troubleshooting
If the local `radius` deployment stalls or fails to pull images, use the built-in troubleshooting `Makefile` targets:
- `make cluster-restart`: Restarts the local k3d environment.
- `make radius-clean`: Deletes failing Radius pods to trigger recreation.
- `make cluster-status`: Check the status of the local pods across all namespaces.

---

## 9. Deploying to a Remote VPS

### Choosing a VPS

For a starter deployment, a standard **Contabo Cloud VPS S** (~$4.95/mo) is the cheapest option with enough resources to run k3d + Radius + this app:

| Spec | Contabo VPS S |
|---|---|
| vCPU | 4 |
| RAM | 8 GB |
| Storage | 75 GB NVMe |
| Price | ~$4.95/mo |
| Bandwidth | Unlimited (fair use) |

> **Alternatives:** Hetzner CX23 (~€3.49/mo, 2 vCPU/4GB) is also viable if you prefer better network performance and EU-based hosting.

### VPS Initial Setup

SSH into your fresh VPS and run the following steps to install the full stack.

#### 1. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in so Docker group takes effect
```

#### 2. Install kubectl

```bash
curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/
```

#### 3. Install k3d

```bash
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
```

#### 4. Create the k3d Cluster

```bash
k3d cluster create radius --wait
```

#### 5. Install Radius CLI and Initialize

```bash
# Install rad CLI
wget -q "https://raw.githubusercontent.com/radius-project/radius/main/deploy/install.sh" -O - | /bin/bash

# Initialize Radius on the cluster
rad install kubernetes
rad group create default
rad env create default --group default
rad workspace create kubernetes default --group default --env default
```

#### 6. Clone the Repository

```bash
sudo mkdir -p /opt/next-clean-arch
sudo chown $USER:$USER /opt/next-clean-arch
git clone https://github.com/<YOUR_GITHUB_USER>/next-clean-arch.git /opt/next-clean-arch
```

#### 7. Set Up a Deploy SSH Key

On the VPS, create a dedicated deploy user (or use your existing user). On your **local machine**, generate an SSH key pair:

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/vps_deploy_key -N ""
```

Copy the **public** key to the VPS:

```bash
ssh-copy-id -i ~/.ssh/vps_deploy_key.pub <user>@<VPS_IP>
```

You will add the **private** key as a GitHub Secret in the next section.

### GitHub Secrets Configuration

Go to your repository → **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `VPS_HOST` | Your VPS public IP address |
| `VPS_USER` | SSH username on the VPS (e.g. `root` or `deploy`) |
| `VPS_SSH_KEY` | Contents of `~/.ssh/vps_deploy_key` (the **private** key) |
| `OPENAI_API_KEY` | Your OpenAI API key for the LLM adapter |

> **Note:** GHCR authentication uses the built-in `GITHUB_TOKEN` — no additional secret is needed for pushing/pulling images.

### Automated Deployment (GitHub Actions)

Every push to `main` triggers the CI/CD pipeline (`.github/workflows/deploy.yml`):

1. **Test** — Runs lint and unit tests
2. **Build & Push** — Builds the Docker image, pushes to `ghcr.io/<owner>/next-clean-arch:<sha>` and `:latest`
3. **Deploy** — SSHes into the VPS, imports the image into k3d, and runs `rad deploy`

Simply push or merge to `main` and the deployment happens automatically.

### Manual Remote Deployment

If you need to deploy manually from the VPS itself:

```bash
ssh <user>@<VPS_IP>
cd /opt/next-clean-arch
git pull origin main

# Deploy with a specific GHCR image
make deploy-remote IMAGE=ghcr.io/<owner>/next-clean-arch:latest
```

Or build and deploy locally on the VPS:

```bash
make deploy-local
```


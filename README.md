# james-remote-server-connector: Remote Linux Monitor

A lightweight, agentless server monitoring dashboard designed for developers to track the health and security of remote Linux environments in real-time.

### 🚀 Overview

**james-remote-server-connector** bridges the gap between web development and system administration. It uses **OpenSSH** to securely connect to remote servers (Cloud VPS or local Vagrant instances) and execute lightweight Bash scripts to fetch performance metrics without requiring any pre-installed "agent" software on the target machine.

### 🛠️ Tech Stack

- **UI/UX:** Designed with Lovable (React/Tailwind)
- **Framework:** Next.js (Migrated from Vite for API Route support)
- **Security:** `node-ssh` for encrypted communication.
- **Auth:** SSH Public/Private Key Pair authentication (no passwords).

### 📋 Features & Roadmap

- [✔] **UI/UX Foundations:** High-fidelity dashboard design.
- [✔] **Framework Migration:** Transitioned to Next.js for secure server-side SSH handling.
- [✔] **Data Collection:** Finalizing Bash scripts for JSON-based metric reporting.
- [✔] **Integration:** Connecting the frontend dashboard to the `node-ssh` backend.

#### Accessibility

**Live Url**: `https://james-remote-server-dashboard.netlify.app/`

#### Important "Ethical Hacking" Tip for Online Servers

When you move from Vagrant (Local) to an Online Server, security is much more dangerous:

    - UFW is Mandatory: The moment your server goes online, bots will try to SSH into it. Run sudo ufw allow 22 and sudo ufw enable immediately.
    - Disable Passwords: Ensure your /etc/ssh/sshd_config has PasswordAuthentication no. This forces the server to only accept your SSH Key.
    - Monitor Logs: Use your dashboard to watch for failed login attempts. You will likely see hundreds of IPs from around the world trying to guess your password—this is great data for your "Security Logs" feature!

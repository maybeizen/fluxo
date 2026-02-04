# Proxmox VE Service Plugin

Example service plugin for provisioning VMs or containers via Proxmox VE. This is a **stub implementation**: it validates config and returns a placeholder external ID. Implement real Proxmox API calls (e.g. create VM from template) to use in production.

## Configuration

1. Enable the plugin in Admin → Plugins.
2. Set **Plugin config**: `apiUrl` (Proxmox API URL) and `token` (API token).
3. Create a product and select "Proxmox VE"; set node, storage, memory, disk, etc.

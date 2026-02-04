# Pterodactyl Service Plugin

Provisions game servers via the Pterodactyl Panel API when a product uses this service plugin.

## Configuration

1. Enable the plugin in Admin → Plugins.
2. Set **Plugin config** (Admin → Plugins → Pterodactyl → Config): `baseUrl` (Panel URL) and `apiKey` (Application API key).
3. Create a product and select "Pterodactyl" as the service plugin; fill nest, egg, memory, disk, etc.

## Requirements

- Users must have a linked Pterodactyl user ID (Panel user) before provisioning.
- Product config must include at least: nestId, eggId, memory, disk.

# Security Policy

## Supported Versions

We apply security updates to the latest version of the site.

## Reporting a Vulnerability

Please report security vulnerabilities privately by opening a security advisory on GitHub or contacting the maintainers directly.

Do not disclose vulnerabilities publicly until they have been addressed.

## Security Hardening Applied

- Content Security Policy (CSP) via Azure Static Web Apps configuration
- Use of `textContent` for all dynamic user-provided content (titles, descriptions, category names)
- Input sanitization in the `add-resource.js` CLI tool
- Pinned GitHub Actions and Dependabot for dependency updates
- Least-privilege permissions in CI workflow
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.)

This is a static site. The main remaining risk vector is through the curated `resources.json` data.

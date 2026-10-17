# MarginDesk

A responsive, browser-based pricing calculator for independent sellers. Calculate per-order profit after discounts, product cost, delivery, packaging and platform fees. Compare up to 12 saved scenarios, export them as JSON, and print a report.

**[Open the live app](https://westwordcorp.com/tools/margindesk/)**

[![Test pricing calculations](https://github.com/harshgulatidev/margindesk/actions/workflows/test.yml/badge.svg)](https://github.com/harshgulatidev/margindesk/actions/workflows/test.yml)
[![Deploy to Hostinger](https://github.com/harshgulatidev/margindesk/actions/workflows/deploy.yml/badge.svg)](https://github.com/harshgulatidev/margindesk/actions/workflows/deploy.yml)

![MarginDesk desktop preview](desktop.png)

## Features

- Live profit, margin, break-even list price and target-margin pricing
- INR, USD, GBP and EUR display (no exchange-rate conversion)
- Browser-local scenario storage with graceful fallback when storage is unavailable
- No accounts, analytics, API calls or third-party runtime dependencies
- Keyboard-accessible controls, mobile layouts and print styles
- Explicit handling of losses, free orders and unattainable targets

## Run locally

From the project directory, run `python -m http.server 8080 --directory dist`, then visit `http://localhost:8080`.

Run the calculation tests with Node.js 18 or later:

```sh
npm test
```

## Deploy on Hostinger

Upload the contents of `dist/` to an empty directory under a website's `public_html`, keeping all five files together. No build step, database or server runtime is required. Deploying below an existing website, such as `/tools/margindesk/`, works without changing existing site routes.

For Git deployment, connect the repository through Hostinger's Git integration. If your plan cannot publish the `dist/` subdirectory directly, use an isolated checkout and copy only `dist/` into the application's public directory. Never expose `.git` or credentials beneath the web root.

### This project's deployment

Pushes to `main` run the calculation tests, then deploy that exact tested commit to the live app through GitHub Actions. A dedicated SSH key in the `production` environment is restricted to the MarginDesk deployment command on the hosting server. The workflow verifies the SSH host key and deploys only the five files in `dist/`. Deployment source and Git metadata stay outside the website document root.

For another hosting account, configure its own repository/environment secrets and variables. Required secrets: `HOSTINGER_DEPLOY_KEY`, `HOSTINGER_KNOWN_HOSTS`. Required variables: `HOSTINGER_HOST`, `HOSTINGER_USER`, `HOSTINGER_PORT`. The remote deployment script must exist before enabling the workflow.

## Calculations

Revenue = list price × (1 − discount / 100).

Profit = revenue × (1 − percentage fee / 100) − product cost − shipping − packaging − fixed fee.

Margin = profit / revenue × 100. Margin is undefined when revenue is zero.

Target list price = (product cost + shipping + packaging + fixed fee) / ((1 − discount / 100) × (1 − (fee + target margin) / 100)). A non-positive denominator makes the target unavailable. Suggested and break-even prices round upward to the nearest currency cent; calculations retain full precision.

Assumptions: one item per order. Tax, returns, advertising and overhead are excluded. The shipping field is the amount the seller pays; customer-paid shipping is not modeled separately. The app provides arithmetic estimates, not accounting or tax advice.

## Privacy and security

Inputs stay in the browser. Saved scenarios use `localStorage`; clearing browser data deletes them. Exported files contain the scenario names and numbers you entered. No secret keys are required. Product names render as text, never HTML. A Content Security Policy blocks network connections from application JavaScript.

## Repository hygiene

Publish this project directory only. Existing deployment utilities, passwords, SSH private keys, WordPress configuration and customer databases must remain outside the repository. GitHub account SSH keys accept public keys only. Server credentials for automation belong in restricted repository/environment secrets if needed.

## Verification

Seven automated calculation tests pass. Fourteen browser checks pass against the live app, covering desktop/mobile rendering, saved scenarios, persistence, text-only product names, loss states, target pricing, validation, currency labels, export, removal and print output. Desktop and mobile screenshots were visually reviewed. See `browser-verification.json` and `deployment-verification.json` for results. The Actions badges above show the current test and deployment status.

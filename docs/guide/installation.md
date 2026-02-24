# oh-my-gemini-cli Extension Installation Guide

This guide follows the official Gemini CLI Extensions workflow.

## Prerequisites

1. Gemini CLI installed
2. Gemini authentication completed
3. Local clone of this repository

Check quickly:

```bash
gemini --version
```

## Step 1: Clone Repository

```bash
git clone https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli.git
cd oh-my-gemini-cli
```

## Step 2: Install as Gemini Extension

Run from your terminal (non-interactive mode):

```bash
gemini extensions install https://github.com/Joonghyun-Lee-Frieren/oh-my-gemini-cli
```

## Step 3: Verify Extension Loaded

Inside Gemini interactive mode:

```text
/extensions list
```

Or from terminal:

```bash
gemini extensions list
```

You should see `oh-my-gemini-cli` in the extension list.

## Step 4: Verify Core Features

Run one command and one skill:

```text
/omg:status
```

```text
$plan "Plan a small refactor in this repository"
```

If agent delegation is needed:

```text
/omg:team "Implement a small feature with planning and review"
```

## Optional: Agent Setting Check

OmG requests:

```json
{
  "experimental": {
    "enableAgents": true
  }
}
```

If your environment blocks extension-level settings, enable it in your Gemini settings manually.

## Upgrade

1. Pull latest repository changes.
2. Restart Gemini CLI.
3. Re-run `gemini extensions list` to confirm latest metadata is loaded.

## Uninstall

From terminal:

```bash
gemini extensions uninstall oh-my-gemini-cli
```

Create a Telegram skill that can send and receive messages.

1. Create directory `pi-skills/telegram`.
2. Inside that directory create `SKILL.md` with the following content:
```
---
name: telegram
description: "Send and receive messages via a Telegram bot."
usage:
  - telegram-send <chat_id> <message>
  - telegram-receive
---
```
3. Create `send.sh` script:
```
#!/usr/bin/env bash
set -euo pipefail

CHAT_ID="$1"
MESSAGE="$2"
TOKEN="$AGENT_LLM_TELEGRAM_BOT_TOKEN"

curl -s -X POST "https://api.telegram.org/bot$TOKEN/sendMessage" \
  -d "chat_id=$CHAT_ID" -d "text=$MESSAGE"
```
Make it executable.
4. Create `receive.sh` script:
```
#!/usr/bin/env bash
set -euo pipefail

TOKEN="$AGENT_LLM_TELEGRAM_BOT_TOKEN"
# optional last update id
LAST_ID=${1:-0}

curl -s "https://api.telegram.org/bot$TOKEN/getUpdates?offset=$LAST_ID"
```
Make it executable.
5. Activate the skill by creating a symlink from `.pi/skills/telegram` to the skill directory:
```
ln -s ../../pi-skills/telegram .pi/skills/telegram
```
6. Store the bot token as a secret so it is available as $AGENT_LLM_TELEGRAM_BOT_TOKEN inside the Docker container:
```
npx thepopebot set-agent-llm-secret TELEGRAM_BOT_TOKEN 8514135379:AAETthWcmwxDO3OSiE-uZLEFdLqWSHcD3Kw
```
After this job runs, you can use the commands `telegram-send <chat_id> <message>` and `telegram-receive` to interact with your Telegram bot.
# envguard

> Validate and audit `.env` files against a schema definition to catch missing or misconfigured variables before deployment.

---

## Installation

```bash
npm install -g envguard
```

Or use it directly with npx:

```bash
npx envguard
```

---

## Usage

Define a schema file (`.env.schema`) listing your required variables and their rules:

```ini
DATABASE_URL=required,url
PORT=required,number
NODE_ENV=required,enum:development|staging|production
API_KEY=required,min:32
DEBUG=optional,boolean
```

Then run `envguard` against your `.env` file:

```bash
envguard validate --schema .env.schema --env .env
```

**Example output:**

```
✔ DATABASE_URL   valid
✔ PORT           valid
✔ NODE_ENV       valid
✖ API_KEY        missing
✖ DEBUG          invalid value — expected boolean, got "yes"

2 errors found. Fix the issues above before deploying.
```

You can also integrate it into your CI pipeline or `package.json` scripts:

```json
{
  "scripts": {
    "prestart": "envguard validate --schema .env.schema --env .env"
  }
}
```

---

## Options

| Flag | Description |
|------|-------------|
| `--schema` | Path to the schema file (default: `.env.schema`) |
| `--env` | Path to the env file (default: `.env`) |
| `--strict` | Fail on unexpected variables not defined in schema |
| `--quiet` | Suppress output, exit code only |

---

## License

[MIT](LICENSE)
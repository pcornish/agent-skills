#!/usr/bin/env node
// Validate the discovery document against the vendored agent-manager schema.
//
// Checks:
//   1. The discovery JSON is well-formed.
//   2. It conforms to schemas/discovery.schema.json (JSON Schema 2020-12).
//
// Exits non-zero with a readable report on any failure.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const schemaPath = resolve(repoRoot, "schemas/discovery.schema.json");
const documentPath = resolve(repoRoot, ".agents/discovery.json");

function readJson(path) {
  const raw = readFileSync(path, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error: ${path} is not valid JSON:\n  ${error.message}`);
    process.exit(1);
  }
}

const schema = readJson(schemaPath);
const document = readJson(documentPath);

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(document);

if (!valid) {
  console.error("Error: discovery document failed schema validation:\n");
  for (const err of validate.errors ?? []) {
    const where = err.instancePath || "(root)";
    console.error(`  ${where} ${err.message}`);
    if (err.params && Object.keys(err.params).length > 0) {
      console.error(`    ${JSON.stringify(err.params)}`);
    }
  }
  process.exit(1);
}

// Extra guards the JSON Schema cannot express: source names must be unique,
// case-insensitively, because agent-manager rejects colliding names.
const seen = new Map();
let hasDuplicate = false;
for (const source of document.sources ?? []) {
  const key = source.name.toLowerCase();
  if (seen.has(key)) {
    hasDuplicate = true;
    console.error(
      `Error: duplicate source name "${source.name}" ` +
        `(collides with "${seen.get(key)}")`,
    );
  } else {
    seen.set(key, source.name);
  }
}

if (hasDuplicate) {
  process.exit(1);
}

console.log(
  `OK: ${documentPath} is valid against ${schemaPath} ` +
    `(${document.sources.length} source(s)).`,
);

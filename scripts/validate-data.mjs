#!/usr/bin/env node
// Validates campaign-data.json. Usage: node scripts/validate-data.mjs [path]
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve(process.argv[2] || "campaign-data.json");
const errors = [];
const fail = (message) => errors.push(message);

let data;
try {
  data = JSON.parse(readFileSync(file, "utf8"));
} catch (error) {
  console.error(`Cannot read ${file}: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(data.chapters) || !data.chapters.length) {
  fail('"chapters" must be a non-empty array');
} else {
  const ids = new Set();
  data.chapters.forEach((chapter, index) => {
    const name = `chapters[${index}]`;
    for (const key of ["id", "title", "location", "session", "summary"]) {
      if (typeof chapter[key] !== "string" || !chapter[key].trim()) fail(`${name}.${key} must be a non-empty string`);
    }
    if (ids.has(chapter.id)) fail(`${name}.id "${chapter.id}" is duplicated`);
    ids.add(chapter.id);
    if (chapter.id && !/^[a-z0-9-]+$/.test(chapter.id)) fail(`${name}.id must be lowercase letters, digits and hyphens`);
    for (const axis of ["x", "y"]) {
      if (typeof chapter[axis] !== "number" || chapter[axis] < 0 || chapter[axis] > 100) {
        fail(`${name}.${axis} must be a number between 0 and 100`);
      }
    }
    if (chapter.image && !/^https:\/\//.test(chapter.image) && !/^[\w./-]+$/.test(chapter.image)) {
      fail(`${name}.image must be an https URL or a relative path`);
    }
    if (chapter.quests !== undefined) {
      if (!Array.isArray(chapter.quests)) fail(`${name}.quests must be an array`);
      else chapter.quests.forEach((quest, i) => {
        if (typeof quest.text !== "string" || !quest.text.trim()) fail(`${name}.quests[${i}].text is required`);
      });
    }
    if (chapter.npcs !== undefined) {
      if (!Array.isArray(chapter.npcs)) fail(`${name}.npcs must be an array`);
      else chapter.npcs.forEach((npc, i) => {
        if (typeof npc.name !== "string" || !npc.name.trim()) fail(`${name}.npcs[${i}].name is required`);
      });
    }
  });
  if (data.currentChapter && !ids.has(data.currentChapter)) fail(`"currentChapter" does not match any chapter id`);
}

if (errors.length) {
  console.error(`${file} is invalid:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`${file} is valid (${data.chapters.length} chapters).`);

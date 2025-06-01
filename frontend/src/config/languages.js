import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { php } from "@codemirror/lang-php";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { StreamLanguage } from "@codemirror/language";
import { c, csharp, kotlin, scala } from "@codemirror/legacy-modes/mode/clike";
import { shell } from "@codemirror/legacy-modes/mode/shell";

export const languageExtensions = {
    javascript: () => javascript(),
    python: () => python(),
    java: () => java(),
    cpp: () => cpp(),
    css: () => css(),
    html: () => html(),
    json: () => json(),
    markdown: () => markdown(),
    php: () => php(),
    rust: () => rust(),
    sql: () => sql(),
    xml: () => xml(),
    yaml: () => yaml(),
    c: () => StreamLanguage.define(c),
    csharp: () => StreamLanguage.define(csharp),
    kotlin: () => StreamLanguage.define(kotlin),
    scala: () => StreamLanguage.define(scala),
    shell: () => StreamLanguage.define(shell),
    bash: () => StreamLanguage.define(shell),
    typescript: () => javascript(), // TypeScript uses same highlighting as JavaScript
    text: () => javascript(), // Fallback for unknown file types
};

export const languageIds = {
    javascript: "nodejs",
    python: "python3",
    java: "java",
    cpp: "cpp17",
    css: "css",
    html: "html",
    json: "json",
    markdown: "markdown",
    php: "php",
    rust: "rust",
    sql: "sql",
    xml: "xml",
    yaml: "yaml",
    c: "c",
    csharp: "csharp",
    kotlin: "kotlin",
    scala: "scala",
    shell: "bash",
    typescript: "nodejs", // TypeScript compiled to JS
};

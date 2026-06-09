// to prevent regex injection attacks
// takes ., ?, *, [, ], \, and $ as special characters and escapes them by prefixing with a backslash, so that they are treated as literal characters(normal characters) instead of special characters in the regex pattern. For example, if the search term is "price.*", escapeRegex will return "price\.\*", and new RegExp(escapeRegex(search), "i") will create a regex that matches the literal text "price.*" case-insensitively, instead of interpreting . and * as regex wildcards ( \\$& is the placeholder for the matched special character, and the backslash is added before it to escape it in the regex pattern).

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/* escapeRegex("price.*");        // → "price\.\*"
escapeRegex("test?");          // → "test\?"
escapeRegex("$100");           // → "\$100"
escapeRegex("(special)");      // → "\(special\)" */

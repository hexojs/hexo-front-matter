# hexo-front-matter

[![CI](https://github.com/hexojs/hexo-front-matter/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/hexojs/hexo-front-matter/actions/workflows/ci.yml)
[![NPM version](https://badge.fury.io/js/hexo-front-matter.svg)](https://www.npmjs.com/package/hexo-front-matter)
[![Coverage Status](https://coveralls.io/repos/github/hexojs/hexo-front-matter/badge.svg)](https://coveralls.io/github/hexojs/hexo-front-matter)

Front-matter parser.

## What is Front-matter?

Front-matter allows you to specify data at the top of a file. Here are two formats:

**YAML front-matter**

```
---
layout: false
title: "Hello world"
---
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
```

**JSON front-matter**

```
;;;
"layout": false,
"title": "Hello world"
;;;
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
```

Prefixing separators are optional.

## API

### parse(str, [options])

Parses front-matter.

Option | Description | Default | Since
--- | --- | --- | ---
`defaultTimeZone` | Default timezone for timestamps without timezone specification (e.g., `Asia/Tokyo`, `Europe/Paris`, `America/New_York`). See [Timezone Behavior](#timezone-behavior) for detailed behavior. | `undefined` | v5.0.0

### stringify(obj, [options])

Converts an object to a front-matter string.

Option | Description | Default
--- | --- | ---
`mode` | The mode can be either `json` or `yaml`. | `yaml`
`separator` | Separator | `---`
`prefixSeparator` | Add prefixing separator. | `false`

### split(str)

Splits a YAML front-matter string.

### escape(str)

Converts hard tabs to soft tabs.

## Timezone Behavior

Starting from `v5.0.0`, the timezone handling has been changed. Below is a comparison of the behavior between `v4.x` and `v5.x`:

### Behavior Differences

| Front-matter Timestamp | `defaultTimeZone` Option (typically from Hexo config) | v4.x Behavior | v5.x Behavior |
|------------------------|---------------------------------------------|---------------|---------------|
| With timezone<br>(e.g., `2025-01-01T12:00:00+08:00`) | Not specified | Uses machine's local timezone | Uses the specified timezone |
| With timezone<br>(e.g., `2025-01-01T12:00:00+08:00`) | Specified | Uses machine's local timezone | Uses the specified timezone |
| Without timezone<br>(e.g., `2025-01-01T12:00:00`) | Not specified | Uses machine's local timezone | Treats as UTC |
| Without timezone<br>(e.g., `2025-01-01T12:00:00`) | Specified | Uses machine's local timezone | Uses `defaultTimeZone` |
| Date only<br>(e.g., `2025-01-01`) | Not specified | Treats as 00:00:00 in machine's local timezone | Treats as 00:00:00 UTC |
| Date only<br>(e.g., `2025-01-01`) | Specified | Treats as 00:00:00 in machine's local timezone | Treats as 00:00:00 in `defaultTimeZone` |

## License

MIT
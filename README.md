# ml-sem-taxonomy

Currently this lets you browse the [World Bank Group Topical Taxonomy](http://vocabulary.worldbank.org/taxonomy.html) in a browser. More to come...

## Requirements

- MarkLogic
- Node.js

## To Run

```git clone https://github.com/wooldridge/ml-sem-taxonomy```

```cd ml-sem-taxonomy```

```npm install```

Copy `config_sample.js` to `config.js` and edit `config.js` for your setup (path, user, password, etc.).

```node setup```

```node server```

In browser, open: `http://localhost:8563`

To undo setup from root directory: `node teardown`

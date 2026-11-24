# claude-mods

Mods for Claude Code.

## copy-gate

Checks every customer email Claude drafts or sends through Outlook (or Gmail) and refuses it,
with the reasons, when it breaks the shop's writing rules. Claude then has to fix the draft and try again.

It refuses a draft that:

- contains an em-dash, or a spaced en dash or `--` standing in for one
- still has a `[CONFIRM: ...]` flag in it
- mentions tires and uses warranty, mileage-guarantee or road-hazard language
- is a priced tire quote when the `tire-quote-email` skill has not loaded this session
- has a dollar figure when the `econolube-pricing` skill has not loaded this session

The quoted original of a reply is not checked, since that is the customer's text.

For mail that is not customer mail (a supplier warranty claim, a note to a coworker), type
`/copy-gate off` at the prompt. `/copy-gate on` turns it back on and `/copy-gate status` shows
the state and which skills have loaded. Only a person typing at the prompt can switch it off; Claude cannot.

### Install

At the prompt of a Claude Code session:

```
/plugin install copy-gate --marketplace syzygy2005/claude-mods
```

Answer `y` to add the marketplace, then pick a scope (user scope makes it apply everywhere).

From a shell:

```bash
claude plugin install copy-gate --marketplace syzygy2005/claude-mods
```

### Developing

```bash
claude plugin validate copy-gate
```

```bash
claude plugin test copy-gate
```

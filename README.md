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

## confirm-flags

After each reply, a row above the prompt lists every `[CONFIRM: ...]` flag still open in it,
in amber. Click a flag to drop it into the prompt so you can answer it. The row clears when a
reply has no flags left, with a short "All [CONFIRM] flags cleared" notice. `Hide` tucks it away
until the next reply, and `/flags` lists them in full.

```
/plugin install confirm-flags --marketplace syzygy2005/claude-mods
```

## shop-hours

A status line entry: whether the mechanical side is open right now (Edmonton time), and any
Alberta stat holiday closure in the next two weeks, so you don't book into one.

- Closed weekends and on the nine Alberta general holidays: New Year's Day, Family Day,
  Good Friday, Victoria Day, Canada Day, Labour Day, Thanksgiving, Remembrance Day, Christmas Day.
- Open on National Day for Truth and Reconciliation.
- Optional holidays (Easter Monday, Heritage Day, Boxing Day) are treated as open days.
- A holiday that lands on a weekend is not moved to a weekday.

Opening and closing times are blank until you set them (24-hour, like `08:00`) in `/config`
under shop-hours. Until then it shows open or closed by day only.

```
/plugin install shop-hours --marketplace syzygy2005/claude-mods
```

## econolube-look

Econolube colours for the Claude desktop and mobile apps, from the brand guide: Highlight Blue
accent, Charcoal text in light mode, white on near-black in dark mode, and your own messages on a
Yellow band with Charcoal type. Yellow never carries text. The terminal and editors draw no theme.

```
/plugin install econolube-look --marketplace syzygy2005/claude-mods
```

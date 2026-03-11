# Tracery for Obsidian v0.1.0

A port of [Kate Compton's **Tracery** library](https://github.com/galaxykate/tracery) for [Obsidian](https://obsidian.md/).

## What this does
Tracery is a generative text grammar before the concept of "text generation" was a cool buzzword.

If you've ever followed a Twitter bot back in the day, chances are it was built on Cheap Bots, Done Quick (rest in peace 🙏), which in itself runs on Tracery.

To use it, you have to build a **grammar**, which is a JSON object consisting of several arrays:

```json
{
  "origin": ["#vegetarian#. It is #flavor#.", "#meat#. It is #flavor#."],
  "vegetables": ["carrots", "potatoes", "turnips"],
  "meat": ["chicken", "beef", "pork"],
  "vegetarian": ["A delicious vegetable stew with #vegetables#, #vegetables#, and #vegetables#"],
  "regular": ["A delicious #meat# stew with #vegetables# and #vegetables#"],
  "flavor": ["spicy", "sweet", "salty", "sour", "savory"]
}
```

[Kate's tutorial over at the Crystal Code Palace](https://tracery.io/archival/crystalcodepalace/tracerytut.html) is a really good crash course for the library. If you're new to Tracery or haven't used it in a while, I urge you to run through the tutorial before building anything.

Using this plugin, you can generate text using these grammars straight into your Obsidian vault.

## Why you should use it
You can use Tracery for Obsidian to generate creative prompts, NPC descriptions, random encounters, and to simply build some randomization in your notes.

## Installation
Currently, this plugin isn't on the plugin gallery yet. You can either install this plugin by:
- Using [BRAT](https://github.com/TfTHacker/obsidian42-brat)
- Downloading the release zip file and extracting it into your vault's `.obsidian\plugins` folder.

## Usage
### Set up your grammar folder
Create a folder in your vault and input it into the plugin settings. Tracery for Obsidian (TfO) will automatically scan it for grammar files.
If regular Notices annoy you, it's also a good idea to turn off notifications.

### Write your first grammar
Grammars can be written in two ways: **JSON** or **YAML**.

Simply create a new file in your grammar folder, and create a json or yaml codeblock.

Use JSON if you're a Tracery traditionalist. 

```json
{
"animal": ["bear", "cat", "horse", "dog", "bunny", "bat", "sheep"],
"color": ["hot pink", "baby blue", "scarlet", "chartreuse", "orange"],
"emotion": ["happy", "sad", "silly", "angry", "curious"],
"origin": [
    "I'm going to Build-a-Bear and make #color.a# #emotion# #animal#."
]
}
```


Use YAML if you want something more readable. **Based on speed and familiarity, I really recommend this.** I highly recommend:
- wrapping all your strings in double quotes
    - but if it's just a single word (no spaces) then it's not really going to cause problems.
- NOT indenting; the plugin can't read indented YAML!

```yaml
animal:
- bear
- cat
- horse
- dog
- bunny
- bat
- sheep
color:
- "hot pink"
- "baby blue"
- scarlet
- chartreuse
- orange
emotion:
- happy
- sad
- silly
- angry
- curious
origin:
- 'I''m going to Build-a-Bear and make #color.a# #emotion# #animal#.'
```

### Call the grammars
There's two ways to call grammars:
1. Through [Templater](https://github.com/SilentVoid13/Templater/)
2. Through embeds

#### Calling through Templater
You can access the plugin through `app.plugins.getPlugin('tracery-for-obsidian')`, and you can generate text by running `grammarService.generateText(filename, rule)`. Like so:

```js
const tracery = app.plugins.getPlugin('tracery-for-obsidian');
const result = tracery.grammarService.generateText('cute-grammar.md', '#origin#');
// then you can toss the result like you would any other variable
```

Due to a quirk with the code, you need to add `'#origin#'` as the rule to access the origin rule (basically the very base of your grammar.) I'm going to figure this out eventually.

Also, this feature supports inline generation.

Anyway, this makes it so that whatever you roll on your grammar, you will keep that within the file you used the template in. Very cool!

### Calling through embeds
You might want to, instead, reroll text every time you load a file. You can do this by writing the grammar filename within a `tracery` code block.

**This one is a little more finicky.** As of now you can't use file names with pauses, so just use underscores and dashes.

```md
    ```tracery
        cute-grammar.md
    ```
```

Result:
```md
I'm going to Build-a-Bear and make a scarlet sad bunny.
```

(after refresh)
```md
I'm going to Build-a-Bear and make a scarlet happy cat.
```

Take note that this feature does not support inline generation.

## And that's it!
If you enjoy using the plugin, have questions, or would like to contribute - please ping me (@vagueposting) on the official Obsidian Discord. I don't accept DMs from strangers unfortunately but I'd love to chat on the server.
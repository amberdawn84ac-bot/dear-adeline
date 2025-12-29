# AI Illustration Generation Prompts

Use these prompts with DALL-E 3, Midjourney, or similar AI image generators to create consistent whimsical illustrations for Dear Adeline.

## Base Style Prompt
```
Simple line art illustration, black ink on white background with soft gray shading, 
whimsical and eclectic style, storybook quality, minimal detail, 
hand-drawn feel, with small pops of [COLOR]
```

## Character Illustrations

### Big-Eyed Children

**Curious Child Reading**
```
Simple line art illustration of an adorable child with very big eyes and big head, 
chibi proportions, wild curly hair, sitting cross-legged reading a book, 
black and white with gray shading, small pops of purple on hair bow, 
whimsical storybook style, minimal background
```

**Child Planting Seeds**
```
Simple line art of big-eyed child with oversized head, kneeling in garden, 
planting seeds, messy hair with leaves stuck in it, black ink with gray shading, 
small pops of coral on gardening gloves, whimsical style
```

**Child Looking Through Magnifying Glass**
```
Line art of adorable child with huge expressive eyes, big head, 
examining flower with magnifying glass, excited expression, 
black and white with gray tones, small pop of magenta on flower, 
simple whimsical style
```

**Child with Arms Full of Books**
```
Simple line drawing of chibi-style child with enormous eyes, 
struggling to carry stack of oversized books, determined smile, 
wild hair sticking up, black ink with gray shading, 
tiny pops of gold on book spines
```

## Forest Animals

**Mouse Holding Wildflower**
```
Whimsical line art of adorable mouse with very large eyes, 
holding a daisy flower, sitting upright, black and white with gray shading, 
small pop of magenta on flower petals, simple storybook style
```

**Wise Owl on Branch**
```
Simple line illustration of gentle owl with big round eyes, 
perched on tree branch, soft expression, black ink with gray tones, 
small pops of blue on feathers, minimal detail, whimsical style
```

**Curious Rabbit**
```
Line art of sweet rabbit with oversized eyes and long ears, 
nose twitching, black and white with gray shading, 
small pop of coral on nose, simple whimsical style
```

**Hedgehog with Mushroom**
```
Whimsical line drawing of tiny hedgehog next to large mushroom, 
big innocent eyes, black ink with gray shading, 
small pops of purple on mushroom cap, storybook quality
```

**Deer with Flowers**
```
Simple line art of gentle deer with large doe eyes, 
wildflowers woven in antlers, black and white with gray tones, 
small pops of magenta and coral on flowers, minimal style
```

## Wildflowers & Nature

**Wildflower Cluster**
```
Eclectic mix of wildflowers - daisies, poppies, dandelions, 
simple line art, black ink with gray shading, 
pops of purple, magenta, and coral on petals, 
whimsical hand-drawn style, white background
```

**Single Daisy**
```
Simple line drawing of single daisy flower, 
black ink with soft gray shading on petals, 
small pop of gold in center, minimal whimsical style
```

**Dandelion Seeds Blowing**
```
Line art of dandelion with seeds floating away, 
black and white with gray tones, 
tiny pops of blue on remaining seeds, 
simple whimsical illustration
```

**Poppy Flowers**
```
Cluster of poppies with delicate petals, 
simple line art, black ink with gray shading, 
vibrant pops of magenta and coral on petals, 
whimsical storybook style
```

## Mushrooms & Forest Elements

**Whimsical Mushroom Cluster**
```
Group of mushrooms in various sizes, some with spots, 
simple line art, black and white with gray shading, 
pops of purple and magenta on caps, 
eclectic whimsical style
```

**Single Toadstool**
```
Large spotted mushroom with curved stem, 
line art with gray shading, 
pops of coral on spots, 
simple storybook illustration
```

**Acorn with Oak Leaf**
```
Detailed acorn next to curled oak leaf, 
black ink line art with soft gray shading, 
small pop of gold on acorn cap, 
minimal whimsical style
```

**Tree Stump with Moss**
```
Cross-section of tree stump with growth rings, 
moss growing on top, simple line art, 
black and white with gray tones, 
tiny pops of blue-green on moss
```

## Scene Compositions

**Child Under Tree Reading**
```
Wide scene of big-eyed child sitting under large tree, 
reading book, forest animals gathering around, 
simple line art, black and white with gray shading, 
small pops of purple, magenta, and coral throughout, 
whimsical storybook illustration
```

**Garden Path with Flowers**
```
Winding garden path lined with wildflowers and mushrooms, 
simple line art, black ink with gray shading, 
pops of jewel tones (purple, magenta, coral, gold) on flowers, 
minimal whimsical style
```

**Child Planting with Animal Friends**
```
Big-eyed child planting seeds, surrounded by helpful animals 
(mouse, rabbit, bird), simple line art, gray shading, 
pops of color on flowers and accessories, 
eclectic whimsical storybook style
```

## Interactive Elements

**Clickable Flower Parts**
```
Detailed flower diagram showing petals, stem, roots, 
simple line art with labels, black and white with gray shading, 
each part highlighted with different color pop 
(purple petals, coral stem, blue roots), 
educational whimsical style
```

**Seed Growth Sequence**
```
Four-panel sequence showing seed sprouting into plant, 
simple line art, black and white with gray shading, 
progressive pops of color as plant grows, 
minimal whimsical illustration
```

## Size Variations

For each illustration, generate in three sizes:
- **Icon** (64x64px) - Simple, minimal detail
- **Card** (240x240px) - Standard detail
- **Hero** (480x480px) - Full detail

## Color Pop Guidelines

- **Purple** (#6B4B7E): Hair accessories, flower petals
- **Magenta** (#C7396B): Flowers, hearts, special items
- **Coral** (#E89B6F): Warm accents, clothing, tools
- **Blue** (#5B7B8F): Cool accents, water, sky elements
- **Gold** (#D4A574): Highlights, important items, achievements

## Batch Generation Commands

### Midjourney Batch
```
/imagine prompt: [BASE PROMPT] --ar 1:1 --style raw --v 6
```

### DALL-E 3 Settings
- Style: Natural
- Quality: Standard
- Size: 1024x1024
- Format: PNG with transparency

## Consistency Tips

1. Always use same base prompt for style consistency
2. Keep line weight consistent (2-3px)
3. Limit color pops to 10-15% of image
4. Maintain whimsical, hand-drawn feel
5. Avoid overly detailed or realistic rendering
6. Keep backgrounds minimal or white
7. Use soft gray shading (20-40% opacity)

## File Naming Convention
```
[category]_[subject]_[variation]_[size].svg
Examples:
- child_reading_curious_card.svg
- animal_mouse_flower_icon.svg
- flower_daisy_single_hero.svg
```

## Next Steps

1. Generate initial set of 30 illustrations
2. Convert to SVG format
3. Optimize file sizes
4. Create React components for each
5. Build illustration library

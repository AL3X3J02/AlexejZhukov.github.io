# alexejzhukov.com

My portfolio site. Plain HTML, CSS and JavaScript, hosted on GitHub Pages.

## Updating it

- **Projects, video work and artwork:** edit `js/data.js`. Projects are listed oldest first, and the last one is the final level. Each one has a world (1, 2 or 3), a screenshot in `assets/`, and a YouTube video id (the bit after `watch?v=`).
- **About, education, skills and contact text:** edit `index.html`.
- **Colours and fonts:** the variables at the top of `css/style.css`.
- **Images:** drop new files in `assets/` and point to them from `js/data.js` or `index.html`. WebP or JPG at around 1200px wide is plenty.

Changes go live a minute or two after you commit them.

## Folder layout

```
index.html        the page
css/style.css     all the styling
js/data.js        projects, side quests and artwork
js/main.js        level select, menus, achievements
js/tank.js        the tank mini-game on the title screen
assets/           images, logo, favicon and the link preview image
```

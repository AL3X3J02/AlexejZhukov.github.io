/* All portfolio content lives here. Add a project by copying one block. */

window.PORTFOLIO = {
  email: 'Alexejz4321@gmail.com',

  // Worlds group the levels on the level-select map.
  worlds: [
    { n: 1, name: 'Sixth form' },
    { n: 2, name: 'Undergrad' },
    { n: 3, name: "Master's and beyond" }
  ],

  // Game projects, OLDEST FIRST. Level 1 is the first one; the last one is the final level.
  // "yt" is a YouTube video id, "playlist" a YouTube playlist id.
  levels: [
    {
      id: 'horror-game', world: 1,
      title: 'Fear No Evil', short: 'Fear No Evil',
      engine: 'Unity',
      context: 'Sixth form college',
      body: 'A horror game made in Unity C# at sixth form college. Your objective is to find your way out.',
      tags: ['Unity', 'C#', 'Horror'],
      image: 'assets/horror-game.webp',
      yt: '9w3kG2WvxAY',
      report: 'https://alexejzhumedia.blogspot.com/'
    },
    {
      id: 'scifi-stealth', world: 1,
      title: 'Sci-Fi Stealth', short: 'Sci-Fi Stealth',
      engine: 'Unity',
      context: 'Sixth form college',
      body: 'A sci-fi stealth game made in Unity C# at sixth form college. The objective is to sneak your way out of the simulation.',
      tags: ['Unity', 'C#', 'Stealth'],
      image: 'assets/scifi-stealth.webp',
      yt: 'xIM0pytvytw',
      report: 'https://alexejzhukovmedia.wixsite.com/fmpwork'
    },
    {
      id: 'ue-course', world: 2, wip: true,
      title: 'Sci-Fi FPS in Unreal', short: 'Unreal FPS',
      engine: 'UE4',
      context: 'Self-directed, started in 2021, still a work in progress',
      body: 'Right after sixth form, just as I was starting my undergrad, I bought a Udemy course to learn Unreal Engine 4 properly. The playlist shows everything I have implemented from it so far. Not everything is in yet.',
      tags: ['Unreal Engine 4', 'Self-taught', 'FPS'],
      image: 'assets/ue-course.webp',
      playlist: 'PLcTA8QyntiK-50MxPo0-Yl_P3UfySpUHu'
    },
    {
      id: 'scifi-fps-unity', world: 2,
      title: 'Sci-Fi FPS Shooter', short: 'Sci-Fi FPS',
      engine: 'Unity',
      context: 'Undergraduate project, University of Essex',
      body: 'A sci-fi first-person shooter made in Unity C# during my undergraduate degree. You have to find the detonator so the nuclear reactor explodes and takes out the enemy outpost.',
      tags: ['Unity', 'C#', 'FPS'],
      image: 'assets/scifi-fps-unity.webp',
      yt: 'h82zKnh4BYo',
      report: 'https://drive.google.com/file/d/1m644-gSOi4aYvLCbbYQY80AlOJ6hH1rq/view'
    },
    {
      id: 'haha-haunters', world: 2,
      title: 'Ha-Ha Haunters', short: 'Ha-Ha Haunters',
      engine: 'Unity',
      context: '48 hour game jam, team of 3',
      body: 'Made in 48 hours with two teammates for a jam with the theme “Funny”. The goal is to survive as long as possible against the ghosts. Weapons are scattered around the map and every one of them sounds different. I led the team.',
      tags: ['Unity', 'C#', 'Game jam', 'Team lead'],
      image: 'assets/haha-haunters.webp',
      yt: 'O0LUN_tdeNw'
    },
    {
      id: 'arcade-recreation', world: 2,
      title: 'Arcade Classic Recreation', short: 'Arcade Remake',
      engine: 'Unity',
      context: "Bachelor's dissertation, University of Essex, 2024",
      body: 'For my undergraduate dissertation I recreated a classic arcade game in Unity C#, then added subtle changes of my own, including mixing 2D and 3D elements.',
      tags: ['Unity', 'C#', 'Dissertation'],
      image: 'assets/arcade-recreation.webp',
      yt: 'C7bW9JXvocY',
      report: 'https://drive.google.com/file/d/1wlfwHacPloQQKKnV8vv4rU4joQJvAFcG/view'
    },
    {
      id: 'wingsuit', world: 3,
      title: 'Mountain Sports: Wingsuit', short: 'Wingsuit',
      engine: 'UE5',
      context: 'Team project, built in one month, 2025',
      body: 'Each group was given one mountain sport to build inside a shared Unreal Engine 5 game, and ours was the wingsuit. We had a month, and many people in my group had never used Unreal before. Built with C++ and Blueprints. The report covers the parts I built.',
      tags: ['Unreal Engine 5', 'C++', 'Blueprints', 'Teamwork'],
      image: 'assets/wingsuit.webp',
      yt: 'UxBLVioMGxo',
      report: 'https://drive.google.com/file/d/1ig8XVqWMzzKshtdmzfdzJbdjvRXQGhQV/view'
    },
    {
      id: 'npc-simulation', world: 3, boss: true,
      title: 'NPC Simulation', short: 'NPC Simulation',
      engine: 'UE5',
      context: "Master's dissertation, University of Warwick, 2025",
      body: 'For my master’s dissertation I built a simulation of AI-driven NPCs living through an apocalyptic event. Everything was made in Unreal Engine 5 using Blueprints.',
      tags: ['Unreal Engine 5', 'Blueprints', 'Game AI'],
      image: 'assets/npc-simulation.webp',
      yt: 'WsLYqbnYWhc'
    }
  ],

  // Video and motion work.
  sideQuests: [
    { title: 'Title Sequence', tools: 'After Effects and Premiere Pro', image: 'assets/title-sequence.webp', videos: ['E9lgjzcobpc'] },
    { title: 'Car Cinematics', tools: 'Premiere Pro', image: 'assets/car-cinematic.webp',
      videos: ['_nxBUtBarD8', '0sxYZIw6Oe8', 'kDtR17JWqwU', 'qUTvBd-91fE', '2cvfpo5op40', '1wH1B0g4_j8'] },
    { title: 'Music Videos', tools: 'Premiere Pro', image: 'assets/music-video.webp', videos: ['cNUwwTQ6y-4', 'qqRjSfMMKOY'] },
    { title: 'Effects', tools: 'After Effects', image: 'assets/effects.webp', videos: ['pm5A1MJPVdY'] },
    { title: 'Stop Motion', tools: 'Lego and Premiere Pro', image: 'assets/lego-stop-motion.webp', videos: ['j6pmZfI6BeY', 'WAAWqB5CeUo', 'gzqnGmuhMkQ'] },
    { title: 'Cinematic Trailer', tools: 'After Effects', image: 'assets/ae-cinematic.webp', videos: ['2La33w7SwMA'] }
  ],

  // Design and illustration pieces (images to be added in the full build).
  artwork: [
    ['Running duck character', 'Illustrator'],
    ['Golden egg', 'Illustrator'],
    ['Game map tile set', 'Illustrator'],
    ['Wallpaper', 'Illustrator'],
    ['Self-portrait', 'Illustrator'],
    ['Ivan Polonski recreation', 'Illustrator'],
    ['Title card', 'Photoshop'],
    ['Photo composite', 'Photoshop'],
    ['Bouncing ball studies', 'Animate'],
    ['Lip sync', 'Animate']
  ]
};

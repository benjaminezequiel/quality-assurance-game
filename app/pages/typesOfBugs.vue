<template>
    <div class="bug-types">
        <NuxtLink to="report"><- BACK TO BUG REPORTING</NuxtLink>
        <summary>Usual types of bugs</summary>
        
        <h4>Asset Misplacement</h4>
        <p>
          Our world is made up of millions of assets, and our level designers work hard to place them realistically. Occasionally, objects may end up in illogical locations. Examples include:
          <ul>
            <li>A piece of loot dropped in an unrealistic spot</li>
            <li>An object duplicated unnaturally</li>
            <li>A traffic cone on a roof by mistake</li>
            <li>Flora that is not geographically accurate</li>
          </ul>
        </p>
      
        <h4>Texture Error</h4>
        <p>
          Textures cover everything from buildings and transport infrastructure to inaccessible interiors like apartments. AI-generated textures can sometimes create errors. Watch for:
          <ul>
            <li>Textures that appear artificial</li>
            <li>Floor surfaces on walls</li>
            <li>Graffiti in implausible spots</li>
            <li>Grass that is too green</li>
            <li>Incorrectly listed prices (e.g., coffee)</li>
          </ul>
        </p>
      
        <h4>NPC Dialogue</h4>
        <p>
          Report any non-playable-character dialogue that doesn’t make sense or breaks gameplay rules. Examples include:
          <ul>
            <li>Shopkeepers refusing polite conversation</li>
            <li>Overheard dialogue with factual errors</li>
          </ul>
        </p>
      
        <h4>NPC Behaviour</h4>
        <p>
          Non-playable characters are designed to act realistically. Report unusual behaviors such as:
          <ul>
            <li>Repeating a single action endlessly</li>
            <li>Walking in strange patterns</li>
            <li>Loitering without purpose</li>
            <li>Performing highly unconventional actions (e.g., using a typewriter in public)</li>
            <li>Duplicated NPCs appearing in the same area</li>
          </ul>
        </p>
      
        <h4>Gameplay System Error</h4>
        <p>
          The physics engine is highly realistic, including responsive weather. Due to its complexity, errors can occur. Look for:
          <ul>
            <li>Inaccurate gravity</li>
            <li>Unusual weather spikes</li>
          </ul>
        </p>
      
        <h4>Other</h4>
        <p>
          For bug types not covered by the above categories, report anything unusual. If unsure whether something is a bug, it’s better to report it than not, your colleagues can help evaluate it.
        </p>
        <br>
        <NuxtLink to="report"><- BACK TO BUG REPORTING</NuxtLink>
        <br>
    </div>

</template>

<style lang="scss" scoped>
.bug-types {
    display: flex;
    flex-direction: column;
    gap: 12px;

    summary {
        font-size: 24px;
    }
    h4, summary {
        margin-top: 16px;
        color: var(--green);
    }
}
</style>
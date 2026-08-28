## Overview

[ElevenLabs UI Vue](https://elevenlabs-ui-vue.com) provides pre-built, customizable Vue components specifically designed for agent & audio applications, including orbs, waveforms, voice agents, audio players, and more.
The CLI makes it easy to add these components to your Vue and Nuxt project.

## Installation
You can use the ElevenLabs UI Vue CLI directly with npx, or install it globally:

```bash
# Use directly (recommended)
npx elevenlabs-ui-vue@latest add <component-name>

# Or using shadcn-vue cli
npx shadcn-vue@latest add https://registry.elevenlabs-ui-vue.com/all.json
```

## Prerequisites
Before using ElevenLabs UI Vue, ensure your project meets these requirements:
- **Node.js 18** or later
- **shadcn-vue** initialized in your project (npx shadcn-vue@latest init)
- **Tailwind CSS** configured

## Usage

### Install All Components
Install all available ElevenLabs UI Vue components at once:
```bash
npx elevenlabs-ui-vue@latest
```
This command will:
- Set up shadcn-vue if not already configured
- Install all ElevenLabs UI Vue components to your configured components directory
- Add necessary dependencies to your project

### Install Specific Components
Install individual components using the `add` command:
```bash
npx elevenlabs-ui-vue@latest add <component-name>
```
Examples:
```bash
# Install the orb component
npx elevenlabs-ui-vue@latest add orb
```

### Alternative: Use with shadcn-vue CLI

You can also install components using the standard shadcn-vue CLI:
```bash
# Install all components
npx shadcn-vue@latest add https://registry.elevenlabs-ui-vue.com/all.json

# Install a specific component
npx shadcn-vue@latest add https://registry.elevenlabs-ui-vue.com/orb.json
```

All available components can be found [here](https://elevenlabs-ui-vue.com/docs/components), or explore the list of blocks [here](https://elevenlabs-ui-vue.com/blocks).

## Sponsors

ElevenLabs UI Vue is an open-source project supported by our sponsors. If you'd like to support its development, please consider [becoming a sponsor](https://opencollective.com/vuepont).

<table>
  <tr>
    <td width="180"><a href="https://immitranslate.com/" target="_blank" rel="noopener noreferrer"><img src="https://elevenlabs-ui-vue.com/sponsors/immitranslate.svg" alt="ImmiTranslate" width="150"></a></td>
    <td>Thanks to ImmiTranslate for sponsoring this project! ImmiTranslate provides on-demand certified translation services powered by professional human translators and supported by AI. It translates documents in 70+ languages for immigration and legal, academic, financial, and medical use, with notarization and physical delivery options available. <a href="https://immitranslate.com/">Visit ImmiTranslate</a> to learn more.</td>
  </tr>

  <tr>
    <td width="180"><a href="https://go.apimart.ai/gh-ai-elements-vue" target="_blank" rel="noopener noreferrer"><img src="https://elevenlabs-ui-vue.com/sponsors/apimart.svg" alt="APIMart" width="150"></a></td>
    <td>Thanks to APIMart for sponsoring this project! APIMart is a low-cost API platform for AI image &amp; video generation — GPT-Image-2 from $0.006/image, 160+ images per dollar. One async API covers both image and video: submit a task, get an ID, fetch results via polling or callback. Batch tens of thousands of images without timeouts, switch models without changing code. Pay-as-you-go with no monthly fee — <a href="https://go.apimart.ai/gh-ai-elements-vue">sign up here</a> to get started.</td>
  </tr>
</table>

## Contributing

If you'd like to contribute to ElevenLabs UI Vue, please follow these steps:

1. Fork the repository
2. Create a new branch
3. Make your changes to the components in `packages/elements/`.
4. Open a PR to the `main` branch.

## License

Licensed under the [MIT license](/LICENSE.md).


## Acknowledgments

This project is a direct port of [Elevenlabs UI](https://ui.elevenlabs.io/).

It is not affiliated with, endorsed by, or associated with the ElevenLabs team in any way.

The goal is simply to make a community-driven, similar UI experience for Vue developers.

---

Made with ❤️ by [vuepont](https://github.com/vuepont)

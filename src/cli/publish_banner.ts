const bold = '\u001b[1m'
const green = '\u001b[32m'
const cyan = '\u001b[36m'
const underline = '\u001b[4m'
const reset = '\u001b[0m'

export default `${bold}${green}┌──────────────────────────────────────────────────────────────────────────┐${reset}
${bold}${green}│${reset}${reset} Share your Cucumber Report with your team at ${underline}${bold}${cyan}https://reports.cucumber.io${reset} ${bold}${green}│${reset}
${bold}${green}│${reset}                                                                          ${bold}${green}│${reset}
${bold}${green}│${reset} Command line option:    ${cyan}--publish${reset}                                        ${bold}${green}│${reset}
${bold}${green}│${reset} Environment variable:   ${cyan}CUCUMBER_PUBLISH_ENABLED${reset}=${cyan}true${reset}                    ${bold}${green}│${reset}
${bold}${green}│${reset}                                                                          ${bold}${green}│${reset}
${bold}${green}│${reset} More information at ${underline}${bold}${cyan}https://reports.cucumber.io/docs/cucumber-js${reset}         ${bold}${green}│${reset}
${bold}${green}│${reset}                                                                          ${bold}${green}│${reset}
${bold}${green}│${reset} To disable this message, add this to your ${bold}./cucumber.js${reset}:                 ${bold}${green}│${reset}
${bold}${green}│${reset} ${bold}module.exports = { default: '--publish-quiet' }${reset}                          ${bold}${green}│${reset}
${bold}${green}└──────────────────────────────────────────────────────────────────────────┘${reset}
`

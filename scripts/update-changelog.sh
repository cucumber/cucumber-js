#!/usr/bin/env bash
set -uf -o pipefail

# Reads a changelog from STDIN and writes out a new one to STDOUT where:
#
# * The [Unreleased] diff link is updated
# * A new diff link for the new release is added
# * The ## [Unreleased] header is changed to a version header with date
# * The empty sections are removed
# * A new, empty [Unreleased] paragraph is added at the top
#

changelog=$(</dev/stdin)

new_version=$1

version_header=$(echo "${changelog}" | grep "^## \[${new_version}\]")
if [[ "${version_header}" != "" ]]; then
  echo "${changelog}"
  exit 0
fi

header=$(cat <<EOF
## [Unreleased] (In Git)

### Added

### Changed

### Deprecated

### Removed

### Fixed
EOF
)
header_escaped=${header//$'\n'/\\$'\n'}

# Update the [Unreleased] header

today=$(date +"%Y-%m-%d")
changelog=$(echo "${changelog}" | sed "s/## \[Unreleased\] (In Git)/## \[${new_version}\] (${today})/")

# Update [Unreleased] diff link
line_number_colon_unreleased_link=$(echo "${changelog}" | grep -n "\[Unreleased\]")
line_number=$(echo "${line_number_colon_unreleased_link}" | cut -d: -f1)
unreleased_link=$(echo "${line_number_colon_unreleased_link}" | awk '{print $2}')

if [[ "${unreleased_link}" =~ \/v([0-9]+\.[0-9]+\.[0-9]+(-rc\.[0-9]+)?) ]]; then
  last_version="${BASH_REMATCH[1]}"
  changelog=$(echo "${changelog}" | sed "s/v${last_version}\.\.\./v${new_version}.../")
else
  >&2 echo "No version found in link: ${unreleased_link}"
  exit 1
fi

# Insert a new release diff link

insertion_line_number=$((line_number + 1))
release_link=$(echo "${changelog}" | head -n ${insertion_line_number} | tail -1)

new_release_link=$(echo "${release_link}" | \
  sed "s/${last_version}/${new_version}/g" | \
  sed "s/v[0-9]\+.[0-9]\+.[0-9]\+/${last_version}/")

changelog=$(echo "${changelog}" | sed "${insertion_line_number} i \\
${new_release_link}
")

# Remove empty sections

scripts_path="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
changelog=$(echo "${changelog}" | awk -f "${scripts_path}/remove-empty-sections-changelog.awk")

# Insert a new [Unreleased] header

changelog=$(echo "${changelog}" | sed "s/----/----\\
${header_escaped}\\
/g")

echo "${changelog}"
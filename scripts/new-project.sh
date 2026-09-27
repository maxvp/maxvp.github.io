#!/bin/sh
# Creates a new project entry in projects/, opens it in $EDITOR (if set),
# then rebuilds the projects page.
#
# Usage: scripts/new-project.sh "Project title" [YYYY-MM]
#        (date defaults to the current month)

set -eu
cd "$(dirname "$0")/.."

if [ $# -lt 1 ] || [ -z "$1" ]; then
  echo 'usage: scripts/new-project.sh "Project title" [YYYY-MM]' >&2
  exit 1
fi

title=$1
date=${2:-$(date +%Y-%m)}
case $date in
  [0-9][0-9][0-9][0-9]-[0-9][0-9]) ;;
  *) echo "error: date must be YYYY-MM, got '$date'" >&2; exit 1 ;;
esac

# File name slug: "Python résumé generator" -> "python-resume-generator".
# Common accented letters become plain ones; anything else non-alphanumeric
# becomes "-". (Plain byte substitutions, so it behaves the same in any locale.)
slug=$(printf '%s' "$title" | LC_ALL=C sed '
  s/À/a/g; s/Á/a/g; s/Â/a/g; s/Ã/a/g; s/Ä/a/g; s/Å/a/g
  s/à/a/g; s/á/a/g; s/â/a/g; s/ã/a/g; s/ä/a/g; s/å/a/g
  s/È/e/g; s/É/e/g; s/Ê/e/g; s/Ë/e/g; s/è/e/g; s/é/e/g; s/ê/e/g; s/ë/e/g
  s/Ì/i/g; s/Í/i/g; s/Î/i/g; s/Ï/i/g; s/ì/i/g; s/í/i/g; s/î/i/g; s/ï/i/g
  s/Ò/o/g; s/Ó/o/g; s/Ô/o/g; s/Õ/o/g; s/Ö/o/g; s/ò/o/g; s/ó/o/g; s/ô/o/g; s/õ/o/g; s/ö/o/g
  s/Ù/u/g; s/Ú/u/g; s/Û/u/g; s/Ü/u/g; s/ù/u/g; s/ú/u/g; s/û/u/g; s/ü/u/g
  s/Ñ/n/g; s/ñ/n/g; s/Ç/c/g; s/ç/c/g
' | LC_ALL=C tr '[:upper:]' '[:lower:]' | LC_ALL=C sed 's/[^a-z0-9]\{1,\}/-/g; s/^-//; s/-$//')
file=projects/$date-$slug.md

if [ -e "$file" ]; then
  echo "error: $file already exists" >&2
  exit 1
fi

cat > "$file" <<EOF
---
title: $title
date: $date
client:
url:
featured: false
image:
preview:
alt:
---

One or two sentences about the project. Markdown links like [this](https://example.com) work.
EOF

echo "Created $file"

if [ -n "${EDITOR:-}" ]; then
  $EDITOR "$file"
  scripts/build-projects.sh
else
  echo "Edit it, then run: scripts/build-projects.sh"
fi

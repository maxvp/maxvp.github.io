#!/bin/sh
# Rebuilds the project list in site/projects/index.html from projects/*.md.
#
# Entries are sorted newest first by their `date:`, then by file name. Only
# the lines between the BEGIN/END PROJECTS comments in the page are replaced.
#
# Usage: scripts/build-projects.sh

set -eu
cd "$(dirname "$0")/.."

page=site/projects/index.html
entries=$(mktemp)
output=$(mktemp)
trap 'rm -f "$entries" "$output"' EXIT

grep -q '<!-- BEGIN PROJECTS' "$page" && grep -q '<!-- END PROJECTS' "$page" || {
  echo "error: $page is missing the BEGIN/END PROJECTS comments" >&2
  exit 1
}

# "date<TAB>file" for each entry, sorted, then render each file in order.
tab=$(printf '\t')
count=0
for file in projects/*.md; do
  date=$(sed -n 's/^date:[[:space:]]*//p' "$file" | head -n 1)
  printf '%s\t%s\n' "$date" "$file"
done | sort -t "$tab" -k1,1r -k2,2 | cut -f 2 > "$output"

while IFS= read -r file; do
  [ "$count" -gt 0 ] && echo >> "$entries"
  awk -f scripts/project.awk "$file" >> "$entries"
  count=$((count + 1))
done < "$output"

# Swap the generated entries in between the markers.
awk -v entries="$entries" '
  /<!-- END PROJECTS/ { skipping = 0 }
  !skipping { print }
  /<!-- BEGIN PROJECTS/ {
    while ((getline line < entries) > 0) print line
    skipping = 1
  }
' "$page" > "$output"
cat "$output" > "$page"

echo "Built $count projects into $page"

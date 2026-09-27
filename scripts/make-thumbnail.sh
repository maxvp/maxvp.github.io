#!/bin/sh
# Makes a project thumbnail and hover preview from any image, with ImageMagick.
#
#   site/img/projects/<name>.webp        128x128, center-cropped (shown at 64x64)
#   site/img/projects/<name>-large.webp  fits within 800x800 (never upscaled)
#
# Output is deterministic: every setting is fixed, EXIF orientation is applied
# and then all metadata (EXIF, color profiles, timestamps) is stripped, and
# processing is single-threaded. The same input and ImageMagick version always
# produce byte-identical files, so re-running only changes files when the
# source image changes.
#
# Usage: scripts/make-thumbnail.sh <image> [name]
#        (name defaults to the image's file name, e.g. "Frame Flow.png" -> frame-flow)

set -eu
cd "$(dirname "$0")/.."

if [ $# -lt 1 ] || [ $# -gt 2 ]; then
  echo 'usage: scripts/make-thumbnail.sh <image> [name]' >&2
  exit 1
fi

input=$1
if [ ! -f "$input" ]; then
  echo "error: $input not found" >&2
  exit 1
fi

name=${2:-$(basename "$input" | sed 's/\.[^.]*$//')}
name=$(printf '%s' "$name" | LC_ALL=C tr '[:upper:]' '[:lower:]' | LC_ALL=C sed 's/[^a-z0-9_-]\{1,\}/-/g; s/^-//; s/-$//')
if [ -z "$name" ]; then
  echo "error: can't make a file name from '$input'; pass a name" >&2
  exit 1
fi

# ImageMagick 7 is `magick`; ImageMagick 6 is `convert`.
if command -v magick >/dev/null 2>&1; then
  im=magick
elif command -v convert >/dev/null 2>&1; then
  im=convert
else
  echo "error: ImageMagick not found (install it with 'brew install imagemagick' or your package manager)" >&2
  exit 1
fi

dir=site/img/projects
mkdir -p "$dir"

# process <output> <resize options...>
# Shared settings. [0] reads only the first frame of animated or multi-page files.
process() {
  output=$1
  shift
  "$im" "$input[0]" -limit thread 1 -auto-orient -colorspace sRGB -strip \
    -filter Lanczos "$@" +repage \
    -quality 82 -define webp:method=6 -define webp:thread-level=0 \
    "$output"
}

process "$dir/$name.webp" -resize '128x128^' -gravity center -extent 128x128
process "$dir/$name-large.webp" -resize '800x800>'

echo "Created $dir/$name.webp and $dir/$name-large.webp"
echo
echo "Add to the project's front matter:"
echo "image: /img/projects/$name.webp"
echo "preview: /img/projects/$name-large.webp"

# Renders one projects/*.md file as an <article> for site/projects/index.html.
# Used by build-projects.sh; plain POSIX awk.
#
# Front matter (between --- lines), one "key: value" per line:
#   title     required
#   date      required, YYYY-MM
#   client    optional subtitle
#   url       optional link for the title and thumbnail
#   featured  true to show in the default "featured" view
#   image     optional thumbnail path, e.g. /img/projects/name.webp
#   preview   optional larger image shown on hover
#   alt       optional alt text for the thumbnail
#
# Body: a small Markdown subset. Paragraphs, "- " lists, [text](url) links,
# _emphasis_ or *emphasis*, and `code`. Anything else is printed as text.

function fail(msg) {
  printf "%s: %s\n", FILENAME, msg > "/dev/stderr"
  failed = 1
  exit 1
}

# Escape text for HTML.
function esc(s) {
  gsub(/&/, "\\&amp;", s)
  gsub(/</, "\\&lt;", s)
  gsub(/>/, "\\&gt;", s)
  return s
}

# Escape text for a double-quoted HTML attribute.
function attr(s) {
  s = esc(s)
  gsub(/"/, "\\&quot;", s)
  return s
}

# Wrap every match of regex string `re` (delimited by `n` chars on each side)
# in <tag>. (Regexes are passed as strings: a bare /re/ argument would be
# evaluated as `$0 ~ /re/`.)
function wrap(s, re, n, tag,    out) {
  out = ""
  while (match(s, re) && RLENGTH > 0) {
    out = out substr(s, 1, RSTART - 1) "<" tag ">" substr(s, RSTART + n, RLENGTH - 2 * n) "</" tag ">"
    s = substr(s, RSTART + RLENGTH)
  }
  return out s
}

# Inline formatting for text that isn't a link URL.
function spans(s) {
  s = esc(s)
  s = wrap(s, "`[^`]+`", 1, "code")
  s = wrap(s, "_[^_ ][^_]*_", 1, "em")
  s = wrap(s, "\\*[^* ][^*]*\\*", 1, "em")
  return s
}

# Inline formatting, converting [text](url) links first so URLs are left alone.
function inline(s,    out, start, len, link, mid) {
  out = ""
  while (match(s, /\[[^]]*\]\([^)]*\)/) && RLENGTH > 0) {
    # Save the match position: spans() calls match() and overwrites RSTART/RLENGTH.
    start = RSTART; len = RLENGTH
    link = substr(s, start, len)
    out = out spans(substr(s, 1, start - 1))
    s = substr(s, start + len)
    mid = index(link, "](")
    out = out "<a href=\"" attr(substr(link, mid + 2, length(link) - mid - 2)) "\">" spans(substr(link, 2, mid - 2)) "</a>"
  }
  return out spans(s)
}

function flush_paragraph() {
  if (para != "") body = body "        <p>" inline(para) "</p>\n"
  para = ""
}

function flush_item() {
  if (item != "") body = body "          <li>" inline(item) "</li>\n"
  item = ""
}

function close_list() {
  flush_item()
  if (in_list) body = body "        </ul>\n"
  in_list = 0
}

BEGIN {
  split("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec", month, " ")
}

# Front matter
NR == 1 && $0 != "---" { fail("must start with a --- front matter line") }
NR == 1 { in_front = 1; next }
in_front && $0 == "---" { in_front = 0; next }
in_front {
  key = $0; sub(/:.*/, "", key)
  value = $0; sub(/^[^:]*:[ \t]*/, "", value); sub(/[ \t]+$/, "", value)
  if (value ~ /^".*"$/ || value ~ /^'.*'$/) value = substr(value, 2, length(value) - 2)
  meta[key] = value
  next
}

# Body
/^[ \t]*$/ { flush_paragraph(); close_list(); next }
/^[-*] / {
  flush_paragraph(); flush_item()
  if (!in_list) body = body "        <ul>\n"
  in_list = 1
  item = substr($0, 3)
  next
}
in_list && /^[ \t]/ { sub(/^[ \t]+/, ""); item = item " " $0; next }
{
  close_list()
  sub(/^[ \t]+/, "")
  para = (para == "" ? $0 : para " " $0)
}

END {
  if (failed) exit 1
  flush_paragraph(); close_list()

  if (meta["title"] == "") fail("missing title")
  if (meta["date"] !~ /^[0-9][0-9][0-9][0-9]-[0-9][0-9]$/) fail("date must be YYYY-MM")
  m = substr(meta["date"], 6, 2) + 0
  if (m < 1 || m > 12) fail("date has an invalid month")

  tag = (meta["url"] != "" ? "a" : "span")
  href = (meta["url"] != "" ? " href=\"" attr(meta["url"]) "\"" : "")
  featured = meta["featured"] == "true"

  printf "    <article class=\"portfolio-item\"%s>\n", (featured ? " data-featured" : "")
  printf "      <span class=\"portfolio-year\">%s %s</span>\n", month[m], substr(meta["date"], 1, 4)
  printf "      <div class=\"portfolio-main-row\">\n"
  printf "        <div class=\"portfolio-main\">\n"
  printf "          <%s class=\"portfolio-title\"%s>%s%s</%s>\n", tag, href,
    (featured ? "<span class=\"portfolio-featured\" aria-hidden=\"true\">★</span>" : ""), esc(meta["title"]), tag
  if (meta["client"] != "") printf "          <div class=\"portfolio-client-subtitle\">%s</div>\n", esc(meta["client"])
  printf "        </div>\n"
  if (meta["image"] != "") {
    printf "        <%s class=\"portfolio-thumb\"%s%s>", tag, href,
      (meta["preview"] != "" ? " data-preview=\"" attr(meta["preview"]) "\"" : "")
    printf "<img src=\"%s\" alt=\"%s\" width=\"64\" height=\"64\" loading=\"lazy\"></%s>\n",
      attr(meta["image"]), attr(meta["alt"]), tag
  }
  printf "      </div>\n"
  printf "      <div class=\"portfolio-desc\">\n%s      </div>\n", body
  printf "    </article>\n"
}

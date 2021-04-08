function start_buffering() {
  buf = $0
}
function store_line_in_buffer() {
  buf = buf ORS $0
}
function clear_buffer() {
  buf = ""
}
/^### (Added|Changed|Deprecated|Removed|Fixed)$/ {
  start_buffering()
  next
}
/^## / {
  clear_buffer()
}
/^ *$/ {
  if (buf != "") {
    store_line_in_buffer()
  } else {
    print $0
  }
}
!/^ *$/ {
  if (buf != "") {
    print buf
    clear_buffer()
  }
  print $0
}
#!/bin/bash

# Check for the presence of an SVG file as an argument
if [[ $# -ne 1 || ! -f $1 ]]; then
  echo "Usage: $0 <path_to_svg_file>"
  exit 1
fi

# Get the file name without the extension
filename=$(basename -- "$1")
filename_noext="${filename%.*}"

# Encode the SVG content as base64
base64_encoded=$(base64 -i "$1")

# Construct the data URI
data_uri="export default 'data:image/svg+xml;base64,$base64_encoded'"

# Output the data URI
echo $data_uri
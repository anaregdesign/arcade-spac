#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "$*" >&2
  exit 1
}

append_output() {
  local key="$1"
  local value="$2"

  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    printf '%s=%s\n' "$key" "$value" >>"$GITHUB_OUTPUT"
  fi
}

validate_fully_qualified_image_ref() {
  local image_ref="$1"
  local registry="$2"
  local remainder="${image_ref#*/}"
  local repository=""
  local tag=""
  local digest=""

  [[ "$image_ref" != *[[:space:]]* ]] || fail "IMAGE_REF must not contain whitespace."
  [[ "$image_ref" == */* ]] || fail "IMAGE_REF must include an explicit registry and repository path."
  [[ "$registry" == *.* || "$registry" == *:* || "$registry" == "localhost" ]] || fail "IMAGE_REF registry must be explicit; received ${registry}."
  [[ -n "$remainder" ]] || fail "IMAGE_REF repository path is missing."

  if [[ "$image_ref" == *@* ]]; then
    repository="${remainder%@*}"
    digest="${image_ref##*@}"
    [[ -n "$repository" ]] || fail "IMAGE_REF repository path is missing before digest."
    [[ "$digest" =~ ^[A-Za-z0-9_+.-]+:[A-Fa-f0-9=_-]{32,}$ ]] || fail "IMAGE_REF digest is invalid: ${digest}."
    return 0
  fi

  repository="${remainder%:*}"
  tag="${remainder##*:}"
  [[ "$repository" != "$remainder" ]] || fail "IMAGE_REF must include a tag or digest."
  [[ -n "$repository" ]] || fail "IMAGE_REF repository path is missing before tag."
  [[ -n "$tag" ]] || fail "IMAGE_REF tag is empty."
}

input_image_ref="${IMAGE_REF_INPUT:-${IMAGE_REF:-}}"
[[ -n "$input_image_ref" ]] || fail "IMAGE_REF_INPUT or IMAGE_REF is required."

resolved_image_ref="$input_image_ref"
if [[ "$input_image_ref" == sha256:* ]]; then
  [[ -n "${DEFAULT_IMAGE_REPOSITORY:-}" ]] || fail "DEFAULT_IMAGE_REPOSITORY is required when IMAGE_REF_INPUT is a digest."
  resolved_image_ref="${DEFAULT_IMAGE_REPOSITORY}@${input_image_ref}"
elif [[ "$input_image_ref" != */* ]]; then
  [[ "$input_image_ref" != *:* ]] || fail "IMAGE_REF_INPUT must be either a release tag or a fully qualified image reference."
  [[ "$input_image_ref" != *@* ]] || fail "IMAGE_REF_INPUT must be either a release tag or a fully qualified image reference."
  [[ -n "${DEFAULT_IMAGE_REPOSITORY:-}" ]] || fail "DEFAULT_IMAGE_REPOSITORY is required when IMAGE_REF_INPUT is a release tag."
  resolved_image_ref="${DEFAULT_IMAGE_REPOSITORY}:${input_image_ref}"
fi

validate_fully_qualified_image_ref "$resolved_image_ref" "${resolved_image_ref%%/*}"

echo "Resolved recovery image reference: ${resolved_image_ref}"
append_output "image_ref" "$resolved_image_ref"

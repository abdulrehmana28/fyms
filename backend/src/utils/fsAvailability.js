// Simple module to track whether writing to the local filesystem is available.
// Used by startup logic and any handlers that rely on uploads or temporary
// directories. If the directories fail to be created at boot we set the flag to
// false so later requests can gracefully reject with 503 instead of crashing.

let fileSystemAvailable = true;

export function isFileSystemAvailable() {
  return fileSystemAvailable;
}

export function setFileSystemAvailable(value) {
  fileSystemAvailable = !!value;
}

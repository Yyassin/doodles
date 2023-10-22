/**
 * A helper to make a specified HTML element
 * take up the entire screen.
 * @author Yousef Yassin
 */

/**
 * Extensions of the native Document and HTMLElement
 * interface to adopt the Apple fullscreen conventions. This
 * isn't typed automatically, and is needed since Apple has
 * its own convention for requesting fullscreen.
 */
interface SafariDocument extends Document {
  webkitFullscreenElement: boolean;
  webkitExitFullscreen: () => void;
}
interface SafariHTMLElement extends HTMLElement {
  webkitRequestFullscreen: () => void;
}

/**
 * Toggles fullscreen mode for the specified HTML
 * element. If the element is in fullscreen, then exit.
 * Enter fullscreen, otherwise.
 * @param elem The element to toggle fullscreen for.
 */
export const toggleFullscreen = (elem: HTMLElement) => {
  const augmentedDocument = document as SafariDocument;
  const augmentedElem = elem as SafariHTMLElement;

  if (augmentedDocument.fullscreenElement) {
    augmentedDocument.exitFullscreen();
  } else if (
    !augmentedDocument.fullscreenElement &&
    augmentedElem.requestFullscreen
  ) {
    augmentedElem.requestFullscreen();
  }
  // 👇 safari -> doesn't support the standard yet
  else if (augmentedDocument.webkitFullscreenElement) {
    augmentedDocument.webkitExitFullscreen();
  } else if (
    !augmentedDocument.webkitFullscreenElement &&
    augmentedElem.webkitRequestFullscreen
  ) {
    augmentedElem.webkitRequestFullscreen();
  }
};

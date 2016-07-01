export interface IPageChanger {
  showFirstPage();
  transitionPage(targetPage: HTMLElement, goForward: boolean);
}

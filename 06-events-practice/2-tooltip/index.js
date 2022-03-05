class Tooltip {

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }
    return Tooltip.instance;
  }

  element;

  initialize () {
    this.initEventListeners()
  }

  initEventListeners() {
    document.addEventListener('pointerover', this.onMouseOver);
    document.addEventListener('pointerout', this.onMouseOut);
    document.addEventListener('pointermove', this.mouseMove);
  }

  deleteEventListeners() {
    document.removeEventListener('pointerover', this.onMouseOver);
    document.removeEventListener('pointerout', this.onMouseOut);
    document.removeEventListener('pointermove', this.mouseMove);
  }

  onMouseOver = (event) => {
    const tooltipArea = event.target.closest(['[data-tooltip]']);
    if (!tooltipArea) return

    const tooltipText = event.target.dataset.tooltip;
    this.render(tooltipText);
  }

  onMouseOut = () => {
    this.remove();
  }

  mouseMove = (event) => {
    const tooltip = event.target.closest(['[data-tooltip]']);
    if (!tooltip) return

    this.moveTooltip(event.x, event.y)
  }

  render(tooltipText) {
    this.createTooltipElement(tooltipText);
  }

  createTooltipElement(tooltipText) {
    this.element = document.createElement('div');
    this.element.className = "tooltip";
    this.element.textContent = tooltipText;

    document.body.append(this.element);
  }

  moveTooltip(xPos, yPos) {
    this.element.style.left = xPos + 10 +'px';
    this.element.style.top = yPos+ 10 +'px';
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.deleteEventListeners();
    this.remove();
    this.element = null;
  }
}

export default Tooltip;

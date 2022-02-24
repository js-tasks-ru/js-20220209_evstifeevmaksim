export default class ColumnChart {
  constructor( { data=[], label='', value=0, link='', formatHeading=value => value } = {} ) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.createChartElement();
  }

  chartHeight = 50;

  getChartTemplate() {
    return `<div class="column-chart ${this.data.length === 0 ? 'column-chart_loading' : ''}" style="--chart-height: ${this.chartHeight}">
              <div class="column-chart__title">
                ${this.label}
                ${this.getLinkTemplate()}
              </div>
              <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this.getColumnChartHeaderValue()}</div>
                <div data-element="body" class="column-chart__chart">
                  ${this.getChartNodesTemplate(this.data)}
                </div>
              </div>
            </div>`
  }

  createChartElement() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getChartTemplate();

    this.element = wrapper.firstElementChild;
  }

  getLinkTemplate() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }

  getColumnChartHeaderValue() {
    return this.formatHeading !== undefined ? this.formatHeading(this.value) : this.value;
  }

  update(arr = []) {
    const chartNodesTemplate = this.getChartNodesTemplate(arr);
    const chartNodesWrapper = document.createElement('div');
    chartNodesWrapper.innerHTML = chartNodesTemplate;

    const currentChart = this.element.querySelector('.column-chart__chart');
    currentChart.innerHTML = '';
    currentChart.append(...chartNodesWrapper.childNodes);
  }

  getChartNodesTemplate(arr = []) {
    const maxValue = Math.max(...arr);
    const scale = this.chartHeight /  maxValue;

    const calculateValue = item => Math.floor(item * scale);
    const calculatePercent = item => (item / maxValue * 100).toFixed();

    return arr.map(item => 
      `<div style="--value: ${calculateValue(item)}" data-tooltip="${calculatePercent(item)}%"></div>`)
      .join('');
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

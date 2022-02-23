export default class ColumnChart {
  constructor(chartObject) {
    this.createChartElement(chartObject);
  }

  chartHeight = 50;
  ordersStyle = "dashboard__chart_orders";
  salesStyle = "dashboard__chart_sales";
  customersStyle = "dashboard__chart_customers";

  getChartTemplate(chartObject) {
    if (!chartObject || chartObject.data?.length === 0) {
      return `<div class="column-chart column-chart_loading" style="--chart-height: 50">
                <div class="column-chart__title">
                  Total orders
                  <a class="column-chart__link" href="#">View all</a>
                </div>
                <div class="column-chart__container">
                  <div data-element="header" class="column-chart__header">
                    344
                  </div>
                  <div data-element="body" class="column-chart__chart">
                  </div>
                </div>
              </div>`
    }

    return `<div class=${chartObject.link !== undefined ? this.ordersStyle :
            chartObject.formatHeading !== undefined ? this.salesStyle : this.customersStyle}>
              <div class="column-chart" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                  ${chartObject.label}
                  ${this.getLinkTemplate(chartObject)}
                </div>
                <div class="column-chart__container">
                  <div data-element="header" class="column-chart__header">${this.getColumnChartHeaderValue(chartObject)}</div>
                  <div data-element="body" class="column-chart__chart">
                    ${this.getChartNodesTemplate(chartObject.data)}
                  </div>
                </div>
              </div>
            </div>`
  }

  createChartElement(chartObject) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getChartTemplate(chartObject);

    this.element = wrapper.firstElementChild;
  }

  getLinkTemplate(chartObject) {
    return chartObject.link ? `<a href="${chartObject.link}" class="column-chart__link">View all</a>` : '';
  }

  getColumnChartHeaderValue(chartObject) {
    return chartObject.formatHeading !== undefined ? chartObject.formatHeading(chartObject.value) : chartObject.value;
  }

  update(arr = []) {
    const chartNodesTemplate = this.getChartNodesTemplate(arr);
    const chartNodesWrapper = document.createElement('div');
    chartNodesWrapper.innerHTML = chartNodesTemplate;

    const currentChart = this.element.querySelector('.column-chart__chart');
    const removeChildNodes = node => {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }

    removeChildNodes(currentChart);
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

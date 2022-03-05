import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  constructor({
    url = "",
    range = {},
    label = "",
    link = "",
    formatHeading = (value) => value,
  } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.subElements = this.getSubElements();

    this.update(range.from, range.to);
  }

  data = {};
  value = 0;
  chartHeight = 50;
  subElements = {};

  getChartTemplate() {
    return `<div class="column-chart" style="--chart-height: ${this.chartHeight}">
              <div class="column-chart__title">
                ${this.label}
                ${this.getLinkTemplate()}
              </div>
              <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">
                </div>
                <div data-element="body" class="column-chart__chart">
                </div>
              </div>
            </div>`;
  }

  async getChartData(from, to) {
    const url = `${BACKEND_URL}/${this.url}?from=${from.toISOString()}&to=${to.toISOString()}`;
    return await fetchJson(url);
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getChartTemplate();

    this.element = wrapper.firstElementChild;
  }

  getLinkTemplate() {
    return this.link
      ? `<a href="${this.link}" class="column-chart__link">View all</a>`
      : "";
  }

  async update(start, end) {
    this.element.classList.add("column-chart_loading");

    const chartData = await this.getChartData(start, end);

    if (!Object.keys(chartData).length) {
      return;
    }

    this.element.classList.remove("column-chart_loading");

    const headerValue = Object.values(chartData).reduce(
      (sum, item) => sum + item,
      0
    );
    this.subElements.header.innerHTML = this.formatHeading(headerValue);
    this.subElements.body.innerHTML = this.getChartNodesTemplate(chartData);

    return chartData;
  }

  getChartNodesTemplate(chartData) {
    const maxValue = Math.max(...Object.values(chartData));
    const scale = this.chartHeight / maxValue;

    const calculateValue = (value) => Math.floor(value * scale);
    const calculatePercent = (value) => ((value / maxValue) * 100).toFixed();

    return Object.entries(chartData)
      .map(
        ([key, value]) =>
          `<div style="--value: ${calculateValue(value)}" data-tooltip="${calculatePercent(value)}%"></div>`
      )
      .join("");
  }

  getSubElements() {
    const result = {};

    const elements = this.element.querySelectorAll("[data-element]");
    elements.forEach((item) => {
      const name = item.dataset.element;
      result[name] = item;
    });

    return result;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

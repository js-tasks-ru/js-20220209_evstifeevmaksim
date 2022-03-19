import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";
const DASHBOARD_URL = "/api/dashboard";
const ORDERS_URL = `${DASHBOARD_URL}/orders`;
const SALES_URL = `${DASHBOARD_URL}/sales`;
const CUSTOMERS_URL = `${DASHBOARD_URL}/customers`;
const BESTSELLERS_URL = `${DASHBOARD_URL}/bestsellers`;

export default class Page {
  element = {};
  subElements = {};
  components = {};
  sorted = {
    id: "title",
    order: "asc",
  };

  onUpdateRange = async (e) => {
    await this.updateComponents(e.detail.from, e.detail.to);
  };

  constructor() {
    this.initComponents();
    this.initEventListeners();
  }

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.renderComponents(this.components);

    return this.element;
  }

  getTemplate() {
    return `<div class="dashboard full-height flex-column">
      <div class="content__top-panel">
        <h2 class="page-title">Панель управления</h2>
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="dashboardCharts" class="dashboard__charts">
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Лидеры продаж</h3>
      <div data-element="sortableTable"></div>
    </div>`;
  }

  initComponents() {
    const from = new Date();
    const to = new Date();
    from.setMonth(from.getMonth() - 1);

    const rangePicker = new RangePicker({
      from,
      to,
    });

    const ordersChart = new ColumnChart({
      url: ORDERS_URL,
      range: {
        from,
        to,
      },
      label: "orders",
      link: "#",
    });

    const salesChart = new ColumnChart({
      url: SALES_URL,
      range: {
        from,
        to,
      },
      label: "sales",
      formatHeading: (data) => `$${data}`,
    });

    const customersChart = new ColumnChart({
      url: CUSTOMERS_URL,
      range: {
        from,
        to,
      },
      label: "customers",
    });

    const sortableTable = new SortableTable(header, {
      url: `${BESTSELLERS_URL}?from=${from.toISOString()}&to=${to.toISOString()}`,
      isSortLocally: true,
      sorted: this.sorted,
      step: 30,
      start: 0,
    });

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable,
    };
  }

  renderComponents(components) {
    Object.entries(components).forEach(([key, value]) => {
      const { element } = value;
      this.subElements[key].append(element);
    });
  }

  initEventListeners() {
    document.addEventListener("date-select", this.onUpdateRange);
  }

  deleteEventListeners() {
    document.removeEventListener("date-select", this.onUpdateRange);
  }

  async updateComponents(from, to) {
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);

    const data = await this.getBestsellersData(from, to);
    this.components.sortableTable.update(data);
  }

  async getBestsellersData(from, to) {
    const url = new URL(BESTSELLERS_URL, BACKEND_URL);
    url.searchParams.set("from", from.toISOString());
    url.searchParams.set("to", to.toISOString());
    url.searchParams.set("_sort", this.sorted.id);
    url.searchParams.set("_order", this.sorted.order);
    url.searchParams.set("_start", 0);
    url.searchParams.set("end", 30);

    return await fetchJson(url);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    Object.values(this.components).forEach((component) => {
      component.destroy();
    });

    this.remove();
    this.deleteEventListeners();
    this.subElements = {};
    this.element = null;
  }
}

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  constructor(
    headersConfig, {
    url = '',
    isSortLocally,
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    startData = 0,
    limit = 30,
    endData = startData + limit
    } = {}) {

    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.startData = startData;
    this.limit = limit;
    this.endData = endData;

    this.render();
    this.initEventListeners()
  }

  element = {};
  subElements = {};
  data = [];
  isInfinityScroll = false;

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTableTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.data = await this.getData(this.sorted.id, this.sorted.order, this.startData, this.endData);
    this.updateTableBody(this.data);
  }

  getTableTemplate() {
    return `<div data-element="productsContainer" class="products-list__container">
              <div class="sortable-table">

                <div data-element="header" class="sortable-table__header sortable-table__row">
                  ${this.getHeaderRowTemplate(this.headersConfig)}
                </div>

                <div data-element="body" class="sortable-table__body">
                </div>

              </div>
            </div>`
  }

  getHeaderRowTemplate(headersConfig = []) {
    return headersConfig.map(item => {
      const defaultOrder = item.id === this.sorted.id ? this.sorted.order : 'asc';
      return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="${defaultOrder}">
                  <span>${item.title}</span>
                  ${this.getHeaderSortArrowTemplate(item.id)}
              </div>`
      }).join('');
  }

  getHeaderSortArrowTemplate(headerFieldId) {
    return headerFieldId === this.sorted.id ? 
      `<span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>` : '';
  }

  getBodyRowTemplate(data = []) {
    return data.map(item => `<a href="/${item.id}" class="sortable-table__row">
                              ${this.getBodyCellTemplate(item)}
                            </a>`).join('');
  }

  getBodyCellTemplate(item) {
    const columns = this.headersConfig.map(({id, template}) => {
     return {id, template};
    });

    return columns.map(({id, template}) => {
      if (template) {
        return template(item[id]);
      }
      return `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  sortOnClient(fieldId, order) {
    const sortedData = this.sortData(fieldId, order);
    this.updateTableBody(sortedData);
  }

  async sortOnServer(fieldId, order) {
    const sortedData = await this.getData(fieldId, order);
    this.updateTableBody(sortedData);
  }

  async getData(fieldId, order) {
    this.url.searchParams.set('_sort', fieldId);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', this.startData);
    this.url.searchParams.set('_end', this.endData);

    const data = await fetchJson(this.url);
    return data;
  }

  sortData(fieldId, order) {
    const direction = {
      asc: 1,
      desc: -1
    };

    let orderFunc = () => {};

    const numberSort = (a, b) => { 
      return direction[order] * (a[fieldId] - b[fieldId]);
    }

    const stringSort = (a, b) => { 
      return direction[order] * a[fieldId].localeCompare(b[fieldId], ['ru', 'en']);
    }

    const {sortType} = this.headersConfig.find(item => item.id === fieldId);
    switch (sortType) {
      case 'number':
        orderFunc = numberSort;
        break;

      case 'string':
        orderFunc = stringSort;
        break;
    }

    return [...this.data.sort(orderFunc)];
  }

  updateTableBody(data) {
    if (this.isInfinityScroll) {
      this.subElements.body.insertAdjacentHTML('beforeend', this.getBodyRowTemplate(data));
      this.data = [...this.data, ...data];

      this.isInfinityScroll = false;
      return
    }

    this.subElements.body.innerHTML = this.getBodyRowTemplate(data);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const item of elements) {
      const name = item.dataset.element;
      result[name] = item;
    }

    return result;
  }

  initEventListeners () {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    window.addEventListener('scroll', this.onScroll);
  }

  deleteEventListeners () {
    window.removeEventListener('scroll', this.onScroll);
  }
  
  onSortClick = (event) => {
    const currentField = event.target.closest('[data-sortable = "true"]');

    if (currentField) {
      const { id, order } = currentField.dataset;
      let newOrder = '';

      switch (order) {
        case 'asc':
          newOrder = 'desc';
          break;

        case 'desc':
          newOrder = 'asc';
          break;
      }

      currentField.dataset.order = newOrder;

      const arrow = currentField.querySelector('[data-element="arrow"]');
      if (!arrow) {
        currentField.append(this.subElements.arrow);
      }

      this.sorted.id = id;
      this.sorted.order = newOrder;
      this.startData = 0;
      this.endData = this.startData + this.limit;

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  }

  onScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (!this.isSortLocally && scrollTop + clientHeight >= scrollHeight) {
      this.isInfinityScroll = true;
      this.startData = this.endData;
      this.endData += this.limit;

      this.sortOnServer(this.sorted.id, this.sorted.order);
    }
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.deleteEventListeners();
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}

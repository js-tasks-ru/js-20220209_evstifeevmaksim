export default class SortableTable {
  headersConfig = [];
  data = [];
  sorted = {};
  element = {};
  subElements = {};

  constructor(
    headersConfig, {
    data = [],
    sorted = {}
    } = {}, 
    isSortLocally = true) {

    this.headersConfig = headersConfig;
    this.data = data;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;

    this.render();

    this.subElements = this.getSubElements(this.element);

    this.defaultSort();
    this.initEventListeners();
  }

  render() {
    this.element = this.createElementByTemplate( () => this.getTableTemplate() );
  }

  createElementByTemplate(templateFunc) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = templateFunc();

    return wrapper.firstElementChild;
  }

  getTableTemplate() {
    return `<div data-element="productsContainer" class="products-list__container">
              <div class="sortable-table">

                <div data-element="header" class="sortable-table__header sortable-table__row">
                  ${this.getHeaderRowTemplate(this.headersConfig)}
                </div>

                <div data-element="body" class="sortable-table__body">
                  ${this.getBodyRowTemplate(this.data)}
                </div>

              </div>
            </div>`
  }

  getHeaderRowTemplate(headersConfig = []) {
    return headersConfig.map(item => `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
                                      <span>${item.title}</span>
                                      <span data-element="arrow" class="sortable-table__sort-arrow">
                                        <span class="sort-arrow"></span>
                                      </span>
                                    </div>`).join('');
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

  defaultSort() {
    if (!this.sorted.id || !this.sorted.order) {
      return;
    }

    this.sort(this.sorted.id, this.sorted.order);
  }

  sort(fieldValue, orderValue) {
    if (this.isSortLocally) {
      this.sortOnClient(fieldValue, orderValue);
    } else {
      this.sortOnServer(fieldValue, orderValue);
    }

    this.updateTableHeader(fieldValue, orderValue, this.element);
    this.updateTableBody(this.data);
  }

  sortOnClient(fieldValue, orderValue) {
    this.sortData(fieldValue, orderValue);
  }

  sortOnServer(fieldValue, orderValue) {
    return;
  }

  sortData(fieldValue, orderValue) {
    const direction = {
      asc: 1,
      desc: -1
    };

    let orderFunc = () => {};

    const numberSort = (a, b) => { 
      return direction[orderValue] * (a[fieldValue] - b[fieldValue]);
    }

    const stringSort = (a, b) => { 
      return direction[orderValue] * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en']);
    }

    const currentField = this.headersConfig.find(item => item.id === fieldValue);
    if (!currentField || !currentField.sortable) {
      return;
    }

    switch (currentField.sortType) {
      case 'number':
        orderFunc = numberSort;
        break;

      case 'string':
        orderFunc = stringSort;
        break;
    }

    this.data.sort(orderFunc);
  }

  updateTableHeader(fieldValue, orderValue, element) {
    const allHeaderFields = this.getAllHeaderFields();
    const currentHeaderField = element.querySelector(`.sortable-table__cell[data-id = "${fieldValue}"]`);

    allHeaderFields.forEach(item => item.dataset.order = '');
    currentHeaderField.dataset.order = orderValue;
  }

  getAllHeaderFields() {
    return this.element.querySelectorAll('.sortable-table__cell[data-id]');
  }

  updateTableBody(data = []) {
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
    const allHeaderFields = this.getAllHeaderFields();

    allHeaderFields.forEach(item => {
      item.addEventListener('pointerdown', this.handleSortClick)
    });
  }

  deleteEventListeners () {
    const allHeaderFields = this.getAllHeaderFields();

    allHeaderFields.forEach(item => {
      item.removeEventListener('pointerdown', this.handleSortClick)
    });
  }
  
  handleSortClick = (event) => {
    const sortableField = event.currentTarget.dataset.sortable;
    const field = event.currentTarget.dataset.id;
    let order = event.currentTarget.dataset.order;

    if (sortableField === 'false') {
      return;
    }

    switch (order) {
      case '':
        order = 'desc';
        break;

      case 'asc':
        order = 'desc';
        break;

      case 'desc':
        order = 'asc';
        break;
    }
    
    this.sort(field, order);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.deleteEventListeners();
    this.remove();
    this.subElements = null;
    this.headersConfig = null;
    this.data = null;
    this.sorted = null;
  }
}

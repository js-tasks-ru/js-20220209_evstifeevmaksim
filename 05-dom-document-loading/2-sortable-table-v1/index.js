export default class SortableTable {
  element = {};
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
    this.subElements = this.getSubElements(this.element);
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
                  ${this.getHeaderRowTemplate(this.headerConfig)}
                </div>

                <div data-element="body" class="sortable-table__body">
                  ${this.getBodyRowTemplate(this.data)}
                </div>

              </div>
            </div>`
  }

  getHeaderRowTemplate(headerConfig = []) {
    return headerConfig.map(item => `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
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
    const columns = this.headerConfig.map(({id, template}) => {
     return {id, template};
    });

    return columns.map(({id, template}) => {
      if (template) {
        return template(item[id]);
      }
      return `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  sort(fieldValue, orderValue) {
    this.sortData(fieldValue, orderValue);

    this.updateTableHeader(fieldValue, orderValue, this.element);
    this.updateTableBody(this.data);
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

    const currentField = this.headerConfig.find(item => item.id === fieldValue);
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
    const allHeaderFields = element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentHeaderField = element.querySelector(`.sortable-table__cell[data-id = "${fieldValue}"]`);

    allHeaderFields.forEach(item => item.dataset.order = '');
    currentHeaderField.dataset.order = orderValue;
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

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}

export default class NotificationMessage {
  static previousNotification = null;

  constructor(
    text = '',
    {
      duration = 0, 
      type = ''
    } = {}) {
    this.text = text;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getNotificationTemplate();

    this.element = wrapper.firstElementChild;
  }

  getNotificationTemplate() {
    return `<div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
              <div class="timer"></div>
                <div class="inner-wrapper">
                  <div class="notification-header">${this.type}</div>
                  <div class="notification-body">
                    ${this.text}
                  </div>
                </div>
            </div>`
  }

  show(wrapper) {
    let targetElement = document.body;

    if (NotificationMessage.previousElement) {
      NotificationMessage.previousElement.remove();
    }

    if(wrapper) {
      targetElement = wrapper;
    }
    
    targetElement.append(this.element);
    setTimeout(this.remove.bind(this), this.duration);

    NotificationMessage.previousElement = this;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

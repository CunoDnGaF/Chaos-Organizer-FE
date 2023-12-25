import createRequest from './api/createRequest';

/**
 *  Класс для связи с сервером.
 *  Содержит методы для отправки запросов на сервер и получения ответов
 * */
export default class MessageService {
  constructor(url) {
    this.url = url;
  }

  login(data) {
    return createRequest(this.url, 'login', data);
  }

  firstList() {
    return createRequest(this.url, 'lastMessages');
  }

  lazyList(data) {
    return createRequest(this.url, 'lazyMessages', data);
  }

  get(data) {
    return createRequest(this.url, 'messageById', data);
  }

  create(data) {
    return createRequest(this.url, 'createMessage', data);
  }

  createFile(data) {
    return createRequest(this.url, 'createFile', data);
  }

  update(data) {
    return createRequest(this.url, 'updateById', data);
  }

  delete(data) {
    return createRequest(this.url, 'deleteById', data);
  }

  uploadFile(data) {
    return createRequest(this.url, 'uploadFile', data);
  }

  downloadFile(data) {
    return createRequest(this.url, 'downloadFile', data);
  }

  pinMessage(data) {
    return createRequest(this.url, 'pinMessage', data);
  }

  getPinnedMessage() {
    return createRequest(this.url, 'getPinnedMessage');
  }

  pinMessageDelete(data) {
    return createRequest(this.url, 'pinMessageDelete', data);
  }

  selectMessage(data) {
    return createRequest(this.url, 'selectMessage', data);
  }

  getselectedMessages() {
    return createRequest(this.url, 'getselectedMessages');
  }
}
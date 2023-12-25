import MessageService from './MessageService';
import coordinatesValidator from './coordinatesValidator';
import getMarkup from './getMarkup';

export default class Chat {
  constructor(container, url) {
    this.container = container;
    this.messageService = new MessageService(url);
    this.user = null;
    this.lastMessage = null;
    this.pinnedMessage = null;
    this.coordinates = {};
    this.coordinatesValidator = coordinatesValidator;
  }

  async init() {
    this.MessageRendering('first');
    this.registerEvents();
    this.mediaEvents();
    this.pinEvents();
    this.pinnedMessage = await this.messageService.getPinnedMessage();
    this.pinnedMessageRender(this.pinnedMessage);
    this.coordinates = await this.getCoordinates();
  }

  start() {
    const loginModal = this.container.getElementById('login-modal');
    const chatContainer = this.container.querySelector('.chat-container');
    const modalButton = this.container.querySelector('.modal-button');

    if (localStorage.getItem('user')) {
      loginModal.classList.add('unactive');
      chatContainer.classList.remove('unactive');
      this.user = localStorage.getItem('user');
      this.init();
    }
    
    modalButton.addEventListener('click', async () => {
      const login = document.getElementById('login-input').value;
      const password = document.getElementById('password-input').value;

      if(!login || !password) {
        alert('Please enter a login and password');
        return;
      }
      
      let data = {
        login: login,
        password: password,
      };
      let user = await this.messageService.login(data);

      if (user.message) {
        alert(user.message);
        return;
      } 

      this.user = user;
      localStorage.setItem('user', user);
      loginModal.classList.add('unactive');
      chatContainer.classList.remove('unactive');
      this.init();
    });
  }
  
  async MessageRendering(option) {
    let messageList;
    this.chatScreen = this.container.querySelector('.chat-screen');
    
    if(option === 'first'){
      messageList = await this.messageService.firstList();
    }

    if(option === 'lazy'){
      let data = { id: this.lastMessage};

      messageList = await this.messageService.lazyList(data);
    }
    
    this.lastMessage = messageList[messageList.length - 1].id;

    for(let message of messageList) {
      await this.renderMessage(message, 'start', this.chatScreen);
    }

    if(option === 'first'){

      this.chatScreen.scrollTop = this.chatScreen.scrollHeight;
    }
  }

 async renderMessage(message, position, chatScreen) {
    const messageBody = document.createElement('div');
    messageBody.classList.add('message');
    messageBody.id = message.id;

    if(message.type === 'audio' || message.type === 'video' || message.type === 'photo' || message.type === 'file') {
      let data = { id: message.id}
      let url = await this.messageService.downloadFile(data);
      message.src = URL.createObjectURL(await url.blob());
    }
    
    messageBody.innerHTML = getMarkup(message);
    
    if(position === 'start') {
      chatScreen.prepend(messageBody);
      chatScreen.scrollTop = 1;
    }

    if(position === 'end') {
      chatScreen.append(messageBody);
      chatScreen.scrollTop = this.chatScreen.scrollHeight;
    }
    
  }

  registerEvents() {
    this.chatBody = this.container.querySelector('.chat-body');
    this.messageForm = this.container.querySelector('.message-form');
    this.exitButton = this.container.querySelector('.exit-button');
    this.chatScreen = this.container.querySelector('.chat-screen');
    this.chatScreenSelect = this.container.querySelector('.chat-screen-select');
    this.fileContainer = this.container.getElementById('file');
    this.fileImput = this.fileContainer.querySelector('.overlapped');
    this.pinMessage = this.container.querySelector('.pin-message');
    this.pinContainer = this.container.querySelector('.pin-container');
    this.pinButton = this.container.querySelector('.pin-delete-button');

    this.fileContainer.addEventListener('click', () => {
      this.fileImput.dispatchEvent(new MouseEvent('click'));
    });

    this.chatScreen.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    this.chatScreen.addEventListener('drop', async (e) => {
      e.preventDefault();

      const file = e.dataTransfer.files && e.dataTransfer.files[0];

      let fileType;
      
      if(!file) {
        return;
      }

      if(file.type.startsWith('audio/')) {
        fileType = 'audio';
      }

      if(file.type.startsWith('application/')) {
        fileType = 'file';
      }

      if(file.type.startsWith('video/')) {
        fileType = 'video';
      }

      if(file.type.startsWith('image/')) {
        fileType = 'photo';
      }


      const fd = new FormData();
      fd.append('file', file);
      let path = await this.messageService.uploadFile(fd);
        
      this.sendFile(fileType, file.name, path);
    });

    this.fileImput.addEventListener('change', async () => {
      const file = this.fileImput.files && this.fileImput.files[0];
      let fileType;

      if(!file) {
        return;
      }

      if(file.type.startsWith('audio/')) {
        fileType = 'audio';
      }

      if(file.type.startsWith('application/')) {
        fileType = 'file';
      }

      if(file.type.startsWith('video/')) {
        fileType = 'video';
      }

      if(file.type.startsWith('image/')) {
        fileType = 'photo';
      }

      const fd = new FormData();
      fd.append('file', file);
      let path = await this.messageService.uploadFile(fd);
      
      this.sendFile(fileType, file.name, path);
    });

    this.chatScreen.addEventListener('scroll', () => {
      
      if(this.chatScreen.scrollTop === 0) {
        this.MessageRendering('lazy');
      }
    })

    this.messageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });

    this.exitButton.addEventListener('click', () => {
      delete localStorage.user;
      location.reload();
    });

    this.chatBody.addEventListener('mousemove', () => {
      Array.from(this.chatScreen.children).forEach(e => {
        this.messageOptionsActivator(e);
      });
    });

    this.chatScreen.addEventListener('click', async (e) => {
      if(e.target.classList.contains('select-button')) {
        let message = e.target.closest('.message');
        let data = { id: message.getAttribute('id') };
        
        if(e.target.classList.contains('selected')) {
          e.target.classList.remove('selected');
          this.messageService.selectMessage(data);
        } else {
          e.target.classList.add('selected');
          this.messageService.selectMessage(data);
        }
      }
      
      if(e.target.classList.contains('pin-button')) {
        let message = e.target.closest('.message');
        let data = { id: message.getAttribute('id') };
        this.pinnedMessage = await this.messageService.pinMessage(data);
        
        this.pinnedMessageRender(this.pinnedMessage);
      }
      
      if(e.target.classList.contains('delete-button')) {
        let message = e.target.closest('.message');

        if(this.pinnedMessage && message.id === this.pinnedMessage.id) {
          this.pinMessage.innerHTML = '';
          this.pinContainer.classList.add('unactive');
          this.pinnedMessage = null;
        }
        
        let data = { id: message.id}

        await this.messageService.delete(data);
        message.remove();
      }

      if(e.target.classList.contains('edit-button')) {
        let message = e.target.closest('.message');
        let messageContent = message.querySelector('.message-content');
        let editModal = this.container.getElementById('edit-modal');
        let editImput = this.container.getElementById('edit-input');
        let editButton = this.container.getElementById('modal-edit-button');

        editModal.classList.remove('unactive');
        editImput.value = messageContent.textContent;

        editButton.addEventListener('click', async () => {
          let data = { content: editImput.value, id: message.id };

          if(this.pinnedMessage && message.id === this.pinnedMessage.id) {
            let pinMessageContent = this.pinMessage.querySelector('.message-content');
            
            pinMessageContent.innerHTML = editImput.value;
            this.pinnedMessage.content = editImput.value;
          }

          await this.messageService.update(data);
          messageContent.innerHTML = editImput.value;
          editModal.classList.add('unactive');
        });
      }
    });
    
  } 

  async pinnedMessageRender(message) {
    let data = { id: message.id };
    if(message.type === 'audio' || message.type === 'video' || message.type === 'photo' || message.type === 'file') {
      let url = await this.messageService.downloadFile(data);
      message.src = URL.createObjectURL(await url.blob());
    }
    
    this.pinMessage.innerHTML = getMarkup(message);
    this.pinContainer.classList.remove('unactive');
  }

  async sendFile(type, content, path) {

      let data = {
        content: content,
        user: this.user,
        type: type,
        path: path,
        coordinates: this.coordinates,
      };
  
    let newMessage = await this.messageService.create(data);
    console.log(newMessage);
    this.renderMessage(newMessage, 'end', this.chatScreen);

  }

  async sendMessage() {
    const message = this.container.querySelector('.message-field').value;
    let type;
    
    if(!message) {
      return;
    }

    if(typeof message === 'string') {
      type = 'text';
    }
    
    if(message.includes('http')) {
      type = 'link'
    }

    let data = {
      content: message,
      user: this.user,
      type: type,
      coordinates: this.coordinates,
    };
    let newMessage = await this.messageService.create(data);
    this.renderMessage(newMessage, 'end', this.chatScreen);
    
    console.log(newMessage);
    this.container.querySelector('.message-field').value = '';
  }

 pinEvents() {
    this.pinContainer = this.container.querySelector('.pin-container');
    this.pinButton = this.container.querySelector('.pin-delete-button');

    this.pinContainer.addEventListener('mouseenter', () => {
      this.pinButton.classList.remove('unactive');
    });

    this.pinContainer.addEventListener('mouseleave', () => {
      this.pinButton.classList.add('unactive');
    });

    this.pinButton.addEventListener('click', () => {
      this.pinMessage.innerHTML = '';
      this.pinContainer.classList.add('unactive');
      this.pinnedMessage = null;
      this.messageService.pinMessageDelete();
    });
  }

  messageOptionsActivator(element) {
    {
      element.addEventListener('mouseenter', () =>{
        let messageOptions = element.querySelector('.message-options');       

        messageOptions.classList.remove('unactive');
      });

      element.addEventListener('mouseleave', () =>{
        let messageOptions = element.querySelector('.message-options');

        messageOptions.classList.add('unactive');
      });
    }
  }

  mediaEvents() {
    this.audioButton = this.container.getElementById('audio');
    this.videoButton = this.container.getElementById('video');
    this.photoButton = this.container.getElementById('photo');
    this.selectButton = this.container.getElementById('select');

    this.selectButton.addEventListener('click', async () => {
      let messageList = await this.messageService.getselectedMessages();
        
      for(let message of messageList) {
        await this.renderMessage(message, 'start', this.chatScreenSelect);
      }

      if(this.selectButton.classList.contains('record')) {
        this.chatScreenSelect.innerHTML = '';
      }

      this.chatScreenSelect.scrollTop = this.chatScreenSelect.scrollHeight;
      this.selectButton.classList.toggle('record');
      this.chatScreenSelect.classList.toggle('unactive');
      this.chatScreen.classList.toggle('unactive');
    });

    this.audioButton.addEventListener('mousedown', async (e) => {
      let stream;
      e.target.classList.add('record');

      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);
      const chuncks = [];

      recorder.addEventListener('start', () => {
        console.log('start');
      });

      recorder.addEventListener('dataavailable', (event) => {
        chuncks.push(event.data);
      });

      recorder.addEventListener('stop', async() => {
        let randomName = Math.floor(Math.random()*(99999-0+1));
        let file = new File(chuncks, randomName + '.mp3')
        const fd = new FormData();
        fd.append('file', file);
       
        let path = await this.messageService.uploadFile(fd);
        this.sendFile('audio', file.name, path);
      });

      recorder.start();
        
      e.target.addEventListener('mouseup', () => {
        e.target.classList.remove('record');

        recorder.stop();
        stream.getTracks().forEach(track => track.stop());
      });
    });

    this.videoButton.addEventListener('mousedown', async () => {
      let videoModal = this.container.getElementById('video-modal');
      let videoPlayer = videoModal.querySelector('.video-player');
      let stream;
      videoModal.classList.remove('unactive');
      this.videoButton.classList.add('record');
      

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      videoPlayer.srcObject = stream;

      videoPlayer.addEventListener('canplay', () => {
        videoPlayer.play();
      });
      
      const recorder = new MediaRecorder(stream);
      const chuncks = [];

      recorder.addEventListener('start', () => {
        console.log('start');
      });

      recorder.addEventListener('dataavailable', (event) => {
        chuncks.push(event.data);
      });

      recorder.addEventListener('stop', async() => {
        const blob = new Blob(chuncks);
        let randomName = Math.floor(Math.random()*(99999-0+1));
        let file = new File(chuncks, randomName + '.mp4')
        console.log(file)
        const fd = new FormData();
        fd.append('file', file);

        let path = await this.messageService.uploadFile(fd);
        this.sendFile('video', file.name, path);
        
        videoPlayer.src = URL.createObjectURL(blob);
      });

      recorder.start();

      this.videoButton.addEventListener('mouseup', () => {
        recorder.stop();
        stream.getTracks().forEach(track => track.stop());
        videoModal.classList.add('unactive');
        this.videoButton.classList.remove('record');
      });
    });

    this.takePhoto();
  }

  takePhoto() {
    
    let photoModal = this.container.getElementById('photo-modal');
    let videoPlayer = photoModal.querySelector('.video-player');
    let shutter = photoModal.querySelector('.photo-modal-button');
    let canvas = this.container.getElementById('canvas');

    this.photoButton.addEventListener('click', async () => {  
      photoModal.classList.remove('unactive');
      this.photoButton.classList.add('record');
      
      let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      videoPlayer.srcObject = stream;
    });
      
    shutter.addEventListener('click', async () => {
      canvas.getContext('2d').drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
      let photoURL = canvas.toDataURL('image/jpeg');
      let randomName = Math.floor(Math.random()*(99999-0+1));
      const blob = await (await fetch(photoURL)).blob(); 
      const file = new File([blob], randomName + '.jpg');

      const fd = new FormData();
        fd.append('file', file);

        let path = await this.messageService.uploadFile(fd);
        this.sendFile('photo', file.name, path);

      photoModal.classList.add('unactive');
      this.photoButton.classList.remove('record');
    });
  }

  async getCoordinates() {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            (error) => reject(error),
          );
        });
        const coordinates = {
          latitude: position.latitude,
          longitude: position.longitude,
        };
        return coordinates;
      } catch {
        return this.showCoordinatesModal();
      }
    } else {
      return this.showCoordinatesModal();
    }
  }

  showCoordinatesModal(){
    this.coordinatesModal = this.container.querySelector('.coordinates-modal');
    this.modalCloseButton = this.container.getElementById('coordinates-modal-close');
    this.modalOkButton = this.container.getElementById('coordinates-modal-ok');
    this.modalField = this.container.querySelector('.coordinates-modal-field');

    this.coordinatesModal.classList.remove('unactive');
    
    return new Promise((resolve) => {
      this.modalOkButton.addEventListener('click', () => {
        this.coordinatesModal.classList.add('unactive');
        const coordinates = this.coordinatesValidator(this.modalField.value);
        
        resolve(coordinates);
      });

      this.modalCloseButton.addEventListener('click', () => {
        this.coordinatesModal.classList.add('unactive');

        resolve(null);
      });
    });
  }

}
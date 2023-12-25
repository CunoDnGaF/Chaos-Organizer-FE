export default function getMarkup(message) {
    
    const { content, created, user, type, selected, src, coordinates} = message;
    let like;

    if (selected) {
        like = 'selected';
    } else {
        like = '';
    }

    if(type === 'text') {
        return `
        <div class="message-options unactive">
            <input type="button" id="delete-button" name="delete-button" class="delete-button">
            <input type="button" id="edit-button" name="edit-button" class="edit-button">
            <input type="button" id="pin-button" name="pin-button" class="pin-button">
            <input type="button" id="select-button" name="select-button" class="select-button  ${like}">
        </div>
        <div class="message-body">
            <div class="message-header">
                <span class="message-owner">${user}</span>
                <span class="message-date">${new Date(created).toLocaleString('ru-RU')}</span>
                <span class="message-coordinates">[${coordinates.latitude}, ${coordinates.longitude}]</span>
            </div>
            <span class="message-content">${content}</span>
        </div>
        `;
    }

    if(type === 'link') {
        return `
        <div class="message-options unactive">
            <input type="button" id="delete-button" name="delete-button" class="delete-button">
            <input type="button" id="edit-button" name="edit-button" class="edit-button">
            <input type="button" id="pin-button" name="pin-button" class="pin-button">
            <input type="button" id="select-button" name="select-button" class="select-button  ${like}">
        </div>
        <div class="message-body">
            <div class="message-header">
                <span class="message-owner">${user}</span>
                <span class="message-date">${new Date(created).toLocaleString('ru-RU')}</span>
                <span class="message-coordinates">[${coordinates.latitude}, ${coordinates.longitude}]</span>
            </div>
            <a href="${content}" class="message-content" target="_blank">${content}</a>
        </div>
        `;
    }

    if(type === 'file') {
        return `
        <div class="message-options unactive">
            <input type="button" id="delete-button" name="delete-button" class="delete-button">
            <input type="button" id="pin-button" name="pin-button" class="pin-button">
            <input type="button" id="select-button" name="select-button" class="select-button ${like}">
        </div>
        <div class="message-body">
            <div class="message-header">
                <span class="message-owner">${user}</span>
                <span class="message-date">${new Date(created).toLocaleString('ru-RU')}</span>
                <span class="message-coordinates">[${coordinates.latitude}, ${coordinates.longitude}]</span>
            </div>
            <a href="${src}" class="message-content" target="_blank">${content}</a>
            <a class="download-link" href="${src}" rel="noopener" download="${content}">скачать</a>
        </div>
        `;
    }

    if(type === 'audio') {
        return `
        <div class="message-options unactive">
            <input type="button" id="delete-button" name="delete-button" class="delete-button">
            <input type="button" id="pin-button" name="pin-button" class="pin-button">
            <input type="button" id="select-button" name="select-button" class="select-button ${like}">
        </div>
        <div class="message-body">
            <div class="message-header">
                <span class="message-owner">${user}</span>
                <span class="message-date">${new Date(created).toLocaleString('ru-RU')}</span>
                <span class="message-coordinates">[${coordinates.latitude}, ${coordinates.longitude}]</span>
            </div>
            <span class="message-content">${content}</span>
            <audio src="${src}"controls></audio>
            <a class="download-link" href="${src}" rel="noopener" download="${content}">скачать</a>
        </div>
        `;
    }

    if(type === 'video') {
        return `
        <div class="message-options unactive">
            <input type="button" id="delete-button" name="delete-button" class="delete-button">
            <input type="button" id="pin-button" name="pin-button" class="pin-button">
            <input type="button" id="select-button" name="select-button" class="select-button ${like}">
        </div>
        <div class="message-body">
            <div class="message-header">
                <span class="message-owner">${user}</span>
                <span class="message-date">${new Date(created).toLocaleString('ru-RU')}</span>
                <span class="message-coordinates">[${coordinates.latitude}, ${coordinates.longitude}]</span>
            </div>
            <span class="message-content">${content}</span>
            <video class= "message-video" src="${src}"controls></video>
            <a class="download-link" href="${src}" rel="noopener" download="${content}">скачать</a>
        </div>
        `;
    }

    if(type === 'photo') {
        return `
        <div class="message-options unactive">
            <input type="button" id="delete-button" name="delete-button" class="delete-button">
            <input type="button" id="pin-button" name="pin-button" class="pin-button">
            <input type="button" id="select-button" name="select-button" class="select-button ${like}">
        </div>
        <div class="message-body">
            <div class="message-header">
                <span class="message-owner">${user}</span>
                <span class="message-date">${new Date(created).toLocaleString('ru-RU')}</span>
                <span class="message-coordinates">[${coordinates.latitude}, ${coordinates.longitude}]</span>
            </div>
            <span class="message-content">${content}</span>
            <img class= "message-video" src="${src}"controls></img>
            <a class="download-link" href="${src}" rel="noopener" download="${content}">скачать</a>
        </div>
        `;
    }
}
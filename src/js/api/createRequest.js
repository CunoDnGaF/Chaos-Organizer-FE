const createRequest = async (url, method, data) => {
  try {
    let response;

    switch (method) {
      case 'uploadFile':
        response = await fetch(`${url}${method}`, {
          method: 'POST',
          body: data,
        });
        break;
      case 'createMessage':
      case 'createFile':
      case 'login':
        response = await fetch(`${url}${method}`, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        break;

      case 'updateById':
      case 'pinMessage':  
        response = await fetch(`${url}${method}`, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        break;

      case 'lastMessages':
      case 'getselectedMessages':
      case 'getPinnedMessage':
      case 'pinMessageDelete':
        response = await fetch(`${url}${method}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      break;

      case 'downloadFile': {
        response = await fetch(`${url}${method}?id=${data.id}`, {
            method: 'GET',
          },
        );
        break;
      }
      
      case 'lazyMessages':
      case 'selectMessage':
      case 'messageById':
      case 'deleteById': {
        response = await fetch(`${url}${method}?id=${data.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        break;
      }

      default:
        console.error('Метод не существует');
        return null;
    }

    if (response.ok) {
      if (method === 'downloadFile') {
        return await response;
      }

      if (method === 'deleteById') {
        return 'success';
      }

      return await response.json();
    }

    console.error(`Ошибка сервера: ${response.statusText}`);
    return null;
  } catch (error) {
    console.error('Ошибка сети:', error);
    return null;
  }
};

export default createRequest;
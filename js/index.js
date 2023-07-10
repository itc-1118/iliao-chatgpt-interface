var config = {
  apiUrl: "http://u2vajs.natappfree.cc/api/open",
  apiKey: "oPX_v19k93wmdynjkoic4xouh",
};

class ChatInterface {
  constructor() {
    this.channelIdInput = this.getById("channelId");
    this.questionInput = this.getById("question");
    this.responseContainer = this.getById("responseContainer");

    this.getById("sendChatBtn").addEventListener(
      "click",
      this.sendChat.bind(this)
    );
    this.getById("cancelChatBtn").addEventListener(
      "click",
      this.cancelChat.bind(this)
    );
    this.getById("getChatHistoryBtn").addEventListener(
      "click",
      this.getChatHistory.bind(this)
    );
  }

  /**
   * 获取元素的引用
   * @param {string} id - 元素的 ID
   * @returns {HTMLElement} - 元素的引用
   */
  getById(id) {
    return document.getElementById(id);
  }

  /**
   * 执行 Fetch 请求
   * @param {string} url - 请求的 URL
   * @param {object} options - 请求的选项
   * @returns {Promise} - Fetch 请求的 Promise 对象
   */
  fetchData(url, options) {
    return fetch(url, options).then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    });
  }

  /**
   * 使用 Fetch API 发送带有数据流的 POST 请求
   * @param {string} url - 请求的 URL
   * @param {object} body - 请求的 body 数据
   * @param {function} onData - 处理响应数据流中的数据的回调函数
   * @returns {Promise} - 返回一个 Promise 对象，用于处理异步操作
   */
  postWithStream(url, body, onData) {
    // 使用 fetch 函数发送 POST 请求
    return fetch(url, {
      method: "POST", // 指定 HTTP 方法为 POST
      headers: {
        "Content-Type": "application/json", // 指定请求内容类型为 JSON
        "Custom-Header": "value", // 自定义请求头
      },
      body: JSON.stringify(body), // 将 body 参数转换为 JSON 字符串并作为请求体发送
    }).then((response) => {
      // 如果响应状态码不是 2xx，抛出异常
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      // 从响应中获取数据流读取器
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      /**
       * 递归函数，逐个读取数据块并处理
       * @returns {Promise} - 返回一个 Promise 对象，用于处理异步操作
       */
      function read() {
        return reader?.read().then(({ done, value }) => {
          if (done) {
            return;
          }
          const text = decoder.decode(value);
          onData(text); // 调用回调函数
          return read();
        });
      }

      return read();
    });
  }

  /**
   * 发送 GET 请求
   * @param {string} url - 请求的 URL
   * @returns {Promise} - GET 请求的 Promise 对象
   */
  getRequest(url) {
    var options = {
      method: "GET",
    };
    return this.fetchData(url, options);
  }

  /**
   * 发送聊天
   */
  sendChat() {
    var _this = this;
    var channelId = this.channelIdInput.value;
    var question = this.questionInput.value;

    var data = {
      channelId: channelId,
      chat: {
        questions: [
          {
            type: "user",
            content: question,
          },
        ],
      },
    };
    this.responseContainer.innerHTML = "";
    this.postWithStream(
      config.apiUrl + "/sendChat?apikey=" + config.apiKey,
      data,
      function (text) {
        _this.responseContainer.innerHTML += text;
      }
    );
  }

  /**
   * 取消聊天
   */
  cancelChat() {
    var channelId = this.channelIdInput.value;

    this.getRequest(
      config.apiUrl +
        "/cancelChat?apikey=" +
        config.apiKey +
        "&channelId=" +
        channelId
    )
      .then((data) => {
        console.log(data);
        // 处理成功响应
        this.responseContainer.innerHTML =
          "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
      })
      .catch((error) => {
        console.log(error);
        // 处理错误响应
        this.responseContainer.innerHTML = "<pre>" + error + "</pre>";
      });
  }

  /**
   * 获取聊天记录
   */
  getChatHistory() {
    var channelId = this.channelIdInput.value;

    this.getRequest(
      config.apiUrl +
        "/getChatHistory?apikey=" +
        config.apiKey +
        "&channelId=" +
        channelId
    )
      .then((data) => {
        console.log(data);
        // 处理成功响应
        this.responseContainer.innerHTML =
          "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
      })
      .catch((error) => {
        console.log(error);
        // 处理错误响应
        this.responseContainer.innerHTML = "<pre>" + error + "</pre>";
      });
  }
}

var chatInterface = new ChatInterface();

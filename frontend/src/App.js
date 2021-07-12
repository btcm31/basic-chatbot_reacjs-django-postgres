import './App.css';
import React, { Component } from 'react';
import ChatBot from './components';
import { ThemeProvider } from 'styled-components';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      prediction: '',
      conversation: [],
      product: {'name': '', 'url': '', 'color': '', 'amount': '', 'material': '', 'size': '', 'typeR': ''},
      stateConv: ''
    };
    this.theme = {
      background: '#f5f8fb',
      fontFamily: 'Helvetica Neue',
      'border-radius': '10px',
      headerBgColor: '#EF6C00',
      headerFontColor: '#fff',
      headerFontSize: '15px',
      botBubbleColor: '#EF6C00',
      botFontColor: '#fff',
      userBubbleColor: '#fff',
      userFontColor: '#4a4a4a',
    };
  };

  async predict(text){
    const url = "http://localhost:8000/predictJson";
    const bodyData = JSON.stringify({
      "text" : text
    });
    const reqOpt = {method: "POST", headers: {"Content-type": "application/json"}, body: bodyData};
    await fetch(url,reqOpt)
    .then((resp)=>resp.json())
    .then((respJ)=> {
      this.setState({prediction:respJ.label}, ()=>{
        if(respJ.infor.name !== ''){
          this.setState({product:respJ.infor})
        }
        else if(this.state.product !== "no-find-img"){
          const m = respJ.infor.typeR;
          this.state.product.typeR = m;
        }
      })

    });
  };

  async predictImg(urlin){
    const url = "http://localhost:8000/imgPredict";
    const bodyData = JSON.stringify({
      "img" : urlin
    });
    const reqOpt = {method: "POST", headers: {"Content-type": "application/json"}, body: bodyData};
    await fetch(url,reqOpt)
    .then((resp)=>resp.json())
    .then((respJ)=> {
      this.setState({product:respJ.infor}, ()=>{
        //
      })

    });
  };

  async conversationUpdate(conv){
    var conver = "";
    for (let i = 0; i < conv.length; i++) {
      conver += conv[i] + "\n";
    }
    const url = "http://localhost:8000/conversation";
    const bodyData = JSON.stringify({
      "conversation" : conver
    });
    const reqOpt = {method: "POST", headers: {"Content-type": "application/json"}, body: bodyData};
    await fetch(url, reqOpt)
    .then((resp)=>resp.json())
    .then((respJ)=> {
      this.setState({conversation: []})
    });
  };

  render(){
    return (
      <div className = "App">
        <header className = "App-header">
        <ThemeProvider theme = {this.theme}>
          <ChatBot
            headerTitle = 'Intent chatbot'
            botDelay = {1000}
            steps = {[
              {
                id: 'start',
                message: () => {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: Welcome!')
                  this.setState({conversation:newcon})
                  return 'Hello, mình là chatbot nè!'
                },
                trigger: 'user',
              },
              {
                id: 'user',
                user: true,
                trigger: (value)=>{
                  const {conversation} = this.state;
                  var newcon = conversation;  
                  if(Array.isArray(value.value)){
                    newcon.push('User: ImageURL')
                    this.setState({conversation: newcon})
                    this.predictImg(value.value[0])
                    return 'user'
                  }
                  newcon.push('User: ' + value.value)
                  this.setState({conversation: newcon})
                  this.predict(value.value)
                  return 'bot'
                }
              },
              {
                // this step to wait to states updated
                id: 'bot',
                message: 'gypERR!sackError:Col o id nyVisualStuio nstallationtouse',
                trigger: 'reply'
              },
              {
                id: 'reply',
                message:(previousValue)=>{
                  var mess = "";
                  const {conversation, prediction} = this.state;
                  var newcon = conversation;
                  console.log(prediction)
                  if (prediction === 'Inform') {
                    mess = 'Ok để mình lưu thông tin của bạn luôn.'
                  }
                  else if(this.state.product.typeR === 'no-find-img'){
                    mess = 'Bên mình hông có sản phẩm như hình nha :('
                  }
                  else if(prediction === 'Request'){
                    const {product} = this.state;
                    console.log(product.typeR)
                    if(product.typeR === 'amount_product'){
                      mess = product.name + ' còn ' + String(product.amount) + ' cái nha.'
                      if(product.name === ''){
                        mess = 'Bạn muốn hỏi sản phẩm nào á?'
                        this.setState({stateConv:'amount_product'})
                      }
                      else if (this.state.stateConv!==""){
                        this.setState({stateConv:''})
                      }
                    }
                    else if (product.typeR === 'size'){
                      mess = product.name + ' còn size ' + product.size + ' nha.'
                      if(product.name === ''){
                        mess = 'Bạn muốn hỏi sản phẩm nào á?'
                        this.setState({stateConv:'size'})
                      }
                      else if (this.state.stateConv!==""){
                        this.setState({stateConv:''})
                      }
                    }
                    else if (product.typeR === 'material_product'){
                      mess = 'Dạ ' + product.name + ' chất ' + product.material + ' nha.'
                      if(product.name === ''){
                        mess = 'Bạn muốn hỏi sản phẩm nào á?'
                        this.setState({stateConv:'material_product'})
                      }
                      else if (this.state.stateConv!==""){
                        this.setState({stateConv:''})
                      }
                    }
                    else if (product.typeR === 'shiping fee'){
                      mess = 'Phí ship nội thành là 30k còn ngoại thành là 50k nha.'
                    }
                    else if (product.typeR === 'product_image'){
                      mess = 'http://localhost:8000' + product.url[0]
                      if(product.name === ''){
                        mess = 'Bạn muốn hỏi sản phẩm nào á?'
                        this.setState({stateConv:'product_image'})
                      }
                      else if (this.state.stateConv!==""){
                        this.setState({stateConv:''})
                      }
                    }
                    else if (product.typeR === 'color_product'){
                      mess = product.name + ' còn màu ' + product.color + ' nha.'
                      if(product.name === ''){
                        mess = 'Bạn muốn hỏi sản phẩm nào á?'
                        this.setState({stateConv:'color_product'})
                      }
                      else if (this.state.stateConv!==""){
                        this.setState({stateConv:''})
                      }
                    }
                    else if (product.typeR === 'cost_product'){
                      mess = product.name + ' có giá 380k giảm còn 195k nha.'
                      if(product.name === ''){
                        mess = 'Bạn muốn hỏi sản phẩm nào á?'
                        this.setState({stateConv:'cost_product'})
                      }
                      else if (this.state.stateConv!==""){
                        this.setState({stateConv:''})
                      }
                    }
                    else if (product.typeR === 'ID_product'){
                      mess = product.name + ' còn ' + String(product.amount) + ' cái. Chất liệu ' + product.material + ' nha. Bạn cho mình số đo mình tư vấn thêm nha.'
                      if(product.name === ''){
                        mess = 'Bên mình hông có sản phẩm đó nha'
                      }
                    }
                    else if (product.typeR === 'Time'){
                      mess = 'Nội thành TP.HCM thì 1-2 ngày còn ngoại thành thì 3-4 ngày có hàng nha bạn.'
                    }
                    else if (product.typeR === 'address'){
                      mess = 'Shop ở 48/15 Phạm Văn Xảo, P.Phú Thọ Hòa, Quận Tân Phú ạ'
                    }
                    else {
                      mess = 'Để mình check thử nha'
                    }
                  }
                  else if (prediction === 'Order'){
                    mess = 'Bạn cho mình địa chỉ với sđt để mình chốt đơn cho bạn nha.'
                  }
                  else if (prediction === 'Changing'){
                    mess = 'Bạn được đổi sản phẩm với điều kiện sản phẩm còn nguyên tem, mạc và hóa đơn mua hàng nha.'
                  }
                  else if (prediction === 'Return'){
                    mess = 'Bạn được trả sản phẩm với điều kiện sản phẩm còn nguyên tem, mạc và hóa đơn mua hàng nha.'
                  }
                  else if (prediction === 'feedback'){
                    mess = 'Dạ cảm ơn về phản hồi của bạn ạ!'
                  }
                  else if (prediction === 'Hello'){
                    mess = 'Hello bạn, bạn cần tư vấn gì á'
                  }
                  else if (prediction === 'Connect'){
                    mess = 'Chào bạn, bạn cần tư vấn gì á'
                  }
                  else if (prediction === 'Done'){
                    mess = 'Dạ cảm ơn bạn nhiều'
                    this.setState({product: {'name': '', 'url': '', 'color':'', 'amount': '', 'material': '', 'size': '', 'typeR': ''}})
                    newcon.push('Bot: ' + mess)
                    this.conversationUpdate(newcon)
                  }
                  else if(prediction === 'OK'){
                    mess = 'Ok bạn.'
                  }
                  else{
                    mess = 'Shop chưa hiểu câu hỏi của bạn :('
                  }
                  newcon.push('Bot: ' + mess)
                  this.setState({conversation: newcon})
                  return mess
                } ,
                trigger: 'user'
              },
            ]}
          />
          </ThemeProvider>
        </header>
      </div>
    );
  }
}

export default App;

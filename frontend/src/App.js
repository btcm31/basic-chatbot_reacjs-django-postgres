import './App.css';
import React, { Component } from 'react';
import ChatBot from './components';
import { ThemeProvider } from 'styled-components';
import * as reply from './reply.json' ;

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      prediction: '',
      conversation: [],
      product: {'name': '', 'url': '', 'color': '', 'amount': '', 'material': '', 'size': '', 'typeR': ''},
      stateConv: 'start', //[start, inforproduct, sizeadvisory, order]
      customerinfor:{
        'name': '',
        'addr' :'',
        'amount': '',
        'ID_product': '',
        'phone': '',
        'size':'',
        'weight':'',
        'height':'',
        'V2':'',
        'typeI':''
      }
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
        if(respJ.label === 'Request'){
          if(respJ.infor.name !== ''){
          this.setState({product:respJ.infor})
          }
          else if(this.state.product.typeR !== "no-find-img"){
            this.state.product.typeR = respJ.infor.typeR
          }
        }
        else if (respJ.label === 'Inform'){
          const {customerinfor} = this.state
          let temp = {
            'name': customerinfor.name,
            'addr' :customerinfor.addr,
            'amount': customerinfor.amount,
            'ID_product': customerinfor.ID_product,
            'phone': customerinfor.phone,
            'size':customerinfor.size,
            'weight':customerinfor.weight,
            'height':customerinfor.height,
            'V2':customerinfor.V2,
            'typeI':customerinfor.typeI
          }
          let idx = respJ.infor.typeI
          temp[idx] = respJ.infor[respJ.infor.typeI]
          temp.typeI = respJ.infor.typeI
          this.setState({customerinfor:temp})
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
                  this.predict('')
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
                  const {conversation, prediction, product,customerinfor} = this.state;
                  var newcon = conversation;
                  console.log(prediction)
                  if (prediction === 'Inform') {
                    mess = reply.Inform
                    console.log(customerinfor)
                    if(customerinfor.typeI === 'size'){
                      mess = 'Vậy bạn lấy size ' + (customerinfor.size).toUpperCase() + ' nha, bạn ok thì cho mình xin địa chỉ + sđt mình chốt đơn cho bạn nha.'
                      if(!['m','l','s'].includes(customerinfor.size)){
                        mess = 'Bên mình chỉ cung cấp 3 size là M, L và S thôi nha.'
                      }
                    }
                    else if(customerinfor.typeI === 'height'){
                      if(customerinfor.weight === ''){
                        mess = 'Bạn cho mình xin cân nặng nha'
                      }
                    }
                    else if(customerinfor.typeI === 'weight'){
                      if(customerinfor.V2 === ''){
                        mess = 'Bạn có số đo eo hông ạ?'
                      }
                    }
                    else if (customerinfor.typeI === 'V2'){
                      if(customerinfor.weight === ''){
                        mess = 'Bạn cho mình xin cân nặng nha'
                      }
                    }
                    if(customerinfor.weight > 70){
                      mess = "Bạn mặc size L là đẹp xỉu luôn nha."
                    }
                  }
                  else if(prediction === 'Request'){
                    console.log(product.typeR)
                    if(product.typeR === 'amount_product'){
                      mess = product.name + ' còn ' + String(product.amount) + ' cái nha.'
                      if(product.name === ''){
                        mess = reply.Request.not_ID_product
                        this.setState({stateConv:'amount_product'})
                      }
                      else if (this.state.stateConv!==""){
                        this.setState({stateConv:''})
                      }
                    }
                    else if(product.typeR === 'no-find-img'){
                      mess = reply.Request['no-find-img']
                    }
                    else if (product.typeR === 'size'){
                      mess = product.name + ' còn size ' + product.size + ' nha.'
                      if(product.name === ''){
                        mess = reply.Request.not_ID_product
                        this.setState({stateConv:'size'})
                      }
                      else if (this.state.stateConv!==""){
                        this.setState({stateConv:''})
                      }
                    }
                    else if (product.typeR === 'material_product'){
                      mess = 'Dạ ' + product.name + ' chất ' + product.material + ' nha.'
                      if(product.name === ''){
                        mess = reply.Request.not_ID_product
                        this.setState({stateConv:'material_product'})
                      }
                      else if (this.state.stateConv!==""){
                        this.setState({stateConv:''})
                      }
                    }
                    else if (product.typeR === 'shiping fee'){
                      mess = reply.Request['shipping fee']
                    }
                    else if (product.typeR === 'product_image'){
                      mess = 'http://localhost:8000' + product.url[0]
                      if(product.name === ''){
                        mess = reply.Request.not_ID_product
                        this.setState({stateConv:'product_image'})
                      }
                      else if (this.state.stateConv!==""){
                        this.setState({stateConv:''})
                      }
                    }
                    else if (product.typeR === 'color_product'){
                      mess = product.name + ' còn màu ' + product.color + ' nha.'
                      if(product.name === ''){
                        mess = reply.Request.not_ID_product
                        this.setState({stateConv:'color_product'})
                      }
                      else if (this.state.stateConv!==""){
                        this.setState({stateConv:''})
                      }
                    }
                    else if (product.typeR === 'cost_product'){
                      mess = product.name + ' có giá 380k giảm còn 195k nha.'
                      if(product.name === ''){
                        mess = reply.Request.not_ID_product
                        this.setState({stateConv:'cost_product'})
                      }
                      else if (this.state.stateConv!==""){
                        this.setState({stateConv:''})
                      }
                    }
                    else if (product.typeR === 'ID_product'){
                      mess = product.name + ' còn ' + String(product.amount) + ' cái. Chất liệu ' + product.material + ' nha. Bạn cho mình số đo mình tư vấn thêm nha.'
                      if(product.name === ''){
                        mess = reply.Request.not_found_product
                      }
                    }
                    else if (product.typeR === 'Time'){
                      mess = reply.Request.Time
                    }
                    else if (product.typeR === 'address'){
                      mess = reply.Request.address
                    }
                    else {
                      mess = 'Để mình check thử nha'
                    }
                  }
                  else if (prediction === 'Order'){
                    mess = reply.Order
                  }
                  else if (prediction === 'Changing'){
                    mess = reply.Changing
                  }
                  else if (prediction === 'Return'){
                    mess = reply.Return
                  }
                  else if (prediction === 'feedback'){
                    mess = reply.Feedback
                  }
                  else if (prediction === 'Hello'){
                    mess = reply.Hello
                  }
                  else if (prediction === 'Connect'){
                    mess = reply.Connect
                  }
                  else if (prediction === 'Done'){
                    mess = reply.Done
                    this.setState({product: {'name': '', 'url': '', 'color':'', 'amount': '', 'material': '', 'size': '', 'typeR': ''}})
                    newcon.push('Bot: ' + mess)
                    this.conversationUpdate(newcon)
                  }
                  else if(prediction === 'OK'){
                    mess = reply.OK
                  }
                  else{
                    mess = reply.Other
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

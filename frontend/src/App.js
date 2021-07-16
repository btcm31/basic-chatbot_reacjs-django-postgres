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
      infor: {
        'size':'','weight':'','height':'','V2':'',
        'phone':'','Id_cus':'','addr':'','material':'','color':'','amount':'',
        'name':'','url': '','typeI':'','typeR': ''
      },
      stateConv: 'start', //[start, inforproduct, sizeadvisory, order, changing, return]
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
        console.log(respJ.infor)
        const {infor} = this.state
        let temp = infor
        if(respJ.infor.typeI === 'ID_product'){
          temp = respJ.infor
        }
        else if(respJ.infor.typeI === 'height'){
          temp.height = respJ.infor.height
        }
        else if(respJ.infor.typeI === 'weight'){
          temp.weight = respJ.infor.weight
        }
        else if(respJ.infor.typeI === 'heightweight'){
          temp.height = respJ.infor.height
          temp.weight = respJ.infor.weight
        }
        else if(respJ.infor.typeI === 'size'){
          temp.size = respJ.infor.size
        }
        else if(respJ.infor.typeI === 'V2'){
          temp.V2 = respJ.infor.V2
        }
        else if(respJ.infor.typeI === 'phone'){
          temp.phone = respJ.infor.phone
        }
        else if(respJ.infor.typeI === 'address'){
          temp.addr = respJ.infor.addr
        }
        else if(respJ.infor.typeI === 'amount_product'){
          temp.amount = respJ.infor.amount
        }
        if(respJ.label === 'Request'){
          this.setState({stateConv: 'inforproduct'})
          if(respJ.infor.typeI !== 'size' && respJ.infor.typeR === 'size'){
            this.setState({stateConv: 'sizeadvisory'})
          } 
          if(this.state.infor.typeR !== "no-find-img" && respJ.infor.name === ''){
            temp.typeR = respJ.infor.typeR
            temp.typeI = respJ.infor.typeI
            this.setState({infor:temp})
          }
          else if(this.state.infor.name !== respJ.infor.name){
            this.setState({infor:respJ.infor})
          }
        }
        else if (respJ.label === 'Inform'){
          if(respJ.infor.typeI !== 'size' && respJ.infor.typeR === 'size'){
            this.setState({stateConv: 'sizeadvisory'})
          } 
          temp.typeI = respJ.infor.typeI
          temp.typeR = infor.typeR
          this.setState({infor:temp})
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
      this.setState({infor:respJ.infor}, ()=>{
        console.log(respJ.infor)
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
  consultation(jeansize,weight,v2){
    if(weight>=40 && weight <= 56){
      if(weight <=47){
        return 'S'
      }
      else if(weight>=53){
        return 'L'
      }
      return 'M'
    }
    else if (v2>=55 && v2<=74){
      if(v2 <=66){
        return 'S'
      }
      else if(v2>=71){
        return 'L'
      }
      return 'M'
    }
    return 'Nonesize'
  }

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
                trigger: 'bot1'
              },
              {
                // this step to wait to states updated
                id: 'bot1',
                message: 'gypERR!sackError:Col o id nyVisualStuio nstallationtouse',
                trigger: 'reply'
              },
              {
                id: 'reply',
                message:()=>{
                  var mess = "";
                  const {conversation,infor,stateConv} = this.state;
                  var prediction = this.state.prediction;
                  var newcon = conversation;
                  console.log(prediction)
                  console.log(stateConv)
                  if (prediction === 'Inform') {
                    mess = reply.Inform
                    console.log(infor)
                    if(stateConv === 'sizeadvisory'){
                      console.log(infor.typeI)
                      if(infor.typeI === 'size'){
                        mess = 'Vậy bạn lấy size ' + (infor.size).toUpperCase() + ' nha, bạn ok thì cho mình xin địa chỉ + sđt mình chốt đơn cho bạn nha.'
                        if(!['m','l','s'].includes(infor.size)){
                          mess = 'Bên mình chỉ cung cấp 3 size là M, L và S thôi nha.'
                        }
                      }
                      else if(infor.typeI === 'height'){
                        if(infor.weight === ''){
                          mess = 'Bạn cho mình xin cân nặng nha'
                        }
                        else{
                          mess = reply.Request.size['V2-customer']
                        }
                      }
                      else if(infor.typeI === 'weight'){
                        let t = this.consultation(0,infor.weight,infor.V2);
                        if(t !== 'Nonesize'){
                          mess = 'Vậy bạn mặc size ' + t + ' là siêu đẹp luôn nha.'
                        }
                        else if(infor.V2 === ''){
                          mess = reply.Request.size['V2-customer']
                        }
                      }
                      else if (infor.typeI === 'V2'){
                        let t = this.consultation(0,infor.weight,infor.V2);
                        if(t !== 'Nonesize'){
                          mess = 'Vậy bạn mặc size ' + t + ' là siêu đẹp luôn nha.'
                        }
                        else{
                          mess = reply.Request.size['not-found-size']
                        }
                      }
                      else if(infor.typeI === 'heightweight'){
                        let t = this.consultation(infor.height,infor.weight,infor.V2);
                        if(t !== 'Nonesize'){
                          mess = 'Vậy bạn mặc size ' + t + ' là siêu đẹp luôn nha.'
                        }
                        else if(infor.V2 === ''){
                          mess = 'Bạn có số đo eo hông ạ?'
                        } 
                        else{
                          mess = reply.Request.size['not-found-size'] 
                        }
                      }
                    }
                    else if(stateConv === 'order'){
                      
                    }
                    else if(stateConv === 'inforproduct'){
                      prediction = 'Request'
                    }
                    else if(stateConv === 'start'){
                      
                    }
                  }
                  if(prediction === 'Request'){
                    console.log(infor.typeR)
                    if(infor.typeR === 'amount_product'){
                      mess = infor.name + ' còn ' + String(infor.amount) + ' cái nha.'
                      if(infor.name === ''){
                        mess = reply.Request.not_ID_product
                      }
                    }
                    else if(infor.typeR === 'no-find-img'){
                      mess = reply.Request['no-find-img']
                    }
                    else if (infor.typeR === 'size'){
                      mess = infor.name + ' còn size ' + (infor.size).toUpperCase() + ' nha. Bạn cho mình xin chiều cao cân nặng mình tư vấn thêm cho bạn nha!'
                      if(infor.name === ''){
                        mess = reply.Request.not_ID_product
                      }
                      console.log(stateConv)
                      if(stateConv === 'sizeadvisory'){
                        if(infor.typeI === 'size'){
                          mess = 'Vậy bạn lấy size ' + (infor.size).toUpperCase() + ' nha, bạn ok thì cho mình xin địa chỉ + sđt mình chốt đơn cho bạn nha.'
                          if(!['m','l','s'].includes(infor.size)){
                            mess = 'Bên mình chỉ cung cấp 3 size là M, L và S thôi nha.'
                          }
                        }
                        else if(infor.typeI === 'height'){
                          if(infor.weight === ''){
                            mess = reply.Request.size['weight-customer']
                          }
                          else{
                            mess = reply.Request.size['V2-customer']
                          }
                        }
                        else if(infor.typeI === 'weight'){
                          let t = this.consultation(0,infor.weight,infor.V2);
                          if(t !== 'Nonesize'){
                            mess = 'Vậy bạn mặc size ' + t + ' là siêu đẹp luôn nha.'
                          }
                          else if(infor.V2 === ''){
                            mess = reply.Request.size['V2-customer']
                          }
                        }
                        else if (infor.typeI === 'V2'){
                          let t = this.consultation(0,infor.weight,infor.V2);
                          if(t !== 'Nonesize'){
                            mess = 'Vậy bạn mặc size ' + t + ' là siêu đẹp luôn nha.'
                          }
                          else{
                            mess = reply.Request.size['not-found-size']
                          }
                          if(infor.weight === ''){
                            mess = reply.Request.size['weight-customer']
                          }
                        }
                        else if(infor.typeI === 'heightweight'){
                          let t = this.consultation(0,infor.weight,infor.V2);
                          if(t !== 'Nonesize'){
                            mess = 'Vậy bạn mặc size ' + t + ' là siêu đẹp luôn nha.'
                          }
                          else if(infor.V2 === ''){
                            mess = reply.Request.size['V2-customer']
                          } 
                          else{
                            mess = reply.Request.size['not-found-size'] 
                          }
                        }
                      }
                    }
                    else if (infor.typeR === 'material_product'){
                      mess = 'Dạ ' + infor.name + ' chất ' + infor.material + ' nha.'
                      if(infor.name === ''){
                        mess = reply.Request.not_ID_product
                      }
                    }
                    else if (infor.typeR === 'shiping fee'){
                      mess = reply.Request['shipping fee']
                    }
                    else if (infor.typeR === 'product_image'){
                      mess = 'http://localhost:8000' + infor.url[0]
                      if(infor.name === ''){
                        mess = reply.Request.not_ID_product
                      }
                    }
                    else if (infor.typeR === 'color_product'){
                      mess = infor.name + ' còn màu ' + infor.color + ' nha.'
                      if(infor.name === ''){
                        mess = reply.Request.not_ID_product
                      }
                    }
                    else if (infor.typeR === 'cost_product'){
                      mess = infor.name + ' có giá 380k giảm còn 195k nha.'
                      if(infor.name === ''){
                        mess = reply.Request.not_ID_product
                      }
                    }
                    else if (infor.typeR === 'ID_product'){
                      mess = infor.name + ' còn ' + String(infor.amount) + ' cái. Chất liệu ' + infor.material + ' nha. Bạn cho mình số đo mình tư vấn thêm nha.'
                      if(infor.name === ''){
                        mess = reply.Request.not_found_product
                      }
                    }
                    else if (infor.typeR === 'Time'){
                      mess = reply.Request.Time
                    }
                    else if (infor.typeR === 'address'){
                      mess = reply.Request.address
                    }
                    else {
                      mess = 'Để mình check thử nha'
                    }
                  }
                  if (prediction === 'Order'){
                    mess = reply.Order
                  }
                  if (prediction === 'Changing'){
                    mess = reply.Changing
                    this.setState({stateConv:'changing'})
                  }
                  if (prediction === 'Return'){
                    mess = reply.Return
                    this.setState({stateConv:'return'})
                  }
                  if (prediction === 'feedback'){
                    mess = reply.Feedback
                  }
                  if (prediction === 'Hello'){
                    mess = reply.Hello
                  }
                  if (prediction === 'Connect'){
                    mess = reply.Connect
                  }
                  if (prediction === 'Done'){
                    mess = reply.Done
                    this.setState({infor: {
                      'size':'','weight':'','height':'','V2':'',
                      'phone':'','Id_cus':'','addr':'','material':'','color':'','amount':'',
                      'name':'','url': '','typeI':'','typeR': ''
                    }})
                    newcon.push('Bot: ' + mess)
                    this.conversationUpdate(newcon)
                  }
                  if(prediction === 'OK'){
                    mess = reply.OK
                    if(stateConv === 'sizeadvisory'){
                      this.setState({stateConv:'order'})
                      mess = 'Bạn cho mình xin tên + sđt + địa chỉ mình ship cho bạn nha'
                    }
                    else if(stateConv === 'order'){

                    }
                  }
                  if(prediction === 'Other'){
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

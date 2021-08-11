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
        size: '', weight: '', height: '', V2: '',
        phone: '', Id_cus: '', addr: '', material: '',
        color: '', amount: '', price: '',
        name: '', url: '', typeI: '', typeR: '' 
      },
      stateConv: 'inforproduct', //[inforproduct, sizeadvisory, order, changing]
      sizeR: '',
      previousReply: '',
      previousIntent: '',
      order: {
        name_product: '',
        amount: 1,
        size: '',
        color: '',
        addr: '',
        phone: '',
        name_cus: '',
        price: ''
      },
      lstCus : []
    };
    this.theme = {
      background: 'rgba(255, 255, 255, 1)',
      fontFamily: 'Helvetica Neue',
      'border-radius': '10px',
      headerBgColor: 'rgba(141, 131, 156, 0.667)',
      headerFontColor: '#fff',
      headerFontSize: '25px',
      botBubbleColor: '#fff',
      botFontColor: '#4a4a4a',
      userBubbleColor: 'rgba(141, 131, 156, 0.667)',
      userFontColor: '#fff',
    };
  };

  async predict(text){
    const url = "http://localhost:8000/predictJson";
    const bodyData = JSON.stringify({
      "text" : text
    });
    const reqOpt = {method: "POST", headers: {"Content-type": "application/json"}, body: bodyData};
    await fetch(url, reqOpt)
    .then((resp)=>resp.json())
    .then((respJ)=> {
      this.setState({
        prediction:respJ.label,
      }, ()=>{
        console.log(respJ)
        const {infor, order, stateConv, previousReply, previousIntent, conversation, lstCus} = this.state
        let temp = infor,
            sizeR = respJ.infor.size,
            stateConvUpdate = stateConv,
            temporder = order,
            lstCusTemp = lstCus;

        if(!infor.name && respJ.infor.name){
          temp = respJ.infor
          if(infor.height && !respJ.infor.height){
            temp.height = infor.height
          }
          if(infor.weight && !respJ.infor.weight){
            temp.weight = infor.weight
          }
          if(infor.V2 && !respJ.infor.V2){
            temp.V2 = infor.V2
          }
        }
        else if(infor.name && respJ.infor.name && respJ.infor.name !== infor.name){
          temp = respJ.infor
        }
        else if((respJ.infor.typeI).includes('height') || (respJ.infor.typeI).includes('weight')){
          if(respJ.infor.height)
            temp.height = respJ.infor.height
          if(respJ.infor.weight)
            temp.weight = respJ.infor.weight
        }
        else if(respJ.infor.typeI === 'size' && respJ.infor.size){
          console.log(infor.size)
          if(!(infor.size).includes(respJ.infor.size)){
            sizeR = 'None' + respJ.infor.size
          }
          else if(respJ.label === 'Inform'){
            sizeR = respJ.infor.size
          }
        }
        else if(respJ.infor.typeI === 'V2' && respJ.infor.V2){
          temp.V2 = respJ.infor.V2
        }
        else if(respJ.infor.typeI === 'phone' && respJ.infor.phone){
          temp.phone = respJ.infor.phone
        }
        else if(respJ.infor.typeI === 'address' && respJ.infor.addr){
          temp.addr = respJ.infor.addr
        }
        else if(respJ.infor.typeI === 'amount_product' && respJ.infor.amount){
          temp.amount = respJ.infor.amount
        }
        if(respJ.label === 'Request'){
          let check = false
          stateConvUpdate = 'inforproduct'
          if(respJ.infor.typeI !== 'size' && respJ.infor.typeR === 'size' && (respJ.infor.height || respJ.infor.weight || respJ.infor.V2)){
            stateConvUpdate = 'sizeadvisory'
          } 
          else if(respJ.infor.typeR === 'size'){
            let temp1 = conversation.slice(-2)
            if(temp1[0].includes('User: ') && previousIntent === 'Inform'){
              stateConvUpdate = 'sizeadvisory'
              infor.typeI = 'height'
              check = true
            }
          }
          if(infor.typeR !== "no-find-img" && !respJ.infor.name){
            temp.typeR = respJ.infor.typeR
            if(!check)
              temp.typeI = respJ.infor.typeI
          }
          else if(infor.name !== respJ.infor.name){
            temp = respJ.infor
          }
        }
        else if (respJ.label === 'Inform'){
          if((respJ.infor.typeI === 'size' || respJ.infor.typeR === 'size') && stateConv !== 'order'){
            stateConvUpdate = 'sizeadvisory'
          }
          if(respJ.infor.height || respJ.infor.weight || respJ.infor.V2){
            stateConvUpdate = 'sizeadvisory'
          }
          temp.typeI = respJ.infor.typeI
          temp.typeR = infor.typeR
        }
        else if(respJ.label === 'Other'){
          if(stateConv === 'sizeadvisory'){
            if(previousReply === reply.Request['V2-customer']){
              temp.V2 = respJ.infor.V2 ? respJ.infor.V2 : -1;
              temp.typeI = 'V2'
            }
            else if(previousReply === reply.Request['weight-customer']){
              temp.weight = respJ.infor.weight ? respJ.infor.weight : -1
              temp.typeI = 'weight'
            }
            else if(previousReply === reply.Request['height-customer']){
              temp.height = respJ.infor.height ? respJ.infor.height : -1
              temp.typeI = 'height'
            }
          }
          if(stateConv === 'order'){
            if(previousReply === reply.Order.phone){
              temp.phone = respJ.infor.phone
              temp.typeI = 'phone'
            }
          }
          temp.typeR = respJ.infor.typeR
        }
        if(stateConv === 'order' || respJ.label === 'Order'){
          if(respJ.infor.name && !order.name_product){
            temporder.name_product = respJ.infor.name
          }
          else if(!respJ.infor.name && infor.name){
            temporder.name_product = infor.name
          }
          if(respJ.infor.addr && !order.addr){
            temporder.addr = respJ.infor.addr
          }
          if(respJ.infor.phone && !order.phone){
            temporder.phone = respJ.infor.phone
          }
          if(respJ.infor.amount && !order.amount){
            temporder.amount = respJ.infor.amount
          }
          if(respJ.infor.Id_cus && !order.name_cus){
            temporder.name_cus = respJ.infor.Id_cus
          }
          if(sizeR && (!order.size || order.size.includes('None'))){
            temporder.size = sizeR
          }
          else if (!sizeR && this.state.sizeR){
            temporder.size = this.state.sizeR
          }
          temporder.price = temporder.amount * infor.price
          stateConvUpdate = 'order'
        }
        if(respJ.label === 'Request' || respJ.label === 'Order'){
          lstCusTemp.push([respJ.label, respJ.infor.typeI, respJ.infor.typeR])
        }
        this.setState({
          sizeR,
          stateConv: stateConvUpdate,
          infor: temp,
          order: temporder,
          lstCus: lstCusTemp,
          previousIntent: respJ.label
        })
      })
    });
  };

  async predictImg(urlin){
    const url = "http://localhost:8000/imgPredict";
    const bodyData = JSON.stringify({
      "img" : urlin
    });
    const reqOpt = {method: "POST", headers: {"Content-type": "application/json"}, body: bodyData};
    await fetch(url, reqOpt)
    .then((resp) => resp.json())
    .then((respJ) => {
      const { infor } = this.state;
      let temp = respJ.infor;

      if(infor.typeR){
        temp.typeR = infor.typeR;
      }
      if(infor.height){
        temp.height = infor.height
      }
      if(infor.weight){
        temp.weight = infor.weight
      }
      if(infor.V2){
        temp.V2 = infor.V2
      }
      this.setState({
        infor:temp,
        prediction:respJ.label
      });
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
    .then((resp) => resp.json())
    .then((respJ) => {
      console.log('Conversation updated!')
    });
  };

  async order(infor){
    const url = "http://localhost:8000/order";
    const bodyData = JSON.stringify({
      "order" : infor
    });
    const reqOpt = {method: "POST", headers: {"Content-type": "application/json"}, body: bodyData};
    await fetch(url, reqOpt)
    .then((resp) => resp.json())
    .then((respJ) => {
      console.log('Bill updated!')
    });
  }

  consultation(height, weight, v2){
    if(weight >= 40 && weight <= 56){
      if(weight <= 47){
        return 'S'
      }
      else if(weight >= 53){
        return 'L'
      }
      return 'M'
    }
    else if (v2 >= 55 && v2 <= 74){
      if(v2 <= 66){
        return 'S'
      }
      else if(v2 >= 71){
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
            headerTitle = 'TMT chatbot'
            botDelay = {5000}
            userDelay = {1500}
            width = {'750px'}
            height = {'650px'}
            steps = {[
              {
                id: 'start',
                message: () => {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: Welcome!')
                  this.setState({conversation:newcon})
                  return reply['Hello-Connect']
                },
                trigger: 'user',
              },
              {
                id: 'user',
                user: true,
                trigger: (value)=>{
                  if(!value.value){
                    return 'user'
                  }
                  const {conversation} = this.state;
                  var newcon = conversation;
                  if(Array.isArray(value.value)){
                    newcon.push('User:ImageURL')
                    this.predictImg(value.value[0])
                  }
                  else{
                    newcon.push('User: ' + value.value)
                    this.predict(value.value)
                  }
                  this.setState({conversation: newcon})
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
                message:(value)=>{
                  var {conversation, infor, stateConv, order, sizeR, lstCus, prediction} = this.state;
                  console.log(infor)
                  var {typeI, typeR} = infor;
                  var newcon = conversation,
                      many = false,
                      mess = "";
                  if (lstCus.length >= 1){
                    many = true;
                    prediction = lstCus[0][0];
                    typeI = lstCus[0][1]
                    typeR = lstCus[0][2]
                  }
                  if (prediction === 'Other'){
                    mess = reply.Other
                    if(stateConv === 'sizeadvisory'){
                      prediction = 'Inform'
                    }
                    else if(typeR === 'product_image'){
                      prediction = 'Request'
                    }
                    else if(typeI === 'phone'){
                      prediction = 'Order'
                    }
                  }
                  if (prediction === 'Inform') {
                    mess = reply.Inform
                    if(!infor.name){
                      mess = reply.Request.not_ID_product
                    }
                    else if(stateConv === 'sizeadvisory'){
                      let t = this.consultation(infor.height, infor.weight, infor.V2);
                      if(t !== 'Nonesize'){
                        mess = 'Vậy bạn mặc size ' + t + ' là siêu đẹp luôn nha.'
                        if(!infor.size.includes(t)){
                          mess += ' Nhưng mà bên mình hết size ' + t + ' rồi bạn thông cảm nha.'
                        }
                      }
                      if(!infor.name){
                        prediction = 'Request'
                      }
                      else if(sizeR.includes('None')){
                        mess = 'Xin lỗi bạn bên mình hết size ' + sizeR.slice(-1) + ' rồi nha.'
                      }
                      else if(typeI === 'size'){
                        mess = reply.Request.sizeadvisory
                      }
                      else{
                        if (!infor.height){
                          mess = reply.Request['height-customer']
                        }
                        else if(!infor.V2){
                          mess = reply.Request['V2-customer']
                        }
                        else if(!infor.weight){
                          mess = reply.Request['weight-customer']
                        }
                        else if(t !== 'Nonesize'){
                          mess = 'Vậy bạn mặc size ' + t + ' là siêu đẹp luôn nha.'
                          if(!infor.size.includes(t)){
                            mess += ' Nhưng mà bên mình hết size ' + t + ' rồi bạn thông cảm nha.'
                          }
                        }
                        else mess = reply.Request['not-found-size']
                      }
                    }
                    else if(stateConv === 'order'){
                      prediction = 'Order'
                    }
                    else if(stateConv === 'inforproduct'){
                      prediction = 'Request'
                    }
                  }
                  if (prediction === 'Request'){
                    if (typeR === 'ID_product'){
                      mess = infor.name + ' còn hàng á. Chất liệu ' + infor.material + ' nha. Bạn cho mình số đo mình tư vấn size cho bạn nha.'
                      if(!infor.name){
                        mess = reply.Request.not_found_product
                      }
                      else if(infor.amount === 0){
                        mess = infor.name + reply.Request['out-of-pro']
                      }
                    }
                    else if(!infor.name){
                      mess = reply.Request.not_ID_product
                    }
                    else if(typeR === 'amount_product'){
                      if(infor.amount === 0){
                        mess = infor.name + reply.Request['out-of-pro']
                      }
                      else{
                        mess = infor.name + ' còn hàng nha. Bạn cho mình xin số đo mình tư vấn size cho bạn nha.'
                      } 
                    }
                    else if (typeR === 'size'){
                      mess = infor.name + ' còn size ' + infor.size + ' nha.'
                      if(!(infor.weight && infor.height)){
                        mess += ' Bạn cho mình xin chiều cao cân nặng mình tư vấn thêm cho bạn nha!'
                      }
                      if((sizeR).includes('None')){
                        mess = infor.name + ' hết size ' + (sizeR).slice(-1) + ' rồi nha.'
                      }
                      else if(infor.amount === 0){
                        mess = infor.name + reply.Request['out-of-pro']
                      }
                      else if(stateConv === 'sizeadvisory'){
                        let t = this.consultation(infor.height, infor.weight, infor.V2);
                        if(t !== 'Nonesize'){
                          mess = 'Vậy bạn mặc size ' + t + ' là siêu đẹp luôn nha.'
                          if(!infor.size.includes(t)){
                            mess += ' Nhưng mà bên mình hết size ' + t + ' rồi bạn thông cảm nha.'
                          }
                        }
                        else if(typeI === 'size'){
                          mess = reply.Request.sizeadvisory
                          if(infor.size.includes('None')){
                            mess = 'Xin lỗi bạn bên mình hết size ' + infor.size.slice(-1) + ' rồi nha.'
                          }
                        }
                        else {
                          if(!infor.weight){
                            mess = reply.Request['weight-customer']
                          }
                          else if (!infor.height){
                            mess = reply.Request['height-customer']
                          }
                          else if (!infor.V2){
                            mess = reply.Request['V2-customer']
                          }
                          else{
                            mess = reply.Request['not-found-size'] 
                          }
                        }
                      }
                    }
                    else if (typeR === 'material_product'){
                      mess = 'Dạ ' + infor.name + ' chất ' + infor.material + ' nha.'
                    }
                    else if (typeR === 'product_image'){
                      mess = 'Dạ đây ạ.'
                    }
                    else if (typeR === 'color_product'){
                      mess = infor.name + ' còn màu ' + infor.color + ' nha.'
                    }
                    else if (typeR === 'cost_product'){
                      mess = infor.name + ' có giá ' + infor.price +'k nha.'
                    }
                    else {
                      mess = reply.Request[typeR]
                    }
                  }
                  if (prediction === 'Order'){
                    console.log(order)
                    if(!infor.name){
                      mess = reply.Request.not_ID_product
                    }
                    else if(infor.amount === 0){
                      mess = infor.name + reply.Request['out-of-pro']
                    }
                    else if(!order.name_product){
                      mess = reply.Order.ID_product
                    }
                    else if(!order.size){
                      mess = reply.Order.size
                    }
                    else if(order.size.includes('None')){
                      mess = 'Xin lỗi bạn bên mình hết size ' + order.size.slice(-1) + ' rồi nha. Bạn chọn size khác giúp mình với ạ.'
                    }
                    else if(!order.phone){
                      mess = reply.Order.phone
                    }/* 
                    else if(!order.addr){
                      mess = reply.Order.address
                    }
                    else if(!order.name){
                      mess = reply.Order.name
                    } */
                    else {
                      mess = reply.Order.check
                    }
                    this.setState({stateConv: 'order'})
                  }
                  if (prediction === 'Changing' || prediction === 'Return'){
                    mess = reply['Changing-Return']
                    this.setState({stateConv:'changing'})
                  }
                  if (prediction === 'feedback'){
                    mess = reply.Done
                  }
                  if (prediction === 'Hello' || prediction === 'Connect'){
                    mess = reply['Hello-Connect']
                  }
                  if (prediction === 'OK'){
                    mess = reply.OK
                    if(stateConv === 'sizeadvisory' && this.state.previousReply !== reply.Request['not-found-size']){
                      this.setState({stateConv:'order'})
                      mess = reply.Order.ok
                    }
                    else if(stateConv === 'order'){
                      if(this.state.previousReply === 'doneOrder'){
                        mess = reply.Done
                        this.order(order)
                      }
                    }
                  }
                  if (prediction === 'Done'){
                    mess = reply.Done
                    this.setState({
                      sizeR: '',
                      conversation: '',
                      previousReply: '',
                      previousIntent: '',
                      infor: {
                        size: '', weight: '', height: '', V2: '', phone: '', Id_cus: '', addr: '',
                        material: '', color: '', amount: '', name: '', url: '', typeI: '', typeR: ''
                      },
                      lstCus: [],
                      order: {
                        name_product: '', amount: 1, size: '', color: '', addr: '', phone: '', name_cus: '', price: ''
                      }
                    })
                    newcon.push('Bot: ' + mess)
                    this.conversationUpdate(newcon)
                    return mess
                  }
                  let m = conversation.slice(-1);
                  if(!m[0].includes('User:') && many){
                    if(value.steps.reply && value.steps.reply.message === mess)
                    {
                      mess = 'gypERR!sackError:Col o id nyVisualStuio nstallationtouse'
                    }
                  }
                  if(mess !== 'gypERR!sackError:Col o id nyVisualStuio nstallationtouse'){
                    newcon.push('Bot: ' + mess)
                    this.setState({
                      conversation: newcon,
                      previousReply: mess,
                    })
                  }
                  return mess
                },
                trigger: (value)=>{
                  var {lstCus} = this.state;
                  if(lstCus.length > 1){
                    lstCus.shift();
                    return 'reply'
                  }
                  else{
                    lstCus.shift();
                  }
                  if(value.steps.reply.message === reply.Request.sizeadvisory){
                    return 'sizetable'
                  }
                  if(value.steps.reply.message === reply.Request['not-found-size'] || value.steps.reply.message === reply.Request.not_found_product){
                    return 'newproduct'
                  }
                  if(value.steps.reply.message === 'Dạ đây ạ.'){
                    return 'imageProduct'
                  }
                  if(value.steps.reply.message === reply.Order.check){
                    return 'ordername'
                  }
                  return 'user'
                }
              },
              {
                id: 'sizetable',
                message: reply.sizeTable,
                trigger: 'user'
              },
              {
                id: 'newproduct',
                message: () => {
                  var newm = this.state.conversation,
                      mess = 'Bạn muốn tư vấn sản phẩm khác ko ạ?'
                  newm.push('Bot: ' + mess);
                  this.setState({conversation: newm});
                  return mess;
                },
                trigger: 'user'
              },
              {
                id: 'imageProduct',
                message: () => {
                  const {infor} = this.state;
                  let len = infor.url.length
                  return 'http://localhost:8000' + infor.url[Math.floor(Math.random() * len)]
                },
                trigger: 'user'
              },
              {
                id: 'ordername',
                message:() => {
                  const {order, conversation} = this.state;
                  var mess = 'Tên người nhận: ' + order.name_cus,
                      newm = conversation;
                  newm.push('Bot: ' + mess);
                  this.setState({conversation: newm});
                  return mess;
                },
                trigger: 'orderphone-address'
              },
              {
                id: 'orderphone-address',
                message: () => {
                  const {order, conversation} = this.state;
                  var mess = 'Sđt: ' + order.phone + '. Địa chỉ: ' + order.addr + '.',
                      newm = conversation;
                  newm.push('Bot: ' + mess);
                  this.setState({conversation: newm});
                  return mess;
                },
                trigger: 'product'
              },
              {
                id: 'product',
                message: () => {
                  const {order, conversation} = this.state;
                  this.setState({previousReply: 'doneOrder'})
                  var mess = String(order.amount) + ' ' + order.name_product + ' size ' + order.size + '. Tổng cộng đơn hàng là ' + order.price + 'k nha.',
                      newm = conversation;
                  newm.push('Bot: ' + mess);
                  this.setState({conversation: newm});
                  return mess;
                },
                trigger: 'user'
              }
            ]}
          />
          </ThemeProvider>
        </header>
      </div>
    );
  }
}
export default App;

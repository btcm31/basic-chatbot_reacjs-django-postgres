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
        color: '', amount: '', price: '' ,
        name: '',url: '' ,typeI: '',typeR: '' 
      },
      stateConv: 'inforproduct', //[inforproduct, sizeadvisory, order, changing, return]
      sizeR: '',
      previousIntent: '',
      order: {
        name_product: '',
        amount: '',
        size: '',
        color: '',
        addr: '',
        phone: '',
        name_cus: '',
        price: ''
      }
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
    await fetch(url,reqOpt)
    .then((resp)=>resp.json())
    .then((respJ)=> {
      this.setState({
        prediction:respJ.label,
      }, ()=>{
        console.log(respJ.infor)
        const {infor, order, stateConv, previousIntent, conversation} = this.state
        let temp = infor,
            sizeR = respJ.infor.size,
            stateConvUpdate = stateConv, 
            temporder = order;

        if(infor.name === "" && respJ.infor.name !== ""){
          temp = respJ.infor
          if(infor.height !== '' && respJ.infor.height === ''){
            temp.height = infor.height
          }
          if(infor.weight !== '' && respJ.infor.weight === ''){
            temp.weight = infor.weight
          }
          if(infor.V2 !== '' && respJ.infor.V2 === ''){
            temp.V2 = infor.V2
          }
        }
        else if(infor.name !== "" && respJ.infor.name !== "" && respJ.infor.name !== infor.name){
          temp = respJ.infor
        }
        else if(respJ.infor.typeI === 'height' && respJ.infor.height !== ''){
          temp.height = respJ.infor.height
        }
        else if(respJ.infor.typeI === 'weight' && respJ.infor.weight !== ''){
          temp.weight = respJ.infor.weight
        }
        else if(respJ.infor.typeI === 'heightweight'){
          temp.height = respJ.infor.height
          temp.weight = respJ.infor.weight
        }
        else if(respJ.infor.typeI === 'size' && respJ.infor.size !== ''){
          if(!(infor.size).includes(respJ.infor.size)){
            sizeR = 'None' + respJ.infor.size
          }
          else if(respJ.label === 'Inform'){
            sizeR = respJ.infor.size
          }
        }
        else if(respJ.infor.typeI === 'V2' && respJ.infor.V2 !== ''){
          temp.V2 = respJ.infor.V2
        }
        else if(respJ.infor.typeI === 'phone' && respJ.infor.phone !== ''){
          temp.phone = respJ.infor.phone
        }
        else if(respJ.infor.typeI === 'address' && respJ.infor.addr !== ''){
          temp.addr = respJ.infor.addr
        }
        else if(respJ.infor.typeI === 'amount_product' && respJ.infor.amount !== ''){
          temp.amount = respJ.infor.amount
        }
        if(respJ.label === 'Request'){
          let check = false
          stateConvUpdate = 'inforproduct'
          if(respJ.infor.typeI !== 'size'&& respJ.infor.typeR === 'size'){
            stateConvUpdate = 'sizeadvisory'
          } 
          else if(respJ.infor.typeR === 'size'){
            let temp1 = conversation.slice(-2)
            if(temp1[0].includes('User: ')){
              stateConvUpdate = 'sizeadvisory'
              infor.typeI = 'height'
              check = true
            }
          }
          if(infor.typeR !== "no-find-img" && respJ.infor.name === ''){
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
          if(respJ.infor.height !== '' || respJ.infor.weight !== '' || respJ.infor.V2 !== ''){
            stateConvUpdate = 'sizeadvisory'
          }
          temp.typeI = respJ.infor.typeI
          temp.typeR = infor.typeR
        }
        else if(respJ.label === 'Other'){
          if(stateConv === 'sizeadvisory'){
            if(previousIntent === reply.Request['V2-customer']){
              temp.V2 = respJ.infor.V2 ? respJ.infor.V2 : -1;
              temp.typeI = 'V2'
            }
            else if(previousIntent === reply.Request['weight-customer']){
              temp.weight = respJ.infor.weight ? respJ.infor.weight : -1
              temp.typeI = 'weight'
            }
            else if(previousIntent === reply.Request['height-customer']){
              temp.height = respJ.infor.height ? respJ.infor.height : -1
              temp.typeI = 'height'
            }
          }
          if(stateConv === 'order'){
            if(previousIntent === reply.Order.phone){
              temp.phone = respJ.infor.phone
              temp.typeI = 'phone'
            }
          }
          temp.typeR = respJ.infor.typeR
        }
        if(stateConv === 'order' || respJ.label === 'Order'){
          if(respJ.infor.name !== '' && order.name_product === ''){
            temporder.name_product = respJ.infor.name
          }
          else if(respJ.infor.name === '' && infor.name !== ''){
            temporder.name_product = infor.name
          }
          if(respJ.infor.addr !== '' && order.addr === '' ){
            temporder.addr = respJ.infor.addr
          }
          if(respJ.infor.phone !== '' && order.phone === ''){
            temporder.phone = respJ.infor.phone
          }
          if(respJ.infor.amount !== '' && order.amount === ''){
            temporder.amount = respJ.infor.amount
          }
          if(respJ.infor.Id_cus !== '' && order.name_cus === ''){
            temporder.name_cus = respJ.infor.Id_cus
          }
          if(respJ.infor.size !== '' && order.size === ''){
            temporder.size = respJ.infor.size
          }
          else if (respJ.infor.size === '' && this.state.sizeR !== ''){
            temporder.size = this.state.sizeR 
          }
        }
        if(respJ.label === 'Order'){
          stateConvUpdate = 'order'
        }
        this.setState({
          sizeR,
          stateConv: stateConvUpdate,
          infor: temp,
          order: temporder
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
    await fetch(url,reqOpt)
    .then((resp) => resp.json())
    .then((respJ) => {
      const { infor } = this.state;
      let temp = respJ.infor;

      if(infor.typeR !== ''){
        temp.typeR = infor.typeR;
      }
      if(infor.height !== ''){
        temp.height = infor.height
      }
      if(infor.weight !== ''){
        temp.weight = infor.weight
      }
      if(infor.V2 !== ''){
        temp.V2 = infor.V2
      }
      this.setState({
        infor:temp,
        prediction:respJ.label
      }, () => {
        console.log(infor)
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
    .then((resp) => resp.json())
    .then((respJ) => {
      this.setState({conversation: []})
    });
  };

  consultation(height,weight,v2){
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
                  console.log(reply['Hello-Connect'])
                  var newcon = conversation;
                  newcon.push('Bot: Welcome!')
                  this.setState({conversation:newcon})
                  this.predict('')
                  return reply['Hello-Connect']
                },
                trigger: 'user',
              },
              {
                id: 'user',
                user: true,
                trigger: (value)=>{
                  console.log(value.value)
                  if(!value.value){
                    return 'user'
                  }
                  const {conversation} = this.state;
                  var newcon = conversation;  
                  if(Array.isArray(value.value)){
                    newcon.push('User:ImageURL')
                    this.setState({conversation: newcon})
                    this.predictImg(value.value[0])
                  }
                  else{
                    newcon.push('User: ' + value.value)
                    this.setState({conversation: newcon})
                    this.predict(value.value)
                  }
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
                  const {conversation,infor,stateConv,order,sizeR} = this.state;
                  var prediction = this.state.prediction;
                  var newcon = conversation;
                  console.log(prediction)
                  console.log(stateConv)
                  console.log(infor)
                  if(prediction === 'Other'){
                    mess = reply.Other
                    if(stateConv === 'sizeadvisory'){
                      prediction = 'Inform'
                    }
                    else if(infor.typeR === 'product_image'){
                      prediction = 'Request'
                    }
                    else if(infor.typeI === 'phone'){
                      prediction = 'Order'
                    }
                  }
                  if (prediction === 'Inform') {
                    mess = reply.Inform
                    console.log(infor)
                    if(infor.name === ''){
                      mess = reply.Request.not_ID_product
                    }
                    else if(stateConv === 'sizeadvisory'){
                      console.log(infor.typeI)
                      let t = this.consultation(infor.height,infor.weight,infor.V2);
                      if(t !== 'Nonesize'){
                        mess = 'Vậy bạn mặc size ' + t + ' là siêu đẹp luôn nha.'
                        if(!infor.size.includes(t)){
                          mess += ' Nhưng mà bên mình hết size ' + t + ' rồi bạn thông cảm nha.'
                        }
                      }
                      if(infor.ID_product === ''){
                        prediction = 'Request'
                      }
                      else if(sizeR.includes('None')){
                        mess = 'Xin lỗi bạn bên mình hết size ' + sizeR.slice(-1) + ' rồi nha.'
                      }
                      else if(infor.typeI === 'size'){
                        mess = reply.Request.sizeadvisory
                      }
                      else{
                        if (infor.height === ''){
                          mess = reply.Request['height-customer']
                        }
                        else if(infor.V2 === ''){
                          mess = reply.Request['V2-customer']
                        }
                        else if(infor.weight === ''){
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
                  if(prediction === 'Request'){
                    console.log(infor.typeR)
                    if (infor.typeR === 'ID_product'){
                      mess = infor.name + ' còn hàng á. Chất liệu ' + infor.material + ' nha. Bạn cho mình số đo mình tư vấn size cho bạn nha.'
                      if(infor.name === ''){
                        mess = reply.Request.not_found_product
                      }
                      else if(infor.amount === 0){
                        mess = infor.name + reply.Request['out-of-pro']
                      }
                    }
                    else if(infor.name === ''){
                      mess = reply.Request.not_ID_product
                    }
                    else if(infor.typeR === 'amount_product'){
                      if(infor.amount === 0){
                        mess = infor.name + reply.Request['out-of-pro']
                      }
                      else{
                        mess = infor.name + ' còn hàng nha. Bạn cho mình xin số đo mình tư vấn size cho bạn nha.'
                      } 
                    }
                    else if (infor.typeR === 'size'){
                      mess = infor.name + ' còn size ' + infor.size + ' nha.'
                      if(!(infor.weight && infor.height)){
                        mess += ' Bạn cho mình xin chiều cao cân nặng mình tư vấn thêm cho bạn nha!'
                      }
                      console.log(stateConv)
                      if((sizeR).includes('None')){
                        mess = infor.name + ' hết size ' + (sizeR).slice(-1) + ' rồi nha.'
                      }
                      else if(infor.amount === 0){
                        mess = infor.name + reply.Request['out-of-pro']
                      }
                      else if(stateConv === 'sizeadvisory'){
                        let t = this.consultation(infor.height,infor.weight,infor.V2);
                        if(t !== 'Nonesize'){
                          mess = 'Vậy bạn mặc size ' + t + ' là siêu đẹp luôn nha.'
                          if(!infor.size.includes(t)){
                            mess += ' Nhưng mà bên mình hết size ' + t + ' rồi bạn thông cảm nha.'
                          }
                        }
                        else if(infor.typeI === 'size'){
                          mess = reply.Request.sizeadvisory
                          if(infor.size.includes('None')){
                            mess = 'Xin lỗi bạn bên mình hết size ' + infor.size.slice(-1) + ' rồi nha.'
                          }
                        }
                        else {
                          if(infor.weight === ''){
                            mess = reply.Request['weight-customer']
                          }
                          else if (infor.height === ''){
                            mess = reply.Request['height-customer']
                          }
                          else if (infor.V2 === ''){
                            mess = reply.Request['V2-customer']
                          }
                          else{
                            mess = reply.Request['not-found-size'] 
                          }
                        }
                      }
                    }
                    else if (infor.typeR === 'material_product'){
                      mess = 'Dạ ' + infor.name + ' chất ' + infor.material + ' nha.'
                    }
                    else if (infor.typeR === 'product_image'){
                      mess = 'Dạ đây ạ.'
                    }
                    else if (infor.typeR === 'color_product'){
                      mess = infor.name + ' còn màu ' + infor.color + ' nha.'
                    }
                    else if (infor.typeR === 'cost_product'){
                      mess = infor.name + ' có giá 380k giảm còn 195k nha.'
                    }
                    else {
                      console.log('bhjn')
                      mess = reply.Request[infor.typeR]
                    }
                  }
                  if (prediction === 'Order'){
                    if(infor.name === ''){
                      mess = reply.Request.not_ID_product
                    }
                    else if(infor.amount === 0){
                      mess = infor.name + reply.Request['out-of-pro']
                    }
                    else if(order.name_product === ''){
                      mess = reply.Order.ID_product
                    }
                    else if(order.size === ''){
                      mess = reply.Order.size
                    }
                    else if(order.amount === ''){
                      mess = reply.Order.amount
                    }
                    else if(order.phone === ''){
                      mess = reply.Order.phone
                    }
                    else if(order.addr === ''){
                      mess = reply.Order.address
                    }
                    else if(order.name === ''){
                      mess = reply.Order.name
                    }
                    else {
                      mess = reply.Order.check
                    }
                    this.setState({stateConv: 'order'})
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
                  if (prediction === 'Hello' || prediction === 'Connect'){
                    mess = reply['Hello-Connect']
                  }
                  if(prediction === 'OK'){
                    mess = reply.OK
                    if(stateConv === 'sizeadvisory' && this.state.previousIntent !== reply.Request['not-found-size']){
                      this.setState({stateConv:'order'})
                      console.log(infor)
                      mess = reply.Order.ok
                    }
                    else if(stateConv === 'order'){
                      if(this.state.previousIntent === 'doneOrder'){
                        mess = reply.Done
                      }
                    }
                  }
                  if (prediction === 'Done'){
                    mess = reply.Done
                    this.setState({
                      sizeR: '',
                      conversation: '',
                      previousIntent: '',
                      infor: {
                        'size':'','weight':'','height':'','V2':'',
                        'phone':'','Id_cus':'','addr':'','material':'','color':'','amount':'',
                        'name':'','url': '','typeI':'','typeR': ''
                      }
                    })
                    newcon.push('Bot: ' + mess)
                    this.conversationUpdate(newcon)
                    return mess
                  }
                  newcon.push('Bot: ' + mess)
                  this.setState({
                    conversation: newcon,
                    previousIntent: mess
                  })
                  return mess
                },
                trigger: (value)=>{
                  //return 'order'
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
                message: 'Bạn muốn tư vấn sản phẩm khác ko ạ?',
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
                  const {order} = this.state;
                  return 'Tên người nhận: ' + order.name_cus
                },
                trigger: 'orderphone-address'
              },
              {
                id: 'orderphone-address',
                message: () => {
                  const {order} = this.state;
                  return 'Sđt: ' + order.phone + '. Địa chỉ: ' + order.addr + '.'
                },
                trigger: 'product'
              },
              {
                id: 'product',
                message: () => {
                  const {order} = this.state;
                  this.setState({previousIntent: 'doneOrder'})
                  return String(order.amount) + ' ' + order.name_product + ' size ' + order.size + '. Tổng cộng đơn hàng là ' + order.price + ' nha.'
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

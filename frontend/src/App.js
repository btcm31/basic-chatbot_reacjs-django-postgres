import './App.css';
import React, { Component } from 'react';
import ChatBot from './components';
import { ThemeProvider } from 'styled-components';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      prediction: '',
      conversation:[],
      product: {'name':"",'url': "", 'color':"", 'amount': "",'material':"",'size':"",'typeR': ""}
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
  }
  async predict(text){
    const url = "http://localhost:8000/predictJson";
    const bodyData = JSON.stringify({
      "text" : text
    });
    const reqOpt = {method:"POST",headers:{"Content-type":"application/json"},body:bodyData};
    await fetch(url,reqOpt)
    .then((resp)=>resp.json())
    .then((respJ)=> {
      this.setState({prediction:respJ.label},()=>{
        if(this.state.prediction==="Request"){
          if(respJ.infor.name !== ""){
            this.setState({product:respJ.infor})
          }
          else{
            const m = respJ.infor.typeR;
            this.state.product.typeR = m;
          }
        }
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
    const reqOpt = {method:"POST",headers:{"Content-type":"application/json"},body:bodyData};
    await fetch(url,reqOpt)
    .then((resp)=>resp.json())
    .then((respJ)=> {
      this.setState({conversation:[]})
    });
  }
  getDataUrl(img) {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // Set width and height
    canvas.width = img.width;
    canvas.height = img.height;
    // Draw the image
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg');
 }

  render(){
    return (
      <div className="App">
        <header className="App-header">
        
        <ThemeProvider theme={this.theme}>
          <ChatBot
            headerTitle="Intent chatbot"
            botDelay = {1000}
            steps={[
              {
                id: '1',
                message: () => {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: Welcome!')
                  this.setState({conversation:newcon})
                  return 'Welcome!'
                },
                trigger: 'user',
              },
              {
                id: 'user',
                user: true,
                trigger: (value)=>{
                  const {conversation} = this.state;
                  var newcon = conversation;  
                  if(!value.value){
                    newcon.push('User: ImageURL')
                    this.setState({conversation:newcon})
                    return 'user'
                  }
                  newcon.push('User: '+ value.value)
                  this.setState({conversation:newcon})
                  this.predict(value.value)
                  return 'bot'
                }
              },
              {
                id: 'bot',
                message:'gypERR!sackError:Col o id nyVisualStuio nstallationtouse',
                trigger:()=>{
                  var pre = this.state.prediction
                    if(pre ==='Inform'){
                      return 'Inform'
                    }
                    else if(pre ==='Request'){
                      return 'Request'
                    }
                    else if(pre ==='Order'){
                      return 'Order'
                    }
                    else if(pre ==='Changing'){
                      return 'Changing'
                    }
                    else if(pre ==='Return'){
                      return 'Return'
                    }
                    else if(pre ==='feedback'){
                      return 'feedback'
                    }
                    else if(pre ==='Hello'){
                      return 'Hello'
                    }
                    else if(pre ==='Connect'){
                      return 'Connect'
                    }
                    else if(pre ==='Done'){
                      return 'Done'
                    }
                    else if(pre ==='OK'){
                      return 'OK'
                    }
                    else{
                      return 'Other'
                    }
                }
              },
              {
                id: 'Inform',
                message:() => {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: Ok để mình lưu thông tin của bạn luôn.')
                  this.setState({conversation:newcon})
                  return 'Ok để mình lưu thông tin của bạn luôn.'
                },
                trigger:'user'
              },
              {
                id: 'Request',
                message:() => {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  console.log(this.state.product.typeR)
                  if(this.state.product.typeR === "amount_product"){
                    if(this.state.product.name===""){
                      newcon.push('Bot: Bạn muốn hỏi sản phẩm nào á?')
                      this.setState({conversation:newcon})
                      return "Bạn muốn hỏi sản phẩm nào á?"
                    }
                    newcon.push('Bot: '+this.state.product.name + " còn " + String(this.state.product.amount)+ " cái nha.")
                    this.setState({conversation:newcon})
                    return this.state.product.name + " còn " + String(this.state.product.amount)+ " cái nha."
                  }
                  else if(this.state.product.typeR === "size"){
                    if(this.state.product.name===""){
                      newcon.push('Bot: Bạn muốn hỏi sản phẩm nào á?')
                      this.setState({conversation:newcon})
                      return "Bạn muốn hỏi sản phẩm nào á?"
                    }
                    newcon.push('Bot: '+this.state.product.name + " còn size " + this.state.product.size+ " nha.")
                    this.setState({conversation:newcon})
                    return this.state.product.name + " còn size " + this.state.product.size+ " nha."
                  }
                  else if(this.state.product.typeR === "material_product"){
                    if(this.state.product.name===""){
                      newcon.push('Bot: Bạn muốn hỏi sản phẩm nào á?')
                      this.setState({conversation:newcon})
                      return "Bạn muốn hỏi sản phẩm nào á?"
                    }
                    newcon.push("Bot: "+ "Chất liệu " +this.state.product.name + " là " + this.state.product.material+ " á.")
                    this.setState({conversation:newcon})
                    return "Chất liệu " +this.state.product.name + " là " + this.state.product.material+ " nha."
                  }
                  else if(this.state.product.typeR === "shippingfee"){
                    newcon.push("Bot: Phí ship nội thành là 30k còn ngoại thành là 50k nha.")
                    this.setState({conversation:newcon})
                    return "Phí ship nội thành là 30k còn ngoại thành là 50k nha."
                  }
                  else if(this.state.product.typeR === "product_image"){
                    if(this.state.product.name===""){
                      newcon.push('Bot: Bạn muốn hỏi sản phẩm nào á?')
                      this.setState({conversation:newcon})
                      return "Bạn muốn hỏi sản phẩm nào á?"
                    }
                    newcon.push("Bot: ImageURL")
                    this.setState({conversation:newcon})
                    return "http://localhost:8000" + this.state.product.url[0]
                  }
                  else if(this.state.product.typeR === "color_product"){
                    if(this.state.product.name===""){
                      newcon.push('Bot: Bạn muốn hỏi sản phẩm nào á?')
                      this.setState({conversation:newcon})
                      return "Bạn muốn hỏi sản phẩm nào á?"
                    }
                    newcon.push("Bot: "+this.state.product.name + " còn màu " + String(this.state.product.color)+ " nha.")
                    this.setState({conversation:newcon})
                    return this.state.product.name + " còn màu " + this.state.product.color+ " nha."
                  }
                  else if(this.state.product.typeR === "cost_product"){
                    if(this.state.product.name===""){
                      newcon.push('Bot: Bạn muốn hỏi sản phẩm nào á?')
                      this.setState({conversation:newcon})
                      return "Bạn muốn hỏi sản phẩm nào á?"
                    }
                    newcon.push("Bot: " + this.state.product.name + " có giá là " + "123k"+ " nha.")
                    this.setState({conversation:newcon})
                    return this.state.product.name + " có giá là " + " 123k "+ " nha."
                  }
                  else if(this.state.product.typeR === "ID_product"){
                    if(this.state.product.name===""){
                      newcon.push('Bot: Bạn muốn hỏi sản phẩm nào á?')
                      this.setState({conversation:newcon})
                      return "Bạn muốn hỏi sản phẩm nào á?"
                    }
                    const tx = this.state.product.name + " còn " + String(this.state.product.amount)+ " cái. Chất liệu " + this.state.product.material +" nha. Bạn cho mình số đo mình tư vấn thêm nha."
                    newcon.push("Bot: "+tx)
                    this.setState({conversation:newcon})
                    return tx
                  }
                  else {
                    console.log(this.state.product.typeR)
                    newcon.push('Bot: Để mình check thử nha')
                    this.setState({conversation:newcon})
                    return 'Để mình check thử nha'
                  }
                },
                trigger: 'user',
              },
              {
                id: 'feedback',
                message:()=> {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: Dạ cảm ơn về phản hồi của bạn ạ!')
                  this.setState({conversation:newcon})
                  return 'Dạ cảm ơn về phản hồi của bạn ạ!'
                },
                trigger: 'user'
              },
              {
                id: 'Other',
                message:()=> {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: Shop chưa hiểu câu hỏi của bạn :(')
                  this.setState({conversation:newcon})
                  return 'Shop chưa hiểu câu hỏi của bạn :('
                },
                trigger:'user'
              },
              {
                id: 'Done',
                message:()=> {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: Dạ cảm ơn bạn nhiều')
                  this.setState({conversation:newcon})
                  this.conversationUpdate(newcon)
                  this.setState({product: {'name':"",'url': "", 'color':"", 'amount': "",'material':"",'size':"",'typeR': ""}})
                  return 'Dạ cảm ơn bạn nhiều'
                },
                trigger: 'user',
              },
              {
                id: 'OK',
                message:()=> {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: OKi bạn')
                  this.setState({conversation:newcon})
                  return 'OKi bạn'
                },
                trigger: 'user'
              },
              {
                id: 'Changing',
                message:()=> {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: Dạ bạn muốn đổi sản phẩm nào á')
                  this.setState({conversation:newcon})
                  return 'Dạ bạn muốn đổi sản phẩm nào á'
                },
                trigger:'user'
              },
              {
                id: 'Return',
                message:()=> {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: Bạn muốn đổi spham hả')
                  this.setState({conversation:newcon})
                  return 'Bạn muốn đổi spham hả'
                },
                trigger: 'user',
              },
              {
                id: 'Hello',
                message:()=> {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: Hello bạn, bạn cần tư vấn gì á')
                  this.setState({conversation:newcon})
                  return 'Hello bạn, bạn cần tư vấn gì á'
                },
                trigger: 'user'
              },
              {
                id: 'Order',
                message:()=> {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: Bạn cho mình địa chỉ với sđt để mình chốt đơn cho bạn nha.')
                  this.setState({conversation:newcon})
                  return 'Bạn cho mình địa chỉ với sđt để mình chốt đơn cho bạn nha.'
                },
                trigger: 'user',
              },
              {
                id: 'Connect',
                message:()=> {
                  const {conversation} = this.state;
                  var newcon = conversation;
                  newcon.push('Bot: Hello bạn, bạn cần tư vấn gì á')
                  this.setState({conversation:newcon})
                  return 'Hello bạn, bạn cần tư vấn gì á'
                },
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

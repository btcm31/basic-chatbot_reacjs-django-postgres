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
      url: ''
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
      this.setState({prediction:respJ.label})
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
  async getInfor(name){
    const url = "http://localhost:8000/getProductInfor";
    const bodyData = JSON.stringify({
      "name" : name
    });
    const reqOpt = {method:"POST",headers:{"Content-type":"application/json"},body:bodyData};
    await fetch(url,reqOpt)
    .then((resp)=>resp.json())
    .then((respJ)=> {
      this.setState({
        url:respJ.url}, ()=> { 
        console.log(this.state.url)
    });
    });
  };
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
                  if(value.value === "Đầm caro"){
                    newcon.push('User: Đầm caro')
                    this.setState({conversation:newcon})
                    this.getInfor(value.value)
                    return 'img'
                  }
                  newcon.push('User: '+ value.value)
                  this.setState({conversation:newcon})
                  this.predict(value.value)
                  return 'bot'
                }
              },
              {
                id: 'img',
                message: ()=>{
                 const {url} = this.state;
                 return  "http://localhost:8000" + url[0]
                },
                trigger: 'user'
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
                  newcon.push('Bot: Để mình check thử nha')
                  this.setState({conversation:newcon})
                  return 'Để mình check thử nha'
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
                  newcon.push('Bot: Cảm ơn bạn đã ủng hộ shop nha. Để mình chốt đơn cho bạn lun.')
                  this.setState({conversation:newcon})
                  return 'Cảm ơn bạn đã ủng hộ shop nha. Để mình chốt đơn cho bạn lun.'
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

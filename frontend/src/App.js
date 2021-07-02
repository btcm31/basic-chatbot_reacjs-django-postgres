import './App.css';
import React, { Component } from 'react';
import ChatBot from './components';
import { ThemeProvider } from 'styled-components';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      prediction: '',
      conversation:[]
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
      console.log(respJ.conv)
      console.log('conversation updated!')
      this.setState({conversation:[]})
    });
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
                  console.log(newcon)
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
                    console.log(newcon)
                    this.setState({conversation:newcon})
                    return 'user'
                  }
                  newcon.push('User: '+ value.value)
                  console.log(newcon)
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
                  console.log(newcon)
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
                  console.log(newcon)
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
                  console.log(newcon)
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
                  console.log(newcon)
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
                  console.log(newcon)
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
                  console.log(newcon)
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
                  console.log(newcon)
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
                  console.log(newcon)
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
                  console.log(newcon)
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
                  console.log(newcon)
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
                  console.log(newcon)
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

import './App.css';
import React, { Component } from 'react';
import ChatBot from './components';
import { ThemeProvider } from 'styled-components';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      prediction: ''
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
                message: 'Welcome!',
                trigger: 'user',
              },
              {
                id: 'user',
                user: true,
                trigger: (value)=>{
                  if(!value.value){
                    return 'user'
                  }
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
                message: 'Ok để mình lưu thông tin của bạn luôn.',
                trigger:'user'
              },
              {
                id: 'Request',
                message: 'Để mình check thử nha',
                trigger: 'user',
              },
              {
                id: 'feedback',
                message: 'Dạ cảm ơn về phản hồi của bạn ạ!',
                trigger: 'user'
              },
              {
                id: 'Other',
                message: 'Shop chưa hiểu câu hỏi của bạn :(',
                trigger:'user'
              },
              {
                id: 'Done',
                message: 'Okie cảm ơn bạn nhiều',
                trigger: 'user',
              },
              {
                id: 'OK',
                message: 'OKi bạn luôn',
                trigger: 'user'
              },
              {
                id: 'Changing',
                message: 'Dạ bạn muốn đổi sản phẩm nào á',
                trigger:'user'
              },
              {
                id: 'Return',
                message: 'Bạn muốn đổi spham hả',
                trigger: 'user',
              },
              {
                id: 'Hello',
                message: 'Hello bạn, bạn cần tư vấn gì á',
                trigger: 'user'
              },
              {
                id: 'Order',
                message: 'Cảm ơn bạn đã ủng hộ shop nha. Để mình chốt đơn cho bạn lun.',
                trigger: 'user',
              },
              {
                id: 'Connect',
                message: 'Hello bạn, bạn cần tư vấn gì á',
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

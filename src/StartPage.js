import React from "react";
import {
  Alert,
  Button,
  Container,
  Row,
  Col,
  ProgressBar,
} from "react-bootstrap";
import socket from "./socketConfig";
import {Redirect} from "react-router-dom";


const Entities = require("html-entities").XmlEntities;
const entities = new Entities();
const axios = require("axios");
axios.defaults.withCredentials = true;
const serverURL = "http://localhost:3004"; //hier localhost 192.168.178.20

export default class StartPage extends React.Component {
    constructor(props) {
      super();

      this.getCurrentQuestion = this.getCurrentQuestion.bind(this);
      this.renderQuestion = this.renderQuestion.bind(this);
      this.renderAnswers = this.renderAnswers.bind(this);
      this.nextQuestion = this.nextQuestion.bind(this);
      this.checkAnswer = this.checkAnswer.bind(this);
      this.countdownBar = this.countdownBar.bind(this);
      this.renderQuestionCounter = this.renderQuestionCounter.bind(this);
      this.renderRedirect = this.renderRedirect.bind(this);
      this.logout = this.logout.bind(this);

      this.state = {
        questionResults: "",
        currAnswers: [],
        currCorrectAnswer: "",
        currQuestionParsed: "",
        currQuestionNumber: 0,
        siteState: "",
        currentProgress: "100",
        time: "15",
        score:0,
        currUser:'',
        redirect:false
      };
    }


  

    componentDidMount(){
      socket.emit("getCurrUser");
      socket.on("sessionData",(data)=>this.setState({currUser:data.username}));
      socket.on("redirect",(data)=>this.setState({redirect:true}));
      socket.on("forceReload",()=>{
        window.location.reload();
      });
      
    }
    

    countdownBar() {
      let sleepTime = (this.state.time / this.state.currentProgress) * 1000;

      for (let i = 1; i < 101; i++) {
        setTimeout(() => {
          this.setState({
            currentProgress: 100 - i
          });
          if (i === 100) {
            setTimeout(() => {
              this.setState({
                currentProgress: 100
              }); //Hier naja
              this.setState({
                siteState:'answerChecking'
              })
              for (
                var i = 0; i < document.getElementsByClassName("answer").length; i++
              ) {
                document
                  .getElementsByClassName("answer")[i].setAttribute("disabled", "");
                document.getElementsByClassName("answer")[i].classList.remove("zoom");
                
              }
              setTimeout(()=>{
                if(!document.getElementsByClassName("answer")[0].classList.contains('btn-success') && !document.getElementsByClassName("answer")[1].classList.contains('btn-success') && !document.getElementsByClassName("answer")[2].classList.contains('btn-success') && !document.getElementsByClassName("answer")[3].classList.contains('btn-success') && !document.getElementsByClassName("answer")[0].classList.contains('btn-danger') && !document.getElementsByClassName("answer")[1].classList.contains('btn-danger') && !document.getElementsByClassName("answer")[2].classList.contains('btn-danger') && !document.getElementsByClassName("answer")[3].classList.contains('btn-danger')){
                  for(var i = 0; i < document.getElementsByClassName("answer").length; i++){
                    if(document.getElementsByClassName("answer")[i].innerText === this.state.currCorrectAnswer){
                      document.getElementsByClassName("answer")[i].classList.add('btn-success');
                      document.getElementsByClassName("answer")[i].classList.add('blink_me');
                    }
                  }
                }
              },500)
              
              setTimeout(() => {
                this.nextQuestion();
              }, 5000);
            }, 1000);
          }
        }, sleepTime * (i + 1));
      }
    }

    logout(){
      var self = this;
      fetch('/logout',{
        method:"GET",
        header:{
          "Content-Type":"application/json"
        }
      })
      .then(function(response){
        console.log("logout");
        window.location.reload();
      })
      
      
    }

    getCurrentQuestion(){
        var self = this;
        fetch('/fetchQuestions',{
          method:"GET",
          header:{
            "Content-Type":"application/json"
          }
        })
        .then(response => response.json())
        .then(data => {
            self.setState({questionResults:data.results});
            self.setState({currQuestionNumber:0});
            self.createAnswerArray();
        });
        
        

    }

    shuffle(array) {
      var currentIndex = array.length,
        temporaryValue,
        randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }

    createAnswerArray() {
      if (this.state.questionResults !== "") {
        var currAnswersArray = [
          entities.decode(this.state.questionResults[0].correct_answer),
          entities.decode(this.state.questionResults[0].incorrect_answers[0]),
          entities.decode(this.state.questionResults[0].incorrect_answers[1]),
          entities.decode(this.state.questionResults[0].incorrect_answers[2]),
        ];
        this.shuffle(currAnswersArray);
        this.setState({
          currAnswers: currAnswersArray
        });
        this.setState({
          currQuestionParsed: entities.decode(
            this.state.questionResults[0].question
          ),
        }); //Question parsen
        var corrAnswer = entities.decode(
          this.state.questionResults[0].correct_answer
        );
        this.setState({
          currCorrectAnswer: corrAnswer
        });
        this.countdownBar();
      }
    }

    checkAnswer(e) {
      e.preventDefault();
      
      for (var i = 0; i < document.getElementsByClassName("answer").length; i++) {
        document.getElementsByClassName("answer")[i].setAttribute("disabled", "");
        document.getElementsByClassName("answer")[i].classList.remove("zoom");
      }
      var target = e.target;
      target.children[0].checked=true;
      if(this.state.siteState!=='answerChecking'){
        setTimeout(() => {
          let clickedAnswer = target.innerText;
          if (clickedAnswer === this.state.currCorrectAnswer) {
           // target.classList.remove("btn-primary");
            target.classList.add("btn-success");
            target.classList.add("blink_me");
            this.setState({score:this.state.score +1});
          } else {
            //target.classList.remove("btn-primary");
            target.classList.add("btn-danger");
            for (var i = 0; i < document.getElementsByClassName("answer").length; i++) {
              if(document.getElementsByClassName("answer")[i].innerText === this.state.currCorrectAnswer){
                document.getElementsByClassName("answer")[i].classList.add('btn-success');
                document.getElementsByClassName("answer")[i].classList.add('blink_me');
              }
            }
            
          }
          
        }, ((this.state.time / 100) * this.state.currentProgress*1000)+1250);
      }

    }

    nextQuestion() {
      console.log("nextQuestion called");
      this.setState({siteState:''});
      for (var i = 0; i < document.getElementsByClassName("answer").length; i++) {
        document.getElementsByClassName("answer")[i].removeAttribute("disabled");
        document.getElementsByClassName("answer")[i].classList.add("zoom");
        document
          .getElementsByClassName("answer")[i].classList.remove("btn-danger");
          document
          .getElementsByClassName("answer")[i].classList.remove("blink_me");
        document
          .getElementsByClassName("answer")[i].classList.remove("btn-success");
        //document.getElementsByClassName("answer")[i].classList.add("btn-primary");
      }
      for (i = 0; i < document.getElementsByClassName("answer").length; i++){
        if(document.getElementsByClassName("answer")[i].children[0].checked === true){
          document.getElementsByClassName("answer")[i].children[0].checked=false;
        }
      }
      var val = this.state.currQuestionNumber + 1;
      if (val < this.state.questionResults.length) {
        this.setState({
          currQuestionNumber: val
        });
        this.setState({
          currQuestionParsed: entities.decode(
            this.state.questionResults[val].question
          ),
        }); //Question parsen

        var currAnswersArray = [
          entities.decode(this.state.questionResults[val].correct_answer),
          entities.decode(this.state.questionResults[val].incorrect_answers[0]),
          entities.decode(this.state.questionResults[val].incorrect_answers[1]),
          entities.decode(this.state.questionResults[val].incorrect_answers[2]),
        ];
        this.setState({
          currAnswers: currAnswersArray
        });
        var corrAnswer = entities.decode(
          this.state.questionResults[val].correct_answer
        );
        this.setState({
          currCorrectAnswer: corrAnswer
        });
        this.countdownBar();
      } else {
        document.getElementById("questionDiv").remove();
        document.getElementById("questionCounterDiv").remove();
        this.setState({
          siteState: "roundFinished"
        });
      }
    }

  renderQuestion() {
    if (this.state.questionResults !== "") {
      return (
        <div id="questionContainer">
          <Col>
            <p id="question">{this.state.currQuestionParsed}</p>
            <ProgressBar id="countdownBar" now={this.state.currentProgress} />
          </Col>
        </div>
      );
    }
  }

  renderFinishScreen() {
    if (this.state.siteState === "roundFinished") {
      return (
        <div>
          <Row>
            <Col>
      <h2>Thanks for playing you answered {this.state.score} answers right</h2>
            </Col>
          </Row>
        </div>
      );
    }
  }

  renderAnswers() {
    if (this.state.questionResults !== "") {
      return (
        <div>
          <Row>
            <Col>
              <button className="answer zoom" onClick={(e) => this.checkAnswer(e)}>
                {this.state.currAnswers[0]}<input className="answerCheckbox" type="checkbox" id="1" name="2"></input>
              </button>
            </Col>
            <Col>
              <button className="answer zoom" onClick={this.checkAnswer}>
                {this.state.currAnswers[1]}<input className="answerCheckbox" type="checkbox"></input>
              </button>
            </Col>
          </Row>
          <Row>
            <Col>
              <button className="answer zoom" onClick={this.checkAnswer}>
                {this.state.currAnswers[2]}<input className="answerCheckbox" type="checkbox"></input>
              </button>
            </Col>
            <Col>
              <button className="answer zoom" onClick={this.checkAnswer}>
                {this.state.currAnswers[3]}<input className="answerCheckbox" type="checkbox"></input>
              </button>
            </Col>
          </Row>
        </div>
      );
    }
  }

  renderQuestionCounter(){
    if (this.state.questionResults !== ""){
      return(
        <div id="questionCounterDiv">
          <Row>
            <Col><h2>Question {this.state.currQuestionNumber+1}<span id="totalAmountQuestions"> / {this.state.questionResults.length}</span></h2></Col>
          </Row>
        </div>
      );
    }
    
  }

  renderRedirect(){
    if(this.state.redirect===true){
        return(
            <Redirect to="/signin" />
        );
    }
}

  render() {
    return (
      <div>
        {this.renderRedirect()}
        <Container>
          <Row>
            <Col>
              <h1 className="headerName">QuizRoy welcome {this.state.currUser}</h1>
            </Col>
          </Row>
          <Row>
              <Col>
                <Button variant="primary" onClick={this.getCurrentQuestion}>
                  Start
                </Button>
              </Col>
              <Col>
                <Button variant="primary" onClick={this.logout}>
                  Logout
                </Button>
              </Col>
            </Row>
        </Container>
        <Container className="d-flex align-items-center contentContainer">
          <div id="quizDiv">
          {this.renderQuestionCounter()}
            <div id="questionDiv">
              <Row>{this.renderQuestion()}</Row>
              {this.renderAnswers()}
            </div>
            {this.renderFinishScreen()}
          </div>
        </Container>
      </div>
    );
  }
}

export { StartPage };
